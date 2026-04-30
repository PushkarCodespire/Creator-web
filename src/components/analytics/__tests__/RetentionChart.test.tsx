vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { RetentionChart } from '../RetentionChart';

const mockData = [
  {
    cohortMonth: '2024-01',
    cohortSize: 100,
    retention: { week1: 80, week2: 60, week4: 45, week8: 30 },
  },
];

import { screen } from '@testing-library/react';

describe('RetentionChart', () => {
  it('renders empty state with no data', () => {
    const { container } = renderWithProviders(
      <RetentionChart data={[]} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders "No retention data" when empty', () => {
    renderWithProviders(<RetentionChart data={[]} />);
    expect(screen.getByText('No retention data analyzed yet.')).toBeInTheDocument();
  });

  it('renders with data', () => {
    const { container } = renderWithProviders(
      <RetentionChart data={mockData} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders Cohort Retention Matrix heading with data', () => {
    renderWithProviders(<RetentionChart data={mockData} />);
    expect(screen.getByText('Cohort Retention Matrix')).toBeInTheDocument();
  });

  it('renders cohort month in table', () => {
    renderWithProviders(<RetentionChart data={mockData} />);
    expect(screen.getByText('2024-01')).toBeInTheDocument();
  });

  it('renders cohort size value in the table', () => {
    renderWithProviders(<RetentionChart data={mockData} />);
    // cohortSize 100 is rendered via toLocaleString — value is "100"
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders "User stickiness analysis" subtitle with data', () => {
    renderWithProviders(<RetentionChart data={mockData} />);
    expect(screen.getByText('User stickiness analysis over 8-week cycles')).toBeInTheDocument();
  });

  it('renders "ROLLING WINDOW" tag with data', () => {
    renderWithProviders(<RetentionChart data={mockData} />);
    expect(screen.getByText(/ROLLING WINDOW/i)).toBeInTheDocument();
  });

  it('renders retention percentage values in the table cells', () => {
    renderWithProviders(<RetentionChart data={mockData} />);
    // week1 = 80 -> "80%"
    expect(screen.getByText('80%')).toBeInTheDocument();
    // week4 = 45 -> "45%"
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('renders multiple cohort rows when given multiple data entries', () => {
    const multiData = [
      {
        cohortMonth: '2024-01',
        cohortSize: 100,
        retention: { week1: 80, week2: 60, week4: 45, week8: 30 },
      },
      {
        cohortMonth: '2024-02',
        cohortSize: 200,
        retention: { week1: 75, week2: 55, week4: 40, week8: 25 },
      },
    ];

    renderWithProviders(<RetentionChart data={multiData} />);
    expect(screen.getByText('2024-01')).toBeInTheDocument();
    expect(screen.getByText('2024-02')).toBeInTheDocument();
  });

  it('renders loading state overlay when loading prop is true', () => {
    const { container } = renderWithProviders(
      <RetentionChart data={mockData} loading={true} />
    );
    // Ant Design Table loading prop renders a Spin overlay (.ant-spin or .ant-spin-spinning)
    expect(
      container.querySelector('.ant-spin') || container.querySelector('.ant-spin-spinning')
    ).toBeInTheDocument();
  });

  it('renders week2 retention percentage in the table', () => {
    renderWithProviders(<RetentionChart data={mockData} />);
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('renders week8 retention percentage in the table', () => {
    renderWithProviders(<RetentionChart data={mockData} />);
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('renders table column headers W1, W2, W4, W8', () => {
    renderWithProviders(<RetentionChart data={mockData} />);
    expect(screen.getAllByText('W1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('W2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('W4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('W8').length).toBeGreaterThan(0);
  });

  it('renders COHORT and SIZE column headers', () => {
    renderWithProviders(<RetentionChart data={mockData} />);
    expect(screen.getAllByText('COHORT').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SIZE').length).toBeGreaterThan(0);
  });

  it('does not show loading overlay when loading is false (default)', () => {
    const { container } = renderWithProviders(
      <RetentionChart data={mockData} />
    );
    const spinOverlay = container.querySelector('.ant-spin-spinning');
    expect(spinOverlay).not.toBeInTheDocument();
  });
});
