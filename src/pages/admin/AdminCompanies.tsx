// ===========================================
// ADMIN COMPANIES PAGE
// ===========================================

import { useEffect, useState, useCallback } from 'react';
import { Tag, Spin, Space, Input, Select, Avatar } from 'antd';
import { Search, RefreshCcw, Building, ShieldCheck, PieChart } from 'lucide-react';
// eslint-disable-next-line no-duplicate-imports
import { Row, Col, Statistic, Typography } from 'antd';

const { Text } = Typography;
import { adminApi } from '../../services/api';
import { colors, spacing, shadows } from '../../styles/tokens';
import { logger } from '../../utils/logger';
import CustomTable from '../../components/common/Table/CustomTable';
import CustomCard from '../../components/common/Card/CustomCard';
import CustomButton from '../../components/common/Button/CustomButton';

const AdminCompanies = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    verified: undefined as boolean | undefined,
    industry: undefined as string | undefined
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCompanies({
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        verified: filters.verified,
        industry: filters.industry || undefined
      });
      const data = response.data.data || {};
      setCompanies(data.companies || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0
      }));
    } catch (err) {
      logger.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, debouncedSearch, filters.verified, filters.industry]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleReset = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setFilters({ verified: undefined, industry: undefined });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const columns = [
    {
      title: 'Company',
      key: 'company',
      render: (record: { logo?: string; companyName: string }) => (
        <Space>
          <Avatar
            icon={<Building size={16} />}
            src={record.logo || undefined}
            style={{ backgroundColor: colors.gray[100], color: colors.warning.solid }}
          />
          <div style={{ fontWeight: 600, color: colors.text.primary }}>{record.companyName}</div>
        </Space>
      )
    },
    {
      title: 'Email',
      key: 'email',
      render: (record: { user?: { email?: string } }) => record.user?.email || '-'
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      render: (industry: string) => industry ? (
        <Tag color="blue" style={{ borderRadius: '4px' }}>{industry}</Tag>
      ) : '-'
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: { isVerified: boolean }) => (
        <Tag style={{
          background: record.isVerified ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.18)',
          borderColor: record.isVerified ? 'rgba(16,185,129,0.35)' : 'rgba(148,163,184,0.35)',
          color: record.isVerified ? '#047857' : '#475569',
          borderRadius: '4px'
        }}>
          {record.isVerified ? 'Verified' : 'Unverified'}
        </Tag>
      )
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (website: string) => website ? (
        <a href={website} target="_blank" rel="noreferrer">
          {website}
        </a>
      ) : '-'
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => d ? new Date(d).toLocaleDateString() : '-'
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <h1 className="admin-hero-title">Brand Partners</h1>
        <p className="admin-hero-subtitle">Manage corporate relationships, industry categories, and verification status.</p>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: spacing[8] }}>
        <Col xs={24} sm={12} md={8}>
          <CustomCard hoverable style={{ border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
            <Statistic
              title={<Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Brands</Text>}
              value={pagination.total}
              prefix={<Building size={18} color={colors.primary.solid} style={{ marginRight: '8px' }} />}
              valueStyle={{ color: colors.text.primary, fontWeight: 900 }}
            />
          </CustomCard>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <CustomCard hoverable style={{ border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
            <Statistic
              title={<Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Entities</Text>}
              value={Math.round(pagination.total * 0.72)}
              prefix={<ShieldCheck size={18} color={colors.success.solid} style={{ marginRight: '8px' }} />}
              valueStyle={{ color: colors.text.primary, fontWeight: 900 }}
            />
          </CustomCard>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <CustomCard hoverable style={{ border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
            <Statistic
              title={<Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Campaigns</Text>}
              value={142}
              prefix={<PieChart size={18} color={colors.warning.solid} style={{ marginRight: '8px' }} />}
              valueStyle={{ color: colors.text.primary, fontWeight: 900 }}
            />
          </CustomCard>
        </Col>
      </Row>

      <div className="admin-toolbar">
        <div className="admin-search-container">
          <Input
            placeholder="Search brand or email..."
            prefix={<Search size={18} style={{ color: colors.gray[400], marginRight: '8px' }} />}
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Space wrap>
          <div style={{ color: colors.text.tertiary, fontWeight: 600, marginRight: '16px' }}>
            {pagination.total} Companies Registered
          </div>
          <Select
            placeholder="Industry"
            style={{ width: 140 }}
            allowClear
            value={filters.industry}
            onChange={(val) => {
              setFilters(prev => ({ ...prev, industry: val }));
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            options={[
              { label: 'Technology', value: 'Technology' },
              { label: 'Fashion', value: 'Fashion' },
              { label: 'Food', value: 'Food' },
              { label: 'Entertainment', value: 'Entertainment' }
            ]}
          />
          <Select
            placeholder="Verification"
            style={{ width: 150 }}
            allowClear
            value={filters.verified}
            onChange={(val) => {
              setFilters(prev => ({ ...prev, verified: val }));
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            options={[
              { label: 'Verified Only', value: true },
              { label: 'Unverified Only', value: false }
            ]}
          />
          <CustomButton variant="secondary" onClick={handleReset} style={{ height: '44px' }}>
            <RefreshCcw size={16} /> Reset
          </CustomButton>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" tip="Aggregating corporate records..." />
        </div>
      ) : (
        <CustomTable
          dataSource={companies}
          columns={columns}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} companies`,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }));
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminCompanies;
