import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  followApi: {
    getFollowing: vi.fn().mockResolvedValue({
      data: {
        data: {
          following: [
            { id: 'c1', displayName: 'Yoga Master', profileImage: null, about: 'Yoga expert', isVerified: true },
            { id: 'c2', displayName: 'Fitness Guru', profileImage: null, about: 'Fitness coach', isVerified: false },
          ],
        },
      },
    }),
    unfollowCreator: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  getImageUrl: vi.fn((path: string) => path || ''),
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import UserFollowing from '../UserFollowing';

const preloadedState = {
  auth: {
    user: { id: 'u1', name: 'Test User' } as any,
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('UserFollowing', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<UserFollowing />, { preloadedState });
    expect(screen.getByTestId('dashboard-loader')).toBeInTheDocument();
  });

  it('renders following list after data loads', async () => {
    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Yoga Master')).toBeInTheDocument();
    });

    expect(screen.getByText('Fitness Guru')).toBeInTheDocument();
  });

  it('renders the page title', async () => {
    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Following')).toBeInTheDocument();
    });
  });

  it('renders the page subtitle', async () => {
    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Creators you follow and support.')).toBeInTheDocument();
    });
  });

  it('renders View Profile button for each creator', async () => {
    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      const viewProfileButtons = screen.getAllByText('View Profile');
      expect(viewProfileButtons).toHaveLength(2);
    });
  });

  it('renders Unfollow button for each creator', async () => {
    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      const unfollowButtons = screen.getAllByText('Unfollow');
      expect(unfollowButtons).toHaveLength(2);
    });
  });

  it('removes a creator from the list when Unfollow is clicked', async () => {
    const { followApi } = await import('../../../services/api');
    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Yoga Master')).toBeInTheDocument();
    });

    const unfollowButtons = screen.getAllByText('Unfollow');
    fireEvent.click(unfollowButtons[0]);

    await waitFor(() => {
      expect(followApi.unfollowCreator).toHaveBeenCalledWith('c1');
    });
  });

  it('shows empty state when following list is empty', async () => {
    const { followApi } = await import('../../../services/api');
    (followApi.getFollowing as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { following: [] } },
    });

    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('You are not following any creators yet')).toBeInTheDocument();
    });
  });

  it('calls getFollowing with the user id', async () => {
    const { followApi } = await import('../../../services/api');
    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      expect(followApi.getFollowing).toHaveBeenCalledWith('u1');
    });
  });

  it('renders both creator names', async () => {
    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Yoga Master')).toBeInTheDocument();
      expect(screen.getByText('Fitness Guru')).toBeInTheDocument();
    });
  });

  it('removes the unfollowed creator from the DOM after unfollow succeeds', async () => {
    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Yoga Master')).toBeInTheDocument();
    });

    const unfollowButtons = screen.getAllByText('Unfollow');
    fireEvent.click(unfollowButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Yoga Master')).not.toBeInTheDocument();
    });

    // Other creator should still be present
    expect(screen.getByText('Fitness Guru')).toBeInTheDocument();
  });

  it('calls unfollowCreator with the second creator id when second Unfollow is clicked', async () => {
    const { followApi } = await import('../../../services/api');
    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('Fitness Guru')).toBeInTheDocument();
    });

    const unfollowButtons = screen.getAllByText('Unfollow');
    fireEvent.click(unfollowButtons[1]);

    await waitFor(() => {
      expect(followApi.unfollowCreator).toHaveBeenCalledWith('c2');
    });
  });

  it('shows empty state after unfollowing all creators', async () => {
    const { followApi } = await import('../../../services/api');
    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      expect(screen.getAllByText('Unfollow')).toHaveLength(2);
    });

    // Unfollow first creator
    fireEvent.click(screen.getAllByText('Unfollow')[0]);
    await waitFor(() => {
      expect(screen.getAllByText('Unfollow')).toHaveLength(1);
    });

    // Unfollow second creator
    fireEvent.click(screen.getAllByText('Unfollow')[0]);
    await waitFor(() => {
      expect(screen.getByText('You are not following any creators yet')).toBeInTheDocument();
    });
  });

  it('does not fetch following when user id is absent', async () => {
    const { followApi } = await import('../../../services/api');
    (followApi.getFollowing as ReturnType<typeof vi.fn>).mockClear();

    const stateWithoutUser = {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(<UserFollowing />, { preloadedState: stateWithoutUser });

    // Give useEffect time to run
    await new Promise((r) => setTimeout(r, 50));
    expect(followApi.getFollowing).not.toHaveBeenCalled();
  });

  it('renders View Profile buttons equal to the number of creators', async () => {
    renderWithProviders(<UserFollowing />, { preloadedState });

    await waitFor(() => {
      expect(screen.getAllByText('View Profile')).toHaveLength(2);
    });
  });

  it('displays loading indicator before data arrives', () => {
    // DashboardContentLoader mock renders a div with data-testid="dashboard-loader"
    renderWithProviders(<UserFollowing />, { preloadedState });
    expect(screen.getByTestId('dashboard-loader')).toBeInTheDocument();
  });
});
