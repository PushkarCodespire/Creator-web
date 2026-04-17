// ---------------------------------------------------------------------------
// Mock socket.io-client BEFORE importing the module under test
// ---------------------------------------------------------------------------

const mockSocket = {
  connected: false,
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// localStorage mock
const localStorageMock = (() => {
  let storage: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => storage[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
    removeItem: vi.fn((key: string) => { delete storage[key]; }),
    clear: vi.fn(() => { storage = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { io } from 'socket.io-client';
import { socketService } from '../socket';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SocketService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Reset socket state
    mockSocket.connected = false;
    // The singleton retains internal state between tests, so disconnect first
    socketService.disconnect();
  });

  describe('connect', () => {
    it('creates a socket.io connection and returns the socket', () => {
      const socket = socketService.connect('my-token');

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: { token: 'my-token' },
          transports: ['websocket'],
        }),
      );
      expect(socket).toBe(mockSocket);
    });

    it('passes empty auth object when no token provided', () => {
      socketService.connect();

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: {},
        }),
      );
    });

    it('registers connect, disconnect, and connect_error event handlers', () => {
      socketService.connect('tok');

      const registeredEvents = mockSocket.on.mock.calls.map(
        (call: unknown[]) => call[0],
      );
      expect(registeredEvents).toContain('connect');
      expect(registeredEvents).toContain('disconnect');
      expect(registeredEvents).toContain('connect_error');
    });

    it('returns existing socket if already connected', () => {
      socketService.connect('tok');
      mockSocket.connected = true;

      const second = socketService.connect('tok');
      // io should only have been called once (the first connect)
      expect(io).toHaveBeenCalledTimes(1);
      expect(second).toBe(mockSocket);
    });

    it('re-authenticates when user changes on an existing connection', () => {
      socketService.connect('tok');
      mockSocket.connected = true;

      // Simulate a stored user
      localStorageMock.setItem('user', JSON.stringify({ id: 'user-new' }));

      socketService.connect('tok');

      expect(mockSocket.emit).toHaveBeenCalledWith('authenticate', {
        userId: 'user-new',
      });
    });
  });

  describe('joinConversation', () => {
    it('emits join_chat when socket is connected', () => {
      socketService.connect('tok');
      mockSocket.connected = true;

      socketService.joinConversation('conv-1', 'user-1', undefined);

      expect(mockSocket.emit).toHaveBeenCalledWith('join_chat', {
        conversationId: 'conv-1',
        userId: 'user-1',
        guestId: undefined,
      });
    });

    it('does not emit when socket is not connected', () => {
      socketService.connect('tok');
      mockSocket.connected = false;

      socketService.joinConversation('conv-1');

      expect(mockSocket.emit).not.toHaveBeenCalledWith(
        'join_chat',
        expect.anything(),
      );
    });
  });

  describe('leaveConversation', () => {
    it('emits conversation:leave when connected', () => {
      socketService.connect('tok');
      mockSocket.connected = true;

      socketService.leaveConversation('conv-1');

      expect(mockSocket.emit).toHaveBeenCalledWith('conversation:leave', {
        conversationId: 'conv-1',
      });
    });

    it('does nothing when not connected', () => {
      socketService.connect('tok');
      mockSocket.connected = false;

      socketService.leaveConversation('conv-1');

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('event listeners', () => {
    beforeEach(() => {
      socketService.connect('tok');
    });

    it('onMessageStream registers listener for message_stream', () => {
      const cb = vi.fn();
      socketService.onMessageStream(cb);
      expect(mockSocket.on).toHaveBeenCalledWith('message_stream', cb);
    });

    it('onMessageComplete registers listener for message_completed', () => {
      const cb = vi.fn();
      socketService.onMessageComplete(cb);
      expect(mockSocket.on).toHaveBeenCalledWith('message_completed', cb);
    });

    it('onMessageError registers listener for message_error', () => {
      const cb = vi.fn();
      socketService.onMessageError(cb);
      expect(mockSocket.on).toHaveBeenCalledWith('message_error', cb);
    });

    it('onNewMessage registers listener for message:new', () => {
      const cb = vi.fn();
      socketService.onNewMessage(cb);
      expect(mockSocket.on).toHaveBeenCalledWith('message:new', cb);
    });

    it('onConversationJoined registers listener for conversation:joined', () => {
      const cb = vi.fn();
      socketService.onConversationJoined(cb);
      expect(mockSocket.on).toHaveBeenCalledWith('conversation:joined', cb);
    });
  });

  describe('removeAllListeners', () => {
    it('removes all known event listeners', () => {
      socketService.connect('tok');
      socketService.removeAllListeners();

      expect(mockSocket.off).toHaveBeenCalledWith('message_stream');
      expect(mockSocket.off).toHaveBeenCalledWith('message_completed');
      expect(mockSocket.off).toHaveBeenCalledWith('message_error');
      expect(mockSocket.off).toHaveBeenCalledWith('message:new');
      expect(mockSocket.off).toHaveBeenCalledWith('conversation:joined');
    });
  });

  describe('disconnect', () => {
    it('disconnects the socket and clears internal state', () => {
      socketService.connect('tok');
      socketService.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(socketService.getSocket()).toBeNull();
      expect(socketService.isConnected()).toBe(false);
    });

    it('is safe to call when no socket exists', () => {
      // disconnect was already called in beforeEach, so socket is null
      expect(() => socketService.disconnect()).not.toThrow();
    });
  });

  describe('isConnected', () => {
    it('returns false when no socket', () => {
      expect(socketService.isConnected()).toBe(false);
    });

    it('returns the socket connected state', () => {
      socketService.connect('tok');
      mockSocket.connected = true;
      expect(socketService.isConnected()).toBe(true);

      mockSocket.connected = false;
      expect(socketService.isConnected()).toBe(false);
    });
  });

  describe('getSocket', () => {
    it('returns null when not connected', () => {
      expect(socketService.getSocket()).toBeNull();
    });

    it('returns the socket instance after connect', () => {
      socketService.connect('tok');
      expect(socketService.getSocket()).toBe(mockSocket);
    });
  });
});
