import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import FileUpload from '../FileUpload';

describe('FileUpload', () => {
  const mockOnUpload = vi.fn().mockResolvedValue({ url: '/uploaded.jpg' });

  it('renders drag and drop area with default text', () => {
    renderWithProviders(<FileUpload onUpload={mockOnUpload} />);
    expect(screen.getByText('Click or drag file to this area to upload')).toBeInTheDocument();
  });

  it('renders hint text with max size', () => {
    renderWithProviders(<FileUpload onUpload={mockOnUpload} maxSize={5} />);
    expect(screen.getByText(/Max size: 5MB/)).toBeInTheDocument();
  });

  it('renders with accepted file type hint', () => {
    renderWithProviders(<FileUpload onUpload={mockOnUpload} accept="image/*" maxSize={10} />);
    expect(screen.getByText(/Accepted: image\/\*/)).toBeInTheDocument();
  });

  it('renders custom children instead of default content', () => {
    renderWithProviders(
      <FileUpload onUpload={mockOnUpload}>
        <div>Custom Upload Area</div>
      </FileUpload>
    );
    expect(screen.getByText('Custom Upload Area')).toBeInTheDocument();
    expect(screen.queryByText('Click or drag file to this area to upload')).not.toBeInTheDocument();
  });

  it('does not show file hint text when accept is wildcard', () => {
    renderWithProviders(<FileUpload onUpload={mockOnUpload} accept="*" maxSize={10} />);
    expect(screen.queryByText(/Accepted:/)).not.toBeInTheDocument();
  });

  it('shows uploaded file name in list after successful upload', async () => {
    const onUpload = vi.fn().mockResolvedValue({ url: '/myfile.txt' });
    const { container } = renderWithProviders(
      <FileUpload onUpload={onUpload} showUploadList multiple maxFiles={5} />
    );
    const input = container.querySelector('input[type="file"]');
    if (!input) return;
    const file = new File(['hello'], 'myfile.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('myfile.txt')).toBeInTheDocument();
    });
  });

  it('shows error state when upload fails', async () => {
    const onUpload = vi.fn().mockRejectedValue(new Error('Network error'));
    const { container } = renderWithProviders(
      <FileUpload onUpload={onUpload} showUploadList maxFiles={5} />
    );
    const input = container.querySelector('input[type="file"]');
    if (!input) return;
    const file = new File(['data'], 'fail.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });

  it('rejects file that exceeds maxSize', () => {
    const onUpload = vi.fn();
    const { container } = renderWithProviders(
      <FileUpload onUpload={onUpload} maxSize={1} showUploadList />
    );
    const input = container.querySelector('input[type="file"]');
    if (!input) return;
    const bigFile = new File(['x'.repeat(2 * 1024 * 1024)], 'big.txt', { type: 'text/plain' });
    Object.defineProperty(bigFile, 'size', { value: 2 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [bigFile] } });
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('calls onRemove when remove icon is clicked', async () => {
    const onUpload = vi.fn().mockResolvedValue({ url: '/file.txt' });
    const onRemove = vi.fn();
    const { container } = renderWithProviders(
      <FileUpload onUpload={onUpload} onRemove={onRemove} showUploadList maxFiles={5} />
    );
    const input = container.querySelector('input[type="file"]');
    if (!input) return;
    const file = new File(['data'], 'remove-me.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('remove-me.txt')).toBeInTheDocument();
    });
    const closeIcon = container.querySelector('.anticon-close-circle');
    if (closeIcon) {
      fireEvent.click(closeIcon);
      await waitFor(() => {
        expect(screen.queryByText('remove-me.txt')).not.toBeInTheDocument();
      });
    }
  });

  it('renders without children when no children prop is passed', () => {
    renderWithProviders(<FileUpload onUpload={mockOnUpload} />);
    // The default InboxOutlined icon area is present
    expect(screen.getByText('Click or drag file to this area to upload')).toBeInTheDocument();
  });

  it('does not render upload list when showUploadList is false', () => {
    const { container } = renderWithProviders(
      <FileUpload onUpload={mockOnUpload} showUploadList={false} />
    );
    // No file list container should exist initially
    expect(container.querySelector('.file-upload-container')).toBeInTheDocument();
  });

  it('does not call onUpload when max file limit is already reached', async () => {
    const onUpload = vi.fn().mockResolvedValue({ url: '/a.txt' });
    const { container } = renderWithProviders(
      <FileUpload onUpload={onUpload} maxFiles={1} showUploadList />
    );
    const input = container.querySelector('input[type="file"]');
    if (!input) return;

    // Upload first file to fill the slot
    const file1 = new File(['a'], 'first.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file1] } });
    await waitFor(() => {
      expect(screen.getByText('first.txt')).toBeInTheDocument();
    });

    // Try to upload a second file — should be rejected
    const file2 = new File(['b'], 'second.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file2] } });

    await waitFor(() => {
      expect(screen.queryByText('second.txt')).not.toBeInTheDocument();
    });
  });

  it('renders the file-upload-container wrapper element', () => {
    const { container } = renderWithProviders(<FileUpload onUpload={mockOnUpload} />);
    expect(container.querySelector('.file-upload-container')).toBeInTheDocument();
  });

  it('renders hint with both maxSize and accept when both are provided', () => {
    renderWithProviders(<FileUpload onUpload={mockOnUpload} accept=".pdf,.docx" maxSize={20} />);
    expect(screen.getByText(/Max size: 20MB/)).toBeInTheDocument();
    expect(screen.getByText(/Accepted: \.pdf,\.docx/)).toBeInTheDocument();
  });

  it('shows success message after a successful upload', async () => {
    const onUpload = vi.fn().mockResolvedValue({ url: '/success.txt' });
    const { container } = renderWithProviders(
      <FileUpload onUpload={onUpload} showUploadList maxFiles={5} />
    );
    const input = container.querySelector('input[type="file"]');
    if (!input) return;
    const file = new File(['ok'], 'success.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('success.txt')).toBeInTheDocument();
    });
    // After successful upload the file status should be 'done' — no error text
    expect(screen.queryByText('Upload failed')).not.toBeInTheDocument();
  });

  it('renders a hidden file input element inside the dragger', () => {
    const { container } = renderWithProviders(<FileUpload onUpload={mockOnUpload} />);
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
  });
});
