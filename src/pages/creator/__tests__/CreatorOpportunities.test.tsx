import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  opportunityApi: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: {
          opportunities: [
            {
              id: 'opp1',
              title: 'Summer Fitness Campaign',
              type: 'CAMPAIGN',
              description: 'Promote our summer fitness line.',
              budget: 50000,
              category: 'Health',
              hasApplied: false,
              myApplicationStatus: null,
              _count: { applications: 3 },
              company: { companyName: 'FitBrand Co' },
            },
          ],
          pagination: { total: 1, totalPages: 1, page: 1, limit: 12 },
        },
      },
    }),
    apply: vi.fn().mockResolvedValue({ data: {} }),
  },
  creatorApi: {
    getApplications: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: 'app1',
            status: 'PENDING',
            opportunity: { title: 'Summer Fitness Campaign', company: { companyName: 'FitBrand Co' } },
            deal: null,
          },
        ],
      },
    }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import CreatorOpportunities from '../CreatorOpportunities';

const creatorState = {
  auth: {
    user: { id: '1', name: 'Test Creator', email: 'a@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('CreatorOpportunities', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the page heading after data loads', async () => {
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Collaboration Matrix')).toBeInTheDocument();
    });
  });

  it('renders the subtitle text', async () => {
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText(/Strategic partnerships for your neural brand narrative/i)).toBeInTheDocument();
    });
  });

  it('renders Available Deals tab', async () => {
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Available Deals')).toBeInTheDocument();
    });
  });

  it('renders Active Proposals tab', async () => {
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Active Proposals')).toBeInTheDocument();
    });
  });

  it('renders the opportunity card with title after loading', async () => {
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Summer Fitness Campaign')).toBeInTheDocument();
    });
  });

  it('renders the Analyze & Apply button for an unapplied opportunity', async () => {
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Analyze & Apply')).toBeInTheDocument();
    });
  });

  it('renders the search input', async () => {
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by brand or title...')).toBeInTheDocument();
    });
  });

  it('renders the budget filter input', async () => {
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Max Budget (₹)')).toBeInTheDocument();
    });
  });

  it('renders opportunity card with budget tag', async () => {
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText(/50,000/)).toBeInTheDocument();
    });
  });

  it('renders opportunity card with category tag', async () => {
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Health')).toBeInTheDocument();
    });
  });

  it('opens apply modal when Analyze & Apply button is clicked', async () => {
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Analyze & Apply')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Analyze & Apply'));
    await waitFor(() => {
      expect(screen.getByText('Collaboration Strategy')).toBeInTheDocument();
    });
  });

  it('shows proposal narrative textarea in apply modal', async () => {
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Analyze & Apply')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Analyze & Apply'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Outline your strategic vision/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no opportunities returned', async () => {
    const { opportunityApi } = await import('../../../services/api');
    (opportunityApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { opportunities: [], pagination: { total: 0, totalPages: 1, page: 1, limit: 12 } } },
    });
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText(/No opportunities found/i)).toBeInTheDocument();
    });
  });

  it('renders applications tab content after switching tabs', async () => {
    localStorage.setItem('user', JSON.stringify({ id: '1' }));
    renderWithProviders(<CreatorOpportunities />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Active Proposals')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Active Proposals'));
    await waitFor(() => {
      expect(screen.getByText('Proposal Hub')).toBeInTheDocument();
    });
    localStorage.removeItem('user');
  });
});
