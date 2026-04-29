import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ReferralProgram } from '../ReferralProgram';

const authState = {
  preloadedState: {
    auth: {
      user: { id: 'user-abc-123', name: 'Test User', email: 'u@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
      token: 'tok', isAuthenticated: true, isLoading: false, error: null,
    },
  },
};

describe('ReferralProgram', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ReferralProgram />, authState);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with no user', () => {
    const { container } = renderWithProviders(<ReferralProgram />, {
      preloadedState: { auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null } },
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Referral Program title', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('Referral Program')).toBeInTheDocument();
  });

  it('renders Invite Friends heading', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('Invite Friends, Earn Rewards')).toBeInTheDocument();
  });

  it('renders Total Referrals stat', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('Total Referrals')).toBeInTheDocument();
  });

  it('renders Copy button', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('renders Share button', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('renders How it works section', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('How it works:')).toBeInTheDocument();
  });

  it('renders Active stat label', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders Rewards Earned stat label', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('Rewards Earned')).toBeInTheDocument();
  });

  it('renders Your Referral Link label', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('Your Referral Link:')).toBeInTheDocument();
  });

  it('renders referral URL input with register path', () => {
    renderWithProviders(<ReferralProgram />, authState);
    const input = screen.getByDisplayValue(/\/register\?ref=/i);
    expect(input).toBeInTheDocument();
  });

  it('renders first how-it-works list item', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('Share your unique referral link with friends')).toBeInTheDocument();
  });

  it('renders second how-it-works list item', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('They sign up using your link')).toBeInTheDocument();
  });

  it('renders third how-it-works list item about rewards', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('You both earn rewards when they become active users')).toBeInTheDocument();
  });

  it('renders fourth how-it-works list item about tracking', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('Track your referrals and earnings in real-time')).toBeInTheDocument();
  });

  it('renders the referral invite friends description paragraph', () => {
    renderWithProviders(<ReferralProgram />, authState);
    expect(screen.getByText('Share your referral link and earn rewards when friends sign up!')).toBeInTheDocument();
  });

  it('uses user id prefix as referral code when user exists', () => {
    renderWithProviders(<ReferralProgram />, authState);
    // user id is 'user-abc-123' → first 8 chars uppercased = 'USER-ABC'
    const input = screen.getByDisplayValue(/USER-ABC/i);
    expect(input).toBeInTheDocument();
  });

  it('uses REFERRAL as referral code when no user', () => {
    renderWithProviders(<ReferralProgram />, {
      preloadedState: { auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null } },
    });
    const input = screen.getByDisplayValue(/REFERRAL/);
    expect(input).toBeInTheDocument();
  });
});
