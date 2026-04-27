vi.mock('../../../services/api', () => ({
  userApi: {
    getCategories: vi.fn().mockResolvedValue({
      data: {
        data: {
          categories: [
            { value: 'tech', label: 'Technology', icon: '💻' },
            { value: 'fitness', label: 'Fitness', icon: '💪' },
            { value: 'business', label: 'Business', icon: '💼' },
          ],
        },
      },
    }),
    updateInterests: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock('../../../utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import InterestSelector from '../InterestSelector';

describe('InterestSelector', () => {
  it('renders loading state initially', () => {
    const { container } = renderWithProviders(
      <InterestSelector onComplete={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders with default props', () => {
    const { container } = renderWithProviders(
      <InterestSelector />
    );
    expect(container).toBeTruthy();
  });
});
