// ===========================================
// SEARCH QUERY HOOKS
// ===========================================

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../config/queryClient';
import api from '../../services/api';

// Global search
export const useSearch = (query: string, type?: string, page: number = 1) => {
  return useQuery({
    queryKey: queryKeys.search.global(query, type),
    queryFn: async () => {
      const response = await api.get('/api/search', {
        params: { q: query, type, page, limit: 20 },
      });
      return response.data;
    },
    enabled: query.trim().length >= 2, // Only search if query has at least 2 characters
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Search autocomplete
export const useSearchAutocomplete = (query: string, limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.search.autocomplete(query),
    queryFn: async () => {
      const response = await api.get('/api/search/autocomplete', {
        params: { q: query, limit },
      });
      return response.data;
    },
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 10, // 10 minutes - autocomplete can be cached longer
  });
};
