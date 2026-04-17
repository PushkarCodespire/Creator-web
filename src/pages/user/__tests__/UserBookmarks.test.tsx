import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  bookmarkApi: {
    getBookmarks: vi.fn().mockResolvedValue({
      data: {
        data: {
          bookmarks: [
            {
              id: 'b1',
              message: {
                id: 'm1',
                content: 'Great fitness tip!',
                role: 'ASSISTANT',
                createdAt: '2026-04-10T00:00:00Z',
                conversation: {
                  id: 'conv1',
                  creator: { id: 'c1', displayName: 'Fitness Pro', profileImage: null },
                },
              },
              createdAt: '2026-04-10T00:00:00Z',
            },
          ],
        },
      },
    }),
    getRecommendations: vi.fn().mockResolvedValue({
      data: {
        data: {
          recommendations: [],
        },
      },
    }),
    deleteBookmark: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  getImageUrl: vi.fn((path: string) => path || ''),
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import UserBookmarks from '../UserBookmarks';

describe('UserBookmarks', () => {
  it('renders bookmarks after data loads', async () => {
    renderWithProviders(<UserBookmarks />);

    await waitFor(() => {
      expect(screen.getByText(/great fitness tip/i)).toBeInTheDocument();
    });
  });
});
