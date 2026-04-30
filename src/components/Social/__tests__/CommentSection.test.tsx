vi.mock('../../../services/api', () => ({
  commentApi: {
    getComments: vi.fn().mockResolvedValue({
      data: { success: true, data: { comments: [], pagination: { total: 0 } } },
    }),
    createComment: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    likeComment: vi.fn().mockResolvedValue({ data: {} }),
    unlikeComment: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CommentSection from '../CommentSection';
import { commentApi } from '../../../services/api';

const authState = {
  auth: {
    user: { id: '1', name: 'Test', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

const guestState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
};

describe('Social/CommentSection', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CommentSection postId="post-1" />, {
      preloadedState: authState,
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with initialCommentsCount', () => {
    const { container } = renderWithProviders(
      <CommentSection postId="post-2" initialCommentsCount={5} />,
      { preloadedState: guestState }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('shows "Comments (0)" heading', async () => {
    renderWithProviders(<CommentSection postId="post-1" />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText(/Comments \(/)).toBeInTheDocument();
    });
  });

  it('shows "Please log in to leave a comment" for unauthenticated users', () => {
    renderWithProviders(<CommentSection postId="post-1" />, { preloadedState: guestState });
    expect(screen.getByText('Please log in to leave a comment')).toBeInTheDocument();
  });

  it('shows "Write a comment..." textarea for authenticated users', async () => {
    renderWithProviders(<CommentSection postId="post-1" />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    });
  });

  it('shows "Post Comment" button for authenticated users', async () => {
    renderWithProviders(<CommentSection postId="post-1" />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Post Comment')).toBeInTheDocument();
    });
  });

  it('shows empty state message when no comments', async () => {
    renderWithProviders(<CommentSection postId="post-1" />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
    });
  });

  it('calls commentApi.createComment when Post Comment is clicked with text', async () => {
    renderWithProviders(<CommentSection postId="post-42" />, { preloadedState: authState });
    const textarea = await waitFor(() => screen.getByPlaceholderText('Write a comment...'));
    fireEvent.change(textarea, { target: { value: 'Great post!' } });
    const postBtn = screen.getByText('Post Comment');
    fireEvent.click(postBtn);
    await waitFor(() => {
      expect(commentApi.createComment).toHaveBeenCalledWith('post-42', expect.objectContaining({ content: 'Great post!' }));
    });
  });

  it('does not call commentApi.createComment when comment is empty', async () => {
    (commentApi.createComment as ReturnType<typeof vi.fn>).mockClear();
    renderWithProviders(<CommentSection postId="post-43" />, { preloadedState: authState });
    await waitFor(() => screen.getByText('Post Comment'));
    fireEvent.click(screen.getByText('Post Comment'));
    expect(commentApi.createComment).not.toHaveBeenCalled();
  });

  it('displays comment list items when comments are returned by API', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          comments: [
            { id: 'c1', content: 'First comment', createdAt: new Date().toISOString(), user: { id: 'u1', name: 'Alice' }, likesCount: 0, isLiked: false, replies: [] },
          ],
          pagination: { total: 1 },
        },
      },
    });
    renderWithProviders(<CommentSection postId="post-44" />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('First comment')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  it('calls commentApi.likeComment when Like is clicked on a comment', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          comments: [
            { id: 'c2', content: 'Likeable comment', createdAt: new Date().toISOString(), user: { id: 'u2', name: 'Bob' }, likesCount: 0, isLiked: false, replies: [] },
          ],
          pagination: { total: 1 },
        },
      },
    });
    renderWithProviders(<CommentSection postId="post-45" />, { preloadedState: authState });
    const likeBtn = await waitFor(() => screen.getByText('Like'));
    fireEvent.click(likeBtn);
    await waitFor(() => {
      expect(commentApi.likeComment).toHaveBeenCalledWith('c2');
    });
  });

  it('shows initialCommentsCount in the heading before API resolves', () => {
    renderWithProviders(
      <CommentSection postId="post-46" initialCommentsCount={12} />,
      { preloadedState: authState }
    );
    expect(screen.getByText('Comments (12)')).toBeInTheDocument();
  });

  it('calls commentApi.unlikeComment when clicking a liked comment', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          comments: [
            { id: 'c3', content: 'Already liked', createdAt: new Date().toISOString(), user: { id: 'u3', name: 'Carol' }, likesCount: 5, isLiked: true, replies: [] },
          ],
          pagination: { total: 1 },
        },
      },
    });
    renderWithProviders(<CommentSection postId="post-47" />, { preloadedState: authState });
    const likedBtn = await waitFor(() => screen.getByText(/Liked/));
    fireEvent.click(likedBtn);
    await waitFor(() => {
      expect(commentApi.unlikeComment).toHaveBeenCalledWith('c3');
    });
  });

  it('shows "Reply" action on each comment', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          comments: [
            { id: 'c4', content: 'Reply to me', createdAt: new Date().toISOString(), user: { id: 'u4', name: 'Dave' }, likesCount: 0, isLiked: false, replies: [] },
          ],
          pagination: { total: 1 },
        },
      },
    });
    renderWithProviders(<CommentSection postId="post-48" />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Reply')).toBeInTheDocument();
    });
  });

  it('shows reply input when Reply is clicked on a comment', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          comments: [
            { id: 'c5', content: 'Click Reply', createdAt: new Date().toISOString(), user: { id: 'u5', name: 'Eve' }, likesCount: 0, isLiked: false, replies: [] },
          ],
          pagination: { total: 1 },
        },
      },
    });
    renderWithProviders(<CommentSection postId="post-49" />, { preloadedState: authState });
    const replyBtn = await waitFor(() => screen.getByText('Reply'));
    fireEvent.click(replyBtn);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Reply to Eve/)).toBeInTheDocument();
    });
  });

  it('renders nested replies indented under the parent comment', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          comments: [
            {
              id: 'c6',
              content: 'Parent comment',
              createdAt: new Date().toISOString(),
              user: { id: 'u6', name: 'Frank' },
              likesCount: 0,
              isLiked: false,
              replies: [
                { id: 'r1', content: 'Child reply', createdAt: new Date().toISOString(), user: { id: 'u7', name: 'Grace' }, likesCount: 0, isLiked: false, replies: [] },
              ],
            },
          ],
          pagination: { total: 1 },
        },
      },
    });
    renderWithProviders(<CommentSection postId="post-50" />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText('Child reply')).toBeInTheDocument();
      expect(screen.getByText('Grace')).toBeInTheDocument();
    });
  });

  it('displays like count next to a liked comment with likes', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          comments: [
            { id: 'c7', content: 'Popular comment', createdAt: new Date().toISOString(), user: { id: 'u8', name: 'Henry' }, likesCount: 7, isLiked: false, replies: [] },
          ],
          pagination: { total: 1 },
        },
      },
    });
    renderWithProviders(<CommentSection postId="post-51" />, { preloadedState: authState });
    await waitFor(() => {
      expect(screen.getByText(/\(7\)/)).toBeInTheDocument();
    });
  });

  it('calls commentApi.getComments with the correct postId', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockClear();
    renderWithProviders(<CommentSection postId="post-unique-99" />, { preloadedState: authState });
    await waitFor(() => {
      expect(commentApi.getComments).toHaveBeenCalledWith('post-unique-99');
    });
  });
});
