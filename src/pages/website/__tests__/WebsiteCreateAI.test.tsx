import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  authApi: { becomeCreator: vi.fn().mockResolvedValue({ data: { data: { user: {}, token: 'tok' } } }) },
  getImageUrl: vi.fn((p: string) => p),
}));

vi.mock('../components/CustomizeForm', () => ({
  CustomizeForm: ({ onAction }: { onAction: () => void }) => (
    <div data-testid="customize-form">
      <button onClick={onAction}>Mock Action</button>
    </div>
  ),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import WebsiteCreateAI from '../WebsiteCreateAI';

describe('WebsiteCreateAI', () => {
  it('renders without crashing', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Create Your/i)).toBeInTheDocument();
  });

  it('renders hero section', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Creator Pal/i)).toBeInTheDocument();
    expect(screen.getByText(/Create My AI/i)).toBeInTheDocument();
  });

  it('renders testimonials section', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    expect(screen.getByText('Sarah Miller')).toBeInTheDocument();
    expect(screen.getByText('Mike Torres')).toBeInTheDocument();
  });

  it('renders How It Works section with 3 steps', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Connect Content')).toBeInTheDocument();
    expect(screen.getByText('Tweak It')).toBeInTheDocument();
    expect(screen.getByText('Ready to Launch')).toBeInTheDocument();
  });

  it('renders Train Your AI section', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Train Your AI')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('PDFs')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('renders customize form', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByTestId('customize-form')).toBeInTheDocument();
  });

  it('renders live section', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Your CreatorPal is Live/i)).toBeInTheDocument();
  });

  it('renders disclaimer text', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Free till 31st May/i)).toBeInTheDocument();
  });

  it('renders hero subtitle text', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Turn your knowledge into an AI/i)).toBeInTheDocument();
  });

  it('renders How It Works subtitle', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Launch your AI in minutes, not months')).toBeInTheDocument();
  });

  it('renders step descriptions in How It Works', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Upload your YouTube videos, PDFs, or notes/i)).toBeInTheDocument();
  });

  it('renders Train Your AI subtitle', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Add your existing content to teach your AI')).toBeInTheDocument();
  });

  it('renders Upload documents description under PDFs', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Upload documents')).toBeInTheDocument();
  });

  it('renders Add Content button in Train Your AI section', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Add Content')).toBeInTheDocument();
  });

  it('renders Customize your profile section heading', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Customize your profile')).toBeInTheDocument();
  });

  it('renders Share Your CreatorPal button', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Share Your CreatorPal')).toBeInTheDocument();
  });

  it('renders live section subtitle about 24/7 availability', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Your fitness expertise is now available 24/7')).toBeInTheDocument();
  });

  it('renders Share on Instagram label', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Share on Instagram')).toBeInTheDocument();
  });

  it('renders testimonial role labels', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Fitness Coach')).toBeInTheDocument();
    expect(screen.getByText('Nutrition Expert')).toBeInTheDocument();
    expect(screen.getByText('Strength Coach')).toBeInTheDocument();
  });

  it('clicking Create My AI redirects unauthenticated user to /login', async () => {
    renderWithProviders(<WebsiteCreateAI />);
    fireEvent.click(screen.getByText('Create My AI'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('clicking Add Content redirects unauthenticated user to /login', async () => {
    renderWithProviders(<WebsiteCreateAI />);
    fireEvent.click(screen.getByText('Add Content'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('clicking Share Your CreatorPal redirects unauthenticated user to /login', async () => {
    renderWithProviders(<WebsiteCreateAI />);
    fireEvent.click(screen.getByText('Share Your CreatorPal'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('clicking Create My AI as authenticated CREATOR navigates to creator-dashboard/settings', async () => {
    const creatorState = {
      auth: {
        user: { id: 'u1', name: 'Creator', email: 'creator@test.com', role: 'CREATOR' as const },
        token: 'tok',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    };
    renderWithProviders(<WebsiteCreateAI />, { preloadedState: creatorState });
    fireEvent.click(screen.getByText('Create My AI'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/creator-dashboard/settings');
    });
  });

  it('clicking Create My AI as authenticated non-creator calls becomeCreator API', async () => {
    const { authApi } = await import('../../../services/api');
    const fanState = {
      auth: {
        user: { id: 'u2', name: 'Fan', email: 'fan@test.com', role: 'USER' as const },
        token: 'tok',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    };
    renderWithProviders(<WebsiteCreateAI />, { preloadedState: fanState });
    fireEvent.click(screen.getByText('Create My AI'));
    await waitFor(() => {
      expect(authApi.becomeCreator).toHaveBeenCalled();
    });
  });

  it('clicking Create My AI as fan navigates to /onboarding/creator after API success', async () => {
    const fanState = {
      auth: {
        user: { id: 'u2', name: 'Fan', email: 'fan@test.com', role: 'USER' as const },
        token: 'tok',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    };
    renderWithProviders(<WebsiteCreateAI />, { preloadedState: fanState });
    fireEvent.click(screen.getByText('Create My AI'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/onboarding/creator');
    });
  });

  it('navigates to /onboarding/creator when becomeCreator returns Already-creator error', async () => {
    const { authApi } = await import('../../../services/api');
    (authApi.becomeCreator as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      response: { data: { error: { message: 'Already a creator' } } },
    });
    const fanState = {
      auth: {
        user: { id: 'u2', name: 'Fan', email: 'fan@test.com', role: 'USER' as const },
        token: 'tok',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    };
    renderWithProviders(<WebsiteCreateAI />, { preloadedState: fanState });
    fireEvent.click(screen.getByText('Create My AI'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/onboarding/creator');
    });
  });

  it('navigates to /login when becomeCreator fails with non-Already error', async () => {
    const { authApi } = await import('../../../services/api');
    (authApi.becomeCreator as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      response: { data: { error: { message: 'Server error' } } },
    });
    const fanState = {
      auth: {
        user: { id: 'u2', name: 'Fan', email: 'fan@test.com', role: 'USER' as const },
        token: 'tok',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    };
    renderWithProviders(<WebsiteCreateAI />, { preloadedState: fanState });
    fireEvent.click(screen.getByText('Create My AI'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('renders the step description for Tweak It', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Customize personality, topics, and speaking style/i)).toBeInTheDocument();
  });

  it('renders the step description for Ready to Launch', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Share your AI with your audience/i)).toBeInTheDocument();
  });

  it('renders Import videos description under YouTube', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Import videos')).toBeInTheDocument();
  });

  it('renders Add text content description under Notes', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Add text content')).toBeInTheDocument();
  });

  it('renders live section footnote about strength training', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Fans can now ask your AI anything about strength training/i)).toBeInTheDocument();
  });

  it('renders the customize section subtitle', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText('Set up how your AI looks and sounds')).toBeInTheDocument();
  });

  it('renders Alex Chen testimonial quote', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/Best passive income builder/i)).toBeInTheDocument();
  });

  it('renders Mike Torres testimonial quote', () => {
    renderWithProviders(<WebsiteCreateAI />);
    expect(screen.getByText(/My audience gets instant answers 24\/7/i)).toBeInTheDocument();
  });

  it('CustomizeForm onAction prop triggers navigation flow for unauthenticated user', async () => {
    renderWithProviders(<WebsiteCreateAI />);
    fireEvent.click(screen.getByText('Mock Action'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
