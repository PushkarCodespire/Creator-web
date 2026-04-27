import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Track event handlers registered by the mock socket
const mockOn = vi.fn();
const mockDisconnect = vi.fn();
const mockSocketInstance = {
  on: mockOn,
  disconnect: mockDisconnect,
  connected: false,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocketInstance),
}));

// We need to reset the module-level `socket` variable between tests.
// The useSocket hook uses a module-level `let socket` that persists.
// We'll reset modules to get a clean slate.

describe('useSocket', () => {
  const createMockStore = (authState: { token: string | null }) =>
    configureStore({
      reducer: {
        auth: (state = authState) => state,
        chat: (state = {}) => state,
      },
    });

  const createWrapper = (store: ReturnType<typeof createMockStore>) => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store, children });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset modules so the module-level `socket` variable is null again
    vi.resetModules();
  });

  it('does not connect when there is no token', async () => {
    const { useSocket } = await import('./useSocket');
    const store = createMockStore({ token: null });

    const { result } = renderHook(() => useSocket(), {
      wrapper: createWrapper(store),
    });

    expect(result.current).toBeNull();
  });

  it('connects when a token is provided', async () => {
    const { io } = await import('socket.io-client');
    const { useSocket } = await import('./useSocket');
    const store = createMockStore({ token: 'test-jwt-token' });

    renderHook(() => useSocket(), {
      wrapper: createWrapper(store),
    });

    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        auth: { token: 'test-jwt-token' },
        autoConnect: true,
      })
    );
  });

  it('registers connect, disconnect, and connect_error listeners', async () => {
    const { useSocket } = await import('./useSocket');
    const store = createMockStore({ token: 'test-token' });

    renderHook(() => useSocket(), {
      wrapper: createWrapper(store),
    });

    expect(mockOn).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('connect_error', expect.any(Function));
  });

  it('exports getSocket helper', async () => {
    const { getSocket } = await import('./useSocket');
    expect(typeof getSocket).toBe('function');
  });
});
