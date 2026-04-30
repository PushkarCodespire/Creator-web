vi.mock('../CreatorSidebar', () => ({
  default: ({ expanded, onToggle }: any) => (
    <div data-testid="creator-sidebar" data-expanded={String(expanded)} onClick={onToggle}>
      Sidebar
    </div>
  ),
}));

vi.mock('../CreatorHeader', () => ({
  default: () => <div data-testid="creator-header">Header</div>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, Outlet: () => <div data-testid="outlet">Content</div> };
});

vi.mock('../DashboardFilterContext', () => ({
  DashboardFilterProvider: ({ children }: any) => (
    <div data-testid="filter-provider">{children}</div>
  ),
}));

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CreatorDashboardLayout from '../CreatorDashboardLayout';

describe('CreatorDashboardLayout', () => {
  it('renders without crashing', () => {
    renderWithProviders(<CreatorDashboardLayout />);

    expect(screen.getByTestId('filter-provider')).toBeDefined();
  });

  it('renders the sidebar', () => {
    renderWithProviders(<CreatorDashboardLayout />);

    expect(screen.getByTestId('creator-sidebar')).toBeDefined();
  });

  it('renders the header', () => {
    renderWithProviders(<CreatorDashboardLayout />);

    expect(screen.getByTestId('creator-header')).toBeDefined();
  });

  it('renders the outlet', () => {
    renderWithProviders(<CreatorDashboardLayout />);

    expect(screen.getByTestId('outlet')).toBeDefined();
  });

  it('renders the filter provider', () => {
    renderWithProviders(<CreatorDashboardLayout />);

    expect(screen.getByTestId('filter-provider')).toBeDefined();
  });

  it('sidebar starts collapsed (expanded=false)', () => {
    renderWithProviders(<CreatorDashboardLayout />);

    expect(screen.getByTestId('creator-sidebar').dataset.expanded).toBe('false');
  });

  it('clicking the sidebar toggles expanded to true', () => {
    renderWithProviders(<CreatorDashboardLayout />);

    const sidebar = screen.getByTestId('creator-sidebar');
    expect(sidebar.dataset.expanded).toBe('false');

    fireEvent.click(sidebar);

    expect(screen.getByTestId('creator-sidebar').dataset.expanded).toBe('true');
  });

  it('clicking the sidebar twice toggles back to collapsed', () => {
    renderWithProviders(<CreatorDashboardLayout />);

    const sidebar = screen.getByTestId('creator-sidebar');
    fireEvent.click(sidebar);
    fireEvent.click(screen.getByTestId('creator-sidebar'));

    expect(screen.getByTestId('creator-sidebar').dataset.expanded).toBe('false');
  });

  it('outer container has display flex style', () => {
    const { container } = renderWithProviders(<CreatorDashboardLayout />);

    // The flex div is the direct child of the filter-provider wrapper
    const filterProvider = screen.getByTestId('filter-provider');
    const flexDiv = filterProvider.firstElementChild as HTMLElement;

    expect(flexDiv.style.display).toBe('flex');
  });

  it('outer container has minHeight 100vh style', () => {
    renderWithProviders(<CreatorDashboardLayout />);

    const filterProvider = screen.getByTestId('filter-provider');
    const flexDiv = filterProvider.firstElementChild as HTMLElement;

    expect(flexDiv.style.minHeight).toBe('100vh');
  });

  it('renders sidebar text content via mock', () => {
    renderWithProviders(<CreatorDashboardLayout />);
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('renders header text content via mock', () => {
    renderWithProviders(<CreatorDashboardLayout />);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('renders outlet content via mock', () => {
    renderWithProviders(<CreatorDashboardLayout />);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('sidebar expanded stays true after a single click', () => {
    renderWithProviders(<CreatorDashboardLayout />);

    const sidebar = screen.getByTestId('creator-sidebar');
    fireEvent.click(sidebar);

    expect(screen.getByTestId('creator-sidebar').dataset.expanded).toBe('true');
  });
});
