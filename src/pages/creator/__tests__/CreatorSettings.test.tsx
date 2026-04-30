import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  contentApi: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: {
          contents: [
            { id: 'faq1', type: 'FAQ', title: 'What is your philosophy?', rawText: 'I believe in science-based fitness.', _count: { chunks: 1 } },
          ],
        },
      },
    }),
    addFAQ: vi.fn().mockResolvedValue({ data: { data: { id: 'faq2' } } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  creatorApi: {
    updateProfile: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

import CreatorSettings from '../CreatorSettings';

const preloadedState = {
  auth: {
    user: {
      name: 'Test Creator',
      creator: {
        id: 'creator-1',
        displayName: 'Test Creator',
        pricePerMessage: 50,
        firstMessageFree: true,
        discountFirstFive: 10,
      },
    } as any,
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('CreatorSettings', () => {
  it('renders the settings page header', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders the Change Pricing section', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.getByText('Change Pricing')).toBeInTheDocument();
  });

  it('renders the Share Your Page section', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.getByText('Share Your Page')).toBeInTheDocument();
  });

  it('renders the FAQs section', async () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.getByText('FAQs')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('What is your philosophy?')).toBeInTheDocument();
    });
  });

  it('shows Add FAQ form when button is clicked', async () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });

    const addButton = screen.getByText('Add FAQ');
    fireEvent.click(addButton);

    expect(screen.getByPlaceholderText('Question')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Answer')).toBeInTheDocument();
  });

  it('renders the profile link', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.getByText(/\/creator\//)).toBeInTheDocument();
  });

  it('saves pricing and shows success message', async () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });

    const saveButton = screen.getByText('Save Pricing');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Pricing saved!')).toBeInTheDocument();
    });
  });

  it('adds a new FAQ when Save is clicked in the form', async () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });

    // Open the add FAQ form
    fireEvent.click(screen.getByText('Add FAQ'));

    fireEvent.change(screen.getByPlaceholderText('Question'), { target: { value: 'New question?' } });
    fireEvent.change(screen.getByPlaceholderText('Answer'), { target: { value: 'New answer.' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('New question?')).toBeInTheDocument();
    });
  });

  it('cancels the Add FAQ form without adding an entry', async () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });

    fireEvent.click(screen.getByText('Add FAQ'));
    expect(screen.getByPlaceholderText('Question')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByPlaceholderText('Question')).not.toBeInTheDocument();
  });

  it('deletes a FAQ when the trash button is clicked', async () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('What is your philosophy?')).toBeInTheDocument();
    });

    // The delete button contains a Trash2 svg. All buttons that contain an svg
    // and sit inside the FAQ card row are delete candidates — pick the first one
    // that is NOT the "Add FAQ" button (which has text content).
    const allButtons = Array.from(document.querySelectorAll('button[type="button"]'));
    const deleteBtn = allButtons.find(
      (btn) => btn.querySelector('svg') && btn.textContent?.trim() === ''
        && (btn as HTMLElement).offsetParent !== null
    );
    // If jsdom layout isn't available, fall back to locating by width:30px style
    const fallback = allButtons.find(
      (btn) => btn.querySelector('svg') && (btn as HTMLElement).style.width === '30px'
    );
    const target = deleteBtn || fallback;
    expect(target).toBeTruthy();
    fireEvent.click(target!);

    await waitFor(() => {
      expect(screen.queryByText('What is your philosophy?')).not.toBeInTheDocument();
    });
  });

  it('toggles firstMessageFree when the toggle button is clicked', async () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });

    // Initially firstMessageFree is true → label shows "Yes"
    expect(screen.getByText('Yes')).toBeInTheDocument();

    // The toggle button has width:44px in its inline style
    const allButtons = Array.from(document.querySelectorAll('button[type="button"]'));
    const toggleBtn = allButtons.find(
      (btn) => (btn as HTMLElement).style.width === '44px'
    );
    expect(toggleBtn).toBeTruthy();
    fireEvent.click(toggleBtn!);

    await waitFor(() => {
      expect(screen.getByText('No')).toBeInTheDocument();
    });
  });

  it('shows empty FAQ state message when no FAQs exist', async () => {
    const { contentApi } = await import('../../../services/api');
    (contentApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { contents: [] } },
    });

    renderWithProviders(<CreatorSettings />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('No FAQs yet. Add your first one!')).toBeInTheDocument();
    });
  });

  it('renders Price Per 1000 Messages label', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.getByText(/Price Per 1000 Messages/i)).toBeInTheDocument();
  });

  it('renders First 5 Discount label', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.getByText(/First 5 Discount/i)).toBeInTheDocument();
  });

  it('renders First Message Free label', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.getByText('First Message Free')).toBeInTheDocument();
  });

  it('renders the Copy Link button in Share Your Page section', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
  });

  it('renders Share via social media link', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.getByText(/Share via social media/i)).toBeInTheDocument();
  });

  it('renders the FAQ answer text for loaded FAQ', async () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('I believe in science-based fitness.')).toBeInTheDocument();
    });
  });

  it('shows Copied! label after Copy Link is clicked', async () => {
    // navigator.clipboard needs to be mocked
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    renderWithProviders(<CreatorSettings />, { preloadedState });
    fireEvent.click(screen.getByText('Copy Link'));
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('shows Saving... text while pricing save is in progress', async () => {
    const { creatorApi } = await import('../../../services/api');
    let resolveUpdate!: () => void;
    (creatorApi.updateProfile as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      new Promise<{ data: { success: boolean } }>((resolve) => { resolveUpdate = () => resolve({ data: { success: true } }); })
    );
    renderWithProviders(<CreatorSettings />, { preloadedState });
    fireEvent.click(screen.getByText('Save Pricing'));
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    resolveUpdate();
    await waitFor(() => {
      expect(screen.queryByText('Pricing saved!')).toBeInTheDocument();
    });
  });

  it('does not show Saving... before Save Pricing is clicked', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
  });

  it('renders the pricePerMessage input with initial value from store', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    const priceInput = screen.getAllByRole('spinbutton')[0];
    expect(priceInput).toHaveValue(50);
  });

  it('renders the discountFirstFive input with initial value from store', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    const discountInput = screen.getAllByRole('spinbutton')[1];
    expect(discountInput).toHaveValue(10);
  });

  it('updates pricePerMessage input when user types a new value', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    const priceInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(priceInput, { target: { value: '200' } });
    expect(priceInput).toHaveValue(200);
  });

  it('shows error message when updateProfile API fails', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.updateProfile as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      { response: { data: { error: 'Server error' } } }
    );
    renderWithProviders(<CreatorSettings />, { preloadedState });
    fireEvent.click(screen.getByText('Save Pricing'));
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('renders views count for each loaded FAQ item', async () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    await waitFor(() => {
      expect(screen.getByText('What is your philosophy?')).toBeInTheDocument();
    });
    expect(screen.getByText(/0 views/i)).toBeInTheDocument();
  });

  it('does not submit FAQ when question field is empty', async () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    fireEvent.click(screen.getByText('Add FAQ'));
    // Only fill answer, leave question blank
    fireEvent.change(screen.getByPlaceholderText('Answer'), { target: { value: 'Some answer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    // Form should remain open since question is blank
    expect(screen.getByPlaceholderText('Question')).toBeInTheDocument();
  });

  it('renders Update prices on your programs sub-text in Change Pricing section', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.getByText(/Update prices on your programs/i)).toBeInTheDocument();
  });

  it('renders Manage frequently asked questions sub-text in FAQs section', () => {
    renderWithProviders(<CreatorSettings />, { preloadedState });
    expect(screen.getByText(/Manage frequently asked questions/i)).toBeInTheDocument();
  });
});
