import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../../services/api', () => ({
  creatorApi: {
    getDashboard: vi.fn().mockResolvedValue({
      data: {
        data: {
          totalChats: 50,
          stats: { totalAiAnswers: 120, aiAnswersToday: 8 },
          followers: { count: 300 },
          reviews: { summary: { averageRating: 4.2, totalReviews: 15 } },
          topQuestions: [
            { question: 'Best diet for weight loss?', count: 20 },
          ],
          contents: [
            { id: '1', type: 'YOUTUBE_VIDEO', title: 'Workout Guide' },
            { id: '2', type: 'MANUAL_TEXT', title: 'Nutrition Tips' },
          ],
        },
      },
    }),
  },
  contentApi: {
    getVoiceClone: vi.fn().mockResolvedValue({
      data: { data: { status: 'READY' } },
    }),
  },
  programApi: {
    getAll: vi.fn().mockResolvedValue({
      data: { data: [{ id: 'p1', name: 'Program 1' }] },
    }),
  },
}));

import CreatorAnalytics from '../CreatorAnalytics';

describe('CreatorAnalytics', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<CreatorAnalytics />);
    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
  });

  it('renders audience insights header after data loads', async () => {
    renderWithProviders(<CreatorAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Audience Insights')).toBeInTheDocument();
    });
  });

  it('renders stat cards with correct data', async () => {
    renderWithProviders(<CreatorAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Questions Answered')).toBeInTheDocument();
    });

    expect(screen.getByText('Engagement Rate')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  it('renders top questions section', async () => {
    renderWithProviders(<CreatorAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Top Questions of the Week')).toBeInTheDocument();
    });

    expect(screen.getByText('Best diet for weight loss?')).toBeInTheDocument();
  });

  it('renders AI Smart Recommendations section', async () => {
    renderWithProviders(<CreatorAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('AI Smart Recommendations')).toBeInTheDocument();
    });
  });

  it('renders top creator voices section', async () => {
    renderWithProviders(<CreatorAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Top Creator Voices')).toBeInTheDocument();
    });
  });
});
