vi.mock('react-easy-crop', () => ({
  default: ({ onCropComplete }: any) => (
    <div data-testid="cropper">
      <button onClick={() => onCropComplete?.({ x: 0, y: 0 }, { x: 0, y: 0, width: 100, height: 100 })}>
        Crop
      </button>
    </div>
  ),
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ImageUpload } from '../ImageUpload';

describe('ImageUpload', () => {
  it('renders upload button', () => {
    const { container } = renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with custom button text', () => {
    const { container } = renderWithProviders(
      <ImageUpload
        onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })}
        buttonText="Upload Photo"
      />
    );
    expect(container.firstChild).toBeTruthy();
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

  it('renders with children', () => {
    const { getByText } = renderWithProviders(
      <ImageUpload onUpload={vi.fn().mockResolvedValue({ url: '/test.jpg' })}>
        <button>Custom Button</button>
      </ImageUpload>
    );
    expect(getByText('Custom Button')).toBeTruthy();
  });
});
