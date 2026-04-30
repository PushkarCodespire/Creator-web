import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../components/ChatUI', () => ({
  ChatUI: ({ creatorId }: { creatorId: string }) => (
    <div data-testid="chat-ui">Chat with {creatorId}</div>
  ),
}));

// We need to mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ creatorId: 'test-creator-123' })),
  };
});

import WebsiteChat from '../WebsiteChat';

describe('WebsiteChat', () => {
  it('redirects to login when not authenticated', () => {
    renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
      },
    });
    // Navigate component triggers redirect, so ChatUI should not be rendered
    expect(screen.queryByTestId('chat-ui')).not.toBeInTheDocument();
  });

  it('renders ChatUI when authenticated', () => {
    renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'test@test.com', role: 'USER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getByTestId('chat-ui')).toBeInTheDocument();
    expect(screen.getByText(/Chat with test-creator-123/i)).toBeInTheDocument();
  });

  it('passes the creatorId from useParams to ChatUI', () => {
    renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'test@test.com', role: 'USER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText('Chat with test-creator-123')).toBeInTheDocument();
  });

  it('does not render ChatUI when not authenticated', () => {
    renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.queryByTestId('chat-ui')).toBeNull();
  });

  it('renders ChatUI for a CREATOR role user', () => {
    renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: { id: '2', name: 'Creator', email: 'creator@test.com', role: 'CREATOR' },
          token: 'creator-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getByTestId('chat-ui')).toBeInTheDocument();
  });

  it('renders a single chat-ui element, not multiple', () => {
    renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'test@test.com', role: 'USER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getAllByTestId('chat-ui')).toHaveLength(1);
  });

  it('renders ChatUI for an ADMIN role user', () => {
    renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: { id: '3', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
          token: 'admin-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getByTestId('chat-ui')).toBeInTheDocument();
  });

  it('does not render ChatUI when auth is in loading state and not authenticated', () => {
    renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: true,
          error: null,
        },
      },
    });
    expect(screen.queryByTestId('chat-ui')).toBeNull();
  });

  it('renders ChatUI when token is present and authenticated', () => {
    renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'test@test.com', role: 'USER' },
          token: 'some-jwt-token',
          isAuthenticated: true,
          isLoading: false,
          error: 'some prior error',
        },
      },
    });
    expect(screen.getByTestId('chat-ui')).toBeInTheDocument();
  });

  it('chat-ui receives exactly "test-creator-123" as the creatorId', () => {
    renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'test@test.com', role: 'USER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    // The mock renders "Chat with {creatorId}", so this verifies prop forwarding exactly
    expect(screen.getByText('Chat with test-creator-123')).toBeInTheDocument();
  });

  it('renders the website-shell wrapper div when authenticated', () => {
    const { container } = renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'test@test.com', role: 'USER' },
          token: 'test-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    const shell = container.querySelector('.website-shell');
    expect(shell).toBeTruthy();
  });

  it('does not render website-shell div when not authenticated', () => {
    const { container } = renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
      },
    });
    const shell = container.querySelector('.website-shell');
    expect(shell).toBeNull();
  });

  it('renders ChatUI for a user with error state but valid token', () => {
    renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: { id: '5', name: 'Errored User', email: 'errored@test.com', role: 'USER' },
          token: 'valid-token',
          isAuthenticated: true,
          isLoading: false,
          error: 'Network error',
        },
      },
    });
    expect(screen.getByTestId('chat-ui')).toBeInTheDocument();
  });

  it('does not render ChatUI when isAuthenticated is false even if token exists', () => {
    renderWithProviders(<WebsiteChat />, {
      preloadedState: {
        auth: {
          user: null,
          token: 'orphaned-token',
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.queryByTestId('chat-ui')).toBeNull();
  });
});
