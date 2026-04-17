import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  authApi: {
    becomeCreator: vi.fn().mockResolvedValue({ data: { data: { user: {}, token: 'tok' } } }),
  },
  getImageUrl: vi.fn((p: string) => p),
}));

import WebsiteBecomeCreator from '../WebsiteBecomeCreator';

const authenticatedState = {
  auth: {
    user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'USER' as const },
    token: 'test-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('WebsiteBecomeCreator', () => {
  it('renders without crashing when authenticated as USER', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByText('Become a Creator')).toBeInTheDocument();
  });

  it('renders greeting with user name', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByText(/Hi Test!/i)).toBeInTheDocument();
  });

  it('renders form fields', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByPlaceholderText(/Weight loss expert/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tell us about your experience/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nutrition, Weight Loss/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByText('Continue to Setup')).toBeInTheDocument();
  });

  it('renders footer note', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByText(/You can always update these later/i)).toBeInTheDocument();
  });
});
