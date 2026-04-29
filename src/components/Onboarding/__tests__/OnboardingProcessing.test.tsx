import { renderWithProviders } from '../../../__tests__/helpers/renderWithProviders';

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...p }: any) => <div {...p}>{children}</div>, span: ({ children, ...p }: any) => <span {...p}>{children}</span> },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import { screen } from '@testing-library/react';
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

  it('renders Processing Your Content title for processing status', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="processing" />
    );
    expect(screen.getByText('Processing Your Content...')).toBeInTheDocument();
  });

  it('renders Training Your AI title for training status', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="training" />
    );
    expect(screen.getByText('Training Your AI...')).toBeInTheDocument();
  });

  it('renders Your AI is Live title for completed status', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="completed" />
    );
    expect(screen.getByText('Your AI is Live!')).toBeInTheDocument();
  });

  it('renders Content Processing step label', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="processing" />
    );
    expect(screen.getByText('Content Processing')).toBeInTheDocument();
  });

  it('renders AI Training step label', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="processing" />
    );
    expect(screen.getByText('AI Training')).toBeInTheDocument();
  });

  it('renders Progress label', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="processing" />
    );
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('renders Ready to Launch step label', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="processing" />
    );
    expect(screen.getByText('Ready to Launch')).toBeInTheDocument();
  });

  it('renders step descriptions for processing status', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="processing" />
    );
    expect(screen.getByText('Extracting knowledge from your sources')).toBeInTheDocument();
  });

  it('renders AI Training step description', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="processing" />
    );
    expect(screen.getByText('Building your digital twin')).toBeInTheDocument();
  });

  it('renders Ready to Launch step description', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="processing" />
    );
    expect(screen.getByText('Your AI is ready to meet your fans')).toBeInTheDocument();
  });

  it('renders Go to Dashboard button when status is completed', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="completed" />
    );
    expect(screen.getByText('Go to Dashboard →')).toBeInTheDocument();
  });

  it('does not render Go to Dashboard button when status is processing', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="processing" />
    );
    expect(screen.queryByText('Go to Dashboard →')).not.toBeInTheDocument();
  });

  it('does not render Go to Dashboard button when status is training', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="training" />
    );
    expect(screen.queryByText('Go to Dashboard →')).not.toBeInTheDocument();
  });

  it('calls onComplete when Go to Dashboard button is clicked', () => {
    const onComplete = vi.fn();
    renderWithProviders(
      <OnboardingProcessing onComplete={onComplete} status="completed" />
    );
    screen.getByText('Go to Dashboard →').click();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders subtitle for processing status', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="processing" />
    );
    expect(screen.getByText('Extracting knowledge from your content')).toBeInTheDocument();
  });

  it('renders subtitle for training status', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="training" />
    );
    expect(screen.getByText('Calibrating your AI personality')).toBeInTheDocument();
  });

  it('renders subtitle for completed status', () => {
    renderWithProviders(
      <OnboardingProcessing onComplete={vi.fn()} status="completed" />
    );
    expect(screen.getByText('Your creator AI is ready to chat with fans')).toBeInTheDocument();
  });
});
