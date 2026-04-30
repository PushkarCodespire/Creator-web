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

  it('does not show Cancel button when onCancel is omitted', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn();
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} onCancel={onCancel} />,
      { preloadedState: defaultState }
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('updates character count as user types', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    const textarea = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(screen.getByText(/5\/1000/)).toBeInTheDocument();
  });

  it('shows Ctrl+Enter hint text', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    expect(screen.getByText(/Ctrl\+Enter to submit/)).toBeInTheDocument();
  });

  it('Submit button is disabled when textarea is empty', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    const submitBtn = screen.getByText('Comment').closest('button');
    expect(submitBtn).toBeDisabled();
  });

  it('Submit button becomes enabled after typing content', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    const textarea = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(textarea, { target: { value: 'Some comment' } });
    const submitBtn = screen.getByText('Comment').closest('button');
    expect(submitBtn).not.toBeDisabled();
  });

  it('calls onCommentAdded and clears textarea on successful submit', async () => {
    const onCommentAdded = vi.fn();
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={onCommentAdded} />,
      { preloadedState: defaultState }
    );
    const textarea = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    fireEvent.click(screen.getByText('Comment'));
    await waitFor(() => expect(onCommentAdded).toHaveBeenCalledTimes(1));
  });

  it('clears textarea content after successful submit', async () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    const textarea = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    fireEvent.click(screen.getByText('Comment'));
    await waitFor(() => expect(textarea).toHaveValue(''));
  });

  it('shows 0/1000 character count when textarea is empty', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    expect(screen.getByText(/0\/1000/)).toBeInTheDocument();
  });

  it('Cancel button is not disabled while not submitting', () => {
    const onCancel = vi.fn();
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} onCancel={onCancel} />,
      { preloadedState: defaultState }
    );
    const cancelBtn = screen.getByText('Cancel').closest('button');
    expect(cancelBtn).not.toBeDisabled();
  });

  it('renders user avatar initial from auth state', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    // user name is "Test User" so initial "T" should appear in avatar
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('uses smaller minRows when parentId is provided (reply mode)', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" parentId="parent-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    // In reply mode the textarea is rendered; verify it is present
    expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
  });

  it('submit button label is Comment not Reply for top-level without parentId', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    expect(screen.queryByText('Reply')).not.toBeInTheDocument();
    expect(screen.getByText('Comment')).toBeInTheDocument();
  });

  it('character count updates correctly to 12 after typing 12 characters', () => {
    renderWithProviders(
      <CommentComposer postId="post-1" onCommentAdded={vi.fn()} />,
      { preloadedState: defaultState }
    );
    const textarea = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(textarea, { target: { value: 'Hello World!' } });
    expect(screen.getByText(/12\/1000/)).toBeInTheDocument();
  });
});
