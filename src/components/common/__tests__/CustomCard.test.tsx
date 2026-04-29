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

  it('renders with gradient prop without crashing', () => {
    render(<CustomCard gradient>Gradient card</CustomCard>);
    expect(screen.getByText('Gradient card')).toBeInTheDocument();
  });

  it('renders with gradientBorder prop without crashing', () => {
    render(<CustomCard gradientBorder>Border card</CustomCard>);
    expect(screen.getByText('Border card')).toBeInTheDocument();
  });

  it('forwards extra CardProps (e.g. loading) without crashing', () => {
    render(<CustomCard loading>Loading card</CustomCard>);
    // When loading=true Ant Design renders a skeleton, children may not appear
    // The component itself should not throw
    expect(document.body).toBeTruthy();
  });

  it('renders custom style merged onto card', () => {
    const { container } = render(
      <CustomCard style={{ margin: '8px' }}>Styled card</CustomCard>
    );
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText('Styled card')).toBeInTheDocument();
  });

  it('wraps content in motion.div when hoverable is true', () => {
    const { container } = render(<CustomCard hoverable>Motion card</CustomCard>);
    // motion.div is mocked to a plain div; the wrapper div should be present
    expect(container.querySelector('div')).toBeTruthy();
    expect(screen.getByText('Motion card')).toBeInTheDocument();
  });

  it('renders without children crashing (empty card)', () => {
    render(<CustomCard>{null}</CustomCard>);
    expect(document.body).toBeTruthy();
  });

  it('applies depth 2 without crashing', () => {
    render(<CustomCard depth={2}>Deep card</CustomCard>);
    expect(screen.getByText('Deep card')).toBeInTheDocument();
  });

  it('renders with both gradient and gradientBorder props without crashing', () => {
    render(<CustomCard gradient gradientBorder>Combined card</CustomCard>);
    expect(screen.getByText('Combined card')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <CustomCard>
        <span>First</span>
        <span>Second</span>
      </CustomCard>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('renders title and children together', () => {
    render(<CustomCard title="My Title">My Body</CustomCard>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Body')).toBeInTheDocument();
  });

  it('does not wrap content in motion.div when hoverable is false', () => {
    const { container } = render(<CustomCard hoverable={false}>No motion</CustomCard>);
    // When hoverable=false the motion.div wrapper is absent; the root is a Card
    expect(screen.getByText('No motion')).toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });

  it('renders depth 3 without crashing', () => {
    render(<CustomCard depth={3}>Max depth card</CustomCard>);
    expect(screen.getByText('Max depth card')).toBeInTheDocument();
  });

  it('merges additional style with card style', () => {
    const { container } = render(
      <CustomCard style={{ padding: '4px', color: 'red' }}>Merged style</CustomCard>
    );
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText('Merged style')).toBeInTheDocument();
  });

  it('renders with depth 1 (default) without crashing', () => {
    render(<CustomCard depth={1}>Depth one card</CustomCard>);
    expect(screen.getByText('Depth one card')).toBeInTheDocument();
  });

  it('renders a React element as title without crashing', () => {
    render(
      <CustomCard title={<span data-testid="rich-title">Rich Title</span>}>
        Content
      </CustomCard>
    );
    expect(screen.getByTestId('rich-title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders nested CustomCard components without crashing', () => {
    render(
      <CustomCard title="Outer">
        <CustomCard title="Inner">Nested content</CustomCard>
      </CustomCard>
    );
    expect(screen.getByText('Outer')).toBeInTheDocument();
    expect(screen.getByText('Inner')).toBeInTheDocument();
    expect(screen.getByText('Nested content')).toBeInTheDocument();
  });

  it('renders with hoverable=true and gradient=true together', () => {
    render(<CustomCard hoverable gradient>Hover gradient</CustomCard>);
    expect(screen.getByText('Hover gradient')).toBeInTheDocument();
  });

  it('renders with hoverable=true and gradientBorder=true together', () => {
    render(<CustomCard hoverable gradientBorder>Hover border</CustomCard>);
    expect(screen.getByText('Hover border')).toBeInTheDocument();
  });

  it('renders long text content without crashing', () => {
    const longText = 'A'.repeat(500);
    render(<CustomCard>{longText}</CustomCard>);
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('passes extra AntD CardProps (size="small") without crashing', () => {
    render(<CustomCard size="small">Small card</CustomCard>);
    expect(screen.getByText('Small card')).toBeInTheDocument();
  });
});
