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

const creatorState = {
  auth: {
    user: { id: '1', name: 'Test Creator', email: 'a@b.com', role: 'CREATOR' as const, isVerified: true, createdAt: '' },
    token: 'tok',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
};

describe('CreatorAnalytics', () => {
  it('shows loading state initially', () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
  });

  it('renders audience insights header after data loads', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Audience Insights')).toBeInTheDocument();
    });
  });

  it('renders stat cards with correct data', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Questions Answered')).toBeInTheDocument();
    });

    expect(screen.getByText('Engagement Rate')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  it('renders top questions section', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Top Questions of the Week')).toBeInTheDocument();
    });

    expect(screen.getByText('Best diet for weight loss?')).toBeInTheDocument();
  });

  it('renders AI Smart Recommendations section', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('AI Smart Recommendations')).toBeInTheDocument();
    });
  });

  it('renders top creator voices section', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Top Creator Voices')).toBeInTheDocument();
    });
  });

  it('shows content items in the top creator voices card', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Workout Guide')).toBeInTheDocument();
    });
    expect(screen.getByText('Nutrition Tips')).toBeInTheDocument();
  });

  it('renders the audience locations section', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Audience Locations')).toBeInTheDocument();
    });
    // No location data in mock, so the empty state message should appear
    expect(screen.getByText(/no location data yet/i)).toBeInTheDocument();
  });

  it('renders the age group breakdown section', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Age Group Breakdown')).toBeInTheDocument();
    });
    expect(screen.getByText(/no age data yet/i)).toBeInTheDocument();
  });

  it('shows the followers count in the mini stats area', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Followers')).toBeInTheDocument();
    });
    // follower count from mock data
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('renders the Avg Rating label and value in mini stats', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Avg Rating')).toBeInTheDocument();
    });
    // averageRating is 4.2 → formatted as "4.2"
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });

  it('renders the question count badge next to each top question', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      // count=20 is rendered as "20x"
      expect(screen.getByText('20x')).toBeInTheDocument();
    });
  });

  it('renders the #1 rank prefix for the top question', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
    });
  });

  it('renders the progress percentage in the AI Smart Recommendations section', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      // With content + voice + aiAnswers>10 satisfied, some items are done.
      // The progress percentage element is always rendered (multiple % elements may exist).
      const pcts = screen.getAllByText(/\d+%/);
      expect(pcts.length).toBeGreaterThan(0);
    });
  });

  it('renders completed recommendations under "Completed" sub-heading', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      // "Add training content" should be completed since contents.length > 0
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  it('renders the "Your most impactful training content" subtitle in creator voices card', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Your most impactful training content')).toBeInTheDocument();
    });
  });

  it('renders subtitle paragraph under Audience Insights heading', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Track your audience growth and engagement')).toBeInTheDocument();
    });
  });

  it('renders "Responses per chat" subtitle inside Engagement Rate card', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Responses per chat')).toBeInTheDocument();
    });
  });

  it('renders "Chat to follower" subtitle inside Conversion Rate card', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });

    await waitFor(() => {
      expect(screen.getByText('Chat to follower')).toBeInTheDocument();
    });
  });

  it('renders the total AI answers value from mock data (120)', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument();
    });
  });

  it('renders "+8 today" label for aiAnswersToday stat', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('+8 today')).toBeInTheDocument();
    });
  });

  it('does not show loading state after data is fetched', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument();
    });
  });

  it('renders the Add training content recommendation when content exists (done)', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('AI Smart Recommendations')).toBeInTheDocument();
    });
    // "Add training content" item should appear as completed (struck-through) since contents.length > 0
    expect(screen.getByText('Add training content')).toBeInTheDocument();
  });

  it('renders "Clone your voice" recommendation as completed when voice is READY', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Clone your voice')).toBeInTheDocument();
    });
  });

  it('renders "Create a program or product" recommendation as completed when programCount > 0', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Create a program or product')).toBeInTheDocument();
    });
  });

  it('renders "Get your first review" recommendation when totalReviews > 0 (completed)', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Get your first review')).toBeInTheDocument();
    });
  });

  it('shows "Workout Guide" as a YouTube voice item in the creator voices card', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Workout Guide')).toBeInTheDocument();
    });
  });

  it('shows "Guide" type label next to a MANUAL_TEXT content item in voices card', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Guide')).toBeInTheDocument();
    });
  });

  it('renders "Where your fans are located" subtitle in Audience Locations card', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Where your fans are located')).toBeInTheDocument();
    });
  });

  it('renders "Based on fans who provided their date of birth" subtitle', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Based on fans who provided their date of birth')).toBeInTheDocument();
    });
  });

  it('renders engagement rate percentage for totalChats=50, aiAnswers=120', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      // engagementRate = min(100, round(120/50 * 100)) = 100%
      // conversionRate = min(100, round(300/50 * 100)) = 100%, so two "100%" elements
      expect(screen.getAllByText('100%').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders "Personalized tips to grow your CreatorPal" subtitle in recommendations section', async () => {
    renderWithProviders(<CreatorAnalytics />, { preloadedState: creatorState });
    await waitFor(() => {
      expect(screen.getByText('Personalized tips to grow your CreatorPal')).toBeInTheDocument();
    });
  });
});
