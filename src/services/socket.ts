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
    conversationId: string;
    message: {
        id: string;
        role: 'ASSISTANT' | 'USER';
        content: string;
        createdAt: string;
        tokensUsed?: number;
        model?: string;
        processingTime?: number;
    };
}

export interface MessageErrorData {
    conversationId: string;
    messageId: string;
    error: {
        code: string;
        message: string;
        userMessage: string;
        canRetry: boolean;
    };
}

class SocketService {
    private socket: Socket | null = null;
    private currentConversationId: string | null = null;

    /**
     * Initialize Socket.io connection with JWT authentication
     */
    connect(token: string): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        let serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // Ensure we connect to the root namespace if URL includes /api
        if (serverUrl.endsWith('/api')) {
            serverUrl = serverUrl.replace(/\/api$/, '');
        }

        this.socket = io(serverUrl, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Connection event handlers
        this.socket.on('connect', () => {
            console.log('✅ Socket.io connected');
            // Re-join conversation room if we were in one
            if (this.currentConversationId) {
                this.joinConversation(this.currentConversationId);
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
    joinConversation(conversationId: string): void {
        if (!this.socket?.connected) {
            console.warn('Cannot join conversation: Socket not connected');
            return;
        }

        this.currentConversationId = conversationId;
        this.socket.emit('conversation:join', { conversationId });

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
        this.socket?.on('message:stream', callback);
    }

    /**
     * Listen for message completion
     */
    onMessageComplete(callback: (data: CompleteMessageData) => void): void {
        this.socket?.on('message:complete', callback);
    }

    /**
     * Listen for message errors
     */
    onMessageError(callback: (data: MessageErrorData) => void): void {
        this.socket?.on('message:error', callback);
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
        this.socket?.off('message:stream');
        this.socket?.off('message:complete');
        this.socket?.off('message:error');
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
}

// Export singleton instance
export const socketService = new SocketService();

export default socketService;
