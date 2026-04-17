import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import PostCard, { PostData } from '../PostCard';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, style, ...props }: any) => (
      <div onClick={onClick} style={style} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../../services/api', () => ({
  postApi: {
    likePost: vi.fn().mockResolvedValue({}),
    unlikePost: vi.fn().mockResolvedValue({}),
    deletePost: vi.fn().mockResolvedValue({}),
  },
  getImageUrl: (url: string) => url,
}));

vi.mock('../../../utils/fileDownloadUtils', () => ({
  downloadFromUrl: vi.fn(),
}));

vi.mock('../../Comment', () => ({
  CommentSection: () => <div data-testid="comment-section">Comments</div>,
}));

const mockPost: PostData = {
  id: 'post-1',
  content: 'Hello this is my first post!',
  type: 'TEXT',
  createdAt: new Date().toISOString(),
  isLiked: false,
  likesCount: 10,
  commentsCount: 5,
  sharesCount: 2,
  creator: {
    id: 'creator-1',
    displayName: 'Test Creator',
    profileImage: '/avatar.jpg',
    isVerified: true,
    category: 'Tech',
  },
};

describe('PostCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders post content and creator info', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByText('Hello this is my first post!')).toBeInTheDocument();
    expect(screen.getByText('Test Creator')).toBeInTheDocument();
  });

  it('displays like and comment counts', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders category tag', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.getByText('Tech')).toBeInTheDocument();
  });

  it('navigates to creator page on creator click', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    fireEvent.click(screen.getByText('Test Creator'));
    expect(mockNavigate).toHaveBeenCalledWith('/creator/creator-1');
  });

  it('toggles comment section on comment icon click', async () => {
    renderWithProviders(<PostCard post={mockPost} />);
    // Click the comment count text to toggle comments
    fireEvent.click(screen.getByText('5'));
    await waitFor(() => {
      expect(screen.getByTestId('comment-section')).toBeInTheDocument();
    });
  });
});
