import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  adminApi: {
    getRevenue: vi.fn().mockResolvedValue({
      data: {
        data: {
          totalRevenue: 500000,
          monthlyRevenue: 50000,
          subscriptionRevenue: 400000,
          dealCommission: 100000,
          activeSubscriptions: 200,
          transactions: {
            recent: [
              { date: 'Apr 10, 2026', user: 'John Doe', plan: 'PREMIUM', amount: 799, status: 'SUCCESS' },
            ],
          },
          growth: { monthly: 15.5, quarterly: 45.2 },
        },
      },
    }),
  },
}));

import AdminRevenue from '../AdminRevenue';

describe('AdminRevenue', () => {
  it('renders the revenue dashboard after data loads', async () => {
    renderWithProviders(<AdminRevenue />);

    await waitFor(() => {
      // The loading state shows a Spin with "Loading revenue analytics..."
      // After data loads, it should no longer show that
      expect(screen.queryByText(/loading revenue analytics/i)).not.toBeInTheDocument();
    });
  });
});
