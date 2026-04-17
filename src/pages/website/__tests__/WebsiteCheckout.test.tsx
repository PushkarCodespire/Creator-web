import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  subscriptionApi: {
    upgrade: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('lucide-react', () => ({
  Check: ({ size }: { size?: number }) => <span data-testid="icon-check" />,
  Shield: ({ size }: { size?: number }) => <span data-testid="icon-shield" />,
}));

import WebsiteCheckout from '../WebsiteCheckout';

const authenticatedState = {
  auth: {
    user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'USER' as const },
    token: 'test-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('WebsiteCheckout', () => {
  beforeEach(() => {
    localStorage.setItem('selectedPlan', 'premium');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders without crashing when authenticated', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });

  it('renders plan summary', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Selected Plan')).toBeInTheDocument();
  });

  it('renders bill summary section', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('Bill Summary')).toBeInTheDocument();
    expect(screen.getByText('Tax')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders user billing email', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText(/test@test.com/i)).toBeInTheDocument();
  });

  it('renders pay button', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText(/Pay ₹499 Now/i)).toBeInTheDocument();
  });

  it('renders secure payment badge', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText(/Secure Encrypted Payment/i)).toBeInTheDocument();
  });

  it('renders back to plans link', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText(/Back to plans/i)).toBeInTheDocument();
  });
});
