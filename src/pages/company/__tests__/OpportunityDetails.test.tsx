import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const mockGetById = vi.fn().mockResolvedValue({
  data: {
    data: {
      id: 'opp-1',
      title: 'Brand Ambassador',
      description: 'Looking for a fitness influencer',
      type: 'BRAND_AMBASSADOR',
      category: 'Fitness',
      budget: 25000,
      status: 'OPEN',
      applications: [],
    },
  },
});

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  opportunityApi: {
    getById: mockGetById,
    rejectApplication: vi.fn().mockResolvedValue({ data: {} }),
    acceptApplication: vi.fn().mockResolvedValue({ data: {} }),
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: 'opp-1' })),
  };
});

import OpportunityDetails from '../OpportunityDetails';

describe('OpportunityDetails', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<OpportunityDetails />);
    await waitFor(() => {
      expect(screen.getByText('Brand Ambassador')).toBeInTheDocument();
    });
  });

  it('calls API with correct id', () => {
    renderWithProviders(<OpportunityDetails />);
    expect(mockGetById).toHaveBeenCalledWith('opp-1');
  });
});
