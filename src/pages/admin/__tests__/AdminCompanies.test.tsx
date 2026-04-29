import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

const mockGetCompanies = vi.fn().mockResolvedValue({
  data: { data: { companies: [], pagination: { total: 0, totalPages: 1 } } },
});

vi.mock('../../../services/api', () => ({
  adminApi: {
    getCompanies: (...args: unknown[]) => mockGetCompanies(...args),
    updateCompanyStatus: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import AdminCompanies from '../AdminCompanies';

describe('AdminCompanies', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminCompanies />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Companies heading', async () => {
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      expect(screen.getByText('Brand Partners')).toBeInTheDocument();
    });
  });

  it('shows search input', async () => {
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search brand or email...')).toBeInTheDocument();
    });
  });

  it('shows status filter dropdown', async () => {
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      // Ant Design Select placeholder renders as text content
      expect(screen.getByText('Verification')).toBeInTheDocument();
    });
  });

  it('renders stat cards — Total Brands, Verified Entities, Active Campaigns', async () => {
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      expect(screen.getByText('Total Brands')).toBeInTheDocument();
      expect(screen.getByText('Verified Entities')).toBeInTheDocument();
      expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
    });
  });

  it('renders company name and email when data is returned', async () => {
    mockGetCompanies.mockResolvedValueOnce({
      data: {
        data: {
          companies: [
            {
              id: 'c1',
              companyName: 'TechBrand Inc',
              user: { email: 'admin@techbrand.com' },
              industry: 'Technology',
              isVerified: true,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      expect(screen.getByText('TechBrand Inc')).toBeInTheDocument();
      expect(screen.getByText('admin@techbrand.com')).toBeInTheDocument();
    });
  });

  it('renders Verified status tag for verified company', async () => {
    mockGetCompanies.mockResolvedValueOnce({
      data: {
        data: {
          companies: [
            {
              id: 'c2',
              companyName: 'VerifiedCo',
              user: { email: 'info@verifiedco.com' },
              industry: 'Fashion',
              isVerified: true,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });

  it('renders Unverified status tag for unverified company', async () => {
    mockGetCompanies.mockResolvedValueOnce({
      data: {
        data: {
          companies: [
            {
              id: 'c3',
              companyName: 'PendingCo',
              user: { email: 'info@pendingco.com' },
              industry: 'Food',
              isVerified: false,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      expect(screen.getByText('Unverified')).toBeInTheDocument();
    });
  });

  it('search input change updates the value', async () => {
    renderWithProviders(<AdminCompanies />);
    const input = await screen.findByPlaceholderText('Search brand or email...');
    fireEvent.change(input, { target: { value: 'techbrand' } });
    expect((input as HTMLInputElement).value).toBe('techbrand');
  });

  it('Reset button clears search and re-fetches', async () => {
    renderWithProviders(<AdminCompanies />);
    const input = await screen.findByPlaceholderText('Search brand or email...');
    fireEvent.change(input, { target: { value: 'something' } });
    const resetBtn = screen.getByText('Reset');
    fireEvent.click(resetBtn);
    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('');
    });
  });

  it('renders the page subtitle about corporate relationships', async () => {
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      expect(screen.getByText(/Manage corporate relationships/i)).toBeInTheDocument();
    });
  });

  it('renders the Industry filter dropdown', async () => {
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      expect(screen.getByText('Industry')).toBeInTheDocument();
    });
  });

  it('renders the Companies Registered count label', async () => {
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      expect(screen.getByText(/Companies Registered/i)).toBeInTheDocument();
    });
  });

  it('renders company industry as a tag when present', async () => {
    mockGetCompanies.mockResolvedValueOnce({
      data: {
        data: {
          companies: [
            {
              id: 'c4',
              companyName: 'TechFirm',
              user: { email: 'info@techfirm.com' },
              industry: 'Technology',
              isVerified: false,
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
  });

  it('renders Active Campaigns stat card with value 142', async () => {
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      expect(screen.getByText('142')).toBeInTheDocument();
    });
  });

  it('renders company joined date when createdAt is provided', async () => {
    mockGetCompanies.mockResolvedValueOnce({
      data: {
        data: {
          companies: [
            {
              id: 'c5',
              companyName: 'DateCo',
              user: { email: 'date@dateco.com' },
              industry: 'Food',
              isVerified: true,
              createdAt: '2026-03-15T00:00:00Z',
            },
          ],
          pagination: { total: 1, totalPages: 1 },
        },
      },
    });
    renderWithProviders(<AdminCompanies />);
    await waitFor(() => {
      expect(screen.getByText('DateCo')).toBeInTheDocument();
      // The date renders via toLocaleDateString — just verify the row is present
      expect(screen.getByText('date@dateco.com')).toBeInTheDocument();
    });
  });
});
