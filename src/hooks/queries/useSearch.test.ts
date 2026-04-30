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
import { useSearch, useSearchAutocomplete } from './useSearch';

describe('useSearch hooks', () => {
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

  describe('useSearch', () => {
    it('does not search when query is shorter than 2 chars', () => {
      const { result } = renderHook(() => useSearch('a'), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('does not search when query is empty', () => {
      const { result } = renderHook(() => useSearch(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('does not search when query is only whitespace', () => {
      const { result } = renderHook(() => useSearch('  '), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('searches when query has at least 2 characters', async () => {
      const mockData = { data: [{ id: '1', title: 'Result' }] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useSearch('test query'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/search', {
        params: { q: 'test query', type: undefined, page: 1, limit: 20 },
      });
    });

    it('passes type filter', async () => {
      const mockData = { data: [] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useSearch('react', 'creators', 2), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/search', {
        params: { q: 'react', type: 'creators', page: 2, limit: 20 },
      });
    });
  });

  describe('useSearchAutocomplete', () => {
    it('does not fetch when query is shorter than 2 chars', () => {
      const { result } = renderHook(() => useSearchAutocomplete('x'), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('fetches autocomplete results for valid query', async () => {
      const mockData = { data: ['suggestion1', 'suggestion2'] };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useSearchAutocomplete('te', 5), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.get).toHaveBeenCalledWith('/api/search/autocomplete', {
        params: { q: 'te', limit: 5 },
      });
    });
  });
});
