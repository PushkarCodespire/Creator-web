vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  linkPreviewApi: {
    getPreview: vi.fn().mockResolvedValue({
      data: {
        data: {
          url: 'https://example.com',
          title: 'Example Site',
          description: 'An example website',
          image: null,
          siteName: 'example.com',
          type: 'website',
          favicon: null,
        },
      },
    }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { LinkPreviewCard } from '../LinkPreviewCard';
import { linkPreviewApi } from '../../../services/api';

describe('LinkPreviewCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (linkPreviewApi.getPreview as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          url: 'https://example.com',
          title: 'Example Site',
          description: 'An example website',
          image: null,
          siteName: 'example.com',
          type: 'website',
          favicon: null,
        },
      },
    });
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows preview title after load', async () => {
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText('Example Site')).toBeInTheDocument();
    });
  });

  it('shows site name after load', async () => {
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      // siteName and hostname both render as "example.com"
      const matches = screen.getAllByText('example.com');
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it('shows description after load', async () => {
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText('An example website')).toBeInTheDocument();
    });
  });

  it('calls getPreview with the provided url', async () => {
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      expect(linkPreviewApi.getPreview).toHaveBeenCalledWith('https://example.com');
    });
  });

  it('shows a skeleton while loading', () => {
    // Mock a never-resolving promise so loading state persists
    (linkPreviewApi.getPreview as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    const { container } = renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    // Ant Design Skeleton renders elements in the DOM while loading
    expect(container.querySelector('.ant-skeleton')).toBeTruthy();
  });

  it('renders the hostname as part of the URL display after load', async () => {
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      // hostname span appears alongside the LinkOutlined icon
      const spans = screen.getAllByText('example.com');
      expect(spans.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('title is rendered inside an h4 element', async () => {
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      const title = screen.getByText('Example Site');
      expect(title.tagName.toLowerCase()).toBe('h4');
    });
  });

  it('falls back to url as title when API call fails', async () => {
    (linkPreviewApi.getPreview as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network'));
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      // On error the component sets title = url
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
    });
  });

  it('renders an image tag when preview.image is provided', async () => {
    (linkPreviewApi.getPreview as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          url: 'https://example.com',
          title: 'Example Site',
          description: 'A description',
          image: 'https://example.com/og.png',
          siteName: 'example.com',
          type: 'website',
          favicon: null,
        },
      },
    });
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      const img = document.querySelector('img[alt="Example Site"]') as HTMLImageElement;
      expect(img).toBeTruthy();
      expect(img.src).toBe('https://example.com/og.png');
    });
  });

  it('does not render an image tag when preview.image is null', async () => {
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText('Example Site')).toBeInTheDocument();
    });
    // No img with an alt matching the title should exist (favicon img has empty alt)
    expect(document.querySelector('img[alt="Example Site"]')).toBeNull();
  });

  it('renders a favicon img when preview.favicon is provided', async () => {
    (linkPreviewApi.getPreview as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          url: 'https://example.com',
          title: 'Example Site',
          description: 'A description',
          image: null,
          siteName: 'example.com',
          type: 'website',
          favicon: 'https://example.com/favicon.ico',
        },
      },
    });
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      const favicon = document.querySelector('img[src="https://example.com/favicon.ico"]') as HTMLImageElement;
      expect(favicon).toBeTruthy();
      expect(favicon.alt).toBe('');
    });
  });

  it('uses GlobalOutlined icon when favicon is null', async () => {
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText('Example Site')).toBeInTheDocument();
    });
    // GlobalOutlined renders with the anticon-global class
    expect(document.querySelector('.anticon-global')).toBeTruthy();
  });

  it('calls window.open with correct args when clicked', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText('Example Site')).toBeInTheDocument();
    });
    const card = document.querySelector('[style*="cursor: pointer"]') as HTMLElement;
    card?.click();
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });

  it('does not render a description paragraph when description is empty string', async () => {
    (linkPreviewApi.getPreview as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          url: 'https://example.com',
          title: 'No Desc',
          description: '',
          image: null,
          siteName: 'example.com',
          type: 'website',
          favicon: null,
        },
      },
    });
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText('No Desc')).toBeInTheDocument();
    });
    // description is empty so its <p> should not be rendered
    expect(document.querySelector('p')).toBeNull();
  });

  it('renders a new preview when the url prop changes', async () => {
    (linkPreviewApi.getPreview as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        data: { data: { url: 'https://first.com', title: 'First', description: '', image: null, siteName: 'first.com', type: 'website', favicon: null } },
      })
      .mockResolvedValueOnce({
        data: { data: { url: 'https://second.com', title: 'Second', description: '', image: null, siteName: 'second.com', type: 'website', favicon: null } },
      });

    const { rerender } = renderWithProviders(<LinkPreviewCard url="https://first.com" />);
    await waitFor(() => expect(screen.getByText('First')).toBeInTheDocument());

    rerender(<LinkPreviewCard url="https://second.com" />);
    await waitFor(() => expect(screen.getByText('Second')).toBeInTheDocument());
    expect(linkPreviewApi.getPreview).toHaveBeenCalledTimes(2);
  });

  it('renders the LinkOutlined icon after load', async () => {
    renderWithProviders(<LinkPreviewCard url="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText('Example Site')).toBeInTheDocument();
    });
    expect(document.querySelector('.anticon-link')).toBeTruthy();
  });
});
