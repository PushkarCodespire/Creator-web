import { render, screen } from '@testing-library/react';
import CustomCard from '../Card/CustomCard';

describe('CustomCard', () => {
  it('renders children content', () => {
    render(<CustomCard>Card content</CustomCard>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with a title', () => {
    render(<CustomCard title="Card Title">Body</CustomCard>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('renders with different depth levels without crashing', () => {
    [1, 2, 3].forEach((depth) => {
      const { unmount } = render(
        <CustomCard depth={depth as 1 | 2 | 3}>Depth {depth}</CustomCard>
      );
      expect(screen.getByText(`Depth ${depth}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with hoverable prop', () => {
    render(<CustomCard hoverable>Hoverable card</CustomCard>);
    expect(screen.getByText('Hoverable card')).toBeInTheDocument();
  });

  it('renders without hoverable (static)', () => {
    render(<CustomCard hoverable={false}>Static card</CustomCard>);
    expect(screen.getByText('Static card')).toBeInTheDocument();
  });
});
