import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  companyApi: {
    getDashboard: vi.fn().mockResolvedValue({ data: { data: { deals: [], topCreators: [], stats: {} } } }),
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import CompanyDashboard from '../CompanyDashboard';

describe('CompanyDashboard', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CompanyDashboard />);
    expect(container.firstChild).toBeTruthy();
  });
});
