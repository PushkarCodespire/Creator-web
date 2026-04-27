import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getCompanies: vi.fn().mockResolvedValue({ data: { data: { companies: [], pagination: { total: 0, totalPages: 1 } } } }),
    updateCompanyStatus: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import AdminCompanies from '../AdminCompanies';

describe('AdminCompanies', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminCompanies />);
    expect(container.firstChild).toBeTruthy();
  });
});
