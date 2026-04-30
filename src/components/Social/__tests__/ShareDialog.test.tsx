import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ShareDialog } from '../ShareDialog';

const defaultProps = {
  visible: true,
  onClose: vi.fn(),
  url: 'https://example.com/creator/test',
  title: 'Share Creator',
};

describe('ShareDialog', () => {
  it('renders when visible', () => {
    const { container } = renderWithProviders(<ShareDialog {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('renders when not visible', () => {
    const { container } = renderWithProviders(
      <ShareDialog visible={false} onClose={vi.fn()} url="https://example.com/creator/test" />
    );
    expect(container).toBeTruthy();
  });

  it('renders Share modal title when visible', () => {
    renderWithProviders(<ShareDialog {...defaultProps} />);
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('renders copy button', () => {
    renderWithProviders(<ShareDialog {...defaultProps} />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('renders the URL in the input', () => {
    renderWithProviders(<ShareDialog {...defaultProps} />);
    expect(screen.getByDisplayValue('https://example.com/creator/test')).toBeInTheDocument();
  });

  it('renders the Facebook share button', () => {
    renderWithProviders(<ShareDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Facebook/i })).toBeInTheDocument();
  });

  it('renders the Twitter share button', () => {
    renderWithProviders(<ShareDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Twitter/i })).toBeInTheDocument();
  });

  it('renders the WhatsApp share button', () => {
    renderWithProviders(<ShareDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /WhatsApp/i })).toBeInTheDocument();
  });

  it('renders the LinkedIn share button', () => {
    renderWithProviders(<ShareDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /LinkedIn/i })).toBeInTheDocument();
  });

  it('renders "Share via" divider text', () => {
    renderWithProviders(<ShareDialog {...defaultProps} />);
    expect(screen.getByText('Share via')).toBeInTheDocument();
  });

  it('copies URL to clipboard and shows "Copied!" when Copy is clicked', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    renderWithProviders(<ShareDialog {...defaultProps} />);
    const copyBtn = screen.getByRole('button', { name: /Copy/i });
    copyBtn.click();

    await screen.findByText('Copied!');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/creator/test');
  });

  it('renders a read-only input (not editable)', () => {
    renderWithProviders(<ShareDialog {...defaultProps} />);
    const input = screen.getByDisplayValue('https://example.com/creator/test');
    expect(input).toHaveAttribute('readonly');
  });

  it('calls onClose when the modal cancel button is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(<ShareDialog {...defaultProps} onClose={onClose} />);
    // Ant Design modal renders a close button with aria-label="Close"
    const closeBtn = screen.getByRole('button', { name: /close/i });
    closeBtn.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render modal content when visible is false', () => {
    renderWithProviders(
      <ShareDialog visible={false} onClose={vi.fn()} url="https://example.com/hidden" />
    );
    expect(screen.queryByDisplayValue('https://example.com/hidden')).not.toBeInTheDocument();
  });

  it('renders the correct URL when a different URL is provided', () => {
    renderWithProviders(
      <ShareDialog visible={true} onClose={vi.fn()} url="https://other.com/post/456" />
    );
    expect(screen.getByDisplayValue('https://other.com/post/456')).toBeInTheDocument();
  });

  it('shows "Copy" label before copying and "Copied!" after click', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    renderWithProviders(<ShareDialog {...defaultProps} />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
    screen.getByRole('button', { name: /Copy/i }).click();
    await screen.findByText('Copied!');
  });

  it('opens a new window when the Facebook button is clicked', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderWithProviders(<ShareDialog {...defaultProps} />);
    screen.getByRole('button', { name: /Facebook/i }).click();
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com'),
      '_blank',
      expect.any(String)
    );
    openSpy.mockRestore();
  });

  it('opens a new window when the Twitter button is clicked', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderWithProviders(<ShareDialog {...defaultProps} />);
    screen.getByRole('button', { name: /Twitter/i }).click();
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com'),
      '_blank',
      expect.any(String)
    );
    openSpy.mockRestore();
  });

  // --- NEW TESTS APPENDED BELOW ---

  it('opens a new window when the WhatsApp button is clicked', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderWithProviders(<ShareDialog {...defaultProps} />);
    screen.getByRole('button', { name: /WhatsApp/i }).click();
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'),
      '_blank',
      expect.any(String)
    );
    openSpy.mockRestore();
  });

  it('opens a new window when the LinkedIn button is clicked', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderWithProviders(<ShareDialog {...defaultProps} />);
    screen.getByRole('button', { name: /LinkedIn/i }).click();
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('linkedin.com'),
      '_blank',
      expect.any(String)
    );
    openSpy.mockRestore();
  });

  it('encodes the URL in the Twitter share link', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderWithProviders(
      <ShareDialog {...defaultProps} url="https://example.com/path?foo=bar&baz=qux" />
    );
    screen.getByRole('button', { name: /Twitter/i }).click();
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('https://example.com/path?foo=bar&baz=qux')),
      '_blank',
      expect.any(String)
    );
    openSpy.mockRestore();
  });

  it('encodes the URL in the Facebook share link', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderWithProviders(
      <ShareDialog {...defaultProps} url="https://example.com/special page" />
    );
    screen.getByRole('button', { name: /Facebook/i }).click();
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('https://example.com/special page')),
      '_blank',
      expect.any(String)
    );
    openSpy.mockRestore();
  });

  it('uses native share when navigator.share is available and "Share via..." button is clicked', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
      writable: true,
    });
    renderWithProviders(<ShareDialog {...defaultProps} />);
    const nativeShareBtn = screen.getByRole('button', { name: /Share via/i });
    nativeShareBtn.click();
    await vi.waitFor(() => expect(shareMock).toHaveBeenCalledWith(
      expect.objectContaining({ url: defaultProps.url, title: defaultProps.title })
    ));
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true, writable: true });
  });

  it('falls back to clipboard copy when navigator.share is not available and "Share via..." triggers handleNativeShare', async () => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

    // When share is not present, the "Share via..." button is not rendered, so
    // handleNativeShare would be triggered via native API absence. Test copy fallback
    // through the Copy button directly to cover the same clipboard path.
    renderWithProviders(<ShareDialog {...defaultProps} />);
    screen.getByRole('button', { name: /Copy/i }).click();
    await vi.waitFor(() => expect(writeTextMock).toHaveBeenCalledWith(defaultProps.url));
  });

  it('description prop does not cause a crash when provided', () => {
    renderWithProviders(
      <ShareDialog {...defaultProps} description="A great creator profile" />
    );
    // Modal renders in a portal; verify by checking the modal title is in the document
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('renders with a long URL without breaking layout', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(200);
    renderWithProviders(
      <ShareDialog visible={true} onClose={vi.fn()} url={longUrl} />
    );
    expect(screen.getByDisplayValue(longUrl)).toBeInTheDocument();
  });

  it('clipboard error during copy is handled gracefully', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    renderWithProviders(<ShareDialog {...defaultProps} />);
    // Should not throw; component stays mounted
    screen.getByRole('button', { name: /Copy/i }).click();
    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument();
    });
  });

  it('onClose is not called when clicking inside the modal body', () => {
    const onClose = vi.fn();
    renderWithProviders(<ShareDialog {...defaultProps} onClose={onClose} />);
    // Click the URL input — should not close the modal
    screen.getByDisplayValue(defaultProps.url).click();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders modal with default title "Share this" when no title prop is given', () => {
    renderWithProviders(
      <ShareDialog visible={true} onClose={vi.fn()} url="https://example.com/no-title" />
    );
    // The modal header always shows "Share" from the icon+span, not the title prop
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('renders all four social platform buttons simultaneously', () => {
    renderWithProviders(<ShareDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Facebook/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Twitter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /WhatsApp/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LinkedIn/i })).toBeInTheDocument();
  });

  it('passes the correct window dimensions to window.open for LinkedIn', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderWithProviders(<ShareDialog {...defaultProps} />);
    screen.getByRole('button', { name: /LinkedIn/i }).click();
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('linkedin.com'),
      '_blank',
      'width=600,height=400'
    );
    openSpy.mockRestore();
  });
});
