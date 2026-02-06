// ===========================================
// RETENTION CHART COMPONENT
// Cohort retention heatmap visualization
// ===========================================

import React from 'react';
import { Card, Table, Tag, Tooltip, Empty } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface RetentionCohort {
  cohortMonth: string;
  cohortSize: number;
  retention: {
    week1: number;
    week2: number;
    week4: number;
    week8: number;
  };
}

interface RetentionChartProps {
  data: RetentionCohort[];
  loading?: boolean;
}

export const RetentionChart: React.FC<RetentionChartProps> = ({ data, loading = false }) => {
  // Get color for retention percentage
  const getRetentionColor = (percentage: number): string => {
    if (percentage >= 70) return '#52c41a'; // Green
    if (percentage >= 50) return '#faad14'; // Yellow
    if (percentage >= 30) return '#ff7a45'; // Orange
    return '#ff4d4f'; // Red
  };

  // Get background color with opacity
  const getBackgroundColor = (percentage: number): string => {
    if (percentage >= 70) return 'rgba(82, 196, 26, 0.1)';
    if (percentage >= 50) return 'rgba(250, 173, 20, 0.1)';
    if (percentage >= 30) return 'rgba(255, 122, 69, 0.1)';
    return 'rgba(255, 77, 79, 0.1)';
  };

  const columns = [
    {
      title: 'Cohort Month',
      dataIndex: 'cohortMonth',
      key: 'cohortMonth',
      fixed: 'left' as const,
      width: 120,
      render: (month: string) => <strong>{month}</strong>
    },
    {
      title: (
        <Tooltip title="Number of users who started in this month">
          Size <InfoCircleOutlined style={{ marginLeft: 4 }} />
        </Tooltip>
      ),
      dataIndex: 'cohortSize',
      key: 'cohortSize',
      width: 80,
      align: 'center' as const
    },
    {
      title: (
        <Tooltip title="% of users who returned after 1 week">
          Week 1 <InfoCircleOutlined style={{ marginLeft: 4 }} />
        </Tooltip>
      ),
      key: 'week1',
      width: 100,
      align: 'center' as const,
      render: (record: RetentionCohort) => (
        <div
          style={{
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: getBackgroundColor(record.retention.week1)
          }}
        >
          <Tag color={getRetentionColor(record.retention.week1)}>
            {record.retention.week1}%
          </Tag>
        </div>
      )
    },
    {
      title: (
        <Tooltip title="% of users who returned after 2 weeks">
          Week 2 <InfoCircleOutlined style={{ marginLeft: 4 }} />
        </Tooltip>
      ),
      key: 'week2',
      width: 100,
      align: 'center' as const,
      render: (record: RetentionCohort) => (
        <div
          style={{
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: getBackgroundColor(record.retention.week2)
          }}
        >
          <Tag color={getRetentionColor(record.retention.week2)}>
            {record.retention.week2}%
          </Tag>
        </div>
      )
    },
    {
      title: (
        <Tooltip title="% of users who returned after 4 weeks">
          Week 4 <InfoCircleOutlined style={{ marginLeft: 4 }} />
        </Tooltip>
      ),
      key: 'week4',
      width: 100,
      align: 'center' as const,
      render: (record: RetentionCohort) => (
        <div
          style={{
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: getBackgroundColor(record.retention.week4)
          }}
        >
          <Tag color={getRetentionColor(record.retention.week4)}>
            {record.retention.week4}%
          </Tag>
        </div>
      )
    },
    {
      title: (
        <Tooltip title="% of users who returned after 8 weeks">
          Week 8 <InfoCircleOutlined style={{ marginLeft: 4 }} />
        </Tooltip>
      ),
      key: 'week8',
      width: 100,
      align: 'center' as const,
      render: (record: RetentionCohort) => (
        <div
          style={{
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: getBackgroundColor(record.retention.week8)
          }}
        >
          <Tag color={getRetentionColor(record.retention.week8)}>
            {record.retention.week8}%
          </Tag>
        </div>
      )
    }
  ];

  if (!data || data.length === 0) {
    return (
      <Card title="User Retention by Cohort">
        <Empty description="No retention data available yet. Start getting users to see retention metrics!" />
      </Card>
    );
  }

  return (
    <Card
      title="User Retention by Cohort"
      extra={
        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
          Shows % of users who return after initial engagement
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="cohortMonth"
        pagination={false}
        loading={loading}
        scroll={{ x: 700 }}
        size="middle"
      />

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#8c8c8c' }}>
        <strong>How to read:</strong> Each row represents users who started in that month.
        Percentages show how many returned after 1, 2, 4, and 8 weeks.
        <div style={{ marginTop: '8px' }}>
          <Tag color="green">70%+</Tag> Excellent retention
          <Tag color="yellow">50-69%</Tag> Good retention
          <Tag color="orange">30-49%</Tag> Needs improvement
          <Tag color="red">&lt;30%</Tag> Poor retention
        </div>
      </div>
    </Card>
  );
};

export default RetentionChart;
