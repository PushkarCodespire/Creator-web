import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import LikeButton from '../LikeButton';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, style, ...props }: any) => (
      <div onClick={onClick} style={style} {...props}>{children}</div>
    ),
    span: ({ children, style, ...props }: any) => (
      <span style={style} {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  postApi: {
    likePost: vi.fn().mockResolvedValue({}),
    unlikePost: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../../styles/animations', () => ({
  likeAnimation: {
    like: { scale: 1.2 },
    unlike: { scale: 1 },
  },
}));

import { postApi } from '../../../services/api';

describe('LikeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial like count', () => {
    renderWithProviders(
      <LikeButton postId="post-1" initialLikeCount={42} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('does not show count when count is zero', () => {
    renderWithProviders(
      <LikeButton postId="post-1" initialLikeCount={0} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );
    // Empty string is rendered when count is 0
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('hides count when showCount is false', () => {
    renderWithProviders(
      <LikeButton postId="post-1" initialLikeCount={10} showCount={false} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );
    expect(screen.queryByText('10')).not.toBeInTheDocument();
  });

  it('calls likePost API on click when not liked', async () => {
    const { container } = renderWithProviders(
      <LikeButton postId="post-1" initialLiked={false} initialLikeCount={5} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );

    // The outermost div has the onClick handler; click the text which bubbles up
    fireEvent.click(screen.getByText('5'));

    await waitFor(() => {
      expect(postApi.likePost).toHaveBeenCalledWith('post-1');
    });
  });
});
