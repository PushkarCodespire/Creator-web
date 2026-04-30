import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getCreators: vi.fn().mockResolvedValue({ data: { data: { creators: [], pagination: { total: 0, totalPages: 1 } } } }),
    getPendingCreators: vi.fn().mockResolvedValue({ data: { data: { creators: [], pagination: { total: 0, totalPages: 1 } } } }),
    updateCreatorStatus: vi.fn().mockResolvedValue({ data: {} }),
    verifyCreator: vi.fn().mockResolvedValue({ data: {} }),
    rejectCreator: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/admin/CreatorDetailModal', () => ({
  default: () => <div data-testid="creator-modal" />,
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import { screen } from '@testing-library/react';
import AdminCreators from '../AdminCreators';

describe('AdminCreators', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminCreators />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Creator Network heading', () => {
    renderWithProviders(<AdminCreators />);
    expect(screen.getByText('Creator Network')).toBeInTheDocument();
  });

  it('renders subtitle text', () => {
    renderWithProviders(<AdminCreators />);
    expect(screen.getByText(/Oversee creator registrations/i)).toBeInTheDocument();
  });

  it('renders All Creators tab', () => {
    renderWithProviders(<AdminCreators />);
    expect(screen.getByText('All Creators')).toBeInTheDocument();
  });

  it('renders Pending Verifications tab', () => {
    renderWithProviders(<AdminCreators />);
    expect(screen.getByText('Pending Verifications')).toBeInTheDocument();
  });

  it('renders search creators input', () => {
    renderWithProviders(<AdminCreators />);
    expect(screen.getByPlaceholderText('Search creators...')).toBeInTheDocument();
  });

  it('renders Total Creators stat card', () => {
    renderWithProviders(<AdminCreators />);
    expect(screen.getByText('Total Creators')).toBeInTheDocument();
  });

  it('renders Active Rate stat card', () => {
    renderWithProviders(<AdminCreators />);
    expect(screen.getByText('Active Rate')).toBeInTheDocument();
  });

  it('renders Verified stat card', () => {
    renderWithProviders(<AdminCreators />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders Pending Review stat card', () => {
    renderWithProviders(<AdminCreators />);
    expect(screen.getByText('Pending Review')).toBeInTheDocument();
  });

  it('renders the Reset button in the toolbar', async () => {
    const { waitFor } = await import('@testing-library/react');
    renderWithProviders(<AdminCreators />);
    await waitFor(() => {
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });
  });

  it('renders creator count text after loading', async () => {
    const { waitFor } = await import('@testing-library/react');
    renderWithProviders(<AdminCreators />);
    await waitFor(() => {
      expect(screen.getByText(/Creators found/i)).toBeInTheDocument();
    });
  });

  it('renders creators in table when API returns data', async () => {
    const { adminApi } = await import('../../../services/api');
    const { waitFor, fireEvent } = await import('@testing-library/react');

    (adminApi.getCreators as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          creators: [
            { id: 'c1', displayName: 'Alice Smith', category: 'Fitness', isVerified: true, isActive: true, createdAt: '2026-01-01T00:00:00Z', user: { email: 'alice@example.com' } },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<AdminCreators />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('opens creator detail modal when View is clicked', async () => {
    const { adminApi } = await import('../../../services/api');
    const { waitFor, fireEvent } = await import('@testing-library/react');

    (adminApi.getCreators as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          creators: [
            { id: 'c99', displayName: 'Bob Jones', category: 'Music', isVerified: false, isActive: true, createdAt: '2026-02-01T00:00:00Z', user: { email: 'bob@example.com' } },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });

    renderWithProviders(<AdminCreators />);

    await waitFor(() => {
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    // The View button renders as a CustomButton with text "View"
    const viewBtn = screen.getByText('View');
    fireEvent.click(viewBtn);

    // Modal is rendered — the mock renders <div data-testid="creator-modal" />
    expect(screen.getByTestId('creator-modal')).toBeInTheDocument();
  });
});
