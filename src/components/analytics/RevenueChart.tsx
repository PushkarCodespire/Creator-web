// ===========================================
// REVENUE CHART COMPONENT - Premium Light Theme
// ===========================================

import React from 'react';
import { Empty, Tag, Typography } from 'antd';
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
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { colors, shadows } from '../../styles/tokens';
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
      <div style={{ padding: '64px', textAlign: 'center', background: '#FFFFFF', borderRadius: '24px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
        <Empty description={<span style={{ color: colors.text.tertiary, fontWeight: 500 }}>No revenue data analyzed yet.</span>} />
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (!active || !payload || payload.length === 0) return null;
    const d = payload[0].payload;
    const isHistorical = d.historical !== null;

    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '16px',
        border: `1px solid ${colors.gray[200]}`,
        borderRadius: '16px',
        boxShadow: shadows.lg
      }}>
        <div style={{ fontWeight: 800, marginBottom: '8px', color: colors.text.primary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.month}</div>
        {isHistorical ? (
          <div style={{ color: colors.primary.solid, fontWeight: 800, fontSize: '16px' }}>
            Revenue: ₹{d.historical.toLocaleString()}
          </div>
        ) : (
          <>
            <div style={{ color: colors.success.solid, fontWeight: 800, fontSize: '16px' }}>
              Forecast: ₹{d.forecast.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: colors.text.tertiary, marginTop: '4px', fontWeight: 600 }}>
              Confidence Range: ₹{d.confidenceLow.toLocaleString()} - ₹{d.confidenceHigh.toLocaleString()}
            </div>
          </>
        )}
      </div>
    );
  };

  const trendIcon = data.trend === 'increasing' ? <TrendingUp size={16} /> : data.trend === 'decreasing' ? <TrendingDown size={16} /> : <Minus size={16} />;
  const trendColor = data.trend === 'increasing' ? colors.success.solid : data.trend === 'decreasing' ? colors.error.solid : colors.text.tertiary;
  const trendBg = data.trend === 'increasing' ? colors.success.subtle : data.trend === 'decreasing' ? colors.error.subtle : colors.gray[100];

  return (
    <div style={{
      background: '#FFFFFF',
      padding: '40px',
      borderRadius: '24px',
      border: `1px solid ${colors.gray[100]}`,
      boxShadow: shadows.md
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title level={4} style={{ color: colors.text.primary, margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Revenue Projection</Title>
          <Text style={{ color: colors.text.secondary, fontWeight: 500 }}>Historical earnings vs AI-powered 3-month forecast</Text>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Tag bordered={false} style={{
            borderRadius: '8px',
            fontWeight: 800,
            padding: '6px 12px',
            background: trendBg,
            color: trendColor,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {trendIcon} {data.trend.toUpperCase()}
          </Tag>
          <div style={{ color: colors.text.primary, fontWeight: 800, fontSize: '16px' }}>
            Growth: <span style={{ color: colors.success.solid }}>{data.growthRate > 0 ? '+' : ''}{data.growthRate}%</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.gray[100]} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.text.tertiary, fontSize: 12, fontWeight: 700 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.text.tertiary, fontSize: 12, fontWeight: 700 }}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '32px' }}
            iconType="circle"
            formatter={(value) => <span style={{ color: colors.text.secondary, fontWeight: 600, fontSize: '13px' }}>{value}</span>}
          />

          {/* Confidence interval area */}
          <Area
            type="monotone"
            dataKey="confidenceHigh"
            stroke="none"
            fill={colors.success.solid}
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
            fill={colors.primary.solid}
            name="Past Performance"
            radius={[8, 8, 0, 0]}
            barSize={40}
          />

          {/* Forecast line */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke={colors.success.solid}
            strokeWidth={4}
            strokeDasharray="8 8"
            name="AI Forecast"
            dot={{ r: 6, fill: colors.success.solid, stroke: '#FFFFFF', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          marginTop: '40px',
          padding: '24px',
          background: colors.gray[50],
          borderRadius: '20px',
          border: `1px solid ${colors.gray[100]}`
        }}
      >
        <div style={{ color: colors.text.secondary, fontSize: '13px', lineHeight: 1.6, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: colors.primary.subtle,
            padding: '8px',
            borderRadius: '10px',
            color: colors.primary.solid,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={18} />
          </div>
          <div>
            <strong style={{ color: colors.text.primary }}>Intelligence insight:</strong> Based on your current engagement velocity and retention rates,
            the AI predicts a <span style={{ color: colors.success.solid, fontWeight: 800 }}>steady {data.growthRate}% monthly climb</span>.
            The shaded green region indicates the 95% confidence variance.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RevenueChart;
