// ===========================================
// TRENDING QUERY HOOKS
// ===========================================

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../config/queryClient';
import api from '../../services/api';

// Get trending posts
export const useTrendingPosts = (timeframe: string = '24h', limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.trending.posts(timeframe),
    queryFn: async () => {
      const response = await api.get('/api/trending/posts', {
        params: { timeframe, limit },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - trending updates frequently
  });
};

// Get trending creators
export const useTrendingCreators = (timeframe: string = '7d', limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.trending.creators(timeframe),
    queryFn: async () => {
      const response = await api.get('/api/trending/creators', {
        params: { timeframe, limit },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get trending hashtags
export const useTrendingHashtags = (timeframe: string = '24h', limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.trending.hashtags(timeframe),
    queryFn: async () => {
      const response = await api.get('/api/trending/hashtags', {
        params: { timeframe, limit },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
