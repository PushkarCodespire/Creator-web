import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { CountdownTimer } from '../CountdownTimer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(<CountdownTimer />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with className', () => {
    const { container } = renderWithProviders(<CountdownTimer className="timer-class" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('displays a time string', () => {
    const { container } = renderWithProviders(<CountdownTimer />);
    expect(container.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
  });
});
