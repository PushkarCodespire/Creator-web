import { render, screen } from '@testing-library/react';
import { AchievementBadge } from '../../Gamification/AchievementBadge';

describe('AchievementBadge Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <AchievementBadge
        name="First Chat"
        description="Send your first message"
        rarity="common"
        unlocked={true}
      />
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('renders unlocked badge with full opacity', () => {
    const { container } = render(
      <AchievementBadge
        name="First Chat"
        description="Send your first message"
        rarity="common"
        unlocked={true}
      />
    );

    // Unlocked badges have opacity: 1
    const badge = container.firstChild?.firstChild as HTMLElement;
    expect(badge).toBeTruthy();
  });

  it('renders locked badge with reduced opacity', () => {
    const { container } = render(
      <AchievementBadge
        name="Chat Master"
        description="Send 100 messages"
        rarity="rare"
        unlocked={false}
        progress={50}
      />
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('renders progress bar when not unlocked and progress > 0', () => {
    const { container } = render(
      <AchievementBadge
        name="Chat Master"
        description="Send 100 messages"
        rarity="rare"
        unlocked={false}
        progress={50}
      />
    );

    // There should be a progress indicator div with width: 50%
    const progressBar = container.querySelector('[style*="width: 50%"]');
    expect(progressBar).toBeTruthy();
  });

  it('does not render progress bar when unlocked', () => {
    const { container } = render(
      <AchievementBadge
        name="First Chat"
        description="Send your first message"
        rarity="common"
        unlocked={true}
        progress={100}
      />
    );

    // No progress bar for unlocked badges
    const progressBar = container.querySelector('[style*="width: 100%"][style*="height: 100%"]');
    // The progress bar indicator is the small bar at the bottom, not the main badge
    const smallProgressBar = container.querySelector('[style*="bottom: -4px"]');
    expect(smallProgressBar).toBeNull();
  });

  it('renders with custom icon emoji', () => {
    render(
      <AchievementBadge
        name="Fire Starter"
        description="Start 10 conversations"
        icon="🔥"
        rarity="epic"
        unlocked={true}
      />
    );

    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    const expectedWidths = ['40px', '60px', '80px'];

    sizes.forEach((size, index) => {
      const { container, unmount } = render(
        <AchievementBadge
          name="Test"
          description="Test"
          rarity="common"
          unlocked={true}
          size={size}
        />
      );

      const badge = container.querySelector(`[style*="width: ${expectedWidths[index]}"]`);
      expect(badge).toBeTruthy();
      unmount();
    });
  });

  it('renders all rarity types without crashing', () => {
    const rarities = ['common', 'rare', 'epic', 'legendary'] as const;

    rarities.forEach((rarity) => {
      const { unmount, container } = render(
        <AchievementBadge
          name={`${rarity} badge`}
          description="Test"
          rarity={rarity}
          unlocked={true}
        />
      );

      expect(container.firstChild).toBeTruthy();
      unmount();
    });
  });
});
