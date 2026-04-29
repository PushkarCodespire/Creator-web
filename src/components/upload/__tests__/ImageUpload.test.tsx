vi.mock('react-easy-crop', () => ({
  default: ({ onCropComplete }: any) => (
    <div data-testid="cropper">
      <button onClick={() => onCropComplete?.({ x: 0, y: 0 }, { x: 0, y: 0, width: 100, height: 100 })}>
        Crop
      </button>
    </div>
  ),
}));

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ImageUpload } from '../ImageUpload';

describe('ImageUpload', () => {
  it('renders upload button', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders default "Upload Image" button text', () => {
    renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })} />
    );
    expect(screen.getByText('Upload Image')).toBeInTheDocument();
  });

  it('renders with custom button text', () => {
    renderWithProviders(
      <ImageUpload
        onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })}
        buttonText="Upload Photo"
      />
    );
    expect(screen.getByText('Upload Photo')).toBeInTheDocument();
  });

  it('renders disabled state', () => {
    const { container } = renderWithProviders(
      <ImageUpload
        onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })}
        disabled
      />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with children (custom trigger)', () => {
    const { getByText } = renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })}>
        <button>Custom Button</button>
      </ImageUpload>
    );
    expect(getByText('Custom Button')).toBeTruthy();
  });

  it('renders hidden file input', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })} />
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
  });

  it('file input accepts image types', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })} />
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'image/*');
  });

  it('renders with empty string buttonText (no button label)', () => {
    const { container } = renderWithProviders(
      <ImageUpload
        onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })}
        buttonText=""
      />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('rejects non-image file and does not open crop modal', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const badFile = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [badFile] } });
    // Crop modal should not appear since the file type is invalid
    expect(screen.queryByText('Crop Image')).not.toBeInTheDocument();
  });

  it('does not open crop modal when file is too large', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn()} maxSize={1} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(largeFile, 'size', { value: 2 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [largeFile] } });
    expect(screen.queryByText('Crop Image')).not.toBeInTheDocument();
  });

  it('does not trigger file input when disabled', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn()} disabled />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('disabled');
  });

  it('renders with round cropShape prop', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn()} cropShape="round" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with custom aspectRatio', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn()} aspectRatio={16 / 9} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('file input is hidden by default', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn()} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.style.display).toBe('none');
  });

  it('shows crop modal after a valid image file is selected', async () => {
    const { waitFor: wf } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    // Mock Image so onload fires synchronously
    const origImage = global.Image;
    class MockImage {
      width = 800;
      height = 600;
      onload: (() => void) | null = null;
      set src(_: string) { this.onload?.(); }
    }
    (global as any).Image = MockImage;

    const file = new File(['content'], 'photo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    await wf(() => {
      expect(screen.getByText('Crop Image')).toBeInTheDocument();
    });

    (global as any).Image = origImage;
  });

  it('shows Cancel and Upload buttons inside the crop modal', async () => {
    const { waitFor: wf } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const origImage = global.Image;
    class MockImage {
      width = 800; height = 600; onload: (() => void) | null = null;
      set src(_: string) { this.onload?.(); }
    }
    (global as any).Image = MockImage;

    const file = new File(['data'], 'img.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    await wf(() => {
      expect(screen.getByText('Crop Image')).toBeInTheDocument();
    });
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();

    (global as any).Image = origImage;
  });

  it('triggers Cancel button click without error and modal title remains accessible during close animation', async () => {
    const { waitFor: wf } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const origImage = global.Image;
    class MockImage {
      width = 800; height = 600; onload: (() => void) | null = null;
      set src(_: string) { this.onload?.(); }
    }
    (global as any).Image = MockImage;

    fireEvent.change(input, { target: { files: [new File(['d'], 'a.png', { type: 'image/png' })] } });
    await wf(() => { expect(screen.getByText('Crop Image')).toBeInTheDocument(); });

    // Clicking Cancel should not throw and should call handleCancel internally
    expect(() => fireEvent.click(screen.getByText('Cancel'))).not.toThrow();

    (global as any).Image = origImage;
  });

  it('shows Zoom label inside the crop modal', async () => {
    const { waitFor: wf } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const origImage = global.Image;
    class MockImage {
      width = 800; height = 600; onload: (() => void) | null = null;
      set src(_: string) { this.onload?.(); }
    }
    (global as any).Image = MockImage;

    fireEvent.change(input, { target: { files: [new File(['d'], 'a.png', { type: 'image/png' })] } });
    await wf(() => { expect(screen.getByText('Zoom:')).toBeInTheDocument(); });

    (global as any).Image = origImage;
  });

  it('shows Rotation label and Rotate 90° button inside the crop modal', async () => {
    const { waitFor: wf } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const origImage = global.Image;
    class MockImage {
      width = 800; height = 600; onload: (() => void) | null = null;
      set src(_: string) { this.onload?.(); }
    }
    (global as any).Image = MockImage;

    fireEvent.change(input, { target: { files: [new File(['d'], 'a.png', { type: 'image/png' })] } });
    await wf(() => { expect(screen.getByText('Rotation:')).toBeInTheDocument(); });
    expect(screen.getByText('Rotate 90°')).toBeInTheDocument();

    (global as any).Image = origImage;
  });

  it('rejects image narrower than minWidth', async () => {
    const { waitFor: wf } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn()} minWidth={1000} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const origImage = global.Image;
    class MockImage {
      width = 200; height = 600; onload: (() => void) | null = null;
      set src(_: string) { this.onload?.(); }
    }
    (global as any).Image = MockImage;

    fireEvent.change(input, { target: { files: [new File(['d'], 'narrow.png', { type: 'image/png' })] } });

    await wf(() => { expect(screen.queryByText('Crop Image')).not.toBeInTheDocument(); });

    (global as any).Image = origImage;
  });

  it('rejects image shorter than minHeight', async () => {
    const { waitFor: wf } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn()} minHeight={1000} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const origImage = global.Image;
    class MockImage {
      width = 800; height = 100; onload: (() => void) | null = null;
      set src(_: string) { this.onload?.(); }
    }
    (global as any).Image = MockImage;

    fireEvent.change(input, { target: { files: [new File(['d'], 'short.png', { type: 'image/png' })] } });

    await wf(() => { expect(screen.queryByText('Crop Image')).not.toBeInTheDocument(); });

    (global as any).Image = origImage;
  });

  it('wrapper div has pointer cursor when not disabled', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn()} />
    );
    const wrapper = container.querySelector('div[style*="pointer"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
  });

  it('wrapper div has not-allowed cursor when disabled', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn()} disabled />
    );
    const wrapper = container.querySelector('div[style*="not-allowed"]') as HTMLElement;
    expect(wrapper).toBeTruthy();
  });

  it('renders the image-upload class on the root element', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn()} />
    );
    expect(container.querySelector('.image-upload')).toBeTruthy();
  });

  it('Upload button is present and enabled once modal is open', async () => {
    const { waitFor: wf } = await import('@testing-library/react');
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const origImage = global.Image;
    class MockImage {
      width = 800; height = 600; onload: (() => void) | null = null;
      set src(_: string) { this.onload?.(); }
    }
    (global as any).Image = MockImage;

    fireEvent.change(input, { target: { files: [new File(['d'], 'pic.png', { type: 'image/png' })] } });
    await wf(() => { expect(screen.getByText('Crop Image')).toBeInTheDocument(); });

    const uploadBtn = screen.getByText('Upload');
    expect(uploadBtn).toBeInTheDocument();
    // The Upload button is not disabled before clicking
    expect(uploadBtn).not.toBeDisabled();

    (global as any).Image = origImage;
  });
});
