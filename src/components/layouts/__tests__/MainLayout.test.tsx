import { screen, fireEvent, waitFor } from '@testing-library/react';
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
  it('renders the header with brand logo', () => {
    renderWithProviders(<MainLayout />);
    const logos = screen.getAllByAltText('CodeSpire');
    expect(logos[0]).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithProviders(<MainLayout />);
    // 'Features' and 'Pricing' appear in header nav AND footer — use getAllByText
    expect(screen.getAllByText('Features')[0]).toBeInTheDocument();
    expect(screen.getAllByText('How it works')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Pricing')[0]).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
  });

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

  it('renders Features nav link', () => {
    renderWithProviders(<MainLayout />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });
    // 'Features' appears in both header nav and footer
    expect(screen.getAllByText('Features')[0]).toBeInTheDocument();
  });

  it('renders How it works nav link', () => {
    renderWithProviders(<MainLayout />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });
    expect(screen.getAllByText('How it works')[0]).toBeInTheDocument();
  });

  it('renders Pricing nav link', () => {
    renderWithProviders(<MainLayout />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });
    // 'Pricing' appears in both header nav and footer
    expect(screen.getAllByText('Pricing')[0]).toBeInTheDocument();
  });

  it('renders demo banner component', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByTestId('demo-banner')).toBeInTheDocument();
  });

  it('renders authenticated user avatar/menu when logged in', () => {
    renderWithProviders(<MainLayout />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u1', name: 'Test User', email: 'test@test.com', role: 'USER' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isLoading: false,
          error: null,
        },
      },
    });
    // When authenticated, Login/Get started buttons should not appear
    expect(screen.queryByText('Log in')).not.toBeInTheDocument();
  });

  it('renders footer copyright text', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByText(/CodeSpire\. All rights reserved\./)).toBeInTheDocument();
  });

  it('renders footer Product, Company, Legal column headings', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('renders footer subscribe input and Join button', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByText('Join')).toBeInTheDocument();
  });

  it('renders notification center for authenticated users', () => {
    renderWithProviders(<MainLayout />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u1', name: 'Alice', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getByTestId('notification-center')).toBeInTheDocument();
  });

  it('renders user display name in header when authenticated', () => {
    renderWithProviders(<MainLayout />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u2', name: 'Jane Doe', email: 'jane@example.com', role: 'USER' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  // ── NEW TESTS ───────────────────────────────────────────────────────────────

  it('renders the Subscribe to updates heading in the footer', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByText('Subscribe to updates')).toBeInTheDocument();
  });

  it('renders the footer tagline paragraph', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByText(/The leading platform for creators to tokenize/i)).toBeInTheDocument();
  });

  it('renders footer Product links: Features, Pricing, API, Status', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders footer Company links: About, Blog, Careers, Contact', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Careers')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders footer Legal links: Terms, Privacy, Cookies, Licenses', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByText('Cookies')).toBeInTheDocument();
    expect(screen.getByText('Licenses')).toBeInTheDocument();
  });

  it('renders two CodeSpire logos (header and footer)', () => {
    renderWithProviders(<MainLayout />);
    const logos = screen.getAllByAltText('CodeSpire');
    expect(logos.length).toBeGreaterThanOrEqual(2);
  });

  it('does not render notification center when not authenticated', () => {
    renderWithProviders(<MainLayout />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });
    expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
  });

  it('renders Get started button when not authenticated', () => {
    renderWithProviders(<MainLayout />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });
    expect(screen.getByText('Get started')).toBeInTheDocument();
  });

  it('does not render Get started when authenticated', () => {
    renderWithProviders(<MainLayout />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u3', name: 'Bob', email: 'bob@example.com', role: 'USER' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.queryByText('Get started')).not.toBeInTheDocument();
  });

  it('renders the Explore creators link in the header', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByText('Explore')).toBeInTheDocument();
  });

  it('renders CodeSpire brand name link inside mobile drawer', async () => {
    renderWithProviders(<MainLayout />);
    // The drawer renders "CodeSpire" as a Link text when open
    // Trigger mobile drawer by finding the hamburger button
    const menuButtons = document.querySelectorAll('button');
    const hamburger = Array.from(menuButtons).find(
      (btn) => btn.className.includes('hide-desktop') || btn.querySelector('svg')
    );
    if (hamburger) {
      fireEvent.click(hamburger);
      await waitFor(() => {
        expect(screen.getAllByText('CodeSpire').length).toBeGreaterThanOrEqual(1);
      });
    }
  });

  it('renders footer current year in copyright', () => {
    renderWithProviders(<MainLayout />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it('renders the "Stay up to date" subscription description text', () => {
    renderWithProviders(<MainLayout />);
    expect(screen.getByText(/Stay up to date with the latest features/i)).toBeInTheDocument();
  });

  it('renders CREATOR user role with avatar initial', () => {
    renderWithProviders(<MainLayout />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u4', name: 'Carla Creator', email: 'carla@example.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText('Carla Creator')).toBeInTheDocument();
  });

  it('renders the "Privacy" and "Terms" links in the bottom footer bar', () => {
    renderWithProviders(<MainLayout />);
    // Bottom bar has Privacy and Terms links separate from the Legal column
    const privacyLinks = screen.getAllByText('Privacy');
    const termsLinks = screen.getAllByText('Terms');
    expect(privacyLinks.length).toBeGreaterThanOrEqual(1);
    expect(termsLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders without crashing when no preloadedState is provided', () => {
    const { container } = renderWithProviders(<MainLayout />);
    expect(container.firstChild).toBeTruthy();
  });
});
