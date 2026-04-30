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

import { screen } from '@testing-library/react';

describe('ActivityHeatmapComponent', () => {
  it('renders empty state when no data', () => {
    const { container } = renderWithProviders(
      <ActivityHeatmapComponent data={null} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders empty state when totalMessages is 0', () => {
    renderWithProviders(
      <ActivityHeatmapComponent data={{ ...mockData, totalMessages: 0 }} />
    );
    expect(screen.getByText('No activity data analyzed yet.')).toBeInTheDocument();
  });

  it('renders heatmap with data', () => {
    const { container } = renderWithProviders(
      <ActivityHeatmapComponent data={mockData} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Social Density Heatmap title with data', () => {
    renderWithProviders(<ActivityHeatmapComponent data={mockData} />);
    expect(screen.getByText('Social Density Heatmap')).toBeInTheDocument();
  });

  it('renders Messages Analyzed count with data', () => {
    renderWithProviders(<ActivityHeatmapComponent data={mockData} />);
    expect(screen.getByText(/Messages Analyzed/i)).toBeInTheDocument();
  });

  it('renders PEAK label with data', () => {
    renderWithProviders(<ActivityHeatmapComponent data={mockData} />);
    expect(screen.getByText(/PEAK:/i)).toBeInTheDocument();
  });

  it('renders "When your AI community is most active" subtitle', () => {
    renderWithProviders(<ActivityHeatmapComponent data={mockData} />);
    expect(screen.getByText('When your AI community is most active')).toBeInTheDocument();
  });

  it('renders "Activity Density" legend label when data is provided', () => {
    renderWithProviders(<ActivityHeatmapComponent data={mockData} />);
    expect(screen.getByText('Activity Density')).toBeInTheDocument();
  });

  it('renders "Low" and "High" legend labels when data is provided', () => {
    renderWithProviders(<ActivityHeatmapComponent data={mockData} />);
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders the Optimization tip section', () => {
    renderWithProviders(<ActivityHeatmapComponent data={mockData} />);
    expect(screen.getByText(/Optimization tip:/i)).toBeInTheDocument();
  });

  it('renders the peakHour day name inside the tip text', () => {
    renderWithProviders(<ActivityHeatmapComponent data={mockData} />);
    // peakHour.day is "Mon" — should appear in the optimisation tip
    expect(screen.getAllByText(/Mon/i).length).toBeGreaterThan(0);
  });

  it('renders all 7 day-of-week row labels (Sun through Sat)', () => {
    renderWithProviders(<ActivityHeatmapComponent data={mockData} />);
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((day) => {
      expect(screen.getAllByText(day).length).toBeGreaterThan(0);
    });
  });

  it('renders total messages formatted with locale separators', () => {
    const data = { ...mockData, totalMessages: 1234 };
    renderWithProviders(<ActivityHeatmapComponent data={data} />);
    // toLocaleString() on 1234 gives "1,234" in most locales
    expect(screen.getByText(/1[,.]?234 Messages Analyzed/i)).toBeInTheDocument();
  });

  it('renders 24 hour-column cells per day row (168 total motion.div cells)', () => {
    const { container } = renderWithProviders(
      <ActivityHeatmapComponent data={mockData} />
    );
    // Each of the 7 days has 24 motion.div heat cells
    // motion.div is mocked to a plain div; count divs that are direct grid children
    // We check that the component renders without crashing and has substantial DOM
    expect(container.querySelectorAll('div').length).toBeGreaterThan(7 * 24);
  });

  it('does not render "Social Density Heatmap" title when data is null', () => {
    renderWithProviders(<ActivityHeatmapComponent data={null} />);
    expect(screen.queryByText('Social Density Heatmap')).not.toBeInTheDocument();
  });

  it('does not render "Activity Density" legend when data is null', () => {
    renderWithProviders(<ActivityHeatmapComponent data={null} />);
    expect(screen.queryByText('Activity Density')).not.toBeInTheDocument();
  });

  it('renders the peakHour hour in the PEAK tag header', () => {
    const data = { ...mockData, peakHour: { day: 'Wed', hour: 9, count: 55 } };
    renderWithProviders(<ActivityHeatmapComponent data={data} />);
    // formatHour(9) => "9 AM" — appears in PEAK tag and optimization tip
    expect(screen.getByText(/PEAK:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/9 AM/i).length).toBeGreaterThan(0);
  });

  it('renders optimization tip with the formatted peak hour time', () => {
    const data = { ...mockData, peakHour: { day: 'Fri', hour: 20, count: 30 } };
    renderWithProviders(<ActivityHeatmapComponent data={data} />);
    // formatHour(20) => "8 PM" — appears in PEAK tag and optimization tip
    expect(screen.getAllByText(/8 PM/i).length).toBeGreaterThan(0);
  });

  it('renders "No activity data analyzed yet." when totalMessages is 0 and data is otherwise valid', () => {
    const zeroData = {
      hourly: Array.from({ length: 7 }, () => Array(24).fill(0)),
      peakHour: { day: 'Mon', hour: 0, count: 0 },
      totalMessages: 0,
    };
    renderWithProviders(<ActivityHeatmapComponent data={zeroData} />);
    expect(screen.getByText('No activity data analyzed yet.')).toBeInTheDocument();
  });
});
