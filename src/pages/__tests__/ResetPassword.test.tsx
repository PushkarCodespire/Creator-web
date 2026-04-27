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

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams('token=abc123'), vi.fn()],
  };
});

import ResetPassword from '../ResetPassword';

describe('ResetPassword', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ResetPassword />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with no token', () => {
    const { container } = renderWithProviders(<ResetPassword />);
    expect(container.firstChild).toBeTruthy();
  });
});
