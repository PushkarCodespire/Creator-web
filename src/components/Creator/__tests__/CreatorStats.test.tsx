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

  it('defaults responseRate to 100% when not provided', () => {
    renderWithProviders(
      <CreatorStats totalChats={10} totalMessages={50} />
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('defaults avgResponseTime to 0s when not provided', () => {
    renderWithProviders(
      <CreatorStats totalChats={10} totalMessages={50} />
    );
    expect(screen.getByText('0s')).toBeInTheDocument();
  });

  it('renders Topic Expertise heading when topicExpertise data is provided', () => {
    renderWithProviders(
      <CreatorStats
        totalChats={100}
        totalMessages={500}
        topicExpertise={[{ topic: 'React', percentage: 60 }, { topic: 'Node', percentage: 40 }]}
      />
    );
    expect(screen.getByText('Topic Expertise')).toBeInTheDocument();
  });

  it('does not render Topic Expertise section when topicExpertise is empty', () => {
    renderWithProviders(
      <CreatorStats totalChats={100} totalMessages={500} topicExpertise={[]} />
    );
    expect(screen.queryByText('Topic Expertise')).not.toBeInTheDocument();
  });

  it('renders User Satisfaction Trend heading when userSatisfaction data is provided', () => {
    renderWithProviders(
      <CreatorStats
        totalChats={100}
        totalMessages={500}
        userSatisfaction={[{ month: 'Jan', satisfaction: 4 }]}
      />
    );
    expect(screen.getByText('User Satisfaction Trend')).toBeInTheDocument();
  });

  it('does not render User Satisfaction Trend section when userSatisfaction is empty', () => {
    renderWithProviders(
      <CreatorStats totalChats={100} totalMessages={500} userSatisfaction={[]} />
    );
    expect(screen.queryByText('User Satisfaction Trend')).not.toBeInTheDocument();
  });

  it('displays rating formatted to one decimal place', () => {
    renderWithProviders(
      <CreatorStats totalChats={100} totalMessages={500} rating={4} />
    );
    expect(screen.getByText('4.0')).toBeInTheDocument();
  });
});
