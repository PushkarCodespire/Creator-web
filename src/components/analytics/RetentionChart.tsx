// ===========================================
// RETENTION CHART COMPONENT - Premium Light Theme
// ===========================================

import React from 'react';
import { Table, Tag, Tooltip, Empty, Typography } from 'antd';
import { User, Calendar } from 'lucide-react';
import { colors, shadows } from '../../styles/tokens';
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
    if (percentage >= 70) return { color: colors.success.solid, bg: colors.success.subtle, label: 'Excellent' };
    if (percentage >= 50) return { color: colors.primary.solid, bg: colors.primary.subtle, label: 'Good' };
    if (percentage >= 30) return { color: colors.warning.solid, bg: colors.warning.subtle, label: 'Average' };
    return { color: colors.error.solid, bg: colors.error.subtle, label: 'Low' };
  };

  const columns = [
    {
      title: 'COHORT',
      dataIndex: 'cohortMonth',
      key: 'cohortMonth',
      fixed: 'left' as const,
      width: 140,
      render: (month: string) => (
        <span style={{ color: colors.text.primary, fontWeight: 800, fontSize: '14px' }}>{month}</span>
      )
    },
    {
      title: 'SIZE',
      dataIndex: 'cohortSize',
      key: 'cohortSize',
      width: 100,
      align: 'center' as const,
      render: (size: number) => (
        <span style={{ color: colors.text.tertiary, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <User size={14} />
          {size.toLocaleString()}
        </span>
      )
    },
    ...['week1', 'week2', 'week4', 'week8'].map((wk) => ({
      title: wk.toUpperCase().replace('WEEK', 'W'),
      key: wk,
      width: 100,
      align: 'center' as const,
      render: (record: RetentionCohort) => {
        const val = (record.retention as Record<string, number>)[wk];
        const style = getRetentionStyle(val);
        return (
          <Tooltip title={`${style.label} Retention: ${val}%`} overlayInnerStyle={{ borderRadius: '12px', background: colors.text.primary, border: `1px solid ${colors.gray[700]}` }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '12px 4px',
                borderRadius: '12px',
                backgroundColor: style.bg,
                border: `1px solid ${style.color}20`,
                color: style.color,
                fontWeight: 800,
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
      <div style={{ padding: '64px', textAlign: 'center', background: '#FFFFFF', borderRadius: '24px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
        <Empty description={<span style={{ color: colors.text.tertiary, fontWeight: 500 }}>No retention data analyzed yet.</span>} />
      </div>
    );
  }

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
          <Title level={4} style={{ color: colors.text.primary, margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Cohort Retention Matrix</Title>
          <Text style={{ color: colors.text.secondary, fontWeight: 500 }}>User stickiness analysis over 8-week cycles</Text>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Tag bordered={false} style={{
            borderRadius: '8px',
            fontWeight: 800,
            padding: '6px 12px',
            background: colors.primary.subtle,
            color: colors.primary.solid,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Calendar size={14} /> ROLLING WINDOW
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
          color: ${colors.text.secondary} !important;
        }
        .flagship-table .ant-table-thead > tr > th {
          background: ${colors.gray[50]} !important;
          color: ${colors.text.tertiary} !important;
          border-bottom: 1px solid ${colors.gray[100]} !important;
          font-weight: 800 !important;
          font-size: 11px !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
          padding: 16px !important;
        }
        .flagship-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${colors.gray[50]} !important;
          padding: 20px 8px !important;
        }
        .flagship-table .ant-table-tbody > tr:hover > td {
          background: ${colors.gray[50]}00 !important;
        }
        .flagship-table .ant-table-cell-fix-left {
          background: #FFFFFF !important;
          box-shadow: 4px 0 8px rgba(0,0,0,0.02) !important;
        }
      `}</style>
    </div>
  );
};

export default RetentionChart;
