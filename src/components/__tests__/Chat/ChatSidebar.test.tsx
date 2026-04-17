import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ChatSidebar } from '../../Chat/ChatSidebar';

vi.mock('../../../services/api', () => ({
  chatApi: {},
  bookmarkApi: {
    getUserBookmarks: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
  getImageUrl: vi.fn((url: string) => url || ''),
}));

vi.mock('../../../utils/dateUtils', () => ({
  formatRelativeTime: vi.fn(() => 'just now'),
}));

vi.mock('../../../store/slices/chatSlice', async () => {
  const actual = await vi.importActual('../../../store/slices/chatSlice');
  return {
    ...actual,
    fetchUserConversations: vi.fn(() => ({ type: 'chat/fetchUserConversations/fulfilled', payload: [] })),
  };
});

const mockConversations = [
  {
    id: 'conv-1',
    creatorId: 'c1',
    isActive: true,
    createdAt: '2024-01-01',
    creator: { id: 'c1', displayName: 'Alice Creator', tags: [], isVerified: true, totalChats: 10 },
    messages: [{ id: 'm1', conversationId: 'conv-1', role: 'USER' as const, content: 'Hello Alice!', createdAt: '2024-01-01' }],
  },
  {
    id: 'conv-2',
    creatorId: 'c2',
    isActive: true,
    createdAt: '2024-01-01',
    creator: { id: 'c2', displayName: 'Bob Creator', tags: [], isVerified: false, totalChats: 5 },
    messages: [{ id: 'm2', conversationId: 'conv-2', role: 'ASSISTANT' as const, content: 'Welcome!', createdAt: '2024-01-01' }],
  },
];

describe('ChatSidebar', () => {
  it('renders header with Conversations title', () => {
    renderWithProviders(
      <ChatSidebar visible={true} onClose={vi.fn()} />,
      {
        preloadedState: {
          auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
          chat: { currentConversation: null, conversations: [], messages: [], isLoading: false, isSending: false, error: null, guestId: null },
        },
      }
    );

    expect(screen.getByText(/Conversations/)).toBeInTheDocument();
  });

  it('shows empty state when no conversations exist', () => {
    renderWithProviders(
      <ChatSidebar visible={true} onClose={vi.fn()} />,
      {
        preloadedState: {
          auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
          chat: { currentConversation: null, conversations: [], messages: [], isLoading: false, isSending: false, error: null, guestId: null },
        },
      }
    );

    expect(screen.getByText('No chats yet')).toBeInTheDocument();
  });

  it('renders conversation list when conversations exist', () => {
    renderWithProviders(
      <ChatSidebar visible={true} onClose={vi.fn()} />,
      {
        preloadedState: {
          auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
          chat: { currentConversation: null, conversations: mockConversations as any, messages: [], isLoading: false, isSending: false, error: null, guestId: null },
        },
      }
    );

    expect(screen.getByText('Alice Creator')).toBeInTheDocument();
    expect(screen.getByText('Bob Creator')).toBeInTheDocument();
    expect(screen.getByText('Hello Alice!')).toBeInTheDocument();
  });

  it('calls onConversationSelect when a conversation is clicked', () => {
    const onSelect = vi.fn();

    renderWithProviders(
      <ChatSidebar visible={true} onClose={vi.fn()} onConversationSelect={onSelect} />,
      {
        preloadedState: {
          auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
          chat: { currentConversation: null, conversations: mockConversations as any, messages: [], isLoading: false, isSending: false, error: null, guestId: null },
        },
      }
    );

    fireEvent.click(screen.getByText('Alice Creator'));
    expect(onSelect).toHaveBeenCalledWith('conv-1');
  });

  it('renders search input', () => {
    renderWithProviders(
      <ChatSidebar visible={true} onClose={vi.fn()} />,
      {
        preloadedState: {
          auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
          chat: { currentConversation: null, conversations: [], messages: [], isLoading: false, isSending: false, error: null, guestId: null },
        },
      }
    );

    expect(screen.getByPlaceholderText('Search chats...')).toBeInTheDocument();
  });

  it('filters conversations by search query', () => {
    renderWithProviders(
      <ChatSidebar visible={true} onClose={vi.fn()} />,
      {
        preloadedState: {
          auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
          chat: { currentConversation: null, conversations: mockConversations as any, messages: [], isLoading: false, isSending: false, error: null, guestId: null },
        },
      }
    );

    const searchInput = screen.getByPlaceholderText('Search chats...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Alice Creator')).toBeInTheDocument();
    expect(screen.queryByText('Bob Creator')).not.toBeInTheDocument();
  });
});
