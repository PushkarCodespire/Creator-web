import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

const mockSocket = {
  connected: false,
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
};

vi.mock('../../../services/api', () => ({
  creatorApi: {
    getMyConversations: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          conversations: [
            { id: 'conv-1', userId: 'u1', user: { name: 'Fan', avatar: null }, lastMessage: { content: 'Hello' }, mode: 'AI', unreadCount: 0, updatedAt: '2026-01-01' },
          ],
        },
      },
    }),
    getMyConversationDetails: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: { conversation: { id: 'conv-1', mode: 'AI' }, messages: [] },
      },
    }),
    setConversationMode: vi.fn().mockResolvedValue({ data: { success: true, data: { mode: 'MANUAL' } } }),
    generateAiReplyForLast: vi.fn().mockResolvedValue({ data: { success: true } }),
    replyAsCreator: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('../../../services/socket', () => ({
  default: {
    connect: vi.fn(() => mockSocket),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    joinCreatorRoom: vi.fn(),
    leaveCreatorRoom: vi.fn(),
    removeAllListeners: vi.fn(),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../pages/ChatInterface.css', () => ({}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import { screen, waitFor, fireEvent } from '@testing-library/react';
import CreatorChatView from '../CreatorChatView';

// jsdom doesn't implement scrollIntoView
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const creatorState = {
  auth: {
    user: { id: '1', name: 'Test Creator', email: 'a@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('CreatorChatView', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });
    expect(container.firstChild).toBeTruthy();
  });

  it('loads conversations data without crashing', async () => {
    const { container } = renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(container.firstChild).toBeTruthy();
    });
  });

  it('renders with currentCreator prop', async () => {
    const { container } = renderWithProviders(
      <CreatorChatView
        currentCreator={{ id: 'c1', displayName: 'My AI', profileImage: null, isVerified: true, pricePerMessage: null }}
        currentUser={{ name: 'Creator', avatar: null }}
      />,
      { preloadedState: creatorState }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('shows the conversation list item after conversations load', async () => {
    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      // "Fan" may appear multiple times (name + preview text); ensure at least one is present
      expect(screen.getAllByText('Fan').length).toBeGreaterThan(0);
    });
  });

  it('auto-selects the first conversation and loads its details', async () => {
    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    // The first conversation ("Fan") should become active and details should load
    await waitFor(() => {
      expect(screen.getAllByText('Fan').length).toBeGreaterThan(0);
    });

    // getMyConversationDetails should have been called for auto-select
    const { creatorApi } = await import('../../../services/api');
    await waitFor(() => {
      expect(creatorApi.getMyConversationDetails).toHaveBeenCalledWith('conv-1');
    });
  });

  it('renders the sidebar title after load', async () => {
    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('your chats')).toBeInTheDocument();
    });
  });

  it('shows empty state message when there are no conversations', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversations as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { conversations: [] } },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(
        screen.getByText(/No conversations yet/i)
      ).toBeInTheDocument();
    });
  });

  it('shows messages when a conversation with messages is selected', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'AI', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [
            { id: 'm1', role: 'USER', content: 'Hello there!', media: null, createdAt: '2026-01-01T10:00:00Z' },
            { id: 'm2', role: 'ASSISTANT', content: 'Hi! How can I help?', media: null, createdAt: '2026-01-01T10:01:00Z' },
          ],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Hello there!')).toBeInTheDocument();
      expect(screen.getByText('Hi! How can I help?')).toBeInTheDocument();
    });
  });

  it('shows AI mode notice when conversation is in AI mode', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'AI', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      // The mode notice contains "AI mode." with a period; there are multiple "AI mode" elements (tag + notice)
      expect(screen.getAllByText(/AI mode/i).length).toBeGreaterThan(0);
    });
  });

  it('collapses the sidebar when the collapse button is clicked', async () => {
    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('your chats')).toBeInTheDocument();
    });

    // Find the « collapse button and click it
    const collapseBtn = screen.getByRole('button', { name: '«' });
    collapseBtn.click();

    await waitFor(() => {
      // After collapse the » expand button should appear instead
      expect(screen.getByRole('button', { name: '»' })).toBeInTheDocument();
    });
  });

  it('shows Take over button when conversation detail is loaded', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'AI', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Take over/i })).toBeInTheDocument();
    });
  });

  it('shows read-only footer notice when conversation is in AI mode', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'AI', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText(/Your AI clone is handling this conversation/i)).toBeInTheDocument();
    });
  });

  it('shows manual reply textarea when conversation is in MANUAL mode', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'MANUAL', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: '2026-01-01', releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your reply as the real creator/i)).toBeInTheDocument();
    });
  });

  it('shows Release to AI button when conversation is in MANUAL mode', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'MANUAL', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: '2026-01-01', releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Release to AI/i })).toBeInTheDocument();
    });
  });

  it('shows Generate AI reply button when last message is from USER in AI mode', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'AI', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [
            { id: 'm1', role: 'USER', content: 'Unanswered fan question', media: null, createdAt: '2026-01-01T10:00:00Z' },
          ],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Generate AI reply/i })).toBeInTheDocument();
    });
  });

  it('calls setConversationMode when Take over button is clicked', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'AI', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Take over/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Take over/i }));

    await waitFor(() => {
      expect(creatorApi.setConversationMode).toHaveBeenCalledWith('conv-1', 'MANUAL');
    });
  });

  it('shows empty messages state when conversation is selected but has no messages', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'AI', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText(/No messages in this conversation yet/i)).toBeInTheDocument();
    });
  });

  it('renders a CREATOR role message with correct label', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'MANUAL', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'TestCreator' }, takenOverAt: '2026-01-01', releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [
            { id: 'm1', role: 'CREATOR', content: 'This is a manual reply', media: null, createdAt: '2026-01-01T10:00:00Z' },
          ],
        },
      },
    });

    renderWithProviders(
      <CreatorChatView
        currentCreator={{ id: 'c1', displayName: 'TestCreator', profileImage: null, isVerified: false, pricePerMessage: null }}
        currentUser={{ name: 'Creator', avatar: null }}
      />,
      { preloadedState: creatorState }
    );

    await waitFor(() => {
      expect(screen.getByText('This is a manual reply')).toBeInTheDocument();
    });
  });

  // ─── NEW TESTS ────────────────────────────────────────────────────────────

  it('does not show Generate AI reply button when last message is ASSISTANT in AI mode', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'AI', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [
            { id: 'm1', role: 'USER', content: 'question', media: null, createdAt: '2026-01-01T10:00:00Z' },
            { id: 'm2', role: 'ASSISTANT', content: 'answer', media: null, createdAt: '2026-01-01T10:01:00Z' },
          ],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('answer')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /Generate AI reply/i })).not.toBeInTheDocument();
  });

  it('does not show Generate AI reply button in MANUAL mode even when last message is USER', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'MANUAL', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: '2026-01-01', releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [
            { id: 'm1', role: 'USER', content: 'a fan question', media: null, createdAt: '2026-01-01T10:00:00Z' },
          ],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('a fan question')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /Generate AI reply/i })).not.toBeInTheDocument();
  });

  it('calls generateAiReplyForLast when Generate AI reply button is clicked', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'AI', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [
            { id: 'm1', role: 'USER', content: 'please answer', media: null, createdAt: '2026-01-01T10:00:00Z' },
          ],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Generate AI reply/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Generate AI reply/i }));

    await waitFor(() => {
      expect(creatorApi.generateAiReplyForLast).toHaveBeenCalledWith('conv-1');
    });
  });

  it('expands the sidebar again when the expand button is clicked after collapsing', async () => {
    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('your chats')).toBeInTheDocument();
    });

    // Collapse
    fireEvent.click(screen.getByRole('button', { name: '«' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '»' })).toBeInTheDocument();
    });

    // Expand again
    fireEvent.click(screen.getByRole('button', { name: '»' }));

    await waitFor(() => {
      expect(screen.getByText('your chats')).toBeInTheDocument();
    });
  });

  it('shows the Dashboard button in the header', async () => {
    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    });
  });

  it('shows "Manual (you)" tag when conversation is in MANUAL mode', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'MANUAL', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: '2026-01-01', releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText(/Manual \(you\)/i)).toBeInTheDocument();
    });
  });

  it('shows "AI mode" tag when conversation is in AI mode', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'AI', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getAllByText(/AI mode/i).length).toBeGreaterThan(0);
    });
  });

  it('shows manual mode notice text when conversation is MANUAL', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'MANUAL', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: '2026-01-01', releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      // Both the mode notice banner and the footer hint contain this text — assert at least one
      expect(screen.getAllByText(/You are replying manually/i).length).toBeGreaterThan(0);
    });
  });

  it('calls setConversationMode with AI when Release to AI is clicked', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'MANUAL', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: '2026-01-01', releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });
    (creatorApi.setConversationMode as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { mode: 'AI' } },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Release to AI/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Release to AI/i }));

    await waitFor(() => {
      expect(creatorApi.setConversationMode).toHaveBeenCalledWith('conv-1', 'AI');
    });
  });

  it('shows "Select a conversation" prompt when no conversation is selected', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversations as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { conversations: [] } },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText(/Select a conversation/i)).toBeInTheDocument();
    });
  });

  it('renders currentCreator displayName in the header when no conversation is active', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversations as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { conversations: [] } },
    });

    renderWithProviders(
      <CreatorChatView
        currentCreator={{ id: 'c1', displayName: 'MyBrand', profileImage: null, isVerified: false, pricePerMessage: null }}
        currentUser={{ name: 'TheCreator', avatar: null }}
      />,
      { preloadedState: creatorState }
    );

    await waitFor(() => {
      expect(screen.getByText('MyBrand')).toBeInTheDocument();
    });
  });

  it('shows verified checkmark when currentCreator.isVerified is true', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversations as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { conversations: [] } },
    });

    const { container } = renderWithProviders(
      <CreatorChatView
        currentCreator={{ id: 'c1', displayName: 'VerifiedCreator', profileImage: null, isVerified: true, pricePerMessage: null }}
        currentUser={{ name: 'TheCreator', avatar: null }}
      />,
      { preloadedState: creatorState }
    );

    await waitFor(() => {
      expect(screen.getByText('VerifiedCreator')).toBeInTheDocument();
    });
    // The CheckCircleFilled icon should be in the DOM (rendered as an antd icon span)
    expect(container.querySelector('[aria-label="check-circle"]') || container.querySelector('.anticon-check-circle')).toBeTruthy();
  });

  it('shows currentUser name in sidebar footer', async () => {
    renderWithProviders(
      <CreatorChatView
        currentCreator={{ id: 'c1', displayName: 'Creator', profileImage: null, isVerified: false, pricePerMessage: null }}
        currentUser={{ name: 'FooterUser', avatar: null }}
      />,
      { preloadedState: creatorState }
    );

    await waitFor(() => {
      expect(screen.getByText('FooterUser')).toBeInTheDocument();
    });
  });

  it('shows "Guest" label for conversations with no user name', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversations as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversations: [
            { id: 'conv-guest', userId: null, user: { name: '', avatar: null }, lastMessage: null, mode: 'AI', unreadCount: 0, updatedAt: '2026-01-01', lastMessageAt: null, createdAt: '2026-01-01', messageCount: 0, isGuest: true, isActive: true },
          ],
        },
      },
    });
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-guest', mode: 'AI', user: { id: null, name: '', avatar: null }, isGuest: true, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Guest')).toBeInTheDocument();
    });
  });

  it('renders "No messages yet" preview for conversations with no last message', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversations as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversations: [
            { id: 'conv-2', userId: 'u2', user: { name: 'NewFan', avatar: null }, lastMessage: null, mode: 'AI', unreadCount: 0, updatedAt: '2026-01-01', lastMessageAt: null, createdAt: '2026-01-01', messageCount: 0, isGuest: false, isActive: true },
          ],
        },
      },
    });
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-2', mode: 'AI', user: { id: 'u2', name: 'NewFan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('No messages yet')).toBeInTheDocument();
    });
  });

  it('shows Send button disabled when manual input is empty in MANUAL mode', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'MANUAL', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: '2026-01-01', releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
    });

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    expect(sendBtn).toBeDisabled();
  });

  it('enables Send button when text is typed in manual input', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'MANUAL', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: '2026-01-01', releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your reply as the real creator/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Type your reply as the real creator/i);
    fireEvent.change(textarea, { target: { value: 'Hello fan!' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send/i })).not.toBeDisabled();
    });
  });

  it('calls replyAsCreator when Send is clicked with text in MANUAL mode', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-1', mode: 'MANUAL', user: { id: 'u1', name: 'Fan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: '2026-01-01', releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });
    (creatorApi.replyAsCreator as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          message: { id: 'mnew', role: 'CREATOR', content: 'Hello fan!', media: null, createdAt: '2026-01-01T11:00:00Z' },
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your reply as the real creator/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Type your reply as the real creator/i);
    fireEvent.change(textarea, { target: { value: 'Hello fan!' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() => {
      expect(creatorApi.replyAsCreator).toHaveBeenCalledWith('conv-1', 'Hello fan!');
    });
  });

  it('shows AI preview prefix for ASSISTANT last messages in conversation list', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getMyConversations as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversations: [
            { id: 'conv-ai', userId: 'u1', user: { name: 'LarryFan', avatar: null }, lastMessage: { content: 'AI said this', role: 'ASSISTANT' }, mode: 'AI', unreadCount: 0, updatedAt: '2026-01-01', lastMessageAt: '2026-01-01', createdAt: '2026-01-01', messageCount: 1, isGuest: false, isActive: true },
          ],
        },
      },
    });
    (creatorApi.getMyConversationDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'conv-ai', mode: 'AI', user: { id: 'u1', name: 'LarryFan', avatar: null }, isGuest: false, creator: { id: 'c1', displayName: 'Creator' }, takenOverAt: null, releasedAt: null, createdAt: '2026-01-01', lastMessageAt: null },
          messages: [],
        },
      },
    });

    renderWithProviders(<CreatorChatView />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText(/AI: AI said this/i)).toBeInTheDocument();
    });
  });
});
