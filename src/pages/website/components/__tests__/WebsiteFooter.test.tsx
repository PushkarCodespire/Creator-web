vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...p }: any) => <a href={to} {...p}>{children}</a>,
  };
});

vi.mock('../../WebsiteHome.module.css', () => ({ default: {} }));

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { WebsiteFooter } from '../WebsiteFooter';

describe('WebsiteFooter', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<WebsiteFooter />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders "Contact Us" heading', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('renders "Quick Links" heading', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
  });

  it('renders "Social" heading', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByText('Social')).toBeInTheDocument();
  });

  it('renders Quick Links navigation items', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Find Expert')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('renders copyright text', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByText(/CreatorPal\. All rights reserved\./)).toBeInTheDocument();
  });

  it('renders "Browse Experts" CTA link', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByText('Browse Experts')).toBeInTheDocument();
  });

  it('renders contact email link', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByText('raghav@peakpals.in')).toBeInTheDocument();
  });

  it('renders phone number contact link', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByText('9958092012')).toBeInTheDocument();
  });

  it('renders the office address text', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByText(/Noida, Uttar Pradesh/i)).toBeInTheDocument();
  });

  it('renders "Create Your AI" quick link', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByText('Create Your AI')).toBeInTheDocument();
  });

  it('renders LinkedIn social link with aria-label', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });

  it('renders Instagram social link with aria-label', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
  });

  it('email link has correct href attribute', () => {
    renderWithProviders(<WebsiteFooter />);
    const emailLink = screen.getByText('raghav@peakpals.in').closest('a');
    expect(emailLink).toHaveAttribute('href', 'mailto:raghav@peakpals.in');
  });

  it('phone link has correct href attribute', () => {
    renderWithProviders(<WebsiteFooter />);
    const phoneLink = screen.getByText('9958092012').closest('a');
    expect(phoneLink).toHaveAttribute('href', 'tel:9958092012');
  });

  it('renders the CreatorPal tagline text', () => {
    renderWithProviders(<WebsiteFooter />);
    expect(screen.getByText(/Turn your knowledge into an AI/i)).toBeInTheDocument();
  });
});
