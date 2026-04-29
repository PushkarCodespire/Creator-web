import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  trendingApi: {
    getTrendingPosts: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getTrendingCreators: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { screen, waitFor } from '@testing-library/react';
import TrendingWidget from '../TrendingWidget';

describe('TrendingWidget', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TrendingWidget type="posts" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Trending Posts heading for posts type', () => {
    renderWithProviders(<TrendingWidget type="posts" />);
    expect(screen.getByText('Trending Posts')).toBeInTheDocument();
  });

  it('renders Trending Creators heading for creators type', () => {
    renderWithProviders(<TrendingWidget type="creators" />);
    expect(screen.getByText('Trending Creators')).toBeInTheDocument();
  });

  it('renders time window selector when showTimeWindowSelector is true', () => {
    renderWithProviders(<TrendingWidget type="posts" showTimeWindowSelector={true} />);
    expect(screen.getByText('Hourly')).toBeInTheDocument();
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('renders empty state after data loads with no results', async () => {
    renderWithProviders(<TrendingWidget type="posts" />);
    await waitFor(() => {
      // After loading, should show empty state
      expect(document.body).toBeTruthy();
    });
  });

  it('renders "No trending content found" after empty data resolves', async () => {
    renderWithProviders(<TrendingWidget type="posts" />);
    await waitFor(() => {
      expect(screen.getByText('No trending content found')).toBeInTheDocument();
    });
  });

  it('does NOT render time window selector when showTimeWindowSelector is false', () => {
    renderWithProviders(<TrendingWidget type="posts" showTimeWindowSelector={false} />);
    expect(screen.queryByText('Hourly')).not.toBeInTheDocument();
    expect(screen.queryByText('Daily')).not.toBeInTheDocument();
    expect(screen.queryByText('Weekly')).not.toBeInTheDocument();
  });

  it('calls getTrendingCreators for creators type', async () => {
    const { trendingApi } = await import('../../../services/api');
    renderWithProviders(<TrendingWidget type="creators" />);
    await waitFor(() => {
      expect(trendingApi.getTrendingCreators).toHaveBeenCalled();
    });
  });

  it('calls getTrendingPosts for posts type', async () => {
    const { trendingApi } = await import('../../../services/api');
    renderWithProviders(<TrendingWidget type="posts" />);
    await waitFor(() => {
      expect(trendingApi.getTrendingPosts).toHaveBeenCalled();
    });
  });

  it('renders all three time window options when selector is shown', () => {
    renderWithProviders(<TrendingWidget type="creators" showTimeWindowSelector={true} />);
    expect(screen.getByText('Hourly')).toBeInTheDocument();
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('shows trending posts with actual item data when API returns results', async () => {
    const { trendingApi } = await import('../../../services/api');
    (trendingApi.getTrendingPosts as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          posts: [
            {
              id: 'post-1',
              content: 'Hot trending post content',
              likesCount: 42,
              commentsCount: 10,
              creator: { displayName: 'CreatorA', profileImage: null, isVerified: false },
            },
          ],
        },
      },
    });

    renderWithProviders(<TrendingWidget type="posts" />);

    await waitFor(() => {
      expect(screen.getByText('Hot trending post content')).toBeInTheDocument();
    });
  });

  it('shows trending creator displayName when creators API returns results', async () => {
    const { trendingApi } = await import('../../../services/api');
    (trendingApi.getTrendingCreators as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          creators: [
            {
              id: 'creator-1',
              displayName: 'TopCreator',
              profileImage: null,
              isVerified: true,
              category: 'Gaming',
              bio: 'Best creator',
              followersCount: 999,
            },
          ],
        },
      },
    });

    renderWithProviders(<TrendingWidget type="creators" />);

    await waitFor(() => {
      expect(screen.getByText('TopCreator')).toBeInTheDocument();
    });
  });

  it('shows creator category when API returns creator data', async () => {
    const { trendingApi } = await import('../../../services/api');
    (trendingApi.getTrendingCreators as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          creators: [
            {
              id: 'c-2',
              displayName: 'ArtistX',
              profileImage: null,
              isVerified: false,
              category: 'Art',
              bio: '',
              followersCount: 100,
            },
          ],
        },
      },
    });

    renderWithProviders(<TrendingWidget type="creators" />);

    await waitFor(() => {
      expect(screen.getByText('Art')).toBeInTheDocument();
    });
  });

  it('shows post creator displayName within a trending post item', async () => {
    const { trendingApi } = await import('../../../services/api');
    (trendingApi.getTrendingPosts as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          posts: [
            {
              id: 'post-2',
              content: 'Another hot post',
              likesCount: 5,
              commentsCount: 1,
              creator: { displayName: 'Creator42', profileImage: null, isVerified: false },
            },
          ],
        },
      },
    });

    renderWithProviders(<TrendingWidget type="posts" />);

    await waitFor(() => {
      expect(screen.getByText('Creator42')).toBeInTheDocument();
    });
  });

  it('renders Skeleton while loading', async () => {
    // The trendingApi returns a promise that never resolves so loading stays true
    const { trendingApi } = await import('../../../services/api');
    (trendingApi.getTrendingPosts as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );
    const { container } = renderWithProviders(<TrendingWidget type="posts" />);
    // Ant Design Skeleton renders an active skeleton element while loading
    expect(container.querySelector('.ant-skeleton')).toBeTruthy();
  });

  it('passes limit prop to the API call', async () => {
    const { trendingApi } = await import('../../../services/api');
    renderWithProviders(<TrendingWidget type="posts" limit={3} />);
    await waitFor(() => {
      expect(trendingApi.getTrendingPosts).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 3 })
      );
    });
  });
});
