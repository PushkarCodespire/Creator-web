import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  adminApi: {
    getDeals: vi.fn().mockResolvedValue({
      data: {
        data: {
          deals: [
            {
              id: 'd1',
              opportunity: { title: 'Product Launch', budget: 10000 },
              creator: { displayName: 'Creator A' },
              company: { name: 'TechCo' },
              status: 'IN_PROGRESS',
              amount: 8000,
              createdAt: '2026-03-01T00:00:00Z',
            },
          ],
          stats: {
            total: 1,
            inProgress: 1,
            completed: 0,
            cancelled: 0,
            totalValue: 8000,
          },
          pagination: { total: 1, page: 1, limit: 10 },
        },
      },
    }),
    updateDealStatus: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

import AdminDeals from '../AdminDeals';

describe('AdminDeals', () => {
  it('renders the deals page after data loads', async () => {
    renderWithProviders(<AdminDeals />);

    await waitFor(() => {
      expect(screen.getByText('Product Launch')).toBeInTheDocument();
    });
  });
});
