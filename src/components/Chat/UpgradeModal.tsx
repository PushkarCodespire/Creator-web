// ===========================================
// Subscription Upgrade Modal Component
// Shows when user hits message limit
// ===========================================

import { Modal, Button, Typography, Row, Col, Tag } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, CrownOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './UpgradeModal.css';

const { Title, Text } = Typography;

interface UpgradeModalProps {
    visible: boolean;
    onClose: () => void;
    remainingMessages: number;
    resetAt?: string;
    reason?: 'voice_limit';
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ visible, onClose, remainingMessages, resetAt, reason }) => {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        onClose();
        navigate('/subscription/plans');
    };

    const getTimeUntilReset = () => {
        if (!resetAt) return 'tomorrow';
        const now = new Date();
        const reset = new Date(resetAt);
        const hours = Math.floor((reset.getTime() - now.getTime()) / (1000 * 60 * 60));

        if (hours < 1) return 'less than an hour';
        if (hours === 1) return '1 hour';
        if (hours < 24) return `${hours} hours`;
        return 'tomorrow';
    };

    const freePlanFeatures = [
        { text: '5 messages/day per creator', included: true },
        { text: 'Basic AI responses', included: true },
        { text: 'Limited conversation history', included: true },
        { text: '2 free voice replies (lifetime)', included: true },
        { text: 'Daily limit resets', included: false },
        { text: 'Priority support', included: false },
        { text: 'Advanced AI models', included: false },
    ];

    const premiumPlanFeatures = [
        { text: 'Unlimited messages', included: true },
        { text: 'Unlimited voice replies', included: true },
        { text: 'Advanced AI responses', included: true },
        { text: 'Full conversation history', included: true },
        { text: 'No daily limits', included: true },
        { text: 'Priority support', included: true },
        { text: 'GPT-4 access', included: true },
    ];

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            centered
            className="upgrade-modal"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        fontSize: '48px',
                        marginBottom: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        <CrownOutlined />
                    </div>
                    <Title level={2} style={{ marginBottom: '8px', fontWeight: 800 }}>
                        {reason === 'voice_limit'
                            ? 'Voice Limit Reached'
                            : remainingMessages === 0 ? 'Daily Message Limit Reached' : 'Upgrade to Premium'}
                    </Title>
                    <Text style={{ color: '#64748B', fontSize: '16px' }}>
                        {reason === 'voice_limit'
                            ? "You've used your 2 free voice replies. Upgrade to Premium for unlimited voice."
                            : remainingMessages === 0
                                ? `Your free messages will reset in ${getTimeUntilReset()}`
                                : `You have ${remainingMessages} message${remainingMessages === 1 ? '' : 's'} remaining today`
                        }
                    </Text>
                </div>

                {/* Plan Comparison */}
                <Row gutter={24} style={{ marginBottom: '32px' }}>
                    {/* Free Plan */}
                    <Col xs={24} md={12}>
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '20px',
                            padding: '24px',
                            height: '100%'
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <Text style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>
                                    Current Plan
                                </Text>
                                <Title level={3} style={{ margin: '8px 0', fontWeight: 800 }}>
                                    Free
                                </Title>
                                <Text style={{ color: '#64748B' }}>
                                    Great for getting started
                                </Text>
                            </div>

                            <div style={{ marginTop: '24px' }}>
                                {freePlanFeatures.map((feature, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        {feature.included ? (
                                            <CheckCircleFilled style={{ color: '#10B981', fontSize: '18px' }} />
                                        ) : (
                                            <CloseCircleFilled style={{ color: '#EF4444', fontSize: '18px' }} />
                                        )}
                                        <Text style={{ color: feature.included ? '#E2E8F0' : '#64748B' }}>
                                            {feature.text}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>

                    {/* Premium Plan */}
                    <Col xs={24} md={12}>
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                            border: '2px solid #6366F1',
                            borderRadius: '20px',
                            padding: '24px',
                            position: 'relative',
                            height: '100%'
                        }}>
                            <Tag
                                color="blue"
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    borderRadius: '12px',
                                    padding: '4px 12px',
                                    fontSize: '12px',
                                    fontWeight: 600
                                }}
                            >
                                RECOMMENDED
                            </Tag>

                            <div style={{ marginBottom: '20px' }}>
                                <Text style={{ color: '#C7D2FE', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>
                                    Upgrade To
                                </Text>
                                <Title level={3} style={{ margin: '8px 0', fontWeight: 800, color: '#fff' }}>
                                    Premium
                                </Title>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                                    <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#fff' }}>
                                        ₹499
                                    </Title>
                                    <Text style={{ color: '#94A3B8' }}>/month</Text>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px' }}>
                                {premiumPlanFeatures.map((feature, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <CheckCircleFilled style={{ color: '#10B981', fontSize: '18px' }} />
                                        <Text style={{ color: '#E2E8F0', fontWeight: 500 }}>
                                            {feature.text}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Button
                        size="large"
                        onClick={onClose}
                        style={{
                            borderRadius: '12px',
                            padding: '0 32px',
                            height: '48px',
                            fontWeight: 600
                        }}
                    >
                        Maybe Later
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        icon={<RocketOutlined />}
                        onClick={handleUpgrade}
                        style={{
                            borderRadius: '12px',
                            padding: '0 32px',
                            height: '48px',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none'
                        }}
                    >
                        Upgrade to Premium
                    </Button>
                </div>

                {/* Footer Note */}
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Text style={{ color: '#64748B', fontSize: '13px' }}>
                        💳 Cancel anytime • 7-day money-back guarantee
                    </Text>
                </div>
            </motion.div>
        </Modal>
    );
};

export default UpgradeModal;
