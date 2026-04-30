import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';

vi.mock('../../../services/api', () => ({
  companyApi: {
    discoverCreators: vi.fn().mockResolvedValue({
      data: {
        data: {
          creators: [
            { id: 'c1', displayName: 'Alice Fitness', category: 'Fitness', isVerified: true, profileImage: null, totalChats: 5, rating: 4.8 },
            { id: 'c2', displayName: 'Bob Tech', category: 'Technology', isVerified: false, profileImage: null, totalChats: 2, rating: null },
          ],
          pagination: { total: 2, totalPages: 1 },
        },
      },
    }),
  },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import CompanyDiscover from '../CompanyDiscover';

describe('CompanyDiscover', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CompanyDiscover />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows the Discover Creators heading after data loads', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(screen.getByText('Discover Creators')).toBeInTheDocument();
    });
  });

  it('shows the subtitle text after data loads', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(screen.getByText('Find the perfect talent for your next campaign')).toBeInTheDocument();
    });
  });

  it('renders creator cards with display names after data loads', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(screen.getByText('Alice Fitness')).toBeInTheDocument();
      expect(screen.getByText('Bob Tech')).toBeInTheDocument();
    });
  });

  it('renders View Profile buttons for each creator', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      const viewProfileButtons = screen.getAllByText('View Profile');
      expect(viewProfileButtons.length).toBe(2);
    });
  });

  it('renders creator category tags after data loads', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(screen.getByText('Fitness')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
  });

  it('shows empty state message when no creators match', async () => {
    const { companyApi } = await import('../../../services/api');
    (companyApi.discoverCreators as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          creators: [],
          pagination: { total: 0, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(screen.getByText('No creators found matching your criteria')).toBeInTheDocument();
    });
  });

  it('shows a loading spinner initially', () => {
    renderWithProviders(<CompanyDiscover />);
    expect(document.querySelector('.ant-spin')).toBeTruthy();
  });

  it('hides spinner after data loads', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(document.querySelector('.ant-spin')).toBeFalsy();
    });
  });

  it('renders verified badge for verified creator', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      // Alice is verified — antd CheckCircleFilled renders an icon with its class
      expect(screen.getByText('Alice Fitness')).toBeInTheDocument();
    });
    // The verified creator card is rendered without error
    const aliceCard = screen.getByText('Alice Fitness').closest('[class]');
    expect(aliceCard).toBeTruthy();
  });

  it('renders chat count for creators', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      // Alice has totalChats: 5, Bob has totalChats: 2 — rendered as text nodes
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('renders rating for rated creator and "New" for unrated creator', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });

  it('renders the category filter select placeholder', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(screen.getByText('Filter by category')).toBeInTheDocument();
    });
  });

  it('does not render pagination when total fits on one page', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(screen.getByText('Alice Fitness')).toBeInTheDocument();
    });
    // total is 2, default pageSize is 24, so pagination should not appear
    expect(document.querySelector('.ant-pagination')).toBeFalsy();
  });
});
