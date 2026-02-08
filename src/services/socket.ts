// ===========================================
// Socket.io Service for AI Chat Streaming
// Based on AI_CHAT_API_REFERENCE.md
// ===========================================

import { io, Socket } from 'socket.io-client';

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
        [key: string]: any;
    };
}

export interface MessageErrorData {
    messageId: string;
    error: any;
    code: string;
}

class SocketService {
    private socket: Socket | null = null;
    private currentConversationId: string | null = null;

    /**
     * Initialize Socket.io connection with JWT authentication
     */
    connect(token?: string | null): Socket {
        if (this.socket?.connected) {
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
            }
            console.log('✅ Socket.io connected');
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
            console.log('❌ Socket.io disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('⚠️ Socket.io connection error:', error.message);
        });

        return this.socket;
    }

    /**
     * Join a conversation room to receive real-time updates
     */
    joinConversation(conversationId: string, userId?: string, guestId?: string): void {
        this.currentConversationId = conversationId;

        if (!this.socket?.connected) {
            console.log(`⏳ Socket not connected yet. Will join room ${conversationId} once connected.`);
            return;
        }

        this.socket.emit('join_chat', { conversationId, userId, guestId });
        console.log(`📥 Joined conversation room: ${conversationId}`);
    }

    /**
     * Leave the current conversation room
     */
    leaveConversation(conversationId: string): void {
        if (!this.socket?.connected) return;

        this.socket.emit('conversation:leave', { conversationId });
        this.currentConversationId = null;

        console.log(`📤 Left conversation room: ${conversationId}`);
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
    onNewMessage(callback: (message: any) => void): void {
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
            console.log('🔌 Socket.io disconnected');
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
        } catch (error) {
            return null;
        }
    }
}

// Export singleton instance
export const socketService = new SocketService();

export default socketService;
