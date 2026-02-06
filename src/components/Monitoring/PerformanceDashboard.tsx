// ===========================================
// PERFORMANCE DASHBOARD COMPONENT
// Real-time API performance monitoring
// ===========================================

import { useState, useEffect } from 'react';
import { Card, Statistic, Select, Spin, Empty } from 'antd';
import { ThunderboltOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monitoringApi } from '../../services/api';
import CustomCard from '../common/Card/CustomCard';
import { colors, spacing, typography } from '../../styles/tokens';

export const PerformanceDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [hours, setHours] = useState<number>(24);

  useEffect(() => {
    fetchPerformanceStats();
  }, [hours]);

  const fetchPerformanceStats = async () => {
    try {
      setLoading(true);
      const response = await monitoringApi.getPerformanceStats({ hours });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch performance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: spacing[8] }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return <Empty description="No performance data available" />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[6] }}>
        <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>
          API Performance
        </h2>
        <Select value={hours} onChange={setHours} style={{ width: 150 }}>
          <Select.Option value={1}>Last Hour</Select.Option>
          <Select.Option value={24}>Last 24 Hours</Select.Option>
          <Select.Option value={168}>Last 7 Days</Select.Option>
        </Select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing[4], marginBottom: spacing[6] }}>
        <CustomCard depth={1}>
          <Statistic
            title="Avg Response Time"
            value={stats.avgResponseTime}
            suffix="ms"
            prefix={<ThunderboltOutlined style={{ color: colors.primary.solid }} />}
            valueStyle={{ color: stats.avgResponseTime > 500 ? colors.error.solid : colors.success.solid }}
          />
        </CustomCard>
        <CustomCard depth={1}>
          <Statistic
            title="P95 Response Time"
            value={stats.p95}
            suffix="ms"
            prefix={<WarningOutlined style={{ color: colors.warning.solid }} />}
            valueStyle={{ color: colors.warning.solid }}
          />
        </CustomCard>
        <CustomCard depth={1}>
          <Statistic
            title="Error Rate"
            value={stats.errorRate}
            suffix="%"
            prefix={<CheckCircleOutlined style={{ color: stats.errorRate > 5 ? colors.error.solid : colors.success.solid }} />}
            valueStyle={{ color: stats.errorRate > 5 ? colors.error.solid : colors.success.solid }}
          />
        </CustomCard>
        <CustomCard depth={1}>
          <Statistic
            title="Total Requests"
            value={stats.totalRequests}
            valueStyle={{ color: colors.primary.solid }}
          />
        </CustomCard>
      </div>
    </div>
  );
};

export default PerformanceDashboard;



