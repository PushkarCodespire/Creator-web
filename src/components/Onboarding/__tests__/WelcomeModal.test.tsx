vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    h2: ({ children, ...p }: any) => <h2 {...p}>{children}</h2>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import WelcomeModal from '../WelcomeModal';

describe('WelcomeModal', () => {
  it('renders when visible', () => {
    const { container } = renderWithProviders(
      <WelcomeModal visible={true} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders with userName', () => {
    const { container } = renderWithProviders(
      <WelcomeModal visible={true} onClose={vi.fn()} userName="Alice" />
    );
    expect(container).toBeTruthy();
  });

  it('renders when not visible', () => {
    const { container } = renderWithProviders(
      <WelcomeModal visible={false} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });
});
