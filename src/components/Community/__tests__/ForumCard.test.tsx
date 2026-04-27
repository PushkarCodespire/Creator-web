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

describe('ForumCard', () => {
  it('renders topic', () => {
    const { getByText } = renderWithProviders(<ForumCard topic={mockTopic as any} />);
    expect(getByText('Test Forum Topic')).toBeTruthy();
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
});
