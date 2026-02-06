// ===========================================
// ACTIVITY HEATMAP COMPONENT
// 24x7 grid showing message activity by hour and day
// ===========================================

import React from 'react';
import { Card, Empty, Tooltip, Tag } from 'antd';
import { FireOutlined } from '@ant-design/icons';

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
      <Card title="Activity Heatmap">
        <Empty description="No activity data available yet. Start chatting to see when your users are most active!" />
      </Card>
    );
  }

  // Find max value for color scaling
  const maxCount = Math.max(...data.hourly.flat());

  // Get color intensity based on message count
  const getColor = (count: number): string => {
    if (count === 0) return '#f5f5f5';

    const intensity = count / maxCount;
    if (intensity > 0.8) return '#0050b3'; // Dark blue
    if (intensity > 0.6) return '#1890ff'; // Blue
    if (intensity > 0.4) return '#40a9ff'; // Light blue
    if (intensity > 0.2) return '#91d5ff'; // Lighter blue
    return '#d6e4ff'; // Lightest blue
  };

  // Format hour for display
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <Card
      title="Activity Heatmap (Last 30 Days)"
      extra={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Tag icon={<FireOutlined />} color="red">
            Peak: {data.peakHour.day} {formatHour(data.peakHour.hour)} ({data.peakHour.count} messages)
          </Tag>
          <Tag>Total: {data.totalMessages} messages</Tag>
        </div>
      }
    >
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '800px' }}>
          {/* Header row with hours */}
          <div style={{ display: 'flex', marginBottom: '8px', marginLeft: '60px' }}>
            {hours.map((hour) => (
              <div
                key={hour}
                style={{
                  width: '30px',
                  fontSize: '10px',
                  textAlign: 'center',
                  color: '#8c8c8c',
                  transform: hour % 3 === 0 ? 'none' : 'scale(0)' // Show every 3rd hour
                }}
              >
                {hour % 3 === 0 ? hour : ''}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {data.hourly.map((dayData, dayIndex) => (
            <div key={dayIndex} style={{ display: 'flex', marginBottom: '4px', alignItems: 'center' }}>
              {/* Day label */}
              <div
                style={{
                  width: '50px',
                  fontSize: '12px',
                  fontWeight: 500,
                  textAlign: 'right',
                  marginRight: '10px',
                  color: '#262626'
                }}
              >
                {dayNames[dayIndex]}
              </div>

              {/* Hour cells */}
              {dayData.map((count, hour) => {
                const isPeak = dayIndex === data.hourly.findIndex(d => d === dayData) &&
                              hour === data.peakHour.hour &&
                              dayNames[dayIndex] === data.peakHour.day;

                return (
                  <Tooltip
                    key={hour}
                    title={
                      <div>
                        <div><strong>{dayNames[dayIndex]} {formatHour(hour)}</strong></div>
                        <div>{count} message{count !== 1 ? 's' : ''}</div>
                        {isPeak && <div style={{ color: '#ff4d4f', marginTop: '4px' }}>🔥 Peak Hour</div>}
                      </div>
                    }
                  >
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: getColor(count),
                        border: isPeak ? '2px solid #ff4d4f' : '1px solid #f0f0f0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isPeak ? '0 0 8px rgba(255, 77, 79, 0.5)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.zIndex = '10';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.zIndex = '1';
                      }}
                    />
                  </Tooltip>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#8c8c8c', marginRight: '8px' }}>
              <strong>Message Count:</strong>
            </span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Low</div>
              <div style={{ width: '25px', height: '25px', backgroundColor: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: '4px' }} />
              <div style={{ width: '25px', height: '25px', backgroundColor: '#d6e4ff', border: '1px solid #d9d9d9', borderRadius: '4px' }} />
              <div style={{ width: '25px', height: '25px', backgroundColor: '#91d5ff', border: '1px solid #d9d9d9', borderRadius: '4px' }} />
              <div style={{ width: '25px', height: '25px', backgroundColor: '#40a9ff', border: '1px solid #d9d9d9', borderRadius: '4px' }} />
              <div style={{ width: '25px', height: '25px', backgroundColor: '#1890ff', border: '1px solid #d9d9d9', borderRadius: '4px' }} />
              <div style={{ width: '25px', height: '25px', backgroundColor: '#0050b3', border: '1px solid #d9d9d9', borderRadius: '4px' }} />
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>High</div>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '12px', color: '#8c8c8c' }}>
            <strong>How to read:</strong> Each cell shows message activity for a specific day and hour.
            Darker colors indicate higher activity. Hover over cells to see exact counts.
            The red-bordered cell indicates your peak activity hour.
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ActivityHeatmapComponent;
