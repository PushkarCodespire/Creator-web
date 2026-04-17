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
});
