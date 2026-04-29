import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getRevenue: vi.fn().mockResolvedValue({
      data: {
        data: {
          overview: { totalRevenue: 0, platformRevenue: 0, creatorEarnings: 0, totalTransactions: 0 },
          topCreators: [],
          transactions: { recent: [], total: 0 },
        },
      },
    }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import { screen, waitFor } from '@testing-library/react';
import AdminRevenue from '../AdminRevenue';

describe('AdminRevenue', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminRevenue />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Financial Intelligence heading after load', async () => {
    renderWithProviders(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getAllByText('Financial Intelligence')[0]).toBeInTheDocument();
    });
  });

  it('renders subtitle text after load', async () => {
    renderWithProviders(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getByText(/Comprehensive tracking of platform earnings/i)).toBeInTheDocument();
    });
  });

  it('renders Total Revenue metric card', async () => {
    renderWithProviders(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });
  });

  it('renders Subscriptions metric card', async () => {
    renderWithProviders(<AdminRevenue />);
    await waitFor(() => {
      // 'Subscriptions' may appear in metric card title and chart label
      expect(screen.getAllByText('Subscriptions')[0]).toBeInTheDocument();
    });
  });

  it('renders Commissions metric card', async () => {
    renderWithProviders(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Commissions')).toBeInTheDocument();
    });
  });

  it('renders time range selector', async () => {
    renderWithProviders(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Analyze financial performance across different time periods')).toBeInTheDocument();
    });
  });

  it('renders Active Subs metric card', async () => {
    renderWithProviders(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Active Subs')).toBeInTheDocument();
    });
  });

  it('renders Weekly Earnings Timeline card', async () => {
    renderWithProviders(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Weekly Earnings Timeline')).toBeInTheDocument();
    });
  });

  it('renders Revenue Source Distribution card', async () => {
    renderWithProviders(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Revenue Source Distribution')).toBeInTheDocument();
    });
  });

  it('renders Subscriber Segmentation card', async () => {
    renderWithProviders(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Subscriber Segmentation')).toBeInTheDocument();
    });
  });

  it('renders Transaction Reliability card', async () => {
    renderWithProviders(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Transaction Reliability')).toBeInTheDocument();
    });
  });

  it('renders revenue data when API returns values', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getRevenue as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          totalRevenue: 120000,
          subscriptionRevenue: 80000,
          dealCommissionRevenue: 40000,
          revenueTrend: [
            { rangeLabel: '1-7 Apr', revenue: 15000, dealRevenue: 5000 },
          ],
          revenueBreakdown: {
            subscriptions: { percentage: 67, amount: 80000 },
            dealCommission: { percentage: 33, amount: 40000 },
          },
          subscriptions: {
            totalSubscribers: 100,
            byStatus: { ACTIVE: 85 },
            byPlan: { PREMIUM: { count: 60 }, FREE: { count: 40 } },
          },
          transactions: {
            recent: [],
            totalCount: 0,
            byStatus: { COMPLETED: 0, PENDING: 0, FAILED: 0 },
          },
        },
      },
    });

    renderWithProviders(<AdminRevenue />);

    await waitFor(() => {
      expect(screen.getByText('1-7 Apr')).toBeInTheDocument();
    });
  });
});
