import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const mockDiscoverCreators = vi.fn().mockResolvedValue({
  data: {
    data: {
      creators: [
        { id: 'c1', displayName: 'FitnessGuru', category: 'Fitness', isVerified: true, profileImage: '/img.png', totalChats: 50, rating: 4.8 },
      ],
      pagination: { total: 1 },
    },
  },
});

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  companyApi: { discoverCreators: mockDiscoverCreators },
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

import CompanyDiscover from '../CompanyDiscover';

describe('CompanyDiscover', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(screen.getByText('Discover Creators')).toBeInTheDocument();
    });
  });

  it('renders subtitle', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(screen.getByText(/Find the perfect talent/i)).toBeInTheDocument();
    });
  });

  it('renders creators after data loads', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(screen.getByText('FitnessGuru')).toBeInTheDocument();
    });
  });

  it('renders View Profile buttons', async () => {
    renderWithProviders(<CompanyDiscover />);
    await waitFor(() => {
      expect(screen.getByText('View Profile')).toBeInTheDocument();
    });
  });

  it('calls API with default params', () => {
    renderWithProviders(<CompanyDiscover />);
    expect(mockDiscoverCreators).toHaveBeenCalledWith(
      expect.objectContaining({ verified: 'true', page: 1 }),
    );
  });
});
