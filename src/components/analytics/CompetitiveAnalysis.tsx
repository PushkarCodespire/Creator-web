// ===========================================
// COMPETITIVE ANALYSIS COMPONENT
// Compare creator performance with benchmarks
// ===========================================

import { useState, useEffect } from 'react';
import { Select, Spin, Empty, Row, Col } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import CustomCard from '../common/Card/CustomCard';
import { colors, spacing, typography } from '../../styles/tokens';

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

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      // Mock data - would come from API
      const mockData = {
        yourMetrics: {
          engagement: 75,
          revenue: 1200,
          growth: 15,
          responseRate: 95,
          avgResponseTime: 2.5,
        },
        categoryAverage: {
          engagement: 65,
          revenue: 1000,
          growth: 12,
          responseRate: 88,
          avgResponseTime: 3.2,
        },
        topPerformers: {
          engagement: 90,
          revenue: 2000,
          growth: 25,
          responseRate: 98,
          avgResponseTime: 1.8,
        },
        radarData: [
          { metric: 'Engagement', you: 75, average: 65, top: 90 },
          { metric: 'Revenue', you: 60, average: 50, top: 100 },
          { metric: 'Growth', you: 60, average: 48, top: 100 },
          { metric: 'Response Rate', you: 95, average: 88, top: 98 },
          { metric: 'Response Time', you: 80, average: 70, top: 90 },
        ],
      };
      setComparisonData(mockData);
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
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



