import { render, screen } from '@testing-library/react';
import ThemeWrapper from '../ThemeWrapper';

describe('ThemeWrapper', () => {
  it('renders children', () => {
    render(
      <ThemeWrapper>
        <div data-testid="child">Hello</div>
      </ThemeWrapper>
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('renders multiple children', () => {
    render(
      <ThemeWrapper>
        <span data-testid="a">A</span>
        <span data-testid="b">B</span>
      </ThemeWrapper>
    );
    expect(screen.getByTestId('a')).toBeTruthy();
    expect(screen.getByTestId('b')).toBeTruthy();
  });
});
