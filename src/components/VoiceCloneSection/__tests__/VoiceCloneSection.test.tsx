// Mock must come before imports that trigger module loading
vi.mock('../../../services/api', () => ({
  contentApi: {
    getVoiceClone: vi.fn().mockResolvedValue({ data: { data: { status: null } } }),
    uploadVoiceClone: vi.fn().mockResolvedValue({ data: { data: { status: 'PROCESSING' } } }),
  },
}));

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { VoiceCloneSection } from '../VoiceCloneSection';
import { contentApi } from '../../../services/api';

const authState = {
  auth: {
    user: { id: '1', name: 'Test Creator', email: 'c@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('VoiceCloneSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders full-size version', () => {
    const { container } = renderWithProviders(<VoiceCloneSection />, {
      preloadedState: authState,
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders compact version', () => {
    const { container } = renderWithProviders(
      <VoiceCloneSection compact />,
      { preloadedState: authState }
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('calls getVoiceClone on mount', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: null } },
    });

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await waitFor(() => {
      expect(contentApi.getVoiceClone).toHaveBeenCalled();
    });
  });

  it('renders upload/record UI when status is null (no clone yet)', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: null } },
    });

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await waitFor(() => {
      expect(contentApi.getVoiceClone).toHaveBeenCalled();
    });

    // Upload or record buttons are shown in the no-clone state
    const uploadBtn = document.querySelector('input[type="file"]');
    expect(uploadBtn).toBeTruthy();
  });

  it('renders processing state when status is PROCESSING', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: 'PROCESSING' } },
    });

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await waitFor(() => {
      expect(screen.getByText(/Processing your voice/i)).toBeInTheDocument();
    });
  });

  it('renders active/ready state when status is READY', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: 'READY' } },
    });

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await waitFor(() => {
      expect(screen.getByText(/Voice clone is active/i)).toBeInTheDocument();
    });
  });

  it('calls onStatusChange callback with the loaded status', async () => {
    const onStatusChange = vi.fn();
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: 'READY' } },
    });

    renderWithProviders(
      <VoiceCloneSection onStatusChange={onStatusChange} />,
      { preloadedState: authState }
    );

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith('READY');
    });
  });

  it('shows Record Voice and Upload Audio buttons when no voice clone exists', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: null } },
    });

    const { screen: s, waitFor: wf } = await import('@testing-library/react');

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await wf(() => {
      expect(s.getByRole('button', { name: /Record Voice/i })).toBeInTheDocument();
      expect(s.getByRole('button', { name: /Upload Audio/i })).toBeInTheDocument();
    });
  });

  it('shows Replace button when voice clone is READY', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: 'READY' } },
    });

    const { screen: s, waitFor: wf } = await import('@testing-library/react');

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await wf(() => {
      expect(s.getByRole('button', { name: /Replace/i })).toBeInTheDocument();
    });
  });

  it('switches to record/upload view when Replace is clicked from READY state', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: 'READY' } },
    });

    const { screen: s, waitFor: wf, fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await wf(() => {
      expect(s.getByRole('button', { name: /Replace/i })).toBeInTheDocument();
    });

    fe.click(s.getByRole('button', { name: /Replace/i }));

    await wf(() => {
      expect(s.getByRole('button', { name: /Record Voice/i })).toBeInTheDocument();
    });
  });

  it('shows the recorder panel when Record Voice is clicked', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: null } },
    });

    const { screen: s, waitFor: wf, fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await wf(() => {
      expect(s.getByRole('button', { name: /Record Voice/i })).toBeInTheDocument();
    });

    fe.click(s.getByRole('button', { name: /Record Voice/i }));

    await wf(() => {
      expect(s.getByRole('button', { name: /Start Recording/i })).toBeInTheDocument();
    });
  });

  it('hides recorder panel when Cancel is clicked in recorder view', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: null } },
    });

    const { screen: s, waitFor: wf, fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await wf(() => {
      expect(s.getByRole('button', { name: /Record Voice/i })).toBeInTheDocument();
    });

    fe.click(s.getByRole('button', { name: /Record Voice/i }));

    await wf(() => {
      expect(s.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    fe.click(s.getByRole('button', { name: /Cancel/i }));

    await wf(() => {
      expect(s.getByRole('button', { name: /Record Voice/i })).toBeInTheDocument();
    });
  });

  it('shows uploading state message when a file is being uploaded', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: null } },
    });
    // Upload never resolves so we stay in uploading state
    (contentApi.uploadVoiceClone as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    const { screen: s, waitFor: wf, fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await wf(() => {
      expect(s.getByRole('button', { name: /Upload Audio/i })).toBeInTheDocument();
    });

    // Simulate a file upload via the hidden input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' });
    fe.change(fileInput, { target: { files: [file] } });

    await wf(() => {
      expect(s.getByText(/Uploading your voice/i)).toBeInTheDocument();
    });
  });

  it('renders compact mode without crashing when status is READY', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: 'READY' } },
    });

    const { container } = renderWithProviders(
      <VoiceCloneSection compact />,
      { preloadedState: authState }
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('shows processing state when status is PROCESSING in compact mode', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: 'PROCESSING' } },
    });

    renderWithProviders(<VoiceCloneSection compact />, { preloadedState: authState });

    await waitFor(() => {
      expect(screen.getByText(/Processing your voice/i)).toBeInTheDocument();
    });
  });

  it('file input has correct audio accept attribute', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: null } },
    });

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toContain('audio');
    });
  });

  it('calls onStatusChange with null-ish result when API returns no status', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: null } },
    });
    const onStatusChange = vi.fn();

    renderWithProviders(
      <VoiceCloneSection onStatusChange={onStatusChange} />,
      { preloadedState: authState }
    );

    await waitFor(() => {
      expect(contentApi.getVoiceClone).toHaveBeenCalled();
    });
    // status is null so onStatusChange should NOT be called (guard: if data?.status)
    expect(onStatusChange).not.toHaveBeenCalled();
  });

  it('shows "Record your voice or upload" prompt text when no clone exists', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: null } },
    });

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await waitFor(() => {
      expect(screen.getByText(/Record your voice or upload an audio sample/i)).toBeInTheDocument();
    });
  });

  it('shows minimum speech duration hint when no clone exists', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: null } },
    });

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await waitFor(() => {
      expect(screen.getByText(/Minimum 1 minute/i)).toBeInTheDocument();
    });
  });

  it('Cancel button in Replace flow returns to READY state view', async () => {
    (contentApi.getVoiceClone as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { status: 'READY' } },
    });

    const { screen: s, waitFor: wf, fireEvent: fe } = await import('@testing-library/react');

    renderWithProviders(<VoiceCloneSection />, { preloadedState: authState });

    await wf(() => {
      expect(s.getByRole('button', { name: /Replace/i })).toBeInTheDocument();
    });

    fe.click(s.getByRole('button', { name: /Replace/i }));

    await wf(() => {
      expect(s.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    fe.click(s.getByRole('button', { name: /Cancel/i }));

    await wf(() => {
      expect(s.getByRole('button', { name: /Replace/i })).toBeInTheDocument();
    });
  });
});
