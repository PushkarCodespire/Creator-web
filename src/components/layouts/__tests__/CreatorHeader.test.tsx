vi.mock('../../../services/api', () => ({
  searchApi: {
    globalSearch: vi.fn().mockResolvedValue({ data: { data: { creators: [], posts: [] } } }),
  },
  notificationApi: {
    getUnreadCount: vi.fn().mockResolvedValue({ data: { data: { count: 0 } } }),
    getNotifications: vi.fn().mockResolvedValue({ data: { data: { notifications: [] } } }),
  },
}));

vi.mock('../DashboardFilterContext', () => ({
  useDashboardFilter: () => ({ period: '7D', setPeriod: vi.fn(), days: 7 }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CreatorHeader from '../CreatorHeader';

describe('CreatorHeader', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorHeader />);
    expect(container.firstChild).toBeTruthy();
  });
});
