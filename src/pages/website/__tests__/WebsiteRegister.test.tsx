import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  getImageUrl: vi.fn((p: string) => p),
}));

import WebsiteRegister from '../WebsiteRegister';

describe('WebsiteRegister', () => {
  it('renders without crashing', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByText(/Join CreatorPal and start chatting/i)).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min. 8 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeInTheDocument();
  });

  it('renders create account button', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument();
  });

  it('renders sign in link', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('shows loading state when auth is loading', () => {
    renderWithProviders(<WebsiteRegister />, {
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
    expect(screen.getByText('Creating account...')).toBeInTheDocument();
  });

  it('shows error message when auth error exists', () => {
    renderWithProviders(<WebsiteRegister />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Email already in use',
        },
      },
    });
    expect(screen.getByText('Email already in use')).toBeInTheDocument();
  });

  it('renders full name field label', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByText('Full name')).toBeInTheDocument();
  });

  it('renders email field label', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders password field label', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('renders confirm password field label', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByText('Confirm password')).toBeInTheDocument();
  });

  it('renders "Already have an account?" footer text', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
  });

  it('create account button is disabled when auth is loading', () => {
    renderWithProviders(<WebsiteRegister />, {
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
    expect(screen.getByRole('button', { name: 'Creating account...' })).toBeDisabled();
  });

  it('create account button is enabled when not loading', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByRole('button', { name: 'Create account' })).not.toBeDisabled();
  });

  it('password input has type password', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByPlaceholderText('Min. 8 characters')).toHaveAttribute('type', 'password');
  });

  it('confirm password input has type password', () => {
    renderWithProviders(<WebsiteRegister />);
    expect(screen.getByPlaceholderText('Re-enter your password')).toHaveAttribute('type', 'password');
  });
});
