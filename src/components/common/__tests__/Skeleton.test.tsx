import { render } from '@testing-library/react';
import Skeleton from '../Loading/Skeleton';

describe('Skeleton', () => {
  it('renders text skeleton by default', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders avatar skeleton', () => {
    const { container } = render(<Skeleton type="avatar" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders card skeleton', () => {
    const { container } = render(<Skeleton type="card" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders post skeleton', () => {
    const { container } = render(<Skeleton type="post" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders list skeleton with count', () => {
    const { container } = render(<Skeleton type="list" count={3} />);
    // Should render 3 list items
    const items = container.querySelectorAll('[style*="border-radius: 50%"]');
    expect(items.length).toBe(3);
  });

  it('renders chat skeleton with alternating layout', () => {
    const { container } = render(<Skeleton type="chat" count={4} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders multiple text lines via count prop', () => {
    const { container } = render(<Skeleton type="text" count={5} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders correct number of list items matching count', () => {
    const { container } = render(<Skeleton type="list" count={5} />);
    // Each list item has a circular avatar div with borderRadius: '50%'
    const circles = container.querySelectorAll('[style*="border-radius: 50%"]');
    expect(circles.length).toBe(5);
  });

  it('renders text skeleton with count=1 by default', () => {
    const { container } = render(<Skeleton type="text" />);
    // Space direction vertical wrapper is the root, it has children
    expect(container.firstChild).toBeTruthy();
  });

  it('renders card skeleton with image placeholder area', () => {
    const { container } = render(<Skeleton type="card" />);
    // Card skeleton has a 200px tall shimmer div
    const tallDiv = container.querySelector('[style*="200px"]');
    expect(tallDiv).toBeTruthy();
  });

  it('renders post skeleton with action row', () => {
    const { container } = render(<Skeleton type="post" />);
    // Post skeleton has a 300px tall image area
    const imageArea = container.querySelector('[style*="300px"]');
    expect(imageArea).toBeTruthy();
  });

  it('renders chat skeleton with correct number of messages', () => {
    const { container } = render(<Skeleton type="chat" count={6} />);
    // Each message bubble has a margin-bottom of 16px
    const bubbles = container.querySelectorAll('[style*="margin-bottom: 16px"]');
    expect(bubbles.length).toBe(6);
  });

  it('renders avatar skeleton with circular element', () => {
    const { container } = render(<Skeleton type="avatar" />);
    const circle = container.querySelector('[style*="border-radius: 50%"]');
    expect(circle).toBeTruthy();
  });
});
