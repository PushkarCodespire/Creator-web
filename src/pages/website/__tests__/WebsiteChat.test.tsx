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
});
