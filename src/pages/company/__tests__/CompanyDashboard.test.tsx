import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const mockGetDashboard = vi.fn().mockResolvedValue({
  data: {
    data: {
      companyName: 'Test Corp',
      opportunities: [
        { id: '1', title: 'Brand Deal', status: 'OPEN', createdAt: '2024-01-01', _count: { applications: 5 } },
      ],
      deals: [
        { id: 'd1', status: 'IN_PROGRESS', amount: 5000, creator: { displayName: 'Creator1', profileImage: '/img.png' }, application: { opportunity: { title: 'Campaign' } } },
      ],
    },
  },
});

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  companyApi: { getDashboard: mockGetDashboard },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../../../styles/tokens', () => ({
  colors: {
    primary: { solid: '#1268FF', subtle: '#E8F0FE', gradient: 'linear-gradient(135deg, #1268FF, #7C3AED)' },
    text: { primary: '#111827', secondary: '#6B7280', tertiary: '#9CA3AF' },
    gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB' },
    success: { solid: '#10B981' },
    secondary: { solid: '#8B5CF6' },
  },
  spacing: {},
  shadows: { sm: 'none', md: 'none', lg: 'none', xl: 'none' },
  typography: { fontWeight: { bold: 700 } },
  borderRadius: {},
}));

import CompanyDashboard from '../CompanyDashboard';

describe('CompanyDashboard', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Company Dashboard')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    // Mock a delayed response
    mockGetDashboard.mockReturnValueOnce(new Promise(() => {}));
    renderWithProviders(<CompanyDashboard />);
    expect(screen.queryByText('Company Dashboard')).not.toBeInTheDocument();
  });

  it('renders company name greeting after load', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Test Corp')).toBeInTheDocument();
    });
  });

  it('renders stat cards', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Active Opportunities')).toBeInTheDocument();
      expect(screen.getByText('Total Applications')).toBeInTheDocument();
      expect(screen.getByText('Active Deals')).toBeInTheDocument();
    });
  });

  it('renders recent opportunities section', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Brand Deal')).toBeInTheDocument();
    });
  });

  it('renders active deals section', async () => {
    renderWithProviders(<CompanyDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Creator1')).toBeInTheDocument();
    });
  });
});
