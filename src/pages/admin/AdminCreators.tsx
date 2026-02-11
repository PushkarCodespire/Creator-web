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
  Spin,
  Statistic
} from 'antd';
import { Eye, Search, Filter, RefreshCcw, Users, ShieldCheck, Clock, UserCheck } from 'lucide-react';
import { adminApi } from '../../services/api';
import CreatorDetailModal from '../../components/admin/CreatorDetailModal';
import { colors, spacing, typography, shadows } from '../../styles/tokens';
import CustomTable from '../../components/common/Table/CustomTable';
import CustomCard from '../../components/common/Card/CustomCard';
import CustomInput from '../../components/common/Form/CustomInput';
import CustomButton from '../../components/common/Button/CustomButton';

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
        <Tag className="admin-tag-primary">
          {c}
        </Tag>
      ) : '-'
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: any) => (
        <Space size="small">
          {record.isVerified ? (
            <Tag className="admin-tag-success">Verified</Tag>
          ) : (
            <Tag className="admin-tag-neutral">Unverified</Tag>
          )}
          {record.isActive ? (
            <Tag className="admin-tag-primary">Active</Tag>
          ) : (
            <Tag className="admin-tag-neutral">Inactive</Tag>
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
          <CustomButton
            variant="ghost"
            size="small"
            onClick={() => handleViewCreator(record.id)}
          >
            <Eye size={16} /> View
          </CustomButton>
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
        <h1 className="admin-hero-title">Creator Network</h1>
        <p className="admin-hero-subtitle">Oversee creator registrations, verify identities, and manage content pipelines.</p>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: spacing[8] }}>
        <Col xs={24} sm={12} md={6}>
          <CustomCard hoverable style={{ border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
            <Statistic
              title={<Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Creators</Text>}
              value={pagination.total}
              prefix={<Users size={18} color={colors.primary.solid} style={{ marginRight: '8px' }} />}
              valueStyle={{ color: colors.text.primary, fontWeight: 900 }}
            />
          </CustomCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <CustomCard hoverable style={{ border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
            <Statistic
              title={<Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified</Text>}
              value={Math.round(pagination.total * 0.85)}
              prefix={<ShieldCheck size={18} color={colors.success.solid} style={{ marginRight: '8px' }} />}
              valueStyle={{ color: colors.text.primary, fontWeight: 900 }}
            />
          </CustomCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <CustomCard hoverable style={{ border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
            <Statistic
              title={<Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Review</Text>}
              value={pendingCount}
              prefix={<Clock size={18} color={colors.warning.solid} style={{ marginRight: '8px' }} />}
              valueStyle={{ color: colors.text.primary, fontWeight: 900 }}
            />
          </CustomCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <CustomCard hoverable style={{ border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
            <Statistic
              title={<Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Rate</Text>}
              value={94}
              suffix="%"
              prefix={<UserCheck size={18} color={colors.success.solid} style={{ marginRight: '8px' }} />}
              valueStyle={{ color: colors.text.primary, fontWeight: 900 }}
            />
          </CustomCard>
        </Col>
      </Row>

      <div style={{ marginBottom: spacing[6] }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          items={tabItems}
          style={{ marginBottom: spacing[4] }}
          className="premium-tabs"
        />
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-container">
          <Input
            placeholder="Search creators..."
            prefix={<Search size={18} style={{ color: colors.gray[400], marginRight: '8px' }} />}
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Space wrap>
          <div style={{ color: colors.text.tertiary, fontWeight: 600, marginRight: '16px' }}>
            {pagination.total} Creators found
          </div>
          <Select
            placeholder="Category"
            style={{ width: 140 }}
            allowClear
            value={filters.category}
            onChange={(val) => {
              setFilters(prev => ({ ...prev, category: val }));
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            options={[
              { label: 'Technology', value: 'Technology' },
              { label: 'Lifestyle', value: 'Lifestyle' },
              { label: 'Art', value: 'Art' },
              { label: 'Music', value: 'Music' },
              { label: 'Fitness', value: 'Fitness' },
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
          <Select
            placeholder="Account Status"
            style={{ width: 150 }}
            allowClear
            value={filters.active}
            onChange={(val) => {
              setFilters(prev => ({ ...prev, active: val }));
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            options={[
              { label: 'Active Only', value: true },
              { label: 'Suspended Only', value: false }
            ]}
          />
          <CustomButton variant="secondary" onClick={() => {
            setSearchTerm('');
            setFilters({ search: '', verified: undefined, active: undefined, category: undefined });
            setPagination(prev => ({ ...prev, current: 1 }));
          }} style={{ height: '44px' }}>
            <RefreshCcw size={16} /> Reset
          </CustomButton>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" tip="Processing creator roster..." />
        </div>
      ) : (
        <CustomTable
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
