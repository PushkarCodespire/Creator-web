vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { data: { url: '/cover.jpg' } } }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('react-easy-crop', () => ({
  default: () => <div data-testid="cropper" />,
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CoverImageUpload from '../CoverImageUpload';

describe('CoverImageUpload', () => {
  it('renders without current cover', () => {
    const { container } = renderWithProviders(<CoverImageUpload />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with current cover', () => {
    const { container } = renderWithProviders(
      <CoverImageUpload currentCover="/existing-cover.jpg" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders disabled state', () => {
    const { container } = renderWithProviders(
      <CoverImageUpload disabled />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
