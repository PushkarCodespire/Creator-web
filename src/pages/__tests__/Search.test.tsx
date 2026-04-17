import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  searchApi: {
    globalSearch: vi.fn().mockResolvedValue({
      data: { data: { results: {}, totals: {} } },
    }),
  },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../../components/Search/SearchBar', () => ({
  default: ({ onSearch }: { onSearch?: (q: string) => void }) => (
    <div data-testid="search-bar">
      <input placeholder="Search..." onChange={(e) => onSearch?.(e.target.value)} />
    </div>
  ),
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

import { SearchPage } from '../Search';

describe('SearchPage', () => {
  it('renders without crashing', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });
});
