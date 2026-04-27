vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { data: {} } }),
    put: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
  creatorApi: {
    getProfile: vi.fn().mockResolvedValue({ data: { data: {} } }),
    updateProfile: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
  contentApi: {
    create: vi.fn().mockResolvedValue({ data: { data: {} } }),
    getVoiceCloneStatus: vi.fn().mockResolvedValue({ data: { data: { status: null } } }),
  },
}));

vi.mock('../../../store/slices/authSlice', async () => {
  const actual = await vi.importActual('../../../store/slices/authSlice');
  return {
    ...actual,
    updateUser: vi.fn(() => ({ type: 'auth/updateUser' })),
    setProfileComplete: vi.fn(() => ({ type: 'auth/setProfileComplete' })),
  };
});

vi.mock('../../../pages/creator/CreatorYourAI', () => ({
  SCENARIO_QUESTIONS: [{ id: 'q1', question: 'What is your expertise?' }],
}));

vi.mock('../../styles/Auth.css', () => ({}));
vi.mock('../../../styles/Auth.css', () => ({}));

vi.mock('../VoiceCloneSection/VoiceCloneSection', () => ({
  VoiceCloneSection: () => <div data-testid="voice-clone" />,
}));

vi.mock('../../../components/VoiceCloneSection/VoiceCloneSection', () => ({
  VoiceCloneSection: () => <div data-testid="voice-clone" />,
}));

vi.mock('../OnboardingProcessing', () => ({
  default: ({ status }: any) => <div data-testid="processing" data-status={status} />,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CreatorOnboardingWizard from '../CreatorOnboardingWizard';

describe('CreatorOnboardingWizard', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorOnboardingWizard />, {
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
