import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const DashboardContentLoader: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 200px)',
            width: '100%'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Spin
                    indicator={<LoadingOutlined style={{ fontSize: 44, color: '#6366F1' }} spin />}
                />
            </motion.div>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ marginTop: '16px', color: '#94A3B8', fontWeight: 500 }}
            >
                Loading your experience...
            </motion.p>
        </div>
    );
};

export default DashboardContentLoader;
