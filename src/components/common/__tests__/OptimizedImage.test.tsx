vi.mock('framer-motion', async () => {
  const React = await import('react');
  return {
    motion: {
      div: ({ children, initial, animate, transition, style, ...rest }: any) => (
        React.createElement('div', { style, ...rest }, children)
      ),
      img: React.forwardRef(
        ({ initial, animate, transition, style, onLoad, onError, src, alt, loading, ...rest }: any, ref: any) =>
          React.createElement('img', { ref, src, alt, loading, onLoad, onError, style, ...rest })
      ),
    },
    AnimatePresence: ({ children }: any) => children,
  };
});

vi.mock('../../../styles/tokens', () => ({
  colors: {
    gray: { 100: '#f3f4f6', 200: '#e5e7eb' },
    primary: { solid: '#7c3aed' },
  },
}));

import { render, screen, fireEvent, act } from '@testing-library/react';
import { OptimizedImage } from '../OptimizedImage';

// IntersectionObserver is not available in jsdom; provide a simple stub
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // Default stub: never fires callbacks (image stays placeholder)
  (globalThis as any).IntersectionObserver = vi.fn((_cb: IntersectionObserverCallback) => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: vi.fn(),
  }));
});

describe('OptimizedImage', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <OptimizedImage src="/test.jpg" alt="Test image" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders an img element with the correct alt text', () => {
    render(<OptimizedImage src="/photo.jpg" alt="My photo" />);
    expect(screen.getByAltText('My photo')).toBeInTheDocument();
  });

  it('passes loading="lazy" to the img element by default', () => {
    render(<OptimizedImage src="/photo.jpg" alt="Lazy" />);
    expect(screen.getByAltText('Lazy')).toHaveAttribute('loading', 'lazy');
  });

  it('passes loading="eager" when specified', () => {
    render(<OptimizedImage src="/photo.jpg" alt="Eager" loading="eager" />);
    expect(screen.getByAltText('Eager')).toHaveAttribute('loading', 'eager');
  });

  it('sets width and height on the wrapper div via style', () => {
    const { container } = render(
      <OptimizedImage src="/img.jpg" alt="sized" width={200} height={150} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('200px');
    expect(wrapper.style.height).toBe('150px');
  });

  it('for eager loading, sets imageSrc immediately (no IntersectionObserver)', () => {
    render(<OptimizedImage src="/eager.jpg" alt="Eager load" loading="eager" />);
    // With eager loading the src is set synchronously; IntersectionObserver should NOT be called
    expect(mockObserve).not.toHaveBeenCalled();
    expect(screen.getByAltText('Eager load')).toHaveAttribute('src', '/eager.jpg');
  });

  it('shows blur placeholder div before image loads', () => {
    render(<OptimizedImage src="/img.jpg" alt="Loading" loading="eager" />);
    // The placeholder div is rendered when !isLoaded && !hasError
    // We look for the wrapper's children — the first child after the outer wrapper is the placeholder div
    const img = screen.getByAltText('Loading');
    const wrapper = img.closest('div') as HTMLElement;
    // At least 2 children: placeholder div + img
    expect(wrapper.childElementCount).toBeGreaterThanOrEqual(2);
  });

  it('calls onLoad when image load event fires', () => {
    const onLoad = vi.fn();
    render(<OptimizedImage src="/img.jpg" alt="Loaded" loading="eager" onLoad={onLoad} />);
    const img = screen.getByAltText('Loaded');
    act(() => fireEvent.load(img));
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('calls onError and falls back to default image on error', () => {
    const onError = vi.fn();
    render(<OptimizedImage src="/bad.jpg" alt="Error img" loading="eager" onError={onError} />);
    const img = screen.getByAltText('Error img');
    act(() => fireEvent.error(img));
    expect(onError).toHaveBeenCalledTimes(1);
    // After error, imageSrc is set to the fallback
    expect(img).toHaveAttribute('src', '/default-image.png');
  });

  it('applies className to the wrapper', () => {
    const { container } = render(
      <OptimizedImage src="/img.jpg" alt="cls" className="my-class" loading="eager" />
    );
    expect(container.firstChild).toHaveClass('my-class');
  });

  it('renders img element for lazy loading mode', () => {
    // Verify the component renders an accessible img regardless of loading mode
    render(<OptimizedImage src="/lazy.jpg" alt="Lazy obs" loading="lazy" />);
    expect(screen.getByAltText('Lazy obs')).toBeInTheDocument();
  });

  it('sets imageSrc when IntersectionObserver fires an intersecting entry', () => {
    let capturedCallback: IntersectionObserverCallback | null = null;
    (globalThis as any).IntersectionObserver = vi.fn((cb: IntersectionObserverCallback) => {
      capturedCallback = cb;
      return { observe: mockObserve, disconnect: mockDisconnect, unobserve: vi.fn() };
    });

    render(<OptimizedImage src="/lazy-fired.jpg" alt="Lazy fired" loading="lazy" />);

    act(() => {
      if (capturedCallback) {
        capturedCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      }
    });

    expect(screen.getByAltText('Lazy fired')).toHaveAttribute('src', '/lazy-fired.jpg');
  });

  it('does not set imageSrc when IntersectionObserver fires a non-intersecting entry', () => {
    let capturedCallback: IntersectionObserverCallback | null = null;
    (globalThis as any).IntersectionObserver = vi.fn((cb: IntersectionObserverCallback) => {
      capturedCallback = cb;
      return { observe: mockObserve, disconnect: mockDisconnect, unobserve: vi.fn() };
    });

    render(<OptimizedImage src="/not-yet.jpg" alt="Not intersecting" loading="lazy" />);

    act(() => {
      if (capturedCallback) {
        capturedCallback(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      }
    });

    // src should remain empty string (placeholder) because the entry was not intersecting
    expect(screen.getByAltText('Not intersecting')).not.toHaveAttribute('src', '/not-yet.jpg');
  });

  it('hides placeholder after image finishes loading', () => {
    render(<OptimizedImage src="/load-complete.jpg" alt="Load complete" loading="eager" />);
    const img = screen.getByAltText('Load complete');
    act(() => fireEvent.load(img));
    // After load, isLoaded=true so the placeholder div should be gone
    const wrapper = img.closest('div') as HTMLElement;
    // placeholder motion.div is removed — wrapper should have fewer children
    expect(wrapper.querySelector('div')).toBeNull();
  });

  it('applies custom style to the wrapper div', () => {
    const { container } = render(
      <OptimizedImage src="/styled.jpg" alt="styled" loading="eager" style={{ border: '2px solid red' }} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.border).toBe('2px solid red');
  });

  it('uses placeholder as initial imageSrc when provided', () => {
    render(
      <OptimizedImage src="/real.jpg" alt="with-placeholder" loading="lazy" placeholder="/blur.jpg" />
    );
    // The img src starts as the placeholder value before the observer fires
    expect(screen.getByAltText('with-placeholder')).toHaveAttribute('src', '/blur.jpg');
  });

  it('calls observe on the img element for lazy loading', () => {
    render(<OptimizedImage src="/observe-me.jpg" alt="Observed" loading="lazy" />);
    expect(mockObserve).toHaveBeenCalledTimes(1);
  });

  it('renders wrapper with position:relative style', () => {
    const { container } = render(
      <OptimizedImage src="/pos.jpg" alt="pos" loading="eager" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.position).toBe('relative');
  });

  it('renders wrapper with overflow:hidden style', () => {
    const { container } = render(
      <OptimizedImage src="/overflow.jpg" alt="overflow" loading="eager" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.overflow).toBe('hidden');
  });

  it('fallback src is set to /default-image.png after error when no onError provided', () => {
    render(<OptimizedImage src="/broken.jpg" alt="broken-no-handler" loading="eager" />);
    const img = screen.getByAltText('broken-no-handler');
    act(() => fireEvent.error(img));
    expect(img).toHaveAttribute('src', '/default-image.png');
  });

  it('placeholder div is absent after image errors', () => {
    render(<OptimizedImage src="/err-placeholder.jpg" alt="err-ph" loading="eager" />);
    const img = screen.getByAltText('err-ph');
    act(() => fireEvent.error(img));
    // hasError=true — the blur placeholder motion.div should not render
    const wrapper = img.closest('div') as HTMLElement;
    expect(wrapper.querySelector('div')).toBeNull();
  });

  it('disconnects observer after intersection fires', () => {
    let capturedCallback: IntersectionObserverCallback | null = null;
    (globalThis as any).IntersectionObserver = vi.fn((cb: IntersectionObserverCallback) => {
      capturedCallback = cb;
      return { observe: mockObserve, disconnect: mockDisconnect, unobserve: vi.fn() };
    });

    render(<OptimizedImage src="/disc.jpg" alt="disc" loading="lazy" />);

    act(() => {
      if (capturedCallback) {
        capturedCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      }
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('renders with numeric width/height and applies px suffix to wrapper', () => {
    const { container } = render(
      <OptimizedImage src="/px.jpg" alt="px-sizing" width={100} height={80} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('100px');
    expect(wrapper.style.height).toBe('80px');
  });
});
