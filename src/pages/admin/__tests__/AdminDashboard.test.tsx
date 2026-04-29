import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  adminApi: {
    getStats: vi.fn().mockResolvedValue({
      data: {
        data: {
          overview: {
            totalUsers: 1500,
            totalCreators: 50,
            totalCompanies: 10,
            totalConversations: 5000,
            totalRevenue: 250000,
            activeDeals: 7,
          },
          growth: {
            weekly: [
              { week: 'Week 1', users: 10, creators: 2, companies: 1, deals: 3 },
            ],
          },
          topPerformers: {
            creators: [{ name: 'Alice Top', earnings: 80000, dealCount: 4 }],
            companies: [{ name: 'BrandCo', dealCount: 3, totalValue: 150000 }],
            activeUsers: [{ name: 'User One', email: 'userone@test.com', messageCount: 25 }],
          },
          engagement: {
            creatorEngagementRate: 72,
            totalEngagedCreators: 36,
          },
          recentActivity: {
            deals: [
              { company: 'BrandCo', creator: 'Alice Top', createdAt: '2026-04-01T00:00:00Z', amount: 30000 },
            ],
            users: [
              { name: 'New User', email: 'new@test.com', role: 'USER', createdAt: '2026-04-01T00:00:00Z' },
            ],
            verifications: [
              { displayName: 'Verified Creator', verifiedAt: '2026-04-01T00:00:00Z' },
            ],
          },
          kpis: {
            platformHealthScore: 88,
            avgDealValue: 45000,
            mau: 800,
            dau: 200,
          },
        },
      },
    }),
  },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import AdminDashboard from '../AdminDashboard';

describe('AdminDashboard', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByTestId('dashboard-loader')).toBeInTheDocument();
  });

  it('renders the admin dashboard title after data loads', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Platform Intelligence')).toBeInTheDocument();
    });
  });

  it('renders overview stat cards after data loads', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Creators')).toBeInTheDocument();
      expect(screen.getByText('Partner Companies')).toBeInTheDocument();
    });
  });

  it('renders Strategic KPIs section after data loads', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Strategic KPIs')).toBeInTheDocument();
    });
  });

  it('renders Platform Growth Velocity section after data loads', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Platform Growth Velocity')).toBeInTheDocument();
    });
  });

  it('renders Total Revenue metric card after data loads', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });
  });

  it('renders top creators list after data loads', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Alice Top')).toBeInTheDocument();
    });
  });

  it('renders top companies list after data loads', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('BrandCo')).toBeInTheDocument();
    });
  });

  it('renders System Activity Audit section with Recent Deals tab', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('System Activity Audit')).toBeInTheDocument();
      expect(screen.getByText('Recent Deals')).toBeInTheDocument();
    });
  });

  it('renders active deals count in manage button', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Manage 7 Deals/i)).toBeInTheDocument();
    });
  });

  it('renders the admin dashboard subtitle text', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Real-time analytics, engagement metrics, and operational oversight/i)).toBeInTheDocument();
    });
  });

  it('renders the Active Deals Monitoring card heading', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Active Deals Monitoring')).toBeInTheDocument();
    });
  });

  it('renders the Platform Health statistic inside Strategic KPIs', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Platform Health')).toBeInTheDocument();
    });
  });

  it('renders the Creator Engagement statistic inside Strategic KPIs', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Creator Engagement')).toBeInTheDocument();
    });
  });

  it('renders top engaged users section', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Top Engaged Users')).toBeInTheDocument();
    });
  });

  it('renders the active user name from mock data', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });
  });

  it('renders the New Signups tab in System Activity Audit', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('New Signups')).toBeInTheDocument();
    });
  });

  it('renders the Verifications tab in System Activity Audit', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Verifications')).toBeInTheDocument();
    });
  });

  it('renders the Market Leaders card', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Market Leaders')).toBeInTheDocument();
    });
  });
});
