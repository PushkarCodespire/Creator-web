import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import UserDetailModal from '../UserDetailModal';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getUser: vi.fn(),
    getUserModerationHistory: vi.fn(),
    updateUser: vi.fn(),
    updateUserRole: vi.fn(),
    suspendUser: vi.fn(),
    banUser: vi.fn(),
    unsuspendUser: vi.fn(),
    unbanUser: vi.fn(),
  },
}));

import { adminApi } from '../../../services/api';

const mockUserData = {
  user: {
    id: 'u-1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'USER',
    isVerified: true,
    isBanned: false,
    isSuspended: false,
  },
  analytics: {
    conversationCount: 10,
    messageCount: 100,
    reportsMade: 0,
  },
};

const mockHistory = {
  moderationLogs: [],
  reportsAgainst: [],
};

describe('UserDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render content when not visible', () => {
    renderWithProviders(
      <UserDetailModal userId="u-1" visible={false} onClose={vi.fn()} onSuccess={vi.fn()} />
    );
    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
  });

  it('renders user details after loading', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockUserData },
    });
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockHistory },
    });

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText(/User Details: John Smith/)).toBeInTheDocument();
    });
  });

  it('renders tabs for Overview and Moderation History', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockUserData },
    });
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockHistory },
    });

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
    expect(screen.getByText('Moderation History')).toBeInTheDocument();
  });

  it('shows VERIFIED tag for verified users', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockUserData },
    });
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockHistory },
    });

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('VERIFIED')).toBeInTheDocument();
    });
  });
});
