import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  companyApi: {
    getDeals: vi.fn().mockResolvedValue({ data: { data: [] } }),
    completeDeal: vi.fn().mockResolvedValue({ data: {} }),
  },
  milestoneApi: {
    getByDeal: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import CompanyDeals from '../CompanyDeals';

describe('CompanyDeals', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CompanyDeals />);
    expect(container.firstChild).toBeTruthy();
  });
});
