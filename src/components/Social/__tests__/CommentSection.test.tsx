vi.mock('../../../services/api', () => ({
  commentApi: {
    getComments: vi.fn().mockResolvedValue({ data: { data: { comments: [], total: 0 } } }),
    createComment: vi.fn().mockResolvedValue({ data: { data: {} } }),
    likeComment: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CommentSection from '../CommentSection';

describe('Social/CommentSection', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CommentSection postId="post-1" />, {
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

  it('renders with initialCommentsCount', () => {
    const { container } = renderWithProviders(
      <CommentSection postId="post-2" initialCommentsCount={5} />,
      {
        preloadedState: {
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          },
        },
      }
    );
    expect(container.firstChild).toBeTruthy();
  });
});
