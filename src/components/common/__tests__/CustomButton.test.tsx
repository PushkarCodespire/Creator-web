import { render, screen, fireEvent } from '@testing-library/react';
import CustomButton from '../Button/CustomButton';

describe('CustomButton', () => {
  it('renders children text', () => {
    render(<CustomButton>Click Me</CustomButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('renders with primary variant by default', () => {
    render(<CustomButton>Primary</CustomButton>);
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<CustomButton onClick={handleClick}>Click</CustomButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders in disabled state', () => {
    render(<CustomButton disabled>Disabled</CustomButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders with loading state', () => {
    render(<CustomButton loading>Loading</CustomButton>);
    // Ant Design adds a loading spinner; button should still be present
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders different variants without crashing', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger', 'success'] as const;
    variants.forEach((variant) => {
      const { unmount } = render(<CustomButton variant={variant}>{variant}</CustomButton>);
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders block button', () => {
    render(<CustomButton block>Block</CustomButton>);
    expect(screen.getByText('Block')).toBeInTheDocument();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<CustomButton disabled onClick={handleClick}>Disabled</CustomButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with size large without crashing', () => {
    render(<CustomButton size="large">Large</CustomButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with size small without crashing', () => {
    render(<CustomButton size="small">Small</CustomButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders secondary variant without crashing', () => {
    render(<CustomButton variant="secondary">Secondary</CustomButton>);
    expect(screen.getByText('Secondary')).toBeInTheDocument();
  });

  it('renders danger variant without crashing', () => {
    render(<CustomButton variant="danger">Delete</CustomButton>);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders success variant without crashing', () => {
    render(<CustomButton variant="success">Confirm</CustomButton>);
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('renders ghost variant without crashing', () => {
    render(<CustomButton variant="ghost">Ghost</CustomButton>);
    expect(screen.getByText('Ghost')).toBeInTheDocument();
  });
});
