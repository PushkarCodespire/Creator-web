import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getHomeCreators: vi.fn().mockResolvedValue({ data: { data: { featured: [], mainHighlight: null, allCreators: [] } } }),
    updateHomeFeatured: vi.fn().mockResolvedValue({ data: {} }),
  },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import AdminHomePage from '../AdminHomePage';

describe('AdminHomePage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminHomePage />);
    expect(container.firstChild).toBeTruthy();
  });
});
