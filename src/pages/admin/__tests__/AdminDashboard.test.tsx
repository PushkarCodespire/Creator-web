import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../services/api', () => ({
  adminApi: {
    getStats: vi.fn().mockResolvedValue({
      data: {
        data: {
          overview: {
            totalUsers: 1500,
            totalCreators: 50,
            totalCompanies: 10,
            totalConversations: 5000,
            totalRevenue: 250000,
          },
          growth: {
            weekly: [
              { label: 'Mon', users: 10, creators: 2 },
            ],
          },
          topPerformers: {
            creators: [],
            companies: [],
          },
          engagement: {
            avgMessagesPerUser: 12,
            avgSessionDuration: 300,
          },
          recentActivity: {
            newUsers: [],
            newCreators: [],
          },
          kpis: {
            mau: 800,
            dau: 200,
          },
        },
      },
    }),
  },
}));

vi.mock('../../../components/common/DashboardContentLoader', () => ({
  default: () => <div data-testid="dashboard-loader">Loading...</div>,
}));

import AdminDashboard from '../AdminDashboard';

describe('AdminDashboard', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByTestId('dashboard-loader')).toBeInTheDocument();
  });

  it('renders the admin dashboard after data loads', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Platform Intelligence')).toBeInTheDocument();
    });
  });

  it('renders overview stat cards', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    expect(screen.getByText('Creators')).toBeInTheDocument();
  });
});
