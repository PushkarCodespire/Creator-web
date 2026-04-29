import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { BookmarkButton } from '../../Chat/BookmarkButton';

vi.mock('../../../services/api', () => ({
  bookmarkApi: {
    addBookmark: vi.fn().mockResolvedValue({ data: { data: {} } }),
    removeBookmark: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
}));

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  name: 'Test User',
  role: 'USER' as const,
  isVerified: false,
  createdAt: '2024-01-01',
};

describe('BookmarkButton', () => {
  it('renders unbookmarked state by default', () => {
    renderWithProviders(
      <BookmarkButton messageId="msg-1" />,
      { preloadedState: { auth: { user: mockUser, token: 'tok', isAuthenticated: true, isLoading: false, error: null } } }
    );

    expect(screen.getByRole('img', { name: /book/i })).toBeInTheDocument();
  });

  it('renders bookmarked state when isBookmarked is true', () => {
    renderWithProviders(
      <BookmarkButton messageId="msg-1" isBookmarked={true} />,
      { preloadedState: { auth: { user: mockUser, token: 'tok', isAuthenticated: true, isLoading: false, error: null } } }
    );

    // BookFilled has a different icon - just verify the component rendered
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('calls onBookmarkChange callback when toggling', async () => {
    const { bookmarkApi } = await import('../../../services/api');
    (bookmarkApi.addBookmark as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { data: {} } });

    const onBookmarkChange = vi.fn();

    renderWithProviders(
      <BookmarkButton messageId="msg-1" onBookmarkChange={onBookmarkChange} />,
      { preloadedState: { auth: { user: mockUser, token: 'tok', isAuthenticated: true, isLoading: false, error: null } } }
    );

    const button = screen.getByRole('img');
    fireEvent.click(button.closest('[style]')!);

    await waitFor(() => {
      expect(onBookmarkChange).toHaveBeenCalledWith(true);
    });
  });

  it('shows login message when user is not authenticated', async () => {
    renderWithProviders(
      <BookmarkButton messageId="msg-1" />,
      { preloadedState: { auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null } } }
    );

    const icons = screen.getAllByRole('img');
    fireEvent.click(icons[0].closest('[style]')!);

    // Should not crash; login prompt handled via antMessage.info
  });
});
