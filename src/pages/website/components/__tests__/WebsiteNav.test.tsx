vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to, ...p }: any) => <a href={to} {...p}>{children}</a>,
  };
});

vi.mock('../../../../store/slices/authSlice', async () => {
  const actual = await vi.importActual('../../../../store/slices/authSlice');
  return { ...actual, fetchCurrentUser: vi.fn(() => ({ type: 'auth/fetchCurrentUser' })) };
});

vi.mock('../../WebsiteHome.module.css', () => ({ default: {} }));

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { WebsiteNav } from '../WebsiteNav';

const guestState = {
  preloadedState: {
    auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
  },
};

const authState = {
  preloadedState: {
    auth: {
      user: { id: '1', name: 'Test User', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
      token: 'tok', isAuthenticated: true, isLoading: false, error: null,
    },
  },
};

describe('WebsiteNav', () => {
  it('renders when not authenticated', () => {
    const { container } = renderWithProviders(<WebsiteNav />, guestState);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders when authenticated', () => {
    const { container } = renderWithProviders(<WebsiteNav />, authState);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders About link', () => {
    renderWithProviders(<WebsiteNav />, guestState);
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders Pricing link', () => {
    renderWithProviders(<WebsiteNav />, guestState);
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('renders user menu button when authenticated', () => {
    renderWithProviders(<WebsiteNav />, authState);
    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
  });

  it('shows user name in dropdown when user menu is clicked', () => {
    renderWithProviders(<WebsiteNav />, authState);
    fireEvent.click(screen.getByLabelText('User menu'));
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('shows user email in dropdown when user menu is clicked', () => {
    renderWithProviders(<WebsiteNav />, authState);
    fireEvent.click(screen.getByLabelText('User menu'));
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
  });

  it('renders Sign in link when not authenticated', () => {
    renderWithProviders(<WebsiteNav />, guestState);
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('does not render Sign in link when authenticated', () => {
    renderWithProviders(<WebsiteNav />, authState);
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
  });

  it('does not render user menu button when not authenticated', () => {
    renderWithProviders(<WebsiteNav />, guestState);
    expect(screen.queryByLabelText('User menu')).not.toBeInTheDocument();
  });

  it('shows Log out button in dropdown when user menu is clicked', () => {
    renderWithProviders(<WebsiteNav />, authState);
    fireEvent.click(screen.getByLabelText('User menu'));
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('closes dropdown when Log out is clicked', () => {
    renderWithProviders(<WebsiteNav />, authState);
    fireEvent.click(screen.getByLabelText('User menu'));
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument();
  });

  it('renders About link pointing to /about', () => {
    renderWithProviders(<WebsiteNav />, guestState);
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  });

  it('renders Pricing link pointing to /pricing', () => {
    renderWithProviders(<WebsiteNav />, guestState);
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/pricing');
  });

  it('shows Dashboard link in dropdown for CREATOR role', () => {
    const creatorState = {
      preloadedState: {
        auth: {
          user: { id: '2', name: 'Creator User', email: 'creator@test.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
          token: 'tok', isAuthenticated: true, isLoading: false, error: null,
        },
      },
    };
    renderWithProviders(<WebsiteNav />, creatorState);
    fireEvent.click(screen.getByLabelText('User menu'));
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('shows Admin link in dropdown for ADMIN role', () => {
    const adminState = {
      preloadedState: {
        auth: {
          user: { id: '3', name: 'Admin User', email: 'admin@test.com', role: 'ADMIN' as const, isVerified: true, createdAt: '' },
          token: 'tok', isAuthenticated: true, isLoading: false, error: null,
        },
      },
    };
    renderWithProviders(<WebsiteNav />, adminState);
    fireEvent.click(screen.getByLabelText('User menu'));
    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument();
  });
});
