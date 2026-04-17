import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import Leaderboard from '../../Gamification/Leaderboard';

const mockGetLeaderboard = vi.fn();

vi.mock('../../../services/api', () => ({
  gamificationApi: {
    getLeaderboard: (...args: any[]) => mockGetLeaderboard(...args),
  },
  getImageUrl: vi.fn((url: string) => url || ''),
}));

const mockLeaderboardUsers = [
  {
    id: 'u1',
    name: 'Alice',
    avatar: '/avatars/alice.jpg',
    totalPoints: 5000,
    conversationsCount: 42,
    growthPercent: 15,
  },
  {
    id: 'u2',
    name: 'Bob',
    avatar: '/avatars/bob.jpg',
    totalPoints: 3500,
    conversationsCount: 28,
    growthPercent: 8,
  },
  {
    id: 'u3',
    name: 'Charlie',
    avatar: '/avatars/charlie.jpg',
    totalPoints: 2200,
    conversationsCount: 15,
    growthPercent: 3,
  },
];

const mockLeaderboardCreators = [
  {
    id: 'c1',
    displayName: 'Creator One',
    avatar: '/avatars/c1.jpg',
    category: 'Fitness',
    chatsCount: 100,
    growthPercent: 20,
  },
];

describe('Leaderboard', () => {
  beforeEach(() => {
    mockGetLeaderboard.mockReset();
    mockGetLeaderboard.mockImplementation((type: string) => {
      if (type === 'users') {
        return Promise.resolve({ data: { data: mockLeaderboardUsers } });
      }
      return Promise.resolve({ data: { data: mockLeaderboardCreators } });
    });
  });

  it('renders the leaderboard title', async () => {
    renderWithProviders(<Leaderboard />);

    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByText('Top performers this week')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    // Make the API hang so loading persists
    mockGetLeaderboard.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<Leaderboard />);

    // DashboardContentLoader shows "Loading your experience..."
    expect(screen.getByText('Loading your experience...')).toBeInTheDocument();
  });

  it('renders user leaderboard entries after loading', async () => {
    renderWithProviders(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('shows growth percentages', async () => {
    renderWithProviders(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('15%')).toBeInTheDocument();
    });

    expect(screen.getByText('8%')).toBeInTheDocument();
  });

  it('renders tabs for Top Users and Top Creators', async () => {
    renderWithProviders(<Leaderboard />);

    expect(screen.getByText('Top Users')).toBeInTheDocument();
    expect(screen.getByText('Top Creators')).toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    mockGetLeaderboard.mockResolvedValue({ data: { data: [] } });

    renderWithProviders(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText('No data available yet')).toBeInTheDocument();
    });
  });
});
