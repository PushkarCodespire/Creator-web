import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }) },
  authApi: {
    becomeCreator: vi.fn().mockResolvedValue({ data: { data: { user: {}, token: 'tok' } } }),
  },
  getImageUrl: vi.fn((p: string) => p),
}));

import WebsiteBecomeCreator from '../WebsiteBecomeCreator';

const authenticatedState = {
  auth: {
    user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'USER' as const },
    token: 'test-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('WebsiteBecomeCreator', () => {
  it('renders without crashing when authenticated as USER', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByText('Become a Creator')).toBeInTheDocument();
  });

  it('renders greeting with user name', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByText(/Hi Test!/i)).toBeInTheDocument();
  });

  it('renders form fields', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByPlaceholderText(/Weight loss expert/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tell us about your experience/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nutrition, Weight Loss/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByText('Continue to Setup')).toBeInTheDocument();
  });

  it('renders footer note', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByText(/You can always update these later/i)).toBeInTheDocument();
  });

  it('renders the Your Expertise label', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByText('Your Expertise')).toBeInTheDocument();
  });

  it('renders the About You label', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByText('About You')).toBeInTheDocument();
  });

  it('renders the Topics You Cover label', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    expect(screen.getByText('Topics You Cover')).toBeInTheDocument();
  });

  it('typing in the expertise input updates its value', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    const expertiseInput = screen.getByPlaceholderText(/Weight loss expert/i) as HTMLInputElement;
    fireEvent.change(expertiseInput, { target: { value: 'Yoga Coach' } });
    expect(expertiseInput.value).toBe('Yoga Coach');
  });

  it('typing in the about textarea updates its value', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    const aboutTextarea = screen.getByPlaceholderText(/Tell us about your experience/i) as HTMLTextAreaElement;
    fireEvent.change(aboutTextarea, { target: { value: 'I have 10 years of experience.' } });
    expect(aboutTextarea.value).toBe('I have 10 years of experience.');
  });

  it('typing in the topics input updates its value', () => {
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    const topicsInput = screen.getByPlaceholderText(/Nutrition, Weight Loss/i) as HTMLInputElement;
    fireEvent.change(topicsInput, { target: { value: 'Yoga, Meditation' } });
    expect(topicsInput.value).toBe('Yoga, Meditation');
  });

  it('shows "Setting up..." on the button while the API call is in-flight', async () => {
    // Make the API call hang so we can observe the loading state
    const { authApi } = await import('../../../services/api');
    (authApi.becomeCreator as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(() => {})
    );
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    const button = screen.getByText('Continue to Setup');
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Setting up...')).toBeInTheDocument();
    });
  });

  it('button is disabled while loading', async () => {
    const { authApi } = await import('../../../services/api');
    (authApi.becomeCreator as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(() => {})
    );
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    fireEvent.click(screen.getByText('Continue to Setup'));
    await waitFor(() => {
      expect(screen.getByText('Setting up...')).toBeDisabled();
    });
  });

  it('shows an error message when the API call fails', async () => {
    const { authApi } = await import('../../../services/api');
    (authApi.becomeCreator as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      response: { data: { error: { message: 'Server error occurred' } } },
    });
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    fireEvent.click(screen.getByText('Continue to Setup'));
    await waitFor(() => {
      expect(screen.getByText('Server error occurred')).toBeInTheDocument();
    });
  });

  it('shows "Something went wrong" fallback when API error has no message', async () => {
    const { authApi } = await import('../../../services/api');
    (authApi.becomeCreator as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
    renderWithProviders(<WebsiteBecomeCreator />, { preloadedState: authenticatedState });
    fireEvent.click(screen.getByText('Continue to Setup'));
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
