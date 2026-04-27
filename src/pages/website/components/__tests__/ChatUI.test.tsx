vi.mock('../../../../services/api', () => ({
  chatApi: {
    createConversation: vi.fn().mockResolvedValue({ data: { data: { conversation: { id: 'conv-1' } } } }),
    getConversation: vi.fn().mockResolvedValue({ data: { data: { messages: [], conversation: { id: 'conv-1' } } } }),
    sendMessage: vi.fn().mockResolvedValue({ data: { data: { reply: 'Hi', conversationId: 'c1', rateLimitStatus: null } } }),
    getGuestRateLimit: vi.fn().mockResolvedValue({ data: { data: { remaining: 5 } } }),
  },
  creatorApi: {
    getById: vi.fn().mockResolvedValue({ data: { data: null } }),
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
import { ChatUI } from '../ChatUI';

describe('ChatUI', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ChatUI creatorId="c1" />,
      {
        preloadedState: {
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          },
          chat: {
            conversations: {},
            activeConversationId: null,
            isLoading: false,
            error: null,
          },
        },
      }
    );
    expect(container.firstChild).toBeTruthy();
  });
});
