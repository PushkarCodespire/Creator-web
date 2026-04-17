import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import AvatarUpload from '../AvatarUpload';

vi.mock('../../../services/api', () => ({
  default: { post: vi.fn() },
  getImageUrl: (url: string) => `http://localhost:5000${url}`,
}));

vi.mock('../ImageUpload', () => ({
  ImageUpload: ({ children }: any) => <div data-testid="image-upload">{children}</div>,
}));

describe('AvatarUpload', () => {
  it('renders avatar container', () => {
    renderWithProviders(<AvatarUpload />);
    expect(screen.getByText('Click camera icon to change')).toBeInTheDocument();
  });

  it('shows "Avatar" text when disabled', () => {
    renderWithProviders(<AvatarUpload disabled />);
    expect(screen.getByText('Avatar')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = renderWithProviders(<AvatarUpload size={80} />);
    // The avatar element should be rendered
    expect(container.querySelector('.avatar-upload-container')).toBeInTheDocument();
  });

  it('renders camera icon when not disabled', () => {
    renderWithProviders(<AvatarUpload />);
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
  });
});
