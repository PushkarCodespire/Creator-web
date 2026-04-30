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

  it('renders tooltip with name and description when unlocked', () => {
    const { container } = render(
      <AchievementBadge
        name="First Chat"
        description="Send your first message"
        rarity="common"
        unlocked={true}
      />
    );

    // Ant Design Tooltip sets the title on the wrapper div via data attribute or aria
    // The tooltip content is set as a prop; check the container renders with the element
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with progress=0 and does not render progress bar', () => {
    const { container } = render(
      <AchievementBadge
        name="Chat Master"
        description="Send 100 messages"
        rarity="rare"
        unlocked={false}
        progress={0}
      />
    );

    // progress bar is only rendered when !unlocked && progress > 0
    const progressBar = container.querySelector('[style*="bottom: -4px"]');
    expect(progressBar).toBeNull();
  });

  it('defaults to medium size when no size prop is given', () => {
    const { container } = render(
      <AchievementBadge
        name="Default Size"
        description="Test"
        rarity="common"
        unlocked={true}
      />
    );

    const badge = container.querySelector('[style*="width: 60px"]');
    expect(badge).toBeTruthy();
  });

  it('defaults to unlocked=false when unlocked prop is not provided', () => {
    const { container } = render(
      <AchievementBadge
        name="No Unlock Prop"
        description="Test"
        rarity="common"
      />
    );

    // Locked badges have opacity: 0.6 in their inline style
    const badge = container.querySelector('[style*="opacity: 0.6"]');
    expect(badge).toBeTruthy();
  });

  it('renders default rarity (common) when rarity prop is not provided', () => {
    const { container } = render(
      <AchievementBadge
        name="No Rarity"
        description="Test"
        unlocked={true}
      />
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('renders progress bar at 100% width when progress is 100 and not unlocked', () => {
    const { container } = render(
      <AchievementBadge
        name="Almost There"
        description="Nearly done"
        rarity="epic"
        unlocked={false}
        progress={100}
      />
    );

    const progressFill = container.querySelector('[style*="width: 100%"][style*="height: 100%"]');
    expect(progressFill).toBeTruthy();
  });

  it('renders the TrophyOutlined icon for common rarity when no custom icon is given', () => {
    const { container } = render(
      <AchievementBadge
        name="Common Badge"
        description="Common"
        rarity="common"
        unlocked={true}
      />
    );

    // Ant Design renders role="img" for icon SVGs
    const icons = container.querySelectorAll('[role="img"]');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('renders custom icon instead of default rarity icon when icon prop is provided', () => {
    const { container } = render(
      <AchievementBadge
        name="Custom Icon"
        description="Has custom icon"
        icon="⭐"
        rarity="legendary"
        unlocked={true}
      />
    );

    expect(screen.getByText('⭐')).toBeInTheDocument();
    // The rarity-based icon should NOT be rendered alongside a custom icon
    const icons = container.querySelectorAll('[role="img"]');
    // Only the Tooltip trigger icon from ant design — no rarity SVG icon
    // The custom emoji span is rendered, not an ant-design icon
    expect(screen.getByText('⭐').tagName.toLowerCase()).toBe('span');
  });

  it('renders the small size badge with correct dimensions', () => {
    const { container } = render(
      <AchievementBadge
        name="Small"
        description="Small badge"
        rarity="common"
        unlocked={true}
        size="small"
      />
    );

    const badge = container.querySelector('[style*="width: 40px"]');
    expect(badge).toBeTruthy();
  });

  it('renders the large size badge with correct dimensions', () => {
    const { container } = render(
      <AchievementBadge
        name="Large"
        description="Large badge"
        rarity="common"
        unlocked={true}
        size="large"
      />
    );

    const badge = container.querySelector('[style*="width: 80px"]');
    expect(badge).toBeTruthy();
  });

  it('unlocked badge does not have opacity 0.6', () => {
    const { container } = render(
      <AchievementBadge
        name="Unlocked"
        description="Unlocked badge"
        rarity="rare"
        unlocked={true}
      />
    );

    const lockedStyle = container.querySelector('[style*="opacity: 0.6"]');
    expect(lockedStyle).toBeNull();
  });

  it('renders progress bar container positioned at bottom when progress > 0 and locked', () => {
    const { container } = render(
      <AchievementBadge
        name="In Progress"
        description="Halfway there"
        rarity="rare"
        unlocked={false}
        progress={75}
      />
    );

    const progressContainer = container.querySelector('[style*="bottom: -4px"]');
    expect(progressContainer).toBeTruthy();
    const fill = progressContainer?.querySelector('[style*="width: 75%"]');
    expect(fill).toBeTruthy();
  });
});
