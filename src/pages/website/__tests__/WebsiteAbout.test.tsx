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

  it('renders hero section', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getAllByText(/Fitness Journey/i)[0]).toBeInTheDocument();
    expect(screen.getByText('Find an Expert')).toBeInTheDocument();
    expect(screen.getByText('Create Your AI')).toBeInTheDocument();
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

  it('renders all four core value icons', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByTestId('icon-target')).toBeInTheDocument();
    expect(screen.getByTestId('icon-heart')).toBeInTheDocument();
    expect(screen.getByTestId('icon-award')).toBeInTheDocument();
    expect(screen.getByTestId('icon-zap')).toBeInTheDocument();
  });

  it('renders core values descriptions', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText(/committed to transforming lives/i)).toBeInTheDocument();
    expect(screen.getByText(/Every member is unique/i)).toBeInTheDocument();
  });

  it('renders impact stat labels', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText('Active Members')).toBeInTheDocument();
    expect(screen.getByText('Questions Answered')).toBeInTheDocument();
    expect(screen.getByText('Expert Creators')).toBeInTheDocument();
    expect(screen.getByText('Satisfaction Rate')).toBeInTheDocument();
  });

  it('renders impact stat icons', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByTestId('icon-users')).toBeInTheDocument();
    expect(screen.getByTestId('icon-trending')).toBeInTheDocument();
    expect(screen.getByTestId('icon-star')).toBeInTheDocument();
    expect(screen.getByTestId('icon-globe')).toBeInTheDocument();
  });

  it('renders all team members', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText('Emily Rodriguez')).toBeInTheDocument();
    expect(screen.getByText('David Kim')).toBeInTheDocument();
  });

  it('renders team member roles', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText('Founder & Head Coach')).toBeInTheDocument();
    expect(screen.getByText('Nutrition Director')).toBeInTheDocument();
    expect(screen.getByText('Community Manager')).toBeInTheDocument();
    expect(screen.getByText('Performance Coach')).toBeInTheDocument();
  });

  it('renders all timeline milestones', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText('2019')).toBeInTheDocument();
    expect(screen.getByText('1,000 Members')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
    expect(screen.getByText('App Launch')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('Global Expansion')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('50K+ Community')).toBeInTheDocument();
  });

  it('renders hero paragraph text', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText(/everyone deserves access to world-class fitness/i)).toBeInTheDocument();
  });

  it('renders section subtitles', () => {
    renderWithProviders(<WebsiteAbout />);
    expect(screen.getByText('The principles that guide everything we do')).toBeInTheDocument();
    expect(screen.getByText('Numbers that reflect our commitment to your success')).toBeInTheDocument();
    expect(screen.getByText('The experts dedicated to your success')).toBeInTheDocument();
    expect(screen.getByText('Key milestones in our growth story')).toBeInTheDocument();
  });
});
