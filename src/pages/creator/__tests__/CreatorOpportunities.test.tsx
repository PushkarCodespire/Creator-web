import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  opportunityApi: {
    getAll: vi.fn().mockResolvedValue({ data: { data: { opportunities: [], pagination: { total: 0, totalPages: 1, page: 1, limit: 10 } } } }),
    apply: vi.fn().mockResolvedValue({ data: {} }),
  },
  creatorApi: {
    getProfile: vi.fn().mockResolvedValue({ data: { data: null } }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import CreatorOpportunities from '../CreatorOpportunities';

describe('CreatorOpportunities', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorOpportunities />);
    expect(container.firstChild).toBeTruthy();
  });
});
