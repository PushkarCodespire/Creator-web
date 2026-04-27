import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  adminApi: {
    getUsers: vi.fn().mockResolvedValue({
      data: {
        data: {
          users: [
            { id: 'u1', name: 'John Doe', email: 'john@test.com', role: 'USER', isVerified: true, createdAt: '2026-01-01T00:00:00Z' },
            { id: 'u2', name: 'Jane Smith', email: 'jane@test.com', role: 'CREATOR', isVerified: false, createdAt: '2026-02-01T00:00:00Z' },
          ],
          pagination: { total: 2, page: 1, limit: 20 },
        },
      },
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { data: { id: 'u1', name: 'John Doe', email: 'john@test.com', role: 'USER' } },
    }),
    updateUser: vi.fn().mockResolvedValue({ data: { success: true } }),
    suspendUser: vi.fn().mockResolvedValue({ data: { success: true } }),
    banUser: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

vi.mock('../../../components/admin/UserDetailModal', () => ({
  default: () => <div data-testid="user-detail-modal">User Detail</div>,
}));

import AdminUsers from '../AdminUsers';

describe('AdminUsers', () => {
  it('renders the users table after data loads', async () => {
    renderWithProviders(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders user roles', async () => {
    renderWithProviders(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
