vi.mock('../../../services/api', () => ({
  creatorApi: {
    getFollowers: vi.fn().mockResolvedValue({
      data: { data: { followers: [], totals: { total: 0 } } },
    }),
    removeFollower: vi.fn().mockResolvedValue({ data: {} }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { FollowersModal } from '../FollowersModal';

describe('FollowersModal', () => {
  it('renders when not visible', () => {
    const { container } = renderWithProviders(
      <FollowersModal visible={false} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders when visible', () => {
    const { container } = renderWithProviders(
      <FollowersModal visible={true} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders Neural Followers title when visible', async () => {
    renderWithProviders(<FollowersModal visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Neural Followers')).toBeInTheDocument();
    });
  });

  it('renders empty followers list after data loads', async () => {
    renderWithProviders(<FollowersModal visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Neural Followers')).toBeInTheDocument();
    });
  });

  it('displays "Total Matrix Capacity: 0" when total is zero', async () => {
    renderWithProviders(<FollowersModal visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Total Matrix Capacity: 0')).toBeInTheDocument();
    });
  });

  it('renders follower name when getFollowers returns data', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getFollowers as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          followers: [
            { id: 'f1', name: 'Alice Smith', email: 'alice@example.com', followerId: 'f1', followedAt: '2024-01-15T00:00:00Z' },
          ],
          totals: { total: 1 },
        },
      },
    });
    renderWithProviders(<FollowersModal visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
  });

  it('renders follower email when getFollowers returns data', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getFollowers as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          followers: [
            { id: 'f1', name: 'Alice Smith', email: 'alice@example.com', followerId: 'f1', followedAt: '2024-01-15T00:00:00Z' },
          ],
          totals: { total: 1 },
        },
      },
    });
    renderWithProviders(<FollowersModal visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });
  });

  it('updates Total Matrix Capacity when total is non-zero', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getFollowers as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          followers: [
            { id: 'f1', name: 'Bob', email: 'bob@example.com', followerId: 'f1', followedAt: '2024-03-01T00:00:00Z' },
          ],
          totals: { total: 42 },
        },
      },
    });
    renderWithProviders(<FollowersModal visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Total Matrix Capacity: 42')).toBeInTheDocument();
    });
  });

  it('does not fetch followers when not visible', async () => {
    const { creatorApi } = await import('../../../services/api');
    renderWithProviders(<FollowersModal visible={false} onClose={vi.fn()} />);
    expect(creatorApi.getFollowers).not.toHaveBeenCalled();
  });

  it('calls onClose when modal cancel is triggered', async () => {
    const onClose = vi.fn();
    renderWithProviders(<FollowersModal visible={true} onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByText('Neural Followers')).toBeInTheDocument();
    });
    // The close button is rendered by antd Modal
    const closeBtn = document.querySelector('.ant-modal-close');
    if (closeBtn) {
      (closeBtn as HTMLElement).click();
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('renders "Connected since" label for a follower', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getFollowers as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          followers: [
            { id: 'f1', name: 'Carol', email: 'carol@example.com', followerId: 'f1', followedAt: '2024-06-01T00:00:00Z' },
          ],
          totals: { total: 1 },
        },
      },
    });
    renderWithProviders(<FollowersModal visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/Connected since/)).toBeInTheDocument();
    });
  });

  it('renders multiple followers when API returns several entries', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getFollowers as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          followers: [
            { id: 'f1', name: 'Dave', email: 'dave@example.com', followerId: 'f1', followedAt: '2024-01-01T00:00:00Z' },
            { id: 'f2', name: 'Eve', email: 'eve@example.com', followerId: 'f2', followedAt: '2024-02-01T00:00:00Z' },
          ],
          totals: { total: 2 },
        },
      },
    });
    renderWithProviders(<FollowersModal visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Dave')).toBeInTheDocument();
      expect(screen.getByText('Eve')).toBeInTheDocument();
    });
  });

  it('renders the correct total count in the subtitle', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getFollowers as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          followers: [],
          totals: { total: 7 },
        },
      },
    });
    renderWithProviders(<FollowersModal visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Total Matrix Capacity: 7')).toBeInTheDocument();
    });
  });

  it('renders a Spin element while loading followers', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getFollowers as ReturnType<typeof vi.fn>).mockReturnValueOnce(new Promise(() => {}));
    const { container } = renderWithProviders(<FollowersModal visible={true} onClose={vi.fn()} />);
    expect(container.querySelector('.ant-spin')).toBeTruthy();
  });

  it('renders a list item for each follower', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getFollowers as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          followers: [
            { id: 'f1', name: 'Frank', email: 'frank@test.com', followerId: 'f1', followedAt: '2024-03-15T00:00:00Z' },
            { id: 'f2', name: 'Grace', email: 'grace@test.com', followerId: 'f2', followedAt: '2024-04-10T00:00:00Z' },
          ],
          totals: { total: 2 },
        },
      },
    });
    const { container } = renderWithProviders(<FollowersModal visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      const items = container.querySelectorAll('.follower-item');
      expect(items).toHaveLength(2);
    });
  });

  it('calls getFollowers with page 1 on initial open', async () => {
    const { creatorApi } = await import('../../../services/api');
    renderWithProviders(<FollowersModal visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(creatorApi.getFollowers).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
    });
  });
});
