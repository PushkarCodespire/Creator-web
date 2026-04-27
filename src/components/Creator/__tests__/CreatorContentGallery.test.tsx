vi.mock('../../../services/api', () => ({
  getDownloadUrl: vi.fn((x: string) => x),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { CreatorContentGallery } from '../CreatorContentGallery';

const mockContent = [
  { id: '1', title: 'React Tutorial', type: 'YOUTUBE_VIDEO' as const, url: 'https://youtube.com/watch?v=abc', description: 'Learn React' },
  { id: '2', title: 'Blog Post', type: 'BLOG_POST' as const, description: 'A blog post' },
];

describe('CreatorContentGallery', () => {
  it('renders empty state with no content', () => {
    const { container } = renderWithProviders(
      <CreatorContentGallery contents={[]} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with content items', () => {
    const { container } = renderWithProviders(
      <CreatorContentGallery contents={mockContent as any} />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
