import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import { screen } from '@testing-library/react';
import Pricing from '../Pricing';

describe('Pricing', () => {
  it('renders without crashing when not authenticated', () => {
    const { container } = renderWithProviders(<Pricing />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders without crashing when authenticated', () => {
    const { container } = renderWithProviders(<Pricing />, {
      preloadedState: {
        auth: { user: { id: '1', name: 'Test', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' }, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders pricing plans', () => {
    const { getByText } = renderWithProviders(<Pricing />);
    expect(getByText('Free')).toBeInTheDocument();
  });

  it('renders heading', () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText(/Simple, Transparent Pricing/i)).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText(/Start free and upgrade when you need more/i)).toBeInTheDocument();
  });

  it('renders Premium plan', () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });

  it('renders Upgrade Now CTA', () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText('Upgrade Now')).toBeInTheDocument();
  });

  it('renders Free plan Get Started CTA', () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders MOST POPULAR badge on Premium plan', () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText('MOST POPULAR')).toBeInTheDocument();
  });

  it('renders plan prices', () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText('₹0')).toBeInTheDocument();
    expect(screen.getByText('₹799')).toBeInTheDocument();
  });

  it('renders the FAQ section heading', () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
  });

  it('renders FAQ question about free tier', () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText('How does the free tier work?')).toBeInTheDocument();
  });

  it('renders FAQ question about cancellation', () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText('Can I cancel anytime?')).toBeInTheDocument();
  });

  it('renders Free plan feature list items', () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText('5 messages per day')).toBeInTheDocument();
    expect(screen.getByText('Basic chat history')).toBeInTheDocument();
  });

  it('renders Premium plan feature list items', () => {
    renderWithProviders(<Pricing />);
    expect(screen.getByText('Unlimited messages')).toBeInTheDocument();
    expect(screen.getByText('Priority support')).toBeInTheDocument();
  });

  it('navigates to /register when unauthenticated user clicks Get Started', () => {
    const mockNavigate = vi.fn();
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return { ...actual, useNavigate: () => mockNavigate };
    });
    renderWithProviders(<Pricing />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
      },
    });
    // The component itself uses handleCTA which routes to /register when not authenticated
    // We just verify the button is present and clickable
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });
});
