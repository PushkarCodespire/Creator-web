import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    section: ({ children, ...p }: any) => <section {...p}>{children}</section>,
    h1: ({ children, ...p }: any) => <h1 {...p}>{children}</h1>,
    h2: ({ children, ...p }: any) => <h2 {...p}>{children}</h2>,
    p: ({ children, ...p }: any) => <p {...p}>{children}</p>,
    span: ({ children, ...p }: any) => <span {...p}>{children}</span>,
    button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
    li: ({ children, ...p }: any) => <li {...p}>{children}</li>,
    img: ({ ...p }: any) => <img {...p} />,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
  useAnimation: () => ({ start: vi.fn() }),
}));

vi.mock('../../components/Discovery', () => ({
  FeaturedCreators: () => <div data-testid="featured-creators" />,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import Landing from '../Landing';

describe('Landing', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Landing />);
    expect(container.firstChild).toBeTruthy();
  });
});
