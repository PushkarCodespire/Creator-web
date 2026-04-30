// ===========================================
// POST QUERY & MUTATION HOOKS
// ===========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../config/queryClient';
import api from '../../services/api';
import { message } from 'antd';

// Get posts by creator
export const useCreatorPosts = (creatorId: string, page: number = 1) => {
  return useQuery({
    queryKey: queryKeys.posts.byCreator(creatorId, page),
    queryFn: async () => {
      const response = await api.get(`/api/posts`, {
        params: { creatorId, page, limit: 10 },
      });
      return response.data;
    },
    enabled: !!creatorId,
  });
};

// Get single post by ID
export const usePost = (postId: string) => {
  return useQuery({
    queryKey: queryKeys.posts.byId(postId),
    queryFn: async () => {
      const response = await api.get(`/api/posts/${postId}`);
      return response.data;
    },
    enabled: !!postId,
  });
};

// Get post comments
export const usePostComments = (postId: string, page: number = 1) => {
  return useQuery({
    queryKey: queryKeys.posts.comments(postId, page),
    queryFn: async () => {
      const response = await api.get(`/api/posts/${postId}/comments`, {
        params: { page, limit: 20 },
      });
      return response.data;
    },
    enabled: !!postId,
  });
};

// Like post mutation
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.post(`/api/posts/${postId}/like`);
      return response.data;
    },
    onMutate: async (postId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.byId(postId) });

      const previousPost = queryClient.getQueryData(queryKeys.posts.byId(postId));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(queryKeys.posts.byId(postId), (old: any) => ({
        ...old,
        data: {
          ...old?.data,
          isLiked: true,
          likesCount: (old?.data?.likesCount || 0) + 1,
        },
      }));

      return { previousPost };
    },
    onError: (_err, postId, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.posts.byId(postId), context?.previousPost);
      message.error('Failed to like post');
    },
    onSettled: (data, error, postId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.byId(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
  });
};

// Unlike post mutation
export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.delete(`/api/posts/${postId}/like`);
      return response.data;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.byId(postId) });

      const previousPost = queryClient.getQueryData(queryKeys.posts.byId(postId));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(queryKeys.posts.byId(postId), (old: any) => ({
        ...old,
        data: {
          ...old?.data,
          isLiked: false,
          likesCount: Math.max((old?.data?.likesCount || 1) - 1, 0),
        },
      }));

      return { previousPost };
    },
    onError: (_err, postId, context) => {
      queryClient.setQueryData(queryKeys.posts.byId(postId), context?.previousPost);
      message.error('Failed to unlike post');
    },
    onSettled: (data, error, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.byId(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
  });
};

// Add comment mutation
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
      parentId,
    }: {
      postId: string;
      content: string;
      parentId?: string;
    }) => {
      const response = await api.post(`/api/posts/${postId}/comments`, {
        content,
        parentId,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.comments(variables.postId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.byId(variables.postId),
      });
      message.success('Comment added successfully');
    },
    onError: () => {
      message.error('Failed to add comment');
    },
  });
};

// Delete comment mutation
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      const response = await api.delete(`/api/comments/${commentId}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.comments(variables.postId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posts.byId(variables.postId),
      });
      message.success('Comment deleted successfully');
    },
    onError: () => {
      message.error('Failed to delete comment');
    },
  });
};

// Create post mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: FormData) => {
      const response = await api.post('/api/posts', postData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      message.success('Post created successfully');
    },
    onError: () => {
      message.error('Failed to create post');
    },
  });
};

// Delete post mutation
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await api.delete(`/api/posts/${postId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      message.success('Post deleted successfully');
    },
    onError: () => {
      message.error('Failed to delete post');
    },
  });
};
