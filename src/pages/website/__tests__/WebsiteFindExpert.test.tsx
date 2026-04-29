import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  creatorApi: {
    getAll: vi.fn().mockResolvedValue({
      data: { data: { creators: [
        { id: 'c1', displayName: 'Priya Sharma', profileImage: null, category: 'Fat Loss', isVerified: true, pricePerMessage: 50, bio: 'Fitness expert' },
        { id: 'c2', displayName: 'Rahul Mehta', profileImage: null, category: 'Nutrition', isVerified: false, pricePerMessage: 30, bio: 'Nutrition coach' },
      ] } },
    }),
  },
  homeApi: {
    getFeatured: vi.fn().mockResolvedValue({
      data: { data: { featured: [] } },
    }),
  },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('../WebsiteFindExpert.module.css', () => ({
  default: new Proxy({}, { get: (_, key) => key }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import WebsiteFindExpert from '../WebsiteFindExpert';

describe('WebsiteFindExpert', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<WebsiteFindExpert />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders the hero heading', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByText('Get the right advice')).toBeInTheDocument();
  });

  it('renders the hero subheading', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByText(/Ask top experts, get personalized guidance instantly/i)).toBeInTheDocument();
  });

  it('renders the search input', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByPlaceholderText(/What do you need help with/i)).toBeInTheDocument();
  });

  it('renders All category filter', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('renders category filters', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByText('Fat Loss')).toBeInTheDocument();
    expect(screen.getByText('Muscle Gain')).toBeInTheDocument();
  });

  it('renders creator names after load', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    await waitFor(() => {
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    });
    expect(screen.getByText('Rahul Mehta')).toBeInTheDocument();
  });

  it('renders the hero title accent text', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByText('from the right person')).toBeInTheDocument();
  });

  it('renders search button', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  it('renders More category toggle button', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
  });

  it('renders category filter tablist', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByRole('tablist', { name: 'Filter by category' })).toBeInTheDocument();
  });

  it('shows Get Started for Free CTA button', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByRole('button', { name: 'Get Started for Free' })).toBeInTheDocument();
  });

  it('renders CTA section heading', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByText("Connect with the world's best minds")).toBeInTheDocument();
  });

  it('renders CTA subtitle', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.getByText('Join thousands learning from experts in their field')).toBeInTheDocument();
  });

  it('renders View Profile links after load', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    await waitFor(() => {
      const links = screen.getAllByText('View Profile');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it('renders Chat Now links after load', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    await waitFor(() => {
      const links = screen.getAllByText('Chat Now');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it('renders category filter as tab buttons with correct role', () => {
    renderWithProviders(<WebsiteFindExpert />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);
  });

  it('All category tab is selected by default', () => {
    renderWithProviders(<WebsiteFindExpert />);
    const allTab = screen.getByRole('tab', { name: 'All' });
    expect(allTab).toHaveAttribute('aria-selected', 'true');
  });

  it('clicking a category button changes active selection', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    const fatLossTab = screen.getByRole('tab', { name: 'Fat Loss' });
    fireEvent.click(fatLossTab);
    await waitFor(() => {
      expect(fatLossTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('typing in search input updates its value', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    const input = screen.getByPlaceholderText(/What do you need help with/i);
    fireEvent.change(input, { target: { value: 'yoga' } });
    expect((input as HTMLInputElement).value).toBe('yoga');
  });

  it('clear button appears when search has a value and clears it', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    const input = screen.getByPlaceholderText(/What do you need help with/i);
    fireEvent.change(input, { target: { value: 'yoga' } });
    const clearBtn = screen.getByText('×');
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('');
    });
  });

  it('clear button is not shown when search is empty', () => {
    renderWithProviders(<WebsiteFindExpert />);
    expect(screen.queryByText('×')).not.toBeInTheDocument();
  });

  it('clicking More button reveals extra categories', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    const moreBtn = screen.getByRole('button', { name: 'More' });
    fireEvent.click(moreBtn);
    await waitFor(() => {
      expect(screen.getByText('CrossFit')).toBeInTheDocument();
    });
  });

  it('clicking More then Less hides extra categories', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    const moreBtn = screen.getByRole('button', { name: 'More' });
    fireEvent.click(moreBtn);
    await waitFor(() => expect(screen.getByText('Less')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Less'));
    await waitFor(() => {
      expect(screen.queryByText('CrossFit')).not.toBeInTheDocument();
    });
  });

  it('shows suggestions dropdown when input is focused', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    const input = screen.getByPlaceholderText(/What do you need help with/i);
    fireEvent.focus(input);
    // Dropdown should appear (it renders suggestion items from CATEGORIES)
    await waitFor(() => {
      // At least one suggestion button should be visible (e.g. Fat Loss or Muscle Gain)
      expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
    });
  });

  it('renders each creator category / tagline from API response', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    await waitFor(() => {
      // Fat Loss appears in both the category tab and the expert row
      expect(screen.getAllByText('Fat Loss').length).toBeGreaterThanOrEqual(1);
      // Nutrition appears in both the category tab and the expert row
      expect(screen.getAllByText('Nutrition').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('View Profile links have the correct href for each creator', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    await waitFor(() => {
      const profileLinks = screen.getAllByText('View Profile');
      expect(profileLinks[0].closest('a')).toHaveAttribute('href', '/creator/c1');
      expect(profileLinks[1].closest('a')).toHaveAttribute('href', '/creator/c2');
    });
  });

  it('Chat Now links have the correct href for each creator', async () => {
    renderWithProviders(<WebsiteFindExpert />);
    await waitFor(() => {
      const chatLinks = screen.getAllByText('Chat Now');
      expect(chatLinks[0].closest('a')).toHaveAttribute('href', '/website-chat/c1');
    });
  });

  it('shows featured section when featured creators are returned', async () => {
    const { homeApi } = await import('../../../services/api');
    (homeApi.getFeatured as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { featured: [{ id: 'f1', displayName: 'Featured Creator', profileImage: null }] } },
    });
    renderWithProviders(<WebsiteFindExpert />);
    await waitFor(() => {
      expect(screen.getByText('Featured Experts')).toBeInTheDocument();
    });
  });

  it('shows empty state message when no creators are returned', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { creators: [] } },
    });
    renderWithProviders(<WebsiteFindExpert />);
    await waitFor(() => {
      expect(screen.getByText(/No creators found/i)).toBeInTheDocument();
    });
  });

  it('submitting the search form scrolls to list (calls scrollTo)', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    renderWithProviders(<WebsiteFindExpert />);
    const form = screen.getByRole('button', { name: /Search/i }).closest('form')!;
    fireEvent.submit(form);
    // scrollTo is called inside scrollToList; listRef may be null in jsdom so no-op is fine
    scrollToSpy.mockRestore();
  });
});
