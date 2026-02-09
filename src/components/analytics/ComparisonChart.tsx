// ===========================================
// COMPARISON CHART COMPONENT - Flagship Redesign
// ===========================================

import React from 'react';
import { Row, Col, Tag, Empty, Typography } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MessageOutlined,
  DollarOutlined,
  UserAddOutlined
} from '@ant-design/icons';
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
import { colors, spacing, shadows } from '../../styles/tokens';
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
      <div style={{ padding: '48px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '32px' }}>
        <Empty description={<span style={{ color: '#94A3B8' }}>No comparison data available yet.</span>} />
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
    if (changePercent > 0) return { icon: <ArrowUpOutlined />, color: 'success', prefix: '+' };
    if (changePercent < 0) return { icon: <ArrowDownOutlined />, color: 'error', prefix: '' };
    return { icon: null, color: 'default', prefix: '' };
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div style={{
        backgroundColor: '#0F172A',
        padding: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: shadows.xl
      }}>
        <div style={{ fontWeight: 800, color: '#F8FAFC', marginBottom: '8px' }}>{payload[0].payload.metric}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ color: entry.color, fontWeight: 700, fontSize: '14px' }}>
            {entry.name}: {entry.metric === 'Revenue (₹)' ? '₹' : ''}{entry.value.toLocaleString()}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(32px)',
      padding: '40px',
      borderRadius: '40px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ marginBottom: '40px' }}>
        <Title level={4} style={{ color: '#FFFFFF', margin: 0 }}>Momentum Comparison</Title>
        <Text style={{ color: '#64748B' }}>Last {periodDays} days vs previous period</Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
        {[
          { label: 'Total Messages', value: data.currentPeriod.messages, prevValue: data.previousPeriod.messages, icon: <MessageOutlined />, change: data.change.messages, color: '#6366F1' },
          { label: 'Total Revenue', value: data.currentPeriod.revenue, prevValue: data.previousPeriod.revenue, icon: '₹', change: data.change.revenue, color: '#10B981', isCurrency: true },
          { label: 'New Users', value: data.currentPeriod.newUsers, prevValue: data.previousPeriod.newUsers, icon: <UserAddOutlined />, change: data.change.newUsers, color: '#F59E0B' }
        ].map((item, i) => (
          <Col xs={24} sm={8} key={i}>
            <motion.div
              whileHover={{ y: -5 }}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '28px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: -5, right: -5, width: 60, height: 60, background: item.color, filter: 'blur(40px)', opacity: 0.1 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <Text style={{ color: '#94A3B8', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>{item.label}</Text>
                <Tag color={getTrendProps(item.change).color} style={{ borderRadius: '6px', fontWeight: 800 }}>
                  {getTrendProps(item.change).icon} {getTrendProps(item.change).prefix}{item.change}%
                </Tag>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#F8FAFC', marginBottom: '8px' }}>
                {item.isCurrency ? '₹' : ''}{item.value.toLocaleString()}
              </div>
              <Text style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                vs {item.isCurrency ? '₹' : ''}{item.prevValue.toLocaleString()} previously
              </Text>
            </motion.div>
          </Col>
        ))}
      </Row>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.03)" />
          <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 700 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '32px' }} iconType="circle" />
          <Bar dataKey="Current" fill={colors.primary.solid} name="Current Period" radius={[8, 8, 0, 0]} barSize={40} />
          <Bar dataKey="Previous" fill="rgba(255, 255, 255, 0.1)" name="Previous Period" radius={[8, 8, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart;
