import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import RevenueChart from '../RevenueChart';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock recharts to avoid rendering issues in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  ComposedChart: ({ children }: any) => <div data-testid="composed-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

const mockData = {
  historical: [
    { month: 'Jan', revenue: 5000 },
    { month: 'Feb', revenue: 7000 },
    { month: 'Mar', revenue: 8000 },
  ],
  forecast: [
    { month: 'Apr', revenue: 9000, confidence: { low: 7500, high: 10500 } },
    { month: 'May', revenue: 10000, confidence: { low: 8000, high: 12000 } },
  ],
  trend: 'increasing' as const,
  growthRate: 15,
};

describe('RevenueChart', () => {
  it('renders empty state when data is null', () => {
    renderWithProviders(<RevenueChart data={null} />);
    expect(screen.getByText('No revenue data analyzed yet.')).toBeInTheDocument();
  });

  it('renders empty state when historical data is empty', () => {
    renderWithProviders(
      <RevenueChart data={{ ...mockData, historical: [] }} />
    );
    expect(screen.getByText('No revenue data analyzed yet.')).toBeInTheDocument();
  });

  it('renders chart title and trend info', () => {
    renderWithProviders(<RevenueChart data={mockData} />);
    expect(screen.getByText('Revenue Projection')).toBeInTheDocument();
    expect(screen.getByText('INCREASING')).toBeInTheDocument();
    expect(screen.getAllByText(/15%/)[0]).toBeInTheDocument();
  });

  it('renders the chart container', () => {
    renderWithProviders(<RevenueChart data={mockData} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders the composed chart inside the responsive container', () => {
    renderWithProviders(<RevenueChart data={mockData} />);
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
  });

  it('renders the subtitle text about AI-powered forecast', () => {
    renderWithProviders(<RevenueChart data={mockData} />);
    expect(screen.getByText(/AI-powered 3-month forecast/i)).toBeInTheDocument();
  });

  it('renders the "Intelligence insight" text in the footer note', () => {
    renderWithProviders(<RevenueChart data={mockData} />);
    expect(screen.getByText(/Intelligence insight/i)).toBeInTheDocument();
  });

  it('renders growth rate with a + prefix for positive growth', () => {
    renderWithProviders(<RevenueChart data={mockData} />);
    expect(screen.getAllByText(/\+15%/)[0]).toBeInTheDocument();
  });

  it('renders DECREASING trend label when trend is decreasing', () => {
    renderWithProviders(<RevenueChart data={{ ...mockData, trend: 'decreasing', growthRate: -5 }} />);
    expect(screen.getByText('DECREASING')).toBeInTheDocument();
  });

  it('renders STABLE trend label when trend is stable', () => {
    renderWithProviders(<RevenueChart data={{ ...mockData, trend: 'stable', growthRate: 0 }} />);
    expect(screen.getByText('STABLE')).toBeInTheDocument();
  });

  it('renders the "Growth:" label alongside the growth rate', () => {
    renderWithProviders(<RevenueChart data={mockData} />);
    expect(screen.getByText(/Growth:/i)).toBeInTheDocument();
  });

  it('renders the area, bar, and line chart sub-components', () => {
    renderWithProviders(<RevenueChart data={mockData} />);
    expect(screen.getAllByTestId('area').length).toBeGreaterThan(0);
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  it('renders the growth rate value in the insight footer', () => {
    renderWithProviders(<RevenueChart data={mockData} />);
    // The footer sentence includes the growth rate
    expect(screen.getByText(/15% monthly climb/i)).toBeInTheDocument();
  });

  it('renders "Historical earnings vs AI-powered 3-month forecast" subtitle', () => {
    renderWithProviders(<RevenueChart data={mockData} />);
    expect(screen.getByText(/Historical earnings/i)).toBeInTheDocument();
  });

  it('renders "95% confidence variance" in the footer note', () => {
    renderWithProviders(<RevenueChart data={mockData} />);
    expect(screen.getByText(/95% confidence variance/i)).toBeInTheDocument();
  });

  it('renders growth rate without + prefix when growthRate is 0', () => {
    renderWithProviders(<RevenueChart data={{ ...mockData, trend: 'stable', growthRate: 0 }} />);
    // Should show "0%" not "+0%"
    const allMatches = screen.getAllByText(/0%/);
    expect(allMatches.length).toBeGreaterThan(0);
    expect(screen.queryByText(/\+0%/)).not.toBeInTheDocument();
  });

  it('renders negative growth rate without + prefix for decreasing trend', () => {
    renderWithProviders(<RevenueChart data={{ ...mockData, trend: 'decreasing', growthRate: -8 }} />);
    expect(screen.getAllByText(/-8%/)[0]).toBeInTheDocument();
    expect(screen.queryByText(/\+-8%/)).not.toBeInTheDocument();
  });
});
