import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  creatorApi: {
    getDashboard: vi.fn().mockResolvedValue({
      data: {
        data: {
          displayName: 'Test Creator',
          totalChats: 42,
          totalEarnings: 5000,
          stats: { totalAiAnswers: 100, aiAnswersToday: 5, recentChats: 12 },
          followers: { count: 250 },
          reviews: { summary: { averageRating: 4.5, totalReviews: 20 } },
          topQuestions: [
            { question: 'What is your workout plan?', count: 15 },
          ],
          contents: [{ id: '1', type: 'YOUTUBE_VIDEO', title: 'Video 1' }],
        },
      },
    }),
    getComparativeAnalytics: vi.fn().mockResolvedValue({
      data: {
        data: {
          change: { messages: 10.5, revenue: 5.2, newUsers: 3.1 },
        },
      },
    }),
  },
  payoutApi: {
    getEarningsBreakdown: vi.fn().mockResolvedValue({
      data: {
        data: {
          availableBalance: 2000,
          pendingBalance: 500,
          lifetimeEarnings: 5000,
          subscriptionEarnings: 3000,
          brandDealEarnings: 2000,
        },
      },
    }),
  },
}));

vi.mock('../../../components/layouts/DashboardFilterContext', () => ({
  useDashboardFilter: () => ({ period: '90D', setPeriod: vi.fn(), days: 90 }),
}));

import CreatorDashboardHome from '../CreatorDashboardHome';

describe('CreatorDashboardHome', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
  });

  it('renders greeting and creator name after data loads', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/here's how your creatorpal is doing today/i)).toBeInTheDocument();
  });

  it('renders quick action buttons', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    expect(screen.getByText('Add Program')).toBeInTheDocument();
    expect(screen.getByText('Edit Your AI')).toBeInTheDocument();
  });

  it('renders top questions section', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Top Questions This Week')).toBeInTheDocument();
    });

    expect(screen.getByText('What is your workout plan?')).toBeInTheDocument();
  });

  it('renders earnings breakdown section', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Earnings Breakdown')).toBeInTheDocument();
    });
  });
});
