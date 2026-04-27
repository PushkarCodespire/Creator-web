import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ReferralProgram } from '../ReferralProgram';

describe('ReferralProgram', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ReferralProgram />, {
      preloadedState: {
        auth: {
          user: { id: 'user-abc-123', name: 'Test User', email: 'u@b.com', role: 'USER' as const, isVerified: true, createdAt: '' },
          token: 'tok',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      },
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with no user', () => {
    const { container } = renderWithProviders(<ReferralProgram />, {
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
});
