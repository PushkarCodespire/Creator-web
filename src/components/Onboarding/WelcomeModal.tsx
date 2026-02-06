// ===========================================
// WELCOME MODAL COMPONENT
// First-time user onboarding
// ===========================================

import { useState } from 'react';
import { Modal, Button, Steps } from 'antd';
import {
  RocketOutlined,
  SearchOutlined,
  MessageOutlined,
  FireOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, spacing } from '../../styles/tokens';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete?: () => void;
  userName?: string;
}

const onboardingSteps = [
  {
    title: 'Welcome to Creator Platform',
    icon: <RocketOutlined style={{ fontSize: '64px', color: colors.primary.solid }} />,
    description: 'Connect with your favorite creators through AI-powered conversations',
    content: (
      <div style={{ textAlign: 'center', padding: spacing[6] }}>
        <p style={{ fontSize: '18px', color: colors.gray[700], marginBottom: spacing[4] }}>
          Get personalized advice, insights, and responses from AI versions of top creators - available 24/7!
        </p>
        <ul
          style={{
            textAlign: 'left',
            fontSize: '16px',
            color: colors.gray[600],
            listStyle: 'none',
            padding: 0,
          }}
        >
          <li style={{ marginBottom: spacing[2] }}>
            ✅ Chat with AI creators anytime
          </li>
          <li style={{ marginBottom: spacing[2] }}>
            ✅ Follow creators and get updates
          </li>
          <li style={{ marginBottom: spacing[2] }}>
            ✅ Discover trending content
          </li>
          <li style={{ marginBottom: spacing[2] }}>
            ✅ Personalized recommendations
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Discover Creators',
    icon: <SearchOutlined style={{ fontSize: '64px', color: colors.success.solid }} />,
    description: 'Browse thousands of creators across different categories',
    content: (
      <div style={{ textAlign: 'center', padding: spacing[6] }}>
        <p style={{ fontSize: '18px', color: colors.gray[700], marginBottom: spacing[4] }}>
          Find creators in Fitness, Tech, Business, Lifestyle, and more!
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2], justifyContent: 'center' }}>
          {['💪 Fitness', '💻 Tech', '💼 Business', '🌟 Lifestyle', '📚 Education', '🎬 Entertainment'].map(
            (category) => (
              <div
                key={category}
                style={{
                  padding: `${spacing[2]}px ${spacing[4]}px`,
                  background: colors.gray[100],
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {category}
              </div>
            )
          )}
        </div>
      </div>
    ),
  },
  {
    title: 'Start Chatting',
    icon: <MessageOutlined style={{ fontSize: '64px', color: colors.warning.solid }} />,
    description: 'Have meaningful conversations powered by AI',
    content: (
      <div style={{ textAlign: 'center', padding: spacing[6] }}>
        <p style={{ fontSize: '18px', color: colors.gray[700], marginBottom: spacing[4] }}>
          Each AI is trained on the creator's content, personality, and expertise
        </p>
        <div
          style={{
            background: colors.gray[50],
            padding: spacing[4],
            borderRadius: '12px',
            marginTop: spacing[4],
          }}
        >
          <div style={{ display: 'flex', gap: spacing[3], alignItems: 'flex-start' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: colors.primary.solid,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              AI
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div
                style={{
                  background: 'white',
                  padding: spacing[3],
                  borderRadius: '12px',
                  fontSize: '14px',
                }}
              >
                "I can help you with personalized fitness routines, nutrition advice, and motivation to reach your
                goals!"
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Follow & Stay Updated',
    icon: <FireOutlined style={{ fontSize: '64px', color: colors.error.solid }} />,
    description: 'Get personalized recommendations and trending content',
    content: (
      <div style={{ textAlign: 'center', padding: spacing[6] }}>
        <p style={{ fontSize: '18px', color: colors.gray[700], marginBottom: spacing[4] }}>
          Build your personalized feed by following creators
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3], marginTop: spacing[4] }}>
          <div style={{ padding: spacing[4], background: colors.primary.subtle, borderRadius: '12px' }}>
            <div style={{ fontSize: '32px', marginBottom: spacing[2] }}>📱</div>
            <div style={{ fontWeight: 600, marginBottom: spacing[1] }}>Social Feed</div>
            <div style={{ fontSize: '14px', color: colors.gray[600] }}>
              See posts from creators you follow
            </div>
          </div>
          <div style={{ padding: spacing[4], background: colors.warning.subtle, borderRadius: '12px' }}>
            <div style={{ fontSize: '32px', marginBottom: spacing[2] }}>🔥</div>
            <div style={{ fontWeight: 600, marginBottom: spacing[1] }}>Trending</div>
            <div style={{ fontSize: '14px', color: colors.gray[600] }}>
              Discover what's hot right now
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  visible,
  onClose,
  onComplete,
  userName,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark onboarding as complete in localStorage
    localStorage.setItem('onboarding_completed', 'true');

    if (onComplete) {
      onComplete();
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onClose();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Modal
      open={visible}
      onCancel={handleSkip}
      footer={null}
      width={700}
      centered
      closable={false}
    >
      <div style={{ padding: spacing[4] }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: spacing[6] }}>
          {userName && (
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '28px', fontWeight: 700, marginBottom: spacing[2] }}
            >
              Welcome, {userName}! 👋
            </motion.h2>
          )}
          <Steps current={currentStep} size="small" style={{ maxWidth: '500px', margin: '0 auto' }}>
            {onboardingSteps.map((step, index) => (
              <Steps.Step key={index} />
            ))}
          </Steps>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ textAlign: 'center', marginBottom: spacing[4] }}>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {currentStepData.icon}
              </motion.div>
              <h3 style={{ fontSize: '24px', fontWeight: 600, margin: `${spacing[4]}px 0 ${spacing[2]}px` }}>
                {currentStepData.title}
              </h3>
              <p style={{ fontSize: '16px', color: colors.gray[600] }}>
                {currentStepData.description}
              </p>
            </div>

            <div>{currentStepData.content}</div>
          </motion.div>
        </AnimatePresence>

        {/* Footer Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: spacing[6],
            paddingTop: spacing[4],
            borderTop: `1px solid ${colors.gray[200]}`,
          }}
        >
          <Button onClick={handleSkip} size="large">
            Skip Tutorial
          </Button>

          <div style={{ display: 'flex', gap: spacing[2] }}>
            {currentStep > 0 && (
              <Button onClick={handlePrevious} size="large">
                Previous
              </Button>
            )}
            <Button type="primary" onClick={handleNext} size="large">
              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  Get Started <CheckCircleOutlined />
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
