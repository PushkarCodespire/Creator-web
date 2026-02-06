// ===========================================
// CREATOR QUERY & MUTATION HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../config/queryClient';
import api from '../../services/api';
import { message } from 'antd';

// Get creators list with filters
export const useCreators = (page: number = 1, filters?: any) => {
  return useQuery({
    queryKey: queryKeys.creators.list(page, filters),
    queryFn: async () => {
      const response = await api.get('/api/creators', {
        params: { page, limit: 12, ...filters },
      });
      return response.data;
    },
  });
};

// Get single creator by ID
export const useCreator = (creatorId: string) => {
  return useQuery({
    queryKey: queryKeys.creators.byId(creatorId),
    queryFn: async () => {
      const response = await api.get(`/api/creators/${creatorId}`);
      return response.data;
    },
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 10, // 10 minutes - creator profiles don't change often
  });
};

// Get recommended creators
export const useRecommendedCreators = (userId?: string, limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.creators.recommended(userId),
    queryFn: async () => {
      const response = await api.get('/api/recommendations/creators', {
        params: { limit },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes - recommendations can be cached longer
  });
};

// Get similar creators
export const useSimilarCreators = (creatorId: string, limit: number = 6) => {
  return useQuery({
    queryKey: queryKeys.creators.similar(creatorId),
    queryFn: async () => {
      const response = await api.get(`/api/recommendations/creators/similar/${creatorId}`, {
        params: { limit },
      });
      return response.data;
    },
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 20, // 20 minutes
  });
};

// Follow creator mutation
export const useFollowCreator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creatorId: string) => {
      const response = await api.post(`/api/follow/${creatorId}`);
      return response.data;
    },
    onMutate: async (creatorId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.creators.byId(creatorId) });

      const previousCreator = queryClient.getQueryData(queryKeys.creators.byId(creatorId));

      queryClient.setQueryData(queryKeys.creators.byId(creatorId), (old: any) => ({
        ...old,
        data: {
          ...old?.data,
          isFollowing: true,
          followersCount: (old?.data?.followersCount || 0) + 1,
        },
      }));

      return { previousCreator };
    },
    onError: (err, creatorId, context: any) => {
      queryClient.setQueryData(queryKeys.creators.byId(creatorId), context.previousCreator);
      message.error('Failed to follow creator');
    },
    onSettled: (data, error, creatorId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.byId(creatorId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
  });
};

// Unfollow creator mutation
export const useUnfollowCreator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creatorId: string) => {
      const response = await api.delete(`/api/follow/${creatorId}`);
      return response.data;
    },
    onMutate: async (creatorId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.creators.byId(creatorId) });

      const previousCreator = queryClient.getQueryData(queryKeys.creators.byId(creatorId));

      queryClient.setQueryData(queryKeys.creators.byId(creatorId), (old: any) => ({
        ...old,
        data: {
          ...old?.data,
          isFollowing: false,
          followersCount: Math.max((old?.data?.followersCount || 1) - 1, 0),
        },
      }));

      return { previousCreator };
    },
    onError: (err, creatorId, context: any) => {
      queryClient.setQueryData(queryKeys.creators.byId(creatorId), context.previousCreator);
      message.error('Failed to unfollow creator');
    },
    onSettled: (data, error, creatorId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.byId(creatorId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
  });
};
