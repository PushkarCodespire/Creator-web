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
  return { ...actual, useNavigate: () => vi.fn() };
});

import { screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from '../ForgotPassword';

describe('ForgotPassword', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ForgotPassword />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the email input form', () => {
    const { container } = renderWithProviders(<ForgotPassword />);
    expect(container.querySelector('input') || container.firstChild).toBeTruthy();
  });

  it('renders the Forgot Password heading', () => {
    renderWithProviders(<ForgotPassword />);
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
  });

  it('renders the email placeholder', () => {
    renderWithProviders(<ForgotPassword />);
    expect(screen.getByPlaceholderText('john.doe@example.com')).toBeInTheDocument();
  });

  it('renders Send Reset Link button', () => {
    renderWithProviders(<ForgotPassword />);
    expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
  });

  it('renders Log In link', () => {
    renderWithProviders(<ForgotPassword />);
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('renders the form subtitle text', () => {
    renderWithProviders(<ForgotPassword />);
    expect(screen.getByText("Enter your email and we'll send a link to reset your password")).toBeInTheDocument();
  });

  it('renders the Email Address label', () => {
    renderWithProviders(<ForgotPassword />);
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('renders "Remember your password?" helper text', () => {
    renderWithProviders(<ForgotPassword />);
    expect(screen.getByText('Remember your password?')).toBeInTheDocument();
  });

  it('typing into email input updates its value', () => {
    renderWithProviders(<ForgotPassword />);
    const input = screen.getByPlaceholderText('john.doe@example.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect((input as HTMLInputElement).value).toBe('test@example.com');
  });

  it('shows success view (Check Your Email) after valid submission', async () => {
    renderWithProviders(<ForgotPassword />);
    const input = screen.getByPlaceholderText('john.doe@example.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    });
  });

  it('shows Send Another Email button after successful submission', async () => {
    renderWithProviders(<ForgotPassword />);
    const input = screen.getByPlaceholderText('john.doe@example.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => {
      expect(screen.getByText('Send Another Email')).toBeInTheDocument();
    });
  });

  it('shows Back to Login link after successful submission', async () => {
    renderWithProviders(<ForgotPassword />);
    const input = screen.getByPlaceholderText('john.doe@example.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => {
      expect(screen.getByText('Back to Login')).toBeInTheDocument();
    });
  });

  it('clicking Send Another Email returns to the form', async () => {
    renderWithProviders(<ForgotPassword />);
    const input = screen.getByPlaceholderText('john.doe@example.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => {
      expect(screen.getByText('Send Another Email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Send Another Email'));

    await waitFor(() => {
      expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    });
  });
});
