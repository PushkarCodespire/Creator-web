import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  subscriptionApi: {
    getDetails: vi.fn().mockResolvedValue({
      data: {
        data: {
          subscription: { plan: 'FREE', status: 'ACTIVE', expiresAt: null },
          usage: { tokens: { used: 100, limit: 1000 }, messages: { used: 50, limit: 500 } },
        },
      },
    }),
    getPlans: vi.fn().mockResolvedValue({
      data: {
        data: {
          plans: [
            { id: 'free', name: 'Free', price: 0, features: ['5 chats/day'] },
            { id: 'premium', name: 'Premium', price: 799, features: ['Unlimited chats', 'Voice messages'] },
          ],
        },
      },
    }),
  },
  paymentApi: {
    createOrder: vi.fn().mockResolvedValue({
      data: { data: { orderId: 'order_123', amount: 799, currency: 'INR', keyId: 'key_test' } },
    }),
    verifyPayment: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import UserSubscription from '../UserSubscription';

const preloadedState = {
  auth: {
    user: { id: 'u1', name: 'Test User', subscription: { plan: 'FREE' } } as any,
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('UserSubscription', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    expect(screen.getByTestId('dashboard-loader')).toBeInTheDocument();
  });

  it('renders subscription page after data loads', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
  });

  it('renders the Subscription heading', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Subscription')).toBeInTheDocument();
    });
  });

  it('renders the Current Plan card', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Current Plan')).toBeInTheDocument();
    });
  });

  it('renders Manage your subscription plan subtitle', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Manage your subscription plan/i)).toBeInTheDocument();
    });
  });

  it('renders Premium Benefits card', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Premium Benefits')).toBeInTheDocument();
    });
  });

  it('renders premium plan features from API response', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Unlimited chats')).toBeInTheDocument();
    });
    expect(screen.getByText('Voice messages')).toBeInTheDocument();
  });

  it('renders Upgrade to Premium button for FREE plan users', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Upgrade to Premium/i)).toBeInTheDocument();
    });
  });

  it('shows ACTIVE status tag for active subscription', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });
  });

  it('renders Usage Today section with messages count', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Usage Today')).toBeInTheDocument();
    });
    expect(screen.getByText(/Messages:/i)).toBeInTheDocument();
  });

  it('renders Cancel Subscription button for premium users', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          subscription: { plan: 'PREMIUM', status: 'ACTIVE', currentPeriodEnd: '2026-12-31T00:00:00.000Z' },
          usage: null,
        },
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Cancel Subscription')).toBeInTheDocument();
    });
  });

  it('shows no plan details message when plan features are empty', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getPlans as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: [] },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Plan details are not available right now/i)).toBeInTheDocument();
    });
  });

  it('renders the Free plan name from API', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      // Plan name derived from subscription.plan = 'FREE' → "Free"
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
  });

  it('renders Messages usage row in Usage Today section', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Messages:\s*0/i)).toBeInTheDocument();
    });
  });

  it('renders premium plan Unlimited chats feature from plans API response', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      // Premium Benefits card shows premium plan features: Unlimited chats
      expect(screen.getByText('Unlimited chats')).toBeInTheDocument();
    });
  });

  it('renders the upgrade button label including the premium price', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      // upgradeLabel includes "₹799" from the Premium plan price
      expect(screen.getByText(/799/)).toBeInTheDocument();
    });
  });

  it('shows "Out of tokens" tag when premium user has zero token balance', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          subscription: { plan: 'PREMIUM', status: 'ACTIVE' },
          usage: { tokens: { used: 1000, limit: 1000, balance: 0, grant: 1000 }, messages: { used: 50, limit: 500 } },
        },
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Out of tokens')).toBeInTheDocument();
    });
  });

  it('renders the Usage Today section in the Current Plan card', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Usage Today')).toBeInTheDocument();
    });
  });

  it('does not render Cancel Subscription button for a FREE plan user', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByText('Cancel Subscription')).not.toBeInTheDocument();
    });
  });

  it('renders the crown icon area (CrownOutlined) in the Current Plan card', async () => {
    const { container } = renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Current Plan')).toBeInTheDocument();
    });
    // CrownOutlined renders as an svg with aria-label or role img — or at minimum a span.anticon
    expect(container.querySelector('.anticon-crown')).toBeTruthy();
  });

  it('renders the Premium Benefits card title', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Premium Benefits')).toBeInTheDocument();
    });
  });

  it('renders the Voice messages feature from the premium plan', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Voice messages')).toBeInTheDocument();
    });
  });

  it('renders Renews label when premium subscription has a currentPeriodEnd', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          subscription: { plan: 'PREMIUM', status: 'ACTIVE', currentPeriodEnd: '2026-12-31T00:00:00.000Z' },
          usage: null,
        },
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Renews:/i)).toBeInTheDocument();
    });
  });

  it('renders the Renew Premium button when premium user is out of tokens', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          subscription: { plan: 'PREMIUM', status: 'ACTIVE' },
          usage: { tokens: { used: 1000, limit: 1000, balance: 0, grant: 1000 }, messages: { used: 50, limit: 500 } },
        },
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Renew Premium')).toBeInTheDocument();
    });
  });

  it('renders token balance and grant values for premium users with token data', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          subscription: { plan: 'PREMIUM', status: 'ACTIVE' },
          usage: { tokens: { balance: 8000, grant: 10000 }, messages: { used: 5, limit: 500 } },
        },
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/8,000/)).toBeInTheDocument();
      expect(screen.getByText(/10,000 tokens/)).toBeInTheDocument();
    });
  });

  it('renders Token Balance label for premium users with token data', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          subscription: { plan: 'PREMIUM', status: 'ACTIVE' },
          usage: { tokens: { balance: 5000, grant: 10000 }, messages: { used: 0, limit: 500 } },
        },
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Token Balance')).toBeInTheDocument();
    });
  });

  it('renders burn per message label when tokensPerMessage is provided', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          subscription: { plan: 'PREMIUM', status: 'ACTIVE' },
          usage: { tokens: { balance: 5000, grant: 10000, perMessage: 100 }, messages: { used: 0, limit: 500 } },
        },
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Burn per message/i)).toBeInTheDocument();
    });
  });

  it('renders grant date label when tokenGrantedAt is provided', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          subscription: { plan: 'PREMIUM', status: 'ACTIVE' },
          usage: { tokens: { balance: 5000, grant: 10000, grantedAt: '2026-01-01T00:00:00.000Z' }, messages: { used: 0, limit: 500 } },
        },
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Grant date/i)).toBeInTheDocument();
    });
  });

  it('shows error status tag when subscription status is CANCELLED', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          subscription: { plan: 'FREE', status: 'CANCELLED' },
          usage: null,
        },
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('CANCELLED')).toBeInTheDocument();
    });
  });

  it('renders UNKNOWN status when subscription has no status', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          subscription: { plan: 'FREE' },
          usage: null,
        },
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    });
  });

  it('renders plan features from flat array in data.data (not nested under plans)', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getPlans as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'free', name: 'Free', price: 0, features: ['3 chats/day'] },
          { id: 'premium', name: 'Premium', price: 599, features: ['Unlimited chats', 'Analytics'] },
        ],
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });

  it('does not render out-of-tokens message when premium user has positive token balance', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          subscription: { plan: 'PREMIUM', status: 'ACTIVE' },
          usage: { tokens: { balance: 5000, grant: 10000 }, messages: { used: 5, limit: 500 } },
        },
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.queryByText('Out of tokens')).not.toBeInTheDocument();
    });
  });

  it('displays upgrade label with price from premium plan data', async () => {
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      // upgradeLabel is built from premiumPriceLabel which includes price 799
      expect(screen.getByText(/Upgrade to Premium/i)).toBeInTheDocument();
    });
  });

  it('handles getDetails API error gracefully and still renders after load', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      // After error, loading becomes false so loader disappears
      expect(screen.queryByTestId('dashboard-loader')).not.toBeInTheDocument();
    });
  });

  it('handles getPlans API error and shows plan details unavailable message', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getPlans as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Plans error'));
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText(/Plan details are not available right now/i)).toBeInTheDocument();
    });
  });

  it('Cancel Subscription button click triggers confirmation modal', async () => {
    const { subscriptionApi } = await import('../../../services/api');
    (subscriptionApi.getDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          subscription: { plan: 'PREMIUM', status: 'ACTIVE', currentPeriodEnd: '2026-12-31T00:00:00.000Z' },
          usage: null,
        },
      },
    });
    renderWithProviders(<UserSubscription />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('Cancel Subscription')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Cancel Subscription'));
    await waitFor(() => {
      // Ant Design Modal.confirm renders the title text; getAllByText handles duplicates
      expect(screen.getAllByText(/Cancel Subscription\?/i).length).toBeGreaterThan(0);
    });
  });
});
