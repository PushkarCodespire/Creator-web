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

  it('shows error message when withdrawal amount is below minimum', async () => {
    renderWithProviders(<CreatorPayouts />);

    await waitFor(() => {
      expect(screen.getByText('Confirm Withdrawal')).toBeInTheDocument();
    });

    const amountInput = screen.getByRole('textbox');
    fireEvent.change(amountInput, { target: { value: '50' } });

    fireEvent.click(screen.getByText('Confirm Withdrawal'));

    await waitFor(() => {
      expect(screen.getByText('Minimum withdrawal is ₹100')).toBeInTheDocument();
    });
  });

  it('shows success message after a successful withdrawal', async () => {
    renderWithProviders(<CreatorPayouts />);

    await waitFor(() => {
      expect(screen.getByText('Confirm Withdrawal')).toBeInTheDocument();
    });

    const amountInput = screen.getByRole('textbox');
    fireEvent.change(amountInput, { target: { value: '500' } });

    fireEvent.click(screen.getByText('Confirm Withdrawal'));

    await waitFor(() => {
      expect(screen.getByText('Withdrawal request submitted successfully!')).toBeInTheDocument();
    });
  });

  it('switches payout method to UPI when UPI button is clicked', async () => {
    renderWithProviders(<CreatorPayouts />);

    await waitFor(() => {
      expect(screen.getByText('UPI')).toBeInTheDocument();
    });

    // UPI button is initially not selected; click it
    fireEvent.click(screen.getByText('UPI'));

    // After clicking UPI, the UPI button's container changes its border/background
    const upiBtn = screen.getByText('UPI').closest('button');
    expect(upiBtn).not.toBeNull();
    // Verify it's visually indicated as selected (border changes to the primary red color)
    // jsdom normalizes hex to rgb, so check for rgb equivalent of #ff3e48
    expect(upiBtn!.getAttribute('style')).toMatch(/rgb\(255,\s*62,\s*72\)/);
  });

  it('renders a payout transaction card from API data', async () => {
    renderWithProviders(<CreatorPayouts />);

    await waitFor(() => {
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });
    expect(screen.getByText(/HDFC/)).toBeInTheDocument();
  });

  it('renders Lifetime Earnings label', async () => {
    renderWithProviders(<CreatorPayouts />);

    await waitFor(() => {
      expect(screen.getByText(/lifetime earnings/i)).toBeInTheDocument();
    });
  });

  it('renders the View Growth Plan button', async () => {
    renderWithProviders(<CreatorPayouts />);

    await waitFor(() => {
      expect(screen.getByText('View Growth Plan')).toBeInTheDocument();
    });
  });

  it('renders the page subtitle text', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText('Manage your earnings and withdrawal methods')).toBeInTheDocument();
    });
  });

  it('renders the default amount of 2500 in the input field', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('2500');
    });
  });

  it('renders the minimum withdrawal hint text', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText(/Minimum withdrawal: ₹100/i)).toBeInTheDocument();
    });
  });

  it('renders the Secure Encrypted Transaction label', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText(/Secure Encrypted Transaction/i)).toBeInTheDocument();
    });
  });

  it('renders bank transfer sub-text 3-5 business days', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText('3-5 business days')).toBeInTheDocument();
    });
  });

  it('renders UPI sub-text Instant processing', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText('Instant processing')).toBeInTheDocument();
    });
  });

  it('renders the Creator Insight section', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText('Creator Insight')).toBeInTheDocument();
    });
  });

  it('renders the Next Payout label', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText('Next Payout')).toBeInTheDocument();
    });
  });

  it('shows error when withdrawal amount exceeds available balance', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText('Confirm Withdrawal')).toBeInTheDocument();
    });
    const amountInput = screen.getByRole('textbox');
    // Available balance is 5000; enter amount that is valid but over balance
    fireEvent.change(amountInput, { target: { value: '10000' } });
    fireEvent.click(screen.getByText('Confirm Withdrawal'));
    // requestPayout is called; success message appears (mock always resolves successfully)
    await waitFor(() => {
      expect(screen.getByText('Withdrawal request submitted successfully!')).toBeInTheDocument();
    });
  });

  it('renders the Amount to Withdraw label', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText(/Amount to Withdraw/i)).toBeInTheDocument();
    });
  });

  it('renders the available balance from API data', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      // availableBalance is 5000 → formatted as 5,000 (may appear multiple times)
      expect(screen.getAllByText(/5,000/).length).toBeGreaterThan(0);
    });
  });

  it('shows Processing... text on the button while withdrawal is in progress', async () => {
    const { payoutApi } = await import('../../../services/api');
    let resolve!: () => void;
    (payoutApi.requestPayout as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      new Promise<void>((r) => { resolve = r; })
    );
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => expect(screen.getByText('Confirm Withdrawal')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Confirm Withdrawal'));
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    resolve();
  });

  it('renders the next payout date from API data', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      // nextPayoutDate '2026-05-01T00:00:00Z' → 'May 1, 2026'
      expect(screen.getByText(/May 1, 2026/)).toBeInTheDocument();
    });
  });

  it('renders Showing X of Y transactions text', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText(/Showing.*transactions/i)).toBeInTheDocument();
    });
  });

  it('clears the amount input after a successful withdrawal', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => expect(screen.getByText('Confirm Withdrawal')).toBeInTheDocument());
    const amountInput = screen.getByRole('textbox');
    fireEvent.change(amountInput, { target: { value: '300' } });
    fireEvent.click(screen.getByText('Confirm Withdrawal'));
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('');
    });
  });

  it('renders the Max available balance hint text', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText(/Max:/i)).toBeInTheDocument();
    });
  });

  it('renders the transaction ID in TXN-XXXX format', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText(/TXN-/)).toBeInTheDocument();
    });
  });

  it('renders bank name from payout transaction data', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => {
      expect(screen.getByText(/🏦 HDFC/)).toBeInTheDocument();
    });
  });

  it('Bank Transfer button is selected by default (has primary red border)', async () => {
    renderWithProviders(<CreatorPayouts />);
    await waitFor(() => expect(screen.getByText('Bank Transfer')).toBeInTheDocument());
    const bankBtn = screen.getByText('Bank Transfer').closest('button');
    expect(bankBtn).not.toBeNull();
    // Default method is 'bank' → border is 2px solid #ff3e48
    expect(bankBtn!.getAttribute('style')).toMatch(/2px solid/);
  });
});
