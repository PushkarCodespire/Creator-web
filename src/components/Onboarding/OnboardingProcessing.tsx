import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress, Steps, Card } from 'antd';
import {
    FileSearchOutlined,
    ThunderboltOutlined,
    RobotOutlined,
    CheckCircleOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import { colors, spacing, typography } from '../../styles/tokens';

interface OnboardingProcessingProps {
    onComplete: () => void;
    status: 'processing' | 'training' | 'completed';
}

const OnboardingProcessing: React.FC<OnboardingProcessingProps> = ({ onComplete, status }) => {
    const [percent, setPercent] = useState(0);

    useEffect(() => {
        let interval: any;
        if (status === 'processing') {
            setPercent(0);
            interval = setInterval(() => {
                setPercent(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return Math.min(100, prev + 4);
                });
            }, 500);
        } else if (status === 'training') {
            setPercent(0);
            interval = setInterval(() => {
                setPercent(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return Math.min(100, prev + 2);
                });
            }, 800);
        } else if (status === 'completed') {
            setPercent(100);
            setTimeout(onComplete, 2000);
        }

        return () => clearInterval(interval);
    }, [status, onComplete]);

    const steps = [
        {
            title: 'Content Processing',
            description: 'Extracting knowledge from your sources',
            status: status === 'processing' ? 'process' : (status === 'training' || status === 'completed' ? 'finish' : 'wait'),
            icon: status === 'processing' ? <LoadingOutlined /> : <FileSearchOutlined />,
        },
        {
            title: 'AI Training',
            description: 'Building your digital twin',
            status: status === 'training' ? 'process' : (status === 'completed' ? 'finish' : 'wait'),
            icon: status === 'training' ? <LoadingOutlined /> : <ThunderboltOutlined />,
        },
        {
            title: 'Ready to Launch',
            description: 'Your AI is ready to meet your fans',
            status: status === 'completed' ? 'finish' : 'wait',
            icon: <CheckCircleOutlined />,
        },
    ];

    return (
        <div style={{ padding: spacing[8], textAlign: 'center', color: '#fff' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={status}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div style={{ marginBottom: spacing[8] }}>
                        <motion.div
                            animate={{
                                rotate: status === 'completed' ? 0 : 360,
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                                scale: { duration: 2, repeat: Infinity }
                            }}
                            style={{
                                fontSize: '80px',
                                marginBottom: spacing[6],
                                color: status === 'completed' ? colors.success.solid : colors.primary.solid,
                                textShadow: '0 0 30px rgba(102, 126, 234, 0.5)'
                            }}
                        >
                            {status === 'processing' && <FileSearchOutlined />}
                            {status === 'training' && <RobotOutlined />}
                            {status === 'completed' && <CheckCircleOutlined />}
                        </motion.div>

                        <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: spacing[3], color: '#fff' }}>
                            {status === 'processing' && 'Mining Your Knowledge...'}
                            {status === 'training' && 'Synthesizing Your Digital Twin...'}
                            {status === 'completed' && "Convergence Complete"}
                        </h2>
                        <p style={{ color: colors.gray[400], fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}>
                            {status === 'processing' && 'We are deep-learning your content to encode your expertise.'}
                            {status === 'training' && 'Calibrating neural weights to match your unique persona.'}
                            {status === 'completed' && 'Your AI entity is stable and ready for deployment.'}
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: spacing[8],
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        <Progress
                            percent={Math.floor(percent)}
                            status="active"
                            strokeColor={{
                                '0%': colors.primary.solid,
                                '100%': colors.primary.end,
                            }}
                            strokeWidth={15}
                            trailColor="rgba(255,255,255,0.05)"
                            format={(p) => <span style={{ color: '#fff' }}>{Math.floor(p ?? 0)}%</span>}
                        />
                        <div style={{ marginTop: spacing[10], textAlign: 'left' }}>
                            <Steps
                                direction="vertical"
                                current={status === 'processing' ? 0 : (status === 'training' ? 1 : 2)}
                                items={steps.map(s => ({
                                    ...s,
                                    status: s.status as any,
                                    title: <span style={{ color: '#fff' }}>{s.title}</span>,
                                    description: <span style={{ color: '#888' }}>{s.description}</span>
                                }))}
                                className="processing-steps"
                            />
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <style>{`
        .processing-steps .ant-steps-item-icon {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .processing-steps .ant-steps-item-process .ant-steps-item-icon {
          background: ${colors.primary.solid} !important;
          border-color: ${colors.primary.solid} !important;
        }
        .processing-steps .ant-steps-icon { color: #fff !important; }
        .ant-progress-text { color: #fff !important; }
      `}</style>
        </div>
    );
};

export default OnboardingProcessing;
