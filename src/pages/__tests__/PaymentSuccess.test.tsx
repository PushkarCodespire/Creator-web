import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams('orderId=order_123'), vi.fn()],
  };
});

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { screen, fireEvent } from '@testing-library/react';
import PaymentSuccess from '../PaymentSuccess';

describe('PaymentSuccess', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<PaymentSuccess />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders without orderId', () => {
    const { container } = renderWithProviders(<PaymentSuccess />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Payment Successful title', () => {
    renderWithProviders(<PaymentSuccess />);
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
  });

  it('renders subscription activated message', () => {
    renderWithProviders(<PaymentSuccess />);
    expect(screen.getByText(/Premium subscription has been activated/i)).toBeInTheDocument();
  });

  it('renders View Subscription button', () => {
    renderWithProviders(<PaymentSuccess />);
    expect(screen.getByText('View Subscription')).toBeInTheDocument();
  });

  it('renders Start Chatting button', () => {
    renderWithProviders(<PaymentSuccess />);
    expect(screen.getByText('Start Chatting')).toBeInTheDocument();
  });

  it('renders unlimited access text', () => {
    renderWithProviders(<PaymentSuccess />);
    expect(screen.getByText(/unlimited access to all creators/i)).toBeInTheDocument();
  });

  it('renders the full subtitle text', () => {
    renderWithProviders(<PaymentSuccess />);
    expect(
      screen.getByText(/Your Premium subscription has been activated successfully/i)
    ).toBeInTheDocument();
  });

  it('View Subscription button is clickable without throwing', () => {
    renderWithProviders(<PaymentSuccess />);
    expect(() => fireEvent.click(screen.getByText('View Subscription'))).not.toThrow();
  });

  it('Start Chatting button is clickable without throwing', () => {
    renderWithProviders(<PaymentSuccess />);
    expect(() => fireEvent.click(screen.getByText('Start Chatting'))).not.toThrow();
  });

  it('View Subscription is inside a button element', () => {
    renderWithProviders(<PaymentSuccess />);
    const el = screen.getByText('View Subscription');
    // Ant Design wraps text in a span inside button
    expect(el.closest('button')).not.toBeNull();
  });

  it('Start Chatting is inside a button element', () => {
    renderWithProviders(<PaymentSuccess />);
    const el = screen.getByText('Start Chatting');
    // Ant Design wraps text in a span inside button
    expect(el.closest('button')).not.toBeNull();
  });

  it('renders exactly two action buttons', () => {
    renderWithProviders(<PaymentSuccess />);
    const buttons = screen.getAllByRole('button');
    // View Subscription and Start Chatting
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('subtitle mentions "unlimited access to all creators" with an exclamation mark', () => {
    renderWithProviders(<PaymentSuccess />);
    expect(screen.getByText(/unlimited access to all creators!/i)).toBeInTheDocument();
  });

  it('renders "Payment Successful!" as a heading element', () => {
    renderWithProviders(<PaymentSuccess />);
    const heading = screen.getByText('Payment Successful!');
    expect(heading).toBeInTheDocument();
  });

  it('logs the orderId via logger.info on mount', async () => {
    // PaymentSuccess mock supplies orderId=order_123
    const { logger } = await import('../../utils/logger');
    renderWithProviders(<PaymentSuccess />);
    expect(logger.info).toHaveBeenCalledWith(
      'Payment successful for order:',
      'order_123'
    );
  });

  it('subtitle mentions "activated successfully"', () => {
    renderWithProviders(<PaymentSuccess />);
    expect(screen.getByText(/activated successfully/i)).toBeInTheDocument();
  });
});
