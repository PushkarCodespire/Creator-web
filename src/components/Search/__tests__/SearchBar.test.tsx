import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  searchApi: {
    autocomplete: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getPopularSearches: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
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

import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<SearchBar />);
    expect(container.firstChild).toBeTruthy();
  });
});
