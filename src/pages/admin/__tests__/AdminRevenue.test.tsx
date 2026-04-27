import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getRevenueStats: vi.fn().mockResolvedValue({ data: { data: { overview: {}, topCreators: [], recentTransactions: [] } } }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import AdminRevenue from '../AdminRevenue';

describe('AdminRevenue', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminRevenue />);
    expect(container.firstChild).toBeTruthy();
  });
});
