import { render, screen } from '@testing-library/react';
import { MediaMessage } from '../../Chat/MediaMessage';
import type { MediaFile } from '../../../types';

vi.mock('../../../utils/fileDownloadUtils', () => ({
  downloadFromUrl: vi.fn(),
}));

describe('MediaMessage', () => {
  it('renders image media', () => {
    const media: MediaFile[] = [
      { type: 'image', url: 'https://example.com/photo.jpg', name: 'photo.jpg' },
    ];

    render(<MediaMessage media={media} />);

    const img = screen.getByAltText('photo.jpg');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('renders multiple images in a grid', () => {
    const media: MediaFile[] = [
      { type: 'image', url: 'https://example.com/1.jpg', name: 'img-1' },
      { type: 'image', url: 'https://example.com/2.jpg', name: 'img-2' },
      { type: 'image', url: 'https://example.com/3.jpg', name: 'img-3' },
    ];

    render(<MediaMessage media={media} />);

    expect(screen.getByAltText('img-1')).toBeInTheDocument();
    expect(screen.getByAltText('img-2')).toBeInTheDocument();
    expect(screen.getByAltText('img-3')).toBeInTheDocument();
  });

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

  it('renders mixed media types', () => {
    const media: MediaFile[] = [
      { type: 'image', url: 'https://example.com/photo.jpg', name: 'photo' },
      { type: 'video', url: 'https://example.com/clip.mp4', name: 'clip.mp4' },
      { type: 'file', url: 'https://example.com/doc.pdf', name: 'doc.pdf', size: 1024 },
    ];

    const { container } = render(<MediaMessage media={media} />);

    expect(screen.getByAltText('photo')).toBeInTheDocument();
    expect(container.querySelector('video')).toBeTruthy();
    expect(screen.getByText('doc.pdf')).toBeInTheDocument();
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
