import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  trendingApi: {
    getTrendingStats: vi.fn().mockResolvedValue({
      data: { data: { totalPosts: 100, totalCreators: 50 } },
    }),
  },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../../components/Trending/TrendingWidget', () => ({
  default: () => <div data-testid="trending-widget">Trending Widget</div>,
}));

vi.mock('../../styles/tokens', () => ({
  colors: {
    primary: { solid: '#1268FF', subtle: '#E8F0FE' },
    text: { primary: '#111827', secondary: '#6B7280', tertiary: '#9CA3AF' },
    gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB' },
  },
  spacing: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px' },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

import { TrendingPage } from '../Trending';

describe('TrendingPage', () => {
  it('renders without crashing', () => {
    renderWithProviders(<TrendingPage />);
    expect(screen.getByText('Trending Now')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    renderWithProviders(<TrendingPage />);
    expect(screen.getByText(/Discover what's hot/i)).toBeInTheDocument();
  });

  it('shows loading state for stats', () => {
    renderWithProviders(<TrendingPage />);
    // Initially loading stats, spinner should be present
    expect(document.querySelector('.ant-spin')).toBeTruthy();
  });
});
