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
    expect(screen.getByText('Create account')).toBeInTheDocument();
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
});
