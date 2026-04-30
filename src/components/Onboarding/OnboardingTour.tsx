// ===========================================
// ONBOARDING TOUR COMPONENT
// Interactive tour for new users
// ===========================================

import { useState, useEffect } from 'react';
import { Tour } from 'antd';

interface TourStep {
  title: string;
  description: string;
  target: () => HTMLElement | null;
  nextButtonText?: string;
  prevButtonText?: string;
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  onComplete,
  onSkip,
}) => {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompleted = localStorage.getItem('onboarding_completed');
    if (!hasCompleted) {
      setOpen(true);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setOpen(false);
    if (onSkip) {
      onSkip();
    }
  };

  const tourSteps = steps.map((step, index) => ({
    title: step.title,
    description: step.description,
    target: step.target as () => HTMLElement,
    nextButtonProps: {
      children: step.nextButtonText || (index === steps.length - 1 ? 'Finish' : 'Next'),
    },
    prevButtonProps: {
      children: step.prevButtonText || 'Previous',
    },
  }));

  return (
    <Tour
      open={open}
      onClose={handleSkip}
      current={current}
      onChange={setCurrent}
      steps={tourSteps}
      onFinish={handleFinish}
      mask={{
        color: 'rgba(0, 0, 0, 0.5)',
      }}
    />
  );
};

// Predefined tour steps for different user types
export const getUserTourSteps = (): TourStep[] => [
  {
    title: 'Welcome to Creator Platform!',
    description: 'Discover AI-powered conversations with your favorite creators. Let\'s take a quick tour.',
    target: () => document.querySelector('[data-tour="hero"]') as HTMLElement,
  },
  {
    title: 'Browse Creators',
    description: 'Explore our gallery of creators. Each one has an AI trained on their expertise.',
    target: () => document.querySelector('[data-tour="gallery"]') as HTMLElement,
  },
  {
    title: 'Start Chatting',
    description: 'Click on any creator to start a conversation. The AI responds just like they would!',
    target: () => document.querySelector('[data-tour="chat-button"]') as HTMLElement,
  },
  {
    title: 'Your Dashboard',
    description: 'Track your conversations, manage subscriptions, and see your activity.',
    target: () => document.querySelector('[data-tour="dashboard"]') as HTMLElement,
  },
];

export const getCreatorTourSteps = (): TourStep[] => [
  {
    title: 'Welcome, Creator!',
    description: 'Let\'s set up your AI profile. This will help users find and chat with you.',
    target: () => document.querySelector('[data-tour="creator-profile"]') as HTMLElement,
  },
  {
    title: 'Train Your AI',
    description: 'Add your content (YouTube videos, blog posts, FAQs) to train your AI clone.',
    target: () => document.querySelector('[data-tour="content-training"]') as HTMLElement,
  },
  {
    title: 'Analytics Dashboard',
    description: 'Track your performance, earnings, and engagement metrics.',
    target: () => document.querySelector('[data-tour="analytics"]') as HTMLElement,
  },
  {
    title: 'Brand Opportunities',
    description: 'Discover and apply for brand deals and collaborations.',
    target: () => document.querySelector('[data-tour="opportunities"]') as HTMLElement,
  },
];

export default OnboardingTour;



