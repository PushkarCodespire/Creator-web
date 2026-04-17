import { screen } from '@testing-library/react';
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
});
