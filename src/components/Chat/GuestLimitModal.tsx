import React from 'react';
import { Modal, Button, Typography, Space } from 'antd';
import { UserOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface GuestLimitModalProps {
    visible: boolean;
    onClose: () => void;
}

const GuestLimitModal: React.FC<GuestLimitModalProps> = ({ visible, onClose }) => {
    const navigate = useNavigate();

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={500}
            centered
            className="guest-limit-modal"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ textAlign: 'center', padding: '24px' }}
            >
                <div style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    color: '#6366F1'
                }}>
                    <UserOutlined />
                </div>

                <Title level={3} style={{ marginBottom: '16px' }}>
                    Enjoying the chat?
                </Title>

                <Text style={{ display: 'block', fontSize: '16px', color: '#64748B', marginBottom: '32px' }}>
                    You've reached the free message limit for guests. Create a free account to continue chatting and unlock more features!
                </Text>

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<LoginOutlined />}
                        onClick={() => navigate('/register')}
                        block
                        style={{ height: '48px', fontSize: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                    >
                        Create Free Account
                    </Button>

                    <Button
                        type="text"
                        onClick={() => navigate('/login')}
                        style={{ color: '#64748B' }}
                    >
                        Already have an account? Log in
                    </Button>
                </Space>
            </motion.div>
        </Modal>
    );
};

export default GuestLimitModal;
