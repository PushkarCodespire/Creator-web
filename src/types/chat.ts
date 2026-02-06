// ===========================================
// Chat-specific TypeScript Types
// ===========================================

export interface RateLimitStatus {
    subscription: {
        plan: 'FREE' | 'PREMIUM';
        status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
    };
    limits: {
        daily: {
            limit: number;
            used: number;
            remaining: number;
            resetAt: string;
        };
        perCreator: Array<{
            creatorId: string;
            creatorName: string;
            used: number;
            remaining: number;
        }>;
    };
}

export interface SendMessageResponse {
    message: {
        id: string;
        conversationId: string;
        role: 'USER' | 'ASSISTANT';
        content: string;
        createdAt: string;
    };
    status: 'processing' | 'complete';
    estimatedTime?: number;
    remainingMessages: number;
}

export interface ChatError {
    code: string;
    message: string;
    details?: {
        limit?: number;
        resetAt?: string;
        upgradeUrl?: string;
        suspendedUntil?: string;
        reason?: string;
        category?: string;
    };
}

export interface ConversationMessage {
    id: string;
    conversationId: string;
    role: 'USER' | 'ASSISTANT';
    content: string;
    createdAt: string;
    tokensUsed?: number;
    model?: string;
    processingTime?: number;
}

export interface ConversationMessagesResponse {
    messages: ConversationMessage[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}

export interface CreateConversationResponse {
    conversation: {
        id: string;
        userId: string;
        creatorId: string;
        isActive: boolean;
        createdAt: string;
        creator: {
            id: string;
            displayName: string;
            profileImage: string;
            category: string;
            aiTone: string;
            welcomeMessage: string;
        };
    };
}
