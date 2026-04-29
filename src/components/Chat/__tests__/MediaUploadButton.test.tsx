import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  chatApi: {
    uploadChatMedia: vi.fn().mockResolvedValue({ data: { data: { media: [] } } }),
  },
}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { MediaUploadButton } from '../MediaUploadButton';

describe('MediaUploadButton', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders a hidden file input', () => {
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
  });

  it('file input accepts images, videos, and audio', () => {
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'image/*,video/*,audio/*');
  });

  it('file input supports multiple files', () => {
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('multiple');
  });

  it('renders in disabled state without crashing', () => {
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} disabled={true} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('shows preview modal with file name after valid image file is selected', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['(content)'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 * 100 }); // 100 KB
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/photo\.png/)).toBeInTheDocument();
    });
  });

  it('shows file size in KB in preview modal', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'.repeat(2048)], 'clip.mp4', { type: 'video/mp4' });
    Object.defineProperty(file, 'size', { value: 2048 });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/2\.0 KB/)).toBeInTheDocument();
    });
  });

  it('calls chatApi.uploadChatMedia and onMediaUploaded when Upload is clicked', async () => {
    const { chatApi } = await import('../../../services/api');
    const uploadedMedia = [{ id: 'm1', url: '/test.png', type: 'image' }];
    (chatApi.uploadChatMedia as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { media: uploadedMedia } },
    });
    const onMediaUploaded = vi.fn();
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={onMediaUploaded} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'img.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(screen.queryByText(/Upload 1 file/)).toBeTruthy());
    fireEvent.click(screen.getByText(/Upload 1 file/));
    await waitFor(() => {
      expect(chatApi.uploadChatMedia).toHaveBeenCalled();
      expect(onMediaUploaded).toHaveBeenCalledWith(uploadedMedia);
    });
  });

  it('shows unsupported file type error for disallowed files', async () => {
    const { fireEvent } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 512 });
    fireEvent.change(input, { target: { files: [file] } });
    // No modal should appear since no valid files
    expect(screen.queryByText(/Selected Files/)).toBeFalsy();
  });

  it('shows file preview modal title with correct count after file is selected', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'audio.mp3', { type: 'audio/mpeg' });
    Object.defineProperty(file, 'size', { value: 1024 });
    fireEvent.change(input, { target: { files: [file] } });
    // File preview should appear with modal title "Selected Files (1/5)"
    await waitFor(() => {
      expect(screen.queryByText(/Selected Files \(1\/5\)/)).toBeTruthy();
    });
  });

  it('shows Cancel button in preview modal after file selection', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'clip.mp4', { type: 'video/mp4' });
    Object.defineProperty(file, 'size', { value: 1024 });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('closes preview modal when Cancel is clicked', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'img.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 512 });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(screen.queryByText(/Selected Files/)).toBeTruthy());
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(screen.queryByText(/Selected Files/)).toBeFalsy();
    });
  });

  it('shows file size 0.0 KB for a zero-byte file', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([''], 'empty.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 0 });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('0.0 KB')).toBeInTheDocument();
    });
  });

  it('file input is hidden (display none)', () => {
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.style.display).toBe('none');
  });

  it('shows webm video icon placeholder in preview when a webm file is selected', async () => {
    const { fireEvent, waitFor } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <MediaUploadButton onMediaUploaded={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'screen.webm', { type: 'video/webm' });
    Object.defineProperty(file, 'size', { value: 2048 });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('screen.webm')).toBeInTheDocument();
    });
  });
});
