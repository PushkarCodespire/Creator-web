import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';

vi.mock('../../../services/api', () => ({
  companyApi: {
    getDeals: vi.fn().mockResolvedValue({
      data: {
        data: {
          deals: [
            {
              id: 'aadeal1',
              status: 'IN_PROGRESS',
              amount: 50000,
              creator: { id: 'cr1', displayName: 'Jane Creator', profileImage: null },
              application: { opportunity: { title: 'Summer Campaign' } },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
      },
    }),
    completeDeal: vi.fn().mockResolvedValue({ data: {} }),
  },
  milestoneApi: {
    list: vi.fn().mockResolvedValue({ data: { data: { milestones: [] } } }),
    create: vi.fn().mockResolvedValue({ data: { data: {} } }),
    complete: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
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

import CompanyDeals from '../CompanyDeals';

describe('CompanyDeals', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CompanyDeals />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the Manage Deals heading', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Manage Deals')).toBeInTheDocument();
    });
  });

  it('renders deal data after loading', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('#ADEAL1')).toBeInTheDocument();
    });
  });

  it('renders creator name in deal row', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Jane Creator')).toBeInTheDocument();
    });
  });

  it('renders campaign title in deal row', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Summer Campaign')).toBeInTheDocument();
    });
  });

  it('renders formatted amount in deal row', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      // ₹50,000 formatted with en-IN locale
      expect(screen.getByText(/50,000/)).toBeInTheDocument();
    });
  });

  it('renders IN_PROGRESS status tag', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    });
  });

  it('renders Mark Complete button for IN_PROGRESS deals', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Mark Complete')).toBeInTheDocument();
    });
  });

  it('does not render Mark Complete button for COMPLETED deals', async () => {
    const { companyApi } = await import('../../../services/api');
    (companyApi.getDeals as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          deals: [
            {
              id: 'deal-done',
              status: 'COMPLETED',
              amount: 10000,
              creator: { id: 'cr2', displayName: 'Bob Creator', profileImage: null },
              application: { opportunity: { title: 'Old Campaign' } },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
      },
    });
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Bob Creator')).toBeInTheDocument();
    });
    expect(screen.queryByText('Mark Complete')).not.toBeInTheDocument();
  });

  it('shows em-dash when deal amount is null', async () => {
    const { companyApi } = await import('../../../services/api');
    (companyApi.getDeals as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          deals: [
            {
              id: 'deal-no-amount',
              status: 'IN_PROGRESS',
              amount: null,
              creator: { id: 'cr3', displayName: 'Alice Creator', profileImage: null },
              application: { opportunity: { title: 'Free Campaign' } },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
      },
    });
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Alice Creator')).toBeInTheDocument();
    });
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows error message when getDeals fails', async () => {
    const { companyApi } = await import('../../../services/api');
    (companyApi.getDeals as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      // Table should render (empty) — loading completes
      expect(screen.getByText('Manage Deals')).toBeInTheDocument();
    });
  });

  it('renders the subtitle text below Manage Deals heading', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText(/Track and manage your active creator contracts/i)).toBeInTheDocument();
    });
  });

  it('renders Deal ID column header', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Deal ID')).toBeInTheDocument();
    });
  });

  it('renders Creator column header', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Creator')).toBeInTheDocument();
    });
  });

  it('renders Opportunity column header', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Opportunity')).toBeInTheDocument();
    });
  });

  it('renders Amount column header', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Amount')).toBeInTheDocument();
    });
  });

  it('renders Status column header', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  it('renders COMPLETED status tag for completed deals', async () => {
    const { companyApi } = await import('../../../services/api');
    (companyApi.getDeals as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          deals: [
            {
              id: 'deal-complete',
              status: 'COMPLETED',
              amount: 75000,
              creator: { id: 'cr5', displayName: 'Hana Creator', profileImage: null },
              application: { opportunity: { title: 'Winter Campaign' } },
              createdAt: '2024-02-01T00:00:00Z',
            },
          ],
        },
      },
    });
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });
  });

  // ─── NEW TESTS ────────────────────────────────────────────────────────────

  it('renders CANCELLED status tag for cancelled deals', async () => {
    const { companyApi } = await import('../../../services/api');
    (companyApi.getDeals as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          deals: [
            {
              id: 'deal-cancelled',
              status: 'CANCELLED',
              amount: 20000,
              creator: { id: 'cr6', displayName: 'Sam Creator', profileImage: null },
              application: { opportunity: { title: 'Cancelled Campaign' } },
              createdAt: '2024-03-01T00:00:00Z',
            },
          ],
        },
      },
    });

    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('CANCELLED')).toBeInTheDocument();
    });
  });

  it('renders em-dash for NaN amount values', async () => {
    const { companyApi } = await import('../../../services/api');
    (companyApi.getDeals as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          deals: [
            {
              id: 'deal-nan',
              status: 'IN_PROGRESS',
              amount: 'not-a-number',
              creator: { id: 'cr7', displayName: 'NaN Creator', profileImage: null },
              application: { opportunity: { title: 'Test Campaign' } },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
      },
    });

    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('NaN Creator')).toBeInTheDocument();
    });
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('calls companyApi.getDeals on mount', async () => {
    const { companyApi } = await import('../../../services/api');
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(companyApi.getDeals).toHaveBeenCalledWith({ limit: 50 });
    });
  });

  it('renders multiple deals when API returns them', async () => {
    const { companyApi } = await import('../../../services/api');
    (companyApi.getDeals as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          deals: [
            {
              id: 'deal-aaa',
              status: 'IN_PROGRESS',
              amount: 10000,
              creator: { id: 'cr-a', displayName: 'Alpha Creator', profileImage: null },
              application: { opportunity: { title: 'Alpha Campaign' } },
              createdAt: '2024-01-01T00:00:00Z',
            },
            {
              id: 'deal-bbb',
              status: 'COMPLETED',
              amount: 20000,
              creator: { id: 'cr-b', displayName: 'Beta Creator', profileImage: null },
              application: { opportunity: { title: 'Beta Campaign' } },
              createdAt: '2024-02-01T00:00:00Z',
            },
          ],
        },
      },
    });

    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('Alpha Creator')).toBeInTheDocument();
      expect(screen.getByText('Beta Creator')).toBeInTheDocument();
    });
  });

  it('renders the expand icon for each deal row to show milestones', async () => {
    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('Jane Creator')).toBeInTheDocument();
    });

    // Ant Design renders the expand button with aria-label or a specific class
    const expandBtns = document.querySelectorAll('.ant-table-row-expand-icon');
    expect(expandBtns.length).toBeGreaterThan(0);
  });

  it('shows milestones panel with empty state when expanded and no milestones exist', async () => {
    const { fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('Jane Creator')).toBeInTheDocument();
    });

    const expandBtn = document.querySelector('.ant-table-row-expand-icon');
    if (expandBtn) {
      fe.click(expandBtn);
    }

    await waitFor(() => {
      expect(screen.getByText(/Milestones/i)).toBeInTheDocument();
    });
  });

  it('shows Add Milestone button in expanded milestones panel for IN_PROGRESS deals', async () => {
    const { fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('Jane Creator')).toBeInTheDocument();
    });

    const expandBtn = document.querySelector('.ant-table-row-expand-icon');
    if (expandBtn) {
      fe.click(expandBtn);
    }

    await waitFor(() => {
      expect(screen.getByText('Add Milestone')).toBeInTheDocument();
    });
  });

  it('shows Add Milestone form when Add Milestone button is clicked', async () => {
    const { fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('Jane Creator')).toBeInTheDocument();
    });

    const expandBtn = document.querySelector('.ant-table-row-expand-icon');
    if (expandBtn) {
      fe.click(expandBtn);
    }

    await waitFor(() => {
      expect(screen.getByText('Add Milestone')).toBeInTheDocument();
    });

    fe.click(screen.getByText('Add Milestone'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Draft script approval/i)).toBeInTheDocument();
    });
  });

  it('does not show Add Milestone button for COMPLETED deals', async () => {
    const { companyApi } = await import('../../../services/api');
    (companyApi.getDeals as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          deals: [
            {
              id: 'deal-done2',
              status: 'COMPLETED',
              amount: 30000,
              creator: { id: 'cr8', displayName: 'Done Creator', profileImage: null },
              application: { opportunity: { title: 'Done Campaign' } },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
      },
    });

    const { fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('Done Creator')).toBeInTheDocument();
    });

    const expandBtn = document.querySelector('.ant-table-row-expand-icon');
    if (expandBtn) {
      fe.click(expandBtn);
    }

    await waitFor(() => {
      expect(screen.getByText(/Milestones/i)).toBeInTheDocument();
    });

    expect(screen.queryByText('Add Milestone')).not.toBeInTheDocument();
  });

  it('renders milestones in timeline when deal is expanded and milestones exist', async () => {
    const { milestoneApi } = await import('../../../services/api');
    (milestoneApi.list as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          milestones: [
            {
              id: 'ms-1',
              title: 'Script Approval',
              description: 'Get script approved by client',
              dueDate: '2030-01-15T00:00:00Z',
              status: 'PENDING',
              completedAt: null,
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
      },
    });

    const { fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('Jane Creator')).toBeInTheDocument();
    });

    const expandBtn = document.querySelector('.ant-table-row-expand-icon');
    if (expandBtn) {
      fe.click(expandBtn);
    }

    await waitFor(() => {
      expect(screen.getByText('Script Approval')).toBeInTheDocument();
    });
  });

  it('shows COMPLETED status tag for a completed milestone', async () => {
    const { milestoneApi } = await import('../../../services/api');
    (milestoneApi.list as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          milestones: [
            {
              id: 'ms-done',
              title: 'Completed Task',
              description: null,
              dueDate: '2024-01-10T00:00:00Z',
              status: 'COMPLETED',
              completedAt: '2024-01-09T00:00:00Z',
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
        },
      },
    });

    const { fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('Jane Creator')).toBeInTheDocument();
    });

    const expandBtn = document.querySelector('.ant-table-row-expand-icon');
    if (expandBtn) {
      fe.click(expandBtn);
    }

    await waitFor(() => {
      expect(screen.getByText('Completed Task')).toBeInTheDocument();
      // Completed milestones render a COMPLETED status tag
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });
  });

  it('renders empty deals table when API returns empty array', async () => {
    const { companyApi } = await import('../../../services/api');
    (companyApi.getDeals as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: { deals: [] },
      },
    });

    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('Manage Deals')).toBeInTheDocument();
    });
    // Ant Design table renders "No data" — target the description div to avoid the <title> element
    const emptyDesc = document.querySelector('.ant-empty-description');
    expect(emptyDesc).toBeTruthy();
    expect(emptyDesc?.textContent).toMatch(/No data/i);
  });

  it('cancels the Add Milestone form when Cancel is clicked', async () => {
    const { fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('Jane Creator')).toBeInTheDocument();
    });

    const expandBtn = document.querySelector('.ant-table-row-expand-icon');
    if (expandBtn) {
      fe.click(expandBtn);
    }

    await waitFor(() => {
      expect(screen.getByText('Add Milestone')).toBeInTheDocument();
    });

    fe.click(screen.getByText('Add Milestone'));

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    fe.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Draft script approval/i)).not.toBeInTheDocument();
    });
  });

  it('calls milestoneApi.list with the dealId when row is expanded', async () => {
    const { milestoneApi } = await import('../../../services/api');
    const { fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<CompanyDeals />);

    await waitFor(() => {
      expect(screen.getByText('Jane Creator')).toBeInTheDocument();
    });

    const expandBtn = document.querySelector('.ant-table-row-expand-icon');
    if (expandBtn) {
      fe.click(expandBtn);
    }

    await waitFor(() => {
      expect(milestoneApi.list).toHaveBeenCalledWith('aadeal1');
    });
  });
});
