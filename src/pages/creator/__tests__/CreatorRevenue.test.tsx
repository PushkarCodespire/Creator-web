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
});
