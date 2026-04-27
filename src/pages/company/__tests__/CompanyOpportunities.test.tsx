import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  opportunityApi: {
    getCompanyOpportunities: vi.fn().mockResolvedValue({ data: { data: { opportunities: [], pagination: { total: 0, totalPages: 1 } } } }),
    create: vi.fn().mockResolvedValue({ data: {} }),
    update: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
  companyApi: {
    getProfile: vi.fn().mockResolvedValue({ data: { data: null } }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import CompanyOpportunities from '../CompanyOpportunities';

describe('CompanyOpportunities', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CompanyOpportunities />);
    expect(container.firstChild).toBeTruthy();
  });
});
