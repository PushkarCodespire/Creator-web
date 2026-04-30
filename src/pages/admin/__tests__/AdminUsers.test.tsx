import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

const mockGetUsers = vi.fn().mockResolvedValue({
  data: { data: { users: [], pagination: { total: 0, totalPages: 1 } } },
});

vi.mock('../../../services/api', () => ({
  adminApi: {
    getUsers: (...args: unknown[]) => mockGetUsers(...args),
    updateUserStatus: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

vi.mock('../../../components/admin/UserDetailModal', () => ({
  default: ({ visible }: { visible: boolean }) =>
    visible ? <div data-testid="user-detail-modal">Modal</div> : null,
}));

import AdminUsers from '../AdminUsers';

describe('AdminUsers', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminUsers />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the Users heading', async () => {
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText('User Directory')).toBeInTheDocument();
    });
  });

  it('shows search input', async () => {
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search name or email...')).toBeInTheDocument();
    });
  });

  it('shows role filter dropdown', async () => {
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      // Ant Design Select placeholder renders as text content
      expect(screen.getByText('Filter by role')).toBeInTheDocument();
    });
  });

  it('renders stat cards', async () => {
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText('Total Accounts')).toBeInTheDocument();
      expect(screen.getByText('Admins')).toBeInTheDocument();
      expect(screen.getByText('Restricted')).toBeInTheDocument();
    });
  });

  it('renders Reset button', async () => {
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });
  });

  it('search input change updates the input value', async () => {
    renderWithProviders(<AdminUsers />);
    const input = await screen.findByPlaceholderText('Search name or email...');
    fireEvent.change(input, { target: { value: 'alice' } });
    expect((input as HTMLInputElement).value).toBe('alice');
  });

  it('renders user row data when users are returned', async () => {
    mockGetUsers.mockResolvedValueOnce({
      data: {
        data: {
          users: [
            { id: 'u1', name: 'Alice Smith', email: 'alice@example.com', role: 'CREATOR', isVerified: true, createdAt: '2026-01-01T00:00:00Z' },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });
  });

  it('shows BANNED status badge for banned users', async () => {
    mockGetUsers.mockResolvedValueOnce({
      data: {
        data: {
          users: [
            { id: 'u2', name: 'Bob Banned', email: 'bob@example.com', role: 'USER', isBanned: true, createdAt: '2026-01-01T00:00:00Z' },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText('BANNED')).toBeInTheDocument();
    });
  });

  it('shows SUSPENDED status badge for suspended users', async () => {
    mockGetUsers.mockResolvedValueOnce({
      data: {
        data: {
          users: [
            { id: 'u3', name: 'Carol Sus', email: 'carol@example.com', role: 'USER', isSuspended: true, createdAt: '2026-01-01T00:00:00Z' },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText('SUSPENDED')).toBeInTheDocument();
    });
  });

  it('opens user detail modal when View button is clicked', async () => {
    mockGetUsers.mockResolvedValueOnce({
      data: {
        data: {
          users: [
            { id: 'u4', name: 'Dave View', email: 'dave@example.com', role: 'USER', isVerified: false, createdAt: '2026-01-01T00:00:00Z' },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<AdminUsers />);
    const viewBtn = await screen.findByText('View');
    fireEvent.click(viewBtn);
    await waitFor(() => {
      expect(screen.getByTestId('user-detail-modal')).toBeInTheDocument();
    });
  });

  it('shows "Active Now" stat card', async () => {
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText('Active Now')).toBeInTheDocument();
    });
  });

  it('shows "Verified" status tag for verified users', async () => {
    mockGetUsers.mockResolvedValueOnce({
      data: {
        data: {
          users: [
            { id: 'u5', name: 'Eve Verified', email: 'eve@example.com', role: 'USER', isVerified: true, createdAt: '2026-01-01T00:00:00Z' },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });

  it('shows "Unverified" status tag for unverified users', async () => {
    mockGetUsers.mockResolvedValueOnce({
      data: {
        data: {
          users: [
            { id: 'u6', name: 'Frank Unverified', email: 'frank@example.com', role: 'USER', isVerified: false, createdAt: '2026-01-01T00:00:00Z' },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText('Unverified')).toBeInTheDocument();
    });
  });

  it('renders subtitle paragraph under User Directory heading', async () => {
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText(/Manage global user accounts/i)).toBeInTheDocument();
    });
  });

  it('renders correct role tag for CREATOR users', async () => {
    mockGetUsers.mockResolvedValueOnce({
      data: {
        data: {
          users: [
            { id: 'u7', name: 'Grace Creator', email: 'grace@example.com', role: 'CREATOR', isVerified: true, createdAt: '2026-01-01T00:00:00Z' },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText('CREATOR')).toBeInTheDocument();
    });
  });

  it('shows "0 Users found" when API returns empty list', async () => {
    renderWithProviders(<AdminUsers />);
    await waitFor(() => {
      expect(screen.getByText('0 Users found')).toBeInTheDocument();
    });
  });

  it('clicking Reset clears search input value', async () => {
    renderWithProviders(<AdminUsers />);
    const input = await screen.findByPlaceholderText('Search name or email...');
    fireEvent.change(input, { target: { value: 'testquery' } });
    expect((input as HTMLInputElement).value).toBe('testquery');
    fireEvent.click(screen.getByText('Reset'));
    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('');
    });
  });
});
