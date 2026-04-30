import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock api
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '../../services/api';
import { useTrendingPosts, useTrendingCreators, useTrendingHashtags } from './useTrending';

describe('useTrending hooks', () => {
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

  describe('useTrendingPosts', () => {
    it('fetches trending posts with defaults', async () => {
      const mockData = { data: [{ id: 't1' }] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useTrendingPosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/trending/posts', {
        params: { timeframe: '24h', limit: 20 },
      });
    });

    it('fetches trending posts with custom timeframe and limit', async () => {
      const mockData = { data: [] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useTrendingPosts('7d', 5), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/trending/posts', {
        params: { timeframe: '7d', limit: 5 },
      });
    });
  });

  describe('useTrendingCreators', () => {
    it('fetches trending creators with defaults', async () => {
      const mockData = { data: [] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useTrendingCreators(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/trending/creators', {
        params: { timeframe: '7d', limit: 10 },
      });
    });

    it('fetches trending creators with custom params', async () => {
      const mockData = { data: [] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useTrendingCreators('30d', 3), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/trending/creators', {
        params: { timeframe: '30d', limit: 3 },
      });
    });
  });

  describe('useTrendingHashtags', () => {
    it('fetches trending hashtags with defaults', async () => {
      const mockData = { data: ['#react', '#vitest'] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useTrendingHashtags(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/trending/hashtags', {
        params: { timeframe: '24h', limit: 20 },
      });
    });

    it('handles API errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Server error'));

      const { result } = renderHook(() => useTrendingHashtags(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
