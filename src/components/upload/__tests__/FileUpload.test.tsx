import { screen } from '@testing-library/react';
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
});
