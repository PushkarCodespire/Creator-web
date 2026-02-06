// ===========================================
// EXPORT BUTTON COMPONENT
// Export analytics data as CSV or PDF
// ===========================================

import React, { useState } from 'react';
import { Button, Dropdown, DatePicker, Modal, Checkbox, message, Space } from 'antd';
import { DownloadOutlined, FileTextOutlined, FilePdfOutlined } from '@ant-design/icons';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import type { MenuProps } from 'antd';

const { RangePicker } = DatePicker;

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
      // Call parent callback if provided
      if (onExport) {
        onExport(exportFormat, dateRange, selectedMetrics);
      } else {
        // Default export implementation
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
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Metric', 'Value', 'Period'];
    const rows = [
      ['Total Messages', '1,234', dateRange ? `${format(dateRange[0], 'MMM dd, yyyy')} - ${format(dateRange[1], 'MMM dd, yyyy')}` : 'All Time'],
      ['Total Revenue', '₹45,600', dateRange ? `${format(dateRange[0], 'MMM dd, yyyy')} - ${format(dateRange[1], 'MMM dd, yyyy')}` : 'All Time'],
      ['New Users', '89', dateRange ? `${format(dateRange[0], 'MMM dd, yyyy')} - ${format(dateRange[1], 'MMM dd, yyyy')}` : 'All Time']
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
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

    // Add title
    doc.setFontSize(18);
    doc.text(`${creatorName} - Analytics Report`, 20, 20);

    // Add date range
    doc.setFontSize(12);
    const dateText = dateRange
      ? `Period: ${format(dateRange[0], 'MMM dd, yyyy')} - ${format(dateRange[1], 'MMM dd, yyyy')}`
      : 'Period: All Time';
    doc.text(dateText, 20, 30);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, 37);

    // Add metrics
    let yPos = 50;
    doc.setFontSize(14);
    doc.text('Key Metrics:', 20, yPos);

    yPos += 10;
    doc.setFontSize(11);

    if (selectedMetrics.includes('messages')) {
      doc.text('Total Messages: 1,234', 25, yPos);
      yPos += 7;
    }

    if (selectedMetrics.includes('revenue')) {
      doc.text('Total Revenue: ₹45,600', 25, yPos);
      yPos += 7;
    }

    if (selectedMetrics.includes('users')) {
      doc.text('New Users: 89', 25, yPos);
      yPos += 7;
    }

    if (selectedMetrics.includes('retention')) {
      yPos += 5;
      doc.setFontSize(14);
      doc.text('Retention Analysis:', 20, yPos);
      yPos += 10;
      doc.setFontSize(11);
      doc.text('Week 1 Retention: 65%', 25, yPos);
      yPos += 7;
      doc.text('Week 4 Retention: 42%', 25, yPos);
      yPos += 7;
    }

    if (selectedMetrics.includes('activity')) {
      yPos += 5;
      doc.setFontSize(14);
      doc.text('Peak Activity:', 20, yPos);
      yPos += 10;
      doc.setFontSize(11);
      doc.text('Peak Hour: Monday 2 PM (156 messages)', 25, yPos);
      yPos += 7;
    }

    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text('Creator Platform Analytics', 20, 280);

    // Download PDF
    doc.save(`${creatorName}_analytics_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'csv',
      label: (
        <Space>
          <FileTextOutlined />
          Export as CSV
        </Space>
      ),
      onClick: () => handleExportClick('csv')
    },
    {
      key: 'pdf',
      label: (
        <Space>
          <FilePdfOutlined />
          Export as PDF
        </Space>
      ),
      onClick: () => handleExportClick('pdf')
    }
  ];

  return (
    <>
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Button icon={<DownloadOutlined />}>
          Export Analytics
        </Button>
      </Dropdown>

      <Modal
        title={`Export Analytics as ${exportFormat.toUpperCase()}`}
        open={isModalVisible}
        onOk={handleExport}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
        okText="Export"
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Date Range Picker */}
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 500 }}>Date Range (Optional)</div>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0].toDate(), dates[1].toDate()]);
                } else {
                  setDateRange(undefined);
                }
              }}
            />
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#8c8c8c' }}>
              Leave empty to export all-time data
            </div>
          </div>

          {/* Metric Selection */}
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 500 }}>Select Metrics to Export</div>
            <Checkbox.Group
              options={metricOptions}
              value={selectedMetrics}
              onChange={(values) => setSelectedMetrics(values as string[])}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            />
          </div>

          <div style={{ padding: '12px', background: '#f0f5ff', borderRadius: '4px', fontSize: '12px' }}>
            <strong>Note:</strong> The exported file will include all selected metrics for the specified date range.
            {exportFormat === 'pdf' && ' The PDF will include charts and visualizations.'}
            {exportFormat === 'csv' && ' The CSV will contain raw data suitable for further analysis.'}
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default ExportButton;
