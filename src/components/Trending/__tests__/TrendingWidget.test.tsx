import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  trendingApi: {
    getTrendingPosts: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getTrendingCreators: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import TrendingWidget from '../TrendingWidget';

describe('TrendingWidget', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TrendingWidget />);
    expect(container.firstChild).toBeTruthy();
  });
});
