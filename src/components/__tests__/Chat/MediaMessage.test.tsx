import { render, screen } from '@testing-library/react';
import { MediaMessage } from '../../Chat/MediaMessage';
import type { MediaFile } from '../../../types';

vi.mock('../../../utils/fileDownloadUtils', () => ({
  downloadFromUrl: vi.fn(),
}));

describe('MediaMessage', () => {
  it('renders video media with controls', () => {
    const media: MediaFile[] = [
      { type: 'video', url: 'https://example.com/video.mp4', name: 'my-video.mp4' },
    ];

    const { container } = render(<MediaMessage media={media} />);

    const video = container.querySelector('video');
    expect(video).toBeTruthy();
    expect(video!.getAttribute('src')).toBe('https://example.com/video.mp4');
    expect(video!.hasAttribute('controls')).toBe(true);
  });

  it('renders audio media with controls', () => {
    const media: MediaFile[] = [
      { type: 'audio', url: 'https://example.com/audio.mp3', name: 'song.mp3' },
    ];

    const { container } = render(<MediaMessage media={media} />);

    const audio = container.querySelector('audio');
    expect(audio).toBeTruthy();
    expect(audio!.getAttribute('src')).toBe('https://example.com/audio.mp3');
    expect(screen.getByText('song.mp3')).toBeInTheDocument();
  });

  it('renders file attachments with name and size', () => {
    const media: MediaFile[] = [
      { type: 'file', url: 'https://example.com/doc.pdf', name: 'document.pdf', size: 2048 },
    ];

    render(<MediaMessage media={media} />);

    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
  });

  it('renders empty component without crashing when no media', () => {
    const { container } = render(<MediaMessage media={[]} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows Audio message label for unnamed audio files', () => {
    const media: MediaFile[] = [
      { type: 'audio', url: 'https://example.com/audio.mp3' },
    ];

    render(<MediaMessage media={media} />);

    expect(screen.getByText('Audio message')).toBeInTheDocument();
  });
});
