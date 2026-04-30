import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  creatorApi: {
    getDashboard: vi.fn().mockResolvedValue({
      data: {
        data: {
          id: 'creator-1',
          displayName: 'Test Creator',
          totalChats: 42,
          totalEarnings: 5000,
          stats: { totalAiAnswers: 100, aiAnswersToday: 5, recentChats: 12 },
          followers: { count: 250, top: [
            { followerId: 'f1', name: 'Alice Fan', followedAt: '2024-01-15T00:00:00Z' },
          ]},
          reviews: {
            summary: { averageRating: 4.5, totalReviews: 20 },
            reviews: [
              { id: 'r1', rating: 5, comment: 'Great creator!', createdAt: '2024-01-10T00:00:00Z', user: { name: 'Bob' } },
            ],
          },
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
    getFollowers: vi.fn().mockResolvedValue({
      data: {
        data: {
          followers: [{ followerId: 'f1', name: 'Alice Fan', followedAt: '2024-01-15T00:00:00Z' }],
          pagination: { totalPages: 1 },
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
  reviewApi: {
    getReviews: vi.fn().mockResolvedValue({
      data: {
        data: {
          reviews: [
            { id: 'r1', rating: 5, comment: 'Great!', createdAt: '2024-01-10T00:00:00Z', user: { name: 'Bob' } },
          ],
          pagination: { totalPages: 1 },
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

  it('renders stat cards with data', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Questions Answered')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Earnings')).toBeInTheDocument();
    expect(screen.getAllByText('Followers')[0]).toBeInTheDocument();
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

  it('renders followers section with follower name from data', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getAllByText('Followers').length).toBeGreaterThan(0);
      expect(screen.getByText('Alice Fan')).toBeInTheDocument();
    });
  });

  it('renders reviews section with review comment', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Reviews')).toBeInTheDocument();
      expect(screen.getByText('Great creator!')).toBeInTheDocument();
    });
  });

  it('opens followers modal when View all is clicked', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => expect(screen.getByText(/View all.*250/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/View all.*250/));
    await waitFor(() => {
      expect(screen.getByText('All Followers')).toBeInTheDocument();
    });
  });

  it('closes followers modal by clicking the overlay backdrop', async () => {
    const { container } = renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => expect(screen.getByText(/View all.*250/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/View all.*250/));
    await waitFor(() => expect(screen.getByText('All Followers')).toBeInTheDocument());
    // Click the outer backdrop (the fixed overlay div)
    const backdrop = container.querySelector('[style*="inset: 0"]') as HTMLElement;
    if (backdrop) fireEvent.click(backdrop);
    await waitFor(() => {
      expect(screen.queryByText('All Followers')).not.toBeInTheDocument();
    });
  });

  it('renders CreatorPal Insights section', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('CreatorPal Insights')).toBeInTheDocument();
    });
  });

  it('renders earnings breakdown with available balance', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Lifetime')).toBeInTheDocument();
    });
  });

  it('renders the Subscriptions earnings label', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Subscriptions')).toBeInTheDocument();
    });
  });

  it('renders View details button in Earnings Breakdown section', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText(/View details/i)).toBeInTheDocument();
    });
  });

  it('renders Change Pricing quick action button', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Change Pricing')).toBeInTheDocument();
    });
  });

  it('renders Share CreatorPal quick action button', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Share CreatorPal')).toBeInTheDocument();
    });
  });

  it('renders AI Responses label in CreatorPal Insights', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('AI Responses')).toBeInTheDocument();
    });
  });

  it('renders Satisfaction label in CreatorPal Insights', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Satisfaction')).toBeInTheDocument();
    });
  });

  it('renders Chats This Week label in CreatorPal Insights', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Chats This Week')).toBeInTheDocument();
    });
  });

  it('renders Your CreatorPal AI section', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Your CreatorPal AI')).toBeInTheDocument();
    });
  });

  it('opens reviews modal when View all reviews is clicked', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => expect(screen.getByText(/View all.*20/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/View all.*20/));
    await waitFor(() => {
      expect(screen.getByText('All Reviews')).toBeInTheDocument();
    });
  });

  it('renders Brand Deals label in earnings breakdown', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Brand Deals')).toBeInTheDocument();
    });
  });

  it('renders total chats stat card', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Total Chats')).toBeInTheDocument();
    });
  });

  it('renders the reviewer name Bob in the reviews section', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('renders average rating text in reviews section', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText(/4\.5/)).toBeInTheDocument();
    });
  });

  it('renders Today stat in CreatorPal Insights section', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });

  it('renders the top question count badge', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      // topQuestions[0].count = 15
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  it('does not show loading state after data has loaded', async () => {
    renderWithProviders(<CreatorDashboardHome />, {
      preloadedState: {
        auth: { user: { name: 'Test Creator' } as any, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    await waitFor(() => {
      expect(screen.queryByText(/loading dashboard/i)).not.toBeInTheDocument();
    });
  });
});
