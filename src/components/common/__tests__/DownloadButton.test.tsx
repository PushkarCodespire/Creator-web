// ===========================================
// TESTS: DownloadButton component
// ===========================================

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { DownloadButton } from '../DownloadButton/DownloadButton';

vi.mock('../../../utils/fileDownloadUtils', () => ({
  downloadFromUrl: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../utils/downloadHelpers', () => ({
  downloadDisplayedImage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('antd', () => ({
  Button: ({ children, loading, onClick, type, size, icon, className }: any) => (
    <button
      data-testid="download-btn"
      data-loading={String(loading)}
      data-type={type}
      data-size={size}
      className={className}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  ),
  message: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@ant-design/icons', () => ({
  DownloadOutlined: () => <span data-testid="download-icon" />,
}));

// Import after mocks are set up
import { downloadFromUrl } from '../../../utils/fileDownloadUtils';
import { downloadDisplayedImage } from '../../../utils/downloadHelpers';
import { message } from 'antd';

describe('DownloadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <DownloadButton url="https://example.com/file.jpg" />
    );
    expect(container).toBeTruthy();
  });

  it('renders default "Download" text', () => {
    renderWithProviders(<DownloadButton url="https://example.com/file.jpg" />);
    expect(screen.getByTestId('download-btn')).toHaveTextContent('Download');
  });

  it('renders custom children text', () => {
    renderWithProviders(
      <DownloadButton url="https://example.com/file.jpg">Get File</DownloadButton>
    );
    expect(screen.getByTestId('download-btn')).toHaveTextContent('Get File');
  });

  it('renders the download icon', () => {
    renderWithProviders(<DownloadButton url="https://example.com/file.jpg" />);
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  it('clicking triggers downloadDisplayedImage when isDownloadUrl=false', async () => {
    renderWithProviders(
      <DownloadButton url="https://example.com/image.jpg" isDownloadUrl={false} />
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(downloadDisplayedImage).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
        undefined
      );
    });
    expect(downloadFromUrl).not.toHaveBeenCalled();
  });

  it('clicking triggers downloadFromUrl when isDownloadUrl=true', async () => {
    renderWithProviders(
      <DownloadButton url="https://example.com/file.pdf" isDownloadUrl={true} filename="doc.pdf" />
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(downloadFromUrl).toHaveBeenCalledWith(
        'https://example.com/file.pdf',
        'doc.pdf'
      );
    });
    expect(downloadDisplayedImage).not.toHaveBeenCalled();
  });

  it('clicking with empty url shows message.error and does not call downloadFromUrl', async () => {
    renderWithProviders(
      <DownloadButton url="" isDownloadUrl={true} />
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('No URL provided');
    });
    expect(downloadFromUrl).not.toHaveBeenCalled();
  });

  it('calls onDownloadComplete callback after successful download', async () => {
    const onDownloadComplete = vi.fn();
    renderWithProviders(
      <DownloadButton
        url="https://example.com/file.jpg"
        onDownloadComplete={onDownloadComplete}
      />
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(onDownloadComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onDownloadError callback on download failure', async () => {
    const downloadError = new Error('Network failure');
    vi.mocked(downloadDisplayedImage).mockRejectedValueOnce(downloadError);
    const onDownloadError = vi.fn();

    renderWithProviders(
      <DownloadButton
        url="https://example.com/file.jpg"
        isDownloadUrl={false}
        onDownloadError={onDownloadError}
      />
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(onDownloadError).toHaveBeenCalledWith(downloadError);
    });
  });

  it('shows loading state while downloading', async () => {
    // Use a promise we can control to observe intermediate loading state
    let resolveDownload!: () => void;
    const controlledPromise = new Promise<void>((resolve) => {
      resolveDownload = resolve;
    });
    vi.mocked(downloadDisplayedImage).mockReturnValueOnce(controlledPromise);

    renderWithProviders(
      <DownloadButton url="https://example.com/file.jpg" isDownloadUrl={false} />
    );

    fireEvent.click(screen.getByTestId('download-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('download-btn')).toHaveAttribute('data-loading', 'true');
    });

    resolveDownload();

    await waitFor(() => {
      expect(screen.getByTestId('download-btn')).toHaveAttribute('data-loading', 'false');
    });
  });

  it('applies className prop', () => {
    renderWithProviders(
      <DownloadButton url="https://example.com/file.jpg" className="my-btn" />
    );
    expect(screen.getByTestId('download-btn')).toHaveClass('my-btn');
  });

  it('renders with type="primary"', () => {
    renderWithProviders(
      <DownloadButton url="https://example.com/file.jpg" type="primary" />
    );
    expect(screen.getByTestId('download-btn')).toHaveAttribute('data-type', 'primary');
  });

  it('renders with size="large"', () => {
    renderWithProviders(
      <DownloadButton url="https://example.com/file.jpg" size="large" />
    );
    expect(screen.getByTestId('download-btn')).toHaveAttribute('data-size', 'large');
  });

  it('renders with size="small"', () => {
    renderWithProviders(
      <DownloadButton url="https://example.com/file.jpg" size="small" />
    );
    expect(screen.getByTestId('download-btn')).toHaveAttribute('data-size', 'small');
  });

  it('shows message.success after a successful download', async () => {
    renderWithProviders(
      <DownloadButton url="https://example.com/file.jpg" isDownloadUrl={false} />
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith('Download started');
    });
  });

  it('shows message.error after a failed download', async () => {
    vi.mocked(downloadDisplayedImage).mockRejectedValueOnce(new Error('fail'));
    renderWithProviders(
      <DownloadButton url="https://example.com/file.jpg" isDownloadUrl={false} />
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Failed to download file');
    });
  });

  it('passes filename to downloadFromUrl when isDownloadUrl=true', async () => {
    renderWithProviders(
      <DownloadButton url="https://example.com/img.png" isDownloadUrl={true} filename="photo.png" />
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(downloadFromUrl).toHaveBeenCalledWith('https://example.com/img.png', 'photo.png');
    });
  });

  it('does not call onDownloadComplete when download fails', async () => {
    vi.mocked(downloadDisplayedImage).mockRejectedValueOnce(new Error('fail'));
    const onDownloadComplete = vi.fn();
    renderWithProviders(
      <DownloadButton
        url="https://example.com/file.jpg"
        isDownloadUrl={false}
        onDownloadComplete={onDownloadComplete}
      />
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(message.error).toHaveBeenCalled();
    });
    expect(onDownloadComplete).not.toHaveBeenCalled();
  });

  it('renders with type="default" by default', () => {
    renderWithProviders(<DownloadButton url="https://example.com/file.jpg" />);
    expect(screen.getByTestId('download-btn')).toHaveAttribute('data-type', 'default');
  });

  it('renders with size="middle" by default', () => {
    renderWithProviders(<DownloadButton url="https://example.com/file.jpg" />);
    expect(screen.getByTestId('download-btn')).toHaveAttribute('data-size', 'middle');
  });

  it('does not call onDownloadError when download succeeds', async () => {
    const onDownloadError = vi.fn();
    renderWithProviders(
      <DownloadButton
        url="https://example.com/file.jpg"
        isDownloadUrl={false}
        onDownloadError={onDownloadError}
      />
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(message.success).toHaveBeenCalled();
    });
    expect(onDownloadError).not.toHaveBeenCalled();
  });

  it('passes undefined filename to downloadDisplayedImage when filename not provided', async () => {
    renderWithProviders(
      <DownloadButton url="https://example.com/no-name.jpg" isDownloadUrl={false} />
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(downloadDisplayedImage).toHaveBeenCalledWith(
        'https://example.com/no-name.jpg',
        undefined
      );
    });
  });

  it('calls message.error with "No URL provided" when url is empty and isDownloadUrl=false', async () => {
    renderWithProviders(<DownloadButton url="" isDownloadUrl={false} />);
    fireEvent.click(screen.getByTestId('download-btn'));
    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('No URL provided');
    });
    expect(downloadDisplayedImage).not.toHaveBeenCalled();
  });

  it('button is not loading before click', () => {
    renderWithProviders(<DownloadButton url="https://example.com/file.jpg" />);
    expect(screen.getByTestId('download-btn')).toHaveAttribute('data-loading', 'false');
  });

  it('renders with type="dashed" without crashing', () => {
    renderWithProviders(
      <DownloadButton url="https://example.com/file.jpg" type="dashed" />
    );
    expect(screen.getByTestId('download-btn')).toHaveAttribute('data-type', 'dashed');
  });
});
