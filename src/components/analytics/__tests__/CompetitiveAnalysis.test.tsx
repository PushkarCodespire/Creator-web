import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CompetitiveAnalysis from '../CompetitiveAnalysis';

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => <div />,
  PolarAngleAxis: () => <div />,
  PolarRadiusAxis: () => <div />,
  Radar: () => <div />,
  Legend: () => <div />,
}));

vi.mock('../../../services/api', () => ({
  analyticsApi: {
    getCompetitiveAnalysis: vi.fn(),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { analyticsApi } from '../../../services/api';

const mockComparisonData = {
  yourMetrics: { engagement: 80, revenue: 60, growth: 70, responseRate: 90, avgResponseTime: 50 },
  categoryAverage: { engagement: 60, revenue: 50, growth: 55, responseRate: 70, avgResponseTime: 60 },
  topPerformers: { engagement: 95, revenue: 90, growth: 85, responseRate: 98, avgResponseTime: 30 },
};

describe('CompetitiveAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state when no data available', async () => {
    (analyticsApi.getCompetitiveAnalysis as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

    renderWithProviders(<CompetitiveAnalysis creatorId="c-1" />);

    await waitFor(() => {
      expect(screen.getByText('No comparison data available')).toBeInTheDocument();
    });
  });

  it('renders charts when data is available', async () => {
    (analyticsApi.getCompetitiveAnalysis as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockComparisonData },
    });

    renderWithProviders(<CompetitiveAnalysis creatorId="c-1" />);

    await waitFor(() => {
      expect(screen.getByText('Competitive Analysis')).toBeInTheDocument();
    });
    expect(screen.getByText('Performance Comparison')).toBeInTheDocument();
    expect(screen.getByText('Multi-Metric Radar')).toBeInTheDocument();
  });

  it('renders metric selector', async () => {
    (analyticsApi.getCompetitiveAnalysis as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockComparisonData },
    });

    renderWithProviders(<CompetitiveAnalysis creatorId="c-1" />);

    await waitFor(() => {
      expect(screen.getByText('Competitive Analysis')).toBeInTheDocument();
    });
    // The Select component should be rendered with default "Engagement"
    expect(screen.getByText('Engagement')).toBeInTheDocument();
  });
});
