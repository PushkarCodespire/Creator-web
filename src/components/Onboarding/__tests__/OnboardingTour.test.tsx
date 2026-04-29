vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    Tour: ({ open, onClose, onFinish, current, steps }: any) => {
      if (!open) return null;
      const step = steps?.[current] ?? steps?.[0];
      return (
        <div data-testid="tour-overlay">
          <div data-testid="tour-title">{step?.title}</div>
          <div data-testid="tour-description">{step?.description}</div>
          <button
            data-testid="tour-finish"
            onClick={onFinish}
          >
            {step?.nextButtonProps?.children ?? 'Finish'}
          </button>
          <button data-testid="tour-skip" onClick={onClose}>
            Skip
          </button>
        </div>
      );
    },
  };
});

import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';
import {
  OnboardingTour,
  getUserTourSteps,
  getCreatorTourSteps,
} from '../OnboardingTour';

const baseSteps = [
  { title: 'Step One', description: 'First step description', target: () => null },
  { title: 'Step Two', description: 'Second step description', target: () => null },
];

beforeEach(() => {
  localStorage.clear();
});

describe('OnboardingTour', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <OnboardingTour steps={baseSteps} />
    );
    expect(container.firstChild).not.toBeNull();
  });

  it('shows the tour overlay when onboarding_completed is not set', () => {
    renderWithProviders(<OnboardingTour steps={baseSteps} />);
    expect(screen.getByTestId('tour-overlay')).toBeInTheDocument();
  });

  it('does NOT show the tour overlay when onboarding_completed is already set', () => {
    localStorage.setItem('onboarding_completed', 'true');
    renderWithProviders(<OnboardingTour steps={baseSteps} />);
    expect(screen.queryByTestId('tour-overlay')).toBeNull();
  });

  it('renders the first step title', () => {
    renderWithProviders(<OnboardingTour steps={baseSteps} />);
    expect(screen.getByTestId('tour-title').textContent).toBe('Step One');
  });

  it('renders the first step description', () => {
    renderWithProviders(<OnboardingTour steps={baseSteps} />);
    expect(screen.getByTestId('tour-description').textContent).toBe('First step description');
  });

  it('calls onComplete and sets localStorage when tour is finished', () => {
    const onComplete = vi.fn();
    renderWithProviders(<OnboardingTour steps={baseSteps} onComplete={onComplete} />);
    act(() => { fireEvent.click(screen.getByTestId('tour-finish')); });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('onboarding_completed')).toBe('true');
  });

  it('calls onSkip and sets localStorage when tour is skipped', () => {
    const onSkip = vi.fn();
    renderWithProviders(<OnboardingTour steps={baseSteps} onSkip={onSkip} />);
    act(() => { fireEvent.click(screen.getByTestId('tour-skip')); });
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('onboarding_completed')).toBe('true');
  });

  it('hides the tour after finish', () => {
    renderWithProviders(<OnboardingTour steps={baseSteps} />);
    act(() => { fireEvent.click(screen.getByTestId('tour-finish')); });
    expect(screen.queryByTestId('tour-overlay')).toBeNull();
  });

  it('hides the tour after skip', () => {
    renderWithProviders(<OnboardingTour steps={baseSteps} />);
    act(() => { fireEvent.click(screen.getByTestId('tour-skip')); });
    expect(screen.queryByTestId('tour-overlay')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Predefined step factories
// ---------------------------------------------------------------------------

describe('getUserTourSteps', () => {
  it('returns an array of steps', () => {
    const steps = getUserTourSteps();
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
  });

  it('first step has a title and description', () => {
    const [first] = getUserTourSteps();
    expect(typeof first.title).toBe('string');
    expect(first.title.length).toBeGreaterThan(0);
    expect(typeof first.description).toBe('string');
  });

  it('each step has a target function', () => {
    getUserTourSteps().forEach((step) => {
      expect(typeof step.target).toBe('function');
    });
  });
});

describe('getCreatorTourSteps', () => {
  it('returns an array of steps', () => {
    const steps = getCreatorTourSteps();
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
  });

  it('first step mentions creator', () => {
    const [first] = getCreatorTourSteps();
    expect(first.title.toLowerCase()).toContain('creator');
  });

  it('each step has a target function', () => {
    getCreatorTourSteps().forEach((step) => {
      expect(typeof step.target).toBe('function');
    });
  });
});
