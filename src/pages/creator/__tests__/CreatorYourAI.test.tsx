import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  creatorApi: {
    updateProfile: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  contentApi: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: {
          contents: [
            { id: '1', title: 'YouTube Video', type: 'YOUTUBE_VIDEO', status: 'COMPLETED', _count: { chunks: 5 }, createdAt: '2026-01-01' },
          ],
          pagination: { total: 1, page: 1, limit: 20 },
        },
      },
    }),
    getVoiceClone: vi.fn().mockResolvedValue({
      data: { data: { status: 'READY' } },
    }),
    getAiSummary: vi.fn().mockResolvedValue({
      data: { data: { summary: 'AI summary text' } },
    }),
    previewYouTube: vi.fn().mockResolvedValue({ data: { data: { title: 'Preview' } } }),
    addYouTube: vi.fn().mockResolvedValue({ data: { data: { id: '2' } } }),
    addManual: vi.fn().mockResolvedValue({ data: { data: { id: '3' } } }),
    addFAQ: vi.fn().mockResolvedValue({ data: { data: { id: '4' } } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
    retrain: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

import CreatorYourAI from '../CreatorYourAI';

const preloadedState = {
  auth: {
    user: {
      name: 'Test Creator',
      creator: {
        id: 'c1',
        aiTone: 'friendly',
        aiPersonality: 'helpful',
        welcomeMessage: 'Welcome!',
      },
    } as any,
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('CreatorYourAI', () => {
  it('renders the page without crashing', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('renders knowledge base content after data loads', async () => {
    renderWithProviders(<CreatorYourAI />, { preloadedState });

    await waitFor(() => {
      expect(screen.getByText('YouTube Video')).toBeInTheDocument();
    });
  });
});
