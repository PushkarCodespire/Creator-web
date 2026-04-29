import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../components/Chat/UpgradeModal.css', () => ({}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import { screen } from '@testing-library/react';
import UpgradeModal from '../UpgradeModal';

describe('UpgradeModal', () => {
  it('renders without crashing when closed', () => {
    const { container } = renderWithProviders(
      <UpgradeModal visible={false} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(container).toBeTruthy();
  });

  it('renders when open with 0 remaining messages', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByText('Daily Message Limit Reached')).toBeInTheDocument();
  });

  it('renders when open with remaining messages', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={3} />
    );
    // "Upgrade to Premium" appears as both the heading and the CTA button
    expect(screen.getAllByText('Upgrade to Premium')[0]).toBeInTheDocument();
  });

  it('renders Free plan label', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('renders voice limit reason', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} reason="voice_limit" />
    );
    expect(screen.getByText('Voice Limit Reached')).toBeInTheDocument();
  });

  it('renders "Maybe Later" button when visible', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByRole('button', { name: /Maybe Later/i })).toBeInTheDocument();
  });

  it('calls onClose when "Maybe Later" is clicked', async () => {
    const onClose = vi.fn();
    renderWithProviders(
      <UpgradeModal visible={true} onClose={onClose} remainingMessages={0} />
    );
    screen.getByRole('button', { name: /Maybe Later/i }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders "RECOMMENDED" tag on the premium plan column', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByText('RECOMMENDED')).toBeInTheDocument();
  });

  it('renders the ₹499/month price for premium', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByText('₹499')).toBeInTheDocument();
  });

  it('renders the money-back guarantee text', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByText(/7-day money-back guarantee/i)).toBeInTheDocument();
  });

  it('shows remaining messages count when remainingMessages > 0 and no reason', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={5} />
    );
    expect(screen.getByText(/5 messages remaining today/i)).toBeInTheDocument();
  });

  it('shows singular "message" when remainingMessages is 1', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={1} />
    );
    expect(screen.getByText(/1 message remaining today/i)).toBeInTheDocument();
  });

  it('renders voice limit description text when reason is voice_limit', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} reason="voice_limit" />
    );
    // "2 free voice replies" appears in both the subtitle and the Free plan feature list
    expect(screen.getAllByText(/2 free voice replies/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders "Current Plan" label for the free plan column', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByText('Current Plan')).toBeInTheDocument();
  });

  it('renders "Upgrade To" label for the premium plan column', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByText('Upgrade To')).toBeInTheDocument();
  });

  it('renders /month price unit label', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByText('/month')).toBeInTheDocument();
  });

  it('renders "Great for getting started" free plan tagline', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByText('Great for getting started')).toBeInTheDocument();
  });

  it('renders "Unlimited messages" premium feature', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByText('Unlimited messages')).toBeInTheDocument();
  });

  it('renders "GPT-4 access" premium feature', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByText('GPT-4 access')).toBeInTheDocument();
  });

  it('renders "Cancel anytime" text in footer note', () => {
    renderWithProviders(
      <UpgradeModal visible={true} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.getByText(/Cancel anytime/i)).toBeInTheDocument();
  });

  it('does not render modal content when visible is false', () => {
    renderWithProviders(
      <UpgradeModal visible={false} onClose={vi.fn()} remainingMessages={0} />
    );
    expect(screen.queryByText('Daily Message Limit Reached')).not.toBeInTheDocument();
  });
});
