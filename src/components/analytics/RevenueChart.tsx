// ===========================================
// REVENUE CHART COMPONENT
// Historical revenue + forecast with confidence intervals
// ===========================================

import React from 'react';
import { Card, Empty, Tag, Tooltip } from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import {
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

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
  if (!data || data.historical.length === 0) {
    return (
      <Card title="Revenue Forecast">
        <Empty description="No revenue data available yet. Complete some paid collaborations to see forecasts!" />
      </Card>
    );
  }

  // Combine historical and forecast data
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

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const isHistorical = data.historical !== null;

    return (
      <div
        style={{
          backgroundColor: 'white',
          padding: '12px',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{data.month}</div>
        {isHistorical ? (
          <div style={{ color: '#1890ff' }}>
            Revenue: ₹{data.historical.toLocaleString()}
          </div>
        ) : (
          <>
            <div style={{ color: '#52c41a' }}>
              Forecast: ₹{data.forecast.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
              Range: ₹{data.confidenceLow.toLocaleString()} - ₹{data.confidenceHigh.toLocaleString()}
            </div>
          </>
        )}
      </div>
    );
  };

  // Trend icon and color
  const getTrendIcon = () => {
    if (data.trend === 'increasing') {
      return <RiseOutlined style={{ color: '#52c41a' }} />;
    } else if (data.trend === 'decreasing') {
      return <FallOutlined style={{ color: '#ff4d4f' }} />;
    }
    return <MinusOutlined style={{ color: '#8c8c8c' }} />;
  };

  const getTrendColor = () => {
    if (data.trend === 'increasing') return 'success';
    if (data.trend === 'decreasing') return 'error';
    return 'default';
  };

  return (
    <Card
      title="Revenue Forecast"
      extra={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div>
            <Tag color={getTrendColor()}>
              {getTrendIcon()} {data.trend.toUpperCase()}
            </Tag>
          </div>
          <div style={{ fontSize: '14px' }}>
            <Tooltip title="Growth rate compared to first month">
              Growth: <strong>{data.growthRate > 0 ? '+' : ''}{data.growthRate}%</strong>
              <InfoCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </div>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="plainline"
          />

          {/* Confidence interval area */}
          <Area
            type="monotone"
            dataKey="confidenceHigh"
            stroke="none"
            fill="#d9f7be"
            fillOpacity={0.3}
            name="Confidence Range"
          />
          <Area
            type="monotone"
            dataKey="confidenceLow"
            stroke="none"
            fill="white"
            fillOpacity={1}
          />

          {/* Historical revenue bars */}
          <Bar
            dataKey="historical"
            fill="#1890ff"
            name="Historical Revenue"
            radius={[8, 8, 0, 0]}
          />

          {/* Forecast line */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#52c41a"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Forecast Revenue"
            dot={{ r: 5, fill: '#52c41a' }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#8c8c8c' }}>
        <strong>How to read:</strong> Blue bars show historical revenue. Green dashed line shows forecasted revenue
        for the next 3 months based on linear regression. The shaded area represents the 15% confidence interval.
      </div>
    </Card>
  );
};

export default RevenueChart;
