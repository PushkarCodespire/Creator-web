// ===========================================
// ADMIN USERS PAGE (REFINED)
// ===========================================

import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Select, Card, Spin, Button, Space, Tooltip, Input } from 'antd';
import { EyeOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { adminApi } from '../../services/api';
import UserDetailModal from '../../components/admin/UserDetailModal';
import '../../styles/AdminPanel.css';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();

  // Modal State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination(prev => ({ ...prev, current: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers({
        page: pagination.current,
        limit: pagination.pageSize,
        role: roleFilter,
        search: debouncedSearch || undefined
      });
      setUsers(response.data.data.users || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination.total
      }));
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, roleFilter, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalVisible(true);
  };

  const handleReset = () => {
    setSearchTerm('');
    setRoleFilter(undefined);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <div style={{ fontWeight: 600 }}>{name}</div>
      )
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'purple' : role === 'CREATOR' ? 'blue' : 'default'} style={{ borderRadius: '4px' }}>
          {role}
        </Tag>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: any) => {
        if (record.isBanned) return <Tag color="error">BANNED</Tag>;
        if (record.isSuspended) return <Tag color="warning">SUSPENDED</Tag>;
        return (
          <Tag style={{
            background: record.isVerified ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.18)',
            borderColor: record.isVerified ? 'rgba(16,185,129,0.35)' : 'rgba(148,163,184,0.35)',
            color: record.isVerified ? '#047857' : '#475569',
            borderRadius: '4px'
          }}>
            {record.isVerified ? 'Verified' : 'Unverified'}
          </Tag>
        );
      }
    },
    { title: 'Joined', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString() },
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
            onClick={() => handleViewUser(record.id)}
          >
            View
          </Button>
        </Tooltip>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div>
          <h2 className="admin-hero-title">Users</h2>
          <p className="admin-hero-subtitle">Manage accounts, roles, and verification status.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-hero-subtitle">Showing {users.length} users</div>
        <Space wrap>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
            allowClear
            style={{ width: 220 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            placeholder="Filter by role"
            allowClear
            style={{ width: 180 }}
            value={roleFilter}
            onChange={(val) => {
              setRoleFilter(val);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
          >
            <Select.Option value="USER">Users</Select.Option>
            <Select.Option value="CREATOR">Creators</Select.Option>
            <Select.Option value="COMPANY">Companies</Select.Option>
            <Select.Option value="ADMIN">Admins</Select.Option>
          </Select>
          <Button
            icon={<FilterOutlined />}
            onClick={handleReset}
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
            dataSource={users}
            columns={columns}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} users`,
              pageSizeOptions: ['10', '20', '50'],
              onChange: (page, pageSize) => {
                setPagination({ current: page, pageSize, total: pagination.total });
              }
            }}
          />
        )}
      </Card>

      <UserDetailModal
        userId={selectedUserId}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default AdminUsers;
