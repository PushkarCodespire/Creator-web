import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  payoutApi: {
    getEarningsBreakdown: vi.fn().mockResolvedValue({
      data: {
        data: {
          lifetimeEarnings: 25000,
          availableBalance: 8000,
          subscriptionEarnings: 15000,
          brandDealEarnings: 10000,
        },
      },
    }),
    getLedger: vi.fn().mockResolvedValue({
      data: {
        data: {
          entries: [
            { id: 'l1', description: 'Subscription earning', type: 'CREDIT', amount: 500, createdAt: '2026-04-10T00:00:00Z', sourceType: 'SUBSCRIPTION' },
          ],
        },
      },
    }),
  },
  creatorApi: {
    getDashboard: vi.fn().mockResolvedValue({
      data: {
        data: { totalEarnings: 25000 },
      },
    }),
  },
}));

import CreatorRevenue from '../CreatorRevenue';

describe('CreatorRevenue', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<CreatorRevenue />);
    expect(screen.getByText(/loading revenue/i)).toBeInTheDocument();
  });

  it('renders the revenue overview header after data loads', async () => {
    renderWithProviders(<CreatorRevenue />);

    await waitFor(() => {
      expect(screen.getByText('Revenue Overview')).toBeInTheDocument();
    });
  });

  it('renders period toggle buttons', async () => {
    renderWithProviders(<CreatorRevenue />);

    await waitFor(() => {
      expect(screen.getByText('WEEKLY')).toBeInTheDocument();
    });
    expect(screen.getByText('MONTHLY')).toBeInTheDocument();
    expect(screen.getByText('YEARLY')).toBeInTheDocument();
  });

  it('can switch period', async () => {
    renderWithProviders(<CreatorRevenue />);

    await waitFor(() => {
      expect(screen.getByText('WEEKLY')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('WEEKLY'));
    // Period change triggers a re-fetch, no error thrown
    await waitFor(() => {
      expect(screen.getByText('Revenue Overview')).toBeInTheDocument();
    });
  });

  it('renders Total Revenue stat card label', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });
  });

  it('renders Available Balance stat card label', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Available Balance')).toBeInTheDocument();
    });
  });

  it('renders Lifetime earnings label', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Lifetime earnings')).toBeInTheDocument();
    });
  });

  it('renders Ready to withdraw label', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Ready to withdraw')).toBeInTheDocument();
    });
  });

  it('renders Recent Transactions section heading', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });
  });

  it('renders the ledger entry description from mock data', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Subscription earning')).toBeInTheDocument();
    });
  });

  it('renders formatted total revenue from mock data', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      // lifetimeEarnings = 25000, formatted as ₹25,000.00
      expect(screen.getByText('₹25,000.00')).toBeInTheDocument();
    });
  });

  it('renders track earnings subtitle', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Track your earnings and transaction history')).toBeInTheDocument();
    });
  });

  it('switches to YEARLY period when clicked', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('YEARLY')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('YEARLY'));
    await waitFor(() => {
      expect(screen.getByText('Revenue Overview')).toBeInTheDocument();
    });
  });

  it('renders the available balance value from mock data', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      // availableBalance = 8000, formatted ₹8,000.00
      expect(screen.getByText('₹8,000.00')).toBeInTheDocument();
    });
  });

  it('renders transaction type "Earning" from the ledger entry', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText(/Earning/)).toBeInTheDocument();
    });
  });

  it('renders "COMPLETED" status badge on the ledger transaction', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });
  });

  it('renders the formatted credit amount "+₹500.00" for the CREDIT ledger entry', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('+₹500.00')).toBeInTheDocument();
    });
  });

  it('renders "1 transactions" count label in the transactions header', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('1 transactions')).toBeInTheDocument();
    });
  });

  it('renders "No transactions yet" when ledger is empty', async () => {
    const { payoutApi } = await import('../../../services/api');
    (payoutApi.getLedger as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { entries: [] } },
    });
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    });
  });

  it('switches back to MONTHLY after clicking MONTHLY again', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => expect(screen.getByText('WEEKLY')).toBeInTheDocument());
    fireEvent.click(screen.getByText('WEEKLY'));
    fireEvent.click(screen.getByText('MONTHLY'));
    await waitFor(() => {
      expect(screen.getByText('Revenue Overview')).toBeInTheDocument();
    });
  });

  it('does not show loading state after data loads', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.queryByText(/loading revenue/i)).not.toBeInTheDocument();
    });
  });

  it('renders a TrendingUp icon area (via "Lifetime earnings" label) on total revenue card', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Lifetime earnings')).toBeInTheDocument();
    });
  });

  it('renders a TrendingUp icon area (via "Ready to withdraw" label) on available balance card', async () => {
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Ready to withdraw')).toBeInTheDocument();
    });
  });

  it('calls getLedger with correct limit when WEEKLY is selected', async () => {
    const { payoutApi } = await import('../../../services/api');
    renderWithProviders(<CreatorRevenue />);
    await waitFor(() => expect(screen.getByText('WEEKLY')).toBeInTheDocument());
    fireEvent.click(screen.getByText('WEEKLY'));
    await waitFor(() => {
      expect(payoutApi.getLedger).toHaveBeenCalledWith({ limit: 7 });
    });
  });
});
