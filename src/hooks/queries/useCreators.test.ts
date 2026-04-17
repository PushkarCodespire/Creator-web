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
import { useCreators, useCreator, useRecommendedCreators, useSimilarCreators } from './useCreators';

describe('useCreators hooks', () => {
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

  describe('useCreators', () => {
    it('fetches creators list with default page', async () => {
      const mockData = { data: [{ id: '1', name: 'Creator 1' }] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useCreators(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/creators', {
        params: { page: 1, limit: 12 },
      });
      expect(result.current.data).toEqual(mockData);
    });

    it('fetches creators list with filters', async () => {
      const filters = { category: 'tech' };
      const mockData = { data: [] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useCreators(2, filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/creators', {
        params: { page: 2, limit: 12, category: 'tech' },
      });
    });

    it('handles API errors', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useCreators(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useCreator', () => {
    it('fetches a single creator by ID', async () => {
      const mockData = { data: { id: 'c1', name: 'Test Creator' } };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useCreator('c1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/creators/c1');
      expect(result.current.data).toEqual(mockData);
    });

    it('does not fetch when creatorId is empty', () => {
      const { result } = renderHook(() => useCreator(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useRecommendedCreators', () => {
    it('fetches recommended creators', async () => {
      const mockData = { data: [{ id: 'r1' }] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useRecommendedCreators('user1', 5), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/recommendations/creators', {
        params: { limit: 5 },
      });
    });
  });

  describe('useSimilarCreators', () => {
    it('fetches similar creators', async () => {
      const mockData = { data: [{ id: 's1' }] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useSimilarCreators('c1', 3), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/recommendations/creators/similar/c1', {
        params: { limit: 3 },
      });
    });

    it('does not fetch when creatorId is empty', () => {
      const { result } = renderHook(() => useSimilarCreators(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });
});
