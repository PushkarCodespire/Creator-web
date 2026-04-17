import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  notificationApi: {
    getNotifications: vi.fn().mockResolvedValue({
      data: { data: { notifications: [] } },
    }),
    markAsRead: vi.fn().mockResolvedValue({}),
  },
  getImageUrl: vi.fn((p: string) => p),
}));

import WebsiteUserProfile from '../WebsiteUserProfile';

const authenticatedState = {
  auth: {
    user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'USER' as const },
    token: 'test-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('WebsiteUserProfile', () => {
  it('renders without crashing when authenticated', () => {
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders user email', () => {
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('renders log out button', () => {
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('renders become a creator CTA for non-creator users', () => {
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    expect(screen.getByText('Become a Creator')).toBeInTheDocument();
    expect(screen.getByText('Create Your AI')).toBeInTheDocument();
  });

  it('renders notifications section', () => {
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('shows loading state then empty notifications', async () => {
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    await waitFor(() => {
      expect(screen.getByText(/No notifications yet/i)).toBeInTheDocument();
    });
  });
});
