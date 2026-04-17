import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  chatApi: {
    getUserConversations: vi.fn().mockResolvedValue({
      data: {
        data: {
          conversations: [
            {
              id: 'conv1',
              creator: { displayName: 'Yoga Master', profileImage: null, isVerified: true, averageRating: 4.5 },
              lastMessage: { content: 'Namaste!', createdAt: '2026-04-12T00:00:00Z' },
              messageCount: 10,
            },
          ],
          pagination: { total: 1, page: 1, limit: 20 },
        },
      },
    }),
  },
  getImageUrl: vi.fn((path: string) => path || ''),
}));

vi.mock('../../../utils/debounce', () => ({
  debounce: (fn: Function) => {
    const debounced = (...args: any[]) => fn(...args);
    debounced.cancel = vi.fn();
    return debounced;
  },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import UserChats from '../UserChats';

describe('UserChats', () => {
  it('renders the conversations list after data loads', async () => {
    renderWithProviders(<UserChats />);

    await waitFor(() => {
      expect(screen.getByText('Yoga Master')).toBeInTheDocument();
    });
  });
});
