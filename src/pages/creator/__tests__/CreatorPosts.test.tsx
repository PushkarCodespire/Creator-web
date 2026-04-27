import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  postApi: {
    getCreatorPosts: vi.fn().mockResolvedValue({ data: { data: { posts: [], pagination: { total: 0, totalPages: 1 } } } }),
    create: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
  authApi: {
    getCreatorProfile: vi.fn().mockResolvedValue({ data: { data: null } }),
  },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import CreatorPosts from '../CreatorPosts';

describe('CreatorPosts', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorPosts />, {
      preloadedState: {
        auth: { user: { id: '1', name: 'Test', email: 'a@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' }, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });
});
