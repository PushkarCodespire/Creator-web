// ===========================================
// ACHIEVEMENT BADGE COMPONENT
// Displays achievement badges with animations
// ===========================================

import { Tooltip } from 'antd';
import { TrophyOutlined, FireOutlined, StarFilled, CrownOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { colors, spacing, typography } from '../../styles/tokens';

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked?: boolean;
  progress?: number; // 0-100
  size?: 'small' | 'medium' | 'large';
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  name,
  description,
  icon,
  rarity = 'common',
  unlocked = false,
  progress = 0,
  size = 'medium',
}) => {
  const getRarityColor = () => {
    switch (rarity) {
      case 'legendary':
        return colors.warning.solid;
      case 'epic':
        return colors.error.solid;
      case 'rare':
        return colors.primary.solid;
      default:
        return colors.gray[400];
    }
  };

  const getRarityIcon = () => {
    switch (rarity) {
      case 'legendary':
        return <CrownOutlined />;
      case 'epic':
        return <StarFilled />;
      case 'rare':
        return <FireOutlined />;
      default:
        return <TrophyOutlined />;
    }
  };

  const sizeMap = {
    small: { width: '40px', height: '40px', fontSize: '20px' },
    medium: { width: '60px', height: '60px', fontSize: '28px' },
    large: { width: '80px', height: '80px', fontSize: '36px' },
  };

  const badgeSize = sizeMap[size];

  return (
    <Tooltip title={unlocked ? `${name}: ${description}` : `${name}: ${description} (${progress}% progress)`}>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: badgeSize.width,
          height: badgeSize.height,
          borderRadius: '50%',
          background: unlocked
            ? `linear-gradient(135deg, ${getRarityColor()} 0%, ${getRarityColor()}dd 100%)`
            : colors.gray[200],
          border: `3px solid ${unlocked ? getRarityColor() : colors.gray[300]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          opacity: unlocked ? 1 : 0.6,
          transition: 'all 0.3s ease',
        }}
      >
        {icon ? (
          <span style={{ fontSize: badgeSize.fontSize }}>{icon}</span>
        ) : (
          <div style={{ color: unlocked ? '#fff' : colors.gray[500], fontSize: badgeSize.fontSize }}>
            {getRarityIcon()}
          </div>
        )}
        {!unlocked && progress > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80%',
              height: '4px',
              background: colors.gray[300],
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: getRarityColor(),
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        )}
      </motion.div>
    </Tooltip>
  );
};

export default AchievementBadge;



