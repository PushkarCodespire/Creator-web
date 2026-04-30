vi.mock('../../../services/api', () => ({
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/creator-dashboard' }),
  };
});

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CreatorSidebar from '../CreatorSidebar';

import { screen, fireEvent } from '@testing-library/react';

const authState = {
  preloadedState: {
    auth: {
      user: { id: '1', name: 'Test Creator', email: 'c@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
      token: 'tok', isAuthenticated: true, isLoading: false, error: null,
    },
  },
};

describe('CreatorSidebar', () => {
  it('renders collapsed', () => {
    const { container } = renderWithProviders(
      <CreatorSidebar expanded={false} onToggle={vi.fn()} />, authState
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders expanded', () => {
    const { container } = renderWithProviders(
      <CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Dashboard nav item when expanded', () => {
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders Your AI nav item when expanded', () => {
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState);
    expect(screen.getByText('Your AI')).toBeInTheDocument();
  });

  it('renders Payouts nav item when expanded', () => {
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState);
    expect(screen.getByText('Payouts')).toBeInTheDocument();
  });

  it('renders Revenue nav item when expanded', () => {
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('renders Bookings nav item when expanded', () => {
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState);
    expect(screen.getByText('Bookings')).toBeInTheDocument();
  });

  it('renders Products nav item when expanded', () => {
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState);
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('renders Settings nav item when expanded', () => {
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders Log out button when expanded', () => {
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState);
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('renders CreatorPal brand name when expanded', () => {
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState);
    expect(screen.getByText('CreatorPal')).toBeInTheDocument();
  });

  it('renders the user name in the bottom avatar area when expanded', () => {
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState);
    expect(screen.getByText('Test Creator')).toBeInTheDocument();
  });

  it('renders "PRO CREATOR" label when expanded', () => {
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState);
    expect(screen.getByText('PRO CREATOR')).toBeInTheDocument();
  });

  it('renders the toggle button with aria-label "Collapse" when expanded', () => {
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={vi.fn()} />, authState);
    expect(screen.getByLabelText('Collapse')).toBeInTheDocument();
  });

  it('renders the toggle button with aria-label "Expand" when collapsed', () => {
    renderWithProviders(<CreatorSidebar expanded={false} onToggle={vi.fn()} />, authState);
    expect(screen.getByLabelText('Expand')).toBeInTheDocument();
  });

  it('calls onToggle when the collapse/expand button is clicked', () => {
    const onToggle = vi.fn();
    renderWithProviders(<CreatorSidebar expanded={true} onToggle={onToggle} />, authState);
    fireEvent.click(screen.getByLabelText('Collapse'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
