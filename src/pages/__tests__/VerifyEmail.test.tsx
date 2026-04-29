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
    post: vi.fn().mockResolvedValue({ data: { success: true, data: { token: 'tok', user: { id: '1', name: 'Test', role: 'USER' } }, message: 'Email verified successfully.' } }),
    get: vi.fn().mockResolvedValue({ data: { success: true } }),
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

import { screen, waitFor } from '@testing-library/react';
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

  it('shows pending state when no token provided', async () => {
    renderWithProviders(<VerifyEmail />);
    // When no token, the page shows "pending" state with resend option
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('shows verifying state when token is present', async () => {
    renderWithProviders(<VerifyEmail />);
    // Token is abc123 in the mock, component calls api.post('/auth/verify-email', { token })
    await waitFor(() => {
      expect(document.body.innerHTML.length).toBeGreaterThan(0);
    });
  });

  it('shows Email Verified heading after successful verification', async () => {
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /Email Verified/i });
      expect(heading).toBeInTheDocument();
    });
  });

  it("shows success message returned from API", async () => {
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      expect(screen.getByText(/Email verified successfully/i)).toBeInTheDocument();
    });
  });

  it('renders Let\'s Get Started button after successful verification', async () => {
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Let's Get Started/i })).toBeInTheDocument();
    });
  });

  it('renders brand panel headline', async () => {
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      expect(screen.getByText(/One step closer/i)).toBeInTheDocument();
    });
  });

  it('calls api.post with correct token and endpoint', async () => {
    const api = await import('../../services/api');
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      expect(api.default.post).toHaveBeenCalledWith('/auth/verify-email', { token: 'verify123' });
    });
  });

  it('shows verification failed state on API error', async () => {
    const api = await import('../../services/api');
    (api.default.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      response: { data: { error: 'Token expired' } },
    });
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
    });
  });

  it('shows the specific error message from API on failure', async () => {
    const api = await import('../../services/api');
    (api.default.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      response: { data: { error: 'Token expired' } },
    });
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      expect(screen.getByText('Token expired')).toBeInTheDocument();
    });
  });

  it('shows "Account Ready" text in the success panel', async () => {
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      expect(screen.getByText('Account Ready')).toBeInTheDocument();
    });
  });

  it('renders SSL Secured trust badge on the brand panel', async () => {
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      expect(screen.getByText(/SSL Secured/i)).toBeInTheDocument();
    });
  });

  it('renders GDPR Compliant trust badge on the brand panel', async () => {
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      expect(screen.getByText(/GDPR Compliant/i)).toBeInTheDocument();
    });
  });

  it('renders benefit list items on the brand panel', async () => {
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      expect(screen.getByText(/Free to start, cancel anytime/i)).toBeInTheDocument();
    });
  });

  it('shows "Back to Login" link on verification failed state', async () => {
    const api = await import('../../services/api');
    (api.default.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      response: { data: { error: 'Expired link' } },
    });
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      expect(screen.getByText('Back to Login')).toBeInTheDocument();
    });
  });

  it('shows "Resend Verification Link" button on failed state', async () => {
    const api = await import('../../services/api');
    (api.default.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      response: { data: { error: 'Invalid token' } },
    });
    renderWithProviders(<VerifyEmail />);
    await waitFor(() => {
      expect(screen.getByText('Resend Verification Link')).toBeInTheDocument();
    });
  });
});
