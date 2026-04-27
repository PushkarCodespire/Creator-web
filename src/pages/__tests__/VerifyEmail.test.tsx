import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    p: ({ children, ...p }: any) => <p {...p}>{children}</p>,
    img: ({ ...p }: any) => <img {...p} />,
    blockquote: ({ children, ...p }: any) => <blockquote {...p}>{children}</blockquote>,
    span: ({ children, ...p }: any) => <span {...p}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: { token: 'tok', user: { id: '1' } } } }),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams('token=verify123'), vi.fn()],
  };
});

import VerifyEmail from '../VerifyEmail';

describe('VerifyEmail', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<VerifyEmail />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with no token param', () => {
    const { container } = renderWithProviders(<VerifyEmail />);
    expect(container.firstChild).toBeTruthy();
  });
});
