// ===========================================
// 404 NOT FOUND PAGE
// ===========================================

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import CustomButton from '../components/common/Button/CustomButton';
import { colors, typography, spacing } from '../styles/tokens';
import { fadeIn, slideUp, scaleIn } from '../styles/animations';

const NotFound = () => {
  const navigate = useNavigate();

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
        {/* Animated 404 Illustration */}
        <motion.div variants={scaleIn} style={{ marginBottom: spacing[8] }}>
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Search Icon */}
            <motion.circle
              cx="80"
              cy="80"
              r="35"
              stroke={colors.primary.solid}
              strokeWidth="6"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
            <motion.line
              x1="105"
              y1="105"
              x2="140"
              y2="140"
              stroke={colors.primary.solid}
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            />
            {/* Question Mark */}
            <motion.text
              x="80"
              y="90"
              textAnchor="middle"
              fontSize="40"
              fontWeight="bold"
              fill={colors.primary.solid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              ?
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
            404
          </h1>
          <h2
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing[3],
              color: colors.gray[800],
            }}
          >
            Page Not Found
          </h2>
          <p
            style={{
              fontSize: typography.fontSize.lg,
              color: colors.gray[600],
              marginBottom: spacing[8],
              lineHeight: '1.6',
            }}
          >
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
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
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
            >
              Go Home
            </CustomButton>
            <CustomButton
              variant="secondary"
              size="large"
              icon={<SearchOutlined />}
              onClick={() => navigate('/creators')}
            >
              Explore Creators
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </CustomButton>
          </div>
        </motion.div>

        {/* Floating Animation */}
        <motion.div
          style={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: colors.primary.light,
            opacity: 0.3,
            zIndex: -1,
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
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
            bottom: '20%',
            left: '10%',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: colors.success.light,
            opacity: 0.3,
            zIndex: -1,
          }}
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
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

export default NotFound;
