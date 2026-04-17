import { render, screen } from '@testing-library/react';
import DashboardContentLoader from '../DashboardContentLoader';

describe('DashboardContentLoader', () => {
  it('renders loading text', () => {
    render(<DashboardContentLoader />);
    expect(screen.getByText('Loading your experience...')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<DashboardContentLoader />);
    expect(container.firstChild).toBeTruthy();
  });
});
