import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams('orderId=order_123'), vi.fn()],
  };
});

vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import PaymentSuccess from '../PaymentSuccess';

describe('PaymentSuccess', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<PaymentSuccess />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders without orderId', () => {
    const { container } = renderWithProviders(<PaymentSuccess />);
    expect(container.firstChild).toBeTruthy();
  });
});
