// ===========================================
// CREATOR OPPORTUNITIES PAGE
// ===========================================

import { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Modal, Form, Input, InputNumber, message, Empty, Spin, Row, Col, Select, Pagination, Grid, Tabs } from 'antd';
import { DollarOutlined, TeamOutlined, SearchOutlined, FolderOpenOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { opportunityApi, creatorApi } from '../../services/api';

const { TextArea } = Input;
const { useBreakpoint } = Grid;

const CreatorOpportunities = () => {
  const [activeTab, setActiveTab] = useState('opportunities');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);

  // Applications pagination
  const [appCurrentPage, setAppCurrentPage] = useState(1);
  const [appTotal, setAppTotal] = useState(0);

  const [filters, setFilters] = useState({
    search: '',
    type: undefined as string | undefined,
    category: undefined as string | undefined,
    minBudget: undefined as number | undefined,
    maxBudget: undefined as number | undefined
  });

  const [appFilters, setAppFilters] = useState({
    status: undefined as string | undefined
  });

  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    if (activeTab === 'opportunities') {
      fetchOpportunities();
    } else {
      fetchApplications();
    }
  }, [activeTab, currentPage, pageSize, filters, appCurrentPage, appFilters]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await opportunityApi.getAll({
        status: 'OPEN',
        page: currentPage,
        limit: pageSize,
        ...filters
      });
      setOpportunities(response.data.data.opportunities || []);
      setTotal(response.data.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const creatorId = user?.id;

      if (!creatorId) {
        console.error('Creator ID not found');
        return;
      }

      setLoading(true);
      const response = await creatorApi.getApplications({
        page: appCurrentPage,
        limit: pageSize,
        status: appFilters.status,
        creatorId: creatorId
      });
      // Assuming the structure based on user request: { success: true, data: [...] }
      // If the backend actually returns pagination inside data, adjust accordingly.
      // Based on api.ts pattern, usually it is response.data.data or response.data
      // Let's assume standard response structure: response.data.data (list) or response.data.data.applications
      // The user specified response format: { success: true, data: [...] }
      // So response.data.data is the array.
      setApplications(response.data.data || []);
      // If no pagination provided in this specific endpoint yet, we might fallback or update total if available
      setAppTotal(response.data.data?.length || 0);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (values: any) => {
    if (applyModal?.hasApplied || applyModal?.myApplicationStatus) {
      message.info(`You already applied${applyModal?.myApplicationStatus ? ` (${applyModal.myApplicationStatus})` : ''}.`);
      setApplyModal(null);
      return;
    }
    setSubmitting(true);
    try {
      await opportunityApi.apply(applyModal.id, values.pitch, values.proposedBudget);
      message.success('Application submitted!');
      setApplyModal(null);
      form.resetFields();
      setOpportunities((prev) =>
        prev.map((item) =>
          item.id === applyModal.id
            ? { ...item, hasApplied: true, myApplicationStatus: item.myApplicationStatus || 'PENDING' }
            : item
        )
      );
      // Optionally refresh to show status if we were on the apps tab? 
      // But we are usually on opps tab when applying.
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusTag = (status: string) => {
    let color = 'default';
    switch (status) {
      case 'ACCEPTED': color = 'success'; break;
      case 'REJECTED': color = 'error'; break;
      case 'PENDING': color = 'processing'; break;
    }
    return <Tag color={color}>{status}</Tag>;
  };

  const renderOpportunitiesTab = () => (
    <>
      {/* Search and Filters */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '24px',
        padding: isMobile ? '20px' : '32px',
        marginBottom: isMobile ? '24px' : '40px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={10}>
            <Input
              placeholder="Search by brand or title..."
              prefix={<SearchOutlined style={{ color: '#6366F1' }} />}
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setCurrentPage(1);
              }}
              className="flagship-input"
              style={{ height: '52px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={7}>
            <Select
              placeholder="Opportunity Type"
              style={{ width: '100%', height: '52px' }}
              value={filters.type}
              onChange={(value) => {
                setFilters({ ...filters, type: value });
                setCurrentPage(1);
              }}
              allowClear
              dropdownStyle={{ background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <Select.Option value="BRAND_DEAL">Brand Deal</Select.Option>
              <Select.Option value="CAMPAIGN">Campaign</Select.Option>
              <Select.Option value="SPONSORSHIP">Sponsorship</Select.Option>
              <Select.Option value="PRODUCT_REVIEW">Product Review</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={7}>
            <InputNumber
              placeholder="Max Budget (₹)"
              style={{ width: '100%', height: '52px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
              value={filters.maxBudget}
              onChange={(value) => {
                setFilters({ ...filters, maxBudget: value || undefined });
                setCurrentPage(1);
              }}
              prefix={<span style={{ color: '#818CF8' }}>₹</span>}
              min={0}
            />
          </Col>
        </Row>
      </div>

      {loading && !opportunities.length ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip={<span style={{ color: '#94A3B8', marginTop: '16px', display: 'block' }}>Scanning opportunities...</span>} />
        </div>
      ) : opportunities.length === 0 ? (
        <div style={{
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '32px',
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <Empty description={<span style={{ color: '#94A3B8', fontSize: '16px' }}>No opportunities found matching your filters</span>} />
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <Row gutter={[24, 24]}>
            {opportunities.map((item: any) => {
              const alreadyApplied = !!item.hasApplied || !!item.myApplicationStatus;
              const appliedStatus = item.myApplicationStatus ? item.myApplicationStatus.replace('_', ' ') : 'Applied';

              return (
              <Col xs={24} sm={24} md={12} lg={8} key={item.id}>
                <Card
                  bordered={false}
                  className="opportunity-card-flagship"
                  style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    borderRadius: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    height: '520px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    width: '100%'
                  }}
                  bodyStyle={{
                    padding: '32px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '120px',
                    height: '120px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                    opacity: 0.03,
                    filter: 'blur(40px)',
                    borderRadius: '50%',
                    zIndex: 0
                  }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '16px',
                        padding: '14px',
                        color: '#818CF8',
                        fontSize: '22px',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }}>
                        <TeamOutlined />
                      </div>
                      <Tag color="blue" bordered={false} style={{ borderRadius: '8px', fontWeight: 800, padding: '4px 14px', fontSize: '11px', textTransform: 'uppercase' }}>
                        {item.type?.replace('_', ' ')}
                      </Tag>
                    </div>

                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      marginBottom: '12px',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '52px'
                    }}>
                      {item.title}
                    </h3>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {item.budget && (
                        <Tag icon={<DollarOutlined />} color="gold" bordered={false} style={{ borderRadius: '8px', fontWeight: 700, padding: '4px 12px' }}>
                          ₹{item.budget.toLocaleString()}
                        </Tag>
                      )}
                      {item.category && (
                        <Tag color="cyan" bordered={false} style={{ borderRadius: '8px', fontWeight: 700, padding: '4px 12px' }}>
                          {item.category}
                        </Tag>
                      )}
                      <Tag icon={<TeamOutlined />} color="blue" bordered={false} style={{ borderRadius: '8px', fontWeight: 700, padding: '4px 12px' }}>
                        {item._count?.applications || 0} applied
                      </Tag>
                      {alreadyApplied && (
                        <Tag color="green" bordered={false} style={{ borderRadius: '8px', fontWeight: 700, padding: '4px 12px' }}>
                          {appliedStatus}
                        </Tag>
                      )}
                    </div>

                    <p style={{
                      color: '#94A3B8',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      marginBottom: '0',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.description}
                    </p>
                  </div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '20px',
                      padding: '14px 18px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '18px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand:</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.company?.companyName}</div>
                    </div>

                    <Button
                      type="primary"
                      block
                      onClick={() => !alreadyApplied && setApplyModal(item)}
                      disabled={alreadyApplied}
                      style={{
                        borderRadius: '16px',
                        height: '52px',
                        fontWeight: 800,
                        fontSize: '15px',
                        background: alreadyApplied
                          ? 'rgba(148, 163, 184, 0.25)'
                          : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                        border: 'none',
                        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.2)'
                      }}
                    >
                      {alreadyApplied ? appliedStatus : 'Analyze & Apply'}
                    </Button>
                  </div>
                </Card>
              </Col>
            );
            })}
          </Row>

          {total > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px' }}>
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                onShowSizeChange={(_current, size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                showSizeChanger
                pageSizeOptions={['12', '24', '48']}
                showTotal={(total) => <span style={{ color: '#94A3B8' }}>Total {total} opportunities</span>}
              />
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderApplicationsTab = () => (
    <>
      <div style={{
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '24px',
        padding: isMobile ? '20px' : '32px',
        marginBottom: isMobile ? '24px' : '40px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Filter by Status"
              style={{ width: '100%', height: '52px' }}
              value={appFilters.status}
              onChange={(value) => {
                setAppFilters({ status: value });
                setAppCurrentPage(1);
              }}
              allowClear
              dropdownStyle={{ background: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="ACCEPTED">Accepted</Select.Option>
              <Select.Option value="REJECTED">Rejected</Select.Option>
            </Select>
          </Col>
        </Row>
      </div>

      {loading && !applications.length ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      ) : applications.length === 0 ? (
        <div style={{
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '32px',
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <Empty description={<span style={{ color: '#94A3B8' }}>No applications found</span>} />
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <Row gutter={[24, 24]}>
            {applications.map((item: any) => (
              <Col xs={24} sm={24} md={12} lg={8} key={item.id}>
                <Card
                  bordered={false}
                  style={{
                    background: '#1E293B',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    height: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%'
                  }}
                  bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#6366F1' }} />
                      {renderStatusTag(item.status)}
                    </div>
                    <h3 style={{
                      color: '#F8FAFC',
                      margin: '0 0 8px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>{item.opportunity?.title}</h3>
                    <div style={{
                      color: '#64748B',
                      fontSize: '13px',
                      marginBottom: '16px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{item.opportunity?.company?.companyName}</div>
                  </div>

                  {item.deal && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, textTransform: 'uppercase' }}>DEAL ACTIVE</div>
                      <div style={{ color: '#F8FAFC', fontWeight: 800, fontSize: '18px' }}>₹{item.deal.amount.toLocaleString()}</div>
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: isMobile ? '24px' : '40px' }}>
        <h1 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 900, margin: 0, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1.2 }}>
          {activeTab === 'opportunities' ? 'Brand Opportunities' : 'My Applications'}
        </h1>
        <p style={{ color: '#94A3B8', fontSize: isMobile ? '15px' : '18px', fontWeight: 500, marginTop: '8px' }}>
          {activeTab === 'opportunities' ? 'Curated collaborations for your AI persona matrix' : 'Track your proposals and active deals'}
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="premium-tabs"
        items={[
          {
            key: 'opportunities',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderOpenOutlined /> Available Opportunities
              </span>
            ),
            children: renderOpportunitiesTab()
          },
          {
            key: 'applications',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SafetyCertificateOutlined /> My Applications
              </span>
            ),
            children: renderApplicationsTab()
          }
        ]}
      />

      {/* Apply Modal */}
      <Modal
        title={
          <div style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 900 }}>
            <TeamOutlined style={{ marginRight: '12px', color: '#6366F1' }} />
            Application Strategy
          </div>
        }
        open={!!applyModal}
        onCancel={() => { setApplyModal(null); form.resetFields(); }}
        footer={null}
        width={isMobile ? '95%' : 600}
        className="flagship-modal"
        centered
      >
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', marginBottom: '4px' }}>Applying For</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>{applyModal?.title}</div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleApply}>
          <Form.Item
            name="pitch"
            label={<span style={{ color: '#94A3B8', fontWeight: 600 }}>Proposal & Innovation Strategy</span>}
            rules={[{ required: true, message: 'Please write your pitch' }]}
          >
            <TextArea
              rows={6}
              placeholder="Outline how your AI persona will revolutionize this campaign..."
              style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', borderRadius: '12px' }}
            />
          </Form.Item>

          <Form.Item
            name="proposedBudget"
            label={<span style={{ color: '#94A3B8', fontWeight: 600 }}>Proposed Revenue (₹)</span>}
          >
            <InputNumber
              style={{ width: '100%', height: '48px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', borderRadius: '12px' }}
              placeholder="Enter your rate"
              min={0}
              prefix="₹"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            block
            size="large"
            style={{ height: '52px', borderRadius: '14px', fontWeight: 800, background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', border: 'none', marginTop: '12px' }}
          >
            Submit Secure Application
          </Button>
        </Form>
      </Modal>

      <style>{`
          .flagship-modal .ant-modal-content {
            background: #0F172A !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 24px !important;
            box-shadow: 0 30px 60px rgba(0,0,0,0.4) !important;
          }
          .premium-tabs .ant-tabs-nav::before {
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .premium-tabs .ant-tabs-tab {
              background: transparent !important;
              border: 1px solid transparent !important;
              color: #94A3B8 !important;
              font-weight: 600;
          }
          .premium-tabs .ant-tabs-tab-active {
              color: #F8FAFC !important;
              border-bottom: 2px solid #6366F1 !important;
          }
          .opportunity-card-flagship:hover {
            transform: translateY(-8px);
            border-color: rgba(99, 102, 241, 0.4) !important;
            box-shadow: 0 25px 50px rgba(99, 102, 241, 0.1) !important;
          }
          .ant-select-selector {
            background: rgba(255, 255, 255, 0.03) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: #FFFFFF !important;
            border-radius: 14px !important;
          }
          .ant-pagination-item, .ant-pagination-prev, .ant-pagination-next {
            background: rgba(255, 255, 255, 0.03) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .ant-pagination-item a { color: #94A3B8 !important; }
          .ant-pagination-item-active { border-color: #6366F1 !important; }
          .ant-pagination-item-active a { color: #818CF8 !important; }
        `}</style>
    </div >
  );
};

export default CreatorOpportunities;
