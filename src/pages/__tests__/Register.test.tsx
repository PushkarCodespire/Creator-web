import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    form: ({ children, ...p }: any) => <form {...p}>{children}</form>,
    p: ({ children, ...p }: any) => <p {...p}>{children}</p>,
    img: ({ ...p }: any) => <img {...p} />,
    blockquote: ({ children, ...p }: any) => <blockquote {...p}>{children}</blockquote>,
    span: ({ children, ...p }: any) => <span {...p}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import Register from '../Register';

describe('Register', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Register />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders loading state', () => {
    const { container } = renderWithProviders(<Register />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: true, error: null },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with auth error', () => {
    const { container } = renderWithProviders(<Register />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: 'Email already taken' },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });
});
