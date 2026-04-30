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

import { screen, fireEvent } from '@testing-library/react';

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

  it('renders Filter Matrix title when visible', () => {
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} />);
    expect(screen.getByText('Filter Matrix')).toBeInTheDocument();
  });

  it('renders Identity Domain section when visible', () => {
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} />);
    expect(screen.getByText('Identity Domain')).toBeInTheDocument();
  });

  it('renders Update Matrix button when visible', () => {
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} />);
    expect(screen.getByText('Update Matrix')).toBeInTheDocument();
  });

  it('renders Monetization Model section when visible', () => {
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} />);
    expect(screen.getByText('Monetization Model')).toBeInTheDocument();
  });

  it('renders Protocol Verified section when visible', () => {
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} />);
    expect(screen.getByText('Protocol Verified')).toBeInTheDocument();
  });

  it('renders Cancel button when visible', () => {
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onRatingChange and onClose when Update Matrix is clicked', () => {
    const onRatingChange = vi.fn();
    const onClose = vi.fn();
    renderWithProviders(
      <CreatorFilters {...defaultProps} visible={true} onRatingChange={onRatingChange} onClose={onClose} />
    );
    fireEvent.click(screen.getByText('Update Matrix'));
    expect(onRatingChange).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders Reset All button when a category filter is active', () => {
    renderWithProviders(
      <CreatorFilters {...defaultProps} visible={true} selectedCategory="Tech" />
    );
    expect(screen.getByText('Reset All')).toBeInTheDocument();
  });

  it('calls onReset when Reset All button is clicked', () => {
    const onReset = vi.fn();
    renderWithProviders(
      <CreatorFilters {...defaultProps} visible={true} selectedCategory="Tech" onReset={onReset} />
    );
    fireEvent.click(screen.getByText('Reset All'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('does not render Reset All button when no filters are active', () => {
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} />);
    expect(screen.queryByText('Reset All')).not.toBeInTheDocument();
  });

  it('renders Verified persona matrix description text', () => {
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} />);
    expect(screen.getByText('Verified persona matrix')).toBeInTheDocument();
  });

  it('renders All Domains placeholder when no category is selected', () => {
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} />);
    expect(screen.getByText('All Domains')).toBeInTheDocument();
  });

  it('renders Neural Credibility label when visible', () => {
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} />);
    expect(screen.getByText(/Neural Credibility/i)).toBeInTheDocument();
  });

  it('shows "Any" label for the slider when minRating is 0', () => {
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} minRating={0} />);
    // "Any" appears both in the Neural Credibility heading and the slider mark
    expect(screen.getAllByText(/Any/i).length).toBeGreaterThan(0);
  });

  it('calls onVerifiedChange when the Protocol Verified switch is toggled', () => {
    const onVerifiedChange = vi.fn();
    renderWithProviders(
      <CreatorFilters {...defaultProps} visible={true} onVerifiedChange={onVerifiedChange} />
    );
    // Ant Switch renders a role="switch" button
    const switchEl = screen.getByRole('switch');
    fireEvent.click(switchEl);
    expect(onVerifiedChange).toHaveBeenCalledTimes(1);
  });

  it('renders Reset All button when verifiedOnly is true', () => {
    renderWithProviders(
      <CreatorFilters {...defaultProps} visible={true} verifiedOnly={true} />
    );
    expect(screen.getByText('Reset All')).toBeInTheDocument();
  });

  it('renders Reset All button when priceFilter is not "all"', () => {
    renderWithProviders(
      <CreatorFilters {...defaultProps} visible={true} priceFilter="premium" />
    );
    expect(screen.getByText('Reset All')).toBeInTheDocument();
  });

  it('renders category combobox that can be opened to show Tech option', () => {
    renderWithProviders(<CreatorFilters {...defaultProps} visible={true} />);
    // Ant Select renders a combobox role for the Identity Domain select
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThan(0);
    // Opening the first combobox surfaces the category options
    fireEvent.mouseDown(comboboxes[0]);
    expect(screen.queryAllByText('Tech').length).toBeGreaterThan(0);
  });
});
