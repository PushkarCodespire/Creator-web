import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  creatorApi: {
    getDashboard: vi.fn().mockResolvedValue({
      data: {
        data: {
          totalChats: 80,
          stats: { totalAiAnswers: 200, aiAnswersToday: 10, recentChats: 20 },
          followers: { count: 500 },
          reviews: { summary: { averageRating: 4.6, totalReviews: 30 } },
          topQuestions: [{ question: 'How to build muscle?', count: 25 }],
          contents: [{ id: '1', type: 'YOUTUBE_VIDEO', title: 'Muscle Guide' }],
        },
      },
    }),
    getComparativeAnalytics: vi.fn().mockResolvedValue({
      data: {
        data: {
          change: { messages: 12.0, revenue: 8.0, newUsers: 5.0 },
        },
      },
    }),
    getEngagementTrend: vi.fn().mockResolvedValue({
      data: {
        data: {
          trend: [
            { date: '2026-04-09', count: 10 },
            { date: '2026-04-10', count: 15 },
          ],
        },
      },
    }),
  },
  payoutApi: {
    getEarningsBreakdown: vi.fn().mockResolvedValue({
      data: {
        data: {
          availableBalance: 4000,
          lifetimeEarnings: 12000,
        },
      },
    }),
  },
}));

vi.mock('../../../components/layouts/DashboardFilterContext', () => ({
  useDashboardFilter: () => ({ period: '90D', setPeriod: vi.fn(), days: 90 }),
}));

import CreatorDetailedAnalytics from '../CreatorDetailedAnalytics';

describe('CreatorDetailedAnalytics', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<CreatorDetailedAnalytics />);
    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
  });

  it('renders after data loads', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />);

    await waitFor(() => {
      // The page should have loaded and show data
      expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument();
    });
  });
});
