import { render, screen } from '@testing-library/react';
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
});
