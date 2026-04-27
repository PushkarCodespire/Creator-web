import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  contentApi: {
    getById: vi.fn().mockResolvedValue({ data: { data: null } }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    retrain: vi.fn().mockResolvedValue({ data: {} }),
  },
  getImageUrl: vi.fn((p: string) => p || ''),
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ contentId: 'c1' }), useNavigate: () => vi.fn() };
});

import ContentDetails from '../ContentDetails';

describe('ContentDetails', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ContentDetails />, {
      preloadedState: {
        auth: { user: { id: '1', name: 'Test', email: 'a@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' }, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });
});
