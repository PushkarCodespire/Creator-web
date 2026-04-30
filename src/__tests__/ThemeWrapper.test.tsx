vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    ConfigProvider: ({ children, theme }: any) => (
      <div data-testid="config-provider" data-theme={JSON.stringify(theme)}>
        {children}
      </div>
    ),
  };
});

vi.mock('../styles/theme', () => ({
  antdTheme: { token: { colorPrimary: '#7c3aed' } },
  darkTheme: { token: { colorPrimary: '#000' } },
  globalStyles: 'body { margin: 0; }',
}));

import { render, screen, act } from '@testing-library/react';
import ThemeWrapper from '../ThemeWrapper';

describe('ThemeWrapper', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <ThemeWrapper>
        <div>child</div>
      </ThemeWrapper>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <ThemeWrapper>
        <span data-testid="child-el">Hello</span>
      </ThemeWrapper>
    );
    expect(screen.getByTestId('child-el')).toBeInTheDocument();
  });

  it('wraps children in ConfigProvider', () => {
    render(
      <ThemeWrapper>
        <div>wrapped</div>
      </ThemeWrapper>
    );
    expect(screen.getByTestId('config-provider')).toBeInTheDocument();
  });

  it('injects global design-system styles into document.head', () => {
    render(
      <ThemeWrapper>
        <div />
      </ThemeWrapper>
    );
    const styleTag = document.getElementById('global-design-system-styles');
    expect(styleTag).toBeTruthy();
    expect(styleTag?.textContent).toBe('body { margin: 0; }');
  });

  it('clears localStorage darkMode key on mount', () => {
    localStorage.setItem('darkMode', 'true');
    render(
      <ThemeWrapper>
        <div />
      </ThemeWrapper>
    );
    expect(localStorage.getItem('darkMode')).toBeNull();
  });

  it('responds to storage events and toggles dark mode', () => {
    render(
      <ThemeWrapper>
        <div />
      </ThemeWrapper>
    );

    // Simulate another tab setting darkMode=true in localStorage
    localStorage.setItem('darkMode', 'true');
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'darkMode', newValue: 'true' }));
    });

    // The ConfigProvider should now carry the darkTheme token
    const provider = screen.getByTestId('config-provider');
    const themeData = JSON.parse(provider.getAttribute('data-theme') || '{}');
    // darkTheme sets colorPrimary to '#000'
    expect(themeData.token?.colorPrimary).toBe('#000');
  });

  it('responds to custom darkModeChange events', () => {
    render(
      <ThemeWrapper>
        <div />
      </ThemeWrapper>
    );

    localStorage.setItem('darkMode', 'true');
    act(() => {
      window.dispatchEvent(new Event('darkModeChange'));
    });

    const themeData = JSON.parse(
      screen.getByTestId('config-provider').getAttribute('data-theme') || '{}'
    );
    expect(themeData.token?.colorPrimary).toBe('#000');
  });

  it('renders multiple children', () => {
    render(
      <ThemeWrapper>
        <p data-testid="p1">One</p>
        <p data-testid="p2">Two</p>
      </ThemeWrapper>
    );
    expect(screen.getByTestId('p1')).toBeInTheDocument();
    expect(screen.getByTestId('p2')).toBeInTheDocument();
  });
});
