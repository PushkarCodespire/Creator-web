// ===========================================
// ADMIN CREATORS PAGE (OVERHAULED & MATCHED TO USERS)
// ===========================================

import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Tag,
  Card,
  Button,
  Space,
  message,
  Tooltip,
  Tabs,
  Input,
  Select,
  Row,
  Col,
  Badge,
  Typography,
  Spin
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../services/api';
import CreatorDetailModal from '../../components/admin/CreatorDetailModal';
import '../../styles/AdminPanel.css';

const { Text } = Typography;

const AdminCreators = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [pendingCount, setPendingCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    verified: undefined as boolean | undefined,
    active: undefined as boolean | undefined,
    category: undefined as string | undefined
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      setPagination(prev => ({ ...prev, current: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Detail modal state
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchCreators = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      const commonParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search || undefined,
        category: filters.category || undefined,
      };

      if (activeTab === 'pending') {
        response = await adminApi.getPendingCreators(commonParams);
      } else {
        response = await adminApi.getCreators({
          ...commonParams,
          verified: filters.verified,
          active: filters.active
        });
      }

      setCreators(response.data.data.creators || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination?.total || 0
      }));

      // Update pending count for the badge
      const pendingRes = await adminApi.getPendingCreators({ limit: 1 });
      setPendingCount(pendingRes.data.data.pagination?.total || 0);

    } catch (err) {
      console.error('Failed to fetch creators:', err);
      message.error('Failed to load creators');
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleViewCreator = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Creator',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (name: string) => (
        <div style={{ fontWeight: 600 }}>{name}</div>
      )
    },
    {
      title: 'Email',
      key: 'email',
      render: (record: any) => record.user?.email || '-'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (c: string) => c ? (
        <Tag color="blue" style={{ borderRadius: '4px' }}>
          {c}
        </Tag>
      ) : '-'
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: any) => (
        <Space size="small">
          <Tag style={{
            background: record.isVerified ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.18)',
            borderColor: record.isVerified ? 'rgba(16,185,129,0.35)' : 'rgba(148,163,184,0.35)',
            color: record.isVerified ? '#047857' : '#475569',
            borderRadius: '4px'
          }}>
            {record.isVerified ? 'Verified' : 'Unverified'}
          </Tag>
          {record.isActive ? (
            <Tag color="success" style={{ borderRadius: '4px' }}>Active</Tag>
          ) : (
            <Tag color="default" style={{ borderRadius: '4px' }}>Inactive</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => new Date(d).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Tooltip title="View Details">
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewCreator(record.id)}
          >
            View
          </Button>
        </Tooltip>
      )
    }
  ];

  const tabItems = [
    {
      key: 'all',
      label: 'All Creators',
    },
    {
      key: 'pending',
      label: (
        <span>
          Pending Verifications
          {pendingCount > 0 && (
            <Badge count={pendingCount} style={{ backgroundColor: '#EF4444', marginLeft: '8px' }} />
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div>
          <h2 className="admin-hero-title">Creators</h2>
          <p className="admin-hero-subtitle">Manage accounts, verify applications, and roles.</p>
        </div>
      </div>

      <div className="admin-tabs-container" style={{ marginBottom: '18px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          className="admin-tabs"
          items={tabItems}
        />
      </div>

      <div className="admin-toolbar">
        <div className="admin-hero-subtitle">Showing {creators.length} creators</div>
        <Space wrap>
          <Input
            placeholder="Search creators..."
            prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
            allowClear
            style={{ width: 220 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            placeholder="Category"
            style={{ width: 140 }}
            allowClear
            value={filters.category}
            onChange={(val) => handleFilterChange('category', val)}
            options={[
              { label: 'Technology', value: 'Technology' },
              { label: 'Lifestyle', value: 'Lifestyle' },
              { label: 'Art', value: 'Art' },
              { label: 'Music', value: 'Music' },
              { label: 'Fitness', value: 'Fitness' },
            ]}
          />
          {activeTab === 'all' && (
            <>
              <Select
                placeholder="Verification"
                style={{ width: 140 }}
                allowClear
                value={filters.verified}
                onChange={(val) => handleFilterChange('verified', val)}
                options={[
                  { label: 'Verified', value: true },
                  { label: 'Unverified', value: false },
                ]}
              />
              <Select
                placeholder="Active Status"
                style={{ width: 140 }}
                allowClear
                value={filters.active}
                onChange={(val) => handleFilterChange('active', val)}
                options={[
                  { label: 'Active', value: true },
                  { label: 'Inactive', value: false },
                ]}
              />
            </>
          )}
          <Button
            icon={<FilterOutlined />}
            onClick={() => {
              setSearchTerm('');
              setFilters({ search: '', verified: undefined, active: undefined, category: undefined });
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
          >
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
            dataSource={creators}
            columns={columns}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} creators`,
              pageSizeOptions: ['10', '20', '50'],
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }));
              }
            }}
          />
        )}
      </Card>

      <CreatorDetailModal
        creatorId={selectedCreatorId}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={fetchCreators}
      />
    </div>
  );
};

export default AdminCreators;
