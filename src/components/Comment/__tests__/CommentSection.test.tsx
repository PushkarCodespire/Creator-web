import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CommentSection from '../CommentSection';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  commentApi: {
    getComments: vi.fn(),
    createComment: vi.fn(),
  },
}));

vi.mock('../../../styles/animations', () => ({
  fadeIn: {},
  staggerContainer: {},
}));

vi.mock('../../../utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { commentApi } from '../../../services/api';

describe('CommentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders comments heading', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" />);
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('shows empty state when no comments', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" />);

    await waitFor(() => {
      expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
    });
  });

  it('shows login prompt when not authenticated', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });

    await waitFor(() => {
      expect(screen.getByText('Please log in to leave a comment')).toBeInTheDocument();
    });
  });

  it('shows comment composer when authenticated', async () => {
    (commentApi.getComments as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { comments: [], pagination: { total: 0, totalPages: 1 } } },
    });

    renderWithProviders(<CommentSection postId="post-1" />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u1', name: 'Test', email: 'test@test.com', role: 'USER', isVerified: true, createdAt: '' },
          token: 'test-token',
        } as any,
      },
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    });
  });
});
