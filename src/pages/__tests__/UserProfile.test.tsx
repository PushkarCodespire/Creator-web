vi.mock('../../services/api', () => ({
  creatorApi: {
    getCreatorByUsername: vi.fn().mockResolvedValue({ data: { data: null } }),
    getProfile: vi.fn().mockResolvedValue({ data: { data: null } }),
  },
  postApi: {
    getCreatorPosts: vi.fn().mockResolvedValue({ data: { data: { posts: [] } } }),
    getUserPosts: vi.fn().mockResolvedValue({ data: { data: { posts: [] } } }),
  },
  followApi: {
    getFollowStatus: vi.fn().mockResolvedValue({ data: { data: { isFollowing: false } } }),
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    section: ({ children, ...p }: any) => <section {...p}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ username: 'testuser' }),
    useNavigate: () => vi.fn(),
  };
});

import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import UserProfile from '../UserProfile';

describe('UserProfile', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<UserProfile />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Viewer', email: 'v@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });
});
