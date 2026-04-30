// ===========================================
// USER QUERY & MUTATION HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../config/queryClient';
import api from '../../services/api';
import { message } from 'antd';

// Get user profile
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.user.profile(userId),
    queryFn: async () => {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get user followers
export const useUserFollowers = (userId: string, page: number = 1) => {
  return useQuery({
    queryKey: queryKeys.user.followers(userId),
    queryFn: async () => {
      const response = await api.get(`/api/users/${userId}/followers`, {
        params: { page, limit: 20 },
      });
      return response.data;
    },
    enabled: !!userId,
  });
};

// Get user following
export const useUserFollowing = (userId: string, page: number = 1) => {
  return useQuery({
    queryKey: queryKeys.user.following(userId),
    queryFn: async () => {
      const response = await api.get(`/api/users/${userId}/following`, {
        params: { page, limit: 20 },
      });
      return response.data;
    },
    enabled: !!userId,
  });
};

// Get user interests
export const useUserInterests = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.user.interests(userId),
    queryFn: async () => {
      const response = await api.get(`/api/users/${userId}/interests`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes - interests don't change often
  });
};

// Update user interests mutation
export const useUpdateInterests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, interests }: { userId: string; interests: string[] }) => {
      const response = await api.post(`/api/users/interests`, { interests });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.interests(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.creators.recommended(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.feed.all,
      });
      message.success('Interests updated successfully');
    },
    onError: () => {
      message.error('Failed to update interests');
    },
  });
};
