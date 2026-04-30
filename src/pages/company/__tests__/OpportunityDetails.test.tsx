import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';

vi.mock('../../../services/api', () => ({
  opportunityApi: {
    getById: vi.fn().mockResolvedValue({
      data: {
        data: {
          id: 'op1',
          title: 'Brand Ambassador Role',
          description: 'Promote our product on social media.',
          type: 'BRAND_AMBASSADOR',
          category: 'Fitness',
          budget: 50000,
          budgetType: 'FIXED',
          status: 'OPEN',
          deadline: null,
          viewCount: 12,
          applications: [
            {
              id: 'app1',
              status: 'PENDING',
              pitch: 'I love your brand!',
              proposedBudget: 45000,
              createdAt: '2024-01-15T00:00:00Z',
              creator: { displayName: 'Jane Creator', profileImage: null, isVerified: true, instagramUrl: null, websiteUrl: null, user: { email: 'jane@example.com' } },
            },
          ],
        },
      },
    }),
    rejectApplication: vi.fn().mockResolvedValue({ data: {} }),
    acceptApplication: vi.fn().mockResolvedValue({ data: {} }),
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
  return { ...actual, useParams: () => ({ id: 'op1' }), useNavigate: () => vi.fn() };
});

import OpportunityDetails from '../OpportunityDetails';

const companyState = {
  auth: {
    user: { id: '1', name: 'Test Company', email: 'a@b.com', role: 'COMPANY' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('OpportunityDetails', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the opportunity title after data loads', async () => {
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });
    await waitFor(() => {
      expect(screen.getAllByText('Brand Ambassador Role').length).toBeGreaterThan(0);
    });
  });

  it('renders the opportunity status tag after data loads', async () => {
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });
    await waitFor(() => {
      expect(screen.getByText('OPEN')).toBeInTheDocument();
    });
  });

  it('renders the opportunity category tag after data loads', async () => {
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });
    await waitFor(() => {
      expect(screen.getByText('Fitness')).toBeInTheDocument();
    });
  });

  it('renders the Back button', async () => {
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });
    await waitFor(() => {
      expect(screen.getByText('Back')).toBeInTheDocument();
    });
  });

  it('renders the Quick Stats card heading', async () => {
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });
    await waitFor(() => {
      expect(screen.getByText(/Quick Stats/)).toBeInTheDocument();
    });
  });

  it('renders application creator name after data loads', async () => {
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });
    await waitFor(() => {
      expect(screen.getByText('Jane Creator')).toBeInTheDocument();
    });
  });

  it('renders Accept Proposal and Reject buttons for a PENDING application', async () => {
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });
    await waitFor(() => {
      expect(screen.getByText('Accept Proposal')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });
  });

  it('renders "Opportunity not found" when API returns null data', async () => {
    const { opportunityApi } = await import('../../../services/api');
    (opportunityApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: null },
    });
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });
    await waitFor(() => {
      expect(screen.getByText('Opportunity not found')).toBeInTheDocument();
    });
  });

  it('renders "No applications received yet." when the applications list is empty', async () => {
    const { opportunityApi } = await import('../../../services/api');
    (opportunityApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'op1',
          title: 'Brand Ambassador Role',
          description: 'Promote our product.',
          type: 'BRAND_AMBASSADOR',
          category: 'Fitness',
          budget: 50000,
          budgetType: 'FIXED',
          status: 'OPEN',
          deadline: null,
          viewCount: 0,
          applications: [],
        },
      },
    });
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });
    await waitFor(() => {
      expect(screen.getByText('No applications received yet.')).toBeInTheDocument();
    });
  });

  it('opens the accept modal when Accept Proposal is clicked', async () => {
    const { fireEvent } = await import('@testing-library/react');
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });

    await waitFor(() => {
      expect(screen.getByText('Accept Proposal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Accept Proposal'));

    await waitFor(() => {
      expect(screen.getByText('Accept Proposal & Create Deal')).toBeInTheDocument();
    });
    expect(screen.getByText('Create Contract')).toBeInTheDocument();
  });

  it('renders the application pitch text', async () => {
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });

    await waitFor(() => {
      expect(screen.getByText('"I love your brand!"')).toBeInTheDocument();
    });
  });

  it('renders budget amount from the opportunity', async () => {
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });

    await waitFor(() => {
      expect(screen.getByText('₹50,000')).toBeInTheDocument();
    });
  });

  it('renders the view count in Quick Stats', async () => {
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });

    await waitFor(() => {
      expect(screen.getByText('Views')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  it('renders the application creator email', async () => {
    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });

    await waitFor(() => {
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('shows ACCEPTED status tag for an already-accepted application', async () => {
    const { opportunityApi } = await import('../../../services/api');
    (opportunityApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'op2',
          title: 'Accepted Deal',
          description: 'Already done.',
          type: 'SPONSORED_POST',
          category: 'Lifestyle',
          budget: 20000,
          budgetType: 'FIXED',
          status: 'CLOSED',
          deadline: null,
          viewCount: 5,
          applications: [
            {
              id: 'app2',
              status: 'ACCEPTED',
              pitch: 'Great opportunity!',
              proposedBudget: 20000,
              createdAt: '2024-02-01T00:00:00Z',
              creator: { displayName: 'Tom Creator', profileImage: null, isVerified: false, instagramUrl: null, websiteUrl: null, user: { email: 'tom@example.com' } },
            },
          ],
        },
      },
    });

    renderWithProviders(<OpportunityDetails />, { preloadedState: companyState });

    await waitFor(() => {
      expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
    });
    // Should NOT show Reject/Accept buttons for already-processed applications
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });
});
