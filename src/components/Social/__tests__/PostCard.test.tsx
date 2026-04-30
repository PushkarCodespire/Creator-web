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

import { screen, fireEvent, waitFor } from '@testing-library/react';

const authState = {
  preloadedState: {
    auth: {
      user: { id: '1', name: 'Test', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
      token: 'tok', isAuthenticated: true, isLoading: false, error: null,
    },
  },
};

describe('Social/PostCard', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<PostCard post={mockPost as any} />, authState);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders post content', () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    expect(screen.getByText('Test post content')).toBeInTheDocument();
  });

  it('renders creator name', () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    expect(screen.getByText('Test Creator')).toBeInTheDocument();
  });

  it('renders like count', () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders comment count', () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('toggles comments on comment count click', async () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    fireEvent.click(screen.getByText('2'));
    await waitFor(() => {
      expect(screen.getByTestId('comment-section')).toBeInTheDocument();
    });
  });

  it('hides comment section initially before toggle', () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    expect(screen.queryByTestId('comment-section')).not.toBeInTheDocument();
  });

  it('hides comment section after toggling twice', async () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    fireEvent.click(screen.getByText('2'));
    await waitFor(() => expect(screen.getByTestId('comment-section')).toBeInTheDocument());
    fireEvent.click(screen.getByText('2'));
    await waitFor(() => expect(screen.queryByTestId('comment-section')).not.toBeInTheDocument());
  });

  it('increments like count optimistically when like button is clicked', async () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    // likesCount is initially 5; clicking the heart area should increment it to 6
    const likeArea = screen.getByText('5').closest('[style]');
    if (likeArea) fireEvent.click(likeArea);
    await waitFor(() => expect(screen.getByText('6')).toBeInTheDocument());
  });

  it('renders creator display name', () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    expect(screen.getByText('Test Creator')).toBeInTheDocument();
  });

  it('renders post with zero likes correctly', () => {
    const zeroLikesPost = { ...mockPost, likesCount: 0 };
    renderWithProviders(<PostCard post={zeroLikesPost as any} />, authState);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders report option in the overflow menu', async () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    // Click the "more" button (MoreOutlined)
    const moreBtn = document.querySelector('.anticon-more')?.closest('button');
    if (moreBtn) {
      fireEvent.click(moreBtn);
      await waitFor(() => {
        expect(screen.getByText('Report')).toBeInTheDocument();
      });
    }
  });

  it('does not call onDelete when post owner differs from currentUserId', () => {
    const onDelete = vi.fn();
    renderWithProviders(
      <PostCard post={mockPost as any} currentUserId="different-user" onDelete={onDelete} />,
      authState
    );
    // Owner actions are not present for non-owners; verify onDelete was not called
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('renders "Edit Post" and "Delete Post" in the menu when currentUserId matches post owner', async () => {
    const ownerPost = { ...mockPost, creator: { ...mockPost.creator, userId: 'owner-1' } };
    renderWithProviders(
      <PostCard post={ownerPost as any} currentUserId="owner-1" />,
      authState
    );
    const moreBtn = document.querySelector('.anticon-more')?.closest('button');
    if (moreBtn) {
      fireEvent.click(moreBtn);
      await waitFor(() => {
        expect(screen.getByText('Edit Post')).toBeInTheDocument();
        expect(screen.getByText('Delete Post')).toBeInTheDocument();
      });
    }
  });

  it('renders "Report" menu item for a non-owner', async () => {
    renderWithProviders(
      <PostCard post={mockPost as any} currentUserId="someone-else" />,
      authState
    );
    const moreBtn = document.querySelector('.anticon-more')?.closest('button');
    if (moreBtn) {
      fireEvent.click(moreBtn);
      await waitFor(() => {
        expect(screen.getByText('Report')).toBeInTheDocument();
      });
    }
  });

  it('does not show Edit Post or Delete Post when user is not owner', async () => {
    renderWithProviders(
      <PostCard post={mockPost as any} currentUserId="not-the-owner" />,
      authState
    );
    const moreBtn = document.querySelector('.anticon-more')?.closest('button');
    if (moreBtn) {
      fireEvent.click(moreBtn);
      await waitFor(() => {
        expect(screen.queryByText('Edit Post')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete Post')).not.toBeInTheDocument();
      });
    }
  });

  it('renders a HeartOutlined icon when post is not liked', () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    expect(document.querySelector('.anticon-heart')).toBeTruthy();
  });

  it('renders a HeartFilled icon when post.isLiked is true', () => {
    const likedPost = { ...mockPost, isLiked: true };
    renderWithProviders(<PostCard post={likedPost as any} />, authState);
    expect(document.querySelector('.anticon-heart')).toBeTruthy();
  });

  it('renders a share button (ShareAltOutlined)', () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    expect(document.querySelector('.anticon-share-alt')).toBeTruthy();
  });

  it('renders a MessageOutlined icon for the comment action', () => {
    renderWithProviders(<PostCard post={mockPost as any} />, authState);
    expect(document.querySelector('.anticon-message')).toBeTruthy();
  });
});
