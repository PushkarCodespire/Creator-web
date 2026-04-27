import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  companyApi: {
    discoverCreators: vi.fn().mockResolvedValue({ data: { data: { creators: [], pagination: { total: 0, totalPages: 1 } } } }),
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

import CompanyDiscover from '../CompanyDiscover';

describe('CompanyDiscover', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CompanyDiscover />);
    expect(container.firstChild).toBeTruthy();
  });
});
