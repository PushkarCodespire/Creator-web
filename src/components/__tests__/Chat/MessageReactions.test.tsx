import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { MessageReactions } from '../../Chat/MessageReactions';

vi.mock('../../../services/api', () => ({
  reactionApi: {
    addReaction: vi.fn().mockResolvedValue({
      data: { data: { id: 'r-new', userId: 'user-1', user: { id: 'user-1', name: 'Test' }, emoji: '👍', createdAt: '2024-01-01' } },
    }),
    removeReaction: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test User',
  role: 'USER' as const,
  isVerified: false,
  createdAt: '2024-01-01',
};

const authenticatedState = {
  auth: {
    user: mockUser,
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

const existingReactions = {
  '👍': [
    { id: 'r1', userId: 'user-2', user: { id: 'user-2', name: 'Alice' }, emoji: '👍', createdAt: '2024-01-01' },
    { id: 'r2', userId: 'user-3', user: { id: 'user-3', name: 'Bob' }, emoji: '👍', createdAt: '2024-01-01' },
  ],
  '❤️': [
    { id: 'r3', userId: 'user-2', user: { id: 'user-2', name: 'Alice' }, emoji: '❤️', createdAt: '2024-01-01' },
  ],
};

describe('MessageReactions', () => {
  it('renders existing reactions with counts', () => {
    renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={existingReactions} />,
      { preloadedState: authenticatedState }
    );

    // The thumbs up has 2 reactions so should show count
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('renders add reaction button', () => {
    renderWithProviders(
      <MessageReactions messageId="msg-1" />,
      { preloadedState: authenticatedState }
    );

    // SmileOutlined icon serves as add reaction button
    expect(screen.getByRole('img', { name: /smile/i })).toBeInTheDocument();
  });

  it('renders with empty reactions', () => {
    renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={{}} />,
      { preloadedState: authenticatedState }
    );

    // Should still render the add reaction button
    expect(screen.getByRole('img', { name: /smile/i })).toBeInTheDocument();
  });

  it('shows emoji picker when add reaction button is clicked', async () => {
    renderWithProviders(
      <MessageReactions messageId="msg-1" />,
      { preloadedState: authenticatedState }
    );

    // Click the add reaction (SmileOutlined) button's parent
    const addButton = screen.getByRole('img', { name: /smile/i });
    fireEvent.click(addButton.closest('[style]')!);

    await waitFor(() => {
      // Quick reactions should appear in the picker
      expect(screen.getByText('🎉')).toBeInTheDocument();
      expect(screen.getByText('🔥')).toBeInTheDocument();
    });
  });

  it('calls onReactionChange when adding a reaction', async () => {
    const onReactionChange = vi.fn();

    renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={{}} onReactionChange={onReactionChange} />,
      { preloadedState: authenticatedState }
    );

    // Open picker
    const addButton = screen.getByRole('img', { name: /smile/i });
    fireEvent.click(addButton.closest('[style]')!);

    await waitFor(() => {
      expect(screen.getByText('👍')).toBeInTheDocument();
    });

    // Click a reaction emoji
    fireEvent.click(screen.getByText('👍'));

    await waitFor(() => {
      expect(onReactionChange).toHaveBeenCalled();
    });
  });

  it('does not show count for reactions with only 1 user', () => {
    const singleReaction = {
      '❤️': [
        { id: 'r1', userId: 'user-2', user: { id: 'user-2', name: 'Alice' }, emoji: '❤️', createdAt: '2024-01-01' },
      ],
    };

    renderWithProviders(
      <MessageReactions messageId="msg-1" reactions={singleReaction} />,
      { preloadedState: authenticatedState }
    );

    expect(screen.getByText('❤️')).toBeInTheDocument();
    // Count should not be shown for single reactions (the component only shows count > 1)
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
});
