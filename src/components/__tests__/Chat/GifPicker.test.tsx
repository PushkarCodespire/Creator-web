import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GifPicker } from '../../Chat/GifPicker';

const mockTrendingGifs = {
  data: [
    {
      id: 'gif-1',
      url: 'https://giphy.com/gif1',
      title: 'Funny cat',
      images: {
        fixed_height: { url: 'https://media.giphy.com/fixed/1.gif', width: '200', height: '150' },
        downsized: { url: 'https://media.giphy.com/downsized/1.gif', width: '200', height: '150' },
      },
    },
    {
      id: 'gif-2',
      url: 'https://giphy.com/gif2',
      title: 'Dancing dog',
      images: {
        fixed_height: { url: 'https://media.giphy.com/fixed/2.gif', width: '200', height: '150' },
        downsized: { url: 'https://media.giphy.com/downsized/2.gif', width: '200', height: '150' },
      },
    },
  ],
};

const mockSearchGifs = {
  data: [
    {
      id: 'gif-3',
      url: 'https://giphy.com/gif3',
      title: 'Search result gif',
      images: {
        fixed_height: { url: 'https://media.giphy.com/fixed/3.gif', width: '200', height: '150' },
        downsized: { url: 'https://media.giphy.com/downsized/3.gif', width: '200', height: '150' },
      },
    },
  ],
};

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GifPicker', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockTrendingGifs),
    });
  });

  it('renders search input and powered by GIPHY text', async () => {
    render(<GifPicker onGifSelect={vi.fn()} />);

    expect(screen.getByPlaceholderText('Search GIFs...')).toBeInTheDocument();
    expect(screen.getByText(/Powered by/)).toBeInTheDocument();
    expect(screen.getByText('GIPHY')).toBeInTheDocument();
  });

  it('fetches trending GIFs on mount', async () => {
    render(<GifPicker onGifSelect={vi.fn()} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('trending')
      );
    });
  });

  it('renders GIF images after fetch', async () => {
    render(<GifPicker onGifSelect={vi.fn()} />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('calls onGifSelect when a GIF is clicked', async () => {
    const onGifSelect = vi.fn();
    render(<GifPicker onGifSelect={onGifSelect} />);

    await waitFor(() => {
      expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(1);
    });

    // Click the first gif image
    const firstGif = screen.getByAlt('Funny cat');
    fireEvent.click(firstGif.closest('[style*="cursor"]')!);

    expect(onGifSelect).toHaveBeenCalledWith('https://media.giphy.com/downsized/1.gif');
  });

  it('shows empty state when no GIFs found', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ data: [] }),
    });

    render(<GifPicker onGifSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No trending GIFs available')).toBeInTheDocument();
    });
  });

  it('shows tabs for Trending and Search Results', () => {
    render(<GifPicker onGifSelect={vi.fn()} />);

    expect(screen.getByText('Trending')).toBeInTheDocument();
    expect(screen.getByText('Search Results')).toBeInTheDocument();
  });
});
