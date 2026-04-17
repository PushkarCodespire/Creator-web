// ===========================================
// Socket.io Service for AI Chat Streaming
// Based on AI_CHAT_API_REFERENCE.md
// ===========================================

import { io, Socket } from 'socket.io-client';
import { logger } from '../utils/logger';

// Types for Socket.io events
export interface StreamMessageData {
    conversationId: string;
    messageId: string;
    delta: string;
    accumulated: string;
    timestamp: string;
}

export interface CompleteMessageData {
    message: {
        id: string;
        role: 'ASSISTANT' | 'USER';
        content: string;
        createdAt: string;
        [key: string]: unknown;
    };
}

export interface MessageErrorData {
    messageId: string;
    error: { message?: string; userMessage?: string; code?: string };
    code: string;
}

class SocketService {
    private socket: Socket | null = null;
    private currentConversationId: string | null = null;
    private authenticatedUserId: string | null = null;

    /**
     * Initialize Socket.io connection with JWT authentication.
     * Idempotent: re-binds auth when called with a different user.
     */
    connect(token?: string | null): Socket {
        if (this.socket?.connected) {
            // If the logged-in user changed since we last authenticated this
            // socket, re-emit authenticate so the server's userSockets map
            // points to the current user's socket id (otherwise emitToUser
            // for the new user fails to find a target).
            const currentUserId = this.getStoredUserId();
            if (currentUserId && currentUserId !== this.authenticatedUserId) {
                this.socket.emit('authenticate', { userId: currentUserId });
                this.authenticatedUserId = currentUserId;
                logger.debug('Socket re-authenticated as', currentUserId);
            }
            return this.socket;
        }

        let serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // Ensure we connect to the root namespace if URL includes /api
        if (serverUrl.endsWith('/api')) {
            serverUrl = serverUrl.replace(/\/api$/, '');
        }

        this.socket = io(serverUrl, {
            auth: token ? { token } : {},
            transports: ['websocket'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Connection event handlers
        this.socket.on('connect', () => {
            const resolvedUserId = this.getStoredUserId();
            if (resolvedUserId) {
                this.socket?.emit('authenticate', { userId: resolvedUserId });
                this.authenticatedUserId = resolvedUserId;
            }
            logger.info('Socket.io connected');
            // Re-join conversation room if we were in one
            if (this.currentConversationId) {
                // Directly emit join_chat on the socket to avoid the "connected" check in joinConversation
                this.socket?.emit('join_chat', {
                    conversationId: this.currentConversationId,
                    userId: localStorage.getItem('userId'), // Optional, extracted from token usually but safety first
                    guestId: localStorage.getItem('guestId')
                });
            }
        });

        this.socket.on('disconnect', (reason) => {
            logger.warn('Socket.io disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            logger.error('Socket.io connection error:', error.message);
        });

        return this.socket;
    }

    /**
     * Join a conversation room to receive real-time updates
     */
    joinConversation(conversationId: string, userId?: string, guestId?: string): void {
        this.currentConversationId = conversationId;

        if (!this.socket?.connected) {
            logger.debug(`Socket not connected yet. Will join room ${conversationId} once connected.`);
            return;
        }

        this.socket.emit('join_chat', { conversationId, userId, guestId });
        logger.debug(`Joined conversation room: ${conversationId}`);
    }

    /**
     * Leave the current conversation room
     */
    leaveConversation(conversationId: string): void {
        if (!this.socket?.connected) return;

        this.socket.emit('conversation:leave', { conversationId });
        this.currentConversationId = null;

        logger.debug(`Left conversation room: ${conversationId}`);
    }

    /**
     * Listen for streaming message chunks
     */
    onMessageStream(callback: (data: StreamMessageData) => void): void {
        this.socket?.on('message_stream', callback);
    }

    /**
     * Listen for message completion
     */
    onMessageComplete(callback: (data: CompleteMessageData) => void): void {
        this.socket?.on('message_completed', callback);
    }

    /**
     * Listen for message errors
     */
    onMessageError(callback: (data: MessageErrorData) => void): void {
        this.socket?.on('message_error', callback);
    }

    /**
     * Listen for new messages (non-streaming)
     */
    onNewMessage(callback: (message: Record<string, unknown>) => void): void {
        this.socket?.on('message:new', callback);
    }

    /**
     * Listen for conversation joined confirmation
     */
    onConversationJoined(callback: (data: { conversationId: string }) => void): void {
        this.socket?.on('conversation:joined', callback);
    }

    /**
     * Remove all event listeners
     */
    removeAllListeners(): void {
        this.socket?.off('message_stream');
        this.socket?.off('message_completed');
        this.socket?.off('message_error');
        this.socket?.off('message:new');
        this.socket?.off('conversation:joined');
    }

    /**
     * Disconnect the socket
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.currentConversationId = null;
            this.authenticatedUserId = null;
            logger.info('Socket.io disconnected');
        }
    }

    /**
     * Get the socket instance (for advanced usage)
     */
    getSocket(): Socket | null {
        return this.socket;
    }

    /**
     * Check if socket is connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
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

// Export singleton instance
export const socketService = new SocketService();

export default socketService;
