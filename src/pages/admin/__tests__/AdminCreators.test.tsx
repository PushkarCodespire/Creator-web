import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  adminApi: {
    getCreators: vi.fn().mockResolvedValue({
      data: {
        data: {
          creators: [
            { id: 'c1', displayName: 'Fitness Pro', user: { name: 'Test Creator', email: 'c@test.com' }, isVerified: true, isActive: true, category: 'Fitness', createdAt: '2026-01-01T00:00:00Z' },
          ],
          pagination: { total: 1, page: 1, limit: 20 },
        },
      },
    }),
    getPendingCreators: vi.fn().mockResolvedValue({
      data: {
        data: {
          creators: [],
          pagination: { total: 0, page: 1, limit: 20 },
        },
      },
    }),
    getCreator: vi.fn().mockResolvedValue({
      data: { data: { id: 'c1', displayName: 'Fitness Pro' } },
    }),
    verifyCreator: vi.fn().mockResolvedValue({ data: { success: true } }),
    rejectCreator: vi.fn().mockResolvedValue({ data: { success: true } }),
    setCreatorActive: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

vi.mock('../../../components/admin/CreatorDetailModal', () => ({
  default: () => <div data-testid="creator-detail-modal">Creator Detail</div>,
}));

import AdminCreators from '../AdminCreators';

describe('AdminCreators', () => {
  it('renders the creators table after data loads', async () => {
    renderWithProviders(<AdminCreators />);

    await waitFor(() => {
      expect(screen.getByText('Fitness Pro')).toBeInTheDocument();
    });
  });
});
