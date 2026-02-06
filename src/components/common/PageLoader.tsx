// ===========================================
// PAGE LOADER COMPONENT
// ===========================================

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { colors, spacing } from '../../styles/tokens';

export const PageLoader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: colors.gray[50],
      }}
    >
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 48, color: colors.primary.solid }} spin />}
        size="large"
      />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          marginTop: spacing[4],
          fontSize: '16px',
          color: colors.gray[600],
        }}
      >
        Loading...
      </motion.p>
    </motion.div>
  );
};

export default PageLoader;
