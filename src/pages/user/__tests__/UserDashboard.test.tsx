import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  userDashboardApi: {
    getStats: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          stats: {
            totalChats: 10,
            messagesToday: 3,
            followingCount: 5,
            unreadAlerts: 2,
            activeStreak: 7,
          },
          subscription: { plan: 'FREE', status: 'ACTIVE' },
        },
      },
    }),
    getRecentConversations: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          conversations: [
            {
              id: 'conv1',
              creator: { displayName: 'Fitness Pro', profileImage: null },
              lastMessage: { content: 'Hello!', createdAt: '2026-04-10T00:00:00Z' },
            },
          ],
        },
      },
    }),
    getRecommendedCreators: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          recommendations: [],
        },
      },
    }),
    getActivityFeed: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          activities: [],
        },
      },
    }),
  },
  subscriptionApi: {
    getDetails: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          subscription: { plan: 'FREE', status: 'ACTIVE' },
          usage: { tokens: { used: 100, limit: 1000 } },
        },
      },
    }),
  },
  getImageUrl: vi.fn((path: string) => path || ''),
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import UserDashboard from '../UserDashboard';

const preloadedState = {
  auth: {
    user: { id: 'u1', name: 'Test User', email: 'test@test.com' } as any,
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('UserDashboard', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<UserDashboard />, { preloadedState });
    expect(screen.getByTestId('dashboard-loader')).toBeInTheDocument();
  });

  it('renders dashboard content after data loads', async () => {
    renderWithProviders(<UserDashboard />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
  });

  it('renders Overview heading after data loads', async () => {
    renderWithProviders(<UserDashboard />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
  });

  it('renders welcome message with user name', async () => {
    renderWithProviders(<UserDashboard />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test User/i)).toBeInTheDocument();
    });
  });

  it('renders Total Chats stat card', async () => {
    renderWithProviders(<UserDashboard />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Total Chats')).toBeInTheDocument();
    });
  });

  it('renders Following stat card', async () => {
    renderWithProviders(<UserDashboard />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Following')).toBeInTheDocument();
    });
  });

  it('renders recent conversation with creator name', async () => {
    renderWithProviders(<UserDashboard />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Fitness Pro')).toBeInTheDocument();
    });
  });

  it('renders Messages Used stat card', async () => {
    renderWithProviders(<UserDashboard />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Messages Used')).toBeInTheDocument();
    });
  });

  it('renders Unread Alerts stat card', async () => {
    renderWithProviders(<UserDashboard />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Unread Alerts')).toBeInTheDocument();
    });
  });

  it('renders Recent Conversations section heading', async () => {
    renderWithProviders(<UserDashboard />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Recent Conversations/i)).toBeInTheDocument();
    });
  });

  it('renders Activity Feed section heading', async () => {
    renderWithProviders(<UserDashboard />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Activity Feed/i)).toBeInTheDocument();
    });
  });

  it('renders Premium Tip quick action card', async () => {
    renderWithProviders(<UserDashboard />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Premium Tip')).toBeInTheDocument();
    });
  });

  it('renders empty activity feed message when no activities', async () => {
    renderWithProviders(<UserDashboard />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('No recent activity to show.')).toBeInTheDocument();
    });
  });

  it('renders suspension alert for suspended user', async () => {
    const suspendedState = {
      auth: {
        user: {
          id: 'u2',
          name: 'Suspended User',
          email: 'sus@test.com',
          isSuspended: true,
          suspendedUntil: '2026-05-01T00:00:00Z',
          suspensionReason: 'Policy violation',
        } as any,
        token: 'tok',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    };
    renderWithProviders(<UserDashboard />, { preloadedState: suspendedState });
    await waitFor(() => {
      expect(screen.getByText('Account Suspended')).toBeInTheDocument();
    });
  });
});
