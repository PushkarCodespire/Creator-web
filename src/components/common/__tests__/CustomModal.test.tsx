import { render, screen } from '@testing-library/react';
import CustomModal from '../Modal/CustomModal';

describe('CustomModal', () => {
  it('renders modal with title and children when open', () => {
    render(
      <CustomModal open={true} title="Test Modal">
        <p>Modal body content</p>
      </CustomModal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <CustomModal open={false} title="Hidden Modal">
        <p>Should not be visible</p>
      </CustomModal>
    );

    expect(screen.queryByText('Hidden Modal')).not.toBeInTheDocument();
  });

  it('renders icon alongside title when provided', () => {
    render(
      <CustomModal open={true} title="With Icon" icon={<span data-testid="modal-icon">I</span>}>
        <p>Content</p>
      </CustomModal>
    );

    expect(screen.getByTestId('modal-icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('calls onCancel when cancel is triggered', () => {
    const handleCancel = vi.fn();
    render(
      <CustomModal open={true} title="Cancel Test" onCancel={handleCancel}>
        <p>Content</p>
      </CustomModal>
    );

    // Ant Design modal has a close button (X) by default
    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.click();
    expect(handleCancel).toHaveBeenCalled();
  });
});
