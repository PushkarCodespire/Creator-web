vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    img: ({ children, ...p }: any) => <img {...p}>{children}</img>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import OptimizedImage from '../OptimizedImage';

describe('OptimizedImage', () => {
  it('renders with src and alt', () => {
    const { container } = renderWithProviders(
      <OptimizedImage src="/test.jpg" alt="Test image" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with eager loading (bypasses IntersectionObserver)', () => {
    const { container } = renderWithProviders(
      <OptimizedImage src="/test.jpg" alt="Eager" loading="eager" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with width and height', () => {
    const { container } = renderWithProviders(
      <OptimizedImage src="/test.jpg" alt="Sized" width={200} height={150} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with placeholder', () => {
    const { container } = renderWithProviders(
      <OptimizedImage src="/test.jpg" alt="Placeholder" placeholder="/placeholder.jpg" />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
