import React, { useEffect, useState } from 'react';
import {
    Modal,
    Tabs,
    Form,
    Input,
    Select,
    Button,
    Tag,
    Divider,
    Space,
    Statistic,
    Row,
    Col,
    message,
    Spin,
    Timeline,
    Badge,
    Switch,
    Card,
    Popconfirm,
    Empty,
    InputNumber
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    SafetyCertificateOutlined,
    HistoryOutlined,
    StopOutlined,
    UnlockOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EditOutlined
} from '@ant-design/icons';
import { adminApi } from '../../services/api';

interface UserDetailModalProps {
    userId: string | null;
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, visible, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [history, setHistory] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('1');
    const [form] = Form.useForm();

    // Action Reason Modal State
    const [actionVisible, setActionVisible] = useState(false);
    const [actionType, setActionType] = useState<'SUSPEND' | 'BAN'>('SUSPEND');
    const [actionForm] = Form.useForm();

    useEffect(() => {
        if (visible && userId) {
            fetchData();
        } else {
            setUser(null);
            setAnalytics(null);
            setHistory(null);
            setActiveTab('1');
            form.resetFields();
            setActionVisible(false);
            actionForm.resetFields();
        }
    }, [visible, userId]);

    const fetchData = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const [userRes, historyRes] = await Promise.all([
                adminApi.getUser(userId),
                adminApi.getUserModerationHistory(userId)
            ]);
            setUser(userRes.data.data.user);
            setAnalytics(userRes.data.data.analytics);
            setHistory(historyRes.data.data);
            form.setFieldsValue({
                name: userRes.data.data.user.name,
                email: userRes.data.data.user.email,
                role: userRes.data.data.user.role,
                isVerified: userRes.data.data.user.isVerified
            });
        } catch (err) {
            message.error('Failed to load user details');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!userId) return;
        try {
            setLoading(true);
            await adminApi.updateUser(userId, {
                name: values.name,
                email: values.email,
                isVerified: values.isVerified
            });
            if (values.role !== user.role) {
                await adminApi.updateUserRole(userId, values.role);
            }
            message.success('User updated successfully');
            fetchData();
            onSuccess();
            onClose();
        } catch (err) {
            message.error('Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    const handleActionSubmit = async (values: any) => {
        if (!userId) return;
        try {
            setLoading(true);
            if (actionType === 'SUSPEND') {
                await adminApi.suspendUser(userId, {
                    days: values.days || 7,
                    reason: values.reason
                });
                message.success(`User suspended for ${values.days || 7} days`);
            } else {
                await adminApi.banUser(userId, { reason: values.reason });
                message.success('User banned');
            }
            setActionVisible(false);
            actionForm.resetFields();
            fetchData();
            onSuccess();
            onClose();
        } catch (err) {
            message.error(`Failed to ${actionType.toLowerCase()} user`);
        } finally {
            setLoading(false);
        }
    };

    const handleUnsuspend = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            await adminApi.unsuspendUser(userId);
            message.success('User unsuspended');
            fetchData();
            onSuccess();
        } catch (err) {
            message.error('Failed to unsuspend user');
        } finally {
            setLoading(false);
        }
    };

    const handleUnban = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            await adminApi.unbanUser(userId);
            message.success('User unbanned');
            fetchData();
            onSuccess();
        } catch (err) {
            message.error('Failed to unban user');
        } finally {
            setLoading(false);
        }
    };

    const openActionModal = (type: 'SUSPEND' | 'BAN') => {
        setActionType(type);
        actionForm.setFieldsValue({ days: 7, reason: '' });
        setActionVisible(true);
    };

    const getStatusTags = () => {
        if (!user) return null;
        return (
            <Space>
                {user.isBanned && <Tag color="error" icon={<StopOutlined />}>BANNED</Tag>}
                {user.isSuspended && <Tag color="warning" icon={<ClockCircleOutlined />}>SUSPENDED</Tag>}
                {user.isVerified ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>VERIFIED</Tag>
                ) : (
                    <Tag color="default">UNVERIFIED</Tag>
                )}
                <Tag color="processing">{user.role}</Tag>
            </Space>
        );
    };

    const renderOverview = () => (
        <div style={{ paddingTop: '16px' }}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card size="small" className="admin-card-light">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Statistic title="Conversations" value={analytics?.conversationCount || 0} prefix={<HistoryOutlined />} />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Total Messages" value={analytics?.messageCount || 0} prefix={<MailOutlined />} />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Reports Made" value={analytics?.reportsMade || 0} prefix={<WarningOutlined />} />
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdate}
                        initialValues={{
                            name: user?.name,
                            email: user?.email,
                            role: user?.role,
                            isVerified: user?.isVerified
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                                    <Input prefix={<UserOutlined />} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                                    <Input prefix={<MailOutlined />} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="role" label="Account Role">
                                    <Select>
                                        <Select.Option value="USER">User (Fan)</Select.Option>
                                        <Select.Option value="CREATOR">Creator</Select.Option>
                                        <Select.Option value="COMPANY">Company</Select.Option>
                                        <Select.Option value="ADMIN">Administrator</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="isVerified" label="Verified Status" valuePropName="checked">
                                    <Switch checkedChildren="Verified" unCheckedChildren="Unverified" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                                {!user?.isBanned ? (
                                    <Button danger icon={<StopOutlined />} onClick={() => openActionModal('BAN')}>
                                        Ban User
                                    </Button>
                                ) : (
                                    <Button onClick={handleUnban} icon={<UnlockOutlined />}>Unban User</Button>
                                )}

                                {!user?.isSuspended ? (
                                    <Button
                                        style={{ borderColor: '#faad14', color: '#faad14' }}
                                        onClick={() => openActionModal('SUSPEND')}
                                        icon={<ClockCircleOutlined />}
                                    >
                                        Suspend User
                                    </Button>
                                ) : (
                                    <Button onClick={handleUnsuspend} icon={<UnlockOutlined />}>Unsuspend</Button>
                                )}
                            </Space>

                            <Button type="primary" htmlType="submit" icon={<EditOutlined />} loading={loading}>
                                Update Profile
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </div>
    );

    const renderHistory = () => (
        <div style={{ paddingTop: '16px' }}>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Card title="Moderation Logs" size="small">
                        {history?.moderationLogs?.length > 0 ? (
                            <Timeline
                                mode="left"
                                items={history.moderationLogs.map((log: any) => ({
                                    color: log.action.includes('BAN') ? 'red' : log.action.includes('SUSPEND') ? 'orange' : 'blue',
                                    children: (
                                        <>
                                            <div style={{ fontWeight: 600 }}>{log.action.replace('_', ' ')}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {new Date(log.createdAt).toLocaleString()} by {log.moderator?.name || 'AI System'}
                                            </div>
                                            {log.reason && <div style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '4px' }}>"{log.reason}"</div>}
                                        </>
                                    ),
                                }))}
                            />
                        ) : (
                            <Empty description="No moderation logs found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Reports Against User" size="small">
                        {history?.reportsAgainst?.length > 0 ? (
                            <Timeline
                                items={history.reportsAgainst.map((report: any) => ({
                                    color: report.status === 'RESOLVED' ? 'green' : 'gold',
                                    children: (
                                        <>
                                            <div style={{ fontWeight: 600 }}>{report.reason}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {new Date(report.createdAt).toLocaleString()} - <Badge status={report.status === 'RESOLVED' ? 'success' : 'warning'} text={report.status} />
                                            </div>
                                        </>
                                    ),
                                }))}
                            />
                        ) : (
                            <Empty description="No reports against this user" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );

    return (
        <>
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>User Details: {user?.name || 'Loading...'}</span>
                        {getStatusTags()}
                    </Space>
                }
                open={visible}
                onCancel={onClose}
                footer={null}
                width={800}
                className="admin-modal"
            >
                {loading && !user ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <Spin size="large" tip="Loading user data..." />
                    </div>
                ) : (
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: '1',
                                label: (
                                    <span>
                                        <UserOutlined />
                                        Overview
                                    </span>
                                ),
                                children: renderOverview(),
                            },
                            {
                                key: '2',
                                label: (
                                    <span>
                                        <HistoryOutlined />
                                        Moderation History
                                    </span>
                                ),
                                children: renderHistory(),
                            },
                        ]}
                    />
                )}
            </Modal>

            {/* Nested Action Reason Modal */}
            <Modal
                title={`${actionType === 'SUSPEND' ? 'Suspend' : 'Ban'} User: ${user?.name}`}
                open={actionVisible}
                onCancel={() => setActionVisible(false)}
                onOk={() => actionForm.submit()}
                confirmLoading={loading}
                okText="Confirm Action"
                okButtonProps={{ danger: true }}
                maskClosable={false}
                destroyOnClose
            >
                <Form
                    form={actionForm}
                    layout="vertical"
                    onFinish={handleActionSubmit}
                >
                    {actionType === 'SUSPEND' && (
                        <Form.Item
                            name="days"
                            label="Suspension Duration (Days)"
                            rules={[{ required: true }]}
                            initialValue={7}
                        >
                            <InputNumber min={1} max={365} style={{ width: '100%' }} />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="reason"
                        label={`${actionType === 'SUSPEND' ? 'Suspension' : 'Ban'} Reason`}
                        rules={[{ required: true, message: 'Please provide a reason' }]}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder={`Explain why this user is being ${actionType.toLowerCase()}ed...`}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default UserDetailModal;
