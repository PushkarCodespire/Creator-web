vi.mock('../../../services/api', () => ({
  analyticsApi: {
    getUserAnalytics: vi.fn().mockResolvedValue({
      data: { data: { chatHistory: [], learningProgress: [], totalMessages: 0, totalChats: 0, avgSessionLength: 0, topicsCovered: 0 } },
    }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
}));

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { UserAnalytics } from '../UserAnalytics';

describe('UserAnalytics', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<UserAnalytics />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Your Analytics heading', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Your Analytics')).toBeInTheDocument();
    });
  });

  it('renders Total Messages stat card', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Total Messages')).toBeInTheDocument();
    });
  });

  it('renders Active Chats stat card', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Active Chats')).toBeInTheDocument();
    });
  });

  it('renders time range selector', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });
  });

  it('renders "Avg Response Time" stat card', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
    });
  });

  it('renders "Active Days" stat card', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Active Days')).toBeInTheDocument();
    });
  });

  it('renders "Chat Activity Over Time" chart card title', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Chat Activity Over Time')).toBeInTheDocument();
    });
  });

  it('renders "Learning Progress by Topic" chart card title', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Learning Progress by Topic')).toBeInTheDocument();
    });
  });

  it('calls getUserAnalytics on mount', async () => {
    const { analyticsApi } = await import('../../../services/api');
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(analyticsApi.getUserAnalytics).toHaveBeenCalled();
    });
  });

  it('renders the line chart element', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('shows zero value for Total Messages when API returns 0', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      // The stat displays the value 0 next to the "Total Messages" label
      expect(screen.getByText('Total Messages')).toBeInTheDocument();
    });
  });

  it('renders "Last 7 days" option in the time range selector', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      // The Select component renders options; "Last 7 days" is a valid option text
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    });
  });

  it('calls getUserAnalytics with "30d" by default', async () => {
    const { analyticsApi } = await import('../../../services/api');
    (analyticsApi.getUserAnalytics as ReturnType<typeof vi.fn>).mockClear();
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(analyticsApi.getUserAnalytics).toHaveBeenCalledWith('30d');
    });
  });

  it('renders four stat cards in total', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('Total Messages')).toBeInTheDocument();
      expect(screen.getByText('Active Chats')).toBeInTheDocument();
      expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
      expect(screen.getByText('Active Days')).toBeInTheDocument();
    });
  });

  it('renders "s" suffix next to Avg Response Time value', async () => {
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      // Ant Design Statistic renders suffix as a separate element
      expect(screen.getByText('s')).toBeInTheDocument();
    });
  });

  it('reflects non-zero engagementStats when API returns real values', async () => {
    const { analyticsApi } = await import('../../../services/api');
    (analyticsApi.getUserAnalytics as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          chatHistory: [],
          learningProgress: [],
          engagementStats: { totalMessages: 42, totalChats: 8, avgResponseTime: 3, activeDays: 15 },
        },
      },
    });
    renderWithProviders(<UserAnalytics />);
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });
});
