import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  adminApi: {
    getAIModerationStats: vi.fn().mockResolvedValue({
      data: {
        data: {
          totalScanned: 5000,
          blocked: 50,
          flagged: 100,
          passed: 4850,
          accuracy: 98.5,
          categoryCounts: [],
        },
      },
    }),
    getAIModerationLogs: vi.fn().mockResolvedValue({
      data: {
        data: {
          logs: [
            {
              id: 'log1',
              content: 'Test message content',
              action: 'PASSED',
              category: null,
              confidence: 0.95,
              createdAt: '2026-04-10T00:00:00Z',
            },
          ],
          pagination: { total: 1, page: 1, limit: 20 },
        },
      },
    }),
    testAIModeration: vi.fn().mockResolvedValue({
      data: {
        data: { action: 'PASSED', categories: [], confidence: 0.99 },
      },
    }),
    updateAIThresholds: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

import AdminAIModeration from '../AdminAIModeration';

describe('AdminAIModeration', () => {
  it('renders the AI moderation page after data loads', async () => {
    renderWithProviders(<AdminAIModeration />);

    await waitFor(() => {
      expect(screen.getByText('Test message content')).toBeInTheDocument();
    });
  });
});
