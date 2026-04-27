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

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { UserAnalytics } from '../UserAnalytics';

describe('UserAnalytics', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<UserAnalytics />);
    expect(container.firstChild).toBeTruthy();
  });
});
