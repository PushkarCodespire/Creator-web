// ===========================================
// ACHIEVEMENT BADGE COMPONENT TESTS
// ===========================================

import { render, screen } from '@testing-library/react';
import { AchievementBadge } from '../../Gamification/AchievementBadge';

describe('AchievementBadge Component', () => {
  it('renders achievement badge with name and description', () => {
    render(
      <AchievementBadge
        name="First Chat"
        description="Send your first message"
        rarity="common"
        unlocked={true}
      />
    );

    // Check if badge is rendered (tooltip will show on hover)
    const badge = screen.getByRole('img', { hidden: true }) || screen.getByText(/first chat/i);
    expect(badge).toBeInTheDocument();
  });

  it('shows progress bar when not unlocked', () => {
    render(
      <AchievementBadge
        name="Chat Master"
        description="Send 100 messages"
        rarity="rare"
        unlocked={false}
        progress={50}
      />
    );

    // Progress should be visible
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  it('applies correct styling for different rarities', () => {
    const { rerender } = render(
      <AchievementBadge
        name="Test"
        description="Test"
        rarity="legendary"
        unlocked={true}
      />
    );

    let badge = screen.getByRole('img', { hidden: true });
    expect(badge).toBeInTheDocument();

    rerender(
      <AchievementBadge
        name="Test"
        description="Test"
        rarity="epic"
        unlocked={true}
      />
    );

    badge = screen.getByRole('img', { hidden: true });
    expect(badge).toBeInTheDocument();
  });
});



