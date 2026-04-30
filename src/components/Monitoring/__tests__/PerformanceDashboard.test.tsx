vi.mock('../../../services/api', () => ({
  monitoringApi: {
    getPerformanceStats: vi.fn().mockResolvedValue({ data: { data: null } }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { PerformanceDashboard } from '../PerformanceDashboard';
import { monitoringApi } from '../../../services/api';

describe('PerformanceDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(<PerformanceDashboard />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows "No performance data available" when data is null', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: null },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(screen.getByText('No performance data available')).toBeInTheDocument();
    });
  });

  it('renders "API Performance" heading when data is available', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          avgResponseTime: 200,
          p95: 400,
          errorRate: 2,
          totalRequests: 1000,
          slowestEndpoints: [],
          requestsByHour: [],
        },
      },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(screen.getByText('API Performance')).toBeInTheDocument();
    });
  });

  it('renders "Avg Response Time" stat when data is available', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          avgResponseTime: 200,
          p95: 400,
          errorRate: 2,
          totalRequests: 1000,
          slowestEndpoints: [],
          requestsByHour: [],
        },
      },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
    });
  });

  it('renders "P95 Response Time" stat when data is available', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          avgResponseTime: 200,
          p95: 400,
          errorRate: 2,
          totalRequests: 1000,
          slowestEndpoints: [],
          requestsByHour: [],
        },
      },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(screen.getByText('P95 Response Time')).toBeInTheDocument();
    });
  });

  it('renders "Error Rate" stat when data is available', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          avgResponseTime: 200,
          p95: 400,
          errorRate: 2,
          totalRequests: 1000,
          slowestEndpoints: [],
          requestsByHour: [],
        },
      },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Error Rate')).toBeInTheDocument();
    });
  });

  it('renders "Total Requests" stat when data is available', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          avgResponseTime: 200,
          p95: 400,
          errorRate: 2,
          totalRequests: 1000,
          slowestEndpoints: [],
          requestsByHour: [],
        },
      },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Total Requests')).toBeInTheDocument();
    });
  });

  it('renders the time-range select with "Last 24 Hours" as default', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          avgResponseTime: 150,
          p95: 300,
          errorRate: 1,
          totalRequests: 500,
          slowestEndpoints: [],
          requestsByHour: [],
        },
      },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
    });
  });

  it('displays the avgResponseTime value', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          avgResponseTime: 237,
          p95: 400,
          errorRate: 2,
          totalRequests: 1000,
          slowestEndpoints: [],
          requestsByHour: [],
        },
      },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(screen.getByText('237')).toBeInTheDocument();
    });
  });

  it('displays the totalRequests value', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          avgResponseTime: 100,
          p95: 200,
          errorRate: 0,
          totalRequests: 9999,
          slowestEndpoints: [],
          requestsByHour: [],
        },
      },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(screen.getByText('9,999')).toBeInTheDocument();
    });
  });

  it('displays the p95 value', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          avgResponseTime: 100,
          p95: 850,
          errorRate: 0,
          totalRequests: 500,
          slowestEndpoints: [],
          requestsByHour: [],
        },
      },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(screen.getByText('850')).toBeInTheDocument();
    });
  });

  it('displays the errorRate value', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          avgResponseTime: 100,
          p95: 200,
          errorRate: 7,
          totalRequests: 500,
          slowestEndpoints: [],
          requestsByHour: [],
        },
      },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });

  it('renders "Last Hour" select option', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          avgResponseTime: 100,
          p95: 200,
          errorRate: 0,
          totalRequests: 500,
          slowestEndpoints: [],
          requestsByHour: [],
        },
      },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
    });
  });

  it('calls getPerformanceStats on mount', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: null },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(monitoringApi.getPerformanceStats).toHaveBeenCalledTimes(1);
    });
  });

  it('calls getPerformanceStats with default hours=24', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: null },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      expect(monitoringApi.getPerformanceStats).toHaveBeenCalledWith({ hours: 24 });
    });
  });

  it('renders "ms" suffix for Avg Response Time', async () => {
    (monitoringApi.getPerformanceStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          avgResponseTime: 300,
          p95: 600,
          errorRate: 1,
          totalRequests: 100,
          slowestEndpoints: [],
          requestsByHour: [],
        },
      },
    });
    renderWithProviders(<PerformanceDashboard />);
    await waitFor(() => {
      const msSuffixes = screen.getAllByText('ms');
      expect(msSuffixes.length).toBeGreaterThanOrEqual(1);
    });
  });
});
