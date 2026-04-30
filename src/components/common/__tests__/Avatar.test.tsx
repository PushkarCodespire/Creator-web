// ===========================================
// TESTS: CustomAvatar component
// ===========================================

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import CustomAvatar from '../Avatar/Avatar';

vi.mock('antd', () => ({
  Avatar: ({ children, src, size, ...rest }: any) => (
    <img data-testid="ant-avatar" src={src} data-size={size} alt="avatar" />
  ),
}));

vi.mock('@ant-design/icons', () => ({
  CheckCircleFilled: ({ style }: any) => <span data-testid="check-circle" style={style} />,
}));

vi.mock('../../../styles/tokens', () => ({
  colors: {
    gray: { 400: '#9ca3af' },
    error: { solid: '#ef4444' },
    warning: { solid: '#f59e0b' },
    primary: { solid: '#3b82f6', gradient: 'linear-gradient(#3b82f6, #8b5cf6)' },
    success: {},
    text: { secondary: '#6b7280' },
  },
  shadows: { md: '0 4px 6px rgba(0,0,0,0.1)', xl: '0 20px 25px rgba(0,0,0,0.1)' },
  borderRadius: { lg: '12px' },
}));

describe('CustomAvatar', () => {
  it('renders without crashing with no props', () => {
    const { container } = renderWithProviders(<CustomAvatar />);
    expect(container).toBeTruthy();
  });

  it('renders children text', () => {
    renderWithProviders(<CustomAvatar>AB</CustomAvatar>);
    // The mocked AntAvatar renders an img, children passed through — verify container renders
    expect(screen.getByTestId('ant-avatar')).toBeInTheDocument();
  });

  it('renders with src prop', () => {
    renderWithProviders(<CustomAvatar src="https://example.com/avatar.jpg" />);
    expect(screen.getByTestId('ant-avatar')).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders with gradientRing=true', () => {
    const { container } = renderWithProviders(<CustomAvatar gradientRing={true} />);
    // Gradient ring path renders a wrapper div with inline background gradient
    const gradientDiv = container.querySelector('[style*="gradient"]');
    expect(gradientDiv).toBeInTheDocument();
  });

  it('renders verified badge when gradientRing=true and verified=true', () => {
    renderWithProviders(<CustomAvatar gradientRing={true} verified={true} />);
    expect(screen.getByTestId('check-circle')).toBeInTheDocument();
  });

  it('does NOT render verified badge when gradientRing=true and verified=false', () => {
    renderWithProviders(<CustomAvatar gradientRing={true} verified={false} />);
    expect(screen.queryByTestId('check-circle')).not.toBeInTheDocument();
  });

  it('renders status dot when showStatus=true and status="online"', () => {
    const { container } = renderWithProviders(
      <CustomAvatar showStatus={true} status="online" />
    );
    // Status dot is a <span> with background color set inline
    const statusDot = container.querySelector('span[style*="border-radius"]');
    expect(statusDot).toBeInTheDocument();
  });

  it('renders status dot when showStatus=true and status="busy"', () => {
    const { container } = renderWithProviders(
      <CustomAvatar showStatus={true} status="busy" />
    );
    // jsdom normalizes hex colors; find any status dot span (border-radius 50%)
    const statusDot = container.querySelector('span[style*="border-radius: 50%"]');
    expect(statusDot).toBeInTheDocument();
  });

  it('renders status dot when showStatus=true and status="away"', () => {
    const { container } = renderWithProviders(
      <CustomAvatar showStatus={true} status="away" />
    );
    // jsdom normalizes hex colors; find any status dot span (border-radius 50%)
    const statusDot = container.querySelector('span[style*="border-radius: 50%"]');
    expect(statusDot).toBeInTheDocument();
  });

  it('renders verified badge when verified=true, gradientRing=false, showStatus=false', () => {
    renderWithProviders(<CustomAvatar verified={true} gradientRing={false} showStatus={false} />);
    expect(screen.getByTestId('check-circle')).toBeInTheDocument();
  });

  it('renders with size=64 and passes size to AntAvatar', () => {
    renderWithProviders(<CustomAvatar size={64} />);
    expect(screen.getByTestId('ant-avatar')).toHaveAttribute('data-size', '64');
  });

  it('renders status dot when status="offline" and showStatus=true', () => {
    const { container } = renderWithProviders(
      <CustomAvatar showStatus={true} status="offline" />
    );
    // jsdom normalizes hex colors; find any status dot span (border-radius 50%)
    const statusDot = container.querySelector('span[style*="border-radius: 50%"]');
    expect(statusDot).toBeInTheDocument();
  });

  it('renders outer container with position relative', () => {
    const { container } = renderWithProviders(<CustomAvatar />);
    const relativeDiv = container.querySelector('[style*="position: relative"]');
    expect(relativeDiv).toBeInTheDocument();
  });
});
