// ===========================================
// CHAT FLOW E2E TESTS
// ===========================================

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { vi } from 'vitest';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  creatorApi: {
    getProfile: vi.fn().mockResolvedValue({
      data: { data: { id: 'creator-1', displayName: 'Test Creator', profileImage: null } },
    }),
    getAll: vi.fn().mockResolvedValue({ data: { data: { creators: [] } } }),
  },
  chatApi: {
    startConversation: vi.fn().mockResolvedValue({
      data: { data: { conversationId: 'conv-1' } },
    }),
    sendMessage: vi.fn().mockResolvedValue({
      data: {
        data: {
          message: { id: 'msg-1', role: 'USER', content: 'Hello', createdAt: new Date() },
          aiResponse: { id: 'msg-2', role: 'ASSISTANT', content: 'Hi there!', createdAt: new Date() },
        },
      },
    }),
    getConversation: vi.fn().mockResolvedValue({ data: { data: { messages: [] } } }),
    getConversations: vi.fn().mockResolvedValue({ data: { data: { conversations: [] } } }),
  },
  reviewApi: { getByCreator: vi.fn().mockResolvedValue({ data: { data: { reviews: [] } } }) },
  subscriptionApi: { getCurrent: vi.fn().mockResolvedValue({ data: { data: { plan: 'FREE' } } }) },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../../services/socket', () => ({
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    joinConversation: vi.fn(),
    leaveConversation: vi.fn(),
    removeAllListeners: vi.fn(),
  },
}));

vi.mock('../../components/Chat/StreamingMessage', () => ({
  default: () => <div>Streaming</div>,
}));

vi.mock('../../components/Chat/MediaMessage', () => ({
  default: () => <div>Media</div>,
}));

vi.mock('../../components/Chat/CreatorChatView', () => ({
  default: () => <div>Creator Chat View</div>,
}));

vi.mock('../../components/Chat/UpgradeModal', () => ({
  default: () => null,
}));

vi.mock('../../components/Chat/GuestLimitModal', () => ({
  default: () => null,
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('remark-gfm', () => ({ default: () => null }));

vi.mock('../../utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ creatorId: 'creator-1' })),
  };
});

window.HTMLElement.prototype.scrollIntoView = vi.fn();

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import chatReducer from '../../store/slices/chatSlice';
import Chat from '../../pages/Chat';

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      chat: chatReducer,
    },
    preloadedState: {
      auth: {
        user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'USER' as const },
        token: 'test-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    },
  });

const renderChat = () => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Chat />
      </BrowserRouter>
    </Provider>
  );
};

describe('Chat Flow E2E', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chat interface without crashing', () => {
    renderChat();
    expect(document.querySelector('[class]')).toBeTruthy();
  });

  it('renders creator chat view for CREATOR role', () => {
    const store = configureStore({
      reducer: { auth: authReducer, chat: chatReducer },
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Creator', email: 'c@test.com', role: 'CREATOR' as const },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Chat />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Creator Chat View')).toBeInTheDocument();
  });
});
