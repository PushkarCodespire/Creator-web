// ===========================================
// EXPORT BUTTON COMPONENT - Premium Light Theme
// ===========================================

import React, { useState } from 'react';
import { Button, Dropdown, DatePicker, Modal, Checkbox, message, Space, Typography, Row, Col } from 'antd';
import {
  Download,
  FileText,
  FileJson,
  Calendar,
  CheckCircle2,
  Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import type { MenuProps } from 'antd';
import { colors, shadows, spacing } from '../../styles/tokens';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

interface ExportButtonProps {
  creatorName?: string;
  onExport?: (format: 'csv' | 'pdf', dateRange?: [Date, Date], metrics?: string[]) => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  creatorName = 'Creator',
  onExport
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState<[Date, Date] | undefined>();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'messages',
    'revenue',
    'users',
    'retention',
    'activity'
  ]);
  const [loading, setLoading] = useState(false);

  const metricOptions = [
    { label: 'Messages & Chats', value: 'messages' },
    { label: 'Revenue & Earnings', value: 'revenue' },
    { label: 'User Growth', value: 'users' },
    { label: 'Retention Analysis', value: 'retention' },
    { label: 'Activity Heatmap', value: 'activity' },
    { label: 'Conversion Funnel', value: 'funnel' }
  ];

  const handleExportClick = (format: 'csv' | 'pdf') => {
    setExportFormat(format);
    setIsModalVisible(true);
  };

  const handleExport = async () => {
    if (selectedMetrics.length === 0) {
      message.warning('Please select at least one metric to export');
      return;
    }

    setLoading(true);

    try {
      if (onExport) {
        onExport(exportFormat, dateRange, selectedMetrics);
      } else {
        if (exportFormat === 'csv') {
          exportToCSV();
        } else {
          exportToPDF();
        }
      }

      message.success(`Analytics exported successfully as ${exportFormat.toUpperCase()}`);
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to export analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Metric', 'Value', 'Period'];
    const rows = [
      ['Total Messages', '1,234', dateRange ? `${format(dateRange[0], 'MMM dd, yyyy')} - ${format(dateRange[1], 'MMM dd, yyyy')}` : 'All Time'],
      ['Total Revenue', '₹45,600', dateRange ? `${format(dateRange[0], 'MMM dd, yyyy')} - ${format(dateRange[1], 'MMM dd, yyyy')}` : 'All Time'],
      ['New Users', '89', dateRange ? `${format(dateRange[0], 'MMM dd, yyyy')} - ${format(dateRange[1], 'MMM dd, yyyy')}` : 'All Time']
    ];

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${creatorName}_analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${creatorName} - Analytics Report`, 20, 20);
    doc.setFontSize(12);
    const dateText = dateRange ? `Period: ${format(dateRange[0], 'MMM dd, yyyy')} - ${format(dateRange[1], 'MMM dd, yyyy')}` : 'Period: All Time';
    doc.text(dateText, 20, 30);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, 37);

    let yPos = 50;
    doc.setFontSize(14);
    doc.text('Key Metrics:', 20, yPos);
    yPos += 10;
    doc.setFontSize(11);

    if (selectedMetrics.includes('messages')) { doc.text('Total Messages: 1,234', 25, yPos); yPos += 7; }
    if (selectedMetrics.includes('revenue')) { doc.text('Total Revenue: ₹45,600', 25, yPos); yPos += 7; }
    if (selectedMetrics.includes('users')) { doc.text('New Users: 89', 25, yPos); yPos += 7; }

    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text('Creator Platform Analytics', 20, 280);
    doc.save(`${creatorName}_analytics_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'csv',
      label: (
        <Space style={{ padding: '4px 8px' }}>
          <FileText size={16} color={colors.primary.solid} />
          <span style={{ fontWeight: 600, color: colors.text.primary }}>Export as CSV</span>
        </Space>
      ),
      onClick: () => handleExportClick('csv')
    },
    {
      key: 'pdf',
      label: (
        <Space style={{ padding: '4px 8px' }}>
          <Download size={16} color={colors.success.solid} />
          <span style={{ fontWeight: 600, color: colors.text.primary }}>Export as PDF</span>
        </Space>
      ),
      onClick: () => handleExportClick('pdf')
    }
  ];

  return (
    <>
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={['click']}
        overlayStyle={{ borderRadius: '12px', overflow: 'hidden', boxShadow: shadows.lg }}
      >
        <Button
          icon={<Download size={18} />}
          style={{
            height: '48px',
            borderRadius: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            border: `1px solid ${colors.gray[200]}`,
            boxShadow: shadows.sm
          }}
        >
          Export Studio Intelligence
        </Button>
      </Dropdown>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: colors.primary.subtle, padding: '8px', borderRadius: '10px' }}>
              <FileJson size={20} style={{ color: colors.primary.solid }} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.01em' }}>
              Intelligence Export
            </div>
          </div>
        }
        open={isModalVisible}
        onOk={handleExport}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
        okText="Transmit Data"
        width={540}
        centered
        className="premium-modal"
        okButtonProps={{
          style: { height: '48px', borderRadius: '12px', fontWeight: 800, background: colors.primary.gradient, border: 'none' }
        }}
        cancelButtonProps={{
          style: { height: '48px', borderRadius: '12px', fontWeight: 700 }
        }}
      >
        <div style={{ padding: '12px 0' }}>
          <Space direction="vertical" style={{ width: '100%' }} size={32}>
            <div>
              <Text style={{ color: colors.text.secondary, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>Temporal Range</Text>
              <RangePicker
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  background: colors.gray[50],
                  border: `1px solid ${colors.gray[200]}`
                }}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0].toDate(), dates[1].toDate()]);
                  } else {
                    setDateRange(undefined);
                  }
                }}
              />
              <Text style={{ marginTop: '8px', fontSize: '12px', color: colors.text.tertiary, display: 'block', fontWeight: 500 }}>
                Neutral selection defaults to all-time intelligence synchronization
              </Text>
            </div>

            <div>
              <Text style={{ color: colors.text.secondary, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '16px' }}>Neural Dimensions</Text>
              <Checkbox.Group
                value={selectedMetrics}
                onChange={(values) => setSelectedMetrics(values as string[])}
                style={{ width: '100%' }}
              >
                <Row gutter={[16, 16]}>
                  {metricOptions.map(opt => (
                    <Col span={12} key={opt.value}>
                      <div style={{
                        padding: '12px 16px',
                        background: selectedMetrics.includes(opt.value) ? colors.primary.subtle : colors.gray[50],
                        borderRadius: '12px',
                        border: `1px solid ${selectedMetrics.includes(opt.value) ? colors.primary.solid : colors.gray[100]}`,
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <Checkbox value={opt.value} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: selectedMetrics.includes(opt.value) ? colors.primary.solid : colors.text.secondary }}>{opt.label}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </div>

            <div style={{
              padding: '20px',
              background: colors.gray[50],
              borderRadius: '16px',
              border: `1px solid ${colors.gray[100]}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <Info size={20} style={{ color: colors.primary.solid, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: colors.text.secondary, lineHeight: 1.5 }}>
                <strong>Protocol Note:</strong> Your intelligence package will be compiled as <Text strong style={{ color: colors.primary.solid }}>{exportFormat.toUpperCase()}</Text>. High-density visualizations are included for PDF transmissions.
              </div>
            </div>
          </Space>
        </div>
      </Modal>
      <style>{`
          .premium-modal .ant-modal-content {
              border-radius: 24px !important;
              padding: 32px !important;
              background: #FFFFFF !important;
              border: none !important;
              box-shadow: ${shadows.xl} !important;
          }
          .premium-modal .ant-modal-header {
              margin-bottom: 24px !important;
              background: transparent !important;
          }
          .ant-checkbox-checked .ant-checkbox-inner {
              background-color: ${colors.primary.solid} !important;
              border-color: ${colors.primary.solid} !important;
          }
      `}</style>
    </>
  );
};

export default ExportButton;
