import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import DashboardLayout from '../DashboardLayout';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  getImageUrl: (url: string) => url,
  subscriptionApi: {
    getCurrent: vi.fn().mockResolvedValue({ data: { data: { plan: 'FREE' } } }),
  },
}));

vi.mock('../../DemoModeBanner', () => ({
  default: () => <div data-testid="demo-banner" />,
}));

vi.mock('../../notifications', () => ({
  NotificationCenter: () => <div data-testid="notification-center" />,
}));

// Override matchMedia so antd useBreakpoint returns md: true (desktop mode)
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const authenticatedState = {
  auth: {
    isAuthenticated: true,
    user: { id: 'u1', name: 'Test User', email: 'test@test.com', role: 'USER' as const, isVerified: true, createdAt: '' },
    token: 'test-token',
  } as any,
};

describe('DashboardLayout', () => {
  it('renders user dashboard title', () => {
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
  });

  it('renders creator dashboard title', () => {
    renderWithProviders(<DashboardLayout type="creator" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'CREATOR' },
        },
      } as any,
    });
    expect(screen.getByText('Creator Dashboard')).toBeInTheDocument();
  });

  it('renders admin panel title', () => {
    renderWithProviders(<DashboardLayout type="admin" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'ADMIN' },
        },
      } as any,
    });
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('renders sidebar menu items for user dashboard', () => {
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Chats')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders company dashboard title', () => {
    renderWithProviders(<DashboardLayout type="company" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'COMPANY' },
        },
      } as any,
    });
    expect(screen.getByText('Company Dashboard')).toBeInTheDocument();
  });

  it('renders creator dashboard sidebar items', () => {
    renderWithProviders(<DashboardLayout type="creator" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'CREATOR' },
        },
      } as any,
    });
    expect(screen.getByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Payouts')).toBeInTheDocument();
  });

  it('renders admin sidebar items', () => {
    renderWithProviders(<DashboardLayout type="admin" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'ADMIN' },
        },
      } as any,
    });
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Creators')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders the demo banner', () => {
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    expect(screen.getByTestId('demo-banner')).toBeInTheDocument();
  });

  it('renders user name in header when authenticated', () => {
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    // name appears both in sidebar user card and header dropdown
    expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
  });

  it('renders the notification center for user type', () => {
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    expect(screen.getByTestId('notification-center')).toBeInTheDocument();
  });

  it('renders the notification center for creator type', () => {
    renderWithProviders(<DashboardLayout type="creator" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'CREATOR' },
        },
      } as any,
    });
    expect(screen.getByTestId('notification-center')).toBeInTheDocument();
  });

  it('renders Bookmarks and Following in user sidebar', () => {
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    expect(screen.getByText('Bookmarks')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('renders Subscription in user sidebar', () => {
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    expect(screen.getByText('Subscription')).toBeInTheDocument();
  });

  it('renders company sidebar items', () => {
    renderWithProviders(<DashboardLayout type="company" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'COMPANY' },
        },
      } as any,
    });
    expect(screen.getByText('My Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Manage Deals')).toBeInTheDocument();
    expect(screen.getByText('Discover Creators')).toBeInTheDocument();
  });

  it('renders AI Moderation in admin sidebar', () => {
    renderWithProviders(<DashboardLayout type="admin" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'ADMIN' },
        },
      } as any,
    });
    expect(screen.getByText('AI Moderation')).toBeInTheDocument();
  });

  it('renders Browse Creators and Leaderboard links in user sidebar', () => {
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    expect(screen.getByText('Browse Creators')).toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  it('shows Free Member label when subscription plan is FREE', async () => {
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    await waitFor(() => {
      expect(screen.getByText('Free Member')).toBeInTheDocument();
    });
  });

  it('renders Content and Analytics in creator sidebar', () => {
    renderWithProviders(<DashboardLayout type="creator" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'CREATOR' },
        },
      } as any,
    });
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders Opportunities in creator sidebar', () => {
    renderWithProviders(<DashboardLayout type="creator" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'CREATOR' },
        },
      } as any,
    });
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
  });

  it('renders Revenue and Deals in admin sidebar', () => {
    renderWithProviders(<DashboardLayout type="admin" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'ADMIN' },
        },
      } as any,
    });
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
  });

  it('renders Email Preview in admin sidebar', () => {
    renderWithProviders(<DashboardLayout type="admin" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'ADMIN' },
        },
      } as any,
    });
    expect(screen.getByText('Email Preview')).toBeInTheDocument();
  });

  it('renders Companies in admin sidebar', () => {
    renderWithProviders(<DashboardLayout type="admin" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'ADMIN' },
        },
      } as any,
    });
    expect(screen.getByText('Companies')).toBeInTheDocument();
  });

  it('renders Community link in user sidebar', () => {
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    expect(screen.getByText('Community')).toBeInTheDocument();
  });

  it('calls subscriptionApi.getCurrent for user type on mount', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    await waitFor(() => {
      expect(subscriptionApi.getCurrent).toHaveBeenCalled();
    });
  });

  it('does NOT call subscriptionApi.getCurrent for creator type', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    const callsBefore = (subscriptionApi.getCurrent as ReturnType<typeof vi.fn>).mock.calls.length;
    renderWithProviders(<DashboardLayout type="creator" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'CREATOR' },
        },
      } as any,
    });
    await waitFor(() => {
      expect(screen.getByText('Creator Dashboard')).toBeInTheDocument();
    });
    expect((subscriptionApi.getCurrent as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsBefore);
  });

  it('shows rejected creator banner when creator is rejected', () => {
    renderWithProviders(<DashboardLayout type="creator" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: {
            ...authenticatedState.auth.user,
            role: 'CREATOR',
            creator: {
              id: 'cr1',
              isRejected: true,
              rejectionReason: 'Profile incomplete',
              rejectedAt: '2026-01-01T00:00:00Z',
            },
          },
        },
      } as any,
    });
    expect(screen.getByText('Creator Application Rejected')).toBeInTheDocument();
    expect(screen.getByText('Profile incomplete')).toBeInTheDocument();
  });

  it('shows rejection date when creatorRejectedAt is set', () => {
    renderWithProviders(<DashboardLayout type="creator" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: {
            ...authenticatedState.auth.user,
            role: 'CREATOR',
            creator: {
              id: 'cr1',
              isRejected: true,
              rejectionReason: 'Missing info',
              rejectedAt: '2026-01-15T00:00:00Z',
            },
          },
        },
      } as any,
    });
    expect(screen.getByText(/Rejected on/i)).toBeInTheDocument();
  });

  it('shows "Premium Member" label when subscription plan is PREMIUM', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getCurrent as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { plan: 'PREMIUM' } },
    });
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    await waitFor(() => {
      expect(screen.getByText('Premium Member')).toBeInTheDocument();
    });
  });

  it('falls back to "Member" label when subscription plan is undefined', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getCurrent as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: null },
    });
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    await waitFor(() => {
      expect(screen.getByText('Member')).toBeInTheDocument();
    });
  });

  it('renders user initial letter in sidebar avatar when no avatar URL', () => {
    renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, avatar: undefined },
        },
      } as any,
    });
    // Avatar falls back to first letter of name 'Test User' => 'T'
    expect(screen.getAllByText('T').length).toBeGreaterThan(0);
  });

  it('renders the logo image in the sidebar', () => {
    const { container } = renderWithProviders(<DashboardLayout type="user" />, {
      preloadedState: authenticatedState,
    });
    const logo = container.querySelector('img[alt="CodeSpire"]');
    expect(logo).toBeTruthy();
  });

  it('does not show notification center for company type', () => {
    renderWithProviders(<DashboardLayout type="company" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'COMPANY' },
        },
      } as any,
    });
    expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
  });

  it('does not show notification center for admin type', () => {
    renderWithProviders(<DashboardLayout type="admin" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'ADMIN' },
        },
      } as any,
    });
    expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
  });

  it('renders user avatar card section only for user and creator types', () => {
    // For admin type the avatar card block is not rendered in the sidebar
    const { queryByText } = renderWithProviders(<DashboardLayout type="admin" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'ADMIN' },
        },
      } as any,
    });
    // 'Free Member' / 'Member' text is only shown in user/creator sidebar avatar cards
    expect(queryByText('Free Member')).not.toBeInTheDocument();
    expect(queryByText('Member')).not.toBeInTheDocument();
  });

  it('renders user name in header dropdown for creator dashboard', () => {
    renderWithProviders(<DashboardLayout type="creator" />, {
      preloadedState: {
        auth: {
          ...authenticatedState.auth,
          user: { ...authenticatedState.auth.user, role: 'CREATOR', name: 'Creator Name' },
        },
      } as any,
    });
    expect(screen.getAllByText('Creator Name').length).toBeGreaterThan(0);
  });
});
