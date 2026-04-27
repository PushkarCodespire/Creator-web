import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('antd', async () => {
  const actual = await vi.importActual<any>('antd');
  return {
    ...actual,
    Tour: ({ open, onFinish, onClose }: any) =>
      open ? (
        <div data-testid="tour">
          <button onClick={onFinish}>Finish</button>
          <button onClick={onClose}>Close</button>
        </div>
      ) : null,
  };
});

import OnboardingTour, { getUserTourSteps, getCreatorTourSteps } from '../OnboardingTour';

const mockSteps = [
  { title: 'Step 1', description: 'Desc 1', target: () => null },
  { title: 'Step 2', description: 'Desc 2', target: () => null },
];

describe('OnboardingTour', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders tour when onboarding not completed', () => {
    const { getByTestId } = renderWithProviders(
      <OnboardingTour steps={mockSteps} onComplete={vi.fn()} onSkip={vi.fn()} />
    );
    expect(getByTestId('tour')).toBeTruthy();
  });

  it('does not render tour when already completed', () => {
    localStorage.setItem('onboarding_completed', 'true');
    const { queryByTestId } = renderWithProviders(
      <OnboardingTour steps={mockSteps} onComplete={vi.fn()} onSkip={vi.fn()} />
    );
    expect(queryByTestId('tour')).toBeNull();
  });

  it('calls onComplete when finished', async () => {
    const onComplete = vi.fn();
    const { getByText } = renderWithProviders(
      <OnboardingTour steps={mockSteps} onComplete={onComplete} onSkip={vi.fn()} />
    );
    getByText('Finish').click();
    expect(onComplete).toHaveBeenCalled();
  });

  it('calls onSkip when closed', () => {
    const onSkip = vi.fn();
    const { getByText } = renderWithProviders(
      <OnboardingTour steps={mockSteps} onComplete={vi.fn()} onSkip={onSkip} />
    );
    getByText('Close').click();
    expect(onSkip).toHaveBeenCalled();
  });
});

describe('getUserTourSteps', () => {
  it('returns an array of steps', () => {
    const steps = getUserTourSteps();
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
  });
});

describe('getCreatorTourSteps', () => {
  it('returns an array of steps', () => {
    const steps = getCreatorTourSteps();
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
  });
});
