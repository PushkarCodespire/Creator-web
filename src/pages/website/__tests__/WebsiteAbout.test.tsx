import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('lucide-react', () => ({
  Target: () => <span data-testid="icon-target" />,
  Users: () => <span data-testid="icon-users" />,
  Award: () => <span data-testid="icon-award" />,
  Zap: () => <span data-testid="icon-zap" />,
  Heart: () => <span data-testid="icon-heart" />,
  TrendingUp: () => <span data-testid="icon-trending" />,
  Globe: () => <span data-testid="icon-globe" />,
  Star: () => <span data-testid="icon-star" />,
}));

import WebsiteAbout from '../WebsiteAbout';

describe('WebsiteAbout', () => {
  it('renders without crashing', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText(/Empowering Your/i)).toBeInTheDocument();
  });

  it('renders core values section', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText('Our Core Values')).toBeInTheDocument();
    expect(screen.getByText('Mission-Driven')).toBeInTheDocument();
    expect(screen.getByText('People First')).toBeInTheDocument();
    expect(screen.getByText('Excellence')).toBeInTheDocument();
    expect(screen.getByText('Innovation')).toBeInTheDocument();
  });

  it('renders impact stats', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText('Our Impact')).toBeInTheDocument();
    expect(screen.getByText('50,000+')).toBeInTheDocument();
    expect(screen.getByText('2M+')).toBeInTheDocument();
    expect(screen.getByText('150+')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('renders team section', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText('Meet Our Team')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Michael Chen')).toBeInTheDocument();
  });

  it('renders journey timeline', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText('Our Journey')).toBeInTheDocument();
    expect(screen.getByText('2018')).toBeInTheDocument();
    expect(screen.getByText('Founded')).toBeInTheDocument();
  });

  it('renders bottom CTA', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText(/Ready to Transform Your Life/i)).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('View Pricing')).toBeInTheDocument();
  });
});
