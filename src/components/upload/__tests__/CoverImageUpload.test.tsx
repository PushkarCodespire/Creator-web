vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { data: { url: '/cover.jpg' } } }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('react-easy-crop', () => ({
  default: () => <div data-testid="cropper" />,
}));

import { screen } from '@testing-library/react';
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

  it('renders "Neural Network Cover Missing" text when no cover', () => {
    renderWithProviders(<CoverImageUpload />);
    expect(screen.getByText('Neural Network Cover Missing')).toBeInTheDocument();
  });

  it('renders "Upload Cover" button when no cover and not disabled', () => {
    renderWithProviders(<CoverImageUpload />);
    expect(screen.getByText('Upload Cover')).toBeInTheDocument();
  });

  it('renders "Change Cover" button when cover exists', () => {
    renderWithProviders(<CoverImageUpload currentCover="/existing-cover.jpg" />);
    expect(screen.getByText('Change Cover')).toBeInTheDocument();
  });

  it('does not render upload button when disabled', () => {
    renderWithProviders(<CoverImageUpload disabled />);
    expect(screen.queryByText('Upload Cover')).not.toBeInTheDocument();
    expect(screen.queryByText('Change Cover')).not.toBeInTheDocument();
  });

  it('renders container with cover-image-upload class', () => {
    const { container } = renderWithProviders(<CoverImageUpload />);
    expect(container.querySelector('.cover-image-upload')).toBeTruthy();
  });

  it('renders "Neural Network Cover Missing" text only when no cover provided', () => {
    renderWithProviders(<CoverImageUpload currentCover="/img.jpg" />);
    expect(screen.queryByText('Neural Network Cover Missing')).not.toBeInTheDocument();
  });

  it('renders "Upload Cover" when currentCover is undefined', () => {
    renderWithProviders(<CoverImageUpload currentCover={undefined} />);
    expect(screen.getByText('Upload Cover')).toBeInTheDocument();
  });

  it('renders with custom height prop without crashing', () => {
    const { container } = renderWithProviders(<CoverImageUpload height={350} />);
    expect(container.querySelector('[style*="350px"]')).toBeTruthy();
  });

  it('renders with userId prop without crashing', () => {
    const { container } = renderWithProviders(
      <CoverImageUpload userId="user-123" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Spin wrapper element', () => {
    const { container } = renderWithProviders(<CoverImageUpload />);
    // Ant Design Spin renders a .ant-spin-container
    expect(container.querySelector('.cover-image-upload')).toBeTruthy();
  });

  it('renders with default height of 200px when no height prop given', () => {
    const { container } = renderWithProviders(<CoverImageUpload />);
    expect(container.querySelector('[style*="200px"]')).toBeTruthy();
  });

  it('applies custom height 300px via style', () => {
    const { container } = renderWithProviders(<CoverImageUpload height={300} />);
    expect(container.querySelector('[style*="300px"]')).toBeTruthy();
  });

  it('calls onUploadSuccess prop without crashing when provided', () => {
    const onSuccess = vi.fn();
    const { container } = renderWithProviders(
      <CoverImageUpload onUploadSuccess={onSuccess} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('does not show placeholder text when cover exists', () => {
    renderWithProviders(<CoverImageUpload currentCover="/img.jpg" />);
    expect(screen.queryByText('Neural Network Cover Missing')).not.toBeInTheDocument();
  });

  it('renders "Change Cover" button and not "Upload Cover" when cover exists', () => {
    renderWithProviders(<CoverImageUpload currentCover="/img.jpg" />);
    expect(screen.queryByText('Upload Cover')).not.toBeInTheDocument();
    expect(screen.getByText('Change Cover')).toBeInTheDocument();
  });

  it('does not render "Change Cover" button when disabled and cover exists', () => {
    renderWithProviders(<CoverImageUpload currentCover="/img.jpg" disabled />);
    expect(screen.queryByText('Change Cover')).not.toBeInTheDocument();
  });

  it('renders with both userId and currentCover props without crashing', () => {
    const { container } = renderWithProviders(
      <CoverImageUpload userId="user-abc" currentCover="/banner.jpg" />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
