vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import { RetentionChart } from '../RetentionChart';

const mockData = [
  {
    cohortMonth: '2024-01',
    cohortSize: 100,
    retention: { week1: 80, week2: 60, week4: 45, week8: 30 },
  },
];

describe('RetentionChart', () => {
  it('renders empty state with no data', () => {
    const { container } = renderWithProviders(
      <RetentionChart data={[]} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with data', () => {
    const { container } = renderWithProviders(
      <RetentionChart data={mockData} />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
