vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../../services/api', () => ({
  gamificationApi: {
    getLeaderboard: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../common/DashboardContentLoader', () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import Leaderboard from '../Leaderboard';
import { gamificationApi } from '../../../services/api';

describe('Leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Leaderboard />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders "Leaderboard" heading', async () => {
    renderWithProviders(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    });
  });

  it('renders "Top performers this week" subtitle', async () => {
    renderWithProviders(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('Top performers this week')).toBeInTheDocument();
    });
  });

  it('renders "Top Users" tab', async () => {
    renderWithProviders(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('Top Users')).toBeInTheDocument();
    });
  });

  it('renders "Top Creators" tab', async () => {
    renderWithProviders(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('Top Creators')).toBeInTheDocument();
    });
  });

  it('shows empty state when no data', async () => {
    (gamificationApi.getLeaderboard as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: [] },
    });
    renderWithProviders(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('No data available yet')).toBeInTheDocument();
    });
  });

  it('renders leaderboard entries when data available', async () => {
    (gamificationApi.getLeaderboard as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: [
          { id: 'u1', name: 'Top User', totalPoints: 1000, conversationsCount: 50, avatar: null },
        ],
      },
    });
    renderWithProviders(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('Top User')).toBeInTheDocument();
    });
  });

  it('calls getLeaderboard for both users and creators on mount', async () => {
    renderWithProviders(<Leaderboard />);
    await waitFor(() => {
      expect(gamificationApi.getLeaderboard).toHaveBeenCalledWith('users');
      expect(gamificationApi.getLeaderboard).toHaveBeenCalledWith('creators');
    });
  });

  it('shows loader while fetching data', () => {
    // Keep the promise pending so loading stays true
    (gamificationApi.getLeaderboard as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Leaderboard />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders points for user entries', async () => {
    (gamificationApi.getLeaderboard as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: [
          { id: 'u1', name: 'Top User', totalPoints: 1500, conversationsCount: 30, avatar: null },
        ],
      },
    });
    renderWithProviders(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('1,500 pts')).toBeInTheDocument();
    });
  });

  it('renders conversations count for user entries', async () => {
    (gamificationApi.getLeaderboard as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: [
          { id: 'u1', name: 'Top User', totalPoints: 1000, conversationsCount: 42, avatar: null },
        ],
      },
    });
    renderWithProviders(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  it('renders multiple leaderboard entries', async () => {
    (gamificationApi.getLeaderboard as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: [
          { id: 'u1', name: 'Alice', totalPoints: 900, conversationsCount: 10, avatar: null },
          { id: 'u2', name: 'Bob', totalPoints: 800, conversationsCount: 8, avatar: null },
          { id: 'u3', name: 'Charlie', totalPoints: 700, conversationsCount: 6, avatar: null },
        ],
      },
    });
    renderWithProviders(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });
  });

  it('renders growth percentage when entry has growthPercent', async () => {
    (gamificationApi.getLeaderboard as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: [
          { id: 'u1', name: 'Alice', totalPoints: 900, conversationsCount: 10, growthPercent: 12, avatar: null },
        ],
      },
    });
    renderWithProviders(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('12%')).toBeInTheDocument();
    });
  });
});
