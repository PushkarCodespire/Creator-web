// ===========================================
// COMPETITIVE ANALYSIS COMPONENT
// Compare creator performance with benchmarks
// ===========================================

import { useState, useEffect } from 'react';
import { Select, Spin, Empty, Row, Col } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import CustomCard from '../common/Card/CustomCard';
import { colors, spacing, typography } from '../../styles/tokens';
import { analyticsApi } from '../../services/api';

interface CompetitiveAnalysisProps {
  creatorId: string;
}

export const CompetitiveAnalysis: React.FC<CompetitiveAnalysisProps> = () => {
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [metric, setMetric] = useState<'engagement' | 'revenue' | 'growth'>('engagement');

  useEffect(() => {
    fetchComparisonData();
  }, [metric]);

  const normalizeCompetitiveData = (data: any) => {
    if (!data) return null;
    const yourMetrics = data.yourMetrics || data.your || data.creator || data.metrics;
    const categoryAverage = data.categoryAverage || data.average || data.benchmark || data.benchmarks;
    const topPerformers = data.topPerformers || data.top || data.leaders;

    if (!yourMetrics || !categoryAverage || !topPerformers) return null;

    const radarData = data.radarData || [
      { metric: 'Engagement', you: Number(yourMetrics.engagement ?? 0), average: Number(categoryAverage.engagement ?? 0), top: Number(topPerformers.engagement ?? 0) },
      { metric: 'Revenue', you: Number(yourMetrics.revenue ?? 0), average: Number(categoryAverage.revenue ?? 0), top: Number(topPerformers.revenue ?? 0) },
      { metric: 'Growth', you: Number(yourMetrics.growth ?? 0), average: Number(categoryAverage.growth ?? 0), top: Number(topPerformers.growth ?? 0) },
      { metric: 'Response Rate', you: Number(yourMetrics.responseRate ?? 0), average: Number(categoryAverage.responseRate ?? 0), top: Number(topPerformers.responseRate ?? 0) },
      { metric: 'Response Time', you: Number(yourMetrics.avgResponseTime ?? 0), average: Number(categoryAverage.avgResponseTime ?? 0), top: Number(topPerformers.avgResponseTime ?? 0) },
    ];

    return { yourMetrics, categoryAverage, topPerformers, radarData };
  };

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getCompetitiveAnalysis();
      const data = response.data?.data ?? response.data;
      setComparisonData(normalizeCompetitiveData(data));
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
      setComparisonData(null);
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

  if (!comparisonData) {
    return <Empty description="No comparison data available" />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
        <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold }}>
          Competitive Analysis
        </h3>
        <Select value={metric} onChange={setMetric} style={{ width: 150 }}>
          <Select.Option value="engagement">Engagement</Select.Option>
          <Select.Option value="revenue">Revenue</Select.Option>
          <Select.Option value="growth">Growth</Select.Option>
        </Select>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <CustomCard depth={1} title="Performance Comparison">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'You', value: comparisonData.yourMetrics[metric] },
                { name: 'Category Avg', value: comparisonData.categoryAverage[metric] },
                { name: 'Top Performers', value: comparisonData.topPerformers[metric] },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={colors.primary.solid} />
              </BarChart>
            </ResponsiveContainer>
          </CustomCard>
        </Col>
        <Col xs={24} lg={12}>
          <CustomCard depth={1} title="Multi-Metric Radar">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={comparisonData.radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="You" dataKey="you" stroke={colors.primary.solid} fill={colors.primary.solid} fillOpacity={0.6} />
                <Radar name="Average" dataKey="average" stroke={colors.gray[400]} fill={colors.gray[400]} fillOpacity={0.6} />
                <Radar name="Top" dataKey="top" stroke={colors.success.solid} fill={colors.success.solid} fillOpacity={0.6} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CustomCard>
        </Col>
      </Row>
    </div>
  );
};

export default CompetitiveAnalysis;



