// ===========================================
// COMPARISON CHART COMPONENT - Premium Light Theme
// ===========================================

import React from 'react';
import { Row, Col, Tag, Empty, Typography } from 'antd';
import {
  MessageSquare,
  DollarSign,
  UserPlus,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { colors, spacing, shadows, borderRadius } from '../../styles/tokens';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface ComparativeAnalytics {
  currentPeriod: {
    messages: number;
    revenue: number;
    newUsers: number;
  };
  previousPeriod: {
    messages: number;
    revenue: number;
    newUsers: number;
  };
  change: {
    messages: number;
    revenue: number;
    newUsers: number;
  };
}

interface ComparisonChartProps {
  data: ComparativeAnalytics | null;
  periodDays?: number;
  loading?: boolean;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  periodDays = 30,
  loading = false
}) => {
  if (!data) {
    return (
      <div style={{ padding: '64px', textAlign: 'center', background: '#FFFFFF', borderRadius: '24px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
        <Empty description={<span style={{ color: colors.text.tertiary, fontWeight: 500 }}>No comparison data analyzed yet.</span>} />
      </div>
    );
  }

  const chartData = [
    {
      metric: 'Messages',
      Current: data.currentPeriod.messages,
      Previous: data.previousPeriod.messages
    },
    {
      metric: 'Revenue (₹)',
      Current: data.currentPeriod.revenue,
      Previous: data.previousPeriod.revenue
    },
    {
      metric: 'New Users',
      Current: data.currentPeriod.newUsers,
      Previous: data.previousPeriod.newUsers
    }
  ];

  const getTrendProps = (changePercent: number) => {
    if (changePercent > 0) return { icon: <ArrowUp size={12} />, color: colors.success.solid, bg: colors.success.subtle, prefix: '+' };
    if (changePercent < 0) return { icon: <ArrowDown size={12} />, color: colors.error.solid, bg: colors.error.subtle, prefix: '' };
    return { icon: null, color: colors.text.tertiary, bg: colors.gray[100], prefix: '' };
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '16px',
        border: `1px solid ${colors.gray[200]}`,
        borderRadius: '16px',
        boxShadow: shadows.lg
      }}>
        <div style={{ fontWeight: 800, color: colors.text.primary, marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase' }}>{payload[0].payload.metric}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ color: entry.color, fontWeight: 800, fontSize: '15px', marginBottom: index === 0 ? '4px' : 0 }}>
            {entry.name}: {entry.payload.metric === 'Revenue (₹)' ? '₹' : ''}{entry.value.toLocaleString()}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      background: '#FFFFFF',
      padding: '40px',
      borderRadius: '24px',
      border: `1px solid ${colors.gray[100]}`,
      boxShadow: shadows.md
    }}>
      <div style={{ marginBottom: '40px' }}>
        <Title level={4} style={{ color: colors.text.primary, margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Momentum Comparison</Title>
        <Text style={{ color: colors.text.secondary, fontWeight: 500 }}>Last {periodDays} days vs previous period</Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
        {[
          { label: 'Total Messages', value: data.currentPeriod.messages, prevValue: data.previousPeriod.messages, icon: <MessageSquare size={18} />, change: data.change.messages, color: colors.primary.solid },
          { label: 'Total Revenue', value: data.currentPeriod.revenue, prevValue: data.previousPeriod.revenue, icon: <DollarSign size={18} />, change: data.change.revenue, color: colors.success.solid, isCurrency: true },
          { label: 'New Users', value: data.currentPeriod.newUsers, prevValue: data.previousPeriod.newUsers, icon: <UserPlus size={18} />, change: data.change.newUsers, color: colors.warning.solid }
        ].map((item, i) => (
          <Col xs={24} sm={8} key={i}>
            <motion.div
              whileHover={{ y: -5 }}
              style={{
                background: colors.gray[50],
                padding: '28px',
                borderRadius: '20px',
                border: `1px solid ${colors.gray[100]}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: -5, right: -5, width: 60, height: 60, background: item.color, filter: 'blur(40px)', opacity: 0.05 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <Text style={{ color: colors.text.tertiary, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</Text>
                <Tag bordered={false} style={{
                  borderRadius: '6px',
                  fontWeight: 800,
                  background: getTrendProps(item.change).bg,
                  color: getTrendProps(item.change).color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px'
                }}>
                  {getTrendProps(item.change).icon} {getTrendProps(item.change).prefix}{item.change}%
                </Tag>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: colors.text.primary, marginBottom: '8px', letterSpacing: '-0.02em' }}>
                {item.isCurrency ? '₹' : ''}{item.value.toLocaleString()}
              </div>
              <Text style={{ fontSize: '12px', color: colors.text.tertiary, fontWeight: 600 }}>
                vs {item.isCurrency ? '₹' : ''}{item.prevValue.toLocaleString()} previously
              </Text>
            </motion.div>
          </Col>
        ))}
      </Row>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.gray[100]} />
          <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fill: colors.text.tertiary, fontSize: 13, fontWeight: 700 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.text.tertiary, fontSize: 12, fontWeight: 700 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '32px' }}
            iconType="circle"
            formatter={(value) => <span style={{ color: colors.text.secondary, fontWeight: 600, fontSize: '13px' }}>{value}</span>}
          />
          <Bar dataKey="Current" fill={colors.primary.solid} name="Current Period" radius={[8, 8, 0, 0]} barSize={40} />
          <Bar dataKey="Previous" fill={colors.gray[200]} name="Previous Period" radius={[8, 8, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart;
