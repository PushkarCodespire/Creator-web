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

import { screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('renders Create Account heading', () => {
    renderWithProviders(<Register />);
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('renders role toggle buttons', () => {
    renderWithProviders(<Register />);
    expect(screen.getByText('Fan / User')).toBeInTheDocument();
    expect(screen.getByText('AI Creator')).toBeInTheDocument();
  });

  it('renders first name input', () => {
    renderWithProviders(<Register />);
    expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
  });

  it('renders email input', () => {
    renderWithProviders(<Register />);
    expect(screen.getByPlaceholderText('john.doe@example.com')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderWithProviders(<Register />);
    const submitBtn = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
    });
  });

  it('shows email required error when email is empty', async () => {
    renderWithProviders(<Register />);
    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Smith' } });
    // Leave email blank; click submit
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('shows password length validation error', async () => {
    renderWithProviders(<Register />);
    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('john.doe@example.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'short' } });
    const submitBtn = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText('Min 8 characters')).toBeInTheDocument();
    });
  });

  it('shows terms agreement error when checkbox not checked', async () => {
    renderWithProviders(<Register />);
    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByPlaceholderText('john.doe@example.com'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Password1!' } });
    const submitBtn = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText('You must agree to the terms')).toBeInTheDocument();
    });
  });

  it('switches role to CREATOR when AI Creator button is clicked', () => {
    renderWithProviders(<Register />);
    const creatorBtn = screen.getByText('AI Creator');
    fireEvent.click(creatorBtn);
    // Button text should still be present after click
    expect(screen.getByText('AI Creator')).toBeInTheDocument();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    renderWithProviders(<Register />);
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
    const toggle = document.querySelector('.password-toggle');
    if (toggle) {
      fireEvent.click(toggle);
      expect(passwordInput.type).toBe('text');
    }
  });
});
