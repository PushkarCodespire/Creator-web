import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../services/api', () => ({
  adminApi: {
    getHomeCreators: vi.fn().mockResolvedValue({ data: { data: [] } }),
    updateHomeFeatured: vi.fn().mockResolvedValue({ data: {} }),
  },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn(), Link: ({ children, to, ...p }: any) => <a href={to} {...p}>{children}</a> };
});

import { screen, waitFor, fireEvent } from '@testing-library/react';
import AdminHomePage from '../AdminHomePage';

describe('AdminHomePage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<AdminHomePage />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders "Admin Page" label in header', () => {
    renderWithProviders(<AdminHomePage />);
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  it('renders "Back to Home" link', () => {
    renderWithProviders(<AdminHomePage />);
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });

  it('renders "Logout" button', () => {
    renderWithProviders(<AdminHomePage />);
    // The button text is "Log out" (with space)
    expect(screen.getByText(/Log\s*out/i)).toBeInTheDocument();
  });

  it('shows content after data loads', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      // Loading finished, content area renders
      expect(screen.getByText('Admin Page')).toBeInTheDocument();
    });
  });

  it('renders the main title section after loading', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(document.querySelector('header')).toBeTruthy();
    });
  });

  it('renders Main Highlight section after data loads', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByText('Main Highlight')).toBeInTheDocument();
    });
  });

  it('renders Featured Creators section label after data loads', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByText('Featured Creators')).toBeInTheDocument();
    });
  });

  it('shows empty creators message when no creators returned', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByText('No active creators available.')).toBeInTheDocument();
    });
  });

  it('renders Save Changes button after data loads', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
  });

  it('renders hint text when no featured creators exist', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(
        screen.getByText('Mark creators as featured below to make them available here.')
      ).toBeInTheDocument();
    });
  });

  it('calls getHomeCreators on mount', async () => {
    const { adminApi } = await import('../../../services/api');
    const before = (adminApi.getHomeCreators as ReturnType<typeof vi.fn>).mock.calls.length;
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect((adminApi.getHomeCreators as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(before);
    });
  });

  it('shows error message when save attempted with no featured creators', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => expect(screen.getByText('Save Changes')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Save Changes'));
    await waitFor(() => {
      expect(screen.getByText('Select at least one creator to feature')).toBeInTheDocument();
    });
  });

  // ── NEW TESTS ────────────────────────────────────────────────────────────────

  it('renders a sticky header with the correct role', async () => {
    renderWithProviders(<AdminHomePage />);
    const header = document.querySelector('header');
    expect(header).toBeTruthy();
  });

  it('Back to Home link has href="/"', async () => {
    renderWithProviders(<AdminHomePage />);
    const link = screen.getByText('Back to Home').closest('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('/');
  });

  it('renders the page sub-description about curating creators', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByText(/Curate the creators shown on the public home page/i)).toBeInTheDocument();
    });
  });

  it('renders Main Highlight description text', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByText(/single large creator/i)).toBeInTheDocument();
    });
  });

  it('renders the None option in the main highlight dropdown', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByText('— None —')).toBeInTheDocument();
    });
  });

  it('renders Featured Creators description text', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByText(/Orders 1–3 show in the home page hero/i)).toBeInTheDocument();
    });
  });

  it('Save Changes button is not disabled before saving', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      const btn = screen.getByText('Save Changes').closest('button') as HTMLButtonElement;
      expect(btn?.disabled).toBe(false);
    });
  });

  it('renders Log out as a button element', () => {
    renderWithProviders(<AdminHomePage />);
    const btn = screen.getByText(/Log\s*out/i).closest('button');
    expect(btn).toBeTruthy();
  });

  it('renders the Admin h1 heading after loading', async () => {
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Admin' })).toBeInTheDocument();
    });
  });

  it('shows a list of creators when data includes creators', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getHomeCreators as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'c1', displayName: 'Tech Guru', category: 'Tech', tagline: 'Code daily', profileImage: null, isFeatured: false, featuredOrder: null, isMainHighlight: false },
        ],
      },
    });
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByText('Tech Guru')).toBeInTheDocument();
    });
  });

  it('shows the category of a creator in the list', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getHomeCreators as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'c2', displayName: 'Fitness Pro', category: 'Fitness', tagline: null, profileImage: null, isFeatured: false, featuredOrder: null, isMainHighlight: false },
        ],
      },
    });
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByText('Fitness')).toBeInTheDocument();
    });
  });

  it('renders the feature toggle button for each creator', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getHomeCreators as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'c3', displayName: 'Art Creator', category: null, tagline: null, profileImage: null, isFeatured: false, featuredOrder: null, isMainHighlight: false },
        ],
      },
    });
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      const featureBtn = screen.getByLabelText('Feature Art Creator');
      expect(featureBtn).toBeTruthy();
    });
  });

  it('toggling a creator to featured marks the button as aria-pressed', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getHomeCreators as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'c4', displayName: 'Music Star', category: null, tagline: null, profileImage: null, isFeatured: false, featuredOrder: null, isMainHighlight: false },
        ],
      },
    });
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => expect(screen.getByText('Music Star')).toBeInTheDocument());
    const featureBtn = screen.getByLabelText('Feature Music Star');
    fireEvent.click(featureBtn);
    await waitFor(() => {
      expect(featureBtn.getAttribute('aria-pressed')).toBe('true');
    });
  });

  it('featured creator appears in main highlight dropdown options', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getHomeCreators as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'c5', displayName: 'Cooking Queen', category: 'Food', tagline: null, profileImage: null, isFeatured: false, featuredOrder: null, isMainHighlight: false },
        ],
      },
    });
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => expect(screen.getByText('Cooking Queen')).toBeInTheDocument());
    // Feature the creator
    fireEvent.click(screen.getByLabelText('Feature Cooking Queen'));
    await waitFor(() => {
      // The highlight select should now include this creator's name as an option
      const select = document.querySelector('select') as HTMLSelectElement;
      const options = Array.from(select.options).map((o) => o.text);
      expect(options.some((o) => o.includes('Cooking Queen'))).toBe(true);
    });
  });

  it('shows error toast when API fails to load creators', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getHomeCreators as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load creators')).toBeInTheDocument();
    });
  });

  it('calls updateHomeFeatured when saving with at least one featured creator', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getHomeCreators as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'c6', displayName: 'Travel Vlogger', category: null, tagline: null, profileImage: null, isFeatured: false, featuredOrder: null, isMainHighlight: false },
        ],
      },
    });
    (adminApi.updateHomeFeatured as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: {} });
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => expect(screen.getByText('Travel Vlogger')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Feature Travel Vlogger'));
    await waitFor(() => expect(screen.getByLabelText('Unfeature Travel Vlogger')).toBeTruthy());
    fireEvent.click(screen.getByText('Save Changes'));
    await waitFor(() => {
      expect(adminApi.updateHomeFeatured).toHaveBeenCalled();
    });
  });

  it('shows success toast after a successful save', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getHomeCreators as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        data: [
          { id: 'c7', displayName: 'Beauty Guru', category: null, tagline: null, profileImage: null, isFeatured: false, featuredOrder: null, isMainHighlight: false },
        ],
      },
    });
    (adminApi.updateHomeFeatured as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: {} });
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => expect(screen.getByText('Beauty Guru')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Feature Beauty Guru'));
    await waitFor(() => expect(screen.getByLabelText('Unfeature Beauty Guru')).toBeTruthy());
    fireEvent.click(screen.getByText('Save Changes'));
    await waitFor(() => {
      expect(screen.getByText('Home page updated')).toBeInTheDocument();
    });
  });

  it('renders the avatar initial letter for a creator without a profile image', async () => {
    const { adminApi } = await import('../../../services/api');
    (adminApi.getHomeCreators as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'c8', displayName: 'Zara Poet', category: null, tagline: null, profileImage: null, isFeatured: false, featuredOrder: null, isMainHighlight: false },
        ],
      },
    });
    renderWithProviders(<AdminHomePage />);
    await waitFor(() => {
      expect(screen.getByText('Z')).toBeInTheDocument();
    });
  });
});
