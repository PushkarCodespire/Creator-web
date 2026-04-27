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
    expect(screen.getByText(/15%/)).toBeInTheDocument();
  });

  it('renders the chart container', () => {
    renderWithProviders(<RevenueChart data={mockData} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
