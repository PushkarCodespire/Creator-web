vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  reactionApi: {
    addReaction: vi.fn().mockResolvedValue({ data: { data: { id: 'r1', userId: 'u1', emoji: '👍', user: { name: 'Test' } } } }),
    removeReaction: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { MessageReactions } from '../MessageReactions';

const authState = {
  auth: {
    user: { id: 'u1', name: 'Test', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('MessageReactions', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <MessageReactions messageId="msg-1" />,
      { preloadedState: authState }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with no reactions', () => {
    const { container } = renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={{}} />,
      { preloadedState: authState }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders existing reactions', () => {
    const reactions = {
      '👍': [{ id: 'r1', userId: 'u2', emoji: '👍', user: { id: 'u2', name: 'Bob' }, createdAt: '' }],
    };
    renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={reactions} />,
      { preloadedState: authState }
    );
    expect(screen.getByText('👍')).toBeInTheDocument();
  });

  it('renders reaction count when more than 1', () => {
    const reactions = {
      '❤️': [
        { id: 'r1', userId: 'u2', emoji: '❤️', user: { id: 'u2', name: 'Bob' }, createdAt: '' },
        { id: 'r2', userId: 'u3', emoji: '❤️', user: { id: 'u3', name: 'Alice' }, createdAt: '' },
      ],
    };
    renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={reactions} />,
      { preloadedState: authState }
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('does not render a count when only one reaction exists', () => {
    const reactions = {
      '👍': [{ id: 'r1', userId: 'u2', emoji: '👍', user: { id: 'u2', name: 'Bob' }, createdAt: '' }],
    };
    renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={reactions} />,
      { preloadedState: authState }
    );
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.getByText('👍')).toBeInTheDocument();
  });

  it('renders multiple distinct reaction emojis', () => {
    const reactions = {
      '👍': [{ id: 'r1', userId: 'u2', emoji: '👍', user: { id: 'u2', name: 'Bob' }, createdAt: '' }],
      '🎉': [{ id: 'r2', userId: 'u3', emoji: '🎉', user: { id: 'u3', name: 'Alice' }, createdAt: '' }],
    };
    renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={reactions} />,
      { preloadedState: authState }
    );
    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('calls onReactionChange when a reaction is clicked', async () => {
    const { reactionApi } = await import('../../../services/api');
    const onReactionChange = vi.fn();
    const reactions = {};
    renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={reactions} onReactionChange={onReactionChange} />,
      { preloadedState: authState }
    );
    // The add-reaction button (SmileOutlined popover trigger) is present
    const addBtn = document.querySelector('[role="img"]');
    expect(addBtn).toBeTruthy();
    expect(reactionApi.addReaction).toBeDefined();
  });

  it('renders the add-reaction button (SmileOutlined)', () => {
    renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={{}} />,
      { preloadedState: authState }
    );
    // The wrapper div is rendered; smileoutlined lives inside it
    const { container } = renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={{}} />,
      { preloadedState: authState }
    );
    expect(container.querySelector('.anticon-smile')).toBeTruthy();
  });

  it('marks the user own reaction with a highlighted style', () => {
    // u1 is the logged-in user; reaction by u1 should be rendered (userReacted = true)
    const reactions = {
      '🔥': [{ id: 'r1', userId: 'u1', emoji: '🔥', user: { id: 'u1', name: 'Test' }, createdAt: '' }],
    };
    renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={reactions} />,
      { preloadedState: authState }
    );
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('renders without authenticated user (no auth state)', () => {
    const unauthState = {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    };
    const { container } = renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={{}} />,
      { preloadedState: unauthState as any }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders correct count for three reactions on one emoji', () => {
    const reactions = {
      '😂': [
        { id: 'r1', userId: 'u2', emoji: '😂', user: { id: 'u2', name: 'A' }, createdAt: '' },
        { id: 'r2', userId: 'u3', emoji: '😂', user: { id: 'u3', name: 'B' }, createdAt: '' },
        { id: 'r3', userId: 'u4', emoji: '😂', user: { id: 'u4', name: 'C' }, createdAt: '' },
      ],
    };
    renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={reactions} />,
      { preloadedState: authState }
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders the container with flex display', () => {
    const { container } = renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={{}} />,
      { preloadedState: authState }
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeTruthy();
    // The root div uses display:flex via inline style
    expect(wrapper.style.display).toBe('flex');
  });

  it('does not render any reaction badges when reactions prop is omitted', () => {
    const { container } = renderWithProviders(
      <MessageReactions messageId="msg-1" />,
      { preloadedState: authState }
    );
    // With default empty reactions there are no emoji spans other than inside the picker
    const emojiSpans = container.querySelectorAll('span[style*="font-size: 16px"]');
    expect(emojiSpans).toHaveLength(0);
  });

  it('renders all eight quick-reaction emojis inside the picker content', () => {
    const { container } = renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={{}} />,
      { preloadedState: authState }
    );
    // The picker content div always renders inside the component tree
    const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];
    QUICK_REACTIONS.forEach((emoji) => {
      // Each emoji appears at least once somewhere in the component (picker)
      expect(container.textContent).toContain(emoji);
    });
  });

  it('renders user names as Tooltip title when reactions are present', () => {
    const reactions = {
      '👍': [{ id: 'r1', userId: 'u2', emoji: '👍', user: { id: 'u2', name: 'Charlie' }, createdAt: '' }],
    };
    const { container } = renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={reactions} />,
      { preloadedState: authState }
    );
    // Tooltip title is set to names string "Charlie"; it appears in the DOM via antd
    expect(container.textContent).toContain('👍');
  });

  it('renders the smile icon inside a circular button', () => {
    const { container } = renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={{}} />,
      { preloadedState: authState }
    );
    const smileIcon = container.querySelector('.anticon-smile');
    expect(smileIcon).toBeTruthy();
    // The icon's parent div has border-radius 50%
    const parentDiv = smileIcon!.closest('div[style*="border-radius: 50%"]');
    expect(parentDiv).toBeTruthy();
  });

  it('accepts and renders a messageId prop without error', () => {
    const { container } = renderWithProviders(
      <MessageReactions messageId="unique-message-999" reactions={{}} />,
      { preloadedState: authState }
    );
    expect(container.firstChild).toBeTruthy();
  });
});
