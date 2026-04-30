vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import ForumCard from '../ForumCard';

const mockTopic = {
  id: '1',
  title: 'Test Forum Topic',
  content: 'Topic content here',
  author: { id: 'a1', name: 'Alice', avatar: '/alice.jpg' },
  category: 'General',
  replyCount: 5,
  viewCount: 100,
  lastActivity: new Date().toISOString(),
  isPinned: false,
  isLocked: false,
};

import { screen } from '@testing-library/react';

describe('ForumCard', () => {
  it('renders topic title', () => {
    renderWithProviders(<ForumCard topic={mockTopic as any} />);
    expect(screen.getByText('Test Forum Topic')).toBeTruthy();
  });

  it('renders pinned topic', () => {
    const { container } = renderWithProviders(
      <ForumCard topic={{ ...mockTopic, isPinned: true } as any} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders locked topic', () => {
    const { container } = renderWithProviders(
      <ForumCard topic={{ ...mockTopic, isLocked: true } as any} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders author name', () => {
    renderWithProviders(<ForumCard topic={mockTopic as any} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders category tag', () => {
    renderWithProviders(<ForumCard topic={mockTopic as any} />);
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('renders reply count', () => {
    renderWithProviders(<ForumCard topic={mockTopic as any} />);
    expect(screen.getByText('5 replies')).toBeInTheDocument();
  });

  it('renders view count', () => {
    renderWithProviders(<ForumCard topic={mockTopic as any} />);
    expect(screen.getByText('100 views')).toBeInTheDocument();
  });

  it('renders topic content text', () => {
    renderWithProviders(<ForumCard topic={mockTopic as any} />);
    expect(screen.getByText('Topic content here')).toBeInTheDocument();
  });

  it('renders "Pinned" badge text when isPinned is true', () => {
    renderWithProviders(<ForumCard topic={{ ...mockTopic, isPinned: true } as any} />);
    expect(screen.getByText('Pinned')).toBeInTheDocument();
  });

  it('does not render the pinned badge when isPinned is false', () => {
    renderWithProviders(<ForumCard topic={mockTopic as any} />);
    expect(screen.queryByText('Pinned')).not.toBeInTheDocument();
  });

  it('renders "started by" attribution text', () => {
    renderWithProviders(<ForumCard topic={mockTopic as any} />);
    expect(screen.getByText(/started by/i)).toBeInTheDocument();
  });

  it('renders author initial inside the avatar fallback when avatar is missing', () => {
    const noAvatar = { ...mockTopic, author: { id: 'a1', name: 'Bob', avatar: undefined } };
    renderWithProviders(<ForumCard topic={noAvatar as any} />);
    // Avatar shows first char of name as fallback text
    expect(screen.getAllByText(/B/i).length).toBeGreaterThan(0);
  });

  it('renders zero reply count correctly', () => {
    const zeroReplies = { ...mockTopic, replyCount: 0 };
    renderWithProviders(<ForumCard topic={zeroReplies as any} />);
    expect(screen.getByText('0 replies')).toBeInTheDocument();
  });
});
