import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  creatorApi: {
    getConversations: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('../../../services/socket', () => ({
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    joinCreatorRoom: vi.fn(),
    leaveCreatorRoom: vi.fn(),
  },
  socketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    joinCreatorRoom: vi.fn(),
    leaveCreatorRoom: vi.fn(),
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

import CreatorChatView from '../CreatorChatView';

describe('CreatorChatView', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorChatView />, {
      preloadedState: {
        auth: { user: { id: '1', name: 'Test', email: 'a@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' }, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });
});
