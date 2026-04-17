import { screen } from '@testing-library/react';
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
});
