import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getUsers: vi.fn().mockResolvedValue({ data: { data: { users: [], pagination: { total: 0, totalPages: 1 } } } }),
    updateUserStatus: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import AdminUsers from '../AdminUsers';

describe('AdminUsers', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminUsers />);
    expect(container.firstChild).toBeTruthy();
  });
});
