vi.mock('../../../services/api', () => ({
  postApi: {
    likePost: vi.fn().mockResolvedValue({ data: {} }),
    unlikePost: vi.fn().mockResolvedValue({ data: {} }),
    deletePost: vi.fn().mockResolvedValue({ data: {} }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('../CommentSection', () => ({
  default: () => <div data-testid="comment-section" />,
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import PostCard from '../PostCard';

const mockPost = {
  id: 'p1',
  content: 'Test post content',
  media: [],
  type: 'TEXT',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  likesCount: 5,
  commentsCount: 2,
  isLiked: false,
  visibility: 'PUBLIC',
  creator: {
    id: 'c1',
    displayName: 'Test Creator',
    username: 'testcreator',
    profileImage: null,
    isVerified: false,
    category: 'Tech',
  },
};

describe('Social/PostCard', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<PostCard post={mockPost as any} />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
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
