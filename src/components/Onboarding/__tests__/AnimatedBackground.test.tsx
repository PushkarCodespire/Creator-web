vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, animate, transition, ...rest }: any) => (
      <div data-testid="motion-div" style={style} {...rest}>{children}</div>
    ),
  },
}));

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { AnimatedBackground } from '../AnimatedBackground';

describe('AnimatedBackground', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <AnimatedBackground><span>child</span></AnimatedBackground>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders children content', () => {
    renderWithProviders(
      <AnimatedBackground><span>hello world</span></AnimatedBackground>
    );
    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('renders animated motion divs', () => {
    renderWithProviders(
      <AnimatedBackground><span>child</span></AnimatedBackground>
    );
    const motionDivs = screen.getAllByTestId('motion-div');
    expect(motionDivs.length).toBeGreaterThanOrEqual(2);
  });

  it('outer div has minHeight 100vh style', () => {
    const { container } = renderWithProviders(
      <AnimatedBackground><span>child</span></AnimatedBackground>
    );
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.minHeight).toBe('100vh');
  });

  it('outer div has overflow hidden', () => {
    const { container } = renderWithProviders(
      <AnimatedBackground><span>child</span></AnimatedBackground>
    );
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.overflow).toBe('hidden');
  });

  it('outer div has a light background color set', () => {
    const { container } = renderWithProviders(
      <AnimatedBackground><span>child</span></AnimatedBackground>
    );
    const outer = container.firstChild as HTMLElement;
    // jsdom normalises hex to rgb, so check either form
    expect(outer.style.background).toMatch(/#f9fafb|rgb\(249,\s*250,\s*251\)/i);
  });

  it('content wrapper has zIndex 10', () => {
    const { container } = renderWithProviders(
      <AnimatedBackground><span>child</span></AnimatedBackground>
    );
    // The content wrapper is the last direct child div of the outer container
    const outer = container.firstChild as HTMLElement;
    const allDirectChildren = Array.from(outer.children) as HTMLElement[];
    const contentWrapper = allDirectChildren.find(
      (el) => el.style.zIndex === '10'
    );
    expect(contentWrapper).toBeTruthy();
  });

  it('renders multiple children inside the content wrapper', () => {
    renderWithProviders(
      <AnimatedBackground>
        <span>first</span>
        <span>second</span>
      </AnimatedBackground>
    );
    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
  });

  it('outer div has position relative', () => {
    const { container } = renderWithProviders(
      <AnimatedBackground><span>child</span></AnimatedBackground>
    );
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.position).toBe('relative');
  });

  it('outer div has full width', () => {
    const { container } = renderWithProviders(
      <AnimatedBackground><span>child</span></AnimatedBackground>
    );
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.width).toBe('100%');
  });

  it('outer div has flex column display', () => {
    const { container } = renderWithProviders(
      <AnimatedBackground><span>child</span></AnimatedBackground>
    );
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.display).toBe('flex');
    expect(outer.style.flexDirection).toBe('column');
  });

  it('content wrapper has position relative', () => {
    const { container } = renderWithProviders(
      <AnimatedBackground><span>child</span></AnimatedBackground>
    );
    const outer = container.firstChild as HTMLElement;
    const allDirectChildren = Array.from(outer.children) as HTMLElement[];
    const contentWrapper = allDirectChildren.find(
      (el) => el.style.zIndex === '10'
    );
    expect(contentWrapper?.style.position).toBe('relative');
  });

  it('content wrapper has full width', () => {
    const { container } = renderWithProviders(
      <AnimatedBackground><span>child</span></AnimatedBackground>
    );
    const outer = container.firstChild as HTMLElement;
    const allDirectChildren = Array.from(outer.children) as HTMLElement[];
    const contentWrapper = allDirectChildren.find(
      (el) => el.style.zIndex === '10'
    );
    expect(contentWrapper?.style.width).toBe('100%');
  });
});
