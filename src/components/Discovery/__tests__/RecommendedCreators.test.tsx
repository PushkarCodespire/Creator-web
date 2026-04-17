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
});
