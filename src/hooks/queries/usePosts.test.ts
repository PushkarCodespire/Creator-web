import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock api
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock antd message
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import api from '../../services/api';
import { useCreatorPosts, usePost, usePostComments, useLikePost, useUnlikePost, useAddComment, useDeleteComment, useCreatePost, useDeletePost } from './usePosts';

describe('usePosts hooks', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
  });

  describe('useCreatorPosts', () => {
    it('fetches posts by creator ID', async () => {
      const mockData = { data: [{ id: 'p1', title: 'Post 1' }] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useCreatorPosts('creator-1', 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/posts', {
        params: { creatorId: 'creator-1', page: 1, limit: 10 },
      });
    });

    it('does not fetch when creatorId is empty', () => {
      const { result } = renderHook(() => useCreatorPosts(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('usePost', () => {
    it('fetches a single post by ID', async () => {
      const mockData = { data: { id: 'p1', content: 'Hello' } };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => usePost('p1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/posts/p1');
    });

    it('does not fetch when postId is empty', () => {
      const { result } = renderHook(() => usePost(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('usePostComments', () => {
    it('fetches comments for a post', async () => {
      const mockData = { data: [{ id: 'c1', content: 'Nice!' }] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => usePostComments('p1', 2), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/posts/p1/comments', {
        params: { page: 2, limit: 20 },
      });
    });

    it('does not fetch when postId is empty', () => {
      const { result } = renderHook(() => usePostComments(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useLikePost', () => {
    it('calls post like endpoint when mutated', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } });

      const { result } = renderHook(() => useLikePost(), { wrapper: createWrapper() });
      result.current.mutate('p1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.post).toHaveBeenCalledWith('/api/posts/p1/like');
    });
  });

  describe('useUnlikePost', () => {
    it('calls delete like endpoint when mutated', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: { success: true } });

      const { result } = renderHook(() => useUnlikePost(), { wrapper: createWrapper() });
      result.current.mutate('p1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.delete).toHaveBeenCalledWith('/api/posts/p1/like');
    });
  });

  describe('useAddComment', () => {
    it('calls post comments endpoint when mutated', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'c1' } });

      const { result } = renderHook(() => useAddComment(), { wrapper: createWrapper() });
      result.current.mutate({ postId: 'p1', content: 'Great post!' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.post).toHaveBeenCalledWith('/api/posts/p1/comments', { content: 'Great post!', parentId: undefined });
    });
  });

  describe('useDeleteComment', () => {
    it('calls delete comment endpoint when mutated', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: { success: true } });

      const { result } = renderHook(() => useDeleteComment(), { wrapper: createWrapper() });
      result.current.mutate({ commentId: 'c1', postId: 'p1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.delete).toHaveBeenCalledWith('/api/comments/c1');
    });
  });

  describe('useCreatePost', () => {
    it('calls create post endpoint when mutated', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'new-post' } });

      const fd = new FormData();
      fd.append('content', 'Hello world');

      const { result } = renderHook(() => useCreatePost(), { wrapper: createWrapper() });
      result.current.mutate(fd);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.post).toHaveBeenCalledWith('/api/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    });
  });

  describe('useDeletePost', () => {
    it('calls delete post endpoint when mutated', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ data: { success: true } });

      const { result } = renderHook(() => useDeletePost(), { wrapper: createWrapper() });
      result.current.mutate('p1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.delete).toHaveBeenCalledWith('/api/posts/p1');
    });
  });
});
