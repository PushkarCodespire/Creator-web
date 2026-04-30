import { screen, act } from '@testing-library/react';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { CountdownTimer } from '../CountdownTimer';

const TOTAL_SECONDS = 24 * 3600 + 20 * 60 + 10; // 87610

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CountdownTimer className="" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders a span element', () => {
    const { container } = renderWithProviders(<CountdownTimer className="" />);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
  });

  it('renders time in HH:MM:SS format', () => {
    renderWithProviders(<CountdownTimer className="" />);
    const span = screen.getByText(/^\d{2}:\d{2}:\d{2}$/);
    expect(span).toBeInTheDocument();
  });

  it('applies className prop to the span', () => {
    const { container } = renderWithProviders(<CountdownTimer className="my-timer" />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('my-timer');
  });

  it('initial time matches TOTAL_SECONDS (24:20:10)', () => {
    renderWithProviders(<CountdownTimer className="" />);
    // TOTAL_SECONDS = 87610 => 24h 20m 10s => "24:20:10"
    expect(screen.getByText('24:20:10')).toBeInTheDocument();
  });

  it('counts down by 1 second after one tick', () => {
    renderWithProviders(<CountdownTimer className="" />);
    expect(screen.getByText('24:20:10')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('24:20:09')).toBeInTheDocument();
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { unmount } = renderWithProviders(<CountdownTimer className="" />);
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('renders without applying a className when not provided via empty string', () => {
    const { container } = renderWithProviders(<CountdownTimer className="" />);
    const span = container.querySelector('span');
    // className is an empty string — the attribute may be absent or empty
    expect(span?.className ?? '').toBe('');
  });
});
