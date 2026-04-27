import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { data: { notifications: [], unreadCount: 0 } } }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/socket', () => {
  const sock = { on: vi.fn(), off: vi.fn(), emit: vi.fn(), disconnect: vi.fn() };
  return { connectSocket: vi.fn(() => sock), getSocket: vi.fn(() => sock) };
});

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../components/notifications/NotificationCenter.css', () => ({}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import NotificationCenter from '../NotificationCenter';

describe('NotificationCenter', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<NotificationCenter />, {
      preloadedState: {
        auth: { user: { id: '1', name: 'Test', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' }, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });
});
