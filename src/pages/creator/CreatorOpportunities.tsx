// ===========================================
// CREATOR OPPORTUNITIES PAGE
// ===========================================

import { useEffect, useState } from 'react';
import { Card, Tag, Button, Modal, Form, Input, InputNumber, message, Empty, Spin, Row, Col, Select, Pagination, Grid, Tabs, Typography } from 'antd';
import {
  DollarSign,
  Users,
  Search,
  FolderClosed,
  ShieldCheck,
  ChevronRight,
  Briefcase,
  Zap
} from 'lucide-react';
import { opportunityApi, creatorApi } from '../../services/api';
import { colors, spacing, shadows } from '../../styles/tokens';

const { TextArea } = Input;
const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

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

  const [filters, setFilters] = useState({
    search: '',
    type: undefined as string | undefined,
    category: undefined as string | undefined,
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
      setApplications(response.data.data || []);
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
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusTag = (status: string) => {
    let color = colors.gray[500];
    let bgColor = colors.gray[50];

    switch (status) {
      case 'ACCEPTED':
        color = colors.success.solid;
        bgColor = colors.success.subtle;
        break;
      case 'REJECTED':
        color = colors.error.solid;
        bgColor = colors.error.subtle;
        break;
      case 'PENDING':
        color = colors.primary.solid;
        bgColor = colors.primary.subtle;
        break;
    }
    return (
      <Tag bordered={false} style={{
        background: bgColor,
        color: color,
        borderRadius: '6px',
        fontWeight: 700,
        fontSize: '11px',
        padding: '2px 10px'
      }}>
        {status}
      </Tag>
    );
  };

  const renderOpportunitiesTab = () => (
    <>
      {/* Search and Filters */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: isMobile ? '20px' : '32px',
        marginBottom: spacing[8],
        border: `1px solid ${colors.gray[100]}`,
        boxShadow: shadows.md
      }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            <Input
              placeholder="Search by brand or title..."
              prefix={<Search size={18} style={{ color: colors.primary.solid }} />}
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setCurrentPage(1);
              }}
              style={{
                height: '48px',
                borderRadius: '12px',
                background: colors.gray[50],
                border: `1px solid ${colors.gray[200]}`
              }}
            />
          </Col>
          <Col xs={24} sm={12} lg={7}>
            <Select
              placeholder="Opportunity Type"
              style={{ width: '100%', height: '48px' }}
              value={filters.type}
              onChange={(value) => {
                setFilters({ ...filters, type: value });
                setCurrentPage(1);
              }}
              allowClear
              dropdownStyle={{ borderRadius: '12px', padding: '8px' }}
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
              style={{ width: '100%', height: '48px', borderRadius: '12px' }}
              value={filters.maxBudget}
              onChange={(value) => {
                setFilters({ ...filters, maxBudget: value || undefined });
                setCurrentPage(1);
              }}
              prefix={<DollarSign size={16} style={{ color: colors.warning.solid }} />}
              min={0}
            />
          </Col>
        </Row>
      </div>

      {loading && !opportunities.length ? (
        <div style={{ textAlign: 'center', padding: '100px 0', background: '#ffffff', borderRadius: '16px', border: `1px solid ${colors.gray[100]}` }}>
          <Spin size="large" tip={<span style={{ color: colors.text.tertiary, marginTop: '16px', display: 'block' }}>Scanning opportunities...</span>} />
        </div>
      ) : opportunities.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '80px 40px',
          textAlign: 'center',
          border: `1px solid ${colors.gray[100]}`
        }}>
          <Empty description={<span style={{ color: colors.text.tertiary, fontSize: '16px' }}>No opportunities found matching your filters</span>} />
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
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: `1px solid ${colors.gray[100]}`,
                      boxShadow: shadows.md,
                      transition: 'all 0.3s ease',
                      height: '480px',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{
                      padding: '24px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{
                          background: colors.primary.subtle,
                          borderRadius: '12px',
                          padding: '12px',
                          color: colors.primary.solid,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${colors.primary.solid}15`
                        }}>
                          <Users size={20} />
                        </div>
                        <Tag bordered={false} style={{
                          background: colors.primary.subtle,
                          color: colors.primary.solid,
                          borderRadius: '6px',
                          fontWeight: 700,
                          padding: '2px 10px',
                          fontSize: '10px',
                          textTransform: 'uppercase'
                        }}>
                          {item.type?.replace('_', ' ')}
                        </Tag>
                      </div>

                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: colors.text.primary,
                        marginBottom: '12px',
                        letterSpacing: '-0.01em',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '50px'
                      }}>
                        {item.title}
                      </h3>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        {item.budget && (
                          <Tag icon={<DollarSign size={12} />} bordered={false} style={{ background: colors.warning.subtle, color: colors.warning.solid, borderRadius: '6px', fontWeight: 700 }}>
                            ₹{item.budget.toLocaleString()}
                          </Tag>
                        )}
                        {item.category && (
                          <Tag bordered={false} style={{ background: colors.info.subtle, color: colors.info.solid, borderRadius: '6px', fontWeight: 700 }}>
                            {item.category}
                          </Tag>
                        )}
                        <Tag icon={<Users size={12} />} bordered={false} style={{ background: colors.primary.subtle, color: colors.primary.solid, borderRadius: '6px', fontWeight: 700 }}>
                          {item._count?.applications || 0} applied
                        </Tag>
                      </div>

                      <p style={{
                        color: colors.text.secondary,
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

                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                        padding: '12px',
                        background: colors.gray[50],
                        borderRadius: '12px',
                        border: `1px solid ${colors.gray[100]}`
                      }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand:</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: colors.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.company?.companyName}</div>
                      </div>

                      <Button
                        type="primary"
                        block
                        onClick={() => !alreadyApplied && setApplyModal(item)}
                        disabled={alreadyApplied}
                        style={{
                          borderRadius: '8px',
                          height: '44px',
                          fontWeight: 600,
                          background: alreadyApplied ? colors.gray[100] : colors.primary.solid,
                          color: alreadyApplied ? colors.text.disabled : '#ffffff',
                          border: 'none',
                          boxShadow: alreadyApplied ? 'none' : shadows.md
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
                showTotal={(total) => <span style={{ color: colors.text.tertiary }}>Total {total} opportunities</span>}
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
        background: '#ffffff',
        borderRadius: '20px',
        padding: isMobile ? '20px' : '32px',
        marginBottom: spacing[8],
        border: `1px solid ${colors.gray[100]}`,
        boxShadow: shadows.md
      }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Filter by Status"
              style={{ width: '100%', height: '48px' }}
              value={appFilters.status}
              onChange={(value) => {
                setAppFilters({ status: value });
                setAppCurrentPage(1);
              }}
              allowClear
              dropdownStyle={{ borderRadius: '12px', padding: '8px' }}
            >
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="ACCEPTED">Accepted</Select.Option>
              <Select.Option value="REJECTED">Rejected</Select.Option>
            </Select>
          </Col>
        </Row>
      </div>

      {loading && !applications.length ? (
        <div style={{ textAlign: 'center', padding: '100px 0', background: '#ffffff', borderRadius: '16px', border: `1px solid ${colors.gray[100]}` }}>
          <Spin size="large" />
        </div>
      ) : applications.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '80px 40px',
          textAlign: 'center',
          border: `1px solid ${colors.gray[100]}`
        }}>
          <Empty description={<span style={{ color: colors.text.tertiary }}>No applications found</span>} />
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <Row gutter={[24, 24]}>
            {applications.map((item: any) => (
              <Col xs={24} sm={24} md={12} lg={8} key={item.id}>
                <Card
                  bordered={false}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: `1px solid ${colors.gray[100]}`,
                    boxShadow: shadows.sm,
                    height: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: colors.primary.subtle, padding: '10px', borderRadius: '10px' }}>
                      <ShieldCheck size={20} style={{ color: colors.primary.solid }} />
                    </div>
                    {renderStatusTag(item.status)}
                  </div>
                  <h3 style={{
                    color: colors.text.primary,
                    fontSize: '16px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>{item.opportunity?.title}</h3>
                  <div style={{
                    color: colors.text.tertiary,
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '20px'
                  }}>{item.opportunity?.company?.companyName}</div>

                  {item.deal && (
                    <div style={{
                      background: colors.success.subtle,
                      padding: '16px',
                      borderRadius: '12px',
                      border: `1px solid ${colors.success.solid}15`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        background: '#FFFFFF',
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: shadows.sm
                      }}>
                        <Zap size={20} style={{ color: colors.success.solid }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: colors.success.solid, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deal Active</div>
                        <div style={{ color: colors.text.primary, fontWeight: 800, fontSize: '18px' }}>₹{item.deal.amount.toLocaleString()}</div>
                      </div>
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
    <div style={{ padding: isMobile ? spacing[3] : spacing[8], background: colors.background, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: isMobile ? spacing[6] : spacing[10] }}>
          <Title level={isMobile ? 3 : 1} style={{ fontWeight: 800, margin: 0, letterSpacing: '-0.03em', color: colors.text.primary, lineHeight: 1.1 }}>
            {activeTab === 'opportunities' ? 'Collaboration Matrix' : 'Proposal Hub'}
          </Title>
          <Text style={{ color: colors.text.secondary, fontSize: isMobile ? '14px' : '16px', fontWeight: 500, marginTop: '12px', display: 'block' }}>
            {activeTab === 'opportunities' ? 'Strategic partnerships for your neural brand narrative' : 'Synchronizing your multi-agent collaboration proposals'}
          </Text>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="premium-tabs"
          items={[
            {
              key: 'opportunities',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={18} /> Available Deals
                </span>
              ),
              children: renderOpportunitiesTab()
            },
            {
              key: 'applications',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} /> Active Proposals
                </span>
              ),
              children: renderApplicationsTab()
            }
          ]}
        />

        {/* Apply Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: colors.primary.subtle, padding: '8px', borderRadius: '10px' }}>
                <Zap size={20} style={{ color: colors.primary.solid }} />
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.02em' }}>
                Collaboration Strategy
              </div>
            </div>
          }
          open={!!applyModal}
          onCancel={() => { setApplyModal(null); form.resetFields(); }}
          footer={null}
          width={isMobile ? '95%' : 600}
          centered
          className="premium-modal"
        >
          <div style={{
            marginBottom: '32px',
            padding: '20px',
            background: colors.gray[50],
            borderRadius: '16px',
            border: `1px solid ${colors.gray[100]}`
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: colors.text.tertiary, textTransform: 'uppercase', marginBottom: '8px' }}>Strategic Collaboration For</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.01em' }}>{applyModal?.title}</div>
          </div>

          <Form form={form} layout="vertical" onFinish={handleApply} requiredMark={false}>
            <Form.Item
              name="pitch"
              label={<span style={{ color: colors.text.secondary, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }}>Proposal Narrative</span>}
              rules={[{ required: true, message: 'Your proposal narrative is required' }]}
            >
              <TextArea
                rows={6}
                placeholder="Outline your strategic vision for this collaboration..."
                style={{ borderRadius: '12px', padding: '16px', background: '#FFFFFF', border: `1px solid ${colors.gray[200]}` }}
              />
            </Form.Item>

            <Form.Item
              name="proposedBudget"
              label={<span style={{ color: colors.text.secondary, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }}>Proposed Capital Allocation (₹)</span>}
            >
              <InputNumber
                style={{ width: '100%', height: '48px', borderRadius: '12px', paddingTop: '8px' }}
                placeholder="0.00"
                min={0}
                prefix={<span style={{ color: colors.text.tertiary }}>₹</span>}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
              size="large"
              style={{
                height: '48px',
                borderRadius: '8px',
                fontWeight: 600,
                marginTop: '12px',
                background: colors.primary.solid,
                color: '#ffffff',
                border: 'none',
                boxShadow: shadows.md
              }}
            >
              Transmit Strategy
            </Button>
          </Form>
        </Modal>

        <style>{`
          .premium-tabs .ant-tabs-nav::before {
            border-bottom: 1px solid ${colors.gray[100]} !important;
          }
          .premium-tabs .ant-tabs-tab {
            background: transparent !important;
            color: ${colors.text.tertiary} !important;
            font-weight: 500;
            padding: 12px 0 !important;
            margin: 0 32px 0 0 !important;
            transition: all 0.3s ease;
          }
          .premium-tabs .ant-tabs-tab:hover {
            color: ${colors.primary.solid} !important;
          }
          .premium-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: ${colors.primary.solid} !important;
            font-weight: 700 !important;
          }
          .premium-tabs .ant-tabs-ink-bar {
            background: ${colors.primary.solid} !important;
            height: 3px !important;
          }
          .opportunity-card-flagship:hover {
            transform: translateY(-4px);
            border-color: ${colors.primary.subtle} !important;
            box-shadow: ${shadows.xl} !important;
          }
          .ant-pagination-item-active {
            border-color: ${colors.primary.solid} !important;
            background: ${colors.primary.subtle} !important;
          }
          .ant-pagination-item-active a {
            color: ${colors.primary.solid} !important;
          }
          .premium-modal .ant-modal-content {
            border-radius: 12px !important;
            padding: 24px !important;
            background: #FFFFFF !important;
            border: 1px solid ${colors.gray[200]} !important;
            box-shadow: ${shadows.xl} !important;
          }
          .premium-modal .ant-modal-header {
            margin-bottom: 24px !important;
            background: transparent !important;
          }
          .premium-modal .ant-modal-title {
            color: ${colors.text.primary} !important;
          }
          .ant-input, .ant-select-selector, .ant-input-number {
            border-radius: 8px !important;
            background: #ffffff !important;
            border: 1px solid ${colors.gray[200]} !important;
            color: ${colors.text.primary} !important;
          }
          .ant-select-selection-placeholder, .ant-input-number-input::placeholder {
            color: ${colors.text.tertiary} !important;
          }
        `}</style>
      </div>
    </div >
  );
};

export default CreatorOpportunities;
