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

  it('renders with valid data', () => {
    const { container } = renderWithProviders(
      <ComparisonChart data={mockData as any} />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
