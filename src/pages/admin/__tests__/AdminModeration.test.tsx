import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getReports: vi.fn().mockResolvedValue({ data: { data: { reports: [], pagination: { total: 0 } } } }),
    getModerationStats: vi.fn().mockResolvedValue({
      data: {
        data: {
          totalReports: 0, pendingReports: 0, resolvedToday: 0,
          bannedUsers: 0, suspendedUsers: 0, reportsByReason: [], actionsTaken: [],
        },
      },
    }),
    getReportDetails: vi.fn().mockResolvedValue({ data: { data: { report: {}, targetContext: {}, moderationHistory: [] } } }),
    resolveReport: vi.fn().mockResolvedValue({ data: {} }),
    dismissReport: vi.fn().mockResolvedValue({ data: {} }),
    suspendUser: vi.fn().mockResolvedValue({ data: {} }),
    banUser: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

vi.mock('../../../styles/AdminPanel.css', () => ({}));

import { screen, waitFor, fireEvent } from '@testing-library/react';
import AdminModeration from '../AdminModeration';

describe('AdminModeration', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminModeration />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Reports & Moderation heading', () => {
    renderWithProviders(<AdminModeration />);
    expect(screen.getByText('Reports & Moderation')).toBeInTheDocument();
  });

  it('renders subtitle text', () => {
    renderWithProviders(<AdminModeration />);
    expect(screen.getByText(/Review user reports and manage content violations/i)).toBeInTheDocument();
  });

  it('renders the reports table area', () => {
    const { container } = renderWithProviders(<AdminModeration />);
    expect(container.querySelector('.admin-page')).toBeTruthy();
  });

  it('renders with loading state', () => {
    const { container } = renderWithProviders(<AdminModeration />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: true, error: null },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders filter dropdowns with options visible', async () => {
    renderWithProviders(<AdminModeration />);
    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  it('renders Refresh button', () => {
    renderWithProviders(<AdminModeration />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('shows empty table message when no reports', async () => {
    renderWithProviders(<AdminModeration />);
    await waitFor(() => {
      expect(screen.getByText('No reports found')).toBeInTheDocument();
    });
  });

  it('shows report count text in toolbar after load', async () => {
    renderWithProviders(<AdminModeration />);
    await waitFor(() => {
      expect(screen.getByText(/Showing 0 moderation reports/i)).toBeInTheDocument();
    });
  });

  it('clicking Refresh button triggers another getReports call', async () => {
    const { adminApi } = await import('../../../services/api');
    renderWithProviders(<AdminModeration />);
    await waitFor(() => expect(screen.getByText('Refresh')).toBeInTheDocument());
    const before = (adminApi.getReports as ReturnType<typeof vi.fn>).mock.calls.length;
    fireEvent.click(screen.getByText('Refresh'));
    await waitFor(() => {
      expect((adminApi.getReports as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(before);
    });
  });

  it('renders column headers in the table', async () => {
    renderWithProviders(<AdminModeration />);
    await waitFor(() => {
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Reason')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });
  });

  it('renders review column Action header', async () => {
    renderWithProviders(<AdminModeration />);
    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  it('renders Reporter column header', async () => {
    renderWithProviders(<AdminModeration />);
    await waitFor(() => {
      expect(screen.getByText('Reporter')).toBeInTheDocument();
    });
  });

  it('renders Description column header', async () => {
    renderWithProviders(<AdminModeration />);
    await waitFor(() => {
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  it('renders stat cards once stats are loaded', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getModerationStats as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          totalReports: 10, pendingReports: 3, resolvedToday: 2,
          bannedUsers: 1, suspendedUsers: 4, reportsByReason: [], actionsTaken: [],
        },
      },
    });
    renderWithProviders(<AdminModeration />);
    await waitFor(() => {
      expect(screen.getByText('PENDING')).toBeInTheDocument();
      expect(screen.getByText('RESOLVED')).toBeInTheDocument();
      expect(screen.getByText('ACTIVE TASKS')).toBeInTheDocument();
      expect(screen.getByText('BANNED')).toBeInTheDocument();
    });
  });

  it('renders a report row when API returns reports', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r1',
              targetType: 'USER',
              targetId: 'u1',
              reason: 'SPAM',
              status: 'PENDING',
              priority: 'LOW',
              createdAt: '2026-01-15T10:00:00Z',
              reporter: { id: 'rep1', name: 'Alice', email: 'alice@example.com' },
            },
          ],
          pagination: { total: 1 },
        },
      },
    });
    renderWithProviders(<AdminModeration />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  it('renders Review button for each report row', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r2',
              targetType: 'MESSAGE',
              targetId: 'm1',
              reason: 'HARASSMENT',
              status: 'PENDING',
              priority: 'HIGH',
              createdAt: '2026-01-20T12:00:00Z',
              reporter: { id: 'rep2', name: 'Bob', email: 'bob@example.com' },
            },
          ],
          pagination: { total: 1 },
        },
      },
    });
    renderWithProviders(<AdminModeration />);
    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });
  });

  it('status filter select control is present in the DOM', async () => {
    renderWithProviders(<AdminModeration />);
    await waitFor(() => {
      // Ant Design Select renders a role="combobox" for the filter control
      const combos = document.querySelectorAll('.ant-select');
      expect(combos.length).toBeGreaterThan(0);
    });
  });

  it('priority filter select control is present in the DOM', async () => {
    renderWithProviders(<AdminModeration />);
    await waitFor(() => {
      const combos = document.querySelectorAll('.ant-select');
      expect(combos.length).toBeGreaterThan(0);
    });
  });

  it('renders report row with HARASSMENT reason tag', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r3',
              targetType: 'MESSAGE',
              targetId: 'm3',
              reason: 'HARASSMENT',
              status: 'PENDING',
              priority: 'HIGH',
              createdAt: '2026-02-01T09:00:00Z',
              reporter: { id: 'rep3', name: 'Carol', email: 'carol@example.com' },
            },
          ],
          pagination: { total: 1 },
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('HARASSMENT')).toBeInTheDocument();
    });
  });

  it('renders report row with SPAM reason tag', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r4',
              targetType: 'USER',
              targetId: 'u4',
              reason: 'SPAM',
              status: 'PENDING',
              priority: 'LOW',
              createdAt: '2026-02-10T08:00:00Z',
              reporter: null,
            },
          ],
          pagination: { total: 1 },
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('SPAM')).toBeInTheDocument();
    });
  });

  it('shows "Anonymous" when reporter is null', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r5',
              targetType: 'CREATOR',
              targetId: 'c5',
              reason: 'OTHER',
              status: 'PENDING',
              priority: 'MEDIUM',
              createdAt: '2026-02-15T07:00:00Z',
              reporter: null,
            },
          ],
          pagination: { total: 1 },
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Anonymous')).toBeInTheDocument();
    });
  });

  it('shows stat value numbers when stats API returns non-zero data', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getModerationStats as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          totalReports: 42,
          pendingReports: 7,
          resolvedToday: 5,
          bannedUsers: 3,
          suspendedUsers: 2,
          reportsByReason: [],
          actionsTaken: [],
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('clicking Review button opens the report details modal', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r6',
              targetType: 'USER',
              targetId: 'u6',
              reason: 'SPAM',
              status: 'PENDING',
              priority: 'LOW',
              createdAt: '2026-03-01T10:00:00Z',
              reporter: { id: 'rep6', name: 'Dave', email: 'dave@example.com' },
            },
          ],
          pagination: { total: 1 },
        },
      },
    });

    (adminApi.getReportDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          report: {
            id: 'r6',
            targetType: 'USER',
            targetId: 'u6',
            reason: 'SPAM',
            status: 'PENDING',
            priority: 'LOW',
            createdAt: '2026-03-01T10:00:00Z',
            reporter: { id: 'rep6', name: 'Dave', email: 'dave@example.com' },
          },
          targetContext: { content: 'Spammy content' },
          moderationHistory: [],
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review'));

    await waitFor(() => {
      expect(adminApi.getReportDetails).toHaveBeenCalledWith('r6');
    });
  });

  it('modal shows "Incident Summary" heading when a report is loaded', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r7',
              targetType: 'CREATOR',
              targetId: 'c7',
              reason: 'HATE_SPEECH',
              status: 'PENDING',
              priority: 'URGENT',
              createdAt: '2026-03-05T11:00:00Z',
              reporter: { id: 'rep7', name: 'Eve', email: 'eve@example.com' },
            },
          ],
          pagination: { total: 1 },
        },
      },
    });

    (adminApi.getReportDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          report: {
            id: 'r7',
            targetType: 'CREATOR',
            targetId: 'c7',
            reason: 'HATE_SPEECH',
            status: 'PENDING',
            priority: 'URGENT',
            createdAt: '2026-03-05T11:00:00Z',
            reporter: { id: 'rep7', name: 'Eve', email: 'eve@example.com' },
          },
          targetContext: {},
          moderationHistory: [],
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review'));

    await waitFor(() => {
      expect(screen.getByText('Incident Summary')).toBeInTheDocument();
    });
  });

  it('modal shows "No previous actions" when moderation history is empty', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r8',
              targetType: 'MESSAGE',
              targetId: 'm8',
              reason: 'SCAM',
              status: 'PENDING',
              priority: 'HIGH',
              createdAt: '2026-03-10T12:00:00Z',
              reporter: { id: 'rep8', name: 'Frank', email: 'frank@example.com' },
            },
          ],
          pagination: { total: 1 },
        },
      },
    });

    (adminApi.getReportDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          report: {
            id: 'r8',
            targetType: 'MESSAGE',
            targetId: 'm8',
            reason: 'SCAM',
            status: 'PENDING',
            priority: 'HIGH',
            createdAt: '2026-03-10T12:00:00Z',
            reporter: { id: 'rep8', name: 'Frank', email: 'frank@example.com' },
          },
          targetContext: {},
          moderationHistory: [],
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review'));

    await waitFor(() => {
      expect(screen.getByText('No previous actions')).toBeInTheDocument();
    });
  });

  it('modal shows moderation history entries when history is non-empty', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r9',
              targetType: 'USER',
              targetId: 'u9',
              reason: 'VIOLENCE',
              status: 'IN_REVIEW',
              priority: 'URGENT',
              createdAt: '2026-03-12T08:00:00Z',
              reporter: { id: 'rep9', name: 'Grace', email: 'grace@example.com' },
            },
          ],
          pagination: { total: 1 },
        },
      },
    });

    (adminApi.getReportDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          report: {
            id: 'r9',
            targetType: 'USER',
            targetId: 'u9',
            reason: 'VIOLENCE',
            status: 'IN_REVIEW',
            priority: 'URGENT',
            createdAt: '2026-03-12T08:00:00Z',
            reporter: { id: 'rep9', name: 'Grace', email: 'grace@example.com' },
          },
          targetContext: {},
          moderationHistory: [
            {
              id: 'log1',
              action: 'WARNING_SENT',
              reason: 'Initial warning',
              moderator: { name: 'Admin Joe' },
              createdAt: '2026-03-11T10:00:00Z',
            },
          ],
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review'));

    await waitFor(() => {
      expect(screen.getByText('WARNING SENT')).toBeInTheDocument();
    });
  });

  it('modal shows "Decision Matrix" form section heading', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r10',
              targetType: 'CONVERSATION',
              targetId: 'conv10',
              reason: 'MISINFORMATION',
              status: 'PENDING',
              priority: 'MEDIUM',
              createdAt: '2026-03-20T09:00:00Z',
              reporter: { id: 'rep10', name: 'Hank', email: 'hank@example.com' },
            },
          ],
          pagination: { total: 1 },
        },
      },
    });

    (adminApi.getReportDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          report: {
            id: 'r10',
            targetType: 'CONVERSATION',
            targetId: 'conv10',
            reason: 'MISINFORMATION',
            status: 'PENDING',
            priority: 'MEDIUM',
            createdAt: '2026-03-20T09:00:00Z',
            reporter: { id: 'rep10', name: 'Hank', email: 'hank@example.com' },
          },
          targetContext: {},
          moderationHistory: [],
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review'));

    await waitFor(() => {
      expect(screen.getByText('Decision Matrix')).toBeInTheDocument();
    });
  });

  it('modal action form shows "Execute Decision" submit button', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r11',
              targetType: 'USER',
              targetId: 'u11',
              reason: 'IMPERSONATION',
              status: 'PENDING',
              priority: 'HIGH',
              createdAt: '2026-03-22T10:00:00Z',
              reporter: { id: 'rep11', name: 'Iris', email: 'iris@example.com' },
            },
          ],
          pagination: { total: 1 },
        },
      },
    });

    (adminApi.getReportDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          report: {
            id: 'r11',
            targetType: 'USER',
            targetId: 'u11',
            reason: 'IMPERSONATION',
            status: 'PENDING',
            priority: 'HIGH',
            createdAt: '2026-03-22T10:00:00Z',
            reporter: { id: 'rep11', name: 'Iris', email: 'iris@example.com' },
          },
          targetContext: {},
          moderationHistory: [],
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review'));

    await waitFor(() => {
      expect(screen.getByText('Execute Decision')).toBeInTheDocument();
    });
  });

  it('modal shows "Dismiss Report" button for dismissal', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r12',
              targetType: 'USER',
              targetId: 'u12',
              reason: 'COPYRIGHT',
              status: 'PENDING',
              priority: 'LOW',
              createdAt: '2026-03-25T11:00:00Z',
              reporter: { id: 'rep12', name: 'Jake', email: 'jake@example.com' },
            },
          ],
          pagination: { total: 1 },
        },
      },
    });

    (adminApi.getReportDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          report: {
            id: 'r12',
            targetType: 'USER',
            targetId: 'u12',
            reason: 'COPYRIGHT',
            status: 'PENDING',
            priority: 'LOW',
            createdAt: '2026-03-25T11:00:00Z',
            reporter: { id: 'rep12', name: 'Jake', email: 'jake@example.com' },
          },
          targetContext: {},
          moderationHistory: [],
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review'));

    await waitFor(() => {
      expect(screen.getByText('Dismiss Report')).toBeInTheDocument();
    });
  });

  it('clicking "Dismiss Report" calls adminApi.dismissReport', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r13',
              targetType: 'CREATOR',
              targetId: 'c13',
              reason: 'SEXUAL_CONTENT',
              status: 'PENDING',
              priority: 'URGENT',
              createdAt: '2026-03-28T14:00:00Z',
              reporter: { id: 'rep13', name: 'Karen', email: 'karen@example.com' },
            },
          ],
          pagination: { total: 1 },
        },
      },
    });

    (adminApi.getReportDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          report: {
            id: 'r13',
            targetType: 'CREATOR',
            targetId: 'c13',
            reason: 'SEXUAL_CONTENT',
            status: 'PENDING',
            priority: 'URGENT',
            createdAt: '2026-03-28T14:00:00Z',
            reporter: { id: 'rep13', name: 'Karen', email: 'karen@example.com' },
          },
          targetContext: {},
          moderationHistory: [],
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review'));

    await waitFor(() => {
      expect(screen.getByText('Dismiss Report')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Dismiss Report'));

    await waitFor(() => {
      expect(adminApi.dismissReport).toHaveBeenCalledWith('r13', { reason: 'No violation found' });
    });
  });

  it('shows "Report Details" as the modal title', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getReports as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          reports: [
            {
              id: 'r14',
              targetType: 'MESSAGE',
              targetId: 'm14',
              reason: 'OTHER',
              status: 'PENDING',
              priority: 'LOW',
              createdAt: '2026-04-01T10:00:00Z',
              reporter: { id: 'rep14', name: 'Leo', email: 'leo@example.com' },
            },
          ],
          pagination: { total: 1 },
        },
      },
    });

    (adminApi.getReportDetails as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          report: {
            id: 'r14',
            targetType: 'MESSAGE',
            targetId: 'm14',
            reason: 'OTHER',
            status: 'PENDING',
            priority: 'LOW',
            createdAt: '2026-04-01T10:00:00Z',
            reporter: { id: 'rep14', name: 'Leo', email: 'leo@example.com' },
          },
          targetContext: {},
          moderationHistory: [],
        },
      },
    });

    renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Review'));

    await waitFor(() => {
      expect(screen.getByText('Report Details')).toBeInTheDocument();
    });
  });

  it('shows "Dismissed" option in status filter dropdown after opening it', async () => {
    const { container } = renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    // Open the status Select by clicking its selector
    const selects = container.querySelectorAll('.ant-select-selector');
    fireEvent.mouseDown(selects[0]);

    await waitFor(() => {
      expect(screen.getByText('Dismissed')).toBeInTheDocument();
    });
  });

  it('shows "Urgent" option in priority filter dropdown after opening it', async () => {
    const { container } = renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    // Open the priority Select (second select)
    const selects = container.querySelectorAll('.ant-select-selector');
    fireEvent.mouseDown(selects[1]);

    await waitFor(() => {
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });
  });

  it('shows "Message" and "Creator" type filter options after opening type filter', async () => {
    const { container } = renderWithProviders(<AdminModeration />);

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    // Open the type Select (third select)
    const selects = container.querySelectorAll('.ant-select-selector');
    fireEvent.mouseDown(selects[2]);

    await waitFor(() => {
      expect(screen.getByText('Message')).toBeInTheDocument();
      expect(screen.getByText('Creator')).toBeInTheDocument();
    });
  });
});
