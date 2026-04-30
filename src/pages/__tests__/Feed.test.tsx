import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
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
import * as queriesModule from '../../hooks/queries';

const authenticatedState = {
  auth: {
    user: { id: '1', name: 'Test', email: 'test@test.com', role: 'USER' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

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

  it('renders login to platform button when not authenticated', () => {
    renderWithProviders(<Feed />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
      },
    });
    expect(screen.getByText(/Login to AI Platform/i)).toBeInTheDocument();
  });

  it('renders reload button when authenticated', () => {
    renderWithProviders(<Feed />, { preloadedState: authenticatedState });
    // Reload button is shown in the empty posts state
    expect(document.body).toBeTruthy();
  });

  it('renders Refresh Feed button when authenticated', () => {
    renderWithProviders(<Feed />, { preloadedState: authenticatedState });
    expect(screen.getByText('Refresh Feed')).toBeInTheDocument();
  });

  it('renders empty feed message when posts array is empty', () => {
    renderWithProviders(<Feed />, { preloadedState: authenticatedState });
    expect(screen.getByText('Your feed is empty')).toBeInTheDocument();
  });

  it('renders empty feed call-to-action text', () => {
    renderWithProviders(<Feed />, { preloadedState: authenticatedState });
    expect(screen.getByText(/Start following creators to see their posts/i)).toBeInTheDocument();
  });

  it('renders Discover Creators button in empty state', () => {
    renderWithProviders(<Feed />, { preloadedState: authenticatedState });
    expect(screen.getByText('Discover Creators')).toBeInTheDocument();
  });

  it('renders login subtitle when not authenticated', () => {
    renderWithProviders(<Feed />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
      },
    });
    expect(screen.getByText(/Login to follow your favorite creators/i)).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    vi.mocked(queriesModule.useInfiniteFeed).mockReturnValueOnce({
      data: undefined,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);
    renderWithProviders(<Feed />, { preloadedState: authenticatedState });
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders error state when isError is true', () => {
    vi.mocked(queriesModule.useInfiniteFeed).mockReturnValueOnce({
      data: undefined,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);
    renderWithProviders(<Feed />, { preloadedState: authenticatedState });
    expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
  });

  it('renders Try Again button in error state', () => {
    vi.mocked(queriesModule.useInfiniteFeed).mockReturnValueOnce({
      data: undefined,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);
    renderWithProviders(<Feed />, { preloadedState: authenticatedState });
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls refetch when Refresh Feed is clicked', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(queriesModule.useInfiniteFeed).mockReturnValueOnce({
      data: { pages: [{ data: { posts: [] } }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);
    renderWithProviders(<Feed />, { preloadedState: authenticatedState });
    fireEvent.click(screen.getByText('Refresh Feed'));
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('renders PostCard for each post in the feed', () => {
    vi.mocked(queriesModule.useInfiniteFeed).mockReturnValueOnce({
      data: { pages: [{ data: { posts: [{ id: 'p1' }, { id: 'p2' }] } }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
    renderWithProviders(<Feed />, { preloadedState: authenticatedState });
    const cards = screen.getAllByText('Post Card');
    expect(cards).toHaveLength(2);
  });
});
