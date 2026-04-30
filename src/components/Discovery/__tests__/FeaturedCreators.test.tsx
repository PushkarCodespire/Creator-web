import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { FeaturedCreators } from '../FeaturedCreators';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../../services/api', () => ({
  creatorApi: {
    getAll: vi.fn(),
  },
  getImageUrl: (url: string) => url,
}));

import { creatorApi } from '../../../services/api';

const mockCreators = [
  { id: '1', displayName: 'Creator One', rating: 4.8, totalChats: 100, category: 'Tech', tags: [], isVerified: true },
  { id: '2', displayName: 'Creator Two', rating: 4.2, totalChats: 50, category: 'Art', tags: [], isVerified: false },
];

describe('FeaturedCreators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render creator cards while loading', () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<FeaturedCreators />);
    // While loading, no CreatorCard names should be rendered
    expect(screen.queryByText('Creator One')).not.toBeInTheDocument();
    expect(screen.queryByText('Creator Two')).not.toBeInTheDocument();
  });

  it('renders creator cards after loading', async () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { creators: mockCreators } },
    });

    renderWithProviders(<FeaturedCreators />);

    await waitFor(() => {
      expect(screen.getByText('Creator One')).toBeInTheDocument();
    });
    expect(screen.getByText('Creator Two')).toBeInTheDocument();
  });

  it('renders heading when showHeading is true', async () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { creators: mockCreators } },
    });

    renderWithProviders(<FeaturedCreators showHeading />);

    await waitFor(() => {
      expect(screen.getByText('Featured Creators')).toBeInTheDocument();
    });
  });

  it('returns null when no creators are found', async () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { creators: [] } },
    });

    const { container } = renderWithProviders(<FeaturedCreators />);

    await waitFor(() => {
      // Empty state renders nothing
      expect(container.querySelector('.hide-scrollbar')).not.toBeInTheDocument();
    });
  });

  it('does not render heading when showHeading is false (default)', async () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { creators: mockCreators } },
    });

    renderWithProviders(<FeaturedCreators />);

    await waitFor(() => {
      expect(screen.getByText('Creator One')).toBeInTheDocument();
    });
    expect(screen.queryByText('Featured Creators')).not.toBeInTheDocument();
  });

  it('renders loading skeletons while data is fetching', () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    const { container } = renderWithProviders(<FeaturedCreators />);
    // Loading state renders 4 skeleton divs
    const skeletons = container.querySelectorAll('div[style*="animation"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders scroll container with hide-scrollbar class after loading', async () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { creators: mockCreators } },
    });

    const { container } = renderWithProviders(<FeaturedCreators />);

    await waitFor(() => {
      expect(container.querySelector('.hide-scrollbar')).toBeInTheDocument();
    });
  });

  it('renders navigation buttons in carousel mode', async () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { creators: mockCreators } },
    });

    const { container } = renderWithProviders(<FeaturedCreators viewMode="carousel" />);

    await waitFor(() => {
      expect(screen.getByText('Creator One')).toBeInTheDocument();
    });
    // Two navigation buttons should be present (left and right)
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('does not render navigation buttons in grid mode', async () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { creators: mockCreators } },
    });

    const { container } = renderWithProviders(<FeaturedCreators viewMode="grid" />);

    await waitFor(() => {
      expect(screen.getByText('Creator One')).toBeInTheDocument();
    });
    // No navigation buttons (positioned absolutely) in grid mode
    // NavigationButtons are only rendered in carousel mode
    const navButtons = container.querySelectorAll('button[style*="position: absolute"]');
    expect(navButtons.length).toBe(0);
  });

  it('sorts creators by score (rating*10 + totalChats) descending', async () => {
    // Creator One: 4.8*10 + 100 = 148, Creator Two: 4.2*10 + 50 = 92
    // Creator One should appear first
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { creators: mockCreators } },
    });

    renderWithProviders(<FeaturedCreators />);

    await waitFor(() => {
      expect(screen.getByText('Creator One')).toBeInTheDocument();
    });

    const allNames = screen.getAllByText(/Creator (One|Two)/);
    expect(allNames[0].textContent).toBe('Creator One');
  });

  it('renders exactly 4 loading skeleton placeholders', () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    const { container } = renderWithProviders(<FeaturedCreators />);
    // 4 skeleton divs have animation style
    const skeletons = container.querySelectorAll('div[style*="animation"]');
    expect(skeletons.length).toBe(4);
  });

  it('calls creatorApi.getAll with the provided category filter', async () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { creators: [] } },
    });

    renderWithProviders(<FeaturedCreators category="Tech" />);

    await waitFor(() => {
      expect(creatorApi.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Tech' })
      );
    });
  });

  it('calls creatorApi.getAll with limit 20 regardless of limit prop', async () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { creators: [] } },
    });

    renderWithProviders(<FeaturedCreators limit={4} />);

    await waitFor(() => {
      expect(creatorApi.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20, page: 1 })
      );
    });
  });

  it('renders grid layout container when viewMode is grid', async () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { creators: mockCreators } },
    });

    const { container } = renderWithProviders(<FeaturedCreators viewMode="grid" />);

    await waitFor(() => {
      expect(screen.getByText('Creator One')).toBeInTheDocument();
    });

    // The scroll container should use display:grid in grid mode
    const gridContainer = container.querySelector('div[style*="grid"]');
    expect(gridContainer).toBeTruthy();
  });

  it('does not render heading when showHeading prop is omitted', async () => {
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { creators: mockCreators } },
    });

    renderWithProviders(<FeaturedCreators />);

    await waitFor(() => {
      expect(screen.getByText('Creator One')).toBeInTheDocument();
    });

    expect(screen.queryByRole('heading', { name: /Featured Creators/i })).not.toBeInTheDocument();
  });
});
