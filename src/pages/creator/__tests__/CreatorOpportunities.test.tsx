import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  opportunityApi: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: {
          opportunities: [
            {
              id: 'o1',
              title: 'Fitness Brand Collab',
              type: 'SPONSORED_POST',
              budget: 5000,
              status: 'OPEN',
              company: { name: 'FitCo' },
              category: 'Fitness',
            },
          ],
          pagination: { total: 1 },
        },
      },
    }),
    apply: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  creatorApi: {
    getApplications: vi.fn().mockResolvedValue({
      data: {
        data: {
          applications: [],
          pagination: { total: 0 },
        },
      },
    }),
  },
}));

import CreatorOpportunities from '../CreatorOpportunities';

describe('CreatorOpportunities', () => {
  it('renders the opportunities page', async () => {
    renderWithProviders(<CreatorOpportunities />);

    await waitFor(() => {
      expect(screen.getByText('Fitness Brand Collab')).toBeInTheDocument();
    });
  });
});
