// ===========================================
// 500 SERVER ERROR PAGE
// ===========================================

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeOutlined, ReloadOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import CustomButton from '../components/common/Button/CustomButton';
import { colors, typography, spacing } from '../styles/tokens';
import { fadeIn, slideUp, scaleIn } from '../styles/animations';

const ServerError = () => {
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.gray[50],
        padding: spacing[4],
      }}
    >
      <motion.div variants={fadeIn} style={{ maxWidth: '600px', textAlign: 'center' }}>
        {/* Animated 500 Illustration */}
        <motion.div variants={scaleIn} style={{ marginBottom: spacing[8] }}>
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Server Icon */}
            <motion.rect
              x="50"
              y="40"
              width="100"
              height="30"
              rx="5"
              stroke={colors.error.solid}
              strokeWidth="4"
              fill="none"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            />
            <motion.rect
              x="50"
              y="85"
              width="100"
              height="30"
              rx="5"
              stroke={colors.error.solid}
              strokeWidth="4"
              fill="none"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            <motion.rect
              x="50"
              y="130"
              width="100"
              height="30"
              rx="5"
              stroke={colors.error.solid}
              strokeWidth="4"
              fill="none"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            />
            {/* Alert Symbol */}
            <motion.circle
              cx="100"
              cy="100"
              r="50"
              fill={colors.error.light}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            />
            <motion.text
              x="100"
              y="115"
              textAnchor="middle"
              fontSize="50"
              fontWeight="bold"
              fill={colors.error.solid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              !
            </motion.text>
          </svg>
        </motion.div>

        {/* Content */}
        <motion.div variants={slideUp}>
          <h1
            style={{
              fontSize: typography.fontSize['5xl'],
              fontWeight: typography.fontWeight.bold,
              marginBottom: spacing[4],
              color: colors.gray[900],
            }}
          >
            500
          </h1>
          <h2
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing[3],
              color: colors.gray[800],
            }}
          >
            Server Error
          </h2>
          <p
            style={{
              fontSize: typography.fontSize.lg,
              color: colors.gray[600],
              marginBottom: spacing[8],
              lineHeight: '1.6',
            }}
          >
            Something went wrong on our end. Our team has been notified and is working to fix the issue.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: spacing[4],
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <CustomButton
              variant="primary"
              gradient
              size="large"
              icon={<ReloadOutlined />}
              onClick={handleReload}
            >
              Reload Page
            </CustomButton>
            <CustomButton
              variant="secondary"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
            >
              Go Home
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="large"
              icon={<CustomerServiceOutlined />}
              onClick={() => window.open('mailto:support@creatorplatform.com')}
            >
              Contact Support
            </CustomButton>
          </div>

          {/* Status Message */}
          <div
            style={{
              marginTop: spacing[8],
              padding: spacing[4],
              background: colors.gray[100],
              borderRadius: '12px',
              fontSize: typography.fontSize.sm,
              color: colors.gray[600],
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Error Code:</strong> 500 - Internal Server Error
              <br />
              <strong>Time:</strong> {new Date().toLocaleString()}
            </p>
          </div>
        </motion.div>

        {/* Floating Animation */}
        <motion.div
          style={{
            position: 'absolute',
            top: '15%',
            right: '15%',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: colors.error.light,
            opacity: 0.2,
            zIndex: -1,
          }}
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '15%',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: colors.warning.light,
            opacity: 0.2,
            zIndex: -1,
          }}
          animate={{
            y: [0, 15, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default ServerError;
