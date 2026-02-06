// ===========================================
// OPPORTUNITY DETAILS PAGE
// View applications and manage hiring
// ===========================================

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Button, List, Avatar, Spin, Statistic, Row, Col, Modal, InputNumber, message, Descriptions } from 'antd';
import { UserOutlined, ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { opportunityApi, getImageUrl } from '../../services/api';

const OpportunityDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Action states
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
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
            console.error(err);
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
        } catch (err: any) {
            message.error(err.response?.data?.error || 'Failed to reject');
        } finally {
            setProcessingId(null);
        }
    };

    const openAcceptModal = (app: any) => {
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
        } catch (err: any) {
            message.error(err.response?.data?.error || 'Failed to accept');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    if (!opportunity) return <div>Opportunity not found</div>;

    const applications = opportunity.applications || [];

    return (
        <div className="opportunity-details-page fade-in">
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/company-dashboard/opportunities')}
                    style={{ border: 'none', background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}
                >
                    Back
                </Button>
                <div style={{ fontSize: '14px', color: '#64748B' }}>
                    Opportunities / <span style={{ color: '#F8FAFC' }}>{opportunity.title}</span>
                </div>
            </div>

            <Row gutter={24}>
                {/* Left Column: Opportunity Info */}
                <Col xs={24} lg={16}>
                    <Card
                        bordered={false}
                        style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', marginBottom: '24px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ color: '#F8FAFC', margin: 0, fontSize: '24px' }}>{opportunity.title}</h1>
                                {opportunity.category && <Tag color="geekblue" style={{ marginTop: '8px', border: 'none' }}>{opportunity.category}</Tag>}
                            </div>
                            <Tag color={opportunity.status === 'OPEN' ? 'success' : 'default'} style={{ fontSize: '14px', padding: '4px 12px', borderRadius: '20px' }}>
                                {opportunity.status}
                            </Tag>
                        </div>

                        <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ color: '#94A3B8' }} contentStyle={{ color: '#F8FAFC', fontWeight: 500 }}>
                            <Descriptions.Item label="Budget Type">{opportunity.budgetType}</Descriptions.Item>
                            <Descriptions.Item label="Budget">
                                {opportunity.budget ? `₹${opportunity.budget.toLocaleString()}` : <span style={{ color: '#A5F3FC' }}>Negotiable</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Deadline">
                                {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : 'No Deadline'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Type">
                                {opportunity.type?.replace('_', ' ')}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24, borderTop: '1px solid #334155', paddingTop: 24 }}>
                            <h4 style={{ color: '#F8FAFC' }}>Description</h4>
                            <p style={{ whiteSpace: 'pre-wrap', color: '#CBD5E1', lineHeight: 1.6 }}>{opportunity.description}</p>
                        </div>
                    </Card>

                    <h3 style={{ color: '#F8FAFC', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Applications <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 400 }}>({applications.length})</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {applications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', background: '#1E293B', borderRadius: '16px', border: '1px solid #334155', color: '#64748B' }}>
                                No applications received yet.
                            </div>
                        ) : (
                            applications.map((item: any) => (
                                <Card
                                    key={item.id}
                                    bordered={false}
                                    style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                                    bodyStyle={{ padding: '20px' }}
                                >
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                        <Avatar
                                            size={64}
                                            src={item.creator?.profileImage ? getImageUrl(item.creator.profileImage) : undefined}
                                            icon={<UserOutlined />}
                                            style={{ border: '2px solid rgba(99,102,241,0.2)' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <div>
                                                    <h4 style={{ color: '#F8FAFC', margin: 0, fontSize: '18px' }}>{item.creator?.displayName}</h4>
                                                    <div style={{ color: '#64748B', fontSize: '12px' }}>Applied on {new Date(item.createdAt).toLocaleDateString()}</div>
                                                </div>
                                                {item.proposedBudget && (
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ color: '#94A3B8', fontSize: '12px' }}>Proposed</div>
                                                        <div style={{ color: '#A5F3FC', fontWeight: 600, fontSize: '16px' }}>₹{item.proposedBudget.toLocaleString()}</div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Contact Info Section */}
                                            <div style={{ marginBottom: '12px', display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
                                                {item.creator?.user?.email && (
                                                    <span style={{ color: '#CBD5E1' }}>
                                                        <UserOutlined style={{ marginRight: 4 }} /> {item.creator.user.email}
                                                    </span>
                                                )}
                                                {item.creator?.instagramUrl && (
                                                    <a href={item.creator.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C' }}>Instagram</a>
                                                )}
                                                {item.creator?.twitterUrl && (
                                                    <a href={item.creator.twitterUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1DA1F2' }}>Twitter</a>
                                                )}
                                                {item.creator?.youtubeUrl && (
                                                    <a href={item.creator.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FF0000' }}>YouTube</a>
                                                )}
                                                {item.creator?.websiteUrl && (
                                                    <a href={item.creator.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38BDF8' }}>Website</a>
                                                )}
                                            </div>

                                            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '8px', color: '#E2E8F0', marginBottom: '16px', fontStyle: 'italic', borderLeft: '3px solid #6366F1' }}>
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
                                                        >
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            type="primary"
                                                            onClick={() => openAcceptModal(item)}
                                                            loading={processingId === item.id}
                                                            style={{ background: '#10B981', borderColor: '#10B981' }}
                                                        >
                                                            Accept Proposal
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Tag color={item.status === 'ACCEPTED' ? 'success' : 'error'} style={{ fontSize: '14px', padding: '4px 12px' }}>
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
                        title={<span style={{ color: '#F8FAFC' }}>Quick Stats</span>}
                        bordered={false}
                        style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px' }}
                        headStyle={{ borderBottom: '1px solid #334155' }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Statistic
                                    title={<span style={{ color: '#94A3B8' }}>Views</span>}
                                    value={opportunity.viewCount || 0}
                                    valueStyle={{ color: '#F8FAFC' }}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title={<span style={{ color: '#94A3B8' }}>Applications</span>}
                                    value={applications.length}
                                    valueStyle={{ color: '#F8FAFC' }}
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
                okText="Create Deal"
                width={500}
            >
                <div style={{ padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '8px' }}>
                        <Avatar src={selectedApplication?.creator?.profileImage} icon={<UserOutlined />} />
                        <div>
                            <div style={{ fontWeight: 600, color: '#64748B' }}>{selectedApplication?.creator?.displayName}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>Waitlist Creator</div>
                        </div>
                    </div>

                    <p style={{ marginBottom: '16px' }}>Please confirm the final agreed amount for this collaboration. This will be the contract value.</p>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Final Deal Amount (₹)</label>
                        <InputNumber
                            style={{ width: '100%' }}
                            value={dealAmount}
                            onChange={(val) => setDealAmount(val || 0)}
                            min={0}
                            addonBefore="₹"
                            size="large"
                        />
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748B', background: '#F1F5F9', padding: '8px', borderRadius: '4px' }}>
                        <CheckCircleOutlined style={{ color: '#10B981' }} /> Funds will be held in escrow until you mark the deal as complete.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default OpportunityDetails;
