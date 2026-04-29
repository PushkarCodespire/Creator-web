import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { SimilarCreators } from '../SimilarCreators';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  recommendationApi: {
    getSimilarCreators: vi.fn(),
  },
  getImageUrl: (url: string) => url,
}));

vi.mock('../../../utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { recommendationApi } from '../../../services/api';

const mockSimilar = [
  {
    id: 'sim-1',
    displayName: 'Similar Creator',
    category: 'Fitness',
    profileImage: '/avatar.jpg',
    isVerified: false,
    followersCount: 500,
    _similarityScore: 85,
  },
];

describe('SimilarCreators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeletons initially', () => {
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<SimilarCreators creatorId="c-1" />);
    expect(screen.getByText('Similar Creators')).toBeInTheDocument();
  });

  it('renders similar creators after loading', async () => {
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: mockSimilar } },
    });

    renderWithProviders(<SimilarCreators creatorId="c-1" currentCreatorName="Main Creator" />);

    await waitFor(() => {
      expect(screen.getByText('Similar Creator')).toBeInTheDocument();
    });
    expect(screen.getByText('Fitness')).toBeInTheDocument();
    expect(screen.getByText('85% match')).toBeInTheDocument();
  });

  it('shows empty state when no similar creators found', async () => {
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: [] } },
    });

    renderWithProviders(<SimilarCreators creatorId="c-1" />);

    await waitFor(() => {
      expect(screen.getByText('No similar creators found')).toBeInTheDocument();
    });
  });

  it('displays creator name in heading', async () => {
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: mockSimilar } },
    });

    renderWithProviders(<SimilarCreators creatorId="c-1" currentCreatorName="Jane Doe" />);

    await waitFor(() => {
      expect(screen.getByText(/Similar to Jane Doe/)).toBeInTheDocument();
    });
  });

  it('falls back to "this creator" in heading when no currentCreatorName', async () => {
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: mockSimilar } },
    });

    renderWithProviders(<SimilarCreators creatorId="c-1" />);

    await waitFor(() => {
      expect(screen.getByText(/Similar to this creator/)).toBeInTheDocument();
    });
  });

  it('renders followers count for a similar creator', async () => {
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: mockSimilar } },
    });

    renderWithProviders(<SimilarCreators creatorId="c-1" />);

    await waitFor(() => {
      expect(screen.getByText(/500 followers/)).toBeInTheDocument();
    });
  });

  it('renders category tag for a similar creator', async () => {
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: mockSimilar } },
    });

    renderWithProviders(<SimilarCreators creatorId="c-1" />);

    await waitFor(() => {
      expect(screen.getByText('Fitness')).toBeInTheDocument();
    });
  });

  it('shows "View all similar creators" button when creators.length >= limit (default 4)', async () => {
    const fourCreators = [
      { id: 's1', displayName: 'Creator A', category: 'Tech', profileImage: '', isVerified: false, followersCount: 100, _similarityScore: 70 },
      { id: 's2', displayName: 'Creator B', category: 'Art', profileImage: '', isVerified: false, followersCount: 200, _similarityScore: 80 },
      { id: 's3', displayName: 'Creator C', category: 'Music', profileImage: '', isVerified: false, followersCount: 300, _similarityScore: 90 },
      { id: 's4', displayName: 'Creator D', category: 'Food', profileImage: '', isVerified: false, followersCount: 400, _similarityScore: 75 },
    ];
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: fourCreators } },
    });

    renderWithProviders(<SimilarCreators creatorId="c-1" />);

    await waitFor(() => {
      expect(screen.getByText(/View all similar creators/)).toBeInTheDocument();
    });
  });

  it('does not show "View all similar creators" when creators fewer than limit', async () => {
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: mockSimilar } },
    });

    renderWithProviders(<SimilarCreators creatorId="c-1" />);

    await waitFor(() => {
      expect(screen.getByText('Similar Creator')).toBeInTheDocument();
    });
    expect(screen.queryByText(/View all similar creators/)).not.toBeInTheDocument();
  });

  it('renders bio in list layout when creator has bio', async () => {
    const creatorWithBio = [
      { id: 'sim-2', displayName: 'Bio Creator', category: 'Tech', profileImage: '', isVerified: false, followersCount: 300, _similarityScore: 70, bio: 'Expert in React' },
    ];
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: creatorWithBio } },
    });

    renderWithProviders(<SimilarCreators creatorId="c-1" layout="list" />);

    await waitFor(() => {
      expect(screen.getByText('Expert in React')).toBeInTheDocument();
    });
  });

  it('does not render bio in grid layout even when bio is present', async () => {
    const creatorWithBio = [
      { id: 'sim-3', displayName: 'Grid Creator', category: 'Tech', profileImage: '', isVerified: false, followersCount: 300, _similarityScore: 70, bio: 'Hidden bio text' },
    ];
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: creatorWithBio } },
    });

    renderWithProviders(<SimilarCreators creatorId="c-1" layout="grid" />);

    await waitFor(() => {
      expect(screen.getByText('Grid Creator')).toBeInTheDocument();
    });
    expect(screen.queryByText('Hidden bio text')).not.toBeInTheDocument();
  });

  it('renders verified checkmark badge when creator is verified', async () => {
    const verifiedCreator = [
      { id: 'sim-v', displayName: 'Verified Creator', category: 'Music', profileImage: '', isVerified: true, followersCount: 1000, _similarityScore: 90 },
    ];
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: verifiedCreator } },
    });

    const { container } = renderWithProviders(<SimilarCreators creatorId="c-1" />);

    await waitFor(() => {
      expect(screen.getByText('Verified Creator')).toBeInTheDocument();
    });
    // The verified badge renders a ✓ character
    expect(container.textContent).toContain('✓');
  });

  it('renders 0 followers when followersCount is missing', async () => {
    const noFollowers = [
      { id: 'sim-nf', displayName: 'No Follow Creator', category: 'Art', profileImage: '', isVerified: false, _similarityScore: 60 },
    ];
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: noFollowers } },
    });

    renderWithProviders(<SimilarCreators creatorId="c-1" />);

    await waitFor(() => {
      expect(screen.getByText(/0 followers/)).toBeInTheDocument();
    });
  });

  it('calls getSimilarCreators with the provided creatorId', async () => {
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { similar: [] } },
    });

    renderWithProviders(<SimilarCreators creatorId="target-creator" />);

    await waitFor(() => {
      expect(recommendationApi.getSimilarCreators).toHaveBeenCalledWith('target-creator', expect.any(Number));
    });
  });

  it('sets creators to empty array when API rejects', async () => {
    (recommendationApi.getSimilarCreators as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('server error'));

    renderWithProviders(<SimilarCreators creatorId="c-err" />);

    await waitFor(() => {
      expect(screen.getByText('No similar creators found')).toBeInTheDocument();
    });
  });
});
