// ===========================================
// COMPARISON CHART COMPONENT
// Current period vs previous period comparison
// ===========================================

import React from 'react';
import { Card, Row, Col, Statistic, Tag, Empty } from 'antd';
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
      <Card title="Period Comparison">
        <Empty description="No comparison data available yet." />
      </Card>
    );
  }

  // Prepare chart data
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

  // Get trend icon and color
  const getTrendProps = (changePercent: number) => {
    if (changePercent > 0) {
      return {
        icon: <ArrowUpOutlined />,
        color: 'green',
        prefix: '+'
      };
    } else if (changePercent < 0) {
      return {
        icon: <ArrowDownOutlined />,
        color: 'red',
        prefix: ''
      };
    }
    return {
      icon: null,
      color: 'default',
      prefix: ''
    };
  };

  return (
    <Card title={`Period Comparison (Last ${periodDays} Days)`}>
      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#f0f5ff' }}>
            <Statistic
              title="Total Messages"
              value={data.currentPeriod.messages}
              prefix={<MessageOutlined />}
              suffix={
                <Tag
                  color={getTrendProps(data.change.messages).color}
                  icon={getTrendProps(data.change.messages).icon}
                  style={{ marginLeft: '8px' }}
                >
                  {getTrendProps(data.change.messages).prefix}{data.change.messages}%
                </Tag>
              }
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
              Previous: {data.previousPeriod.messages}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#f6ffed' }}>
            <Statistic
              title="Total Revenue"
              value={data.currentPeriod.revenue}
              prefix="₹"
              precision={0}
              suffix={
                <Tag
                  color={getTrendProps(data.change.revenue).color}
                  icon={getTrendProps(data.change.revenue).icon}
                  style={{ marginLeft: '8px' }}
                >
                  {getTrendProps(data.change.revenue).prefix}{data.change.revenue}%
                </Tag>
              }
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
              Previous: ₹{data.previousPeriod.revenue}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#fff7e6' }}>
            <Statistic
              title="New Users"
              value={data.currentPeriod.newUsers}
              prefix={<UserAddOutlined />}
              suffix={
                <Tag
                  color={getTrendProps(data.change.newUsers).color}
                  icon={getTrendProps(data.change.newUsers).icon}
                  style={{ marginLeft: '8px' }}
                >
                  {getTrendProps(data.change.newUsers).prefix}{data.change.newUsers}%
                </Tag>
              }
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
              Previous: {data.previousPeriod.newUsers}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Comparison Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #d9d9d9',
              borderRadius: '4px'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="Current" fill="#1890ff" name="Current Period" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Previous" fill="#8c8c8c" name="Previous Period" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#8c8c8c' }}>
        <strong>How to read:</strong> Compares the last {periodDays} days to the previous {periodDays} days.
        Green arrows indicate growth, red arrows indicate decline.
        Use this to track your momentum and identify trends.
      </div>
    </Card>
  );
};

export default ComparisonChart;
