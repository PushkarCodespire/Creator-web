// ===========================================
// SOCKET.IO CLIENT UTILITY
// Real-time messaging and notifications
// ===========================================

import { io, Socket } from 'socket.io-client';
import { logger } from './logger';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketManager {
  private socket: Socket | null = null;
  private token: string | null = null;
  private userId: string | null = null;

  /**
   * Initialize socket connection with authentication
   */
  connect(token?: string, userId?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token || null;
    if (userId) {
      this.userId = userId;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: this.token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.setupListeners();

    return this.socket;
  }

  /**
   * Get current socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.userId = null;
    this.token = null;
  }

  /**
   * Setup connection event listeners
   */
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      const resolvedUserId = this.userId || this.getStoredUserId();
      if (resolvedUserId) {
        this.socket?.emit('authenticate', { userId: resolvedUserId });
      }
      logger.info('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      logger.warn('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      logger.error('Socket connection error:', error.message);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      logger.info(`Socket reconnected after ${attemptNumber} attempts`);
    });
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Update authentication token
   */
  updateToken(token: string): void {
    this.token = token;
    if (this.socket?.connected) {
      this.disconnect();
      this.connect(token);
    }
  }

  /**
   * Try to read the user id from localStorage (used for socket auth)
   */
  private getStoredUserId(): string | null {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.id || null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (__error) {
      return null;
    }
  }
}

// Singleton instance
const socketManager = new SocketManager();

export default socketManager;

// Export helper functions
export const connectSocket = (token?: string, userId?: string) => socketManager.connect(token, userId);
export const getSocket = () => socketManager.getSocket();
export const disconnectSocket = () => socketManager.disconnect();
export const isSocketConnected = () => socketManager.isConnected();
export const updateSocketToken = (token: string) => socketManager.updateToken(token);
