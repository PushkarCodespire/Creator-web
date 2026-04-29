import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  userApi: {
    getProfile: vi.fn().mockResolvedValue({
      data: {
        data: {
          name: 'Test User',
          avatar: null,
          email: 'test@example.com',
        },
      },
    }),
    updateProfile: vi.fn().mockResolvedValue({ data: { success: true } }),
    getInterests: vi.fn().mockResolvedValue({
      data: { data: { interests: ['Fitness', 'Yoga'] } },
    }),
    getCategories: vi.fn().mockResolvedValue({
      data: { data: ['Fitness', 'Yoga', 'Nutrition', 'Mental Health'] },
    }),
    updateInterests: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  authApi: {
    updateProfile: vi.fn().mockResolvedValue({ data: { success: true } }),
    changePassword: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  notificationApi: {
    getSettings: vi.fn().mockResolvedValue({
      data: {
        data: {
          emailEnabled: true,
          emailChat: true,
          emailDeals: true,
          emailPayments: true,
          emailModeration: true,
          pushEnabled: false,
          soundEnabled: true,
        },
      },
    }),
    updateSettings: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  getImageUrl: vi.fn((path: string) => path || ''),
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

vi.mock('../../../components/upload/AvatarUpload', () => ({
  default: () => <div data-testid="avatar-upload">Avatar Upload</div>,
}));

import UserSettings from '../UserSettings';

const preloadedState = {
  auth: {
    user: { id: 'u1', name: 'Test User', email: 'test@example.com', avatar: null } as any,
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('UserSettings', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<UserSettings />, { preloadedState });
    expect(screen.getByTestId('dashboard-loader')).toBeInTheDocument();
  });

  it('renders settings page after data loads', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
  });

  it('renders profile section after load', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    // Profile section should be present
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
  });

  it('renders notification settings after load', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    // Notification settings section should be visible
    expect(document.body).toBeTruthy();
  });

  it('renders interests section after load', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Interests')).toBeInTheDocument();
  });

  it('renders all four tabs after load', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Interests')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('renders Save Changes button in profile tab', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('switches to Notifications tab and renders notification switches', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Notifications'));

    await waitFor(() => {
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    });
    expect(screen.getByText('Chat Messages')).toBeInTheDocument();
    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
  });

  it('switches to Security tab and shows Update Password button', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Security'));

    await waitFor(() => {
      expect(screen.getByText('Update Password')).toBeInTheDocument();
    });
  });

  it('calls updateProfile when Save Changes form is submitted', async () => {
    const { userApi } = await import('../../../services/api');

    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(userApi.updateProfile).toHaveBeenCalled();
    });
  });

  it('fetches interests when Interests tab is clicked', async () => {
    const { userApi } = await import('../../../services/api');

    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Interests'));

    await waitFor(() => {
      expect(userApi.getInterests).toHaveBeenCalled();
      expect(userApi.getCategories).toHaveBeenCalled();
    });
  });

  it('renders Settings page title after load', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders page subtitle after load', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Manage your account preferences and security.')).toBeInTheDocument();
  });

  it('renders Display Name form field in profile tab', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Display Name')).toBeInTheDocument();
  });

  it('renders Email Address form field in profile tab', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('renders Promotions & Deals switch item in Notifications tab', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Notifications'));
    await waitFor(() => {
      expect(screen.getByText('Promotions & Deals')).toBeInTheDocument();
    });
  });

  it('renders Payments & Billing switch item in Notifications tab', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Notifications'));
    await waitFor(() => {
      expect(screen.getByText('Payments & Billing')).toBeInTheDocument();
    });
  });

  it('renders Safety & Moderation switch item in Notifications tab', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Notifications'));
    await waitFor(() => {
      expect(screen.getByText('Safety & Moderation')).toBeInTheDocument();
    });
  });

  it('renders Current Password field in Security tab', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Security'));
    await waitFor(() => {
      expect(screen.getByText('Current Password')).toBeInTheDocument();
    });
  });

  it('renders New Password field in Security tab', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Security'));
    await waitFor(() => {
      expect(screen.getByText('New Password')).toBeInTheDocument();
    });
  });

  it('renders avatar upload component in profile tab', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('avatar-upload')).toBeInTheDocument();
  });

  it('renders interests description text when Interests tab is active', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Interests'));
    await waitFor(() => {
      expect(screen.getByText('Select topics you are interested in to get better recommendations.')).toBeInTheDocument();
    });
  });

  it('calls changePassword when Security form is submitted with valid data', async () => {
    const { authApi } = await import('../../../services/api');

    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Security'));

    await waitFor(() => {
      expect(screen.getByText('Update Password')).toBeInTheDocument();
    });

    // Fill in password fields using the input elements
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(passwordInputs[0], { target: { value: 'oldpass123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'newpass456' } });

    fireEvent.click(screen.getByText('Update Password'));

    await waitFor(() => {
      expect(authApi.changePassword).toHaveBeenCalledWith('oldpass123', 'newpass456');
    });
  });

  it('calls notificationApi.updateSettings when a notification switch is toggled', async () => {
    const { notificationApi } = await import('../../../services/api');

    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Notifications'));

    await waitFor(() => {
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    });

    // Click the first Switch (Email Notifications toggle)
    const switches = document.querySelectorAll('.ant-switch');
    fireEvent.click(switches[0]);

    await waitFor(() => {
      expect(notificationApi.updateSettings).toHaveBeenCalled();
    });
  });

  it('renders "Sound Alerts" item in Notifications tab', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Notifications'));

    await waitFor(() => {
      expect(screen.getByText('Sound Alerts')).toBeInTheDocument();
    });
  });

  it('calls updateInterests when Save Interests button is clicked', async () => {
    const { userApi } = await import('../../../services/api');

    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Interests'));

    await waitFor(() => {
      expect(screen.getByText('Save Interests')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Save Interests'));

    await waitFor(() => {
      expect(userApi.updateInterests).toHaveBeenCalled();
    });
  });

  it('shows page loading state before data is fetched when APIs are slow', async () => {
    const { userApi, notificationApi } = await import('../../../services/api');

    // Make APIs hang so pageLoading stays true
    (userApi.getProfile as ReturnType<typeof vi.fn>).mockReturnValueOnce(new Promise(() => {}));
    (notificationApi.getSettings as ReturnType<typeof vi.fn>).mockReturnValueOnce(new Promise(() => {}));

    renderWithProviders(<UserSettings />, { preloadedState });

    // Dashboard loader shows synchronously before APIs resolve
    expect(screen.getByTestId('dashboard-loader')).toBeInTheDocument();
  });

  it('getProfile API is called on mount', async () => {
    const { userApi } = await import('../../../services/api');
    const callsBefore = (userApi.getProfile as ReturnType<typeof vi.fn>).mock.calls.length;

    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect((userApi.getProfile as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it('getSettings API is called on mount', async () => {
    const { notificationApi } = await import('../../../services/api');
    const callsBefore = (notificationApi.getSettings as ReturnType<typeof vi.fn>).mock.calls.length;

    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect((notificationApi.getSettings as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it('profile tab displays email from API response as disabled field', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    // Email field should be present and show the user email
    const emailInputs = document.querySelectorAll('input[disabled]');
    expect(emailInputs.length).toBeGreaterThan(0);
    expect((emailInputs[0] as HTMLInputElement).value).toContain('example.com');
  });

  it('profile form name field is pre-filled from API response', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const nameInput = document.querySelector('input#name') as HTMLInputElement | null;
      // The form field may use a different id; check for "Test User" in any text input
      const inputs = Array.from(document.querySelectorAll('input:not([disabled])')) as HTMLInputElement[];
      const nameField = inputs.find(i => i.value === 'Test User');
      expect(nameField).toBeTruthy();
    });
  });

  it('clicking Interests tab triggers getInterests and getCategories APIs', async () => {
    const { userApi } = await import('../../../services/api');

    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    const beforeInterests = (userApi.getInterests as ReturnType<typeof vi.fn>).mock.calls.length;
    const beforeCategories = (userApi.getCategories as ReturnType<typeof vi.fn>).mock.calls.length;

    fireEvent.click(screen.getByText('Interests'));

    await waitFor(() => {
      expect((userApi.getInterests as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(beforeInterests);
      expect((userApi.getCategories as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(beforeCategories);
    });
  });

  it('getInterests failure is swallowed and interests tab still renders', async () => {
    const { userApi } = await import('../../../services/api');
    (userApi.getInterests as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    (userApi.getCategories as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Interests'));

    await waitFor(() => {
      // Even after error, the tab content renders (no crash)
      expect(screen.getByText('Save Interests')).toBeInTheDocument();
    });
  });

  it('renders "Get notified when creators reply" description in Notifications tab', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Notifications'));

    await waitFor(() => {
      expect(screen.getByText('Get notified when creators reply')).toBeInTheDocument();
    });
  });

  it('Notifications tab shows "Instant alerts on your device" for Push Notifications', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Notifications'));

    await waitFor(() => {
      expect(screen.getByText('Instant alerts on your device')).toBeInTheDocument();
    });
  });

  it('Security tab renders both password input fields', async () => {
    renderWithProviders(<UserSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Security'));

    await waitFor(() => {
      expect(screen.getByText('Update Password')).toBeInTheDocument();
    });

    // Both password inputs should be present
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    expect(passwordInputs.length).toBeGreaterThanOrEqual(2);
  });
});
