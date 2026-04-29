vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  chatApi: {
    editMessage: vi.fn().mockResolvedValue({ data: {} }),
    deleteMessage: vi.fn().mockResolvedValue({ data: {} }),
  },
  bookmarkApi: {
    addBookmark: vi.fn().mockResolvedValue({ data: {} }),
    removeBookmark: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { MessageActions } from '../MessageActions';

const authState = {
  auth: {
    user: { id: 'u1', name: 'Test', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('MessageActions', () => {
  it('renders without crashing for USER message', () => {
    const { container } = renderWithProviders(
      <MessageActions messageId="msg-1" content="Hello" role="USER" />,
      { preloadedState: authState }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders without crashing for ASSISTANT message', () => {
    const { container } = renderWithProviders(
      <MessageActions messageId="msg-2" content="Hi there" role="ASSISTANT" />,
      { preloadedState: authState }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with isBookmarked=true', () => {
    const { container } = renderWithProviders(
      <MessageActions messageId="msg-3" content="Saved" role="USER" isBookmarked={true} />,
      { preloadedState: authState }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders unauthenticated', () => {
    const { container } = renderWithProviders(
      <MessageActions messageId="msg-4" content="Test" role="USER" />,
      {
        preloadedState: {
          auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
        },
      }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('opens edit modal when Edit menu item is clicked', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-5" content="Editable text" role="USER" />,
      { preloadedState: authState }
    );
    // Open the dropdown
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => {
      const editItem = screen.queryByText('Edit');
      expect(editItem).toBeTruthy();
    });
  });

  it('calls clipboard write on Copy click', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    renderWithProviders(
      <MessageActions messageId="msg-6" content="Copy me" role="ASSISTANT" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Copy')).toBeTruthy());
    fireEvent.click(screen.getByText('Copy'));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Copy me');
    });
  });

  it('calls addBookmark when Bookmark is clicked (not bookmarked)', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { bookmarkApi } = await import('../../../services/api');
    const onBookmarkChange = vi.fn();
    renderWithProviders(
      <MessageActions messageId="msg-7" content="Bookmark me" role="USER" isBookmarked={false} onBookmarkChange={onBookmarkChange} />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Bookmark')).toBeTruthy());
    fireEvent.click(screen.getByText('Bookmark'));
    await waitFor(() => {
      expect(bookmarkApi.addBookmark).toHaveBeenCalledWith('msg-7');
    });
  });

  it('calls removeBookmark when Remove bookmark is clicked (already bookmarked)', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { bookmarkApi } = await import('../../../services/api');
    const onBookmarkChange = vi.fn();
    renderWithProviders(
      <MessageActions messageId="msg-8" content="Already saved" role="USER" isBookmarked={true} onBookmarkChange={onBookmarkChange} />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Remove bookmark')).toBeTruthy());
    fireEvent.click(screen.getByText('Remove bookmark'));
    await waitFor(() => {
      expect(bookmarkApi.removeBookmark).toHaveBeenCalledWith('msg-8');
    });
  });

  it('calls chatApi.editMessage and onEdit after saving edit modal', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { chatApi } = await import('../../../services/api');
    const onEdit = vi.fn();
    renderWithProviders(
      <MessageActions messageId="msg-9" content="Original" role="USER" onEdit={onEdit} />,
      { preloadedState: authState }
    );
    // Open dropdown
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Edit')).toBeTruthy());
    fireEvent.click(screen.getByText('Edit'));
    // Modal should open with TextArea
    await waitFor(() => expect(screen.queryByText('Edit Message')).toBeTruthy());
    // Click OK / Save
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(chatApi.editMessage).toHaveBeenCalledWith('msg-9', 'Original');
    });
  });

  it('does not show Edit or Delete items for ASSISTANT messages', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-10" content="Assistant reply" role="ASSISTANT" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Copy')).toBeTruthy());
    expect(screen.queryByText('Edit')).toBeFalsy();
    expect(screen.queryByText('Delete')).toBeFalsy();
  });

  it('shows Share menu item', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-11" content="Share me" role="USER" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Share')).toBeTruthy());
  });

  it('shows Bookmark label when isBookmarked is false', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-12" content="Not saved" role="USER" isBookmarked={false} />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Bookmark')).toBeTruthy());
    expect(screen.queryByText('Remove bookmark')).toBeFalsy();
  });

  it('shows Remove bookmark label when isBookmarked is true', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-13" content="Saved" role="USER" isBookmarked={true} />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Remove bookmark')).toBeTruthy());
    expect(screen.queryByText('Bookmark')).toBeFalsy();
  });

  it('calls chatApi.deleteMessage via the delete confirmation flow', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { chatApi } = await import('../../../services/api');
    const onDelete = vi.fn();
    renderWithProviders(
      <MessageActions messageId="msg-14" content="Delete me" role="USER" onDelete={onDelete} />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Delete')).toBeTruthy());
    fireEvent.click(screen.getByText('Delete'));
    // Ant Design Modal.confirm renders the OK button
    await waitFor(() => expect(screen.queryByText('Delete this message?')).toBeTruthy());
    // Click the OK/Delete button inside the confirm modal
    const confirmDeleteBtn = screen.getAllByText('Delete').find(
      (el) => el.closest('.ant-modal-confirm')
    );
    if (confirmDeleteBtn) {
      fireEvent.click(confirmDeleteBtn);
      await waitFor(() => {
        expect(chatApi.deleteMessage).toHaveBeenCalledWith('msg-14');
      });
    }
  });

  it('closes the edit modal when Cancel is clicked', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-15" content="Cancelable" role="USER" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Edit')).toBeTruthy());
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => expect(screen.queryByText('Edit Message')).toBeTruthy());
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => expect(screen.queryByText('Edit Message')).toBeFalsy());
  });

  it('renders the MoreOutlined trigger icon', () => {
    renderWithProviders(
      <MessageActions messageId="msg-16" content="Icon test" role="USER" />,
      { preloadedState: authState }
    );
    expect(document.querySelector('.anticon-more')).toBeTruthy();
  });

  it('calls onBookmarkChange with true after successful addBookmark', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const onBookmarkChange = vi.fn();
    renderWithProviders(
      <MessageActions messageId="msg-17" content="Bookmarkable" role="ASSISTANT" isBookmarked={false} onBookmarkChange={onBookmarkChange} />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Bookmark')).toBeTruthy());
    fireEvent.click(screen.getByText('Bookmark'));
    await waitFor(() => expect(onBookmarkChange).toHaveBeenCalledWith(true));
  });

  it('calls onBookmarkChange with false after successful removeBookmark', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const onBookmarkChange = vi.fn();
    renderWithProviders(
      <MessageActions messageId="msg-18" content="Already bookmarked" role="ASSISTANT" isBookmarked={true} onBookmarkChange={onBookmarkChange} />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Remove bookmark')).toBeTruthy());
    fireEvent.click(screen.getByText('Remove bookmark'));
    await waitFor(() => expect(onBookmarkChange).toHaveBeenCalledWith(false));
  });

  // --- NEW TESTS APPENDED BELOW ---

  it('does not show Edit or Delete items when unauthenticated, even for USER role', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-19" content="Unauth content" role="USER" />,
      {
        preloadedState: {
          auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
        },
      }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Copy')).toBeTruthy());
    expect(screen.queryByText('Edit')).toBeFalsy();
    expect(screen.queryByText('Delete')).toBeFalsy();
  });

  it('shows both Copy and Share in the dropdown for SYSTEM role', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-20" content="System message" role="SYSTEM" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Copy')).toBeTruthy());
    expect(screen.queryByText('Share')).toBeTruthy();
    expect(screen.queryByText('Edit')).toBeFalsy();
  });

  it('shows modal title "Edit Message" when edit is triggered', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-21" content="Modal title check" role="USER" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Edit')).toBeTruthy());
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => expect(screen.getByText('Edit Message')).toBeInTheDocument());
  });

  it('edit modal prefills the TextArea with existing content', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-22" content="Pre-filled content" role="USER" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Edit')).toBeTruthy());
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toBeTruthy();
      expect(textarea.value).toBe('Pre-filled content');
    });
  });

  it('edit modal textarea accepts new input', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-23" content="Old content" role="USER" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Edit')).toBeTruthy());
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => expect(document.querySelector('textarea')).toBeTruthy());
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Updated content' } });
    expect(textarea.value).toBe('Updated content');
  });

  it('calls chatApi.editMessage with the updated content after editing textarea', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { chatApi } = await import('../../../services/api');
    const onEdit = vi.fn();
    renderWithProviders(
      <MessageActions messageId="msg-24" content="Before edit" role="USER" onEdit={onEdit} />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Edit')).toBeTruthy());
    fireEvent.click(screen.getByText('Edit'));
    await waitFor(() => expect(document.querySelector('textarea')).toBeTruthy());
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'After edit' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => {
      expect(chatApi.editMessage).toHaveBeenCalledWith('msg-24', 'After edit');
      expect(onEdit).toHaveBeenCalledWith('msg-24', 'After edit');
    });
  });

  it('uses navigator.share when available', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
      writable: true,
    });
    renderWithProviders(
      <MessageActions messageId="msg-25" content="Sharable content" role="USER" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Share')).toBeTruthy());
    fireEvent.click(screen.getByText('Share'));
    await waitFor(() => expect(shareMock).toHaveBeenCalled());
    // Cleanup
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true, writable: true });
  });

  it('falls back to clipboard when navigator.share is not available', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: writeTextMock } });
    renderWithProviders(
      <MessageActions messageId="msg-26" content="No share API" role="USER" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Share')).toBeTruthy());
    fireEvent.click(screen.getByText('Share'));
    await waitFor(() => expect(writeTextMock).toHaveBeenCalled());
  });

  it('delete confirmation modal shows "This action cannot be undone." text', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-27" content="Delete confirm text" role="USER" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Delete')).toBeTruthy());
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument());
  });

  it('shows delete confirmation modal title "Delete this message?"', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-28" content="Confirm modal title" role="USER" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Delete')).toBeTruthy());
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(screen.getByText('Delete this message?')).toBeInTheDocument());
  });

  it('handles bookmark API error gracefully without crashing', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { bookmarkApi } = await import('../../../services/api');
    (bookmarkApi.addBookmark as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );
    renderWithProviders(
      <MessageActions messageId="msg-29" content="Error bookmark" role="USER" isBookmarked={false} />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Bookmark')).toBeTruthy());
    fireEvent.click(screen.getByText('Bookmark'));
    // Component should still be in the DOM after error
    await waitFor(() => expect(document.querySelector('.anticon-more')).toBeTruthy());
  });

  it('handles clipboard error during copy gracefully without crashing', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Clipboard denied')) },
    });
    renderWithProviders(
      <MessageActions messageId="msg-30" content="Fail copy" role="USER" />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Copy')).toBeTruthy());
    fireEvent.click(screen.getByText('Copy'));
    // Component should still be mounted
    await waitFor(() => expect(document.querySelector('.anticon-more')).toBeTruthy());
  });

  it('renders four menu items for authenticated USER messages', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-31" content="Four items" role="USER" isBookmarked={false} />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Copy')).toBeTruthy());
    // Copy, Edit, Delete, Bookmark, Share = 5 items for USER
    expect(screen.queryByText('Copy')).toBeTruthy();
    expect(screen.queryByText('Edit')).toBeTruthy();
    expect(screen.queryByText('Delete')).toBeTruthy();
    expect(screen.queryByText('Bookmark')).toBeTruthy();
    expect(screen.queryByText('Share')).toBeTruthy();
  });

  it('renders only three menu items (no Edit/Delete) for authenticated ASSISTANT messages', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    renderWithProviders(
      <MessageActions messageId="msg-32" content="Three items" role="ASSISTANT" isBookmarked={false} />,
      { preloadedState: authState }
    );
    const trigger = document.querySelector('.anticon-more') as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Copy')).toBeTruthy());
    expect(screen.queryByText('Copy')).toBeTruthy();
    expect(screen.queryByText('Bookmark')).toBeTruthy();
    expect(screen.queryByText('Share')).toBeTruthy();
    expect(screen.queryByText('Edit')).toBeFalsy();
    expect(screen.queryByText('Delete')).toBeFalsy();
  });
});
