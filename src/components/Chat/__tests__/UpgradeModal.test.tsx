import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('../../../components/Chat/UpgradeModal.css', () => ({}));

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

import UpgradeModal from '../UpgradeModal';

describe('UpgradeModal', () => {
  it('renders without crashing when closed', () => {
    const { container } = renderWithProviders(
      <UpgradeModal open={false} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders when open', () => {
    const { container } = renderWithProviders(
      <UpgradeModal open={true} onClose={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });
});
