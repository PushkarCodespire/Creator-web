import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  payoutApi: {
    getEarningsBreakdown: vi.fn().mockResolvedValue({
      data: {
        data: {
          availableBalance: 5000,
          lifetimeEarnings: 15000,
          totalEarnings: 15000,
          nextPayoutDate: '2026-05-01T00:00:00Z',
        },
      },
    }),
    getPayouts: vi.fn().mockResolvedValue({
      data: {
        data: {
          payouts: [
            { id: 'p1', amount: 2000, status: 'COMPLETED', requestedAt: '2026-04-01T00:00:00Z', bankAccount: { bankName: 'HDFC' } },
          ],
          total: 1,
        },
      },
    }),
    requestPayout: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

import CreatorPayouts from '../CreatorPayouts';

describe('CreatorPayouts', () => {
  it('renders the payouts page header', async () => {
    renderWithProviders(<CreatorPayouts />);

    await waitFor(() => {
      expect(screen.getByText('Payouts')).toBeInTheDocument();
    });
  });

  it('renders the balance card with earnings', async () => {
    renderWithProviders(<CreatorPayouts />);

    await waitFor(() => {
      expect(screen.getByText(/ready to withdraw/i)).toBeInTheDocument();
    });
  });

  it('renders the withdraw funds section', async () => {
    renderWithProviders(<CreatorPayouts />);

    await waitFor(() => {
      expect(screen.getByText('Withdraw Funds')).toBeInTheDocument();
    });

    expect(screen.getByText('Confirm Withdrawal')).toBeInTheDocument();
  });

  it('renders payout method options', async () => {
    renderWithProviders(<CreatorPayouts />);

    await waitFor(() => {
      expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
    });
    expect(screen.getByText('UPI')).toBeInTheDocument();
  });

  it('renders recent transactions section', async () => {
    renderWithProviders(<CreatorPayouts />);

    await waitFor(() => {
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });
  });

  it('renders download report button', async () => {
    renderWithProviders(<CreatorPayouts />);

    await waitFor(() => {
      expect(screen.getByText(/download report/i)).toBeInTheDocument();
    });
  });
});
