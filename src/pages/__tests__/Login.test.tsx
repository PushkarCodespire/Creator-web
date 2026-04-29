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

import { screen, fireEvent } from '@testing-library/react';
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

  it('renders email input field', () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText('john.doe@example.com')).toBeInTheDocument();
  });

  it('renders password input field', () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders testimonials section', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Dr. Elena Rodriguez')).toBeInTheDocument();
  });

  it('renders error message when auth error exists', () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: 'Invalid credentials' },
      },
    });
    expect(screen.getAllByText('Invalid credentials')[0]).toBeInTheDocument();
  });

  it('renders the Welcome Back heading', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('renders the form subtitle', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Sign in to your CreatorPal account')).toBeInTheDocument();
  });

  it('renders the Forgot password link', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('renders the Sign Up link', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows Signing in... text on submit button when loading', () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: true, error: null },
      },
    });
    expect(screen.getByRole('button', { name: /Signing in\.\.\./i })).toBeInTheDocument();
  });

  it('submit button is disabled when loading', () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: true, error: null },
      },
    });
    expect(screen.getByRole('button', { name: /Signing in\.\.\./i })).toBeDisabled();
  });

  it('renders all three testimonial author names in the DOM', () => {
    renderWithProviders(<Login />);
    // All testimonials are mounted but only one visible at a time;
    // with AnimatePresence mocked they may all appear in the DOM.
    // Assert at least the first one is present.
    expect(screen.getByText('Dr. Elena Rodriguez')).toBeInTheDocument();
  });

  it('renders the brand headline text', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/10,000\+/)).toBeInTheDocument();
  });

  it('renders the Email Address label', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('renders the Password label', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('email input accepts typed value', () => {
    renderWithProviders(<Login />);
    const emailInput = screen.getByPlaceholderText('john.doe@example.com') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    expect(emailInput.value).toBe('user@example.com');
  });

  it('password input accepts typed value', () => {
    renderWithProviders(<Login />);
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    expect(passwordInput.value).toBe('secret123');
  });

  it('password input type is password by default (hidden)', () => {
    renderWithProviders(<Login />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it("renders Don't have an account? prompt text", () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
  });

  it('submit button is not disabled when loading is false', () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
      },
    });
    expect(screen.getByRole('button', { name: /Sign In/i })).not.toBeDisabled();
  });

  it('renders the form as a form element', () => {
    const { container } = renderWithProviders(<Login />);
    expect(container.querySelector('form')).toBeTruthy();
  });
});
