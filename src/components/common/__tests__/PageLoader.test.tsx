import { render, screen } from '@testing-library/react';
import { PageLoader } from '../PageLoader';

describe('PageLoader', () => {
  it('renders loading text', () => {
    render(<PageLoader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<PageLoader />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders exactly one paragraph with the loading message', () => {
    const { container } = render(<PageLoader />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0].textContent).toBe('Loading...');
  });

  it('the loading paragraph has correct font size style', () => {
    const { container } = render(<PageLoader />);
    const para = container.querySelector('p') as HTMLElement;
    expect(para.style.fontSize).toBe('16px');
  });

  it('outer wrapper is a div element', () => {
    const { container } = render(<PageLoader />);
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('div');
  });

  it('outer wrapper uses flex column layout', () => {
    const { container } = render(<PageLoader />);
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.display).toBe('flex');
    expect(outer.style.flexDirection).toBe('column');
  });

  it('outer wrapper stretches to full viewport height', () => {
    const { container } = render(<PageLoader />);
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.minHeight).toBe('100vh');
  });

  it('outer wrapper centers content', () => {
    const { container } = render(<PageLoader />);
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.alignItems).toBe('center');
    expect(outer.style.justifyContent).toBe('center');
  });

  it('can be rendered multiple times independently', () => {
    const { container: c1 } = render(<PageLoader />);
    const { container: c2 } = render(<PageLoader />);
    expect(c1.firstChild).toBeTruthy();
    expect(c2.firstChild).toBeTruthy();
  });

  it('default export also works', async () => {
    const { default: DefaultPageLoader } = await import('../PageLoader');
    const { container } = render(<DefaultPageLoader />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders a Spin component inside the wrapper', () => {
    const { container } = render(<PageLoader />);
    // Ant Design Spin renders an element with class ant-spin
    const spin = container.querySelector('.ant-spin');
    expect(spin).toBeTruthy();
  });

  it('the loading paragraph is inside the outer wrapper div', () => {
    const { container } = render(<PageLoader />);
    const outer = container.firstChild as HTMLElement;
    const para = outer.querySelector('p');
    expect(para).toBeTruthy();
    expect(para?.textContent).toBe('Loading...');
  });

  it('the loading paragraph has a positive marginTop style', () => {
    const { container } = render(<PageLoader />);
    const para = container.querySelector('p') as HTMLElement;
    // spacing[4] resolves to a non-empty CSS value
    expect(para.style.marginTop).toBeTruthy();
  });

  it('renders the LoadingOutlined icon inside the Spin', () => {
    const { container } = render(<PageLoader />);
    // LoadingOutlined renders an SVG with aria-label "loading"
    const loadingIcon = container.querySelector('[aria-label="loading"]');
    expect(loadingIcon).toBeTruthy();
  });
});
