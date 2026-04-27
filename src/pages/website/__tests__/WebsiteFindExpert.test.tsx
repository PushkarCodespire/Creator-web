import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  creatorApi: { getCreators: vi.fn().mockResolvedValue({ data: { data: [] } }) },
  homeApi: { getCreators: vi.fn().mockResolvedValue({ data: { creators: [] } }) },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import WebsiteFindExpert from '../WebsiteFindExpert';

describe('WebsiteFindExpert', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<WebsiteFindExpert />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders category filters', () => {
    const { getByText } = renderWithProviders(<WebsiteFindExpert />);
    expect(getByText('All')).toBeInTheDocument();
  });
});
