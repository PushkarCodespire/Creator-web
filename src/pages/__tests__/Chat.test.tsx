import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  creatorApi: {
    getProfile: vi.fn().mockResolvedValue({
      data: { data: { id: 'c1', displayName: 'Test Creator', profileImage: '/img.png' } },
    }),
    getAll: vi.fn().mockResolvedValue({ data: { data: { creators: [] } } }),
  },
  chatApi: {
    getConversation: vi.fn().mockResolvedValue({ data: { data: { messages: [] } } }),
    getConversations: vi.fn().mockResolvedValue({ data: { data: { conversations: [] } } }),
    sendMessage: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
  reviewApi: {
    getByCreator: vi.fn().mockResolvedValue({ data: { data: { reviews: [] } } }),
  },
  subscriptionApi: {
    getCurrent: vi.fn().mockResolvedValue({ data: { data: { plan: 'FREE' } } }),
  },
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
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('remark-gfm', () => ({
  default: () => null,
}));

vi.mock('../../utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ creatorId: 'test-creator-id' })),
  };
});

import Chat from '../Chat';

describe('Chat', () => {
  const authenticatedState = {
    auth: {
      user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'USER' as const },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    },
  };

  it('renders without crashing', () => {
    renderWithProviders(<Chat />, { preloadedState: authenticatedState });
    // Chat page should render some container
    expect(document.querySelector('[class]')).toBeTruthy();
  });

  it('renders for creator role as CreatorChatView', () => {
    renderWithProviders(<Chat />, {
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
    expect(screen.getByText('Creator Chat View')).toBeInTheDocument();
  });
});
