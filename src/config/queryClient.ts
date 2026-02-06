// ===========================================
// REACT QUERY CLIENT CONFIGURATION
// ===========================================

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 30, // 30 minutes - garbage collection (formerly cacheTime)

      // Retry configuration
      retry: 2, // Retry failed requests 2 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch configuration
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch when internet reconnects
      refetchOnMount: true, // Refetch on component mount

      // Performance
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      // Retry configuration for mutations
      retry: 1,
      retryDelay: 1000,

      // Network mode
      networkMode: 'online',
    },
  },
});

// Query keys factory for consistent cache key management
export const queryKeys = {
  // Feed
  feed: {
    all: ['feed'] as const,
    personalized: (page: number = 1, limit: number = 20) =>
      ['feed', 'personalized', { page, limit }] as const,
  },

  // Posts
  posts: {
    all: ['posts'] as const,
    byId: (id: string) => ['posts', id] as const,
    byCreator: (creatorId: string, page: number = 1) =>
      ['posts', 'creator', creatorId, { page }] as const,
    likes: (postId: string) => ['posts', postId, 'likes'] as const,
    comments: (postId: string, page: number = 1) =>
      ['posts', postId, 'comments', { page }] as const,
  },

  // Creators
  creators: {
    all: ['creators'] as const,
    list: (page: number = 1, filters?: any) =>
      ['creators', 'list', { page, filters }] as const,
    byId: (id: string) => ['creators', id] as const,
    recommended: (userId?: string) => ['creators', 'recommended', userId] as const,
    similar: (creatorId: string) => ['creators', 'similar', creatorId] as const,
  },

  // Trending
  trending: {
    all: ['trending'] as const,
    posts: (timeframe: string = '24h') => ['trending', 'posts', timeframe] as const,
    creators: (timeframe: string = '7d') => ['trending', 'creators', timeframe] as const,
    hashtags: (timeframe: string = '24h') => ['trending', 'hashtags', timeframe] as const,
  },

  // Search
  search: {
    all: ['search'] as const,
    global: (query: string, type?: string) => ['search', 'global', { query, type }] as const,
    autocomplete: (query: string) => ['search', 'autocomplete', query] as const,
  },

  // User
  user: {
    all: ['user'] as const,
    profile: (userId: string) => ['user', 'profile', userId] as const,
    followers: (userId: string) => ['user', userId, 'followers'] as const,
    following: (userId: string) => ['user', userId, 'following'] as const,
    interests: (userId: string) => ['user', userId, 'interests'] as const,
  },

  // Chat
  chat: {
    all: ['chat'] as const,
    conversations: (userId: string) => ['chat', 'conversations', userId] as const,
    messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
    bookmarks: (userId: string) => ['chat', 'bookmarks', userId] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (userId: string, unreadOnly: boolean = false) =>
      ['notifications', userId, { unreadOnly }] as const,
    count: (userId: string) => ['notifications', userId, 'count'] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    creator: (creatorId: string, timeframe: string = '7d') =>
      ['analytics', 'creator', creatorId, timeframe] as const,
  },
};
