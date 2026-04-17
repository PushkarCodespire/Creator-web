import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  contentApi: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: {
          contents: [
            { id: '1', title: 'My YouTube Video', type: 'YOUTUBE_VIDEO', status: 'COMPLETED', _count: { chunks: 5 }, createdAt: '2026-01-01T00:00:00Z' },
            { id: '2', title: 'My FAQ', type: 'FAQ', status: 'COMPLETED', _count: { chunks: 2 }, createdAt: '2026-01-02T00:00:00Z' },
          ],
          pagination: { total: 2, page: 1, limit: 20 },
        },
      },
    }),
    previewYouTube: vi.fn().mockResolvedValue({ data: { data: { title: 'Preview Title' } } }),
    addYouTube: vi.fn().mockResolvedValue({ data: { data: { id: '3' } } }),
    addManual: vi.fn().mockResolvedValue({ data: { data: { id: '4' } } }),
    addFAQ: vi.fn().mockResolvedValue({ data: { data: { id: '5' } } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
    retrain: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  getImageUrl: vi.fn((path: string) => path || ''),
}));

vi.mock('../../../utils/socket', () => ({
  connectSocket: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
  getSocket: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import CreatorContent from '../CreatorContent';

describe('CreatorContent', () => {
  it('renders the content page after data loads', async () => {
    renderWithProviders(<CreatorContent />, {
      preloadedState: {
        auth: { user: { name: 'Creator', creator: { id: 'c1' } } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('My YouTube Video')).toBeInTheDocument();
    });
  });

  it('displays content items from the API', async () => {
    renderWithProviders(<CreatorContent />, {
      preloadedState: {
        auth: { user: { name: 'Creator', creator: { id: 'c1' } } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('My YouTube Video')).toBeInTheDocument();
    });
    expect(screen.getByText('My FAQ')).toBeInTheDocument();
  });
});
