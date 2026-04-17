import { useEffect, useState, useCallback } from 'react';
import {
    Card,
    Table,
    Tag,
    Button,
    message,
    Avatar,
    Popconfirm,
    Typography,
    Timeline,
    Form,
    Input,
    DatePicker,
    Empty,
    Spin,
    Tooltip,
    Space
} from 'antd';
import {
    UserOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    CheckCircleFilled,
    DeleteOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { companyApi, milestoneApi, getImageUrl } from '../../services/api';
import { colors, shadows } from '../../styles/tokens';
import { logger } from '../../utils/logger';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ===========================================
// MILESTONE TIMELINE (per-deal expandable panel)
// ===========================================
interface Milestone {
    id: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    completedAt: string | null;
    createdAt: string;
}

interface MilestoneTimelineProps {
    dealId: string;
    dealStatus: string;
}

const MilestoneTimeline = ({ dealId, dealStatus }: MilestoneTimelineProps) => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [form] = Form.useForm();

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await milestoneApi.list(dealId);
            setMilestones(res.data?.data?.milestones || []);
        } catch (err) {
            logger.error('Failed to load milestones', err);
        } finally {
            setLoading(false);
        }
    }, [dealId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleAdd = async (values: { title: string; description?: string; dueDate?: { toISOString: () => string } }) => {
        setAdding(true);
        try {
            await milestoneApi.create(dealId, {
                title: values.title,
                description: values.description || undefined,
                dueDate: values.dueDate ? values.dueDate.toISOString() : null
            });
            message.success('Milestone added');
            form.resetFields();
            setShowAddForm(false);
            load();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string | { message?: string } } } };
            const errData = e.response?.data?.error;
            message.error(
                (typeof errData === 'object' ? (errData as { message?: string })?.message : errData) ||
                    'Failed to add milestone'
            );
        } finally {
            setAdding(false);
        }
    };

    const handleComplete = async (id: string) => {
        setProcessingId(id);
        try {
            await milestoneApi.complete(id);
            message.success('Milestone marked as completed');
            load();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string | { message?: string } } } };
            const errData = e.response?.data?.error;
            message.error(
                (typeof errData === 'object' ? (errData as { message?: string })?.message : errData) ||
                    'Failed to complete milestone'
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        setProcessingId(id);
        try {
            await milestoneApi.delete(id);
            message.success('Milestone deleted');
            load();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string | { message?: string } } } };
            const errData = e.response?.data?.error;
            message.error(
                (typeof errData === 'object' ? (errData as { message?: string })?.message : errData) ||
                    'Failed to delete milestone'
            );
        } finally {
            setProcessingId(null);
        }
    };

    const canAdd = dealStatus === 'IN_PROGRESS';

    if (loading) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Spin size="small" />
            </div>
        );
    }

    return (
        <div style={{ padding: '16px 24px 24px 72px', background: colors.gray[50] }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}
            >
                <Text
                    style={{
                        fontWeight: 800,
                        fontSize: '12px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: colors.text.tertiary
                    }}
                >
                    Milestones ({milestones.length})
                </Text>
                {canAdd && !showAddForm && (
                    <Button
                        size="small"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setShowAddForm(true)}
                        style={{
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '12px',
                            background: colors.primary.solid,
                            borderColor: colors.primary.solid
                        }}
                    >
                        Add Milestone
                    </Button>
                )}
            </div>

            {showAddForm && (
                <Card
                    size="small"
                    style={{
                        marginBottom: '16px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: `1px solid ${colors.gray[200]}`
                    }}
                >
                    <Form form={form} layout="vertical" onFinish={handleAdd} requiredMark={false}>
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[{ required: true, message: 'Title is required' }]}
                            style={{ marginBottom: '12px' }}
                        >
                            <Input placeholder="e.g. Draft script approval" size="middle" />
                        </Form.Item>
                        <Form.Item name="description" label="Description" style={{ marginBottom: '12px' }}>
                            <TextArea
                                rows={2}
                                placeholder="What does this milestone cover? (optional)"
                            />
                        </Form.Item>
                        <Form.Item name="dueDate" label="Due date" style={{ marginBottom: '12px' }}>
                            <DatePicker
                                style={{ width: '100%' }}
                                disabledDate={(d) => d && d.isBefore(dayjs().startOf('day'))}
                            />
                        </Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={adding}
                                size="small"
                                style={{
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    background: colors.primary.solid,
                                    borderColor: colors.primary.solid
                                }}
                            >
                                Save
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    form.resetFields();
                                    setShowAddForm(false);
                                }}
                                style={{ borderRadius: '8px', fontWeight: 700 }}
                            >
                                Cancel
                            </Button>
                        </Space>
                    </Form>
                </Card>
            )}

            {milestones.length === 0 && !showAddForm ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No milestones yet"
                    style={{ padding: '16px' }}
                />
            ) : (
                <Timeline
                    items={milestones.map((m) => {
                        const isCompleted = m.status === 'COMPLETED';
                        const isOverdue =
                            !isCompleted && m.dueDate && dayjs(m.dueDate).isBefore(dayjs());
                        const dot = isCompleted ? (
                            <CheckCircleFilled style={{ color: '#10B981', fontSize: 16 }} />
                        ) : isOverdue ? (
                            <ExclamationCircleOutlined style={{ color: '#EF4444', fontSize: 16 }} />
                        ) : (
                            <ClockCircleOutlined style={{ color: colors.primary.solid, fontSize: 16 }} />
                        );

                        return {
                            dot,
                            color: isCompleted ? 'green' : isOverdue ? 'red' : 'blue',
                            children: (
                                <div
                                    style={{
                                        background: '#ffffff',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: `1px solid ${colors.gray[100]}`,
                                        marginBottom: '4px'
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text
                                                strong
                                                style={{
                                                    color: colors.text.primary,
                                                    fontSize: '14px',
                                                    textDecoration: isCompleted
                                                        ? 'line-through'
                                                        : 'none'
                                                }}
                                            >
                                                {m.title}
                                            </Text>
                                            {m.description && (
                                                <Paragraph
                                                    style={{
                                                        margin: '4px 0 0',
                                                        fontSize: '12px',
                                                        color: colors.text.tertiary
                                                    }}
                                                >
                                                    {m.description}
                                                </Paragraph>
                                            )}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    marginTop: '6px',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Tag
                                                    color={
                                                        isCompleted
                                                            ? 'success'
                                                            : isOverdue
                                                                ? 'error'
                                                                : 'processing'
                                                    }
                                                    style={{ borderRadius: 4, fontSize: 10, fontWeight: 700 }}
                                                >
                                                    {isCompleted
                                                        ? 'COMPLETED'
                                                        : isOverdue
                                                            ? 'OVERDUE'
                                                            : m.status.replace('_', ' ')}
                                                </Tag>
                                                {m.dueDate && (
                                                    <Text
                                                        style={{
                                                            fontSize: 11,
                                                            color: colors.text.tertiary
                                                        }}
                                                    >
                                                        Due {dayjs(m.dueDate).format('MMM D, YYYY')}
                                                    </Text>
                                                )}
                                                {isCompleted && m.completedAt && (
                                                    <Text
                                                        style={{
                                                            fontSize: 11,
                                                            color: '#059669',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        ✓ {dayjs(m.completedAt).format('MMM D, YYYY')}
                                                    </Text>
                                                )}
                                            </div>
                                        </div>
                                        {!isCompleted && canAdd && (
                                            <Space size={4}>
                                                <Tooltip title="Mark as completed">
                                                    <Button
                                                        type="text"
                                                        shape="circle"
                                                        size="small"
                                                        icon={<CheckCircleOutlined />}
                                                        style={{ color: '#10B981' }}
                                                        loading={processingId === m.id}
                                                        onClick={() => handleComplete(m.id)}
                                                    />
                                                </Tooltip>
                                                {m.status === 'PENDING' && (
                                                    <Popconfirm
                                                        title="Delete this milestone?"
                                                        okText="Delete"
                                                        cancelText="Keep"
                                                        okButtonProps={{ danger: true }}
                                                        onConfirm={() => handleDelete(m.id)}
                                                    >
                                                        <Tooltip title="Delete milestone">
                                                            <Button
                                                                type="text"
                                                                shape="circle"
                                                                size="small"
                                                                icon={<DeleteOutlined />}
                                                                style={{ color: '#EF4444' }}
                                                                loading={processingId === m.id}
                                                            />
                                                        </Tooltip>
                                                    </Popconfirm>
                                                )}
                                            </Space>
                                        )}
                                    </div>
                                </div>
                            )
                        };
                    })}
                />
            )}
        </div>
    );
};

// ===========================================
// MAIN PAGE — deals table with expandable milestone panels
// ===========================================
const CompanyDeals = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const response = await companyApi.getDeals({ limit: 50 });
            setDeals(response.data.data.deals || []);
        } catch (err) {
            logger.error(err as string);
            message.error('Failed to load deals');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (dealId: string) => {
        setProcessingId(dealId);
        try {
            await companyApi.completeDeal(dealId);
            message.success('Deal completed successfully!');
            fetchDeals();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } };
            message.error(e.response?.data?.error || 'Failed to complete deal');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '32px' }}
        >
            <div style={{ marginBottom: '32px' }}>
                <Title level={2} style={{ color: colors.text.primary, marginBottom: '4px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    Manage Deals
                </Title>
                <Text style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>Track and manage your active creator contracts. Expand a row to view milestones.</Text>
            </div>

            <Card
                bordered={false}
                style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    border: `1px solid ${colors.gray[100]}`,
                    boxShadow: shadows.md,
                    overflow: 'hidden'
                }}
                bodyStyle={{ padding: '0' }}
            >
                <Table
                    dataSource={deals}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    rowClassName="premium-table-row"
                    expandable={{
                        expandedRowRender: (record: { id: string; status: string }) => (
                            <MilestoneTimeline dealId={record.id} dealStatus={record.status} />
                        ),
                        rowExpandable: () => true
                    }}
                    columns={[
                        {
                            title: 'Deal ID',
                            dataIndex: 'id',
                            key: 'id',
                            render: (id: string) => <Text style={{ fontWeight: 800, color: colors.text.tertiary, fontSize: '12px' }}>#{id.slice(-6).toUpperCase()}</Text>
                        },
                        {
                            title: 'Creator',
                            key: 'creator',
                            render: (row: { creator?: { profileImage?: string; displayName?: string } }) => (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Avatar src={row.creator?.profileImage ? getImageUrl(row.creator.profileImage) : undefined} icon={<UserOutlined />} style={{ background: colors.gray[100], border: `1px solid ${colors.gray[200]}` }} />
                                    <Text style={{ fontWeight: 700, color: colors.text.primary, fontSize: '15px' }}>{row.creator?.displayName}</Text>
                                </div>
                            )
                        },
                        {
                            title: 'Opportunity',
                            dataIndex: ['application', 'opportunity', 'title'],
                            key: 'opportunity',
                            render: (t: string) => <Text style={{ color: colors.text.tertiary, fontWeight: 500 }}>{t}</Text>
                        },
                        {
                            title: 'Amount',
                            dataIndex: 'amount',
                            key: 'amount',
                            render: (a: string | number | null) => {
                                const n = a !== null ? Number(a) : null;
                                return n && !Number.isNaN(n)
                                    ? <Text style={{ color: colors.primary.solid, fontWeight: 800, fontSize: '16px' }}>₹{n.toLocaleString('en-IN')}</Text>
                                    : <Text style={{ color: colors.text.tertiary, fontWeight: 500 }}>—</Text>;
                            }
                        },
                        {
                            title: 'Status',
                            dataIndex: 'status',
                            key: 'status',
                            render: (s: string) => {
                                let color = 'default';
                                if (s === 'IN_PROGRESS') color = 'processing';
                                if (s === 'COMPLETED') color = 'success';
                                if (s === 'CANCELLED') color = 'error';
                                return (
                                    <Tag color={color} style={{ borderRadius: '6px', fontWeight: 700, padding: '2px 10px' }}>
                                        {s?.replace('_', ' ')}
                                    </Tag>
                                );
                            }
                        },
                        {
                            title: 'Actions',
                            key: 'actions',
                            render: (row: { id: string; status: string }) => (
                                row.status === 'IN_PROGRESS' && (
                                    <Popconfirm
                                        title="Complete this deal?"
                                        description="This will release the funds to the creator. Are you sure?"
                                        onConfirm={() => handleComplete(row.id)}
                                        okText="Yes, Complete"
                                        cancelText="No"
                                        okButtonProps={{ loading: processingId === row.id }}
                                    >
                                        <Button
                                            type="primary"
                                            size="small"
                                            style={{
                                                background: colors.success?.solid || '#10B981',
                                                borderColor: colors.success?.solid || '#10B981',
                                                borderRadius: '8px',
                                                fontWeight: 700,
                                                fontSize: '12px'
                                            }}
                                        >
                                            Mark Complete
                                        </Button>
                                    </Popconfirm>
                                )
                            )
                        }
                    ]}
                />
            </Card>

            <style>{`
                .ant-table {
                  background: #ffffff !important;
                }
                .ant-table-thead > tr > th {
                  background: ${colors.gray[50]} !important;
                  color: ${colors.text.tertiary} !important;
                  border-bottom: 2px solid ${colors.gray[100]} !important;
                  font-weight: 800 !important;
                  text-transform: uppercase !important;
                  font-size: 11px !important;
                  letter-spacing: 0.05em !important;
                  padding: 16px 24px !important;
                }
                .premium-table-row:hover > td {
                  background: ${colors.gray[50]} !important;
                }
                .ant-table-tbody > tr > td {
                  border-bottom: 1px solid ${colors.gray[50]} !important;
                  color: ${colors.text.primary} !important;
                  padding: 20px 24px !important;
                  font-weight: 500 !important;
                }
                .ant-table-expanded-row > td {
                  padding: 0 !important;
                  background: ${colors.gray[50]} !important;
                }
                .ant-pagination-item {
                    border-radius: 8px !important;
                    border-color: ${colors.gray[200]} !important;
                }
                .ant-pagination-item-active {
                    border-color: ${colors.primary.solid} !important;
                    background: ${colors.primary.subtle} !important;
                }
                .ant-pagination-item a {
                    color: ${colors.text.tertiary} !important;
                    font-weight: 700 !important;
                }
                .ant-pagination-item-active a {
                     color: ${colors.primary.solid} !important;
                }
                .ant-popover-inner {
                  border-radius: 16px !important;
                  padding: 12px !important;
                }
                .ant-popover-message-title {
                  font-weight: 700 !important;
                  color: ${colors.text.primary} !important;
                }
                .ant-popover-buttons .ant-btn {
                  border-radius: 8px !important;
                  font-weight: 600 !important;
                }
            `}</style>
        </motion.div>
    );
};

export default CompanyDeals;
