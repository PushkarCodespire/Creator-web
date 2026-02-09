// ===========================================
// CREATOR STATS COMPONENT
// Displays engagement metrics and stats
// ===========================================

import { Card, Row, Col, Progress, Tag, Tooltip } from 'antd';
import {
  MessageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { colors, spacing, typography } from '../../styles/tokens';
import CustomCard from '../common/Card/CustomCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CreatorStatsProps {
  totalChats: number;
  totalMessages: number;
  rating?: number;
  responseRate?: number;
  avgResponseTime?: number; // in seconds
  topicExpertise?: Array<{ topic: string; percentage: number }>;
  userSatisfaction?: Array<{ month: string; satisfaction: number }>;
}

export const CreatorStats: React.FC<CreatorStatsProps> = ({
  totalChats,
  totalMessages,
  rating,
  responseRate = 100,
  avgResponseTime = 0,
  topicExpertise = [],
  userSatisfaction = [],
}) => {
  const COLORS = [colors.primary.solid, colors.success.solid, colors.warning.solid, colors.error.solid];

  return (
    <CustomCard depth={1} style={{ marginBottom: spacing[6], background: 'white', color: colors.gray[900] }}>
      <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[4], color: colors.gray[900] }}>
        Performance Stats
      </h3>

      <Row gutter={[16, 16]} style={{ marginBottom: spacing[6] }}>
        <Col xs={24} sm={12} lg={6}>
          <div style={{ textAlign: 'center', padding: spacing[3] }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.primary.solid, marginBottom: spacing[1] }}>
              {responseRate}%
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600], marginBottom: spacing[2] }}>
              Response Rate
            </div>
            <Progress
              type="circle"
              percent={responseRate}
              size={60}
              strokeColor={colors.primary.solid}
              format={() => ''}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div style={{ textAlign: 'center', padding: spacing[3] }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.success.solid, marginBottom: spacing[1] }}>
              {avgResponseTime}s
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>
              <ClockCircleOutlined style={{ marginRight: spacing[1] }} />
              Avg Response Time
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div style={{ textAlign: 'center', padding: spacing[3] }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.warning.solid, marginBottom: spacing[1] }}>
              {totalChats}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>
              <MessageOutlined style={{ marginRight: spacing[1] }} />
              Total Chats
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div style={{ textAlign: 'center', padding: spacing[3] }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.error.solid, marginBottom: spacing[1] }}>
              {rating ? Number(rating).toFixed(1) : 'N/A'}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.gray[600] }}>
              <TrophyOutlined style={{ marginRight: spacing[1] }} />
              Rating
            </div>
          </div>
        </Col>
      </Row>

      {/* Topic Expertise Chart */}
      {topicExpertise.length > 0 && (
        <div style={{ marginBottom: spacing[6] }}>
          <h4 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
            Topic Expertise
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={topicExpertise}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ topic, percentage }: any) => `${topic} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {topicExpertise.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* User Satisfaction Chart */}
      {userSatisfaction.length > 0 && (
        <div>
          <h4 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
            User Satisfaction Trend
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={userSatisfaction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 5]} />
              <RechartsTooltip />
              <Bar dataKey="satisfaction" fill={colors.success.solid} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </CustomCard>
  );
};

export default CreatorStats;



