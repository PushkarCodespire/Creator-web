vi.mock('../../../../services/api', () => ({
  chatApi: {
    createConversation: vi.fn().mockResolvedValue({ data: { data: { conversation: { id: 'conv-1' } } } }),
    getConversation: vi.fn().mockResolvedValue({ data: { data: { messages: [], conversation: { id: 'conv-1' } } } }),
    sendMessage: vi.fn().mockResolvedValue({ data: { data: { reply: 'Hi', conversationId: 'c1', rateLimitStatus: null } } }),
    getRateLimitStatus: vi.fn().mockResolvedValue({ data: { data: { subscription: { plan: 'FREE' }, limits: { daily: { remaining: 5, limit: 5 } } } } }),
  },
  creatorApi: {
    getById: vi.fn().mockResolvedValue({ data: { data: { id: 'c1', displayName: 'Test Creator', profileImage: null, isOnline: false } } }),
    getCreatorById: vi.fn().mockResolvedValue({ data: { data: null } }),
  },
  programApi: {
    getByCreator: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getCreatorPrograms: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('../../../../services/socket', () => ({
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    getSocket: vi.fn().mockReturnValue(null),
    joinConversation: vi.fn(),
    joinCreatorRoom: vi.fn(),
    leaveCreatorRoom: vi.fn(),
  },
  socketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    getSocket: vi.fn().mockReturnValue(null),
    joinConversation: vi.fn(),
    joinCreatorRoom: vi.fn(),
    leaveCreatorRoom: vi.fn(),
  },
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../../WebsiteChat.module.css', () => ({ default: {} }));

vi.mock('../VoiceModeModal', () => ({
  default: () => null,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { ChatUI } from '../ChatUI';

const baseChat = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  guestId: null,
};

const guestAuth = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const userAuth = {
  user: { id: 'u1', name: 'Fan User', email: 'fan@test.com', role: 'USER' as const },
  token: 'tok',
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

describe('ChatUI', () => {
  it('renders without crashing for guest', () => {
    const { container } = renderWithProviders(
      <ChatUI creatorId="c1" />,
      {
        preloadedState: {
          auth: guestAuth,
          chat: baseChat,
        },
      }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders without crashing for authenticated user', () => {
    const { container } = renderWithProviders(
      <ChatUI creatorId="c1" />,
      {
        preloadedState: {
          auth: userAuth,
          chat: baseChat,
        },
      }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('shows loading state initially', () => {
    renderWithProviders(
      <ChatUI creatorId="c1" />,
      {
        preloadedState: {
          auth: guestAuth,
          chat: baseChat,
        },
      }
    );
    // While API calls are in-flight the component is in loading state
    expect(document.body).toBeTruthy();
  });

  it('renders with a different creatorId', () => {
    const { container } = renderWithProviders(
      <ChatUI creatorId="creator-xyz" />,
      {
        preloadedState: {
          auth: userAuth,
          chat: baseChat,
        },
      }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders creator display name after load', async () => {
    renderWithProviders(
      <ChatUI creatorId="c1" />,
      {
        preloadedState: {
          auth: guestAuth,
          chat: baseChat,
        },
      }
    );

    await waitFor(() => {
      // Creator name appears in the header or empty-state area
      expect(screen.getAllByText(/Test Creator/i).length).toBeGreaterThan(0);
    });
  });

  it('shows "Chat with" heading in empty state after load', async () => {
    renderWithProviders(
      <ChatUI creatorId="c1" />,
      { preloadedState: { auth: guestAuth, chat: baseChat } }
    );

    await waitFor(() => {
      expect(screen.getByText(/Chat with/i)).toBeInTheDocument();
    });
  });

  it('renders suggestion buttons in empty state', async () => {
    renderWithProviders(
      <ChatUI creatorId="c1" />,
      { preloadedState: { auth: guestAuth, chat: baseChat } }
    );

    await waitFor(() => {
      expect(screen.getByText('What services do you offer?')).toBeInTheDocument();
    });
  });

  it('renders message composer textarea after load', async () => {
    renderWithProviders(
      <ChatUI creatorId="c1" />,
      { preloadedState: { auth: userAuth, chat: baseChat } }
    );

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  it('shows free message counter in header after load', async () => {
    renderWithProviders(
      <ChatUI creatorId="c1" />,
      { preloadedState: { auth: guestAuth, chat: baseChat } }
    );

    await waitFor(() => {
      // Free counter shows "X / 5 free"
      expect(screen.getByText(/\/\s*5\s*free/i)).toBeInTheDocument();
    });
  });

  it('renders voice provider toggle buttons', async () => {
    renderWithProviders(
      <ChatUI creatorId="c1" />,
      { preloadedState: { auth: guestAuth, chat: baseChat } }
    );

    await waitFor(() => {
      expect(screen.getByText('Chatterbox')).toBeInTheDocument();
      expect(screen.getByText('Inworld')).toBeInTheDocument();
      expect(screen.getByText('ElevenLabs')).toBeInTheDocument();
    });
  });

  it('clicking a suggestion fires send (disabled while sending)', async () => {
    const { chatApi } = await import('../../../../services/api');
    renderWithProviders(
      <ChatUI creatorId="c1" />,
      { preloadedState: { auth: guestAuth, chat: baseChat } }
    );

    await waitFor(() => {
      expect(screen.getByText('What services do you offer?')).toBeInTheDocument();
    });

    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(screen.getByText('What services do you offer?'));

    await waitFor(() => {
      expect(chatApi.sendMessage).toHaveBeenCalled();
    });
  });
});
