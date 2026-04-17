import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import MobileNav from '../MobileNav';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, style, ...props }: any) => (
      <div onClick={onClick} style={style} {...props}>{children}</div>
    ),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('MobileNav', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders guest navigation items when not authenticated', () => {
    renderWithProviders(<MobileNav />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Creators')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeInTheDocument();
  });

  it('renders authenticated navigation items when logged in', () => {
    renderWithProviders(<MobileNav />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: 'u1', name: 'Test', role: 'USER', email: 'test@test.com', isVerified: true, createdAt: '' },
          token: 'test-token',
        } as any,
      },
    });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Chats')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('navigates on tab click', () => {
    renderWithProviders(<MobileNav />, {
      preloadedState: { auth: { isAuthenticated: false, user: null, token: null } as any },
    });
    fireEvent.click(screen.getByText('Home'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
