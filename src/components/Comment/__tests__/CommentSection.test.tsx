import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CommentSection from '../CommentSection';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  commentApi: {
    getComments: vi.fn(),
    createComment: vi.fn(),
  },
}));

vi.mock('../../../styles/animations', () => ({
  fadeIn: {},
  staggerContainer: {},
  likeAnimation: {},
  staggerItem: {},
  scaleIn: {},
  fadeInUp: {},
}));

vi.mock('../../../utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { commentApi } from '../../../services/api';

const authState = {
  auth: {
    isAuthenticated: true,
    user: { id: 'u1', name: 'Test', email: 'test@test.com', role: 'USER' as const, isVerified: true, createdAt: '' },
    token: 'test-token',
    isLoading: false,
    error: null,
  },
};

const unauthState = {
  auth: { isAuthenticated: false, user: null, token: null, isLoading: false, error: null },
};

const makeComment = (id: string, content: string) => ({
  id,
  content,
  userId: 'u2',
  postId: 'post-1',
  createdAt: '',
  updatedAt: '',
  likesCount: 0,
  user: { id: 'u2', name: 'Bob' },
  _count: { replies: 0 },
});

describe('CommentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders comments heading', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" />);
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('shows empty state when no comments', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" />);

    await waitFor(() => {
      expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
    });
  });

  it('shows login prompt when not authenticated', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByText('Please log in to leave a comment')).toBeInTheDocument();
    });
  });

  it('shows comment composer when authenticated', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u1', name: 'Test', email: 'test@test.com', role: 'USER', isVerified: true, createdAt: '' },
          token: 'test-token',
        } as any,
      },
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    });
  });

  it('displays sort options (Newest, Oldest, Popular) when comments exist', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          comments: [
            { id: 'c1', content: 'First comment', userId: 'u2', postId: 'post-1', createdAt: '', updatedAt: '', likesCount: 0, user: { id: 'u2', name: 'Bob' }, _count: { replies: 0 } },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<CommentSection postId="post-1" />);

    await waitFor(() => {
      expect(screen.getByText('Newest')).toBeInTheDocument();
      expect(screen.getByText('Oldest')).toBeInTheDocument();
      expect(screen.getByText('Popular')).toBeInTheDocument();
    });
  });

  it('shows the "Log In" button in the login prompt when unauthenticated', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });
  });

  it('displays comment count from initialCommentsCount prop in header', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 5, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" initialCommentsCount={5} />);

    await waitFor(() => {
      expect(screen.getByText('(5)')).toBeInTheDocument();
    });
  });

  it('renders "Load More Comments" button when hasMore is true', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          comments: [
            { id: 'c1', content: 'A comment', userId: 'u2', postId: 'post-1', createdAt: '', updatedAt: '', likesCount: 0, user: { id: 'u2', name: 'Bob' }, _count: { replies: 0 } },
          ],
          pagination: { total: 20, totalPages: 3 },
        },
      },
    });

    renderWithProviders(<CommentSection postId="post-1" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /load more comments/i })).toBeInTheDocument();
    });
  });

  it('does not show "Load More Comments" when on the last page', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          comments: [
            { id: 'c1', content: 'Only comment', userId: 'u2', postId: 'post-1', createdAt: '', updatedAt: '', likesCount: 0, user: { id: 'u2', name: 'Bob' }, _count: { replies: 0 } },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<CommentSection postId="post-1" />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /load more comments/i })).not.toBeInTheDocument();
    });
  });

  it('renders the Comments heading even when loading', () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {})); // never resolves

    renderWithProviders(<CommentSection postId="post-1" />);

    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('authenticated empty state encourages user to be first to comment', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u1', name: 'Test', email: 'test@test.com', role: 'USER', isVerified: true, createdAt: '' },
          token: 'test-token',
        } as any,
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Be the first to comment/)).toBeInTheDocument();
    });
  });

  it('renders a comment body from the API response', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          comments: [
            { id: 'c1', content: 'Great post!', userId: 'u2', postId: 'post-1', createdAt: '', updatedAt: '', likesCount: 0, user: { id: 'u2', name: 'Bob' }, _count: { replies: 0 } },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<CommentSection postId="post-1" />);

    await waitFor(() => {
      expect(screen.getByText('Great post!')).toBeInTheDocument();
    });
  });

  it('calls getComments with the correct postId', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="special-post-42" />);

    await waitFor(() => {
      expect(commentApi.getComments).toHaveBeenCalledWith(
        'special-post-42',
        expect.objectContaining({ page: 1 })
      );
    });
  });

  it('does not render count parenthesis when initialCommentsCount is 0 and total is 0', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" initialCommentsCount={0} />);

    await waitFor(() => {
      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    });
  });

  it('does not display sort options when there are no comments', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" />);

    await waitFor(() => {
      expect(screen.queryByText('Newest')).not.toBeInTheDocument();
    });
  });

  it('renders a Spin element while loading', () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    const { container } = renderWithProviders(<CommentSection postId="post-1" />);

    expect(container.querySelector('.ant-spin')).toBeTruthy();
  });

  it('shows the CommentOutlined icon in the header', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    const { container } = renderWithProviders(<CommentSection postId="post-1" />);

    expect(container.querySelector('.anticon-comment')).toBeTruthy();
  });

  // --- NEW TESTS APPENDED BELOW ---

  it('calls getComments with sort "newest" on initial render', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-sort" />);

    await waitFor(() => {
      expect(commentApi.getComments).toHaveBeenCalledWith(
        'post-sort',
        expect.objectContaining({ sort: 'newest' })
      );
    });
  });

  it('calls getComments again when sort changes to "oldest"', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          comments: [makeComment('c1', 'Hello')],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<CommentSection postId="post-sort2" />);

    await waitFor(() => expect(screen.getByText('Oldest')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Oldest'));

    await waitFor(() => {
      expect(commentApi.getComments).toHaveBeenCalledWith(
        'post-sort2',
        expect.objectContaining({ sort: 'oldest' })
      );
    });
  });

  it('calls getComments again when sort changes to "popular"', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          comments: [makeComment('c1', 'Popular comment')],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<CommentSection postId="post-sort3" />);

    await waitFor(() => expect(screen.getByText('Popular')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Popular'));

    await waitFor(() => {
      expect(commentApi.getComments).toHaveBeenCalledWith(
        'post-sort3',
        expect.objectContaining({ sort: 'popular' })
      );
    });
  });

  it('calls getComments with limit 10', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-limit" />);

    await waitFor(() => {
      expect(commentApi.getComments).toHaveBeenCalledWith(
        'post-limit',
        expect.objectContaining({ limit: 10 })
      );
    });
  });

  it('clicking "Load More Comments" triggers a second getComments call with page 2', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          comments: [makeComment('c1', 'First page comment')],
          pagination: { total: 20, totalPages: 3 },
        },
      },
    });

    renderWithProviders(<CommentSection postId="post-loadmore" />);

    await waitFor(() => expect(screen.getByRole('button', { name: /load more comments/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /load more comments/i }));

    await waitFor(() => {
      expect(commentApi.getComments).toHaveBeenCalledWith(
        'post-loadmore',
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it('renders multiple comments from API response', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          comments: [
            makeComment('c1', 'First comment text'),
            makeComment('c2', 'Second comment text'),
            makeComment('c3', 'Third comment text'),
          ],
          pagination: { total: 3, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<CommentSection postId="post-multi" />);

    await waitFor(() => {
      expect(screen.getByText('First comment text')).toBeInTheDocument();
      expect(screen.getByText('Second comment text')).toBeInTheDocument();
      expect(screen.getByText('Third comment text')).toBeInTheDocument();
    });
  });

  it('updates comment count in header from API pagination total', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 42, totalPages: 5 } } },
    });

    renderWithProviders(<CommentSection postId="post-count" initialCommentsCount={0} />);

    await waitFor(() => {
      expect(screen.getByText('(42)')).toBeInTheDocument();
    });
  });

  it('does not show "Load More" button when there is only one page of results', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          comments: [makeComment('c1', 'Solo comment')],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<CommentSection postId="post-single-page" />);

    await waitFor(() => expect(screen.getByText('Solo comment')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });

  it('handles API error gracefully — heading still renders', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    renderWithProviders(<CommentSection postId="post-error" />);

    // Wait for the loading state to clear
    await waitFor(() => {
      expect(screen.queryByText('Comments')).toBeInTheDocument();
    });
  });

  it('does not show the Spin after comments have loaded', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    const { container } = renderWithProviders(<CommentSection postId="post-no-spin" />);

    await waitFor(() => expect(screen.getByText(/No comments yet/)).toBeInTheDocument());
    expect(container.querySelector('.ant-spin')).toBeFalsy();
  });

  it('shows comment count from initialCommentsCount immediately before API resolves', () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    renderWithProviders(<CommentSection postId="post-initial-count" initialCommentsCount={7} />);

    // Should render before the API resolves
    expect(screen.getByText('(7)')).toBeInTheDocument();
  });

  it('renders postId-specific data: different postIds call API with their own id', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="unique-post-xyz" />);

    await waitFor(() => {
      expect(commentApi.getComments).toHaveBeenCalledWith(
        'unique-post-xyz',
        expect.any(Object)
      );
    });
  });
});
