import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';

vi.mock('../../../services/api', () => ({
  companyApi: {
    getDashboard: vi.fn().mockResolvedValue({
      data: {
        data: {
          companyName: 'Acme Corp',
          opportunities: [
            { id: 'op1', title: 'Brand Ambassador Role', status: 'OPEN', createdAt: '2024-01-15T00:00:00Z', _count: { applications: 3 } },
          ],
          deals: [
            { id: 'd1', status: 'IN_PROGRESS', amount: 50000, creator: { displayName: 'Jane Creator', profileImage: null }, application: { opportunity: { title: 'Brand Ambassador Role' } } },
          ],
          stats: {},
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

import CompanyDashboard from '../CompanyDashboard';

describe('CompanyDashboard', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CompanyDashboard />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows the Company Dashboard heading after data loads', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Company Dashboard')).toBeInTheDocument();
    });
  });

  it('shows the welcome message with company name after data loads', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });
  });

  it('renders stat card labels after data loads', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Active Opportunities')).toBeInTheDocument();
      expect(screen.getByText('Total Applications')).toBeInTheDocument();
      expect(screen.getByText('Active Deals')).toBeInTheDocument();
    });
  });

  it('renders Recent Opportunities section heading after data loads', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Recent Opportunities/)).toBeInTheDocument();
    });
  });

  it('renders Active Deals section heading after data loads', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getAllByText(/Active Deals/).length).toBeGreaterThan(0);
    });
  });

  it('renders opportunity title in the list after data loads', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getAllByText('Brand Ambassador Role').length).toBeGreaterThan(0);
    });
  });

  it('renders creator display name in the deals list after data loads', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Jane Creator')).toBeInTheDocument();
    });
  });

  it('renders the View All link for opportunities', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/View All/i)).toBeInTheDocument();
    });
  });

  it('renders the Manage link for active deals', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Manage')).toBeInTheDocument();
    });
  });

  it('renders the deal amount formatted correctly', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('₹50,000')).toBeInTheDocument();
    });
  });

  it('renders the deal status tag', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      // status is "IN_PROGRESS", rendered as "IN PROGRESS" after replace
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    });
  });

  it('renders the opportunity status tag as OPEN', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('OPEN')).toBeInTheDocument();
    });
  });

  it('renders the opportunity applications count', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      // _count.applications is 3 for the mock opportunity — may appear multiple times
      expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    });
  });

  it('renders the Applications column label', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Applications')).toBeInTheDocument();
    });
  });

  it('renders the welcome back text', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
  });
});
