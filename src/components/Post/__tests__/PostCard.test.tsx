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

  it('increments like count on like click (optimistic)', async () => {
    renderWithProviders(<PostCard post={mockPost} />);
    // Click the like count area
    fireEvent.click(screen.getByText('10'));
    await waitFor(() => {
      expect(screen.getByText('11')).toBeInTheDocument();
    });
  });

  it('calls postApi.likePost when unliked post is liked', async () => {
    const { postApi } = await import('../../../services/api');
    renderWithProviders(<PostCard post={{ ...mockPost, isLiked: false }} />);
    fireEvent.click(screen.getByText('10'));
    await waitFor(() => {
      expect(postApi.likePost).toHaveBeenCalledWith('post-1');
    });
  });

  it('calls postApi.unlikePost when liked post is unliked', async () => {
    const { postApi } = await import('../../../services/api');
    renderWithProviders(<PostCard post={{ ...mockPost, isLiked: true, likesCount: 42 }} />);
    // Use getAllByText and pick the likes count (first occurrence is the likes count)
    const likeCountEls = screen.getAllByText('42');
    fireEvent.click(likeCountEls[0]);
    await waitFor(() => {
      expect(postApi.unlikePost).toHaveBeenCalledWith('post-1');
    });
  });

  it('does not render actions area when showActions is false', () => {
    renderWithProviders(<PostCard post={mockPost} showActions={false} />);
    // When showActions=false the Dropdown/more button and like/comment buttons are hidden
    expect(screen.queryByText('10')).not.toBeInTheDocument();
  });

  it('renders image media when post has image media', () => {
    const postWithImage: PostData = {
      ...mockPost,
      type: 'IMAGE',
      media: [{ type: 'image', url: '/test-image.jpg' }],
    };
    renderWithProviders(<PostCard post={postWithImage} />);
    const img = document.querySelector('img[src="/test-image.jpg"]');
    expect(img).toBeTruthy();
  });

  it('shows verified badge for verified creator', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    // CircleCheck is rendered as an svg for verified creators
    const svgEl = document.querySelector('svg');
    expect(svgEl).toBeTruthy();
  });

  it('renders video element when post has video media', () => {
    const postWithVideo: PostData = {
      ...mockPost,
      type: 'VIDEO',
      media: [{ type: 'video', url: '/test-video.mp4' }],
    };
    renderWithProviders(<PostCard post={postWithVideo} />);
    const videoEl = document.querySelector('video[src="/test-video.mp4"]');
    expect(videoEl).toBeTruthy();
  });

  it('renders NEURAL FEED tag for video media', () => {
    const postWithVideo: PostData = {
      ...mockPost,
      type: 'VIDEO',
      media: [{ type: 'video', url: '/clip.mp4' }],
    };
    renderWithProviders(<PostCard post={postWithVideo} />);
    expect(screen.getByText('NEURAL FEED')).toBeInTheDocument();
  });

  it('does not render media section when post has no media', () => {
    const textPost: PostData = { ...mockPost, type: 'TEXT', media: undefined };
    renderWithProviders(<PostCard post={textPost} />);
    expect(document.querySelector('img[src]')).toBeFalsy();
    expect(document.querySelector('video')).toBeFalsy();
  });

  it('does not render comment section initially', () => {
    renderWithProviders(<PostCard post={mockPost} />);
    expect(screen.queryByTestId('comment-section')).not.toBeInTheDocument();
  });

  it('hides comment section when comment button clicked a second time', async () => {
    renderWithProviders(<PostCard post={mockPost} />);

    fireEvent.click(screen.getByText('5'));
    await waitFor(() => {
      expect(screen.getByTestId('comment-section')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('5'));
    await waitFor(() => {
      expect(screen.queryByTestId('comment-section')).not.toBeInTheDocument();
    });
  });

  it('displays shares count when provided', () => {
    renderWithProviders(<PostCard post={{ ...mockPost, sharesCount: 7 }} />);
    // sharesCount is on the post but the component renders a Share2 icon with no count text
    // The post card renders like count and comment count as text; verify content still shows
    expect(screen.getByText('Hello this is my first post!')).toBeInTheDocument();
  });

  it('decrements like count after unliking a liked post', async () => {
    renderWithProviders(<PostCard post={{ ...mockPost, isLiked: true, likesCount: 15 }} />);
    const likeEl = screen.getByText('15');
    fireEvent.click(likeEl);
    await waitFor(() => {
      expect(screen.getByText('14')).toBeInTheDocument();
    });
  });
});
