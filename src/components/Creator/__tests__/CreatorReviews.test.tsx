import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CreatorReviews from '../CreatorReviews';

vi.mock('../../../services/api', () => ({
  reviewApi: {
    getReviews: vi.fn(),
    getMyReview: vi.fn().mockRejectedValue({ response: { status: 404 } }),
    create: vi.fn().mockResolvedValue({ data: {} }),
    update: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
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

  it('shows review form with Submit Review button for authenticated users', async () => {
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { reviews: [], stats: null, pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" creatorName="Test Creator" />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u-99', name: 'Auth User', email: 'u@test.com', role: 'USER' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isLoading: false,
          error: null,
        } as any,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Submit Review')).toBeInTheDocument();
    });
  });

  it('shows all star ratings in the breakdown section', async () => {
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
      expect(screen.getByText('5★')).toBeInTheDocument();
    });
    expect(screen.getByText('4★')).toBeInTheDocument();
    expect(screen.getByText('3★')).toBeInTheDocument();
  });

  it('displays the average rating when stats are present', async () => {
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
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });
  });

  it('displays "You" label for the current user\'s own review', async () => {
    const reviewsWithMine = [
      {
        id: 'r3',
        creatorId: 'c-1',
        userId: 'u-99',
        rating: 5,
        review: 'My own review',
        createdAt: '2025-01-03T00:00:00.000Z',
        user: { id: 'u-99', name: 'Auth User', avatar: null },
      },
    ];

    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          reviews: reviewsWithMine,
          stats: { averageRating: 5, totalReviews: 1 },
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u-99', name: 'Auth User', email: 'u@test.com', role: 'USER' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isLoading: false,
          error: null,
        } as any,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('You')).toBeInTheDocument();
    });
  });

  it('shows sort select with Newest option selected by default', async () => {
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { reviews: [], stats: null, pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByText('Newest')).toBeInTheDocument();
    });
  });

  it('shows Leave a Review heading when user has no review', async () => {
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { reviews: [], stats: null, pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u-99', name: 'Auth User', email: 'u@test.com', role: 'USER' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isLoading: false,
          error: null,
        } as any,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Leave a Review')).toBeInTheDocument();
    });
  });

  it('shows 0.0 average rating when no reviews and no stats', async () => {
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { reviews: [], stats: null, pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByText('0.0')).toBeInTheDocument();
    });
  });

  it('shows 0 reviews count text when no reviews', async () => {
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { reviews: [], stats: null, pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByText('0 reviews')).toBeInTheDocument();
    });
  });

  it('renders All Reviews section heading', async () => {
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { reviews: [], stats: null, pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByText('All Reviews')).toBeInTheDocument();
    });
  });

  it('shows "No written feedback." when a review has empty review text', async () => {
    const reviewWithNoText = [
      {
        id: 'r10',
        creatorId: 'c-1',
        userId: 'u-10',
        rating: 3,
        review: '',
        createdAt: '2025-02-01T00:00:00.000Z',
        user: { id: 'u-10', name: 'Silent User', avatar: null },
      },
    ];
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          reviews: reviewWithNoText,
          stats: { averageRating: 3, totalReviews: 1 },
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByText('No written feedback.')).toBeInTheDocument();
    });
  });

  it('shows "1 review" (singular) when totalReviews is 1', async () => {
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          reviews: [mockReviews[0]],
          stats: { averageRating: 5, totalReviews: 1 },
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<CreatorReviews creatorId="c-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByText('1 review')).toBeInTheDocument();
    });
  });

  it('renders both 1★ and 2★ breakdown labels', async () => {
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
      expect(screen.getByText('1★')).toBeInTheDocument();
    });
    expect(screen.getByText('2★')).toBeInTheDocument();
  });
});
