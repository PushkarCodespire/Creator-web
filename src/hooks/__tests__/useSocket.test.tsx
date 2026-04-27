vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
  })),
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import { useSocket } from '../useSocket';

function makeStore(token: string | null) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: token ? { id: '1', name: 'Test', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' } : null,
        token,
        isAuthenticated: !!token,
        isLoading: false,
        error: null,
      },
    },
  });
}

describe('useSocket', () => {
  it('returns null when no token', () => {
    const store = makeStore(null);
    const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
    const { result } = renderHook(() => useSocket(), { wrapper });
    expect(result.current).toBeNull();
  });

  it('does not throw with token', () => {
    const store = makeStore('test-token');
    const wrapper = ({ children }: any) => <Provider store={store}>{children}</Provider>;
    expect(() => renderHook(() => useSocket(), { wrapper })).not.toThrow();
  });
});
