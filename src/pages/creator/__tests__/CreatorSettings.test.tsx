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

});
