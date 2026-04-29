import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import PostCard from '../PostCard';

vi.mock('../../../services/api', () => ({
  postApi: {
    likePost: vi.fn().mockResolvedValue({}),
    unlikePost: vi.fn().mockResolvedValue({}),
    deletePost: vi.fn().mockResolvedValue({}),
  },
  getImageUrl: (url: string) => url || '/default.jpg',
}));

vi.mock('../CommentSection', () => ({
  default: () => <div data-testid="social-comment-section">Comments</div>,
}));

const mockPost = {
  id: 'post-1',
  content: 'Check out this cool post!',
  type: 'TEXT',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  likesCount: 15,
  commentsCount: 3,
  isLiked: false,
  isPublished: true,
  creator: {
    id: 'c-1',
    displayName: 'Social Creator',
    profileImage: '/avatar.jpg',
    isVerified: true,
    userId: 'u-1',
  },
};

describe('Social PostCard', () => {
  it('renders post content and creator name', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByText('Check out this cool post!')).toBeInTheDocument();
    expect(screen.getByText('Social Creator')).toBeInTheDocument();
  });

  it('renders like and comment counts', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders verified badge', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('toggles comments on comment icon click', async () => {
    renderWithProviders(<PostCard post={mockPost} />);
    // Click the comment count
    fireEvent.click(screen.getByText('3'));
    await waitFor(() => {
      expect(screen.getByTestId('social-comment-section')).toBeInTheDocument();
    });
  });

  it('renders unpublished post with a lock icon (not globe)', () => {
    const unpublishedPost = { ...mockPost, isPublished: false };
    const { container } = renderWithProviders(<PostCard post={unpublishedPost} />);
    expect(container.querySelector('.anticon-lock')).toBeTruthy();
    expect(container.querySelector('.anticon-global')).toBeFalsy();
  });

  it('renders published post with a globe icon', () => {
    const { container } = renderWithProviders(<PostCard post={mockPost} />);
    expect(container.querySelector('.anticon-global')).toBeTruthy();
  });

  it('hides comment section initially before toggle', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.queryByTestId('social-comment-section')).not.toBeInTheDocument();
  });

  it('hides comment section after toggling twice', async () => {
    renderWithProviders(<PostCard post={mockPost} />);
    fireEvent.click(screen.getByText('3'));
    await waitFor(() => {
      expect(screen.getByTestId('social-comment-section')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('3'));
    await waitFor(() => {
      expect(screen.queryByTestId('social-comment-section')).not.toBeInTheDocument();
    });
  });

  it('increments like count when like button is clicked', async () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    fireEvent.click(screen.getByText('15'));
    await waitFor(() => {
      expect(screen.getByText('16')).toBeInTheDocument();
    });
  });

  it('does not render the "Report" menu item in the DOM by default', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    // The Dropdown menu is not open by default, so Report is not visible
    expect(screen.queryByText('Report')).not.toBeInTheDocument();
  });

  it('renders the more-options button', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not render owner-only menu items when not the owner', () => {
    renderWithProviders(<PostCard post={mockPost} currentUserId="different-user" />);
    // Dropdown closed — owner items not rendered
    expect(screen.queryByText('Delete Post')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit Post')).not.toBeInTheDocument();
  });

  it('decrements like count when an already-liked post is clicked', async () => {
    const likedPost = { ...mockPost, isLiked: true, likesCount: 20 };
    renderWithProviders(<PostCard post={likedPost} />);
    expect(screen.getByText('20')).toBeInTheDocument();
    fireEvent.click(screen.getByText('20'));
    await waitFor(() => {
      expect(screen.getByText('19')).toBeInTheDocument();
    });
  });

  it('renders the share icon in the actions bar', () => {
    const { container } = renderWithProviders(<PostCard post={mockPost} />);
    expect(container.querySelector('.anticon-share-alt')).toBeTruthy();
  });

  it('renders post content using the content field', () => {
    const customPost = { ...mockPost, content: 'Unique post body text' };
    renderWithProviders(<PostCard post={customPost} />);
    expect(screen.getByText('Unique post body text')).toBeInTheDocument();
  });

  it('does not show the verified badge when creator is not verified', () => {
    const unverifiedPost = { ...mockPost, creator: { ...mockPost.creator, isVerified: false } };
    renderWithProviders(<PostCard post={unverifiedPost} />);
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });

  it('calls postApi.likePost when like is clicked on an unliked post', async () => {
    const { postApi } = await import('../../../services/api');
    (postApi.likePost as ReturnType<typeof vi.fn>).mockClear();
    renderWithProviders(<PostCard post={{ ...mockPost, isLiked: false }} />);
    fireEvent.click(screen.getByText('15'));
    await waitFor(() => {
      expect(postApi.likePost).toHaveBeenCalledWith('post-1');
    });
  });
});
