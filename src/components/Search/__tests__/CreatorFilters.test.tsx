import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { CreatorFilters } from '../CreatorFilters';

const defaultProps = {
  categories: [
    { name: 'Tech', count: 10 },
    { name: 'Fitness', count: 5 },
  ],
  priceFilter: 'all' as const,
  minRating: 0,
  verifiedOnly: false,
  onCategoryChange: vi.fn(),
  onPriceFilterChange: vi.fn(),
  onRatingChange: vi.fn(),
  onVerifiedChange: vi.fn(),
  onReset: vi.fn(),
  onClose: vi.fn(),
};

describe('CreatorFilters', () => {
  it('renders when not visible', () => {
    const { container } = renderWithProviders(
      <CreatorFilters {...defaultProps} visible={false} />
    );
    expect(container).toBeTruthy();
  });

  it('renders when visible', () => {
    const { container } = renderWithProviders(
      <CreatorFilters {...defaultProps} visible={true} />
    );
    expect(container).toBeTruthy();
  });

  it('renders with selected category', () => {
    const { container } = renderWithProviders(
      <CreatorFilters {...defaultProps} visible={false} selectedCategory="Tech" />
    );
    expect(container).toBeTruthy();
  });
});
