import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    h1: ({ children, ...p }: any) => <h1 {...p}>{children}</h1>,
    p: ({ children, ...p }: any) => <p {...p}>{children}</p>,
    circle: ({ children, ...p }: any) => <circle {...p}>{children}</circle>,
    line: ({ children, ...p }: any) => <line {...p}>{children}</line>,
    text: ({ children, ...p }: any) => <text {...p}>{children}</text>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import NotFound from '../NotFound';

describe('NotFound', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<NotFound />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders 404 content', () => {
    const { getByText } = renderWithProviders(<NotFound />);
    expect(getByText('404')).toBeInTheDocument();
  });

  it('renders "Page Not Found" heading', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders "Go Home" button', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('renders "Explore Creators" button', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('Explore Creators')).toBeInTheDocument();
  });

  it('renders "Go Back" button', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText(/page you're looking for doesn't exist/)).toBeInTheDocument();
  });

  it('renders exactly three action buttons', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('Go Home')).toBeInTheDocument();
    expect(screen.getByText('Explore Creators')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('renders the SVG illustration', () => {
    const { container } = renderWithProviders(<NotFound />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders the question mark inside the SVG', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders "moved or deleted" detail in description', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText(/moved or deleted/i)).toBeInTheDocument();
  });

  it('renders full description sentence', () => {
    renderWithProviders(<NotFound />);
    expect(
      screen.getByText(/Oops! The page you're looking for doesn't exist\. It might have been moved or deleted\./i)
    ).toBeInTheDocument();
  });

  it('renders a single h1 with 404 text', () => {
    const { container } = renderWithProviders(<NotFound />);
    const h1s = container.querySelectorAll('h1');
    const matching = Array.from(h1s).filter((el) => el.textContent === '404');
    expect(matching.length).toBe(1);
  });
});
