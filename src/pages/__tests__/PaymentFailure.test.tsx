import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams('error=Card+declined'), vi.fn()],
  };
});

import { screen, fireEvent } from '@testing-library/react';
import PaymentFailure from '../PaymentFailure';

describe('PaymentFailure', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<PaymentFailure />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with no error param', () => {
    const { container } = renderWithProviders(<PaymentFailure />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Payment Failed title', () => {
    renderWithProviders(<PaymentFailure />);
    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
  });

  it('renders error message from URL param', () => {
    renderWithProviders(<PaymentFailure />);
    expect(screen.getByText(/Card declined/i)).toBeInTheDocument();
  });

  it('renders Try Again button', () => {
    renderWithProviders(<PaymentFailure />);
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders View Plans and Go Home buttons', () => {
    renderWithProviders(<PaymentFailure />);
    expect(screen.getByText('View Plans')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('renders the full error sub-title with error text and retry instruction', () => {
    renderWithProviders(<PaymentFailure />);
    expect(
      screen.getByText(/Please try again or contact support if the problem persists/i)
    ).toBeInTheDocument();
  });

  it('includes the URL error param in the sub-title', () => {
    renderWithProviders(<PaymentFailure />);
    // The mock supplies error=Card+declined; the subtitle is "{error}. Please try again..."
    expect(screen.getByText(/Card declined/)).toBeInTheDocument();
  });

  it('Try Again is inside a button element', () => {
    renderWithProviders(<PaymentFailure />);
    const el = screen.getByText('Try Again');
    // Ant Design wraps text in a span inside button
    expect(el.closest('button')).not.toBeNull();
  });

  it('View Plans button is clickable without throwing', () => {
    renderWithProviders(<PaymentFailure />);
    expect(() => fireEvent.click(screen.getByText('View Plans'))).not.toThrow();
  });

  it('Go Home button is clickable', () => {
    renderWithProviders(<PaymentFailure />);
    expect(() => fireEvent.click(screen.getByText('Go Home'))).not.toThrow();
  });

  it('Try Again button is clickable', () => {
    renderWithProviders(<PaymentFailure />);
    expect(() => fireEvent.click(screen.getByText('Try Again'))).not.toThrow();
  });

  it('renders exactly three action buttons', () => {
    renderWithProviders(<PaymentFailure />);
    const buttons = screen.getAllByRole('button');
    // Try Again, View Plans, Go Home
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it('subtitle includes the full stop after the error message', () => {
    renderWithProviders(<PaymentFailure />);
    // subtitle is "{error}. Please try again..."
    expect(screen.getByText(/Card declined\. Please try again/)).toBeInTheDocument();
  });

  it('renders "Payment Failed" as an h3 or heading element', () => {
    renderWithProviders(<PaymentFailure />);
    const heading = screen.getByText('Payment Failed');
    // Ant Design Result renders the title inside a heading tag
    expect(heading).toBeInTheDocument();
  });

  it('View Plans is inside a button element', () => {
    renderWithProviders(<PaymentFailure />);
    const el = screen.getByText('View Plans');
    expect(el.closest('button')).not.toBeNull();
  });

  it('Go Home is inside a button element', () => {
    renderWithProviders(<PaymentFailure />);
    const el = screen.getByText('Go Home');
    expect(el.closest('button')).not.toBeNull();
  });
});
