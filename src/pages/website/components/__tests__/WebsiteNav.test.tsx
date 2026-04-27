vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to, ...p }: any) => <a href={to} {...p}>{children}</a>,
  };
});

vi.mock('../../../../store/slices/authSlice', async () => {
  const actual = await vi.importActual('../../../../store/slices/authSlice');
  return { ...actual, fetchCurrentUser: vi.fn(() => ({ type: 'auth/fetchCurrentUser' })) };
});

vi.mock('../../WebsiteHome.module.css', () => ({ default: {} }));

import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { WebsiteNav } from '../WebsiteNav';

describe('WebsiteNav', () => {
  it('renders when not authenticated', () => {
    const { container } = renderWithProviders(<WebsiteNav />, {
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
    expect(container.firstChild).toBeTruthy();
  });

  it('renders when authenticated', () => {
    const { container } = renderWithProviders(<WebsiteNav />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test', email: 'a@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });
});
