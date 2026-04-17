import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
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
});
