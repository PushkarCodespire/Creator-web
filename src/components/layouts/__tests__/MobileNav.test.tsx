import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import MobileNav from '../MobileNav';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, style, ...props }: any) => (
      <div onClick={onClick} style={style} {...props}>{children}</div>
    ),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const guestState = { auth: { isAuthenticated: false, user: null, token: null } as any };

const makeAuthState = (role: string) => ({
  auth: {
    isAuthenticated: true,
    user: { id: 'u1', name: 'Test', role, email: 'test@test.com', isVerified: true, createdAt: '' },
    token: 'test-token',
  } as any,
});

describe('MobileNav', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders guest navigation items when not authenticated', () => {
    renderWithProviders(<MobileNav />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Creators')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeInTheDocument();
  });

  it('renders authenticated navigation items when logged in', () => {
    renderWithProviders(<MobileNav />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u1', name: 'Test', role: 'USER', email: 'test@test.com', isVerified: true, createdAt: '' },
          token: 'test-token',
        } as any,
      },
    });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Chats')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('navigates on tab click', () => {
    renderWithProviders(<MobileNav />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });
    fireEvent.click(screen.getByText('Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to /creators when Creators tab is clicked as guest', () => {
    renderWithProviders(<MobileNav />, { preloadedState: guestState });
    fireEvent.click(screen.getByText('Creators'));
    expect(mockNavigate).toHaveBeenCalledWith('/creators');
  });

  it('navigates to /pricing when Pricing tab is clicked as guest', () => {
    renderWithProviders(<MobileNav />, { preloadedState: guestState });
    fireEvent.click(screen.getByText('Pricing'));
    expect(mockNavigate).toHaveBeenCalledWith('/pricing');
  });

  it('navigates to /login when Log in tab is clicked as guest', () => {
    renderWithProviders(<MobileNav />, { preloadedState: guestState });
    fireEvent.click(screen.getByText('Log in'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to /dashboard/chats when Chats tab is clicked as authenticated user', () => {
    renderWithProviders(<MobileNav />, { preloadedState: makeAuthState('USER') });
    fireEvent.click(screen.getByText('Chats'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/chats');
  });

  it('navigates to /creator-dashboard for CREATOR role Profile tab', () => {
    renderWithProviders(<MobileNav />, { preloadedState: makeAuthState('CREATOR') });
    fireEvent.click(screen.getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/creator-dashboard');
  });

  it('navigates to /company-dashboard for COMPANY role Profile tab', () => {
    renderWithProviders(<MobileNav />, { preloadedState: makeAuthState('COMPANY') });
    fireEvent.click(screen.getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/company-dashboard');
  });

  it('navigates to /admin for ADMIN role Profile tab', () => {
    renderWithProviders(<MobileNav />, { preloadedState: makeAuthState('ADMIN') });
    fireEvent.click(screen.getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('does not show Log in label when authenticated', () => {
    renderWithProviders(<MobileNav />, { preloadedState: makeAuthState('USER') });
    expect(screen.queryByText('Log in')).not.toBeInTheDocument();
  });

  it('does not show Pricing label when authenticated', () => {
    renderWithProviders(<MobileNav />, { preloadedState: makeAuthState('USER') });
    expect(screen.queryByText('Pricing')).not.toBeInTheDocument();
  });

  it('nav bar has hide-desktop class', () => {
    const { container } = renderWithProviders(<MobileNav />, { preloadedState: guestState });
    expect(container.firstChild).toHaveClass('hide-desktop');
  });

  it('navigates to /creators when Explore tab is clicked as authenticated user', () => {
    renderWithProviders(<MobileNav />, { preloadedState: makeAuthState('USER') });
    fireEvent.click(screen.getByText('Explore'));
    expect(mockNavigate).toHaveBeenCalledWith('/creators');
  });

  it('navigates to /dashboard for default USER role Profile tab', () => {
    renderWithProviders(<MobileNav />, { preloadedState: makeAuthState('USER') });
    fireEvent.click(screen.getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to / when Home tab is clicked as authenticated user', () => {
    renderWithProviders(<MobileNav />, { preloadedState: makeAuthState('USER') });
    fireEvent.click(screen.getByText('Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders exactly 4 nav items when authenticated', () => {
    renderWithProviders(<MobileNav />, { preloadedState: makeAuthState('USER') });
    // Home, Explore, Chats, Profile
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Chats')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders exactly 4 nav items when not authenticated', () => {
    renderWithProviders(<MobileNav />, { preloadedState: guestState });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Creators')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeInTheDocument();
  });

  it('does not show Explore label when not authenticated (shows Creators instead)', () => {
    renderWithProviders(<MobileNav />, { preloadedState: guestState });
    expect(screen.queryByText('Explore')).not.toBeInTheDocument();
  });

  it('does not show Chats label when not authenticated', () => {
    renderWithProviders(<MobileNav />, { preloadedState: guestState });
    expect(screen.queryByText('Chats')).not.toBeInTheDocument();
  });
});
