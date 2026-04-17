import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const mockGetAll = vi.fn().mockResolvedValue({
  data: {
    data: {
      creators: [
        { id: '1', displayName: 'Gallery Creator', category: 'Fitness', isVerified: true, profileImage: '/img.png', rating: 4.5 },
      ],
      pagination: { total: 1 },
    },
  },
});

const mockGetCategories = vi.fn().mockResolvedValue({
  data: { data: [{ name: 'Fitness', count: 10 }] },
});

vi.mock('../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  creatorApi: {
    getAll: mockGetAll,
    getCategories: mockGetCategories,
  },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../../styles/tokens', () => ({
  colors: {
    primary: { solid: '#1268FF', subtle: '#E8F0FE', gradient: 'linear-gradient(135deg, #1268FF, #7C3AED)' },
    text: { primary: '#111827', secondary: '#6B7280', tertiary: '#9CA3AF' },
    gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB' },
    success: { solid: '#10B981' },
  },
  typography: { fontWeight: { bold: 700 }, fontSize: {} },
  spacing: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px' },
  shadows: { sm: 'none', md: 'none', lg: 'none', xl: 'none' },
  borderRadius: {},
}));

vi.mock('../../styles/animations', () => ({
  pageVariants: {},
  fadeIn: {},
  staggerContainer: {},
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

vi.mock('../../components/common/Card/CustomCard', () => ({
  default: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('../../components/common/Button/CustomButton', () => ({
  default: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('../../components/common/Loading/Skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

vi.mock('../../components/common/EmptyState/EmptyState', () => ({
  EmptyState: () => <div>No creators found</div>,
}));

vi.mock('../../components/Search', () => ({
  CreatorFilters: () => <div>Filters</div>,
}));

vi.mock('../../components/Discovery/CreatorCard', () => ({
  CreatorCard: ({ creator }: any) => <div data-testid="creator-card">{creator.displayName}</div>,
}));

import CreatorGallery from '../CreatorGallery';

describe('CreatorGallery', () => {
  it('renders without crashing', () => {
    renderWithProviders(<CreatorGallery />);
    expect(document.querySelector('div')).toBeTruthy();
  });

  it('renders creators after data loads', async () => {
    renderWithProviders(<CreatorGallery />);
    await waitFor(() => {
      expect(screen.getByText('Gallery Creator')).toBeInTheDocument();
    });
  });

  it('calls API on mount', () => {
    renderWithProviders(<CreatorGallery />);
    expect(mockGetAll).toHaveBeenCalled();
  });
});
