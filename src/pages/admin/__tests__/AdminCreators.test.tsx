import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getCreators: vi.fn().mockResolvedValue({ data: { data: { creators: [], pagination: { total: 0, totalPages: 1 } } } }),
    updateCreatorStatus: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/admin/CreatorDetailModal', () => ({
  default: () => <div data-testid="creator-modal" />,
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import AdminCreators from '../AdminCreators';

describe('AdminCreators', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminCreators />);
    expect(container.firstChild).toBeTruthy();
  });
});
