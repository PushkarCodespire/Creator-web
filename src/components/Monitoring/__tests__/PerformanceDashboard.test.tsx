vi.mock('../../../services/api', () => ({
  monitoringApi: {
    getPerformanceStats: vi.fn().mockResolvedValue({ data: { data: null } }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { PerformanceDashboard } from '../PerformanceDashboard';

describe('PerformanceDashboard', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<PerformanceDashboard />);
    expect(container.firstChild).toBeTruthy();
  });
});
