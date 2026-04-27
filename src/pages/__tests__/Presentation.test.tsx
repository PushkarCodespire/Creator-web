import { render } from '@testing-library/react';
import MVP1Presentation from '../MVP1Presentation';

describe('MVP1Presentation', () => {
  it('renders without crashing', () => {
    const { container } = render(<MVP1Presentation />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders tab navigation', () => {
    const { getByText } = render(<MVP1Presentation />);
    expect(getByText('Overview')).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    const { getByText } = render(<MVP1Presentation />);
    expect(getByText('User Types')).toBeInTheDocument();
    expect(getByText('AI Technology')).toBeInTheDocument();
    expect(getByText('Money Flow')).toBeInTheDocument();
  });
});
