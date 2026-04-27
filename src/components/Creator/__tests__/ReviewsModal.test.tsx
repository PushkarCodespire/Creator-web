vi.mock('../../../services/api', () => ({
  reviewApi: {
    getCreatorReviews: vi.fn().mockResolvedValue({
      data: { data: { reviews: [], averageRating: 0, totalReviews: 0, breakdown: {} } },
    }),
  },
  getImageUrl: vi.fn((x: string) => x),
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

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
});
