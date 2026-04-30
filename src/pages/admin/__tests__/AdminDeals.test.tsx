import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';

const mockGetDeals = vi.fn().mockResolvedValue({
  data: {
    data: {
      deals: [
        {
          id: 'd1',
          creator: { displayName: 'Jane Creator', profileImage: null },
          company: { companyName: 'Acme Corp' },
          amount: '50000',
          platformFee: '5000',
          status: 'IN_PROGRESS',
          startDate: '2026-01-01T00:00:00Z',
        },
      ],
      pagination: { total: 1 },
      metrics: {
        totalDealValue: 50000,
        totalPlatformRevenue: 5000,
        averageDealSize: 50000,
        successRate: 80,
        averageCompletionDays: 14,
      },
      statusDistribution: {
        COMPLETED: { count: 10, percentage: 50 },
        IN_PROGRESS: { count: 5, percentage: 25 },
        CANCELLED: { count: 2, percentage: 10 },
        DISPUTED: { count: 3, percentage: 15 },
      },
      topPerformers: {
        companies: [{ name: 'TopCo', dealCount: 5, totalValue: 200000 }],
        creatorsByEarnings: [{ name: 'Top Creator', earnings: 100000 }],
        creatorsByDeals: [{ name: 'Deal Creator', dealCount: 8, totalEarnings: 80000 }],
      },
      analytics: { activeCompanies: 12, activeCreators: 34, avgDealsPerCompany: 2.5 },
      trends: {
        monthly: [
          { month: 'Jan 2026', revenue: 120000, completed: 6, created: 10 },
        ],
      },
    },
  },
});

vi.mock('../../../services/api', () => ({
  adminApi: {
    getDeals: (...args: unknown[]) => mockGetDeals(...args),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../styles/AdminPanel.css', () => ({}));

import AdminDeals from '../AdminDeals';

describe('AdminDeals', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminDeals />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Deal Ecosystem heading', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('Deal Ecosystem')).toBeInTheDocument();
    });
  });

  it('renders subtitle text', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText(/Manage and track all brand collaborations/i)).toBeInTheDocument();
    });
  });

  it('renders deal data after load', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('Jane Creator')).toBeInTheDocument();
    });
  });

  it('renders company name in deal row', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });
  });

  it('renders deal amount with INR prefix', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      // Multiple elements may contain this text (metric card + table row); at least one must exist
      expect(screen.getAllByText(/INR 50,000/).length).toBeGreaterThan(0);
    });
  });

  it('renders IN PROGRESS status tag in deal table', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      // The Ant Design Tag in the table row renders "IN PROGRESS"
      const tags = screen.getAllByText('IN PROGRESS');
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  it('renders metric cards — Total Deal Volume label', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('Total Deal Volume')).toBeInTheDocument();
    });
  });

  it('renders status filter dropdown', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('Filter Status')).toBeInTheDocument();
    });
  });

  it('renders monthly growth trend row', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('Jan 2026')).toBeInTheDocument();
    });
  });

  it('renders Reset button and page stays rendered after clicking', async () => {
    renderWithProviders(<AdminDeals />);
    // wait for initial data to render
    await screen.findByText('Deal Ecosystem');
    const resetBtn = screen.getByText('Reset');
    fireEvent.click(resetBtn);
    // page should still show the heading after reset
    await waitFor(() => {
      expect(screen.getByText('Deal Ecosystem')).toBeInTheDocument();
    });
  });

  it('renders Platform Revenue metric card label', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('Platform Revenue')).toBeInTheDocument();
    });
  });

  it('renders Average Deal Size metric card label', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('Average Deal Size')).toBeInTheDocument();
    });
  });

  it('renders Deal Success Rate metric card label', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('Deal Success Rate')).toBeInTheDocument();
    });
  });

  it('renders success rate value with percent sign', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });

  it('renders top companies section heading', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('Top Companies')).toBeInTheDocument();
    });
  });

  it('renders top company name from mock data', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('TopCo')).toBeInTheDocument();
    });
  });

  it('renders Top Creators (Earnings) section heading', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('Top Creators (Earnings)')).toBeInTheDocument();
    });
  });

  it('renders top creator by earnings name', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('Top Creator')).toBeInTheDocument();
    });
  });

  it('renders System-Wide Deal Logs table title', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getByText('System-Wide Deal Logs')).toBeInTheDocument();
    });
  });

  it('renders platform fee for the deal row', async () => {
    renderWithProviders(<AdminDeals />);
    await waitFor(() => {
      expect(screen.getAllByText(/INR 5,000/).length).toBeGreaterThan(0);
    });
  });
});
