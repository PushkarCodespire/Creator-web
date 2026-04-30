import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CommentItem from '../CommentItem';
import type { Comment } from '../../../types';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, style, ...props }: any) => (
      <div onClick={onClick} style={style} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  commentApi: {
    likeComment: vi.fn().mockResolvedValue({}),
    unlikeComment: vi.fn().mockResolvedValue({}),
    getReplies: vi.fn().mockResolvedValue({ data: { data: { replies: [] } } }),
    deleteComment: vi.fn().mockResolvedValue({}),
    updateComment: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
}));

vi.mock('../../../styles/animations', () => ({
  likeAnimation: { like: {}, unlike: {} },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

const mockComment: Comment = {
  id: 'comment-1',
  userId: 'user-1',
  postId: 'post-1',
  content: 'This is a great post!',
  likesCount: 3,
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  updatedAt: new Date(Date.now() - 3600000).toISOString(),
  user: {
    id: 'user-1',
    name: 'Jane Doe',
    avatar: '/avatar.jpg',
  },
  _count: { replies: 2 },
};

describe('CommentItem', () => {
  it('renders comment content and user name', () => {
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />
    );
    expect(screen.getByText('This is a great post!')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows likes count when greater than zero', () => {
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows Reply button', () => {
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />
    );
    expect(screen.getByText('Reply')).toBeInTheDocument();
  });

  it('shows view replies button when replies exist', () => {
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />
    );
    expect(screen.getByText(/View 2 replies/)).toBeInTheDocument();
  });

  it('toggles like optimistically on click', async () => {
    const { commentApi } = await import('../../../services/api');
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />,
      { preloadedState: { auth: { user: { id: 'user-99', name: 'Other', email: 'o@o.com', role: 'USER' as const, isVerified: true, createdAt: '' }, token: 'tok', isAuthenticated: true, isLoading: false, error: null } } }
    );
    // Like count starts at 3; clicking should call likeComment
    const heartArea = screen.getByText('3').closest('div') ?? screen.getByText('3');
    fireEvent.click(heartArea);
    await waitFor(() => {
      expect(commentApi.likeComment).toHaveBeenCalledWith('comment-1');
    });
  });

  it('shows reply composer when Reply is clicked', async () => {
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />
    );
    // Before click: only one "Reply" text (the button)
    expect(screen.getAllByText('Reply').length).toBe(1);
    fireEvent.click(screen.getByText('Reply'));
    // After click: CommentComposer mounts; it renders a reply button internally
    // so there should be at least one textarea or the composer area appears
    await waitFor(() => {
      // CommentComposer renders a textarea for input
      const textareas = document.querySelectorAll('textarea');
      expect(textareas.length).toBeGreaterThan(0);
    });
  });

  it('shows edit and delete menu for comment owner', async () => {
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />,
      {
        preloadedState: {
          auth: {
            user: { id: 'user-1', name: 'Jane Doe', email: 'j@j.com', role: 'USER' as const, isVerified: true, createdAt: '' },
            token: 'tok',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          },
        },
      }
    );
    // The MoreOutlined icon (ellipsis) should be present for owners
    const moreBtn = document.querySelector('.anticon-more');
    expect(moreBtn).toBeTruthy();
  });

  it('does not show edit/delete menu for non-owners', () => {
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />,
      {
        preloadedState: {
          auth: {
            user: { id: 'other-user', name: 'Someone', email: 's@s.com', role: 'USER' as const, isVerified: true, createdAt: '' },
            token: 'tok',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          },
        },
      }
    );
    const moreBtn = document.querySelector('.anticon-more');
    expect(moreBtn).toBeFalsy();
  });

  it('renders (edited) label when updatedAt differs from createdAt', () => {
    const editedComment: typeof mockComment = {
      ...mockComment,
      updatedAt: new Date(Date.now() - 100000).toISOString(), // different from createdAt
    };
    renderWithProviders(
      <CommentItem
        comment={editedComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />
    );
    expect(screen.getByText('(edited)')).toBeInTheDocument();
  });

  it('loads replies when View replies button is clicked', async () => {
    const { commentApi } = await import('../../../services/api');
    (commentApi.getReplies as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { replies: [{ ...mockComment, id: 'reply-1', content: 'A reply' }] } },
    });
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText(/View 2 replies/));
    await waitFor(() => {
      expect(commentApi.getReplies).toHaveBeenCalledWith('comment-1');
    });
  });

  it('renders loaded reply content after clicking View replies', async () => {
    const { commentApi } = await import('../../../services/api');
    (commentApi.getReplies as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { replies: [{ ...mockComment, id: 'reply-1', content: 'Here is a reply' }] } },
    });
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText(/View 2 replies/));
    await waitFor(() => {
      expect(screen.getByText('Here is a reply')).toBeInTheDocument();
    });
  });

  it('does not show View replies button when comment has no replies', () => {
    const noRepliesComment: Comment = { ...mockComment, _count: { replies: 0 } };
    renderWithProviders(
      <CommentItem
        comment={noRepliesComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />
    );
    expect(screen.queryByText(/View.*repl/i)).not.toBeInTheDocument();
  });

  it('shows avatar with first letter of username when no avatar src', () => {
    const noAvatarComment: Comment = { ...mockComment, user: { ...mockComment.user, avatar: undefined } };
    renderWithProviders(
      <CommentItem
        comment={noAvatarComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />
    );
    // Avatar renders the first letter of the user name
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('optimistically decrements like count when unliking', async () => {
    const { commentApi } = await import('../../../services/api');
    // First like then unlike: start liked state by clicking once, then again
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />,
      { preloadedState: { auth: { user: { id: 'user-99', name: 'Other', email: 'o@o.com', role: 'USER' as const, isVerified: true, createdAt: '' }, token: 'tok', isAuthenticated: true, isLoading: false, error: null } } }
    );
    const heartArea = screen.getByText('3').closest('div') ?? screen.getByText('3');
    // First click: like (count goes to 4)
    fireEvent.click(heartArea);
    await waitFor(() => expect(commentApi.likeComment).toHaveBeenCalled());
    // Second click: unlike (count goes back to 3)
    fireEvent.click(heartArea);
    await waitFor(() => expect(commentApi.unlikeComment).toHaveBeenCalledWith('comment-1'));
  });

  it('renders ADMIN user with edit/delete menu (canModify via isAdmin)', () => {
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
      />,
      {
        preloadedState: {
          auth: {
            user: { id: 'admin-user', name: 'Admin', email: 'admin@a.com', role: 'ADMIN' as const, isVerified: true, createdAt: '' },
            token: 'tok',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          },
        },
      }
    );
    const moreBtn = document.querySelector('.anticon-more');
    expect(moreBtn).toBeTruthy();
  });

  it('Reply button is hidden at max depth (depth=3)', () => {
    renderWithProviders(
      <CommentItem
        comment={mockComment}
        postId="post-1"
        onCommentUpdate={vi.fn()}
        onCommentDelete={vi.fn()}
        onReplyAdded={vi.fn()}
        depth={3}
      />
    );
    expect(screen.queryByText('Reply')).not.toBeInTheDocument();
  });
});
