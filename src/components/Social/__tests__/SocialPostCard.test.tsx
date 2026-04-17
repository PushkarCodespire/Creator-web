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
});
