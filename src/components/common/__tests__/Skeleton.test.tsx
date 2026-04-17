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
});
