import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { RecommendedCreators } from '../RecommendedCreators';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  recommendationApi: {
    getForYou: vi.fn(),
    getCreatorRecommendations: vi.fn(),
  },
  followApi: {
    followCreator: vi.fn(),
    unfollowCreator: vi.fn(),
  },
  getImageUrl: (url: string) => url,
}));

import { recommendationApi } from '../../../services/api';

const mockRecommendations = [
  {
    id: 'rec-1',
    displayName: 'Rec Creator',
    category: 'Music',
    bio: 'Makes great music',
    profileImage: '/avatar.jpg',
    isVerified: true,
    followersCount: 1000,
    postsCount: 50,
    _reasons: ['Similar interests', 'Popular in your area'],
  },
];

describe('RecommendedCreators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeletons initially', () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<RecommendedCreators />);
    // Card title should be present
    expect(screen.getByText('Creators You Might Like')).toBeInTheDocument();
  });

  it('renders recommended creators after loading', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: mockRecommendations } },
    });

    renderWithProviders(<RecommendedCreators />);

    await waitFor(() => {
      expect(screen.getByText('Rec Creator')).toBeInTheDocument();
    });
    expect(screen.getByText('Music')).toBeInTheDocument();
  });

  it('shows empty state when no recommendations', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: [] } },
    });

    renderWithProviders(<RecommendedCreators />);

    await waitFor(() => {
      expect(screen.getByText('No recommendations available')).toBeInTheDocument();
    });
  });

  it('renders with custom title', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: mockRecommendations } },
    });

    renderWithProviders(<RecommendedCreators title="Top Picks" />);

    await waitFor(() => {
      expect(screen.getByText('Top Picks')).toBeInTheDocument();
    });
  });

  it('renders creator bio when available', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: mockRecommendations } },
    });

    renderWithProviders(<RecommendedCreators />);

    await waitFor(() => {
      expect(screen.getByText('Makes great music')).toBeInTheDocument();
    });
  });

  it('renders follower count', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: mockRecommendations } },
    });

    renderWithProviders(<RecommendedCreators />);

    await waitFor(() => {
      expect(screen.getByText(/1000/)).toBeInTheDocument();
    });
  });

  it('renders post count', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: mockRecommendations } },
    });

    renderWithProviders(<RecommendedCreators />);

    await waitFor(() => {
      expect(screen.getByText(/50/)).toBeInTheDocument();
    });
  });

  it('renders recommendation reasons when showReasons is true (default)', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: mockRecommendations } },
    });

    renderWithProviders(<RecommendedCreators />);

    await waitFor(() => {
      expect(screen.getByText('Why recommended:')).toBeInTheDocument();
    });
    expect(screen.getByText('Similar interests')).toBeInTheDocument();
  });

  it('does not render recommendation reasons when showReasons is false', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: mockRecommendations } },
    });

    renderWithProviders(<RecommendedCreators showReasons={false} />);

    await waitFor(() => {
      expect(screen.getByText('Rec Creator')).toBeInTheDocument();
    });
    expect(screen.queryByText('Why recommended:')).not.toBeInTheDocument();
  });

  it('renders Follow button for each creator', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: mockRecommendations } },
    });

    renderWithProviders(<RecommendedCreators />);

    await waitFor(() => {
      expect(screen.getByText('Follow')).toBeInTheDocument();
    });
  });

  it('renders View Profile button for each creator', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: mockRecommendations } },
    });

    renderWithProviders(<RecommendedCreators />);

    await waitFor(() => {
      expect(screen.getByText('View Profile')).toBeInTheDocument();
    });
  });

  it('renders the verified checkmark when creator.isVerified is true', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: mockRecommendations } },
    });

    const { container } = renderWithProviders(<RecommendedCreators />);

    await waitFor(() => {
      expect(screen.getByText('Rec Creator')).toBeInTheDocument();
    });
    // The verified badge renders a "✓" character
    expect(container.textContent).toContain('✓');
  });

  it('renders the default title "Creators You Might Like" when no title prop is given', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: [] } },
    });

    renderWithProviders(<RecommendedCreators />);

    await waitFor(() => {
      expect(screen.getByText('Creators You Might Like')).toBeInTheDocument();
    });
  });

  it('renders creator profile image with correct alt text', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: mockRecommendations } },
    });

    renderWithProviders(<RecommendedCreators />);

    await waitFor(() => {
      const img = document.querySelector('img[alt="Rec Creator"]') as HTMLImageElement;
      expect(img).toBeTruthy();
      expect(img.src).toContain('/avatar.jpg');
    });
  });

  it('calls getCreatorRecommendations (not getForYou) when user is authenticated', async () => {
    const { recommendationApi: recApi } = await import('../../../services/api');
    (recApi.getCreatorRecommendations as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: [] } },
    });

    renderWithProviders(<RecommendedCreators />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u1', name: 'Me', email: 'me@test.com', role: 'USER' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isLoading: false,
          error: null,
        },
      },
    });

    await waitFor(() => {
      expect(recApi.getCreatorRecommendations).toHaveBeenCalled();
    });
    expect(recApi.getForYou).not.toHaveBeenCalled();
  });

  it('renders the second recommendation reason when _reasons has two entries', async () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { recommendations: mockRecommendations } },
    });

    renderWithProviders(<RecommendedCreators />);

    await waitFor(() => {
      expect(screen.getByText('Popular in your area')).toBeInTheDocument();
    });
  });

  it('renders a skeleton card while loading', () => {
    (recommendationApi.getForYou as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    const { container } = renderWithProviders(<RecommendedCreators />);

    expect(container.querySelector('.ant-skeleton')).toBeTruthy();
  });
});
