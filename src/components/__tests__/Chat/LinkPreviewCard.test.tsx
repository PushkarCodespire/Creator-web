import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LinkPreviewCard } from '../../Chat/LinkPreviewCard';

const mockGetPreview = vi.fn();

vi.mock('../../../services/api', () => ({
  linkPreviewApi: {
    getPreview: (...args: any[]) => mockGetPreview(...args),
  },
}));

const mockPreview = {
  url: 'https://example.com/article',
  title: 'Example Article',
  description: 'A great article about testing',
  image: 'https://example.com/image.jpg',
  siteName: 'example.com',
  type: 'website',
  favicon: 'https://example.com/favicon.ico',
};

describe('LinkPreviewCard', () => {
  beforeEach(() => {
    mockGetPreview.mockReset();
    mockGetPreview.mockResolvedValue({ data: { data: mockPreview } });
  });

  it('shows loading skeleton initially', () => {
    const { container } = render(<LinkPreviewCard url="https://example.com/article" />);
    // Ant Design Skeleton renders during loading
    expect(container.firstChild).toBeTruthy();
  });

  it('renders preview data after loading', async () => {
    render(<LinkPreviewCard url="https://example.com/article" />);

    await waitFor(() => {
      expect(screen.getByText('Example Article')).toBeInTheDocument();
    });

    expect(screen.getByText('A great article about testing')).toBeInTheDocument();
    expect(screen.getAllByText('example.com')[0]).toBeInTheDocument();
  });

  it('renders preview image when available', async () => {
    render(<LinkPreviewCard url="https://example.com/article" />);

    await waitFor(() => {
      expect(screen.getByText('Example Article')).toBeInTheDocument();
    });

    const image = screen.getByAltText('Example Article');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('opens URL in new tab when clicked', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(<LinkPreviewCard url="https://example.com/article" />);

    await waitFor(() => {
      expect(screen.getByText('Example Article')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Example Article'));
    expect(openSpy).toHaveBeenCalledWith('https://example.com/article', '_blank', 'noopener,noreferrer');

    openSpy.mockRestore();
  });

  it('renders fallback preview on API error', async () => {
    mockGetPreview.mockRejectedValueOnce(new Error('API error'));

    render(<LinkPreviewCard url="https://example.com/fallback" />);

    await waitFor(() => {
      expect(screen.getByText('https://example.com/fallback')).toBeInTheDocument();
    });
  });
});
