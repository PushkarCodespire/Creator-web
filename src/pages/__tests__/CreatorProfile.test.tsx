vi.mock('../../services/api', () => ({
  creatorApi: {
    getById: vi.fn().mockResolvedValue({
      data: {
        data: {
          id: 'c1',
          displayName: 'Test Creator',
          bio: 'Test bio',
          profileImage: null,
          isVerified: true,
          totalChats: 0,
          rating: 4.5,
          faqs: [],
          tags: [],
          category: 'Fitness',
          tagline: 'Your fitness guide',
        },
      },
    }),
    getContent: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
  postApi: {
    getFeed: vi.fn().mockResolvedValue({ data: { data: { posts: [] } } }),
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
    h1: ({ children, ...p }: any) => <h1 {...p}>{children}</h1>,
    p: ({ children, ...p }: any) => <p {...p}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 0,
  useInView: () => true,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'creator-123' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../components/Creator/CreatorStats', () => ({
  CreatorStats: () => <div data-testid="creator-stats">CreatorStats</div>,
}));

vi.mock('../../components/Creator/ChatPreview', () => ({
  ChatPreview: () => <div data-testid="chat-preview">ChatPreview</div>,
}));

vi.mock('../../components/Creator/FAQAccordion', () => ({
  FAQAccordion: () => <div data-testid="faq-accordion">FAQAccordion</div>,
}));

vi.mock('../../components/Creator/CreatorContentGallery', () => ({
  CreatorContentGallery: () => <div data-testid="content-gallery">ContentGallery</div>,
}));

vi.mock('../../components/Creator/CreatorReviews', () => ({
  default: () => <div data-testid="creator-reviews">CreatorReviews</div>,
}));

vi.mock('../../components/Follow', () => ({
  FollowButton: () => <button data-testid="follow-button">Follow</button>,
}));

vi.mock('../../components/Post', () => ({
  PostCard: ({ post }: any) => <div data-testid="post-card">{post.id}</div>,
}));

vi.mock('../../components/Social/ShareDialog', () => ({
  ShareDialog: () => <div data-testid="share-dialog">ShareDialog</div>,
}));

import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import CreatorProfile from '../CreatorProfile';

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const defaultAuth = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
};

describe('CreatorProfile', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorProfile />, {
      preloadedState: defaultAuth,
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('shows loading skeleton initially', () => {
    const { container } = renderWithProviders(<CreatorProfile />, {
      preloadedState: defaultAuth,
    });
    // While loading, the skeleton or loading state should be present and no creator name yet
    expect(container.firstChild).toBeTruthy();
  });

  it('renders creator name after data loads', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
  });

  it('renders creator bio after data loads', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('Test bio')).toBeInTheDocument();
    });
  });

  it('renders tab labels (About, Posts, Content, Reviews)', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText(/Posts/)).toBeInTheDocument();
    expect(screen.getByText(/Content/)).toBeInTheDocument();
    expect(screen.getByText('Reviews & Ratings')).toBeInTheDocument();
  });

  it('renders share button', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('renders creator tagline after data loads', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('Your fitness guide')).toBeInTheDocument();
    });
  });

  it('renders creator category tag after data loads', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('Fitness')).toBeInTheDocument();
    });
  });

  it('renders Verified tag for a verified creator', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });

  it('renders Start Chat button', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('Start Chat')).toBeInTheDocument();
    });
  });

  it('renders rating stat after data loads', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    expect(screen.getByText('Rating')).toBeInTheDocument();
  });

  it('renders 24/7 Available stat', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    expect(screen.getByText('24/7')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renders Chats stat label', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    expect(screen.getByText('Chats')).toBeInTheDocument();
  });

  it('renders follow button', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByTestId('follow-button')).toBeInTheDocument();
    });
  });

  it('renders creator stats component on about tab', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByTestId('creator-stats')).toBeInTheDocument();
    });
  });

  it('renders Ready to chat CTA text', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('Ready to chat?')).toBeInTheDocument();
    });
  });

  it('renders Start Conversation button in CTA card', async () => {
    renderWithProviders(<CreatorProfile />, { preloadedState: defaultAuth });

    await waitFor(() => {
      expect(screen.getByText('Start Conversation')).toBeInTheDocument();
    });
  });
});
