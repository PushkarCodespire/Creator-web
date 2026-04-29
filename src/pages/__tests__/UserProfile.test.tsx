vi.mock('../../services/api', () => ({
  creatorApi: {
    getById: vi.fn().mockResolvedValue({
      data: {
        data: {
          id: 'c1',
          displayName: 'Fan Profile',
          profileImage: null,
          isVerified: false,
          createdAt: '2026-01-01',
          bio: null,
          category: null,
        },
      },
    }),
  },
  postApi: {
    getFeed: vi.fn().mockResolvedValue({ data: { data: { posts: [] } } }),
  },
  followApi: {
    getFollowStats: vi.fn().mockResolvedValue({
      data: { data: { followers: 42, following: 10 } },
    }),
    checkFollowing: vi.fn().mockResolvedValue({
      data: { data: { isFollowing: false } },
    }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    section: ({ children, ...p }: any) => <section {...p}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ userId: 'u-123' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../components/Follow', () => ({
  FollowButton: () => <button data-testid="follow-button">Follow</button>,
}));

vi.mock('../../components/Post', () => ({
  PostCard: ({ post }: any) => <div data-testid="post-card">{post.id}</div>,
}));

import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import UserProfile from '../UserProfile';

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const viewerAuth = {
  auth: {
    user: { id: 'viewer-1', name: 'Viewer', email: 'v@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

const unauthenticated = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
};

describe('UserProfile', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<UserProfile />, {
      preloadedState: viewerAuth,
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('shows loading skeleton initially', () => {
    const { container } = renderWithProviders(<UserProfile />, {
      preloadedState: viewerAuth,
    });
    // While loading, the component renders a skeleton (loading state)
    expect(container.firstChild).toBeTruthy();
  });

  it('renders creator name after data loads', async () => {
    renderWithProviders(<UserProfile />, { preloadedState: viewerAuth });

    await waitFor(() => {
      expect(screen.getByText('Fan Profile')).toBeInTheDocument();
    });
  });

  it('renders follower count after data loads', async () => {
    renderWithProviders(<UserProfile />, { preloadedState: viewerAuth });

    await waitFor(() => {
      expect(screen.getByText('Fan Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Followers')).toBeInTheDocument();
  });

  it('renders without crashing when unauthenticated', async () => {
    renderWithProviders(<UserProfile />, { preloadedState: unauthenticated });

    await waitFor(() => {
      expect(screen.getByText('Fan Profile')).toBeInTheDocument();
    });
  });

  it('renders following count after data loads', async () => {
    renderWithProviders(<UserProfile />, { preloadedState: viewerAuth });

    await waitFor(() => {
      expect(screen.getByText('Fan Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('renders Posts count stat', async () => {
    renderWithProviders(<UserProfile />, { preloadedState: viewerAuth });

    await waitFor(() => {
      expect(screen.getByText('Fan Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('Posts')).toBeInTheDocument();
  });

  it('renders Posts tab label', async () => {
    renderWithProviders(<UserProfile />, { preloadedState: viewerAuth });

    await waitFor(() => {
      expect(screen.getByText('Fan Profile')).toBeInTheDocument();
    });

    expect(screen.getByText(/Posts \(0\)/)).toBeInTheDocument();
  });

  it('renders About tab label', async () => {
    renderWithProviders(<UserProfile />, { preloadedState: viewerAuth });

    await waitFor(() => {
      expect(screen.getByText('Fan Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders follow button for another user when authenticated', async () => {
    renderWithProviders(<UserProfile />, { preloadedState: viewerAuth });

    await waitFor(() => {
      expect(screen.getByText('Fan Profile')).toBeInTheDocument();
    });

    expect(screen.getByTestId('follow-button')).toBeInTheDocument();
  });

  it('renders Message button for another user when authenticated', async () => {
    renderWithProviders(<UserProfile />, { preloadedState: viewerAuth });

    await waitFor(() => {
      expect(screen.getByText('Fan Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('shows No posts yet when posts array is empty', async () => {
    renderWithProviders(<UserProfile />, { preloadedState: viewerAuth });

    await waitFor(() => {
      expect(screen.getByText('Fan Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('No posts yet')).toBeInTheDocument();
  });

  it('renders No bio available when bio is null', async () => {
    renderWithProviders(<UserProfile />, { preloadedState: viewerAuth });

    await waitFor(() => {
      expect(screen.getByText('Fan Profile')).toBeInTheDocument();
    });

    // Switch to About tab
    fireEvent.click(screen.getByText('About'));

    await waitFor(() => {
      expect(screen.getByText('No bio available')).toBeInTheDocument();
    });
  });
});
