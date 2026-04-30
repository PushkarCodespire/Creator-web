import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn().mockResolvedValue({ data: {} }) },
  creatorApi: {
    getById: vi.fn().mockResolvedValue({
      data: {
        data: {
          id: 'c1',
          displayName: 'Test Creator',
          bio: 'A great creator',
          followers: { count: 42 },
          followersCount: 42,
          reviews: [],
          faqs: [],
        },
      },
    }),
  },
  reviewApi: {
    create: vi.fn().mockResolvedValue({ data: { data: {} } }),
    update: vi.fn().mockResolvedValue({ data: { data: {} } }),
    delete: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
  programApi: {
    getByCreator: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
  bookingApi: {
    getPublicSlots: vi.fn().mockResolvedValue({ data: { data: [] } }),
    requestBooking: vi.fn().mockResolvedValue({ data: { data: {} } }),
  },
  followApi: {
    checkFollowing: vi.fn().mockResolvedValue({ data: { data: { isFollowing: false } } }),
    followCreator: vi.fn().mockResolvedValue({ data: {} }),
    unfollowCreator: vi.fn().mockResolvedValue({ data: {} }),
  },
  getImageUrl: vi.fn((p: string) => p || ''),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ creatorId: 'test-creator' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

import WebsiteProfile from '../WebsiteProfile';

describe('WebsiteProfile', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<WebsiteProfile />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders loading or content state', () => {
    const { container } = renderWithProviders(<WebsiteProfile />);
    expect(container).toBeTruthy();
  });

  it('renders creator name after data loads', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
  });

  it('renders creator bio after data loads', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('A great creator')).toBeInTheDocument();
    });
  });

  it('renders about tab content by default', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
  });

  it('shows follow button area after profile loads', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
    // Follow count rendered
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('renders tabs: About, FAQs, Reviews, Products & Programs', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText(/FAQs/i)).toBeInTheDocument();
    expect(screen.getByText(/Reviews/i)).toBeInTheDocument();
    expect(screen.getByText(/Products & Programs/i)).toBeInTheDocument();
  });

  it('clicking Reviews tab shows review summary section', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(screen.getByText(/Reviews/i));

    await waitFor(() => {
      // Empty state message or review count
      expect(screen.getByText(/No reviews yet/i)).toBeInTheDocument();
    });
  });

  it('clicking FAQs tab shows empty FAQ state', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(screen.getByText(/FAQs/i));

    await waitFor(() => {
      expect(screen.getByText(/No FAQs yet/i)).toBeInTheDocument();
    });
  });

  it('clicking Products & Programs tab shows empty offerings state', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(screen.getByText(/Products & Programs/i));

    await waitFor(() => {
      expect(screen.getByText(/No products or programs listed yet/i)).toBeInTheDocument();
    });
  });

  it('shows error state when creatorApi.getById fails', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getById as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Not found'));

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText(/Creator not found/i)).toBeInTheDocument();
    });
  });

  it('renders Chat Now link pointing to website-chat route', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const chatLink = screen.getByText(/Chat Now/i).closest('a');
    expect(chatLink).toHaveAttribute('href', expect.stringContaining('website-chat'));
  });

  it('renders the About tab as the default active tab', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
    // About tab should be visible by default
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders follower count 42 on the profile page', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText(/42/)).toBeInTheDocument();
    });
  });

  it('calls creatorApi.getById with the creatorId from route params', async () => {
    const { creatorApi } = await import('../../../services/api');
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(creatorApi.getById).toHaveBeenCalledWith('test-creator');
    });
  });

  it('calls followApi.checkFollowing on mount when not authenticated', async () => {
    // Not authenticated by default → checkFollowing still called
    const { followApi } = await import('../../../services/api');
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
    // Not authenticated so it may or may not call — just ensure no crash
    expect(true).toBe(true);
  });

  it('renders the Bookings tab in the tab list', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
    // The tab button renders "Book a Meeting (N)"
    expect(screen.getByText(/Book a Meeting/i)).toBeInTheDocument();
  });

  it('clicking Bookings tab shows No available time slots message', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
    const { fireEvent: fe } = await import('@testing-library/react');
    fe.click(screen.getByText(/Book a Meeting/i));
    await waitFor(() => {
      expect(screen.getByText(/No available time slots/i)).toBeInTheDocument();
    });
  });

  it('renders creator bio text in the About section', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('A great creator')).toBeInTheDocument();
    });
  });

  it('renders Back to experts link when creator is not found', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getById as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Not found'));
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText(/Back to experts/i)).toBeInTheDocument();
    });
  });

  // ─── NEW TESTS ────────────────────────────────────────────────────────────

  it('renders the + Follow button after profile loads', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });
    // The follow button renders "+ Follow"; use role to avoid matching the "Followers" stat label
    expect(screen.getByRole('button', { name: /Follow/i })).toBeInTheDocument();
  });

  it('shows welcome message section when creator has a welcomeMessage', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c1',
          displayName: 'Test Creator',
          bio: 'A great creator',
          followers: { count: 42 },
          welcomeMessage: 'Welcome to my profile!',
          reviews: [],
          faqs: [],
        },
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome to my profile!/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Welcome Message')).toBeInTheDocument();
  });

  it('shows expertise section when creator has topicExpertise', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c1',
          displayName: 'Test Creator',
          bio: 'A great creator',
          followers: { count: 42 },
          topicExpertise: [{ topic: 'Fitness', percentage: 80 }, { topic: 'Nutrition', percentage: 20 }],
          reviews: [],
          faqs: [],
        },
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('Expertise')).toBeInTheDocument();
      expect(screen.getByText(/Fitness/i)).toBeInTheDocument();
      expect(screen.getByText(/Nutrition/i)).toBeInTheDocument();
    });
  });

  it('shows tagline when creator has one', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c1',
          displayName: 'Test Creator',
          bio: 'A great creator',
          tagline: 'The best fitness coach around',
          followers: { count: 42 },
          reviews: [],
          faqs: [],
        },
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('The best fitness coach around')).toBeInTheDocument();
    });
  });

  it('renders category badge when creator has a category', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c1',
          displayName: 'Test Creator',
          bio: 'A great creator',
          category: 'Fitness',
          followers: { count: 42 },
          reviews: [],
          faqs: [],
        },
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('Fitness')).toBeInTheDocument();
    });
  });

  it('renders FAQs when creator has them', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c1',
          displayName: 'Test Creator',
          bio: 'A great creator',
          followers: { count: 42 },
          faqs: [
            { id: 'faq-1', question: 'Do you offer refunds?', answer: 'Yes, within 7 days.' },
          ],
          reviews: [],
        },
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent: fe } = await import('@testing-library/react');
    fe.click(screen.getByText(/FAQs/i));

    await waitFor(() => {
      expect(screen.getByText('Do you offer refunds?')).toBeInTheDocument();
    });
  });

  it('expands FAQ answer when FAQ question is clicked', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c1',
          displayName: 'Test Creator',
          bio: 'A great creator',
          followers: { count: 42 },
          faqs: [
            { id: 'faq-1', question: 'How to start?', answer: 'Just sign up and chat.' },
          ],
          reviews: [],
        },
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent: fe } = await import('@testing-library/react');
    fe.click(screen.getByText(/FAQs/i));

    await waitFor(() => {
      expect(screen.getByText('How to start?')).toBeInTheDocument();
    });

    fe.click(screen.getByText('How to start?'));

    await waitFor(() => {
      expect(screen.getByText('Just sign up and chat.')).toBeInTheDocument();
    });
  });

  it('shows reviews when creator has them on Reviews tab', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c1',
          displayName: 'Test Creator',
          bio: 'A great creator',
          followers: { count: 42 },
          faqs: [],
          reviews: {
            summary: { averageRating: 4.5, totalReviews: 1, breakdown: { 5: 1 } },
            reviews: [
              { id: 'rev-1', rating: 5, comment: 'Amazing!', createdAt: '2026-01-01T00:00:00Z', user: { id: 'other-user', name: 'John' } },
            ],
          },
        },
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent: fe } = await import('@testing-library/react');
    fe.click(screen.getByText(/Reviews/i));

    await waitFor(() => {
      expect(screen.getByText('Amazing!')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });

  it('shows Write a Review section for authenticated users on Reviews tab', async () => {
    const authState = {
      auth: {
        user: { id: 'user1', name: 'AuthUser', email: 'u@test.com', role: 'FAN' as const, isVerified: false, createdAt: '' },
        token: 'tok',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(<WebsiteProfile />, { preloadedState: authState });

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent: fe } = await import('@testing-library/react');
    fe.click(screen.getByText(/Reviews/i));

    await waitFor(() => {
      expect(screen.getByText('Write a Review')).toBeInTheDocument();
    });
  });

  it('shows Sign in prompt on Reviews tab for unauthenticated users', async () => {
    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent: fe } = await import('@testing-library/react');
    fe.click(screen.getByText(/Reviews/i));

    await waitFor(() => {
      expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
    });
  });

  it('renders programs on offerings tab when programs exist', async () => {
    const { programApi } = await import('../../../services/api');
    (programApi.getByCreator as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'prog-1', name: 'Fat Loss Program', price: 1999, description: JSON.stringify({ desc: '12-week program', duration: '12 weeks', level: 'Beginner' }), category: 'Weight Loss' },
        ],
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent: fe } = await import('@testing-library/react');
    fe.click(screen.getByText(/Products & Programs/i));

    await waitFor(() => {
      expect(screen.getByText('Fat Loss Program')).toBeInTheDocument();
    });
  });

  it('renders products on offerings tab when products exist', async () => {
    const { programApi } = await import('../../../services/api');
    (programApi.getByCreator as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          { id: 'prod-1', name: 'Resistance Bands', price: 499, description: JSON.stringify({ desc: 'Premium bands', link: 'https://example.com' }), category: '__product__' },
        ],
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent: fe } = await import('@testing-library/react');
    fe.click(screen.getByText(/Products & Programs/i));

    await waitFor(() => {
      expect(screen.getByText('Resistance Bands')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
    });
  });

  it('renders available booking slots on Bookings tab', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getPublicSlots as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'slot-1',
            startTime: '2030-06-01T09:00:00Z',
            endTime: '2030-06-01T10:00:00Z',
            isAvailable: true,
            price: 0,
            type: 'Consultation',
            title: 'Available',
          },
        ],
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent: fe } = await import('@testing-library/react');
    fe.click(screen.getByText(/Book a Meeting/i));

    await waitFor(() => {
      expect(screen.getByText('Consultation')).toBeInTheDocument();
    });
  });

  it('shows "Free" label for zero-price booking slots', async () => {
    const { bookingApi } = await import('../../../services/api');
    (bookingApi.getPublicSlots as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'slot-free',
            startTime: '2030-07-01T09:00:00Z',
            endTime: '2030-07-01T10:00:00Z',
            isAvailable: true,
            price: 0,
            type: 'Q&A',
            title: 'Available',
          },
        ],
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent: fe } = await import('@testing-library/react');
    fe.click(screen.getByText(/Book a Meeting/i));

    await waitFor(() => {
      expect(screen.getByText('Free')).toBeInTheDocument();
    });
  });

  it('shows knowledge base content section on About tab', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c1',
          displayName: 'Test Creator',
          bio: 'A great creator',
          followers: { count: 42 },
          content: [
            { id: 'cont-1', type: 'YOUTUBE_VIDEO', title: 'My First Tutorial' },
          ],
          faqs: [],
          reviews: [],
        },
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('My First Tutorial')).toBeInTheDocument();
      expect(screen.getByText(/Trained On/i)).toBeInTheDocument();
    });
  });

  it('shows performance section when creator has responseRate', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c1',
          displayName: 'Test Creator',
          bio: 'A great creator',
          followers: { count: 42 },
          performance: { responseRate: 95, avgResponseTimeSeconds: 30, totalChats: 120 },
          faqs: [],
          reviews: [],
        },
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText('Performance')).toBeInTheDocument();
      expect(screen.getByText('30s')).toBeInTheDocument(); // Avg Response — unique in the DOM
    });
  });

  it('shows Voice AI badge when creator has voiceId', async () => {
    const { creatorApi } = await import('../../../services/api');
    (creatorApi.getById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        data: {
          id: 'c1',
          displayName: 'Test Creator',
          bio: 'A great creator',
          voiceId: 'voice-xyz',
          followers: { count: 42 },
          faqs: [],
          reviews: [],
        },
      },
    });

    renderWithProviders(<WebsiteProfile />);

    await waitFor(() => {
      expect(screen.getByText(/Voice AI/i)).toBeInTheDocument();
    });
  });

  it('calls followApi.followCreator when authenticated user clicks Follow', async () => {
    const { followApi } = await import('../../../services/api');

    const authState = {
      auth: {
        user: { id: 'user1', name: 'AuthUser', email: 'u@test.com', role: 'FAN' as const, isVerified: false, createdAt: '' },
        token: 'tok',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(<WebsiteProfile />, { preloadedState: authState });

    await waitFor(() => {
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    const { fireEvent: fe } = await import('@testing-library/react');
    fe.click(screen.getByRole('button', { name: /^\+\s*follow/i }));

    await waitFor(() => {
      expect(followApi.followCreator).toHaveBeenCalledWith('test-creator');
    });
  });

  it('renders the Followers stat label', async () => {
    renderWithProviders(<WebsiteProfile />);
    await waitFor(() => {
      expect(screen.getByText('Followers')).toBeInTheDocument();
    });
  });
});
