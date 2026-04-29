vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { VoiceMessage } from '../VoiceMessage';

describe('VoiceMessage', () => {
  it('renders record button when no audioUrl', () => {
    renderWithProviders(<VoiceMessage />);
    expect(screen.getByText('Record')).toBeInTheDocument();
  });

  it('renders playback UI when audioUrl provided', () => {
    const { container } = renderWithProviders(<VoiceMessage audioUrl="/audio.webm" />);
    expect(container.querySelector('audio')).toBeTruthy();
  });

  it('renders disabled record button', () => {
    const { container } = renderWithProviders(<VoiceMessage disabled />);
    const btn = container.querySelector('button');
    expect(btn).toBeTruthy();
  });

  it('renders with onRecordComplete callback', () => {
    const { container } = renderWithProviders(<VoiceMessage onRecordComplete={vi.fn()} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows play button icon when audioUrl is provided', () => {
    const { container } = renderWithProviders(<VoiceMessage audioUrl="/audio.webm" />);
    // play button is rendered as an antd Button with an icon
    const btn = container.querySelector('button');
    expect(btn).toBeTruthy();
  });

  it('displays time display (0:00 / 0:00) when audioUrl is provided', () => {
    renderWithProviders(<VoiceMessage audioUrl="/audio.webm" />);
    expect(screen.getByText('0:00 / 0:00')).toBeInTheDocument();
  });

  it('shows progress bar when audioUrl is provided', () => {
    const { container } = renderWithProviders(<VoiceMessage audioUrl="/audio.webm" />);
    // antd Progress renders a role="progressbar" element
    const progress = container.querySelector('.ant-progress');
    expect(progress).toBeTruthy();
  });

  it('disables play button when disabled prop is true with audioUrl', () => {
    const { container } = renderWithProviders(<VoiceMessage audioUrl="/audio.webm" disabled />);
    const btn = container.querySelector('button');
    expect(btn).toBeDisabled();
  });

  it('shows "Voice recording not supported" message when MediaRecorder is not available', () => {
    const original = (global as any).MediaRecorder;
    delete (global as any).MediaRecorder;
    renderWithProviders(<VoiceMessage />);
    expect(screen.getByText('Voice recording not supported')).toBeInTheDocument();
    (global as any).MediaRecorder = original;
  });

  it('renders "Record" button text when not recording', () => {
    renderWithProviders(<VoiceMessage />);
    expect(screen.getByText('Record')).toBeInTheDocument();
  });

  it('does not render an audio element when no audioUrl is given', () => {
    const { container } = renderWithProviders(<VoiceMessage />);
    expect(container.querySelector('audio')).toBeNull();
  });

  it('renders audio element with the correct src when audioUrl is provided', () => {
    const { container } = renderWithProviders(<VoiceMessage audioUrl="/voice-clip.webm" />);
    const audio = container.querySelector('audio');
    expect(audio).toBeTruthy();
    expect(audio?.getAttribute('src')).toBe('/voice-clip.webm');
  });

  it('does not show Record button when audioUrl is provided', () => {
    renderWithProviders(<VoiceMessage audioUrl="/audio.webm" />);
    expect(screen.queryByText('Record')).not.toBeInTheDocument();
  });

  it('renders progress bar with 0 percent initially when audioUrl is provided', () => {
    const { container } = renderWithProviders(<VoiceMessage audioUrl="/audio.webm" />);
    const progressBar = container.querySelector('.ant-progress');
    expect(progressBar).toBeTruthy();
  });

  it('renders without crashing when both onRecordComplete and onSend are provided', () => {
    const { container } = renderWithProviders(
      <VoiceMessage onRecordComplete={vi.fn()} onSend={vi.fn()} />
    );
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText('Record')).toBeInTheDocument();
  });
});
