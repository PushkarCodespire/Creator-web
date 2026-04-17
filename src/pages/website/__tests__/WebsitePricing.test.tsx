import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
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
});
