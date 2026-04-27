import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getDeals: vi.fn().mockResolvedValue({ data: { data: { deals: [], stats: {} } } }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import AdminDeals from '../AdminDeals';

describe('AdminDeals', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminDeals />);
    expect(container.firstChild).toBeTruthy();
  });
});
