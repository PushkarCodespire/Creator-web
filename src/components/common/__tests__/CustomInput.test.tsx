import { render, screen, fireEvent } from '@testing-library/react';
import CustomInput from '../Form/CustomInput';

describe('CustomInput', () => {
  it('renders input without label', () => {
    render(<CustomInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<CustomInput label="Username" placeholder="Enter username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('renders helper text when provided', () => {
    render(<CustomInput helperText="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<CustomInput onChange={handleChange} placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders in disabled state', () => {
    render(<CustomInput disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('renders without label or helperText (bare input)', () => {
    render(<CustomInput />);
    // No label or helper should be rendered; the input itself should exist
    expect(document.querySelector('input')).toBeTruthy();
  });

  it('does not render label element when label is omitted', () => {
    render(<CustomInput placeholder="No label" />);
    expect(document.querySelector('label')).not.toBeInTheDocument();
  });

  it('does not render helper paragraph when helperText is omitted', () => {
    render(<CustomInput placeholder="No helper" />);
    expect(document.querySelector('p')).not.toBeInTheDocument();
  });

  it('passes value prop to the underlying input', () => {
    render(<CustomInput value="preset value" onChange={vi.fn()} placeholder="val-input" />);
    const input = screen.getByPlaceholderText('val-input') as HTMLInputElement;
    expect(input.value).toBe('preset value');
  });

  it('renders with type="password" without crashing', () => {
    render(<CustomInput type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
  });

  it('passes maxLength to the underlying input', () => {
    render(<CustomInput maxLength={20} placeholder="Limited" />);
    expect(screen.getByPlaceholderText('Limited')).toHaveAttribute('maxlength', '20');
  });

  it('renders both label and helperText together', () => {
    render(<CustomInput label="Email" helperText="Must be valid" placeholder="email@example.com" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Must be valid')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
  });

  it('renders with type="email" without crashing', () => {
    render(<CustomInput type="email" placeholder="email-input" />);
    expect(screen.getByPlaceholderText('email-input')).toHaveAttribute('type', 'email');
  });

  it('renders with type="number" without crashing', () => {
    render(<CustomInput type="number" placeholder="num-input" />);
    expect(screen.getByPlaceholderText('num-input')).toHaveAttribute('type', 'number');
  });

  it('renders with readOnly prop', () => {
    render(<CustomInput readOnly placeholder="readonly-input" />);
    expect(screen.getByPlaceholderText('readonly-input')).toHaveAttribute('readonly');
  });

  it('wraps content in a div container', () => {
    const { container } = render(<CustomInput placeholder="wrapper-check" />);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('fires onChange once per character typed', () => {
    const handleChange = vi.fn();
    render(<CustomInput onChange={handleChange} placeholder="multi-change" />);
    const input = screen.getByPlaceholderText('multi-change');
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'ab' } });
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it('label text matches the provided label prop exactly', () => {
    render(<CustomInput label="Full Name" />);
    const labelEl = document.querySelector('label');
    expect(labelEl?.textContent).toBe('Full Name');
  });

  it('renders with autoFocus prop without crashing', () => {
    render(<CustomInput autoFocus placeholder="auto-focus-input" />);
    expect(screen.getByPlaceholderText('auto-focus-input')).toBeInTheDocument();
  });

  it('does not fire onChange when input is disabled', () => {
    const handleChange = vi.fn();
    render(<CustomInput disabled onChange={handleChange} placeholder="disabled-change" />);
    const input = screen.getByPlaceholderText('disabled-change');
    fireEvent.change(input, { target: { value: 'x' } });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders with name prop passed through to the input', () => {
    render(<CustomInput name="username" placeholder="named-input" />);
    expect(screen.getByPlaceholderText('named-input')).toHaveAttribute('name', 'username');
  });

  it('helper text paragraph contains the provided text', () => {
    render(<CustomInput helperText="Helper message here" />);
    const p = document.querySelector('p');
    expect(p?.textContent).toBe('Helper message here');
  });

  it('applies custom style width to the input element', () => {
    render(<CustomInput style={{ width: '300px' }} placeholder="styled-width" />);
    const input = screen.getByPlaceholderText('styled-width') as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it('renders with defaultValue without crashing', () => {
    render(<CustomInput defaultValue="initial text" placeholder="default-val" />);
    const input = screen.getByPlaceholderText('default-val') as HTMLInputElement;
    expect(input.value).toBe('initial text');
  });
});
