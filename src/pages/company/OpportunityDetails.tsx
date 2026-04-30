import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Button, Avatar, Spin, Statistic, Row, Col, Modal, InputNumber, message, Descriptions, Typography } from 'antd';
import { UserOutlined, ArrowLeftOutlined, CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons';
import { opportunityApi, getImageUrl } from '../../services/api';
import { logger } from '../../utils/logger';
import { colors, shadows } from '../../styles/tokens';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

const OpportunityDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [opportunity, setOpportunity] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Action states
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedApplication, setSelectedApplication] = useState<any>(null);
    const [dealAmount, setDealAmount] = useState<number>(0);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await opportunityApi.getById(id!);
            setOpportunity(response.data.data);
        } catch (err) {
            logger.error(err as string);
            message.error('Failed to load opportunity details');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (applicationId: string) => {
        if (!window.confirm('Are you sure you want to reject this application?')) return;

        setProcessingId(applicationId);
        try {
            await opportunityApi.rejectApplication(applicationId);
            message.success('Application rejected');
            fetchDetails(); // Refresh list
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } };
            message.error(e.response?.data?.error || 'Failed to reject');
        } finally {
            setProcessingId(null);
        }
    };

    const openAcceptModal = (app: { id: string; amount?: number; proposedBudget?: number }) => {
        setSelectedApplication(app);
        setDealAmount(Number(app.proposedBudget) || Number(opportunity?.budget) || 0);
        setAcceptModalOpen(true);
    };

    const handleAcceptConfirm = async () => {
        if (!selectedApplication) return;

        setProcessingId(selectedApplication.id);
        try {
            await opportunityApi.acceptApplication(selectedApplication.id, dealAmount);
            message.success('Application accepted! Deal created.');
            setAcceptModalOpen(false);
            fetchDetails();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } };
            message.error(e.response?.data?.error || 'Failed to accept');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    if (!opportunity) return <div>Opportunity not found</div>;

    const applications = opportunity.applications || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '32px' }}
        >
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/company-dashboard/opportunities')}
                    style={{ border: `1px solid ${colors.gray[200]}`, background: '#fff', color: colors.text.primary, borderRadius: '8px', fontWeight: 600 }}
                >
                    Back
                </Button>
                <div style={{ fontSize: '14px', color: colors.text.tertiary, fontWeight: 500 }}>
                    Opportunities / <span style={{ color: colors.text.primary, fontWeight: 700 }}>{opportunity.title}</span>
                </div>
            </div>

            <Row gutter={24}>
                {/* Left Column: Opportunity Info */}
                <Col xs={24} lg={16}>
                    <Card
                        bordered={false}
                        style={{ background: '#ffffff', borderRadius: '24px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.md, marginBottom: '24px' }}
                        bodyStyle={{ padding: '32px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div>
                                <Title level={3} style={{ color: colors.text.primary, margin: 0, fontWeight: 800 }}>{opportunity.title}</Title>
                                {opportunity.category && <Tag color="geekblue" style={{ marginTop: '12px', borderRadius: '6px', fontWeight: 700 }}>{opportunity.category}</Tag>}
                            </div>
                            <Tag color={opportunity.status === 'OPEN' ? 'success' : 'default'} style={{ fontSize: '14px', padding: '4px 16px', borderRadius: '12px', fontWeight: 800 }}>
                                {opportunity.status}
                            </Tag>
                        </div>

                        <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ color: colors.text.tertiary, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }} contentStyle={{ color: colors.text.primary, fontWeight: 600, fontSize: '15px' }}>
                            <Descriptions.Item label="Budget Type">{opportunity.budgetType}</Descriptions.Item>
                            <Descriptions.Item label="Budget">
                                {opportunity.budget ? <Text style={{ color: colors.primary.solid, fontWeight: 800 }}>₹{opportunity.budget.toLocaleString()}</Text> : <Text style={{ color: colors.secondary?.solid || colors.primary.solid, fontWeight: 800 }}>Negotiable</Text>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Deadline">
                                {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : 'No Deadline'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Type">
                                {opportunity.type?.replace('_', ' ')}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 32, borderTop: `1px solid ${colors.gray[50]}`, paddingTop: 32 }}>
                            <Title level={5} style={{ color: colors.text.primary, fontWeight: 800, marginBottom: '16px' }}>Description</Title>
                            <Paragraph style={{ whiteSpace: 'pre-wrap', color: colors.text.secondary, lineHeight: 1.8, fontSize: '16px', fontWeight: 500 }}>{opportunity.description}</Paragraph>
                        </div>
                    </Card>

                    <Title level={4} style={{ color: colors.text.primary, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                        Applications <Tag style={{ borderRadius: '6px', fontWeight: 800, border: 'none', background: colors.gray[50], color: colors.text.tertiary }}>{applications.length}</Tag>
                    </Title>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {applications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', background: colors.gray[50], borderRadius: '16px', border: `1px solid ${colors.gray[200]}`, color: colors.text.tertiary }}>
                                No applications received yet.
                            </div>
                        ) : (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            applications.map((item: any) => (
                                <Card
                                    key={item.id}
                                    bordered={false}
                                    style={{ background: '#ffffff', border: `1px solid ${colors.gray[100]}`, borderRadius: '24px', boxShadow: shadows.sm }}
                                    bodyStyle={{ padding: '24px' }}
                                >
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                        <div style={{ position: 'relative' }}>
                                            <Avatar
                                                size={72}
                                                src={item.creator?.profileImage ? getImageUrl(item.creator.profileImage) : undefined}
                                                icon={<UserOutlined />}
                                                style={{ border: `3px solid ${colors.primary.subtle}`, background: colors.gray[50] }}
                                            />
                                            {item.creator?.isVerified && (
                                                <CheckCircleFilled style={{ position: 'absolute', bottom: 0, right: 0, color: colors.primary.solid, fontSize: '18px', background: '#fff', borderRadius: '50%' }} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                                <div>
                                                    <Title level={5} style={{ color: colors.text.primary, margin: 0, fontWeight: 800 }}>{item.creator?.displayName}</Title>
                                                    <Text style={{ color: colors.text.tertiary, fontSize: '12px', fontWeight: 700 }}>APPLIED {new Date(item.createdAt).toLocaleDateString().toUpperCase()}</Text>
                                                </div>
                                                {item.proposedBudget && (
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Proposed Budget</div>
                                                        <div style={{ color: colors.primary.solid, fontWeight: 900, fontSize: '18px' }}>₹{item.proposedBudget.toLocaleString()}</div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Contact Info Section */}
                                            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', fontSize: '12px', flexWrap: 'wrap' }}>
                                                {item.creator?.user?.email && (
                                                    <Tag icon={<UserOutlined />} style={{ color: colors.text.secondary, fontWeight: 600 }}>{item.creator.user.email}</Tag>
                                                )}
                                                {item.creator?.instagramUrl && (
                                                    <a href={item.creator.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C', fontWeight: 700 }}>Instagram</a>
                                                )}
                                                {item.creator?.websiteUrl && (
                                                    <a href={item.creator.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.primary.solid, fontWeight: 700 }}>Website</a>
                                                )}
                                            </div>

                                            <div style={{ background: colors.gray[50], padding: '20px', borderRadius: '16px', color: colors.text.secondary, marginBottom: '20px', fontStyle: 'italic', borderLeft: `4px solid ${colors.primary.solid}`, fontWeight: 500, fontSize: '15px', lineHeight: 1.6 }}>
                                                "{item.pitch}"
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                                {item.status === 'PENDING' ? (
                                                    <>
                                                        <Button
                                                            danger
                                                            type="text"
                                                            onClick={() => handleReject(item.id)}
                                                            loading={processingId === item.id}
                                                            style={{ fontWeight: 700 }}
                                                        >
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            type="primary"
                                                            onClick={() => openAcceptModal(item)}
                                                            loading={processingId === item.id}
                                                            style={{ background: '#10B981', borderColor: '#10B981', borderRadius: '10px', height: '40px', fontWeight: 700, padding: '0 24px' }}
                                                        >
                                                            Accept Proposal
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Tag color={item.status === 'ACCEPTED' ? 'success' : 'error'} style={{ fontSize: '14px', padding: '4px 16px', borderRadius: '8px', fontWeight: 800 }}>
                                                        {item.status}
                                                    </Tag>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </Col>

                {/* Right Column: Stats or Tips */}
                <Col xs={24} lg={8}>
                    <Card
                        title={<span style={{ color: colors.text.primary, fontWeight: 800, fontSize: '18px' }}>📊 Quick Stats</span>}
                        bordered={false}
                        style={{ background: '#ffffff', borderRadius: '24px', border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.md }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Statistic
                                    title={<Text style={{ color: colors.text.tertiary, fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>Views</Text>}
                                    value={opportunity.viewCount || 0}
                                    valueStyle={{ color: colors.text.primary, fontWeight: 900, letterSpacing: '-0.02em' }}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title={<Text style={{ color: colors.text.tertiary, fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>Applications</Text>}
                                    value={applications.length}
                                    valueStyle={{ color: colors.text.primary, fontWeight: 900, letterSpacing: '-0.02em' }}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Accept Deal Modal */}
            <Modal
                title="Accept Proposal & Create Deal"
                open={acceptModalOpen}
                onOk={handleAcceptConfirm}
                onCancel={() => setAcceptModalOpen(false)}
                confirmLoading={!!processingId}
                okText="Create Contract"
                width={500}
                bodyStyle={{ padding: '24px 0 0 0' }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '20px', background: colors.gray[50], borderRadius: '16px', border: `1px solid ${colors.gray[100]}` }}>
                        <Avatar size={48} src={selectedApplication?.creator?.profileImage ? getImageUrl(selectedApplication.creator.profileImage) : undefined} icon={<UserOutlined />} style={{ border: `2px solid ${colors.primary.subtle}` }} />
                        <div>
                            <Text style={{ fontWeight: 800, color: colors.text.primary, fontSize: '16px', display: 'block' }}>{selectedApplication?.creator?.displayName}</Text>
                            <Tag color="blue" style={{ borderRadius: '4px', fontWeight: 700, marginTop: '4px' }}>Waitlist Creator</Tag>
                        </div>
                    </div>

                    <Text style={{ display: 'block', marginBottom: '20px', color: colors.text.secondary, fontWeight: 500, lineHeight: 1.6 }}>Please confirm the final agreed amount for this collaboration. This will establish a legal contract between both parties.</Text>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', marginBottom: 10, fontWeight: 800, color: colors.text.primary, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Final Deal Amount (INR)</label>
                        <InputNumber
                            style={{ width: '100%', borderRadius: '12px' }}
                            value={dealAmount}
                            onChange={(val) => setDealAmount(val || 0)}
                            min={0}
                            addonBefore="₹"
                            size="large"
                        />
                    </div>
                    <div style={{ fontSize: '13px', color: colors.success?.solid || '#10B981', background: `${colors.success?.solid || '#10B981'}10`, padding: '12px 16px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleOutlined /> Funds will be held securely in escrow until milestones are achieved.
                    </div>
                </div>
            </Modal>
            <style>{`
                .ant-modal-content {
                    border-radius: 24px !important;
                    padding: 32px !important;
                }
                .ant-modal-header {
                    margin-bottom: 24px !important;
                    border: none !important;
                }
                .ant-modal-title {
                    font-size: 22px !important;
                    font-weight: 800 !important;
                    color: ${colors.text.primary} !important;
                }
                .ant-btn-primary {
                    border-radius: 12px !important;
                    height: 44px !important;
                    font-weight: 700 !important;
                    background: ${colors.primary.solid} !important;
                }
                .ant-btn-default {
                    border-radius: 12px !important;
                    height: 44px !important;
                    font-weight: 700 !important;
                }
            `}</style>
        </motion.div>
    );
};

export default OpportunityDetails;
