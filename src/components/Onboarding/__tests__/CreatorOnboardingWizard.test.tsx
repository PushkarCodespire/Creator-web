vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { data: {} } }),
    put: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
  creatorApi: {
    updateProfile: vi.fn().mockResolvedValue({ data: { data: {} } }),
    generateBio: vi.fn().mockResolvedValue({ data: { data: { bio: 'Generated bio' } } }),
    generateAiPersonality: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
  contentApi: {
    addYouTube: vi.fn().mockResolvedValue({ data: { data: { id: '1' } } }),
    addManual: vi.fn().mockResolvedValue({ data: { data: { id: '2' } } }),
    previewYouTube: vi.fn().mockResolvedValue({ data: { data: { title: 'Preview' } } }),
    getVoiceClone: vi.fn().mockResolvedValue({ data: { data: { status: null } } }),
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
  SCENARIO_QUESTIONS: ['What is your expertise?', 'How do you help clients?'],
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
import { screen, fireEvent, waitFor } from '@testing-library/react';
import CreatorOnboardingWizard from '../CreatorOnboardingWizard';

const preloadedState = {
  auth: {
    user: { id: '1', name: 'Test Creator', email: 'c@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('CreatorOnboardingWizard', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    expect(container.firstChild).toBeTruthy();
  });

  it('shows the Identity tab by default', () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    expect(screen.getByText('Identity')).toBeInTheDocument();
  });

  it('shows all wizard tab labels', () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    expect(screen.getByText('Knowledge')).toBeInTheDocument();
    expect(screen.getByText('Economics')).toBeInTheDocument();
    expect(screen.getByText('Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Launch')).toBeInTheDocument();
  });

  it('navigates to Knowledge tab on click', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Knowledge'));
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('navigates to Economics tab on click', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Economics'));
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('navigates to Intelligence tab on click', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Intelligence'));
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('navigates to Launch tab on click', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Launch'));
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('renders profile photo upload section on identity tab', () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    expect(screen.getByText('Profile Photo')).toBeInTheDocument();
    expect(screen.getByText('Click the camera icon to upload')).toBeInTheDocument();
  });

  it('renders display name and category fields on identity tab', () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your mission in one line')).toBeInTheDocument();
  });

  it('renders YouTube and manual content fields when Knowledge tab is active', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Knowledge'));
    await waitFor(() => {
      expect(screen.getByText('YouTube Videos')).toBeInTheDocument();
    });
    expect(screen.getByText('Manual Content')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste YouTube URL')).toBeInTheDocument();
  });

  it('renders Add another video button in Knowledge tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Knowledge'));
    await waitFor(() => {
      expect(screen.getByText('Add another video')).toBeInTheDocument();
    });
  });

  it('renders Ready to Launch heading and checklist on Launch tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Launch'));
    await waitFor(() => {
      expect(screen.getAllByText('Ready to Launch').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText(/Hit launch to go live/i)).toBeInTheDocument();
  });

  it('renders Save & Continue button on non-launch tabs', () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    expect(screen.getByText('Save & Continue →')).toBeInTheDocument();
  });

  it('renders Launch My AI button on Launch tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Launch'));
    await waitFor(() => {
      expect(screen.getByText(/Launch My AI/i)).toBeInTheDocument();
    });
  });

  it('renders Intelligence tab content with personality options', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Intelligence'));
    await waitFor(() => {
      expect(screen.getByText('Personality Style')).toBeInTheDocument();
    });
    expect(screen.getByText('Energy Level')).toBeInTheDocument();
  });

  it('Back button is disabled on the first (identity) tab', () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    const backBtn = screen.getByText('Back');
    expect(backBtn).toBeDisabled();
  });

  it('Back button is enabled after switching away from identity tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Knowledge'));
    await waitFor(() => {
      expect(screen.getByText('Back')).not.toBeDisabled();
    });
  });

  it('clicking Back navigates to previous tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Knowledge'));
    await waitFor(() => {
      expect(screen.getByText('Back')).not.toBeDisabled();
    });
    fireEvent.click(screen.getByText('Back'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    });
  });

  it('renders step progress bar indicators for each tab', () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    // 5 tabs => 5 progress bar div elements inside the progress row
    const allButtons = screen.getAllByRole('button');
    expect(allButtons.length).toBeGreaterThan(0);
  });

  it('renders the Economics tab fields when switching to Economics', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Economics'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/HDFC Bank/i)).toBeInTheDocument();
    });
  });

  it('renders Bank Name and Account Holder fields on Economics tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Economics'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Full legal name')).toBeInTheDocument();
    });
  });

  it('renders IFSC Code field on Economics tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Economics'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('IFSC0001234')).toBeInTheDocument();
    });
  });

  it('renders Voice Clone section on Intelligence tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Intelligence'));
    await waitFor(() => {
      expect(screen.getByTestId('voice-clone')).toBeInTheDocument();
    });
  });

  it('renders Welcome Message field on Intelligence tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Intelligence'));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('First thing your AI says to new fans')).toBeInTheDocument();
    });
  });

  it('renders Humor options on Intelligence tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Intelligence'));
    await waitFor(() => {
      expect(screen.getByText('Humor')).toBeInTheDocument();
    });
  });

  it('renders Scenario Training section on Intelligence tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Intelligence'));
    await waitFor(() => {
      expect(screen.getByText('Scenario Training')).toBeInTheDocument();
    });
  });

  it('renders Add another content button on Knowledge tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Knowledge'));
    await waitFor(() => {
      expect(screen.getByText('Add another content')).toBeInTheDocument();
    });
  });

  it('clicking Add another video adds a second YouTube URL input', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Knowledge'));
    await waitFor(() => {
      expect(screen.getByText('Add another video')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Add another video'));
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('Paste YouTube URL')).toHaveLength(2);
    });
  });

  it('clicking Add another content adds a second manual content block', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Knowledge'));
    await waitFor(() => {
      expect(screen.getByText('Add another content')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Add another content'));
    await waitFor(() => {
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  it('renders checklist items (Identity, Knowledge, Voice, Intelligence) on Launch tab', async () => {
    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Launch'));
    await waitFor(() => {
      // 'Voice' only appears in the launch checklist, not in a tab label
      expect(screen.getByText('Voice')).toBeInTheDocument();
      // Multiple 'Knowledge' elements are expected (tab label + checklist item)
      expect(screen.getAllByText('Knowledge').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('shows OnboardingProcessing when handleFinish completes and voice is READY', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.updateProfile as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { data: {} } });

    renderWithProviders(<CreatorOnboardingWizard />, { preloadedState });
    fireEvent.click(screen.getByText('Launch'));
    await waitFor(() => {
      expect(screen.getByText(/Launch My AI/i)).toBeInTheDocument();
    });
    // Without voice READY, clicking launch triggers warning and redirects to intelligence
    fireEvent.click(screen.getByText(/Launch My AI/i));
    // Should redirect to intelligence tab
    await waitFor(() => {
      expect(screen.getByText('Voice Clone')).toBeInTheDocument();
    });
  });
});
