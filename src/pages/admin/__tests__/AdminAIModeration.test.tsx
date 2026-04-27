import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getAIModerationStats: vi.fn().mockResolvedValue({ data: { data: {} } }),
    getModerationQueue: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import AdminAIModeration from '../AdminAIModeration';

describe('AdminAIModeration', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminAIModeration />);
    expect(container.firstChild).toBeTruthy();
  });
});
