import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CreatorStats from '../CreatorStats';

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => <div />,
}));

describe('CreatorStats', () => {
  it('renders performance stats heading', () => {
    renderWithProviders(
      <CreatorStats totalChats={100} totalMessages={500} />
    );
    expect(screen.getByText('Performance Stats')).toBeInTheDocument();
  });

  it('displays response rate', () => {
    renderWithProviders(
      <CreatorStats totalChats={100} totalMessages={500} responseRate={95} />
    );
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('Response Rate')).toBeInTheDocument();
  });

  it('displays total chats', () => {
    renderWithProviders(
      <CreatorStats totalChats={42} totalMessages={200} />
    );
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Total Chats')).toBeInTheDocument();
  });

  it('displays rating when provided', () => {
    renderWithProviders(
      <CreatorStats totalChats={100} totalMessages={500} rating={4.7} />
    );
    expect(screen.getByText('4.7')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
  });

  it('displays N/A when rating is not provided', () => {
    renderWithProviders(
      <CreatorStats totalChats={100} totalMessages={500} />
    );
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('displays avg response time', () => {
    renderWithProviders(
      <CreatorStats totalChats={100} totalMessages={500} avgResponseTime={3} />
    );
    expect(screen.getByText('3s')).toBeInTheDocument();
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
  });
});
