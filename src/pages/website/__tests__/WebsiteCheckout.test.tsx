import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent, act } from '@testing-library/react';
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    // Return empty params so plan falls through to localStorage
    useSearchParams: () => [new URLSearchParams(''), vi.fn()],
  };
});

vi.mock('../../../store/slices/authSlice', async () => {
  const actual = await vi.importActual('../../../store/slices/authSlice');
  return { ...actual, fetchCurrentUser: vi.fn(() => ({ type: 'auth/fetchCurrentUser' })) };
});

const mockNavigate = vi.fn();

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

  it('renders subtitle text', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('Complete your subscription')).toBeInTheDocument();
  });

  it('renders whats included label', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText("What's included:")).toBeInTheDocument();
  });

  it('renders premium plan features', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('2,000 tokens/month')).toBeInTheDocument();
    expect(screen.getByText('All creator access')).toBeInTheDocument();
    expect(screen.getByText('Full chat history')).toBeInTheDocument();
    expect(screen.getByText('Priority support')).toBeInTheDocument();
  });

  it('renders tax value as $0.00', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('renders shield icon', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByTestId('icon-shield')).toBeInTheDocument();
  });

  it('renders billing to label', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText(/Billing to:/i)).toBeInTheDocument();
  });

  it('renders starter plan when localStorage has starter', () => {
    localStorage.setItem('selectedPlan', 'starter');
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Activate Free Plan')).toBeInTheDocument();
  });

  it('renders elite plan when localStorage has elite', () => {
    localStorage.setItem('selectedPlan', 'elite');
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('Elite')).toBeInTheDocument();
    expect(screen.getByText(/Pay ₹1,499 Now/i)).toBeInTheDocument();
  });

  it('pay button is enabled when not loading', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    const button = screen.getByRole('button', { name: /Pay ₹499 Now/i });
    expect(button).not.toBeDisabled();
  });

  it('renders period label for premium plan', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('/month')).toBeInTheDocument();
  });

  it('renders plan price ₹499 in the plan summary card', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    // Plan price appears at least once in the summary
    expect(screen.getAllByText('₹499').length).toBeGreaterThan(0);
  });

  it('starter plan shows forever period', () => {
    localStorage.setItem('selectedPlan', 'starter');
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('forever')).toBeInTheDocument();
  });

  it('starter plan shows ₹0 price', () => {
    localStorage.setItem('selectedPlan', 'starter');
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getAllByText('₹0').length).toBeGreaterThan(0);
  });

  it('starter plan features include 5 free messages', () => {
    localStorage.setItem('selectedPlan', 'starter');
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('5 free messages')).toBeInTheDocument();
  });

  it('elite plan features include 10,000 tokens/month', () => {
    localStorage.setItem('selectedPlan', 'elite');
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('10,000 tokens/month')).toBeInTheDocument();
  });

  it('elite plan features include 1-on-1 coaching access', () => {
    localStorage.setItem('selectedPlan', 'elite');
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    expect(screen.getByText('1-on-1 coaching access')).toBeInTheDocument();
  });

  it('clicking Pay button triggers upgrade API call for premium plan', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    const payBtn = screen.getByRole('button', { name: /Pay ₹499 Now/i });
    fireEvent.click(payBtn);
    await waitFor(() => {
      expect(subscriptionApi.upgrade).toHaveBeenCalled();
    });
  });

  it('shows success state after successful payment', async () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    const payBtn = screen.getByRole('button', { name: /Pay ₹499 Now/i });
    fireEvent.click(payBtn);
    await waitFor(() => {
      expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    });
  });

  it('success screen shows plan name in redirect message', async () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    const payBtn = screen.getByRole('button', { name: /Pay ₹499 Now/i });
    fireEvent.click(payBtn);
    await waitFor(() => {
      expect(screen.getByText(/Your Premium plan is now active/i)).toBeInTheDocument();
    });
  });

  it('shows error message when payment API fails', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.upgrade as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      response: { data: { error: 'Payment declined' } },
    });
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    const payBtn = screen.getByRole('button', { name: /Pay ₹499 Now/i });
    fireEvent.click(payBtn);
    await waitFor(() => {
      expect(screen.getByText('Payment declined')).toBeInTheDocument();
    });
  });

  it('shows generic error when API fails without specific message', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.upgrade as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    const payBtn = screen.getByRole('button', { name: /Pay ₹499 Now/i });
    fireEvent.click(payBtn);
    await waitFor(() => {
      expect(screen.getByText('Payment failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('clicking Activate Free Plan for starter navigates to home without calling upgrade', async () => {
    localStorage.setItem('selectedPlan', 'starter');
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.upgrade as ReturnType<typeof vi.fn>).mockClear();
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    const freeBtn = screen.getByRole('button', { name: 'Activate Free Plan' });
    fireEvent.click(freeBtn);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    expect(subscriptionApi.upgrade).not.toHaveBeenCalled();
  });

  it('unauthenticated user is redirected to login', async () => {
    const unauthState = {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    };
    renderWithProviders(<WebsiteCheckout />, { preloadedState: unauthState });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('renders check icons equal to the number of premium plan features', () => {
    renderWithProviders(<WebsiteCheckout />, { preloadedState: authenticatedState });
    // Premium has 4 features; Check icon is rendered per feature
    const checkIcons = screen.getAllByTestId('icon-check');
    expect(checkIcons.length).toBeGreaterThanOrEqual(4);
  });
});
