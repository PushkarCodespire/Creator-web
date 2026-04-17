import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CommentComposer from '../CommentComposer';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  commentApi: {
    createComment: vi.fn().mockResolvedValue({
      data: { data: { id: 'c1', content: 'Test comment', userId: 'u1', postId: 'p1', likesCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { id: 'u1', name: 'User' } } },
    }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

const defaultState = {
  auth: {
    user: { id: 'u1', name: 'Test User', email: 'test@test.com', role: 'USER' as const, isVerified: true, createdAt: '' },
    isAuthenticated: true,
    token: 'test-token',
  } as any,
};

describe('CommentComposer', () => {
  it('renders textarea with placeholder', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} placeholder="Reply here..." />,
      { preloadedState: defaultState }
    );
    expect(screen.getByPlaceholderText('Reply here...')).toBeInTheDocument();
  });

  it('renders Comment button for top-level comments', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    expect(screen.getByText('Comment')).toBeInTheDocument();
  });

  it('renders Reply button when parentId is provided', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" parentId="parent-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    expect(screen.getByText('Reply')).toBeInTheDocument();
  });

  it('shows character count', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    expect(screen.getByText(/0\/1000/)).toBeInTheDocument();
  });

  it('shows Cancel button when onCancel is provided', () => {
    const onCancel = vi.fn();
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} onCancel={onCancel} />,
      { preloadedState: defaultState }
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
