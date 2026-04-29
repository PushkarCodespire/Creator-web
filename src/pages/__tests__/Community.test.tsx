import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

vi.mock('../../components/Community/ForumCard', () => ({
  ForumCard: ({ topic }: any) => <div data-testid="forum-card">{topic.title}</div>,
}));

vi.mock('../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

import Community from '../Community';

describe('Community', () => {
  it('renders without crashing', () => {
    renderWithProviders(<Community />);
    expect(screen.getByText('Community Forum')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderWithProviders(<Community />);
    expect(screen.getByText(/Connect, collaborate, and grow/i)).toBeInTheDocument();
  });

  it('renders category tabs', async () => {
    renderWithProviders(<Community />);
    await waitFor(() => {
      expect(screen.getByText('All Discussions')).toBeInTheDocument();
      expect(screen.getByText('Announcements')).toBeInTheDocument();
      expect(screen.getByText('Tips & Tricks')).toBeInTheDocument();
    });
  });

  it('shows empty state when no topics', async () => {
    renderWithProviders(<Community />);
    // Topics start empty, the community page should show empty content
    await waitFor(() => {
      // The loading state resolves with empty topics array
      expect(screen.queryByTestId('forum-card')).not.toBeInTheDocument();
    });
  });

  it('renders the Feedback tab', async () => {
    renderWithProviders(<Community />);
    await waitFor(() => {
      expect(screen.getByText('Feedback')).toBeInTheDocument();
    });
  });

  it('renders the General tab', async () => {
    renderWithProviders(<Community />);
    await waitFor(() => {
      expect(screen.getByText('General')).toBeInTheDocument();
    });
  });

  it('renders the Create New Topic button', () => {
    renderWithProviders(<Community />);
    expect(screen.getByText('Create New Topic')).toBeInTheDocument();
  });

  it('renders the search input placeholder', () => {
    renderWithProviders(<Community />);
    expect(screen.getByPlaceholderText('Search for topics, users, or keywords...')).toBeInTheDocument();
  });

  it('shows No topics found message when topics list is empty after loading', async () => {
    renderWithProviders(<Community />);
    await waitFor(() => {
      expect(screen.getByText('No topics found')).toBeInTheDocument();
    });
  });

  it('renders the empty state helper text', async () => {
    renderWithProviders(<Community />);
    await waitFor(() => {
      expect(screen.getByText(/Try searching for something else or be the first to start a conversation/i)).toBeInTheDocument();
    });
  });

  it('updates search query when user types in search box', async () => {
    renderWithProviders(<Community />);
    const searchInput = screen.getByPlaceholderText('Search for topics, users, or keywords...');
    fireEvent.change(searchInput, { target: { value: 'yoga tips' } });
    await waitFor(() => {
      expect((searchInput as HTMLInputElement).value).toBe('yoga tips');
    });
  });

  it('clicking "Create New Topic" does not throw', () => {
    renderWithProviders(<Community />);
    const btn = screen.getByText('Create New Topic');
    expect(() => fireEvent.click(btn)).not.toThrow();
  });

  it('renders "Tips & Tricks" tab', async () => {
    renderWithProviders(<Community />);
    await waitFor(() => {
      expect(screen.getByText('Tips & Tricks')).toBeInTheDocument();
    });
  });

  it('renders "Announcements" tab', async () => {
    renderWithProviders(<Community />);
    await waitFor(() => {
      expect(screen.getByText('Announcements')).toBeInTheDocument();
    });
  });

  it('clicking a category tab does not throw', async () => {
    renderWithProviders(<Community />);
    await waitFor(() => {
      expect(screen.getByText('Announcements')).toBeInTheDocument();
    });
    expect(() => fireEvent.click(screen.getByText('Announcements'))).not.toThrow();
  });

  it('empty state text does not show forum-card elements', async () => {
    renderWithProviders(<Community />);
    await waitFor(() => {
      expect(screen.getByText('No topics found')).toBeInTheDocument();
    });
    expect(screen.queryAllByTestId('forum-card').length).toBe(0);
  });

  it('search box is rendered as an input element', () => {
    renderWithProviders(<Community />);
    const input = screen.getByPlaceholderText('Search for topics, users, or keywords...');
    expect(input.tagName.toLowerCase()).toBe('input');
  });
});
