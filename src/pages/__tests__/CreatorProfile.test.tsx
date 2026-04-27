vi.mock('../../services/api', () => ({
  creatorApi: {
    getCreatorByUsername: vi.fn().mockResolvedValue({ data: { data: null } }),
    getCreatorById: vi.fn().mockResolvedValue({ data: { data: null } }),
  },
  postApi: {
    getCreatorPosts: vi.fn().mockResolvedValue({ data: { data: { posts: [] } } }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    section: ({ children, ...p }: any) => <section {...p}>{children}</section>,
    h1: ({ children, ...p }: any) => <h1 {...p}>{children}</h1>,
    p: ({ children, ...p }: any) => <p {...p}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 0,
  useInView: () => true,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ username: 'testcreator' }),
    useNavigate: () => vi.fn(),
  };
});

import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import CreatorProfile from '../CreatorProfile';

describe('CreatorProfile', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorProfile />);
    expect(container.firstChild).toBeTruthy();
  });
});
