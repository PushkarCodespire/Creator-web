import { render, screen } from '@testing-library/react';
import { PageLoader } from '../PageLoader';

describe('PageLoader', () => {
  it('renders loading text', () => {
    render(<PageLoader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<PageLoader />);
    expect(container.firstChild).toBeTruthy();
  });
});
