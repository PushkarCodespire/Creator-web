import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  bookmarkApi: {
    getBookmarks: vi.fn().mockResolvedValue({
      data: {
        data: {
          bookmarks: [
            {
              id: 'b1',
              message: {
                id: 'm1',
                content: 'Great fitness tip!',
                role: 'ASSISTANT',
                createdAt: '2026-04-10T00:00:00Z',
                conversation: {
                  id: 'conv1',
                  creator: { id: 'c1', displayName: 'Fitness Pro', profileImage: null },
                },
              },
              createdAt: '2026-04-10T00:00:00Z',
            },
          ],
        },
      },
    }),
    getRecommendations: vi.fn().mockResolvedValue({
      data: {
        data: {
          recommendations: [],
        },
      },
    }),
    deleteBookmark: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  getImageUrl: vi.fn((path: string) => path || ''),
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import UserBookmarks from '../UserBookmarks';

describe('UserBookmarks', () => {
  it('renders bookmarks after data loads', async () => {
    renderWithProviders(<UserBookmarks />);

    await waitFor(() => {
      expect(screen.getByText(/great fitness tip/i)).toBeInTheDocument();
    });
  });

  it('renders the page title', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText('Bookmarks')).toBeInTheDocument();
    });
  });

  it('renders the creator name in bookmark', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText('Fitness Pro')).toBeInTheDocument();
    });
  });

  it('renders the page subtitle', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText(/Your saved messages and important notes/i)).toBeInTheDocument();
    });
  });

  it('renders search input for bookmarks', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search in message content...')).toBeInTheDocument();
    });
  });

  it('renders the Show Filters button', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText('Show Filters')).toBeInTheDocument();
    });
  });

  it('toggles filter panel visibility when Show Filters is clicked', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText('Show Filters')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Show Filters'));
    await waitFor(() => {
      expect(screen.getByText('Hide Filters')).toBeInTheDocument();
    });
  });

  it('shows Reset Filters button when filters are visible', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText('Show Filters')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Show Filters'));
    await waitFor(() => {
      expect(screen.getByText('Reset Filters')).toBeInTheDocument();
    });
  });

  it('renders View Chat action button for each bookmark', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText('View Chat')).toBeInTheDocument();
    });
  });

  it('renders Remove action button for each bookmark', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText('Remove')).toBeInTheDocument();
    });
  });

  it('renders quoted message content', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText(/"Great fitness tip!"/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when bookmarks list is empty', async () => {
    const { bookmarkApi } = await import('../../../services/api');
    (bookmarkApi.getBookmarks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { bookmarks: [] } },
    });

    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText('No bookmarked messages yet')).toBeInTheDocument();
    });
  });

  it('shows Filter by Creator placeholder when filters are revealed', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => expect(screen.getByText('Show Filters')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Show Filters'));
    await waitFor(() => {
      expect(screen.getByTitle(/Filter by Creator/i)).toBeInTheDocument();
    });
  });

  it('resets search input after Reset Filters is clicked', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => expect(screen.getByText('Show Filters')).toBeInTheDocument());
    const searchInput = screen.getByPlaceholderText('Search in message content...');
    fireEvent.change(searchInput, { target: { value: 'fitness' } });
    expect(searchInput).toHaveValue('fitness');
    fireEvent.click(screen.getByText('Show Filters'));
    await waitFor(() => expect(screen.getByText('Reset Filters')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Reset Filters'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search in message content...')).toHaveValue('');
    });
  });

  it('renders a Saved date label on each bookmark card', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText(/Saved/i)).toBeInTheDocument();
    });
  });

  it('hides filters again when Hide Filters is clicked', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => expect(screen.getByText('Show Filters')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Show Filters'));
    await waitFor(() => expect(screen.getByText('Hide Filters')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Hide Filters'));
    await waitFor(() => {
      expect(screen.getByText('Show Filters')).toBeInTheDocument();
      expect(screen.queryByText('Reset Filters')).not.toBeInTheDocument();
    });
  });

  it('calls getBookmarks API on initial mount', async () => {
    const { bookmarkApi } = await import('../../../services/api');
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(bookmarkApi.getBookmarks).toHaveBeenCalled();
    });
  });

  it('calls getRecommendations API on initial mount', async () => {
    const { bookmarkApi } = await import('../../../services/api');
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(bookmarkApi.getRecommendations).toHaveBeenCalled();
    });
  });

  it('shows message content wrapped in double-quotes', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText(/"Great fitness tip!"/)).toBeInTheDocument();
    });
  });

  it('renders the BookOutlined icon area (anticon-book) in page title', async () => {
    const { container } = renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText('Bookmarks')).toBeInTheDocument();
    });
    expect(container.querySelector('.anticon-book')).toBeTruthy();
  });

  it('filters are hidden by default before Show Filters is clicked', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText('Show Filters')).toBeInTheDocument();
    });
    expect(screen.queryByText('Reset Filters')).not.toBeInTheDocument();
  });

  it('renders Filter by Conversation select when filters are shown', async () => {
    renderWithProviders(<UserBookmarks />);
    await waitFor(() => expect(screen.getByText('Show Filters')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Show Filters'));
    await waitFor(() => {
      expect(screen.getByTitle(/Filter by Conversation/i)).toBeInTheDocument();
    });
  });

  it('shows empty-state icon when there are no bookmarks', async () => {
    const { bookmarkApi } = await import('../../../services/api');
    (bookmarkApi.getBookmarks as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { bookmarks: [] } },
    });
    const { container } = renderWithProviders(<UserBookmarks />);
    await waitFor(() => {
      expect(screen.getByText('No bookmarked messages yet')).toBeInTheDocument();
    });
    // Ant Design Empty renders an svg image
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
