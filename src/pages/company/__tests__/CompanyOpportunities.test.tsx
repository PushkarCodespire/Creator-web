import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const mockGetDashboard = vi.fn().mockResolvedValue({
  data: {
    data: {
      opportunities: [
        { id: '1', title: 'Ambassador Campaign', description: 'Desc', type: 'BRAND_AMBASSADOR', status: 'OPEN', budget: 10000, _count: { applications: 3 } },
      ],
    },
  },
});

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  companyApi: { getDashboard: mockGetDashboard },
  opportunityApi: {
    create: vi.fn().mockResolvedValue({ data: {} }),
    update: vi.fn().mockResolvedValue({ data: {} }),
    cancel: vi.fn().mockResolvedValue({ data: { data: { autoRejectedCount: 0 } } }),
  },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../../../styles/tokens', () => ({
  colors: {
    primary: { solid: '#1268FF', subtle: '#E8F0FE', gradient: 'linear-gradient(135deg, #1268FF, #7C3AED)' },
    text: { primary: '#111827', secondary: '#6B7280', tertiary: '#9CA3AF' },
    gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB' },
    success: { solid: '#10B981' },
  },
  spacing: {},
  shadows: { sm: 'none', md: 'none', lg: 'none', xl: 'none' },
  typography: { fontWeight: { bold: 700 } },
  borderRadius: {},
}));

vi.mock('../../../utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

import CompanyOpportunities from '../CompanyOpportunities';

describe('CompanyOpportunities', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<CompanyOpportunities />);
    await waitFor(() => {
      expect(screen.getByText('My Opportunities')).toBeInTheDocument();
    });
  });

  it('renders subtitle', async () => {
    renderWithProviders(<CompanyOpportunities />);
    await waitFor(() => {
      expect(screen.getByText(/Manage your creator collaboration/i)).toBeInTheDocument();
    });
  });

  it('renders Create Opportunity button', async () => {
    renderWithProviders(<CompanyOpportunities />);
    await waitFor(() => {
      expect(screen.getByText('Create Opportunity')).toBeInTheDocument();
    });
  });

  it('renders opportunity data in table', async () => {
    renderWithProviders(<CompanyOpportunities />);
    await waitFor(() => {
      expect(screen.getByText('Ambassador Campaign')).toBeInTheDocument();
    });
  });
});
