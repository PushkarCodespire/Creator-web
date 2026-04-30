vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  bookmarkApi: {
    addBookmark: vi.fn().mockResolvedValue({ data: {} }),
    removeBookmark: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { BookmarkButton } from '../BookmarkButton';
import { bookmarkApi } from '../../../services/api';

const authState = {
  auth: {
    user: { id: 'u1', name: 'Test', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

const guestState = {
  auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
};

describe('BookmarkButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (bookmarkApi.addBookmark as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });
    (bookmarkApi.removeBookmark as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <BookmarkButton messageId="msg-1" />,
      { preloadedState: authState }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders unbookmarked state by default', () => {
    const { container } = renderWithProviders(
      <BookmarkButton messageId="msg-1" isBookmarked={false} />,
      { preloadedState: authState }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders bookmarked state', () => {
    const { container } = renderWithProviders(
      <BookmarkButton messageId="msg-1" isBookmarked={true} />,
      { preloadedState: authState }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders without user (unauthenticated)', () => {
    const { container } = renderWithProviders(
      <BookmarkButton messageId="msg-1" />,
      { preloadedState: guestState }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('calls addBookmark when clicking an unbookmarked button as authenticated user', async () => {
    renderWithProviders(
      <BookmarkButton messageId="msg-42" isBookmarked={false} />,
      { preloadedState: authState }
    );
    fireEvent.click(document.querySelector('div[style*="inline-flex"]')!);
    await waitFor(() => {
      expect(bookmarkApi.addBookmark).toHaveBeenCalledWith('msg-42');
    });
  });

  it('calls removeBookmark when clicking a bookmarked button as authenticated user', async () => {
    renderWithProviders(
      <BookmarkButton messageId="msg-99" isBookmarked={true} />,
      { preloadedState: authState }
    );
    fireEvent.click(document.querySelector('div[style*="inline-flex"]')!);
    await waitFor(() => {
      expect(bookmarkApi.removeBookmark).toHaveBeenCalledWith('msg-99');
    });
  });

  it('does not call addBookmark when unauthenticated user clicks', async () => {
    renderWithProviders(
      <BookmarkButton messageId="msg-1" isBookmarked={false} />,
      { preloadedState: guestState }
    );
    fireEvent.click(document.querySelector('div[style*="inline-flex"]')!);
    await waitFor(() => {
      expect(bookmarkApi.addBookmark).not.toHaveBeenCalled();
    });
  });

  it('calls onBookmarkChange with true after successful add', async () => {
    const onBookmarkChange = vi.fn();
    renderWithProviders(
      <BookmarkButton messageId="msg-1" isBookmarked={false} onBookmarkChange={onBookmarkChange} />,
      { preloadedState: authState }
    );
    fireEvent.click(document.querySelector('div[style*="inline-flex"]')!);
    await waitFor(() => {
      expect(onBookmarkChange).toHaveBeenCalledWith(true);
    });
  });

  it('calls onBookmarkChange with false after successful remove', async () => {
    const onBookmarkChange = vi.fn();
    renderWithProviders(
      <BookmarkButton messageId="msg-1" isBookmarked={true} onBookmarkChange={onBookmarkChange} />,
      { preloadedState: authState }
    );
    fireEvent.click(document.querySelector('div[style*="inline-flex"]')!);
    await waitFor(() => {
      expect(onBookmarkChange).toHaveBeenCalledWith(false);
    });
  });

  it('renders the clickable wrapper with pointer cursor when not loading', () => {
    renderWithProviders(
      <BookmarkButton messageId="msg-1" isBookmarked={false} />,
      { preloadedState: authState }
    );
    const wrapper = document.querySelector('div[style*="inline-flex"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.cursor).toBe('pointer');
  });

  it('wrapper opacity is 1 when not loading', () => {
    renderWithProviders(
      <BookmarkButton messageId="msg-1" isBookmarked={false} />,
      { preloadedState: authState }
    );
    const wrapper = document.querySelector('div[style*="inline-flex"]') as HTMLElement;
    expect(wrapper.style.opacity).toBe('1');
  });

  it('does not call removeBookmark when unauthenticated user clicks a bookmarked button', async () => {
    renderWithProviders(
      <BookmarkButton messageId="msg-1" isBookmarked={true} />,
      { preloadedState: guestState }
    );
    fireEvent.click(document.querySelector('div[style*="inline-flex"]')!);
    await waitFor(() => {
      expect(bookmarkApi.removeBookmark).not.toHaveBeenCalled();
    });
  });

  it('does not call onBookmarkChange when unauthenticated user clicks', async () => {
    const onBookmarkChange = vi.fn();
    renderWithProviders(
      <BookmarkButton messageId="msg-1" isBookmarked={false} onBookmarkChange={onBookmarkChange} />,
      { preloadedState: guestState }
    );
    fireEvent.click(document.querySelector('div[style*="inline-flex"]')!);
    await waitFor(() => {
      expect(onBookmarkChange).not.toHaveBeenCalled();
    });
  });

  it('calls logger.error when addBookmark rejects', async () => {
    const { logger } = await import('../../../utils/logger');
    (bookmarkApi.addBookmark as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('network'));
    renderWithProviders(
      <BookmarkButton messageId="msg-err" isBookmarked={false} />,
      { preloadedState: authState }
    );
    fireEvent.click(document.querySelector('div[style*="inline-flex"]')!);
    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('Failed to toggle bookmark:', expect.any(Error));
    });
  });

  it('calls addBookmark with the exact messageId prop provided', async () => {
    renderWithProviders(
      <BookmarkButton messageId="unique-msg-id-xyz" isBookmarked={false} />,
      { preloadedState: authState }
    );
    fireEvent.click(document.querySelector('div[style*="inline-flex"]')!);
    await waitFor(() => {
      expect(bookmarkApi.addBookmark).toHaveBeenCalledWith('unique-msg-id-xyz');
    });
  });

  it('renders with inline-flex display style', () => {
    renderWithProviders(
      <BookmarkButton messageId="msg-1" />,
      { preloadedState: authState }
    );
    const wrapper = document.querySelector('div[style*="inline-flex"]') as HTMLElement;
    expect(wrapper.style.display).toBe('inline-flex');
  });
});
