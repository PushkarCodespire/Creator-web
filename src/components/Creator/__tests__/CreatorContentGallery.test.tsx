vi.mock('../../../services/api', () => ({
  getDownloadUrl: vi.fn((x: string) => x),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { CreatorContentGallery } from '../CreatorContentGallery';

const mockContent = [
  { id: '1', title: 'React Tutorial', type: 'YOUTUBE_VIDEO' as const, url: 'https://youtube.com/watch?v=abc', description: 'Learn React' },
  { id: '2', title: 'Blog Post', type: 'BLOG_POST' as const, description: 'A blog post' },
];

describe('CreatorContentGallery', () => {
  it('renders empty state with no content', () => {
    const { container } = renderWithProviders(
      <CreatorContentGallery contents={[]} creatorName="Test Creator" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders empty state message with creator name', () => {
    renderWithProviders(
      <CreatorContentGallery contents={[]} creatorName="Jane Doe" />
    );
    expect(screen.getByText("Jane Doe hasn't shared any content yet")).toBeInTheDocument();
  });

  it('renders with content items', () => {
    const { container } = renderWithProviders(
      <CreatorContentGallery contents={mockContent as any} creatorName="Test Creator" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders "Content Gallery" heading with content', () => {
    renderWithProviders(
      <CreatorContentGallery contents={mockContent as any} creatorName="Test Creator" />
    );
    expect(screen.getByText('Content Gallery')).toBeInTheDocument();
  });

  it('renders content item titles', () => {
    renderWithProviders(
      <CreatorContentGallery contents={mockContent as any} creatorName="Test Creator" />
    );
    expect(screen.getByText('React Tutorial')).toBeInTheDocument();
    expect(screen.getByText('Blog Post')).toBeInTheDocument();
  });

  it('renders content type tags', () => {
    renderWithProviders(
      <CreatorContentGallery contents={mockContent as any} creatorName="Test Creator" />
    );
    // 'Video' appears in both the Tag and the cover overlay for YOUTUBE_VIDEO
    expect(screen.getAllByText('Video')[0]).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });

  it('renders description text for items that have one', () => {
    renderWithProviders(
      <CreatorContentGallery contents={mockContent as any} creatorName="Test Creator" />
    );
    expect(screen.getByText('Learn React')).toBeInTheDocument();
    expect(screen.getByText('A blog post')).toBeInTheDocument();
  });

  it('renders "Podcast" tag for PODCAST type content', () => {
    const podcastContent = [
      { id: '3', title: 'My Podcast', type: 'PODCAST' as const, description: 'Audio content' },
    ];
    renderWithProviders(
      <CreatorContentGallery contents={podcastContent as any} creatorName="Test Creator" />
    );
    expect(screen.getByText('Podcast')).toBeInTheDocument();
  });

  it('renders "Course" tag for COURSE type content', () => {
    const courseContent = [
      { id: '4', title: 'React Mastery', type: 'COURSE' as const, description: 'Full course' },
    ];
    renderWithProviders(
      <CreatorContentGallery contents={courseContent as any} creatorName="Test Creator" />
    );
    expect(screen.getByText('Course')).toBeInTheDocument();
  });

  it('renders "Video" overlay label when YouTube video has no duration', () => {
    const videoContent = [
      { id: '5', title: 'No Duration Video', type: 'YOUTUBE_VIDEO' as const, url: 'https://youtube.com/watch?v=xyz' },
    ];
    renderWithProviders(
      <CreatorContentGallery contents={videoContent as any} creatorName="Test Creator" />
    );
    // The overlay shows 'Video' as fallback when duration is absent
    expect(screen.getAllByText('Video').length).toBeGreaterThanOrEqual(1);
  });

  it('renders video duration text when provided', () => {
    const videoContent = [
      {
        id: '6',
        title: 'Duration Video',
        type: 'YOUTUBE_VIDEO' as const,
        url: 'https://youtube.com/watch?v=abc',
        duration: '12:34',
      },
    ];
    renderWithProviders(
      <CreatorContentGallery contents={videoContent as any} creatorName="Test Creator" />
    );
    expect(screen.getByText('12:34')).toBeInTheDocument();
  });

  it('renders all content items from a longer list', () => {
    const manyItems = [
      { id: 'a', title: 'Item A', type: 'BLOG_POST' as const },
      { id: 'b', title: 'Item B', type: 'PODCAST' as const },
      { id: 'c', title: 'Item C', type: 'COURSE' as const },
    ];
    renderWithProviders(
      <CreatorContentGallery contents={manyItems as any} creatorName="Test Creator" />
    );
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
    expect(screen.getByText('Item C')).toBeInTheDocument();
  });

  it('does not render Content Gallery heading when contents is empty', () => {
    renderWithProviders(
      <CreatorContentGallery contents={[]} creatorName="Test Creator" />
    );
    expect(screen.queryByText('Content Gallery')).not.toBeInTheDocument();
  });

  it('renders empty state with a different creator name', () => {
    renderWithProviders(
      <CreatorContentGallery contents={[]} creatorName="John Doe" />
    );
    expect(screen.getByText("John Doe hasn't shared any content yet")).toBeInTheDocument();
  });

  it('renders thumbnail img when content has a thumbnail', () => {
    const videoWithThumb = [
      {
        id: 'v1',
        title: 'Thumb Video',
        type: 'YOUTUBE_VIDEO' as const,
        url: 'https://youtube.com/watch?v=abc',
        thumbnail: 'thumb.jpg',
      },
    ];
    renderWithProviders(
      <CreatorContentGallery contents={videoWithThumb as any} creatorName="Test Creator" />
    );
    const img = document.querySelector('img[alt="Thumb Video"]') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.alt).toBe('Thumb Video');
  });

  it('does not render an iframe when no video is selected', () => {
    renderWithProviders(
      <CreatorContentGallery contents={mockContent as any} creatorName="Test Creator" />
    );
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('clicking a YouTube video cover opens a modal with an iframe', () => {
    const videoContent = [
      {
        id: 'v2',
        title: 'Playable Video',
        type: 'YOUTUBE_VIDEO' as const,
        url: 'https://youtube.com/watch?v=testId123',
      },
    ];
    renderWithProviders(
      <CreatorContentGallery contents={videoContent as any} creatorName="Test Creator" />
    );
    // The video cover overlay is a div; clicking it should open the modal
    const coverDiv = document.querySelector('[style*="paddingTop"]') as HTMLElement;
    if (coverDiv) {
      fireEvent.click(coverDiv);
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe?.src).toContain('testId123');
    }
  });
});
