import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
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

  it('renders the user initial avatar when no avatar URL is set', () => {
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    // user.name is "Test User", initial is "T"
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('does not render become-a-creator CTA for CREATOR role users', () => {
    renderWithProviders(<WebsiteUserProfile />, {
      preloadedState: {
        auth: {
          user: { id: '2', name: 'Creator User', email: 'creator@test.com', role: 'CREATOR' as const },
          token: 'creator-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.queryByText('Create Your AI')).not.toBeInTheDocument();
  });

  it('renders the creator CTA description text for non-creator users', () => {
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    expect(
      screen.getByText(/Turn your knowledge into an AI/i)
    ).toBeInTheDocument();
  });

  it('shows "Loading..." text while notifications are being fetched', async () => {
    // Make the API hang so loading state is visible
    const { notificationApi } = await import('../../../services/api');
    (notificationApi.getNotifications as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(() => {})
    );
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders notifications when API returns them', async () => {
    const { notificationApi } = await import('../../../services/api');
    (notificationApi.getNotifications as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          notifications: [
            {
              id: 'n1',
              title: 'New message',
              message: 'You have a new message',
              type: 'CHAT',
              isRead: false,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      },
    });
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    await waitFor(() => {
      expect(screen.getByText('New message')).toBeInTheDocument();
      expect(screen.getByText('You have a new message')).toBeInTheDocument();
    });
  });

  it('log out button is clickable and exists as a button element', () => {
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    const logoutBtn = screen.getByRole('button', { name: /log out/i });
    expect(logoutBtn).toBeInTheDocument();
    // Should not throw
    fireEvent.click(logoutBtn);
  });

  it('renders user name as a heading', () => {
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    const heading = screen.getByRole('heading', { name: 'Test User' });
    expect(heading).toBeInTheDocument();
  });

  it('renders Notifications as a heading', () => {
    renderWithProviders(<WebsiteUserProfile />, { preloadedState: authenticatedState });
    const heading = screen.getByRole('heading', { name: 'Notifications' });
    expect(heading).toBeInTheDocument();
  });
});
