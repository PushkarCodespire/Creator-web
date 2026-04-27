import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div>, span: ({ children, ...p }: any) => <span {...p}>{children}</span> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import OnboardingProcessing from '../OnboardingProcessing';

describe('OnboardingProcessing', () => {
  it('renders processing status', () => {
    const { container } = renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="processing" />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders completed status', () => {
    const { container } = renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="completed" />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
