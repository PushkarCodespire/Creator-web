import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
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
});
