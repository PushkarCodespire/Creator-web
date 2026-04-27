import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getModerationCases: vi.fn().mockResolvedValue({ data: { data: { cases: [], stats: {} } } }),
    moderateCase: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import AdminModeration from '../AdminModeration';

describe('AdminModeration', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminModeration />);
    expect(container.firstChild).toBeTruthy();
  });
});
