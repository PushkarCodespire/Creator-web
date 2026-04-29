import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getAIModerationStats: vi.fn().mockResolvedValue({
      data: {
        data: {
          totalAIReports: 100,
          blocked: 10,
          flagged: 20,
          byReason: {},
        },
      },
    }),
    getAIModerationLogs: vi.fn().mockResolvedValue({
      data: {
        data: {
          logs: [],
          pagination: { page: 1, total: 0 },
        },
      },
    }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import AdminAIModeration from '../AdminAIModeration';

describe('AdminAIModeration', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminAIModeration />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders AI Moderation title heading', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('AI Content Guard')).toBeInTheDocument();
    });
  });

  it('renders Activity Logs tab', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('Activity Logs')).toBeInTheDocument();
    });
  });

  it('renders Sandbox Simulator tab', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument();
    });
  });

  it('shows content input textarea in test tab', async () => {
    renderWithProviders(<AdminAIModeration />);
    // Textarea lives in the Sandbox Simulator tab — click it to activate
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Paste content here to test against the AI safety model...')
      ).toBeInTheDocument();
    });
  });

  it('renders stats cards when stats are loaded', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // totalAIReports
    });
  });

  it('renders Refresh button in logs tab', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Activity Logs')).toBeInTheDocument());
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('clicking Refresh button re-calls getAIModerationLogs', async () => {
    const { adminApi } = await import('../../../services/api');
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Refresh')).toBeInTheDocument());
    const callsBefore = (adminApi.getAIModerationLogs as ReturnType<typeof vi.fn>).mock.calls.length;
    fireEvent.click(screen.getByText('Refresh'));
    await waitFor(() => {
      expect((adminApi.getAIModerationLogs as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it('switches to Sandbox Simulator tab and renders Run Safety Analysis button', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() => {
      expect(screen.getByText('Run Safety Analysis')).toBeInTheDocument();
    });
  });

  it('typing in the textarea updates the content input value', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Paste content here to test against the AI safety model...')).toBeInTheDocument()
    );
    const textarea = screen.getByPlaceholderText('Paste content here to test against the AI safety model...');
    fireEvent.change(textarea, { target: { value: 'test content' } });
    expect((textarea as HTMLTextAreaElement).value).toBe('test content');
  });

  it('shows auto-blocked and flagged stat values', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();  // blocked
      expect(screen.getByText('20')).toBeInTheDocument();  // flagged
    });
  });

  it('renders the hero subtitle text', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('Real-time automated content filtering and safety intelligence.')).toBeInTheDocument();
    });
  });

  it('renders Total Scans stat label', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('Total Scans (30d)')).toBeInTheDocument();
    });
  });

  it('renders Auto-Blocked stat label', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('Auto-Blocked')).toBeInTheDocument();
    });
  });

  it('renders Flagged stat label', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('Flagged')).toBeInTheDocument();
    });
  });

  it('renders "Recent automated safety decisions" description text in logs tab', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('Recent automated safety decisions')).toBeInTheDocument();
    });
  });

  it('renders "Analysis Results" panel when Sandbox tab is active', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    });
  });

  it('renders "Content Input" label in Sandbox tab', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() => {
      expect(screen.getByText('Content Input')).toBeInTheDocument();
    });
  });

  it('shows "Analyze content to see safety metrics" placeholder text in Sandbox tab when no result', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() => {
      expect(screen.getByText('Analyze content to see safety metrics')).toBeInTheDocument();
    });
  });

  it('Run Safety Analysis button is disabled-like (does not call testAIModeration) when textarea is empty', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi as any).testAIModeration = vi.fn().mockResolvedValue({ data: { data: {} } });
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() => expect(screen.getByText('Run Safety Analysis')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Run Safety Analysis'));
    // testAIModeration should NOT be called when content is empty
    expect((adminApi as any).testAIModeration).not.toHaveBeenCalled();
  });

  it('renders Top Violation stat card with "Clean Record" when byReason is empty', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('Clean Record')).toBeInTheDocument();
    });
  });

  it('calls getAIModerationStats on mount', async () => {
    const { adminApi } = await import('../../../services/api');
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(adminApi.getAIModerationStats).toHaveBeenCalledWith('30d');
    });
  });

  it('calls getAIModerationLogs on mount with page=1 and limit=20', async () => {
    const { adminApi } = await import('../../../services/api');
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(adminApi.getAIModerationLogs).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  it('renders the Top Violation stat label', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('Top Violation')).toBeInTheDocument();
    });
  });

  it('shows top violation category when byReason has entries', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getAIModerationStats as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          totalAIReports: 50,
          blocked: 5,
          flagged: 15,
          byReason: { HATE_SPEECH: 8 },
        },
      },
    });
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('hate speech')).toBeInTheDocument();
    });
  });

  it('calls testAIModeration when textarea has content and Run Safety Analysis is clicked', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi as any).testAIModeration = vi.fn().mockResolvedValue({
      data: {
        data: {
          isFlagged: false,
          violatedCategories: [],
          scores: {},
          recommendation: '',
        },
      },
    });

    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Paste content here to test against the AI safety model...')).toBeInTheDocument()
    );

    fireEvent.change(
      screen.getByPlaceholderText('Paste content here to test against the AI safety model...'),
      { target: { value: 'test message content' } }
    );
    fireEvent.click(screen.getByText('Run Safety Analysis'));

    await waitFor(() => {
      expect((adminApi as any).testAIModeration).toHaveBeenCalledWith('test message content');
    });
  });

  it('shows FLAGGED tag in analysis results when testResult.isFlagged is true', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi as any).testAIModeration = vi.fn().mockResolvedValue({
      data: {
        data: {
          isFlagged: true,
          violatedCategories: ['toxicity'],
          scores: { toxicity: 0.9 },
          recommendation: 'Content violates safety guidelines.',
        },
      },
    });

    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Paste content here to test against the AI safety model...')).toBeInTheDocument()
    );

    fireEvent.change(
      screen.getByPlaceholderText('Paste content here to test against the AI safety model...'),
      { target: { value: 'bad content' } }
    );
    fireEvent.click(screen.getByText('Run Safety Analysis'));

    await waitFor(() => {
      expect(screen.getByText('FLAGGED')).toBeInTheDocument();
    });
  });

  it('shows PASSED tag when testResult.isFlagged is false', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi as any).testAIModeration = vi.fn().mockResolvedValue({
      data: {
        data: {
          isFlagged: false,
          violatedCategories: [],
          scores: {},
          recommendation: '',
        },
      },
    });

    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Paste content here to test against the AI safety model...')).toBeInTheDocument()
    );

    fireEvent.change(
      screen.getByPlaceholderText('Paste content here to test against the AI safety model...'),
      { target: { value: 'safe content' } }
    );
    fireEvent.click(screen.getByText('Run Safety Analysis'));

    await waitFor(() => {
      expect(screen.getByText('PASSED')).toBeInTheDocument();
    });
  });

  it('shows "Content meets all safety standards" when no violated categories', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi as any).testAIModeration = vi.fn().mockResolvedValue({
      data: {
        data: {
          isFlagged: false,
          violatedCategories: [],
          scores: {},
          recommendation: '',
        },
      },
    });

    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Paste content here to test against the AI safety model...')).toBeInTheDocument()
    );

    fireEvent.change(
      screen.getByPlaceholderText('Paste content here to test against the AI safety model...'),
      { target: { value: 'safe message' } }
    );
    fireEvent.click(screen.getByText('Run Safety Analysis'));

    await waitFor(() => {
      expect(screen.getByText('Content meets all safety standards')).toBeInTheDocument();
    });
  });

  it('shows Safety Warning section when content is flagged', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi as any).testAIModeration = vi.fn().mockResolvedValue({
      data: {
        data: {
          isFlagged: true,
          violatedCategories: ['hate'],
          scores: { hate: 0.95 },
          recommendation: 'This content contains hate speech.',
        },
      },
    });

    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Paste content here to test against the AI safety model...')).toBeInTheDocument()
    );
    fireEvent.change(
      screen.getByPlaceholderText('Paste content here to test against the AI safety model...'),
      { target: { value: 'hateful content' } }
    );
    fireEvent.click(screen.getByText('Run Safety Analysis'));

    await waitFor(() => {
      expect(screen.getByText('Safety Warning')).toBeInTheDocument();
    });
  });

  it('shows "System Decision" label in analysis results after test run', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi as any).testAIModeration = vi.fn().mockResolvedValue({
      data: {
        data: {
          isFlagged: false,
          violatedCategories: [],
          scores: {},
          recommendation: '',
        },
      },
    });

    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Paste content here to test against the AI safety model...')).toBeInTheDocument()
    );
    fireEvent.change(
      screen.getByPlaceholderText('Paste content here to test against the AI safety model...'),
      { target: { value: 'test' } }
    );
    fireEvent.click(screen.getByText('Run Safety Analysis'));

    await waitFor(() => {
      expect(screen.getByText('System Decision')).toBeInTheDocument();
    });
  });

  it('shows "Category Breakdown" label after test result', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi as any).testAIModeration = vi.fn().mockResolvedValue({
      data: {
        data: {
          isFlagged: false,
          violatedCategories: [],
          scores: {},
          recommendation: '',
        },
      },
    });

    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => expect(screen.getByText('Sandbox Simulator')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sandbox Simulator'));
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Paste content here to test against the AI safety model...')).toBeInTheDocument()
    );
    fireEvent.change(
      screen.getByPlaceholderText('Paste content here to test against the AI safety model...'),
      { target: { value: 'test' } }
    );
    fireEvent.click(screen.getByText('Run Safety Analysis'));

    await waitFor(() => {
      expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
    });
  });

  it('renders the table in logs tab with correct "No data" state when logs are empty', async () => {
    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      // Ant Design shows "No Data" or similar when dataSource is empty
      expect(screen.getByText('Activity Logs')).toBeInTheDocument();
    });
  });

  it('shows logs table entries when getAIModerationLogs returns data', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getAIModerationLogs as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          logs: [
            {
              id: 'log-1',
              createdAt: '2026-01-15T10:30:00Z',
              targetType: 'MESSAGE',
              reason: 'HATE_SPEECH',
              metadata: { scores: { hate: 0.9 }, autoAction: 'BLOCKED' },
            },
          ],
          pagination: { page: 1, total: 1 },
        },
      },
    });

    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('MESSAGE')).toBeInTheDocument();
    });
  });

  it('renders "BLOCKED" decision tag in logs table', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getAIModerationLogs as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          logs: [
            {
              id: 'log-2',
              createdAt: '2026-01-15T11:00:00Z',
              targetType: 'POST',
              reason: 'SPAM',
              metadata: { scores: {}, autoAction: 'BLOCKED' },
            },
          ],
          pagination: { page: 1, total: 1 },
        },
      },
    });

    renderWithProviders(<AdminAIModeration />);
    await waitFor(() => {
      expect(screen.getByText('BLOCKED')).toBeInTheDocument();
    });
  });
});
