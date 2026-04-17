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
});
