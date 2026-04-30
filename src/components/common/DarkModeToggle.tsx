// ===========================================
// DARK MODE TOGGLE COMPONENT
// ===========================================

import { Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';
import useDarkMode from '../../hooks/useDarkMode';
import { colors, spacing } from '../../styles/tokens';

interface DarkModeToggleProps {
  size?: 'small' | 'default';
  showLabel?: boolean;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  size = 'default',
  showLabel = false,
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
      }}
    >
      {showLabel && (
        <span
          style={{
            fontSize: '14px',
            color: isDarkMode ? colors.dark.text.secondary : colors.text.secondary,
          }}
        >
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}

      <Switch
        checked={isDarkMode}
        onChange={toggleDarkMode}
        size={size}
        checkedChildren={
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <BulbFilled style={{ fontSize: size === 'small' ? '12px' : '14px' }} />
          </motion.div>
        }
        unCheckedChildren={
          <BulbOutlined style={{ fontSize: size === 'small' ? '12px' : '14px' }} />
        }
        style={{
          background: isDarkMode ? colors.warning.solid : colors.gray[400],
        }}
      />
    </motion.div>
  );
};

export default DarkModeToggle;
