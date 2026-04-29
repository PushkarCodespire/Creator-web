import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { MessageActions } from '../../Chat/MessageActions';

vi.mock('../../../services/api', () => ({
  chatApi: {
    editMessage: vi.fn().mockResolvedValue({ data: {} }),
    deleteMessage: vi.fn().mockResolvedValue({ data: {} }),
  },
  bookmarkApi: {
    addBookmark: vi.fn().mockResolvedValue({ data: { data: {} } }),
    removeBookmark: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

const authenticatedState = {
  auth: {
    user: { id: 'user-1', email: 'test@test.com', name: 'Test', role: 'USER' as const, isVerified: false, createdAt: '2024-01-01' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

const unauthenticatedState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
};

describe('MessageActions', () => {
  it('renders the more actions button', () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Hello" role="USER" />,
      { preloadedState: authenticatedState }
    );

    expect(screen.getByRole('img', { name: /more/i })).toBeInTheDocument();
  });

  it('shows copy option in dropdown menu', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Hello" role="USER" />,
      { preloadedState: authenticatedState }
    );

    // Open dropdown
    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });
  });

  it('shows edit and delete for user messages when authenticated', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Hello" role="USER" />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('does not show edit/delete for ASSISTANT messages', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="AI response" role="ASSISTANT" />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('does not show edit/delete when user is not authenticated', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Hello" role="USER" />,
      { preloadedState: unauthenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('shows bookmark option', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Hello" role="USER" />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Bookmark')).toBeInTheDocument();
    });
  });

  it('shows share option', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Hello" role="USER" />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Share')).toBeInTheDocument();
    });
  });

  it('copies message to clipboard on copy click', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Copy this text" role="USER" />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Copy'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Copy this text');
    });
  });

  it('shows "Remove bookmark" label when isBookmarked is true', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Hello" role="USER" isBookmarked={true} />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Remove bookmark')).toBeInTheDocument();
    });
  });

  it('shows "Bookmark" label when isBookmarked is false', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Hello" role="USER" isBookmarked={false} />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Bookmark')).toBeInTheDocument();
    });
  });

  it('opens edit modal when Edit is clicked', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Edit me" role="USER" />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByText('Edit Message')).toBeInTheDocument();
    });
  });

  it('pre-fills edit modal textarea with existing message content', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Original text" role="USER" />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      const textarea = screen.getByDisplayValue('Original text');
      expect(textarea).toBeInTheDocument();
    });
  });

  it('calls onBookmarkChange with true when adding a bookmark', async () => {
    const onBookmarkChange = vi.fn();

    renderWithProviders(
      <MessageActions messageId="msg-1" content="Hello" role="USER" isBookmarked={false} onBookmarkChange={onBookmarkChange} />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Bookmark')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Bookmark'));

    await waitFor(() => {
      expect(onBookmarkChange).toHaveBeenCalledWith(true);
    });
  });

  it('calls onEdit callback after successfully saving an edit', async () => {
    const onEdit = vi.fn();

    renderWithProviders(
      <MessageActions messageId="msg-1" content="Original" role="USER" onEdit={onEdit} />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByText('Edit Message')).toBeInTheDocument();
    });

    // Click Save in the modal
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onEdit).toHaveBeenCalledWith('msg-1', 'Original');
    });
  });

  it('edit modal is closed after cancelling', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Hello" role="USER" />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByText('Edit Message')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Edit Message')).not.toBeInTheDocument();
    });
  });

  it('calls onBookmarkChange with false when removing a bookmark', async () => {
    const onBookmarkChange = vi.fn();

    renderWithProviders(
      <MessageActions messageId="msg-1" content="Hello" role="USER" isBookmarked={true} onBookmarkChange={onBookmarkChange} />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Remove bookmark')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Remove bookmark'));

    await waitFor(() => {
      expect(onBookmarkChange).toHaveBeenCalledWith(false);
    });
  });

  it('shows delete confirmation modal when Delete is clicked', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="Delete me" role="USER" />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Delete this message?')).toBeInTheDocument();
    });
  });

  it('calls onDelete after confirming deletion', async () => {
    const onDelete = vi.fn();

    renderWithProviders(
      <MessageActions messageId="msg-42" content="Goodbye" role="USER" onDelete={onDelete} />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Delete this message?')).toBeInTheDocument();
    });

    // Confirm the deletion
    const confirmDeleteBtn = screen.getAllByText('Delete').find(
      (el) => el.closest('.ant-btn')
    );
    if (confirmDeleteBtn) fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('msg-42');
    });
  });

  it('shows Share option for ASSISTANT role messages', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="AI response" role="ASSISTANT" />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Share')).toBeInTheDocument();
    });
  });

  it('shows Bookmark option for ASSISTANT role messages when not bookmarked', async () => {
    renderWithProviders(
      <MessageActions messageId="msg-1" content="AI response" role="ASSISTANT" isBookmarked={false} />,
      { preloadedState: authenticatedState }
    );

    fireEvent.click(screen.getByRole('img', { name: /more/i }));

    await waitFor(() => {
      expect(screen.getByText('Bookmark')).toBeInTheDocument();
    });
  });
});
