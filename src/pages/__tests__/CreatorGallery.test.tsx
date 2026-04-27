vi.mock('../../services/api', () => ({
  creatorApi: {
    getCreators: vi.fn().mockResolvedValue({ data: { data: { creators: [], total: 0, categories: [] } } }),
    getCategories: vi.fn().mockResolvedValue({ data: { data: { categories: [] } } }),
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    h1: ({ children, ...p }: any) => <h1 {...p}>{children}</h1>,
    section: ({ children, ...p }: any) => <section {...p}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

vi.mock('../../components/Search', () => ({
  CreatorFilters: () => <div data-testid="creator-filters" />,
}));

import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import CreatorGallery from '../CreatorGallery';

describe('CreatorGallery', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorGallery />);
    expect(container.firstChild).toBeTruthy();
  });
});
