vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import AnimatedBackground from '../AnimatedBackground';

describe('AnimatedBackground', () => {
  it('renders children', () => {
    const { getByText } = renderWithProviders(
      <AnimatedBackground>
        <span>Hello World</span>
      </AnimatedBackground>
    );
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <AnimatedBackground>
        <div />
      </AnimatedBackground>
    );
    expect(container.firstChild).toBeTruthy();
  });
});
