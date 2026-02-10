// ===========================================
// ADMIN COMPANIES PAGE
// ===========================================

import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Card, Spin, Space, Input, Select, Button, Avatar } from 'antd';
import { SearchOutlined, FilterOutlined, ShopOutlined } from '@ant-design/icons';
import { adminApi } from '../../services/api';
import '../../styles/AdminPanel.css';

const AdminCompanies = () => {
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
      console.error('Failed to fetch companies:', err);
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
      render: (record: any) => (
        <Space>
          <Avatar
            icon={<ShopOutlined />}
            src={record.logo || undefined}
            style={{ backgroundColor: '#F1F5F9', color: '#F59E0B' }}
          />
          <div style={{ fontWeight: 600 }}>{record.companyName}</div>
        </Space>
      )
    },
    {
      title: 'Email',
      key: 'email',
      render: (record: any) => record.user?.email || '-'
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
      render: (record: any) => (
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
        <div>
          <h2 className="admin-hero-title">Companies</h2>
          <p className="admin-hero-subtitle">Manage partner companies, verification, and profiles.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-hero-subtitle">Showing {companies.length} companies</div>
        <Space wrap>
          <Input
            placeholder="Search companies..."
            prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
            allowClear
            style={{ width: 220 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            placeholder="Verification"
            style={{ width: 160 }}
            allowClear
            value={filters.verified}
            onChange={(val) => {
              setFilters(prev => ({ ...prev, verified: val }));
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            options={[
              { label: 'Verified', value: true },
              { label: 'Unverified', value: false }
            ]}
          />
          <Select
            placeholder="Industry"
            style={{ width: 160 }}
            allowClear
            value={filters.industry}
            onChange={(val) => {
              setFilters(prev => ({ ...prev, industry: val }));
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            options={[
              { label: 'Technology', value: 'Technology' },
              { label: 'Fashion', value: 'Fashion' },
              { label: 'Finance', value: 'Finance' },
              { label: 'Business', value: 'Business' },
              { label: 'Lifestyle', value: 'Lifestyle' },
              { label: 'Education', value: 'Education' },
              { label: 'Health', value: 'Health' }
            ]}
          />
          <Button icon={<FilterOutlined />} onClick={handleReset}>
            Reset
          </Button>
        </Space>
      </div>

      <Card className="admin-card admin-table">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
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
      </Card>
    </div>
  );
};

export default AdminCompanies;
