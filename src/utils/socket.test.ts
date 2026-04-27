import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock socket.io-client before importing the module under test
const mockOn = vi.fn();
const mockEmit = vi.fn();
const mockDisconnect = vi.fn();
const mockSocket = {
  connected: false,
  id: 'test-socket-id',
  on: mockOn,
  emit: mockEmit,
  disconnect: mockDisconnect,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

// We need to import fresh module each test to reset singleton state
// But since it's a singleton, we'll import once and test carefully
import socketManager, {
  connectSocket,
  getSocket,
  disconnectSocket,
  isSocketConnected,
  updateSocketToken,
} from './socket';

describe('socket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the internal socket by disconnecting
    disconnectSocket();
    mockSocket.connected = false;
    localStorage.clear();
  });

  describe('connectSocket', () => {
    it('creates a socket connection and returns a socket', () => {
      const socket = connectSocket('test-token');
      expect(socket).toBeDefined();
    });

    it('sets up event listeners on connection', () => {
      connectSocket('test-token');
      // The setupListeners method registers 4 events: connect, disconnect, connect_error, reconnect
      expect(mockOn).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('connect_error', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('reconnect', expect.any(Function));
    });

    it('returns existing socket if already connected', () => {
      const socket1 = connectSocket('token1');
      mockSocket.connected = true;
      const socket2 = connectSocket('token2');
      expect(socket1).toBe(socket2);
    });
  });

  describe('getSocket', () => {
    it('returns null before connection', () => {
      expect(getSocket()).toBeNull();
    });

    it('returns socket after connection', () => {
      connectSocket('test-token');
      expect(getSocket()).toBeDefined();
    });
  });

  describe('disconnectSocket', () => {
    it('disconnects an active socket', () => {
      connectSocket('test-token');
      disconnectSocket();
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('sets socket to null after disconnect', () => {
      connectSocket('test-token');
      disconnectSocket();
      expect(getSocket()).toBeNull();
    });

    it('is safe to call when no socket exists', () => {
      expect(() => disconnectSocket()).not.toThrow();
    });
  });

  describe('isSocketConnected', () => {
    it('returns false when no socket', () => {
      expect(isSocketConnected()).toBe(false);
    });

    it('returns false when socket exists but not connected', () => {
      connectSocket('token');
      mockSocket.connected = false;
      expect(isSocketConnected()).toBe(false);
    });

    it('returns true when socket is connected', () => {
      connectSocket('token');
      mockSocket.connected = true;
      expect(isSocketConnected()).toBe(true);
    });
  });

  describe('updateSocketToken', () => {
    it('disconnects and reconnects when socket is connected', () => {
      connectSocket('old-token');
      mockSocket.connected = true;

      updateSocketToken('new-token');

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('connect event handler', () => {
    it('emits authenticate with userId on connect', () => {
      connectSocket('token', 'user-123');

      // Find the 'connect' handler
      const connectHandler = mockOn.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      expect(connectHandler).toBeDefined();

      // Simulate connect event
      mockSocket.connected = true;
      connectHandler();

      expect(mockEmit).toHaveBeenCalledWith('authenticate', { userId: 'user-123' });
    });

    it('handles invalid JSON in localStorage gracefully', () => {
      localStorage.setItem('user', 'not-json');

      connectSocket('token');

      const connectHandler = mockOn.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      // Should not throw
      expect(() => connectHandler()).not.toThrow();
    });
  });
});
