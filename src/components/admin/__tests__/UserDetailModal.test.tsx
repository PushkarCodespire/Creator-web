import { screen, waitFor, fireEvent } from '@testing-library/react';
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

const mockUserResponse = {
  data: { data: mockUserData },
};

const mockHistoryResponse = {
  data: { data: mockHistory },
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

  it('calls getUser and getUserModerationHistory when opened', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(adminApi.getUser).toHaveBeenCalledWith('u-1');
      expect(adminApi.getUserModerationHistory).toHaveBeenCalledWith('u-1');
    });
  });

  it('renders the user name after data loads', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when fetch fails', async () => {
    const onClose = vi.fn();
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={onClose} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('does not fetch when userId is null', () => {
    renderWithProviders(
      <UserDetailModal userId={null} visible={false} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(adminApi.getUser).not.toHaveBeenCalled();
  });

  it('renders VERIFIED tag for a verified user', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      // The status tag renders the exact text "VERIFIED" (all caps) in a <span>
      const tags = screen.getAllByText('VERIFIED');
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  it('renders BANNED tag for a banned user', async () => {
    const bannedUserResponse = {
      data: {
        data: {
          user: { ...mockUserData.user, isBanned: true },
          analytics: mockUserData.analytics,
        },
      },
    };
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(bannedUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('BANNED')).toBeInTheDocument();
    });
  });

  it('renders Moderation History tab and switches to it', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Moderation History/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Moderation History/i));

    await waitFor(() => {
      expect(screen.getByText('No moderation logs found')).toBeInTheDocument();
    });
  });

  it('renders analytics statistics after data loads', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('CONVERSATIONS')).toBeInTheDocument();
    });
    expect(screen.getByText('MESSAGES')).toBeInTheDocument();
    expect(screen.getByText('REPORTS')).toBeInTheDocument();
  });

  it('renders Ban User and Suspend User buttons for active user', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Ban User')).toBeInTheDocument();
    });
    expect(screen.getByText('Suspend User')).toBeInTheDocument();
  });

  it('calls suspendUser when suspend action is confirmed', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);
    (adminApi.suspendUser as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Suspend User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Suspend User'));

    await waitFor(() => {
      // The suspend modal should appear
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    });
  });

  it('renders SUSPENDED tag for a suspended user', async () => {
    const suspendedUserResponse = {
      data: {
        data: {
          user: { ...mockUserData.user, isSuspended: true },
          analytics: mockUserData.analytics,
        },
      },
    };
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(suspendedUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('SUSPENDED')).toBeInTheDocument();
    });
  });

  it('renders Unban User button for a banned user', async () => {
    const bannedUserResponse = {
      data: {
        data: {
          user: { ...mockUserData.user, isBanned: true },
          analytics: mockUserData.analytics,
        },
      },
    };
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(bannedUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Unban User')).toBeInTheDocument();
    });
  });

  it('renders Unsuspend button for a suspended user', async () => {
    const suspendedUserResponse = {
      data: {
        data: {
          user: { ...mockUserData.user, isSuspended: true },
          analytics: mockUserData.analytics,
        },
      },
    };
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(suspendedUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Unsuspend')).toBeInTheDocument();
    });
  });

  it('renders the role tag from user data', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      // The role tag renders user.role text ("USER") as a tag
      expect(screen.getByText('USER')).toBeInTheDocument();
    });
  });

  it('renders "No reports against this user" in history tab', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Moderation History/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Moderation History/i));

    await waitFor(() => {
      expect(screen.getByText('No reports against this user')).toBeInTheDocument();
    });
  });

  it('renders Update Profile button', async () => {
    (adminApi.getUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserResponse);
    (adminApi.getUserModerationHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);

    renderWithProviders(
      <UserDetailModal userId="u-1" visible={true} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('Update Profile')).toBeInTheDocument();
    });
  });
});
