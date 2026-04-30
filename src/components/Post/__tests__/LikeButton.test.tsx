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

  it('calls unlikePost API on click when already liked', async () => {
    renderWithProviders(
      <LikeButton postId="post-2" initialLiked={true} initialLikeCount={10} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );

    fireEvent.click(screen.getByText('10'));

    await waitFor(() => {
      expect(postApi.unlikePost).toHaveBeenCalledWith('post-2');
    });
  });

  it('optimistically increments count when liking', async () => {
    renderWithProviders(
      <LikeButton postId="post-3" initialLiked={false} initialLikeCount={7} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );

    fireEvent.click(screen.getByText('7'));

    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  it('optimistically decrements count when unliking', async () => {
    renderWithProviders(
      <LikeButton postId="post-4" initialLiked={true} initialLikeCount={15} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );

    fireEvent.click(screen.getByText('15'));

    await waitFor(() => {
      expect(screen.getByText('14')).toBeInTheDocument();
    });
  });

  it('calls onLikeChange callback with new liked state and count', async () => {
    const onLikeChange = vi.fn();

    renderWithProviders(
      <LikeButton postId="post-5" initialLiked={false} initialLikeCount={3} onLikeChange={onLikeChange} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );

    fireEvent.click(screen.getByText('3'));

    await waitFor(() => {
      expect(onLikeChange).toHaveBeenCalledWith(true, 4);
    });
  });

  it('updates state when initialLiked prop changes', () => {
    const { rerender } = renderWithProviders(
      <LikeButton postId="post-6" initialLiked={false} initialLikeCount={5} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );

    expect(screen.getByText('5')).toBeInTheDocument();

    rerender(<LikeButton postId="post-6" initialLiked={true} initialLikeCount={6} />);

    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('reverts count on API failure', async () => {
    (postApi.likePost as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(
      <LikeButton postId="post-7" initialLiked={false} initialLikeCount={20} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );

    fireEvent.click(screen.getByText('20'));

    // After revert the original count returns
    await waitFor(() => {
      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });

  it('reverts liked state on unlikePost API failure', async () => {
    (postApi.unlikePost as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(
      <LikeButton postId="post-8" initialLiked={true} initialLikeCount={5} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );

    fireEvent.click(screen.getByText('5'));

    // Should revert back to original count after failure
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('does not call API when user is not authenticated', async () => {
    renderWithProviders(
      <LikeButton postId="post-9" initialLiked={false} initialLikeCount={3} />,
      { preloadedState: { auth: { isAuthenticated: false, user: null } as any } }
    );

    fireEvent.click(screen.getByText('3'));

    await waitFor(() => {
      expect(postApi.likePost).not.toHaveBeenCalled();
    });
  });

  it('renders HeartFilled icon when initialLiked is true', () => {
    const { container } = renderWithProviders(
      <LikeButton postId="post-10" initialLiked={true} initialLikeCount={1} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );
    // HeartFilled renders an anticon-heart-filled span
    expect(container.querySelector('.anticon-heart-fill')).toBeInTheDocument();
  });

  it('renders HeartOutlined icon when initialLiked is false', () => {
    const { container } = renderWithProviders(
      <LikeButton postId="post-11" initialLiked={false} initialLikeCount={1} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );
    expect(container.querySelector('.anticon-heart')).toBeInTheDocument();
  });

  it('calls onLikeChange with false and decremented count when unliking', async () => {
    const onLikeChange = vi.fn();

    renderWithProviders(
      <LikeButton postId="post-12" initialLiked={true} initialLikeCount={9} onLikeChange={onLikeChange} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );

    fireEvent.click(screen.getByText('9'));

    await waitFor(() => {
      expect(onLikeChange).toHaveBeenCalledWith(false, 8);
    });
  });

  it('shows localized count for large numbers', () => {
    renderWithProviders(
      <LikeButton postId="post-13" initialLiked={false} initialLikeCount={1000} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );
    // toLocaleString() renders 1,000 in most locales
    expect(screen.getByText(/1[,.]?000/)).toBeInTheDocument();
  });

  it('does not render count span when showCount is false even with non-zero count', () => {
    const { container } = renderWithProviders(
      <LikeButton postId="post-14" initialLikeCount={99} showCount={false} />,
      { preloadedState: { auth: { isAuthenticated: true, user: { id: 'u1' } } as any } }
    );
    expect(screen.queryByText('99')).not.toBeInTheDocument();
  });
});
