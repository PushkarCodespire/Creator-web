import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, CheckCircle, Rocket } from 'lucide-react';

interface OnboardingProcessingProps {
  onComplete: () => void;
  status: 'processing' | 'training' | 'completed';
}

const OnboardingProcessing: React.FC<OnboardingProcessingProps> = ({ onComplete, status }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (status === 'processing') {
      setPercent(0);
      interval = setInterval(() => setPercent(prev => Math.min(100, prev + 4)), 500);
    } else if (status === 'training') {
      setPercent(0);
      interval = setInterval(() => setPercent(prev => Math.min(100, prev + 2)), 800);
    } else if (status === 'completed') {
      setPercent(100);
      setTimeout(onComplete, 2500);
    }
    return () => clearInterval(interval);
  }, [status, onComplete]);

  const steps = [
    { key: 'processing', label: 'Content Processing', desc: 'Extracting knowledge from your sources', icon: <Search size={18} /> },
    { key: 'training', label: 'AI Training', desc: 'Building your digital twin', icon: <Zap size={18} /> },
    { key: 'completed', label: 'Ready to Launch', desc: 'Your AI is ready to meet your fans', icon: <Rocket size={18} /> },
  ];

  const getStepState = (stepKey: string) => {
    const order = ['processing', 'training', 'completed'];
    const currentIdx = order.indexOf(status);
    const stepIdx = order.indexOf(stepKey);
    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Icon */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 20 }}
        >
          <motion.div
            animate={status !== 'completed' ? { rotate: 360 } : {}}
            transition={status !== 'completed' ? { duration: 8, repeat: Infinity, ease: 'linear' } : {}}
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: status === 'completed'
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #ff5b1f 0%, #ff3e48 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: status === 'completed'
                ? '0 8px 24px rgba(16,185,129,0.3)'
                : '0 8px 24px rgba(255,62,72,0.3)',
            }}
          >
            {status === 'processing' && <Search size={28} color="#fff" />}
            {status === 'training' && <Zap size={28} color="#fff" />}
            {status === 'completed' && <CheckCircle size={28} color="#fff" />}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Title */}
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 6, letterSpacing: '-0.01em' }}>
        {status === 'processing' && 'Processing Your Content...'}
        {status === 'training' && 'Training Your AI...'}
        {status === 'completed' && 'Your AI is Live!'}
      </h2>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28 }}>
        {status === 'processing' && 'Extracting knowledge from your content'}
        {status === 'training' && 'Calibrating your AI personality'}
        {status === 'completed' && 'Your creator AI is ready to chat with fans'}
      </p>

      {/* Progress bar */}
      <div style={{ maxWidth: 400, margin: '0 auto 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Progress</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: status === 'completed' ? '#10b981' : '#ff3e48' }}>{Math.floor(percent)}%</span>
        </div>
        <div style={{ width: '100%', height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: 4,
              background: status === 'completed'
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #ff5b1f, #ff3e48)',
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div style={{ maxWidth: 360, margin: '0 auto', textAlign: 'left' }}>
        {steps.map((step, i) => {
          const state = getStepState(step.key);
          return (
            <div key={step.key} style={{ display: 'flex', gap: 14, marginBottom: i < steps.length - 1 ? 20 : 0 }}>
              {/* Icon circle */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: state === 'done' ? '#ecfdf5' : state === 'active' ? '#fff5f5' : '#f9fafb',
                border: `1.5px solid ${state === 'done' ? '#10b981' : state === 'active' ? '#ff3e48' : '#e5e7eb'}`,
                color: state === 'done' ? '#10b981' : state === 'active' ? '#ff3e48' : '#9ca3af',
                transition: 'all 0.3s ease',
              }}>
                {state === 'done' ? <CheckCircle size={16} /> : step.icon}
              </div>
              {/* Text */}
              <div style={{ flex: 1, paddingTop: 2 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: state === 'pending' ? '#9ca3af' : '#111827',
                  transition: 'color 0.3s ease',
                }}>
                  {step.label}
                </div>
                <div style={{
                  fontSize: 12,
                  color: state === 'pending' ? '#d1d5db' : '#6b7280',
                  marginTop: 2,
                }}>
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Go to dashboard button (only when completed) */}
      {status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: 28 }}
        >
          <button
            type="button"
            onClick={onComplete}
            style={{
              padding: '12px 36px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #ff5b1f 0%, #ff3e48 100%)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255,62,72,0.3)',
            }}
          >
            Go to Dashboard →
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default OnboardingProcessing;
