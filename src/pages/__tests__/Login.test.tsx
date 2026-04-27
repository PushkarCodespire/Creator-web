import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    form: ({ children, ...p }: any) => <form {...p}>{children}</form>,
    p: ({ children, ...p }: any) => <p {...p}>{children}</p>,
    img: ({ ...p }: any) => <img {...p} />,
    blockquote: ({ children, ...p }: any) => <blockquote {...p}>{children}</blockquote>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import Login from '../Login';

describe('Login', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Login />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders when already authenticated', () => {
    const { container } = renderWithProviders(<Login />, {
      preloadedState: {
        auth: { user: { id: '1', name: 'Test', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' }, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders loading state', () => {
    const { container } = renderWithProviders(<Login />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: true, error: null },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders error state', () => {
    const { container } = renderWithProviders(<Login />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: 'Invalid credentials' },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });
});
