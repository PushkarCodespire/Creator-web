import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
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
          contents: [{ id: '1', type: 'YOUTUBE_VIDEO', title: 'Muscle Guide', status: 'COMPLETED' }],
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

const creatorState = {
  auth: {
    user: { id: '1', name: 'Test Creator', email: 'a@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('CreatorDetailedAnalytics', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });
    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
  });

  it('renders the Analytics heading after data loads', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });

  it('renders all four stat cards', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Questions Answered')).toBeInTheDocument();
    });
    expect(screen.getByText('Engagement Rate')).toBeInTheDocument();
    expect(screen.getByText('Growth Rate')).toBeInTheDocument();
    expect(screen.getByText('Followers')).toBeInTheDocument();
  });

  it('renders the Engagement Trends chart section', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Engagement Trends')).toBeInTheDocument();
    });
  });

  it('renders the trend day toggle buttons', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('1D')).toBeInTheDocument();
    });
    expect(screen.getByText('7D')).toBeInTheDocument();
    expect(screen.getByText('30D')).toBeInTheDocument();
  });

  it('renders the Top Content section with the mocked content item', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Top Content')).toBeInTheDocument();
    });
    expect(screen.getByText('Muscle Guide')).toBeInTheDocument();
  });

  it('renders the Chat Overview section', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Chat Overview')).toBeInTheDocument();
    });
    expect(screen.getByText('Total AI Responses')).toBeInTheDocument();
    expect(screen.getByText('Answered Today')).toBeInTheDocument();
  });

  it('renders the Popular Questions section with mock question', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Popular Questions')).toBeInTheDocument();
    });
    expect(screen.getByText('How to build muscle?')).toBeInTheDocument();
  });

  it('switches trend days when a toggle button is clicked', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('1D')).toBeInTheDocument();
    });

    const { creatorApi } = await import('../../../services/api');
    const trendSpy = vi.mocked(creatorApi.getEngagementTrend);
    const callsBefore = trendSpy.mock.calls.length;

    fireEvent.click(screen.getByText('1D'));

    await waitFor(() => {
      expect(trendSpy.mock.calls.length).toBeGreaterThan(callsBefore);
    });
    // Last call should have been with 1 day
    const lastCallArgs = trendSpy.mock.calls[trendSpy.mock.calls.length - 1];
    expect(lastCallArgs[0]).toBe(1);
  });

  it('renders the Chats This Week sub-stat in the Chat Overview section', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Chats This Week')).toBeInTheDocument();
    });
  });

  it('renders the Total Conversations sub-stat', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Total Conversations')).toBeInTheDocument();
    });
  });

  it('renders AI responses per day legend label', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('AI Responses / Day')).toBeInTheDocument();
    });
  });

  it('renders the page subtitle describing content performance', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Track your content performance and audience growth')).toBeInTheDocument();
    });
  });

  it('renders the content status as Active for COMPLETED content', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('renders the Manage button inside Top Content', async () => {
    renderWithProviders(<CreatorDetailedAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Manage')).toBeInTheDocument();
    });
  });
});
