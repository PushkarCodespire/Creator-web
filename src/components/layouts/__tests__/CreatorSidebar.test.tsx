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

describe('CreatorSidebar', () => {
  it('renders collapsed', () => {
    const { container } = renderWithProviders(
      <CreatorSidebar expanded={false} onToggle={vi.fn()} />,
      {
        preloadedState: {
          auth: {
            user: { id: '1', name: 'Test Creator', email: 'c@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
            token: 'tok',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          },
        },
      }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders expanded', () => {
    const { container } = renderWithProviders(
      <CreatorSidebar expanded={true} onToggle={vi.fn()} />,
      {
        preloadedState: {
          auth: {
            user: { id: '1', name: 'Test Creator', email: 'c@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
            token: 'tok',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          },
        },
      }
    );
    expect(container.firstChild).toBeTruthy();
  });
});
