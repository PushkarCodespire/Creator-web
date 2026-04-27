import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import MainLayout from '../MainLayout';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  getImageUrl: (url: string) => url,
}));

vi.mock('../../DemoModeBanner', () => ({
  default: () => <div data-testid="demo-banner" />,
}));

vi.mock('../MobileNav', () => ({
  default: () => <div data-testid="mobile-nav" />,
}));

vi.mock('../../notifications', () => ({
  NotificationCenter: () => <div data-testid="notification-center" />,
}));

vi.mock('../../common/ErrorBoundary', () => ({
  default: ({ children }: any) => <>{children}</>,
}));

describe('MainLayout', () => {
  it('renders login and register buttons when not authenticated', () => {
    renderWithProviders(<MainLayout />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Get started')).toBeInTheDocument();
  });

  it('renders mobile nav component', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
  });
});
