vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import GuestLimitModal from '../GuestLimitModal';

describe('GuestLimitModal', () => {
  it('renders when visible', () => {
    const { container } = renderWithProviders(
      <GuestLimitModal visible={true} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders when not visible', () => {
    const { container } = renderWithProviders(
      <GuestLimitModal visible={false} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });
});
