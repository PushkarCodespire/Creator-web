import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import Pricing from '../Pricing';

describe('Pricing', () => {
  it('renders without crashing when not authenticated', () => {
    const { container } = renderWithProviders(<Pricing />, {
      preloadedState: {
        auth: { user: null, token: null, isAuthenticated: false, isLoading: false, error: null },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders without crashing when authenticated', () => {
    const { container } = renderWithProviders(<Pricing />, {
      preloadedState: {
        auth: { user: { id: '1', name: 'Test', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' }, token: 'tok', isAuthenticated: true, isLoading: false, error: null },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders pricing plans', () => {
    const { getByText } = renderWithProviders(<Pricing />);
    expect(getByText('Free')).toBeInTheDocument();
  });
});
