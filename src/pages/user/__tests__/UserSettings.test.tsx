import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
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
});
