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
});
