// ===========================================
// REFERRAL PROGRAM COMPONENT
// Share referral links and track referrals
// ===========================================

import { useState, useEffect } from 'react';
import { Card, Button, Input, Statistic, List, Tag, message as antMessage } from 'antd';
import { ShareAltOutlined, CopyOutlined, GiftOutlined, UserAddOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import CustomCard from '../common/Card/CustomCard';
import { colors, spacing, typography } from '../../styles/tokens';
import { ShareDialog } from './ShareDialog';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  rewardsEarned: number;
  referralCode: string;
}

export const ReferralProgram: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    rewardsEarned: 0,
    referralCode: user?.id?.substring(0, 8).toUpperCase() || 'REFERRAL',
  });
  const [shareDialogVisible, setShareDialogVisible] = useState(false);

  const referralUrl = `${window.location.origin}/register?ref=${stats.referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      antMessage.success('Referral link copied!');
    } catch (error) {
      antMessage.error('Failed to copy link');
    }
  };

  return (
    <>
      <CustomCard depth={1} title="Referral Program">
        <div style={{ marginBottom: spacing[6] }}>
          <div style={{ textAlign: 'center', marginBottom: spacing[4] }}>
            <GiftOutlined style={{ fontSize: '48px', color: colors.primary.solid, marginBottom: spacing[2] }} />
            <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
              Invite Friends, Earn Rewards
            </h3>
            <p style={{ color: colors.gray[600] }}>
              Share your referral link and earn rewards when friends sign up!
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[4], marginBottom: spacing[6] }}>
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Total Referrals"
                value={stats.totalReferrals}
                prefix={<UserAddOutlined />}
                valueStyle={{ color: colors.primary.solid }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Active"
                value={stats.activeReferrals}
                valueStyle={{ color: colors.success.solid }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Rewards Earned"
                value={stats.rewardsEarned}
                prefix="₹"
                precision={2}
                valueStyle={{ color: colors.warning.solid }}
              />
            </div>
          </div>

          {/* Referral Link */}
          <div style={{ marginBottom: spacing[4] }}>
            <div style={{ marginBottom: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium }}>
              Your Referral Link:
            </div>
            <Input.Group compact>
              <Input
                value={referralUrl}
                readOnly
                style={{ flex: 1 }}
              />
              <Button icon={<CopyOutlined />} onClick={handleCopy}>
                Copy
              </Button>
              <Button
                type="primary"
                icon={<ShareAltOutlined />}
                onClick={() => setShareDialogVisible(true)}
              >
                Share
              </Button>
            </Input.Group>
          </div>

          {/* How it works */}
          <div style={{ background: colors.gray[50], padding: spacing[4], borderRadius: '8px' }}>
            <h4 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
              How it works:
            </h4>
            <List
              size="small"
              dataSource={[
                'Share your unique referral link with friends',
                'They sign up using your link',
                'You both earn rewards when they become active users',
                'Track your referrals and earnings in real-time',
              ]}
              renderItem={(item, index) => (
                <List.Item style={{ border: 'none', padding: `${spacing[1]} 0` }}>
                  <span style={{ marginRight: spacing[2], color: colors.primary.solid, fontWeight: typography.fontWeight.bold }}>
                    {index + 1}.
                  </span>
                  {item}
                </List.Item>
              )}
            />
          </div>
        </div>
      </CustomCard>

      <ShareDialog
        visible={shareDialogVisible}
        onClose={() => setShareDialogVisible(false)}
        url={referralUrl}
        title="Join Creator Platform"
        description="Get personalized AI-powered conversations with your favorite creators!"
      />
    </>
  );
};

export default ReferralProgram;



