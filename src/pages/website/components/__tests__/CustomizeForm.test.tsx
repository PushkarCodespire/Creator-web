vi.mock('../../WebsiteCreateAI.module.css', () => ({
  default: {},
}));

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../../__tests__/helpers/renderWithProviders';
import { CustomizeForm } from '../CustomizeForm';

const unauthState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
};

const authState = {
  auth: {
    user: { id: '1', name: 'Test Creator', email: 'c@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('CustomizeForm', () => {
  it('renders without crashing (unauthenticated)', () => {
    const { container } = renderWithProviders(<CustomizeForm />, {
      preloadedState: unauthState,
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders for authenticated user', () => {
    const { container } = renderWithProviders(<CustomizeForm onAction={vi.fn()} />, {
      preloadedState: authState,
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders "Your name" placeholder when unauthenticated', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
  });

  it('renders "Your expertise" placeholder', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    expect(screen.getByPlaceholderText(/Your expertise/)).toBeInTheDocument();
  });

  it('renders "About you..." textarea', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    expect(screen.getByPlaceholderText('About you...')).toBeInTheDocument();
  });

  it('renders "Topics" input placeholder', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    expect(screen.getByPlaceholderText(/Topics/)).toBeInTheDocument();
  });

  it('renders "Preview AI" button', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    expect(screen.getByText('Preview AI')).toBeInTheDocument();
  });

  it('renders "Start Chat" button', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    expect(screen.getByText('Start Chat')).toBeInTheDocument();
  });

  it('renders "Voice Clone" label', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    expect(screen.getByText('Voice Clone')).toBeInTheDocument();
  });

  it('pre-fills name for authenticated user', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: authState });
    const nameInput = screen.getByPlaceholderText('Your name') as HTMLInputElement;
    expect(nameInput.value).toBe('Test Creator');
  });

  it('renders "Add common questions..." FAQ input placeholder', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    expect(screen.getByPlaceholderText('Add common questions...')).toBeInTheDocument();
  });

  it('renders "+" button to add FAQ', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
  });

  it('name input is disabled when authenticated', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: authState });
    const nameInput = screen.getByPlaceholderText('Your name') as HTMLInputElement;
    expect(nameInput).toBeDisabled();
  });

  it('name input is enabled when unauthenticated', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    const nameInput = screen.getByPlaceholderText('Your name') as HTMLInputElement;
    expect(nameInput).not.toBeDisabled();
  });

  it('renders "Ask Anything" placeholder in the preview chat bar', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    expect(screen.getByPlaceholderText('Ask Anything')).toBeInTheDocument();
  });

  it('calls onAction with form data when Preview AI button is clicked', () => {
    const onAction = vi.fn();
    renderWithProviders(<CustomizeForm onAction={onAction} />, { preloadedState: unauthState });
    fireEvent.click(screen.getByText('Preview AI'));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({ name: '', expertise: '', about: '', topics: '', faqs: [] })
    );
  });

  it('calls onAction with form data when Start Chat button is clicked', () => {
    const onAction = vi.fn();
    renderWithProviders(<CustomizeForm onAction={onAction} />, { preloadedState: unauthState });
    fireEvent.click(screen.getByText('Start Chat'));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('renders "Upload your photo" and "Click to browse" in the image upload area', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    expect(screen.getByText('Upload your photo')).toBeInTheDocument();
    expect(screen.getByText('Click to browse')).toBeInTheDocument();
  });

  it('allows typing in the expertise field', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    const expertiseInput = screen.getByPlaceholderText(/Your expertise/) as HTMLInputElement;
    fireEvent.change(expertiseInput, { target: { value: 'Nutrition Coach' } });
    expect(expertiseInput.value).toBe('Nutrition Coach');
  });

  it('allows typing in the about textarea', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    const aboutInput = screen.getByPlaceholderText('About you...') as HTMLTextAreaElement;
    fireEvent.change(aboutInput, { target: { value: 'I help people lose weight.' } });
    expect(aboutInput.value).toBe('I help people lose weight.');
  });

  it('allows typing in the topics field', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    const topicsInput = screen.getByPlaceholderText(/Topics/) as HTMLInputElement;
    fireEvent.change(topicsInput, { target: { value: 'Nutrition, Weight Loss' } });
    expect(topicsInput.value).toBe('Nutrition, Weight Loss');
  });

  it('allows unauthenticated user to type in the name field', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    const nameInput = screen.getByPlaceholderText('Your name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    expect(nameInput.value).toBe('Jane');
  });

  it('does not update name field when authenticated user types (input is disabled)', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: authState });
    const nameInput = screen.getByPlaceholderText('Your name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Hacker' } });
    // value stays as original name since the onChange guard prevents update when authenticated
    expect(nameInput.value).toBe('Test Creator');
  });

  it('adds an FAQ tag when + button is clicked with text in the FAQ input', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    const faqInput = screen.getByPlaceholderText('Add common questions...') as HTMLInputElement;
    fireEvent.change(faqInput, { target: { value: 'How do I lose weight?' } });
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getByText('How do I lose weight? ×')).toBeInTheDocument();
  });

  it('adds an FAQ tag when Enter is pressed in the FAQ input', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    const faqInput = screen.getByPlaceholderText('Add common questions...') as HTMLInputElement;
    fireEvent.change(faqInput, { target: { value: 'What should I eat?' } });
    fireEvent.keyDown(faqInput, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText('What should I eat? ×')).toBeInTheDocument();
  });

  it('removes an FAQ tag when clicking it', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    const faqInput = screen.getByPlaceholderText('Add common questions...') as HTMLInputElement;
    fireEvent.change(faqInput, { target: { value: 'Remove me?' } });
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    const faqTag = screen.getByText('Remove me? ×');
    fireEvent.click(faqTag);
    expect(screen.queryByText('Remove me? ×')).not.toBeInTheDocument();
  });

  it('does not add FAQ when input is empty', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    // No FAQ chip should appear — the FAQ chips section only renders when faqs.length > 0
    expect(screen.queryByTitle('Click to remove')).not.toBeInTheDocument();
  });

  it('clears the FAQ input after adding a tag', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    const faqInput = screen.getByPlaceholderText('Add common questions...') as HTMLInputElement;
    fireEvent.change(faqInput, { target: { value: 'A question' } });
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    expect(faqInput.value).toBe('');
  });

  it('calls onAction with updated name when unauthenticated user fills form then clicks Preview AI', () => {
    const onAction = vi.fn();
    renderWithProviders(<CustomizeForm onAction={onAction} />, { preloadedState: unauthState });
    const nameInput = screen.getByPlaceholderText('Your name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    fireEvent.click(screen.getByText('Preview AI'));
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane' }));
  });

  it('toggles Voice Clone switch when clicked', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('limits FAQs to 8 items', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    const faqInput = screen.getByPlaceholderText('Add common questions...') as HTMLInputElement;
    for (let i = 1; i <= 9; i++) {
      fireEvent.change(faqInput, { target: { value: `Question ${i}` } });
      fireEvent.click(screen.getByRole('button', { name: '+' }));
    }
    // Max 8 FAQs — 9th should not appear
    expect(screen.queryByText('Question 9 ×')).not.toBeInTheDocument();
    expect(screen.getByText('Question 8 ×')).toBeInTheDocument();
  });

  it('renders "Clone your voice for audio responses" subtitle', () => {
    renderWithProviders(<CustomizeForm />, { preloadedState: unauthState });
    expect(screen.getByText('Clone your voice for audio responses')).toBeInTheDocument();
  });
});
