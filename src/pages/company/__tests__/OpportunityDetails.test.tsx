import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  opportunityApi: {
    getById: vi.fn().mockResolvedValue({ data: { data: null } }),
    getApplications: vi.fn().mockResolvedValue({ data: { data: [] } }),
    updateApplication: vi.fn().mockResolvedValue({ data: {} }),
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
  return { ...actual, useParams: () => ({ opportunityId: 'op1' }), useNavigate: () => vi.fn() };
});

import OpportunityDetails from '../OpportunityDetails';

describe('OpportunityDetails', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<OpportunityDetails />);
    expect(container.firstChild).toBeTruthy();
  });
});
