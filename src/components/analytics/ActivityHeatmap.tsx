// ===========================================
// ACTIVITY HEATMAP COMPONENT - Flagship Redesign
// ===========================================

import React from 'react';
import { Empty, Tooltip, Tag, Typography } from 'antd';
import { FireOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { colors, spacing, shadows } from '../../styles/tokens';

const { Title, Text } = Typography;

interface ActivityHeatmap {
  hourly: number[][]; // [dayOfWeek][hour] = message count
  peakHour: { day: string; hour: number; count: number };
  totalMessages: number;
}

interface ActivityHeatmapProps {
  data: ActivityHeatmap | null;
  loading?: boolean;
}

export const ActivityHeatmapComponent: React.FC<ActivityHeatmapProps> = ({ data, loading = false }) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (!data || data.totalMessages === 0) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '32px' }}>
        <Empty description={<span style={{ color: '#94A3B8' }}>No activity data available yet.</span>} />
      </div>
    );
  }

  const maxCount = Math.max(...data.hourly.flat());

  const getColor = (count: number): string => {
    if (count === 0) return 'rgba(255, 255, 255, 0.03)';
    const intensity = count / maxCount;
    // Scale from light indigo to deep indigo/purple
    if (intensity > 0.8) return '#6366F1';
    if (intensity > 0.6) return 'rgba(99, 102, 241, 0.8)';
    if (intensity > 0.4) return 'rgba(99, 102, 241, 0.6)';
    if (intensity > 0.2) return 'rgba(99, 102, 241, 0.4)';
    return 'rgba(99, 102, 241, 0.2)';
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

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
          <Title level={4} style={{ color: '#FFFFFF', margin: 0 }}>Social Density Heatmap</Title>
          <Text style={{ color: '#64748B' }}>When your AI community is most active</Text>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Tag icon={<FireOutlined />} color="volcano" style={{ borderRadius: '8px', fontWeight: 800, padding: '4px 12px' }}>
            PEAK: {data.peakHour.day} {formatHour(data.peakHour.hour)}
          </Tag>
          <div style={{ color: '#F8FAFC', fontWeight: 800, fontSize: '14px' }}>
            {data.totalMessages} Messages Analyzed
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '20px', scrollbarWidth: 'none' }}>
        <div style={{ minWidth: '850px' }}>
          {/* Hour Labels */}
          <div style={{ display: 'flex', marginBottom: '16px', marginLeft: '70px' }}>
            {hours.map((hour) => (
              <div
                key={hour}
                style={{
                  width: '32px',
                  fontSize: '11px',
                  textAlign: 'center',
                  color: '#64748B',
                  fontWeight: 700,
                  opacity: hour % 3 === 0 ? 1 : 0
                }}
              >
                {formatHour(hour).split(' ')[0]}
              </div>
            ))}
          </div>

          {/* Grid */}
          {data.hourly.map((dayData, dayIndex) => (
            <div key={dayIndex} style={{ display: 'flex', marginBottom: '6px', alignItems: 'center' }}>
              <div style={{ width: '60px', fontSize: '12px', fontWeight: 800, textAlign: 'right', marginRight: '16px', color: '#94A3B8' }}>
                {dayNames[dayIndex]}
              </div>
              {dayData.map((count, hour) => {
                const isPeak = dayIndex === data.hourly.findIndex(d => d === dayData) &&
                  hour === data.peakHour.hour &&
                  dayNames[dayIndex] === data.peakHour.day;

                return (
                  <Tooltip
                    key={hour}
                    title={
                      <div style={{ padding: '4px' }}>
                        <div style={{ fontWeight: 800 }}>{dayNames[dayIndex]} {formatHour(hour)}</div>
                        <div style={{ color: '#6366F1' }}>{count} interactions</div>
                        {isPeak && <div style={{ color: '#F59E0B', marginTop: '4px' }}>🔥 Current Peak Moment</div>}
                      </div>
                    }
                    overlayInnerStyle={{ borderRadius: '12px', background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: getColor(count),
                        border: isPeak ? '2px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                        boxShadow: isPeak ? '0 0 15px rgba(245, 158, 11, 0.4)' : 'none'
                      }}
                    />
                  </Tooltip>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>Activity Density</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#475569' }}>Low</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((lvl) => (
                <div key={lvl} style={{ width: '20px', height: '20px', borderRadius: '4px', background: `rgba(99, 102, 241, ${lvl})`, border: '1px solid rgba(255, 255, 255, 0.05)' }} />
              ))}
              <span style={{ fontSize: '11px', color: '#475569' }}>High</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.6 }}>
          <FireOutlined style={{ marginRight: '8px', color: '#F59E0B' }} />
          <strong>Optimization tip:</strong> Your peak engagement period is around <span style={{ color: '#F8FAFC', fontWeight: 800 }}>{data.peakHour.day}s at {formatHour(data.peakHour.hour)}</span>.
          Consider scheduling special AI drops or community events during this window to maximize conversion.
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmapComponent;
