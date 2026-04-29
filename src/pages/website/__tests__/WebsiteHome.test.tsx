import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { post: vi.fn().mockResolvedValue({ data: { message: 'Subscribed!' } }) },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../components/CreatorsGrid', () => ({
  CreatorsGrid: () => <div data-testid="creators-grid">Creators Grid</div>,
}));

vi.mock('../components/CountdownTimer', () => ({
  CountdownTimer: (props: any) => <span {...props}>00:00</span>,
}));

vi.mock('../data/config', () => ({
  getBackendIdForSlug: vi.fn(() => 'mock-id'),
}));

import WebsiteHome from '../WebsiteHome';

describe('WebsiteHome', () => {
  it('renders without crashing', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText(/Chat with your favourite/i)).toBeInTheDocument();
  });

  it('renders hero section with CTA', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText(/Find right expert/i)).toBeInTheDocument();
  });

  it('renders category chips', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText('Fat loss')).toBeInTheDocument();
    expect(screen.getByText('Muscle gain')).toBeInTheDocument();
  });

  it('renders media logos section', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText('Creator pal in media')).toBeInTheDocument();
  });

  it('renders newsletter section', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });

  it('renders testimonials section', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText('TESTIMONIALS')).toBeInTheDocument();
    expect(screen.getByText('Robert Fox')).toBeInTheDocument();
  });

  it('renders bottom CTA with countdown', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText(/Claim your free chat/i)).toBeInTheDocument();
  });

  it('renders CreatorsGrid component', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByTestId('creators-grid')).toBeInTheDocument();
  });

  it('renders all five category chips', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText('PCOS')).toBeInTheDocument();
    expect(screen.getByText('Gut health')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('renders Expert guidance for following section heading', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText('Expert guidance for following')).toBeInTheDocument();
  });

  it('renders Interact section heading', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText("Interact, don't just consume.")).toBeInTheDocument();
  });

  it('renders interact bullet points', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText('Secrets from real creator experience revealed')).toBeInTheDocument();
    expect(screen.getByText('Personalized advice for your body, goals & lifestyle')).toBeInTheDocument();
  });

  it('renders newsletter section subtitle', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText('Get free creator insights and deals')).toBeInTheDocument();
  });

  it('renders newsletter main heading', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText(/Top creator insights/i)).toBeInTheDocument();
  });

  it('renders testimonials real outcomes heading', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText('Real outcomes from creator guidance')).toBeInTheDocument();
  });

  it('renders Robert Fox role label Manager', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('renders bottom CTA link pointing to /pricing', () => {
    renderWithProviders(<WebsiteHome />);
    const link = screen.getByText(/Claim your free chat/i).closest('a');
    expect(link).toHaveAttribute('href', '/pricing');
  });

  it('renders Expires soon text', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText(/Expires soon/i)).toBeInTheDocument();
  });

  it('renders CountdownTimer component', () => {
    renderWithProviders(<WebsiteHome />);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });
});
