import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock api
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
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
import { useUserProfile, useUserFollowers, useUserFollowing, useUserInterests, useUpdateInterests } from './useUser';

describe('useUser hooks', () => {
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

  describe('useUserProfile', () => {
    it('fetches user profile by ID', async () => {
      const mockData = { data: { id: 'u1', name: 'Test User' } };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useUserProfile('u1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/users/u1');
      expect(result.current.data).toEqual(mockData);
    });

    it('does not fetch when userId is empty', () => {
      const { result } = renderHook(() => useUserProfile(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useUserFollowers', () => {
    it('fetches user followers', async () => {
      const mockData = { data: [{ id: 'f1' }] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useUserFollowers('u1', 2), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/users/u1/followers', {
        params: { page: 2, limit: 20 },
      });
    });

    it('does not fetch when userId is empty', () => {
      const { result } = renderHook(() => useUserFollowers(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useUserFollowing', () => {
    it('fetches user following list', async () => {
      const mockData = { data: [{ id: 'f2' }] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useUserFollowing('u1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/users/u1/following', {
        params: { page: 1, limit: 20 },
      });
    });

    it('does not fetch when userId is empty', () => {
      const { result } = renderHook(() => useUserFollowing(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useUserInterests', () => {
    it('fetches user interests', async () => {
      const mockData = { data: ['tech', 'music'] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useUserInterests('u1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/users/u1/interests');
    });

    it('does not fetch when userId is empty', () => {
      const { result } = renderHook(() => useUserInterests(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useUpdateInterests', () => {
    it('calls update interests endpoint when mutated', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } });

      const { result } = renderHook(() => useUpdateInterests(), { wrapper: createWrapper() });
      result.current.mutate({ userId: 'u1', interests: ['fitness', 'tech'] });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.post).toHaveBeenCalledWith('/api/users/interests', { interests: ['fitness', 'tech'] });
    });
  });
});
