// ===========================================
// VOICE MESSAGE COMPONENT TESTS
// ===========================================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceMessage } from '../../Chat/VoiceMessage';

// Mock MediaRecorder
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  ondataavailable: null,
  onstop: null,
}));

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: () => [{ stop: jest.fn() }],
  }),
} as any;

describe('VoiceMessage Component', () => {
  const mockOnRecordComplete = jest.fn();
  const mockOnSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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

  it('starts recording when record button is clicked', async () => {
    render(
      <VoiceMessage
        onRecordComplete={mockOnRecordComplete}
        onSend={mockOnSend}
      />
    );

    const recordButton = screen.getByText('Record');
    fireEvent.click(recordButton);

    await waitFor(() => {
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });
  });

  it('stops recording when stop button is clicked', async () => {
    render(
      <VoiceMessage
        onRecordComplete={mockOnRecordComplete}
        onSend={mockOnSend}
      />
    );

    const recordButton = screen.getByText('Record');
    fireEvent.click(recordButton);

    await waitFor(() => {
      const stopButton = screen.getByText('Stop');
      fireEvent.click(stopButton);
    });

    await waitFor(() => {
      expect(mockOnRecordComplete).toHaveBeenCalled();
    });
  });

  it('displays audio player when audioUrl is provided', () => {
    render(
      <VoiceMessage
        audioUrl="https://example.com/audio.webm"
        onRecordComplete={mockOnRecordComplete}
        onSend={mockOnSend}
      />
    );

    expect(screen.getByRole('button', { name: /play|pause/i })).toBeInTheDocument();
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
});



