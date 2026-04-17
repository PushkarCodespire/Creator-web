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
});
