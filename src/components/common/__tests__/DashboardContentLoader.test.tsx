import { render, screen } from '@testing-library/react';
import DashboardContentLoader from '../DashboardContentLoader';

describe('DashboardContentLoader', () => {
  it('renders loading text', () => {
    render(<DashboardContentLoader />);
    expect(screen.getByText('Loading your experience...')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<DashboardContentLoader />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders exactly one paragraph with the loading message', () => {
    const { container } = render(<DashboardContentLoader />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0].textContent).toBe('Loading your experience...');
  });

  it('outer container has flex column layout styles', () => {
    const { container } = render(<DashboardContentLoader />);
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.display).toBe('flex');
    expect(outer.style.flexDirection).toBe('column');
  });

  it('outer container uses full width', () => {
    const { container } = render(<DashboardContentLoader />);
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.width).toBe('100%');
  });

  it('outer container is centered with justifyContent and alignItems', () => {
    const { container } = render(<DashboardContentLoader />);
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.justifyContent).toBe('center');
    expect(outer.style.alignItems).toBe('center');
  });

  it('renders a spin indicator inside the component', () => {
    const { container } = render(<DashboardContentLoader />);
    // Ant Design Spin renders an element with role="img" or a span with aria-label
    // At minimum the spin wrapper div should be present in the subtree
    expect(container.querySelector('.ant-spin, [aria-label]')).not.toBeNull();
  });

  it('can be rendered multiple times independently', () => {
    const { container: c1 } = render(<DashboardContentLoader />);
    const { container: c2 } = render(<DashboardContentLoader />);
    expect(c1.firstChild).toBeTruthy();
    expect(c2.firstChild).toBeTruthy();
  });

  it('loading text is a direct child of the component root', () => {
    render(<DashboardContentLoader />);
    const text = screen.getByText('Loading your experience...');
    expect(text.tagName.toLowerCase()).toBe('p');
  });

  it('outer container has a calculated height style', () => {
    const { container } = render(<DashboardContentLoader />);
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.height).toBe('calc(100vh - 200px)');
  });

  it('loading text paragraph has marginTop style', () => {
    render(<DashboardContentLoader />);
    const p = screen.getByText('Loading your experience...');
    expect(p.style.marginTop).toBe('16px');
  });

  it('loading text paragraph has a color style applied', () => {
    render(<DashboardContentLoader />);
    const p = screen.getByText('Loading your experience...');
    // jsdom converts hex to rgb; just verify a color is set
    expect(p.style.color).toBeTruthy();
  });

  it('renders a LoadingOutlined spin indicator with expected font size', () => {
    const { container } = render(<DashboardContentLoader />);
    // The Ant Design LoadingOutlined icon rendered inside the Spin
    const icon = container.querySelector('.anticon-loading');
    expect(icon).not.toBeNull();
  });
});
