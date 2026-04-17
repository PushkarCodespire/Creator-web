import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
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
});
