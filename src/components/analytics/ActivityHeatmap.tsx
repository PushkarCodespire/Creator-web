// ===========================================
// ACTIVITY HEATMAP COMPONENT - Premium Light Theme
// ===========================================

import React from 'react';
import { Empty, Tooltip, Tag, Typography } from 'antd';
import { Zap, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors, shadows } from '../../styles/tokens';

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
      <div style={{ padding: '64px', textAlign: 'center', background: '#FFFFFF', borderRadius: '24px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
        <Empty description={<span style={{ color: colors.text.tertiary, fontWeight: 500 }}>No activity data analyzed yet.</span>} />
      </div>
    );
  }

  const maxCount = Math.max(...data.hourly.flat());

  const getColor = (count: number): string => {
    if (count === 0) return colors.gray[50];
    const intensity = count / maxCount;
    // Scale from light primary to deep primary
    if (intensity > 0.8) return colors.primary.solid;
    if (intensity > 0.6) return `${colors.primary.solid}CC`;
    if (intensity > 0.4) return `${colors.primary.solid}99`;
    if (intensity > 0.2) return `${colors.primary.solid}66`;
    return `${colors.primary.solid}33`;
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

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
          <Title level={4} style={{ color: colors.text.primary, margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Social Density Heatmap</Title>
          <Text style={{ color: colors.text.secondary, fontWeight: 500 }}>When your AI community is most active</Text>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Tag bordered={false} icon={<Flame size={14} style={{ marginRight: '4px' }} />} style={{
            borderRadius: '8px',
            fontWeight: 800,
            padding: '6px 12px',
            background: colors.warning.subtle,
            color: colors.warning.solid,
            display: 'flex',
            alignItems: 'center'
          }}>
            PEAK: {data.peakHour.day} {formatHour(data.peakHour.hour)}
          </Tag>
          <div style={{ color: colors.text.primary, fontWeight: 800, fontSize: '14px' }}>
            {data.totalMessages.toLocaleString()} Messages Analyzed
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
                  color: colors.text.tertiary,
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
              <div style={{ width: '60px', fontSize: '12px', fontWeight: 800, textAlign: 'right', marginRight: '16px', color: colors.text.tertiary }}>
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
                        <div style={{ fontWeight: 800, color: '#FFFFFF' }}>{dayNames[dayIndex]} {formatHour(hour)}</div>
                        <div style={{ color: colors.primary.subtle, fontWeight: 700 }}>{count} interactions</div>
                        {isPeak && <div style={{ color: colors.warning.solid, marginTop: '4px', fontWeight: 800 }}>🔥 Current Peak Moment</div>}
                      </div>
                    }
                    overlayInnerStyle={{ borderRadius: '12px', background: colors.text.primary, border: `1px solid ${colors.gray[700]}` }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: getColor(count),
                        border: isPeak ? `2.5px solid ${colors.warning.solid}` : `1px solid ${colors.gray[100]}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isPeak ? `0 0 12px ${colors.warning.solid}66` : 'none'
                      }}
                    />
                  </Tooltip>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: colors.text.secondary }}>Activity Density</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: colors.text.tertiary, fontWeight: 600 }}>Low</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((lvl) => (
                <div key={lvl} style={{ width: '20px', height: '20px', borderRadius: '4px', background: colors.primary.solid, opacity: lvl, border: `1px solid ${colors.gray[100]}` }} />
              ))}
              <span style={{ fontSize: '11px', color: colors.text.tertiary, fontWeight: 600 }}>High</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '24px',
        background: colors.gray[50],
        borderRadius: '20px',
        border: `1px solid ${colors.gray[100]}`
      }}>
        <div style={{ color: colors.text.secondary, fontSize: '13px', lineHeight: 1.6, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: colors.warning.subtle,
            padding: '8px',
            borderRadius: '10px',
            color: colors.warning.solid,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={18} />
          </div>
          <div>
            <strong style={{ color: colors.text.primary }}>Optimization tip:</strong> Your peak engagement period is around <span style={{ color: colors.warning.solid, fontWeight: 800 }}>{data.peakHour.day}s at {formatHour(data.peakHour.hour)}</span>.
            Consider scheduling special AI drops or community events during this window to maximize conversion.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmapComponent;
