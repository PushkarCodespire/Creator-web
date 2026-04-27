import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  adminApi: {
    getCompanies: vi.fn().mockResolvedValue({
      data: {
        data: {
          companies: [
            { id: 'co1', name: 'FitCo Inc', industry: 'Health & Fitness', isVerified: true, logo: null, user: { email: 'info@fitco.com' }, createdAt: '2026-01-01T00:00:00Z' },
          ],
          pagination: { total: 1, page: 1, limit: 20 },
        },
      },
    }),
    verifyCompany: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

import AdminCompanies from '../AdminCompanies';

describe('AdminCompanies', () => {
  it('renders the companies table after data loads', async () => {
    renderWithProviders(<AdminCompanies />);

    await waitFor(() => {
      expect(screen.getByText('FitCo Inc')).toBeInTheDocument();
    });
  });
});
