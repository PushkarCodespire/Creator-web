vi.mock('../../../services/api', () => ({
  contentApi: {
    getVoiceCloneStatus: vi.fn().mockResolvedValue({ data: { data: { status: null } } }),
    uploadVoiceClone: vi.fn().mockResolvedValue({ data: { data: { status: 'PROCESSING' } } }),
  },
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { VoiceCloneSection } from '../VoiceCloneSection';

describe('VoiceCloneSection', () => {
  it('renders full-size version', () => {
    const { container } = renderWithProviders(<VoiceCloneSection />, {
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

  it('renders compact version', () => {
    const { container } = renderWithProviders(
      <VoiceCloneSection compact />,
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
