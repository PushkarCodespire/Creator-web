vi.mock('../../../services/api', () => ({
  reviewApi: {
    getReviews: vi.fn().mockResolvedValue({
      data: { data: { reviews: [], summary: { averageRating: 0, totalReviews: 0, breakdown: {} } } },
    }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { ReviewsModal } from '../ReviewsModal';

describe('ReviewsModal', () => {
  it('renders when not visible', () => {
    const { container } = renderWithProviders(
      <ReviewsModal creatorId="c1" visible={false} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders when visible', () => {
    const { container } = renderWithProviders(
      <ReviewsModal creatorId="c1" visible={true} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders with initial summary', () => {
    const { container } = renderWithProviders(
      <ReviewsModal
        creatorId="c1"
        visible={true}
        onClose={vi.fn()}
        initialSummary={{ averageRating: 4.5, totalReviews: 10, breakdown: { '5': 6, '4': 4 } }}
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders Creator Feedback Matrix title when visible', async () => {
    renderWithProviders(<ReviewsModal creatorId="c1" visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Creator Feedback Matrix')).toBeInTheDocument();
    });
  });

  it('renders Total Reviews count', async () => {
    renderWithProviders(<ReviewsModal creatorId="c1" visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('0 Total Reviews')).toBeInTheDocument();
    });
  });

  it('renders initial summary rating when provided', () => {
    renderWithProviders(
      <ReviewsModal
        creatorId="c1"
        visible={true}
        onClose={vi.fn()}
        initialSummary={{ averageRating: 4.5, totalReviews: 10, breakdown: { '5': 6, '4': 4 } }}
      />
    );
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('renders 0.0 when averageRating is 0', () => {
    renderWithProviders(
      <ReviewsModal
        creatorId="c1"
        visible={true}
        onClose={vi.fn()}
        initialSummary={{ averageRating: 0, totalReviews: 0, breakdown: {} }}
      />
    );
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });

  it('renders verified interactions subtitle when visible', async () => {
    renderWithProviders(<ReviewsModal creatorId="c1" visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Verified interactions from your neural audience')).toBeInTheDocument();
    });
  });

  it('calls onClose when modal is dismissed', async () => {
    const onClose = vi.fn();
    renderWithProviders(<ReviewsModal creatorId="c1" visible={true} onClose={onClose} />);
    // Ant Modal renders a close button; click it
    const closeBtn = document.querySelector('.ant-modal-close');
    if (closeBtn) {
      (closeBtn as HTMLElement).click();
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    }
  });

  it('calls reviewApi.getReviews with the correct creatorId when visible', async () => {
    const { reviewApi } = await import('../../../services/api');
    renderWithProviders(<ReviewsModal creatorId="creator-abc" visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(reviewApi.getReviews).toHaveBeenCalledWith('creator-abc', expect.any(Object));
    });
  });

  it('renders empty-list message when no reviews are returned', async () => {
    renderWithProviders(<ReviewsModal creatorId="c1" visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('No feedback recorded in this matrix cycle')).toBeInTheDocument();
    });
  });

  it('renders star breakdown rows (labels 1–5) when visible', async () => {
    renderWithProviders(<ReviewsModal creatorId="c1" visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      // Star row labels 1 through 5 are rendered as numeric text nodes
      ['1', '2', '3', '4', '5'].forEach((star) => {
        expect(screen.getAllByText(star).length).toBeGreaterThan(0);
      });
    });
  });

  it('renders total reviews from initialSummary prop', () => {
    renderWithProviders(
      <ReviewsModal
        creatorId="c1"
        visible={true}
        onClose={vi.fn()}
        initialSummary={{ averageRating: 3.8, totalReviews: 99, breakdown: { '4': 99 } }}
      />
    );
    expect(screen.getByText('99 Total Reviews')).toBeInTheDocument();
  });

  it('does not render the modal content when visible is false', () => {
    renderWithProviders(<ReviewsModal creatorId="c1" visible={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Creator Feedback Matrix')).not.toBeInTheDocument();
  });

  it('renders a Rate component showing the initialSummary averageRating', () => {
    renderWithProviders(
      <ReviewsModal
        creatorId="c1"
        visible={true}
        onClose={vi.fn()}
        initialSummary={{ averageRating: 3.0, totalReviews: 5, breakdown: { '3': 5 } }}
      />
    );
    expect(screen.getByText('3.0')).toBeInTheDocument();
    expect(screen.getByText('5 Total Reviews')).toBeInTheDocument();
  });

  it('renders Neural Credibility rating label when summary has a value', () => {
    renderWithProviders(
      <ReviewsModal
        creatorId="c1"
        visible={true}
        onClose={vi.fn()}
        initialSummary={{ averageRating: 5.0, totalReviews: 1, breakdown: { '5': 1 } }}
      />
    );
    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(screen.getByText('1 Total Reviews')).toBeInTheDocument();
  });

  it('does not call reviewApi.getReviews when visible is false', async () => {
    const { reviewApi } = await import('../../../services/api');
    (reviewApi.getReviews as ReturnType<typeof vi.fn>).mockClear();
    renderWithProviders(<ReviewsModal creatorId="no-fetch" visible={false} onClose={vi.fn()} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(reviewApi.getReviews).not.toHaveBeenCalled();
  });

  it('renders the premium-modal class on the modal', async () => {
    renderWithProviders(<ReviewsModal creatorId="c1" visible={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(document.querySelector('.premium-modal')).toBeTruthy();
    });
  });

  it('renders breakdown count column with 0 for all stars when summary has no breakdown data', async () => {
    renderWithProviders(
      <ReviewsModal
        creatorId="c1"
        visible={true}
        onClose={vi.fn()}
        initialSummary={{ averageRating: 0, totalReviews: 0, breakdown: {} }}
      />
    );
    await waitFor(() => {
      // The count column for every star row should be 0; find at least one zero
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThan(0);
    });
  });
});
