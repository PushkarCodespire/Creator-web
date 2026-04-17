import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock api
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
  postApi: {
    getFeed: vi.fn(),
  },
}));

import { postApi } from '../../services/api';
import { useFeed } from './useFeed';

describe('useFeed hooks', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
  });

  describe('useFeed', () => {
    it('does not fetch when not authenticated (no token)', () => {
      // No token in localStorage
      const { result } = renderHook(() => useFeed(), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches feed when authenticated', async () => {
      localStorage.setItem('token', 'jwt-token');
      const mockData = { data: { posts: [], hasMore: false } };
      vi.mocked(postApi.getFeed).mockResolvedValueOnce({ data: mockData, status: 200, statusText: 'OK', headers: {}, config: {} } as any);

      const { result } = renderHook(() => useFeed(1, 10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(postApi.getFeed).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('handles errors without retrying', async () => {
      localStorage.setItem('token', 'jwt-token');
      vi.mocked(postApi.getFeed).mockRejectedValueOnce(new Error('401'));

      const { result } = renderHook(() => useFeed(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      // retry: false, so only 1 call
      expect(postApi.getFeed).toHaveBeenCalledTimes(1);
    });
  });
});
