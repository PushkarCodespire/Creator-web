import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  subscriptionApi: {
    getCurrent: vi.fn().mockResolvedValue({ data: { data: { plan: 'FREE' } } }),
  },
  getImageUrl: vi.fn((p: string) => p),
}));

import WebsitePricing from '../WebsitePricing';

describe('WebsitePricing', () => {
  it('renders without crashing', () => {
    renderWithProviders(<WebsitePricing />);
    expect(screen.getByText('Choose Your Fitness Plan')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderWithProviders(<WebsitePricing />);
    expect(screen.getByText(/Start your transformation today/i)).toBeInTheDocument();
  });

  it('renders all three plan cards', () => {
    renderWithProviders(<WebsitePricing />);
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Elite')).toBeInTheDocument();
  });

  it('renders plan prices', () => {
    renderWithProviders(<WebsitePricing />);
    expect(screen.getByText('₹0')).toBeInTheDocument();
    expect(screen.getByText('₹499')).toBeInTheDocument();
    expect(screen.getByText('₹1,499')).toBeInTheDocument();
  });

  it('renders plan CTA buttons', () => {
    renderWithProviders(<WebsitePricing />);
    expect(screen.getByText('Start Free')).toBeInTheDocument();
    expect(screen.getByText('Start Premium')).toBeInTheDocument();
    expect(screen.getByText('Go Elite')).toBeInTheDocument();
  });

  it('renders plan features', () => {
    renderWithProviders(<WebsitePricing />);
    expect(screen.getByText(/5 free messages/i)).toBeInTheDocument();
    expect(screen.getByText(/2,000 tokens\/month/i)).toBeInTheDocument();
    expect(screen.getByText(/10,000 tokens\/month/i)).toBeInTheDocument();
  });

  it('renders elite plan features', () => {
    renderWithProviders(<WebsitePricing />);
    expect(screen.getByText(/1-on-1 coaching access/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom AI experience/i)).toBeInTheDocument();
  });

  it('renders premium plan features', () => {
    renderWithProviders(<WebsitePricing />);
    expect(screen.getByText(/All creator access/i)).toBeInTheDocument();
    expect(screen.getByText(/Full chat history/i)).toBeInTheDocument();
  });

  it('renders starter plan features', () => {
    renderWithProviders(<WebsitePricing />);
    expect(screen.getByText(/Community support/i)).toBeInTheDocument();
    expect(screen.getByText(/Basic access/i)).toBeInTheDocument();
  });

  it('clicking Start Free button saves selectedPlan to localStorage', () => {
    renderWithProviders(<WebsitePricing />);
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
    fireEvent.click(screen.getByText('Start Free'));
    expect(storageSpy).toHaveBeenCalledWith('selectedPlan', 'starter');
    storageSpy.mockRestore();
  });

  it('clicking Start Premium button saves selectedPlan to localStorage', () => {
    renderWithProviders(<WebsitePricing />);
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
    fireEvent.click(screen.getByText('Start Premium'));
    expect(storageSpy).toHaveBeenCalledWith('selectedPlan', 'premium');
    storageSpy.mockRestore();
  });

  it('shows "Current Plan" badge and disables button when authenticated user is on FREE plan', async () => {
    renderWithProviders(<WebsitePricing />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'test@test.com', role: 'USER' },
          token: 'tok',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    await waitFor(() => {
      expect(screen.getByText('✓ Current Plan')).toBeInTheDocument();
    });
    // The button for the current plan should be disabled and show "Current Plan"
    const currentPlanButtons = screen.getAllByRole('button', { name: 'Current Plan' });
    expect(currentPlanButtons[0]).toBeDisabled();
  });

  it('renders three plan CTA buttons total', () => {
    renderWithProviders(<WebsitePricing />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('renders Priority support feature text twice (premium and elite both have it)', () => {
    renderWithProviders(<WebsitePricing />);
    const prioritySupport = screen.getAllByText(/Priority support/i);
    expect(prioritySupport).toHaveLength(2);
  });
});
