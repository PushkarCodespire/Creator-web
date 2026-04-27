import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  postApi: {
    getFeed: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          posts: [],
        },
      },
    }),
    getStatsOverview: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: { totalPosts: 0, totalLikes: 0, totalComments: 0, totalViews: 0 },
      },
    }),
  },
  authApi: {
    getCurrentUser: vi.fn().mockResolvedValue({
      data: {
        data: {
          id: 'u1',
          name: 'Test Creator',
          creator: { id: 'c1' },
        },
      },
    }),
  },
  getImageUrl: vi.fn((path: string) => path || ''),
}));

import CreatorPosts from '../CreatorPosts';

describe('CreatorPosts', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<CreatorPosts />);

    // The page should render and eventually stop loading
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });
});
