import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const mockGetDeals = vi.fn().mockResolvedValue({
  data: {
    data: {
      deals: [
        {
          id: 'd1',
          status: 'IN_PROGRESS',
          amount: 15000,
          creator: { displayName: 'Creator One', profileImage: '/img.png' },
          application: { opportunity: { title: 'Campaign A' } },
        },
      ],
    },
  },
});

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  companyApi: {
    getDeals: mockGetDeals,
    completeDeal: vi.fn().mockResolvedValue({ data: {} }),
  },
  milestoneApi: {
    list: vi.fn().mockResolvedValue({ data: { data: { milestones: [] } } }),
    create: vi.fn().mockResolvedValue({ data: {} }),
    complete: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
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

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

import CompanyDeals from '../CompanyDeals';

describe('CompanyDeals', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Manage Deals')).toBeInTheDocument();
    });
  });

  it('renders subtitle', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText(/Track and manage your active/i)).toBeInTheDocument();
    });
  });

  it('renders deal data in table', async () => {
    renderWithProviders(<CompanyDeals />);
    await waitFor(() => {
      expect(screen.getByText('Creator One')).toBeInTheDocument();
    });
  });

  it('calls API on mount', () => {
    renderWithProviders(<CompanyDeals />);
    expect(mockGetDeals).toHaveBeenCalledWith(expect.objectContaining({ limit: 50 }));
  });
});
