import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    h1: ({ children, ...p }: any) => <h1 {...p}>{children}</h1>,
    p: ({ children, ...p }: any) => <p {...p}>{children}</p>,
    circle: ({ children, ...p }: any) => <circle {...p}>{children}</circle>,
    line: ({ children, ...p }: any) => <line {...p}>{children}</line>,
    text: ({ children, ...p }: any) => <text {...p}>{children}</text>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import NotFound from '../NotFound';

describe('NotFound', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<NotFound />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders 404 content', () => {
    const { getByText } = renderWithProviders(<NotFound />);
    expect(getByText('404')).toBeInTheDocument();
  });
});
