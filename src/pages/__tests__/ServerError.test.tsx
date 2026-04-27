import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    h1: ({ children, ...p }: any) => <h1 {...p}>{children}</h1>,
    p: ({ children, ...p }: any) => <p {...p}>{children}</p>,
    rect: ({ children, ...p }: any) => <rect {...p}>{children}</rect>,
    circle: ({ children, ...p }: any) => <circle {...p}>{children}</circle>,
    text: ({ children, ...p }: any) => <text {...p}>{children}</text>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import ServerError from '../ServerError';

describe('ServerError', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ServerError />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders 500 content', () => {
    const { getByText } = renderWithProviders(<ServerError />);
    expect(getByText('500')).toBeInTheDocument();
  });
});
