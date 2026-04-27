vi.mock('../../WebsiteCreateAI.module.css', () => ({
  default: {},
}));

import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { CustomizeForm } from '../CustomizeForm';

describe('CustomizeForm', () => {
  it('renders without crashing (unauthenticated)', () => {
    const { container } = renderWithProviders(<CustomizeForm />, {
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

  it('renders for authenticated user', () => {
    const { container } = renderWithProviders(<CustomizeForm onAction={vi.fn()} />, {
      preloadedState: {
        auth: {
          user: { id: '1', name: 'Test Creator', email: 'c@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
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
