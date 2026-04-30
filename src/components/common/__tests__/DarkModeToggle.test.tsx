import { render, screen, fireEvent } from '@testing-library/react';
import { DarkModeToggle } from '../DarkModeToggle';

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the toggle switch', () => {
    render(<DarkModeToggle />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
  });

  it('renders with showLabel displaying Light Mode by default', () => {
    render(<DarkModeToggle showLabel />);
    expect(screen.getByText('Light Mode')).toBeInTheDocument();
  });

  it('renders without label by default', () => {
    render(<DarkModeToggle />);
    expect(screen.queryByText('Light Mode')).not.toBeInTheDocument();
    expect(screen.queryByText('Dark Mode')).not.toBeInTheDocument();
  });

  it('renders in small size', () => {
    render(<DarkModeToggle size="small" />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
  });

  it('renders "Dark Mode" label after enabling dark mode via localStorage', () => {
    localStorage.setItem('darkMode', 'true');
    render(<DarkModeToggle showLabel />);
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('switch is checked when dark mode is active', () => {
    localStorage.setItem('darkMode', 'true');
    render(<DarkModeToggle />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
  });

  it('switch is not checked when dark mode is inactive', () => {
    localStorage.setItem('darkMode', 'false');
    render(<DarkModeToggle />);
    const toggle = screen.getByRole('switch');
    expect(toggle).not.toBeChecked();
  });

  it('toggling the switch changes dark mode state', () => {
    localStorage.setItem('darkMode', 'false');
    render(<DarkModeToggle showLabel />);
    expect(screen.getByText('Light Mode')).toBeInTheDocument();
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('does not render label text when showLabel is false', () => {
    localStorage.setItem('darkMode', 'true');
    render(<DarkModeToggle showLabel={false} />);
    expect(screen.queryByText('Dark Mode')).not.toBeInTheDocument();
    expect(screen.queryByText('Light Mode')).not.toBeInTheDocument();
  });

  it('adds the "dark" class to documentElement when dark mode is active', () => {
    localStorage.setItem('darkMode', 'true');
    render(<DarkModeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes the "dark" class from documentElement when dark mode is inactive', () => {
    localStorage.setItem('darkMode', 'false');
    document.documentElement.classList.add('dark'); // simulate stale state
    render(<DarkModeToggle />);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('saves "true" to localStorage after toggling from light to dark', () => {
    localStorage.setItem('darkMode', 'false');
    render(<DarkModeToggle />);
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    expect(localStorage.getItem('darkMode')).toBe('true');
  });

  it('saves "false" to localStorage after toggling from dark to light', () => {
    localStorage.setItem('darkMode', 'true');
    render(<DarkModeToggle />);
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  it('adds "dark" class to documentElement after toggling on', () => {
    localStorage.setItem('darkMode', 'false');
    render(<DarkModeToggle />);
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('renders in default size when size prop is omitted', () => {
    render(<DarkModeToggle />);
    const toggle = screen.getByRole('switch');
    // Default Ant Design Switch does NOT have aria-disabled and is present
    expect(toggle).toBeInTheDocument();
  });

  it('switches label from "Dark Mode" to "Light Mode" when toggled off', () => {
    localStorage.setItem('darkMode', 'true');
    render(<DarkModeToggle showLabel />);
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    expect(screen.getByText('Light Mode')).toBeInTheDocument();
  });
});
