vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ComparisonChart } from '../ComparisonChart';

const mockData = {
  currentPeriod: { messages: 100, revenue: 500, newUsers: 20 },
  previousPeriod: { messages: 80, revenue: 400, newUsers: 15 },
  change: { messages: 25, revenue: 25, newUsers: 33 },
};

describe('ComparisonChart', () => {
  it('renders with null data', () => {
    const { container } = renderWithProviders(
      <ComparisonChart data={null} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders "No comparison data analyzed yet." when null', () => {
    renderWithProviders(<ComparisonChart data={null} />);
    expect(screen.getByText('No comparison data analyzed yet.')).toBeInTheDocument();
  });

  it('renders with valid data', () => {
    const { container } = renderWithProviders(
      <ComparisonChart data={mockData as any} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders "Momentum Comparison" title with data', () => {
    renderWithProviders(<ComparisonChart data={mockData as any} />);
    expect(screen.getByText('Momentum Comparison')).toBeInTheDocument();
  });

  it('renders "Total Messages" metric label', () => {
    renderWithProviders(<ComparisonChart data={mockData as any} />);
    expect(screen.getByText('Total Messages')).toBeInTheDocument();
  });

  it('renders "Total Revenue" metric label', () => {
    renderWithProviders(<ComparisonChart data={mockData as any} />);
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
  });

  it('renders "New Users" metric label', () => {
    renderWithProviders(<ComparisonChart data={mockData as any} />);
    expect(screen.getByText('New Users')).toBeInTheDocument();
  });

  it('renders "Last 30 days vs previous period" text', () => {
    renderWithProviders(<ComparisonChart data={mockData as any} periodDays={30} />);
    expect(screen.getByText('Last 30 days vs previous period')).toBeInTheDocument();
  });

  it('renders bar chart when data present', () => {
    renderWithProviders(<ComparisonChart data={mockData as any} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders custom periodDays in the subtitle text', () => {
    renderWithProviders(<ComparisonChart data={mockData as any} periodDays={7} />);
    expect(screen.getByText('Last 7 days vs previous period')).toBeInTheDocument();
  });

  it('renders current period message count value', () => {
    renderWithProviders(<ComparisonChart data={mockData as any} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders previous period message count in "vs X previously" text', () => {
    renderWithProviders(<ComparisonChart data={mockData as any} />);
    expect(screen.getByText('vs 80 previously')).toBeInTheDocument();
  });

  it('renders revenue with rupee symbol', () => {
    renderWithProviders(<ComparisonChart data={mockData as any} />);
    // current revenue 500 rendered as ₹500
    const rupeeValues = screen.getAllByText(/₹/);
    expect(rupeeValues.length).toBeGreaterThan(0);
  });

  it('renders new users current period value', () => {
    renderWithProviders(<ComparisonChart data={mockData as any} />);
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('renders with loading=true without crashing', () => {
    const { container } = renderWithProviders(
      <ComparisonChart data={mockData as any} loading={true} />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
