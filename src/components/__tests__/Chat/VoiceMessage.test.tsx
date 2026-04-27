import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceMessage } from '../../Chat/VoiceMessage';

// Mock MediaRecorder
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null as ((event: any) => void) | null,
  onstop: null as (() => void) | null,
};

global.MediaRecorder = vi.fn().mockImplementation(() => ({
  ...mockMediaRecorder,
  start: vi.fn(),
  stop: vi.fn(function (this: any) {
    // Trigger onstop when stop is called
    if (this.onstop) this.onstop();
  }),
  ondataavailable: null,
  onstop: null,
})) as any;

// Mock getUserMedia
const mockGetUserMedia = vi.fn().mockResolvedValue({
  getTracks: () => [{ stop: vi.fn() }],
});

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: { getUserMedia: mockGetUserMedia },
});

describe('VoiceMessage Component', () => {
  const mockOnRecordComplete = vi.fn();
  const mockOnSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders record button when not recording', () => {
    render(
      <VoiceMessage
        onRecordComplete={mockOnRecordComplete}
        onSend={mockOnSend}
      />
    );

    expect(screen.getByText('Record')).toBeInTheDocument();
  });

  it('displays audio player when audioUrl is provided', () => {
    render(
      <VoiceMessage
        audioUrl="https://example.com/audio.webm"
        onRecordComplete={mockOnRecordComplete}
        onSend={mockOnSend}
      />
    );

    // Should show play/pause button instead of record
    expect(screen.queryByText('Record')).not.toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows unsupported message when MediaRecorder is not available', () => {
    const originalMediaRecorder = global.MediaRecorder;
    delete (global as any).MediaRecorder;

    render(
      <VoiceMessage
        onRecordComplete={mockOnRecordComplete}
        onSend={mockOnSend}
      />
    );

    expect(screen.getByText(/not supported/i)).toBeInTheDocument();

    global.MediaRecorder = originalMediaRecorder;
  });

  it('renders disabled state', () => {
    render(
      <VoiceMessage
        onRecordComplete={mockOnRecordComplete}
        disabled={true}
      />
    );

    const recordButton = screen.getByRole('button', { name: /record/i });
    expect(recordButton).toBeDisabled();
  });

  it('shows time display when audioUrl is provided', () => {
    render(
      <VoiceMessage
        audioUrl="https://example.com/audio.webm"
      />
    );

    // Should show a time display like "0:00 / 0:00"
    expect(screen.getByText(/0:00/)).toBeInTheDocument();
  });
});
