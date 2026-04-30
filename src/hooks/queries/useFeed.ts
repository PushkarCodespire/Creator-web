// ===========================================
// FEED QUERY HOOKS
// ===========================================

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '../../config/queryClient';
import { postApi } from '../../services/api';

// Check if user is authenticated
const isAuthenticated = () => !!localStorage.getItem('token');

// Get personalized feed with pagination
export const useFeed = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: queryKeys.feed.personalized(page, limit),
    queryFn: async () => {
      const response = await postApi.getFeed({ page, limit });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - feed updates frequently
    enabled: isAuthenticated(), // Only fetch if authenticated
    retry: false, // Don't retry on 401
  });
};

// Infinite scroll feed
export const useInfiniteFeed = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: queryKeys.feed.all,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await postApi.getFeed({ page: pageParam as number, limit });
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return lastPage.data?.hasMore ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: isAuthenticated(), // Only fetch if authenticated
    retry: false, // Don't retry on 401
  });
};
