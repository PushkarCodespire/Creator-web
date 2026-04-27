import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  adminApi: {
    getReports: vi.fn().mockResolvedValue({
      data: {
        data: {
          reports: [
            {
              id: 'r1',
              targetType: 'USER',
              targetId: 'u1',
              reason: 'SPAM',
              description: 'Spamming messages',
              status: 'PENDING',
              priority: 'HIGH',
              createdAt: '2026-04-10T00:00:00Z',
              reporter: { id: 'u2', name: 'Jane Doe', email: 'jane@test.com' },
            },
          ],
          pagination: { total: 1, page: 1, limit: 20 },
        },
      },
    }),
    getModerationStats: vi.fn().mockResolvedValue({
      data: {
        data: {
          totalReports: 50,
          pendingReports: 5,
          resolvedToday: 3,
          bannedUsers: 2,
          suspendedUsers: 1,
          reportsByReason: [],
          actionsTaken: [],
        },
      },
    }),
    getModerationLogs: vi.fn().mockResolvedValue({
      data: {
        data: {
          logs: [],
          pagination: { total: 0 },
        },
      },
    }),
    resolveReport: vi.fn().mockResolvedValue({ data: { success: true } }),
    dismissReport: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

import AdminModeration from '../AdminModeration';

describe('AdminModeration', () => {
  it('renders the moderation page after data loads', async () => {
    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('SPAM')).toBeInTheDocument();
    });
  });
});
