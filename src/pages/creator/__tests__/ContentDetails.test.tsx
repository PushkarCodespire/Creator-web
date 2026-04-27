import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  contentApi: {
    getById: vi.fn().mockResolvedValue({
      data: {
        data: {
          id: 'c1',
          title: 'My Content',
          type: 'YOUTUBE_VIDEO',
          status: 'COMPLETED',
          sourceUrl: 'https://youtube.com/watch?v=abc',
          chunks: [
            { id: 'ch1', chunkIndex: 0, text: 'Chunk text here', tokenCount: 50, createdAt: '2026-01-01T00:00:00Z' },
          ],
          chunksCount: 1,
          createdAt: '2026-01-01T00:00:00Z',
          processedAt: '2026-01-01T00:01:00Z',
          updatedAt: '2026-01-01T00:01:00Z',
        },
      },
    }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
    retrain: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ contentId: 'c1' }),
  };
});

import ContentDetails from '../ContentDetails';

describe('ContentDetails', () => {
  it('renders the content details page after data loads', async () => {
    renderWithProviders(<ContentDetails />, {
      preloadedState: {
        auth: { user: { name: 'Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('My Content')).toBeInTheDocument();
    });
  });
});
