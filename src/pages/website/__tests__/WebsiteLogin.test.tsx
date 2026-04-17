import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  getImageUrl: vi.fn((p: string) => p),
}));

import WebsiteLogin from '../WebsiteLogin';

describe('WebsiteLogin', () => {
  it('renders without crashing', () => {
    renderWithProviders(<WebsiteLogin />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderWithProviders(<WebsiteLogin />);
    expect(screen.getByText(/Sign in to your CreatorPal account/i)).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderWithProviders(<WebsiteLogin />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    renderWithProviders(<WebsiteLogin />);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('renders sign up link', () => {
    renderWithProviders(<WebsiteLogin />);
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('shows loading state on button when auth is loading', () => {
    renderWithProviders(<WebsiteLogin />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: true,
          error: null,
        },
      },
    });
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });

  it('shows error message when auth error exists', () => {
    renderWithProviders(<WebsiteLogin />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Invalid credentials',
        },
      },
    });
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});
