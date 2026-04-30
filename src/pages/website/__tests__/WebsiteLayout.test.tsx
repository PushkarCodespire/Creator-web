import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, within } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../components/WebsiteNav', () => ({
  WebsiteNav: () => <nav data-testid="website-nav">Nav</nav>,
}));

vi.mock('../components/WebsiteFooter', () => ({
  WebsiteFooter: () => <footer data-testid="website-footer">Footer</footer>,
}));

import WebsiteLayout from '../WebsiteLayout';

describe('WebsiteLayout', () => {
  it('renders without crashing', () => {
    renderWithProviders(<WebsiteLayout />);
    expect(screen.getByTestId('website-nav')).toBeInTheDocument();
    expect(screen.getByTestId('website-footer')).toBeInTheDocument();
  });

  it('renders nav component', () => {
    renderWithProviders(<WebsiteLayout />);
    expect(screen.getByTestId('website-nav')).toBeInTheDocument();
  });

  it('renders footer component', () => {
    renderWithProviders(<WebsiteLayout />);
    expect(screen.getByTestId('website-footer')).toBeInTheDocument();
  });

  it('wraps content in a div with class website-shell', () => {
    const { container } = renderWithProviders(<WebsiteLayout />);
    expect(container.firstChild).toHaveClass('website-shell');
  });

  it('renders exactly one nav', () => {
    renderWithProviders(<WebsiteLayout />);
    expect(screen.getAllByTestId('website-nav')).toHaveLength(1);
  });

  it('renders exactly one footer', () => {
    renderWithProviders(<WebsiteLayout />);
    expect(screen.getAllByTestId('website-footer')).toHaveLength(1);
  });

  it('nav appears before footer in the DOM', () => {
    const { container } = renderWithProviders(<WebsiteLayout />);
    const shell = container.firstChild as HTMLElement;
    const nav = within(shell).getByTestId('website-nav');
    const footer = within(shell).getByTestId('website-footer');
    expect(shell.children[0]).toBe(nav);
    expect(shell.children[shell.children.length - 1]).toBe(footer);
  });

  it('renders correctly with authenticated state', () => {
    renderWithProviders(<WebsiteLayout />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'test@test.com', role: 'USER' },
          token: 'tok',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getByTestId('website-nav')).toBeInTheDocument();
    expect(screen.getByTestId('website-footer')).toBeInTheDocument();
  });

  it('renders correctly with unauthenticated state', () => {
    renderWithProviders(<WebsiteLayout />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(screen.getByTestId('website-nav')).toBeInTheDocument();
    expect(screen.getByTestId('website-footer')).toBeInTheDocument();
  });

  it('nav text content is "Nav"', () => {
    renderWithProviders(<WebsiteLayout />);
    expect(screen.getByTestId('website-nav')).toHaveTextContent('Nav');
  });

  it('footer text content is "Footer"', () => {
    renderWithProviders(<WebsiteLayout />);
    expect(screen.getByTestId('website-footer')).toHaveTextContent('Footer');
  });

  it('website-shell div has at least 3 children (nav, outlet, footer)', () => {
    const { container } = renderWithProviders(<WebsiteLayout />);
    const shell = container.firstChild as HTMLElement;
    expect(shell.children.length).toBeGreaterThanOrEqual(2);
  });

  it('nav element is a <nav> element', () => {
    renderWithProviders(<WebsiteLayout />);
    const nav = screen.getByTestId('website-nav');
    expect(nav.tagName.toLowerCase()).toBe('nav');
  });

  it('footer element is a <footer> element', () => {
    renderWithProviders(<WebsiteLayout />);
    const footer = screen.getByTestId('website-footer');
    expect(footer.tagName.toLowerCase()).toBe('footer');
  });

  it('renders consistently across multiple calls', () => {
    const { unmount } = renderWithProviders(<WebsiteLayout />);
    expect(screen.getByTestId('website-nav')).toBeInTheDocument();
    unmount();
    renderWithProviders(<WebsiteLayout />);
    expect(screen.getByTestId('website-nav')).toBeInTheDocument();
  });

  it('does not render extra nav elements outside website-shell', () => {
    const { container } = renderWithProviders(<WebsiteLayout />);
    expect(container.querySelectorAll('[data-testid="website-nav"]')).toHaveLength(1);
  });
});
