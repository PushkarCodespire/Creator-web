import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

// Mock heavy child components to keep tests fast and focused
vi.mock('../../../components/Post/PostCard', () => ({
  default: ({ post }: { post: { id: string; content?: string } }) => (
    <div data-testid="post-card">{post.content || post.id}</div>
  ),
}));

vi.mock('../../../components/Post/PostCreator', () => ({
  default: ({ onCancel }: { onCancel: () => void }) => (
    <div data-testid="post-creator">
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// Fix broken mocks: source calls postApi.getFeed, postApi.getStatsOverview, authApi.getCurrentUser
vi.mock('../../../services/api', () => ({
  postApi: {
    getFeed: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          posts: [
            { id: 'p1', content: 'My first post', likes: 5, comments: 2, publishedAt: '2026-01-01T10:00:00Z', media: [] },
          ],
        },
      },
    }),
    getStatsOverview: vi.fn().mockResolvedValue({
      data: {
        data: {
          totals: { followers: 100, posts: 10, comments: 50 },
          topPost: { contentPreview: 'Best post ever', likes: 20, comments: 8, publishedAt: '2026-01-01T10:00:00Z', media: [] },
          recentComments: [
            { id: 'c1', content: 'Great content!', user: { name: 'Fan User', avatar: '' }, createdAt: '2026-01-02T08:00:00Z' },
          ],
        },
      },
    }),
  },
  authApi: {
    getCurrentUser: vi.fn().mockResolvedValue({
      data: {
        data: { id: 'u1', name: 'Test Creator', creator: { id: 'cr1' } },
      },
    }),
  },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: { children: React.ReactNode; [key: string]: unknown }) => <div {...p as React.HTMLAttributes<HTMLDivElement>}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import CreatorPosts from '../CreatorPosts';

const creatorState = {
  auth: {
    user: { id: '1', name: 'Test Creator', email: 'a@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('CreatorPosts', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the Feed Nexus heading after data loads', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Nexus')).toBeInTheDocument();
    });
  });

  it('renders the Initiate Transmission button', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Initiate Transmission')).toBeInTheDocument();
    });
  });

  it('renders the Neural Matrix Metrics sidebar card', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Neural Matrix Metrics')).toBeInTheDocument();
    });
  });

  it('renders the stat totals in the metrics card', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Followers')).toBeInTheDocument();
    });
    expect(screen.getByText('Transmissions')).toBeInTheDocument();
    expect(screen.getByText('Resonations')).toBeInTheDocument();
  });

  it('renders the High Resonance sidebar card', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('High Resonance')).toBeInTheDocument();
    });
  });

  it('renders a post card when posts exist', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByTestId('post-card')).toBeInTheDocument();
    });
    expect(screen.getByText('My first post')).toBeInTheDocument();
  });

  it('renders Community Echoes with recent comment', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Fan User')).toBeInTheDocument();
    });
    expect(screen.getByText('Great content!')).toBeInTheDocument();
  });

  it('opens the create post modal when Initiate Transmission is clicked', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Initiate Transmission')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Initiate Transmission'));

    await waitFor(() => {
      expect(screen.getByTestId('post-creator')).toBeInTheDocument();
    });
  });

  it('renders the Community Echoes sidebar card heading', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Community Echoes')).toBeInTheDocument();
    });
  });

  it('renders the subtitle text below the Feed Nexus heading', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Neural transmissions and community resonations')).toBeInTheDocument();
    });
  });

  it('renders the top post content preview in the High Resonance card', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText(/"Best post ever"/i)).toBeInTheDocument();
    });
  });

  it('closes the create post modal when Cancel is clicked', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Initiate Transmission')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Initiate Transmission'));

    await waitFor(() => {
      expect(screen.getByTestId('post-creator')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('post-creator')).not.toBeInTheDocument();
    });
  });

  it('renders follower count value from mocked stats', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  it('renders the Neural Transmission modal title when opened', async () => {
    renderWithProviders(<CreatorPosts />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Initiate Transmission')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Initiate Transmission'));

    await waitFor(() => {
      expect(screen.getByText('Neural Transmission')).toBeInTheDocument();
    });
  });
});
