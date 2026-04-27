import { renderWithProviders } from '../../__tests__/helpers/renderWithProviders';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams('error=Card+declined'), vi.fn()],
  };
});

import PaymentFailure from '../PaymentFailure';

describe('PaymentFailure', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<PaymentFailure />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with no error param', () => {
    const { container } = renderWithProviders(<PaymentFailure />);
    expect(container.firstChild).toBeTruthy();
  });
});
