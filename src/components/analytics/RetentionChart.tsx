// ===========================================
// RETENTION CHART COMPONENT - Flagship Redesign
// ===========================================

import React from 'react';
import { Table, Tag, Tooltip, Empty, Typography } from 'antd';
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import { colors, spacing, shadows } from '../../styles/tokens';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

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
  const getRetentionStyle = (percentage: number) => {
    if (percentage >= 70) return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Excellent' };
    if (percentage >= 50) return { color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)', label: 'Good' };
    if (percentage >= 30) return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', label: 'Average' };
    return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Low' };
  };

  const columns = [
    {
      title: 'COHORT',
      dataIndex: 'cohortMonth',
      key: 'cohortMonth',
      fixed: 'left' as const,
      width: 140,
      render: (month: string) => (
        <span style={{ color: '#F8FAFC', fontWeight: 800, fontSize: '14px' }}>{month}</span>
      )
    },
    {
      title: 'SIZE',
      dataIndex: 'cohortSize',
      key: 'cohortSize',
      width: 100,
      align: 'center' as const,
      render: (size: number) => (
        <span style={{ color: '#94A3B8', fontWeight: 700 }}>
          <UserOutlined style={{ marginRight: 4, fontSize: '12px' }} />
          {size}
        </span>
      )
    },
    ...['week1', 'week2', 'week4', 'week8'].map((wk) => ({
      title: wk.toUpperCase().replace('WEEK', 'W'),
      key: wk,
      width: 100,
      align: 'center' as const,
      render: (record: RetentionCohort) => {
        const val = (record.retention as any)[wk];
        const style = getRetentionStyle(val);
        return (
          <Tooltip title={`${style.label} Retention: ${val}%`} overlayInnerStyle={{ borderRadius: '8px', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '10px 4px',
                borderRadius: '12px',
                backgroundColor: style.bg,
                border: `1px solid ${style.color}20`,
                color: style.color,
                fontWeight: 900,
                fontSize: '14px'
              }}
            >
              {val}%
            </motion.div>
          </Tooltip>
        );
      }
    }))
  ];

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '32px' }}>
        <Empty description={<span style={{ color: '#94A3B8' }}>No retention cohorts found.</span>} />
      </div>
    );
  }

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
          <Title level={4} style={{ color: '#FFFFFF', margin: 0 }}>Cohort Retention Matrix</Title>
          <Text style={{ color: '#64748B' }}>User stickiness analysis over 8-week cycles</Text>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Tag color="processing" style={{ borderRadius: '8px', fontWeight: 800, padding: '4px 12px' }}>
            <InfoCircleOutlined /> ROLLING WINDOW
          </Tag>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="cohortMonth"
        pagination={false}
        loading={loading}
        scroll={{ x: 600 }}
        size="large"
        className="flagship-table"
        style={{ background: 'transparent' }}
      />

      <style>{`
        .flagship-table .ant-table {
          background: transparent !important;
          color: #94A3B8 !important;
        }
        .flagship-table .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.02) !important;
          color: #64748B !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          font-weight: 800 !important;
          font-size: 12px !important;
          letter-spacing: 0.05em !important;
        }
        .flagship-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
          padding: 16px 8px !important;
        }
        .flagship-table .ant-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.02) !important;
        }
        .flagship-table .ant-table-cell-fix-left {
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
};

export default RetentionChart;
