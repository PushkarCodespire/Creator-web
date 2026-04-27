vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import ActivityHeatmapComponent from '../ActivityHeatmap';

const mockData = {
  hourly: Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => Math.floor(Math.random() * 10))),
  peakHour: { day: 'Mon', hour: 14, count: 42 },
  totalMessages: 1234,
};

describe('ActivityHeatmapComponent', () => {
  it('renders empty state when no data', () => {
    const { container } = renderWithProviders(
      <ActivityHeatmapComponent data={null} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders empty state when totalMessages is 0', () => {
    const { container } = renderWithProviders(
      <ActivityHeatmapComponent data={{ ...mockData, totalMessages: 0 }} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders heatmap with data', () => {
    const { container } = renderWithProviders(
      <ActivityHeatmapComponent data={mockData} />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
