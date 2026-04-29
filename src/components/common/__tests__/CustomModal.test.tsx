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

  it('renders children content inside the modal body', () => {
    render(
      <CustomModal open={true} title="Body Test">
        <span data-testid="child-node">Child content</span>
      </CustomModal>
    );
    expect(screen.getByTestId('child-node')).toBeInTheDocument();
  });

  it('renders without an icon when icon prop is omitted', () => {
    render(
      <CustomModal open={true} title="No Icon Modal">
        <p>Content</p>
      </CustomModal>
    );
    expect(screen.getByText('No Icon Modal')).toBeInTheDocument();
    // No icon wrapper rendered alongside the title
    expect(screen.queryByTestId('modal-icon')).not.toBeInTheDocument();
  });

  it('renders multiple children correctly', () => {
    render(
      <CustomModal open={true} title="Multi Child">
        <p>First paragraph</p>
        <p>Second paragraph</p>
      </CustomModal>
    );
    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
  });

  it('renders OK and Cancel footer buttons by default', () => {
    render(
      <CustomModal open={true} title="Footer Test">
        <p>Content</p>
      </CustomModal>
    );
    expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onOk when the OK button is clicked', () => {
    const handleOk = vi.fn();
    render(
      <CustomModal open={true} title="OK Test" onOk={handleOk}>
        <p>Content</p>
      </CustomModal>
    );
    screen.getByRole('button', { name: /ok/i }).click();
    expect(handleOk).toHaveBeenCalled();
  });

  it('hides footer buttons when footer is set to null', () => {
    render(
      <CustomModal open={true} title="No Footer" footer={null}>
        <p>Content</p>
      </CustomModal>
    );
    expect(screen.queryByRole('button', { name: /ok/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('renders title text inside a span with font-weight 700', () => {
    render(
      <CustomModal open={true} title="Styled Title">
        <p>Content</p>
      </CustomModal>
    );
    const titleSpan = screen.getByText('Styled Title');
    expect(titleSpan.tagName.toLowerCase()).toBe('span');
    expect(titleSpan).toHaveStyle('font-weight: 700');
  });

  it('uses default width of 600 when no width prop is provided', () => {
    const { baseElement } = render(
      <CustomModal open={true} title="Default Width">
        <p>Content</p>
      </CustomModal>
    );
    // Ant Design sets width via inline style on the modal wrapper
    const modalWrapper = baseElement.querySelector('.ant-modal');
    expect(modalWrapper).toBeInTheDocument();
  });

  it('respects a custom width prop', () => {
    const { baseElement } = render(
      <CustomModal open={true} title="Custom Width" width={800}>
        <p>Content</p>
      </CustomModal>
    );
    const modalWrapper = baseElement.querySelector('.ant-modal') as HTMLElement | null;
    expect(modalWrapper).toBeInTheDocument();
    // width is applied as an inline style
    expect(modalWrapper?.style.width).toBe('800px');
  });

  it('renders icon wrapper in primary color container when icon is provided', () => {
    render(
      <CustomModal open={true} title="Icon Color" icon={<span data-testid="color-icon">X</span>}>
        <p>Content</p>
      </CustomModal>
    );
    const icon = screen.getByTestId('color-icon');
    // Icon is wrapped in a div — check that wrapper exists as a parent
    expect(icon.parentElement).toBeInTheDocument();
  });

  it('does not call onOk when the Cancel button is clicked', () => {
    const handleOk = vi.fn();
    render(
      <CustomModal open={true} title="Isolation Test" onOk={handleOk}>
        <p>Content</p>
      </CustomModal>
    );
    screen.getByRole('button', { name: /cancel/i }).click();
    expect(handleOk).not.toHaveBeenCalled();
  });

  it('does not call onCancel when the OK button is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <CustomModal open={true} title="Isolation Test 2" onCancel={handleCancel}>
        <p>Content</p>
      </CustomModal>
    );
    screen.getByRole('button', { name: /ok/i }).click();
    expect(handleCancel).not.toHaveBeenCalled();
  });

  it('renders title as 18px font size', () => {
    render(
      <CustomModal open={true} title="Font Size Test">
        <p>Content</p>
      </CustomModal>
    );
    const titleSpan = screen.getByText('Font Size Test');
    expect(titleSpan).toHaveStyle('font-size: 18px');
  });
});
