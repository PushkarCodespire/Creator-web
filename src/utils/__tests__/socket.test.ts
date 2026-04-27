vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  })),
}));

vi.mock('../logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { connectSocket, getSocket, disconnectSocket, isSocketConnected } from '../socket';

describe('socket utilities', () => {
  beforeEach(() => {
    // Disconnect any lingering socket between tests
    disconnectSocket();
  });

  it('getSocket returns null initially', () => {
    disconnectSocket(); // ensure clean state
    expect(getSocket()).toBeNull();
  });

  it('isSocketConnected returns false initially', () => {
    disconnectSocket();
    expect(isSocketConnected()).toBe(false);
  });

  it('connectSocket returns a socket-like object', () => {
    const socket = connectSocket('test-token', 'user-1');
    expect(socket).not.toBeNull();
    expect(typeof socket.on).toBe('function');
  });

  it('getSocket returns socket after connecting', () => {
    connectSocket('test-token', 'user-1');
    // After connect, getSocket should return the socket
    const s = getSocket();
    expect(s).not.toBeNull();
  });

  it('disconnectSocket clears the socket', () => {
    connectSocket('test-token');
    disconnectSocket();
    expect(getSocket()).toBeNull();
  });
});
