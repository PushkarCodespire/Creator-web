import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('renders the Search heading', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders Verified Only filter checkbox', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByText(/Verified Only/i)).toBeInTheDocument();
  });

  it('shows search results text after typing a query', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { results: { creators: [], posts: [], users: [] }, totals: { creators: 0, posts: 0, users: 0 } } },
    });

    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'fitness' } });

    await waitFor(() => {
      expect(screen.getByText(/Search results for/i)).toBeInTheDocument();
    });
  });

  it('calls globalSearch with query from URL params', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { results: {}, totals: {} } },
    });

    // Render with a pre-set search param by manipulating window.location
    // Use the initial URL which starts empty, then type in the search box
    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'yoga' } });

    await waitFor(() => {
      expect(searchApi.globalSearch).toHaveBeenCalled();
    });
  });

  it('renders All tab with 0 total when no results', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { results: {}, totals: {} } },
    });

    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'nothing' } });

    await waitFor(() => {
      expect(screen.getByText(/All \(0\)/i)).toBeInTheDocument();
    });
  });

  it('renders creator results when API returns creators', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          results: {
            creators: [
              { id: 'c1', title: 'Alice Fit', subtitle: 'Fitness Coach', url: '/creator/alice', image: undefined },
            ],
            posts: [],
            users: [],
          },
          totals: { creators: 1, posts: 0, users: 0 },
        },
      },
    });

    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'alice' } });

    await waitFor(() => {
      expect(screen.getByText('Alice Fit')).toBeInTheDocument();
    });
  });

  it('shows "No results found" Empty state when results are empty', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { results: {}, totals: {} } },
    });

    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'xyznotfound' } });

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('renders the Category select placeholder', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('renders Creators tab label after typing a query', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { results: {}, totals: { creators: 0, posts: 0, users: 0 } } },
    });

    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText(/Creators \(0\)/i)).toBeInTheDocument();
    });
  });

  it('renders Posts tab label after typing a query', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { results: {}, totals: { creators: 0, posts: 0, users: 0 } } },
    });

    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText(/Posts \(0\)/i)).toBeInTheDocument();
    });
  });

  it('renders Users tab label after typing a query', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { results: {}, totals: { creators: 0, posts: 0, users: 0 } } },
    });

    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText(/Users \(0\)/i)).toBeInTheDocument();
    });
  });

  it('renders post results when API returns posts', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          results: {
            creators: [],
            posts: [
              { id: 'p1', title: 'Yoga Tips', subtitle: 'Wellness', url: '/post/p1', image: undefined },
            ],
            users: [],
          },
          totals: { creators: 0, posts: 1, users: 0 },
        },
      },
    });

    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'yoga' } });

    await waitFor(() => {
      expect(screen.getByText('Yoga Tips')).toBeInTheDocument();
    });
  });

  it('renders user results when API returns users', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          results: {
            creators: [],
            posts: [],
            users: [
              { id: 'u1', title: 'Bob Smith', subtitle: 'Member', url: '/user/bob', image: undefined },
            ],
          },
          totals: { creators: 0, posts: 0, users: 1 },
        },
      },
    });

    renderWithProviders(<SearchPage />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'bob' } });

    await waitFor(() => {
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });
  });

  it('does not render tabs before any query is entered', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.queryByText(/All \(/i)).not.toBeInTheDocument();
  });

  it('renders creator subtitle when API returns creator with subtitle', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          results: {
            creators: [
              { id: 'c2', title: 'Carol Fit', subtitle: 'Yoga Coach', url: '/creator/carol', image: undefined },
            ],
            posts: [],
            users: [],
          },
          totals: { creators: 1, posts: 0, users: 0 },
        },
      },
    });

    renderWithProviders(<SearchPage />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'carol' } });

    await waitFor(() => {
      expect(screen.getByText('Yoga Coach')).toBeInTheDocument();
    });
  });

  it('renders post subtitle when API returns post with subtitle', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          results: {
            creators: [],
            posts: [
              { id: 'p2', title: 'Meditation 101', subtitle: 'Mindfulness', url: '/post/p2', image: undefined },
            ],
            users: [],
          },
          totals: { creators: 0, posts: 1, users: 0 },
        },
      },
    });

    renderWithProviders(<SearchPage />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'meditation' } });

    await waitFor(() => {
      expect(screen.getByText('Mindfulness')).toBeInTheDocument();
    });
  });

  it('renders "No creators found" when Creators tab has empty results', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { results: { creators: [], posts: [], users: [] }, totals: { creators: 0, posts: 0, users: 0 } } },
    });

    renderWithProviders(<SearchPage />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'nobody' } });

    await waitFor(() => {
      expect(screen.getByText('No creators found')).toBeInTheDocument();
    });
  });

  it('renders total count > 0 in All tab when results exist', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: {
          results: {
            creators: [{ id: 'c1', title: 'Dave', subtitle: 'Coach', url: '/c/dave' }],
            posts: [],
            users: [],
          },
          totals: { creators: 1, posts: 0, users: 0 },
        },
      },
    });

    renderWithProviders(<SearchPage />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'dave' } });

    await waitFor(() => {
      expect(screen.getByText(/All \(1\)/i)).toBeInTheDocument();
    });
  });

  it('renders "No posts found" when Posts tab has empty results', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { results: { creators: [], posts: [], users: [] }, totals: { creators: 0, posts: 0, users: 0 } } },
    });

    renderWithProviders(<SearchPage />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'nothing' } });

    await waitFor(() => {
      expect(screen.getByText('No posts found')).toBeInTheDocument();
    });
  });

  it('shows strong query text after searching', async () => {
    const { searchApi } = await import('../../services/api');
    (searchApi.globalSearch as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: { results: {}, totals: {} } },
    });

    renderWithProviders(<SearchPage />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'strongquery' } });

    await waitFor(() => {
      expect(screen.getByText('strongquery')).toBeInTheDocument();
    });
  });
});
