import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../../hooks/queries', () => ({
  useInfiniteFeed: vi.fn(() => ({
    data: { pages: [{ data: { posts: [] } }] },
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
}));

vi.mock('../../components/Post', () => ({
  PostCard: () => <div>Post Card</div>,
}));

vi.mock('../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

import Feed from '../Feed';

describe('Feed', () => {
  it('renders login prompt when not authenticated', () => {
    renderWithProviders(<Feed />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText('Join the Conversation')).toBeInTheDocument();
  });

  it('renders feed title when authenticated', () => {
    renderWithProviders(<Feed />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'test@test.com', role: 'USER' },
          token: 'tok',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText('Explore Feed')).toBeInTheDocument();
  });

  it('renders feed subtitle', () => {
    renderWithProviders(<Feed />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'test@test.com', role: 'USER' },
          token: 'tok',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText(/Discover what creators are sharing/i)).toBeInTheDocument();
  });
});
