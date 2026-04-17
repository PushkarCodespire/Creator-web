import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CreatorReviews from '../CreatorReviews';

vi.mock('../../../services/api', () => ({
  reviewApi: {
    getReviews: vi.fn(),
    getMyReview: vi.fn().mockRejectedValue({ response: { status: 404 } }),
    create: vi.fn(),
    updateMyReview: vi.fn(),
    deleteMyReview: vi.fn(),
  },
  getImageUrl: (url: string) => url,
}));

vi.mock('../../../utils/socket', () => ({
  connectSocket: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
  })),
  getSocket: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
  })),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { reviewApi } from '../../../services/api';

const mockReviews = [
  {
    id: 'r1',
    creatorId: 'c-1',
    userId: 'u-1',
    rating: 5,
    review: 'Amazing creator!',
    createdAt: '2025-01-01T00:00:00.000Z',
    user: { id: 'u-1', name: 'Reviewer One', avatar: null },
  },
  {
    id: 'r2',
    creatorId: 'c-1',
    userId: 'u-2',
    rating: 4,
    review: 'Very good',
    createdAt: '2025-01-02T00:00:00.000Z',
    user: { id: 'u-2', name: 'Reviewer Two', avatar: null },
  },
];

describe('CreatorReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Reviews Summary heading', async () => {
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { reviews: [], stats: null, pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByText('Reviews Summary')).toBeInTheDocument();
    });
  });

  it('shows empty state when no reviews', async () => {
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { reviews: [], stats: null, pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByText('No reviews yet')).toBeInTheDocument();
    });
  });

  it('renders reviews when data available', async () => {
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          reviews: mockReviews,
          stats: { averageRating: 4.5, totalReviews: 2 },
          pagination: { total: 2, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByText('Reviewer One')).toBeInTheDocument();
    });
    expect(screen.getByText('Amazing creator!')).toBeInTheDocument();
    expect(screen.getByText('Very good')).toBeInTheDocument();
  });

  it('shows login prompt for unauthenticated users', async () => {
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { reviews: [], stats: null, pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByText('Log in to leave a review')).toBeInTheDocument();
    });
  });
});
