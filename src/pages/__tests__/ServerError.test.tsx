import { screen } from '@testing-library/react';
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

  it('renders "Server Error" heading', () => {
    renderWithProviders(<ServerError />);
    expect(screen.getByText('Server Error')).toBeInTheDocument();
  });

  it('renders "Reload Page" button', () => {
    renderWithProviders(<ServerError />);
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('renders "Go Home" button', () => {
    renderWithProviders(<ServerError />);
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('renders "Contact Support" button', () => {
    renderWithProviders(<ServerError />);
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  it('renders error code label', () => {
    renderWithProviders(<ServerError />);
    expect(screen.getByText('Error Code:')).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderWithProviders(<ServerError />);
    expect(screen.getByText(/Something went wrong on our end/)).toBeInTheDocument();
  });

  it('renders the SVG illustration', () => {
    const { container } = renderWithProviders(<ServerError />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders exclamation mark inside the SVG', () => {
    renderWithProviders(<ServerError />);
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('renders Internal Server Error detail in status box', () => {
    renderWithProviders(<ServerError />);
    expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
  });

  it('renders the Time label in the status box', () => {
    renderWithProviders(<ServerError />);
    expect(screen.getByText(/Time:/i)).toBeInTheDocument();
  });

  it('renders a single h1 with 500 text', () => {
    const { container } = renderWithProviders(<ServerError />);
    const h1s = container.querySelectorAll('h1');
    const matching = Array.from(h1s).filter((el) => el.textContent === '500');
    expect(matching.length).toBe(1);
  });

  it('renders full description sentence', () => {
    renderWithProviders(<ServerError />);
    expect(
      screen.getByText(/Our team has been notified and is working to fix the issue/i)
    ).toBeInTheDocument();
  });
});
