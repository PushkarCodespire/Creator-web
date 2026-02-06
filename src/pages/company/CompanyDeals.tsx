// ===========================================
// COMPANY DEALS PAGE
// Manage active and completed deals
// ===========================================

import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, message, Avatar, Popconfirm } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { companyApi, getImageUrl } from '../../services/api';

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
        <div className="company-deals fade-in">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: '#F8FAFC' }}>
                    Manage Deals
                </h1>
                <p style={{ color: '#94A3B8', fontSize: '16px', margin: 0 }}>Track and manage your active creator contracts</p>
            </div>

            <Card
                bordered={false}
                style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px' }}
                bodyStyle={{ padding: '0' }}
            >
                <Table
                    dataSource={deals}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    style={{ background: 'transparent' }}
                    rowClassName="premium-table-row"
                    columns={[
                        {
                            title: 'Deal ID',
                            dataIndex: 'id',
                            key: 'id',
                            render: (id: string) => <span style={{ fontFamily: 'monospace', color: '#64748B' }}>#{id.slice(-6)}</span>
                        },
                        {
                            title: 'Creator',
                            key: 'creator',
                            render: (row: any) => (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Avatar src={row.creator?.profileImage ? getImageUrl(row.creator.profileImage) : undefined} icon={<UserOutlined />} style={{ background: '#334155' }} />
                                    <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{row.creator?.displayName}</span>
                                </div>
                            )
                        },
                        {
                            title: 'Opportunity',
                            dataIndex: ['application', 'opportunity', 'title'],
                            key: 'opportunity',
                            render: (t: string) => <span style={{ color: '#CBD5E1' }}>{t}</span>
                        },
                        {
                            title: 'Amount',
                            dataIndex: 'amount',
                            key: 'amount',
                            render: (a: number) => <span style={{ color: '#A5F3FC', fontWeight: 600, fontFamily: 'monospace' }}>₹{a.toLocaleString()}</span>
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
                                    <Tag color={color} style={{ border: 'none', padding: '2px 10px' }}>
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
                                            style={{ background: '#10B981', borderColor: '#10B981', boxShadow: 'none' }}
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
                  background: transparent !important;
                  color: #F8FAFC !important;
                }
                .ant-table-thead > tr > th {
                  background: rgba(30, 41, 59, 1) !important;
                  color: #94A3B8 !important;
                  border-bottom: 1px solid #334155 !important;
                }
                .premium-table-row:hover > td {
                  background: rgba(51, 65, 85, 0.5) !important;
                }
                .ant-table-tbody > tr > td {
                  border-bottom: 1px solid #334155 !important;
                  color: #F8FAFC !important;
                  padding: 16px 24px !important;
                }
                .ant-table-wrapper .ant-pagination-item {
                    background-color: transparent !important;
                    border-color: #334155 !important;
                }
                .ant-table-wrapper .ant-pagination-item-active {
                    border-color: #6366F1 !important;
                    background: rgba(99, 102, 241, 0.1) !important;
                }
                .ant-table-wrapper .ant-pagination-item a {
                    color: #94A3B8 !important;
                }
                .ant-table-wrapper .ant-pagination-item-active a {
                     color: #6366F1 !important;
                }
            `}</style>
        </div>
    );
};

export default CompanyDeals;
