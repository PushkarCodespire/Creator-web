import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, message, Avatar, Popconfirm, Typography } from 'antd';
import { UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { companyApi, getImageUrl } from '../../services/api';
import { colors, spacing, shadows, typography, borderRadius } from '../../styles/tokens';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const CompanyDeals = () => {
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
            console.error(err);
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
        } catch (err: any) {
            message.error(err.response?.data?.error || 'Failed to complete deal');
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
                <Text style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>Track and manage your active creator contracts</Text>
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
                            render: (row: any) => (
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
                            render: (a: number) => <Text style={{ color: colors.primary.solid, fontWeight: 800, fontSize: '16px' }}>₹{a.toLocaleString()}</Text>
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
                            render: (row: any) => (
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
