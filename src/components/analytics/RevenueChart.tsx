// ===========================================
// REVENUE CHART COMPONENT - Flagship Redesign
// ===========================================

import React from 'react';
import { Empty, Tag, Tooltip, Typography } from 'antd';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line
} from 'recharts';
import {
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { colors, spacing, shadows } from '../../styles/tokens';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface RevenueForecast {
  historical: Array<{ month: string; revenue: number }>;
  forecast: Array<{ month: string; revenue: number; confidence: { low: number; high: number } }>;
  trend: 'increasing' | 'stable' | 'decreasing';
  growthRate: number;
}

interface RevenueChartProps {
  data: RevenueForecast | null;
  loading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, loading = false }) => {
  if (!data || !data.historical || data.historical.length === 0) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '32px' }}>
        <Empty description={<span style={{ color: '#94A3B8' }}>No revenue data available yet.</span>} />
      </div>
    );
  }

  const chartData = [
    ...data.historical.map(item => ({
      month: item.month,
      historical: item.revenue,
      forecast: null,
      confidenceLow: null,
      confidenceHigh: null
    })),
    ...data.forecast.map(item => ({
      month: item.month,
      historical: null,
      forecast: item.revenue,
      confidenceLow: item.confidence.low,
      confidenceHigh: item.confidence.high
    }))
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const d = payload[0].payload;
    const isHistorical = d.historical !== null;

    return (
      <div style={{
        backgroundColor: '#0F172A',
        padding: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: shadows.xl
      }}>
        <div style={{ fontWeight: 800, marginBottom: '8px', color: '#F8FAFC' }}>{d.month}</div>
        {isHistorical ? (
          <div style={{ color: '#6366F1', fontWeight: 700 }}>
            Revenue: ₹{d.historical.toLocaleString()}
          </div>
        ) : (
          <>
            <div style={{ color: '#10B981', fontWeight: 700 }}>
              Forecast: ₹{d.forecast.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
              Confidence Range: ₹{d.confidenceLow.toLocaleString()} - ₹{d.confidenceHigh.toLocaleString()}
            </div>
          </>
        )}
      </div>
    );
  };

  const trendIcon = data.trend === 'increasing' ? <RiseOutlined /> : data.trend === 'decreasing' ? <FallOutlined /> : <MinusOutlined />;
  const trendColor = data.trend === 'increasing' ? '#10B981' : data.trend === 'decreasing' ? '#EF4444' : '#64748B';

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(32px)',
      padding: '40px',
      borderRadius: '40px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={4} style={{ color: '#FFFFFF', margin: 0 }}>Revenue Projection</Title>
          <Text style={{ color: '#64748B' }}>Historical earnings vs AI-powered 3-month forecast</Text>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Tag color={data.trend === 'increasing' ? 'success' : 'error'} style={{ borderRadius: '8px', fontWeight: 800, padding: '4px 12px' }}>
            {trendIcon} {data.trend.toUpperCase()}
          </Tag>
          <div style={{ color: '#F8FAFC', fontWeight: 800, fontSize: '16px' }}>
            Growth: <span style={{ color: trendColor }}>{data.growthRate > 0 ? '+' : ''}{data.growthRate}%</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.03)" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '32px' }} iconType="circle" />

          {/* Confidence interval area */}
          <Area
            type="monotone"
            dataKey="confidenceHigh"
            stroke="none"
            fill="#10B981"
            fillOpacity={0.05}
            name="Confidence Range"
          />
          <Area
            type="monotone"
            dataKey="confidenceLow"
            stroke="none"
            fill="transparent"
          />

          {/* Historical revenue bars */}
          <Bar
            dataKey="historical"
            fill="#6366F1"
            name="Past Performance"
            radius={[10, 10, 0, 0]}
            barSize={40}
          />

          {/* Forecast line */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#10B981"
            strokeWidth={4}
            strokeDasharray="8 8"
            name="AI Forecast"
            dot={{ r: 6, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ marginTop: '40px', padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}
      >
        <div style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.6 }}>
          <InfoCircleOutlined style={{ marginRight: '8px', color: '#6366F1' }} />
          <strong>Intelligence insight:</strong> Based on your current engagement velocity and retention rates,
          the AI predicts a <span style={{ color: '#10B981', fontWeight: 800 }}>steady {data.growthRate}% monthly climb</span>.
          The shaded green region indicates the 95% confidence variance.
        </div>
      </motion.div>
    </div>
  );
};

export default RevenueChart;
