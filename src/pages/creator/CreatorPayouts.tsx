// ===========================================
// CREATOR PAYOUTS PAGE
// ===========================================

import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Form,
  Input,
  Select,
  Modal,
  message,
  Tag,
  Divider,
  Space,
  Tabs,
  Typography,
  Tooltip,
  Empty,
  Grid
} from 'antd';
import {
  WalletOutlined,
  BankOutlined,
  DollarOutlined,
  HistoryOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { payoutApi } from '../../services/api';
import { format } from 'date-fns';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

interface BankAccount {
  id: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountType: string;
  kycStatus: string;
  isVerified: boolean;
  createdAt: string;
}

interface Payout {
  id: string;
  amount: number | string;
  fee: number | string;
  netAmount: number | string;
  currency?: string;
  subscriptionEarnings?: number | string;
  brandDealEarnings?: number | string;
  status: string;
  requestedAt: string;
  processedAt?: string | null;
  completedAt?: string;
  utr?: string;
  errorMessage?: string;
}

interface Earnings {
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  subscriptionEarnings: number;
  brandDealEarnings: number;
}

interface LedgerEntry {
  id: string;
  type: string;
  amount: number | string;
  description: string;
  sourceType: string;
  sourceId?: string;
  balanceBefore: number | string;
  balanceAfter: number | string;
  createdAt: string;
}

const CreatorPayouts = () => {
  const [loading, setLoading] = useState(false);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [payoutPagination, setPayoutPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [ledgerPagination, setLedgerPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [isPayoutModalVisible, setIsPayoutModalVisible] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);

  const [bankForm] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Load data
  useEffect(() => {
    loadEarnings();
    loadBankAccount();
  }, []);

  useEffect(() => {
    loadPayouts();
  }, [payoutPagination.page, payoutPagination.limit]);

  useEffect(() => {
    loadLedger();
  }, [ledgerPagination.page, ledgerPagination.limit]);

  const loadEarnings = async () => {
    try {
      const response = await payoutApi.getEarningsBreakdown();
      setEarnings(response.data.data);
    } catch (error: any) {
      message.error('Failed to load earnings');
    }
  };

  const loadBankAccount = async () => {
    try {
      const response = await payoutApi.getBankAccount();
      setBankAccount(response.data.data);
    } catch (error: any) {
      // Don't show error if 404 (just means no account added yet)
      if (error.response?.status !== 404) {
        message.error('Failed to load bank account');
      }
    }
  };

  const loadPayouts = async () => {
    try {
      const response = await payoutApi.getPayouts({ page: payoutPagination.page, limit: payoutPagination.limit });
      const data = response.data.data || {};
      setPayouts(data.payouts || []);
      setPayoutPagination((prev) => ({
        ...prev,
        total: data.pagination?.total ?? prev.total
      }));
    } catch (error: any) {
      message.error('Failed to load payouts');
    }
  };

  const loadLedger = async () => {
    try {
      const response = await payoutApi.getLedger({ page: ledgerPagination.page, limit: ledgerPagination.limit });
      const data = response.data.data || {};
      setLedger(data.entries || []);
      setLedgerPagination((prev) => ({
        ...prev,
        total: data.pagination?.total ?? prev.total
      }));
    } catch (error: any) {
      message.error('Failed to load ledger');
    }
  };

  const handleAddBankAccount = async (values: any) => {
    try {
      setLoading(true);
      await payoutApi.addBankAccount(values);
      message.success('Bank account saved successfully');
      setIsBankModalVisible(false);
      bankForm.resetFields();
      loadBankAccount();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to save bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    try {
      setLoading(true);
      await payoutApi.requestPayout(payoutAmount);
      message.success('Payout requested successfully');
      setIsPayoutModalVisible(false);
      setPayoutAmount(0);
      loadEarnings();
      loadPayouts();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to request payout');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      PENDING: { color: 'orange', icon: <ClockCircleOutlined /> },
      PROCESSING: { color: 'blue', icon: <ClockCircleOutlined /> },
      COMPLETED: { color: 'green', icon: <CheckCircleOutlined /> },
      FAILED: { color: 'red', icon: <CloseCircleOutlined /> },
      REJECTED: { color: 'red', icon: <CloseCircleOutlined /> },
      CANCELLED: { color: 'default', icon: <CloseCircleOutlined /> }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <Tag icon={config.icon} color={config.color}>
        {status}
      </Tag>
    );
  };

  const getKYCStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'orange', text: 'Pending' },
      SUBMITTED: { color: 'blue', text: 'Under Review' },
      VERIFIED: { color: 'green', text: 'Verified' },
      REJECTED: { color: 'red', text: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const payoutColumns = [
    {
      title: 'Date',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date: string) => format(new Date(date), 'MMM dd, yyyy HH:mm')
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number | string) => `₹${Number(amount).toFixed(2)}`
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee: number | string) => `-₹${Number(fee).toFixed(2)}`
    },
    {
      title: 'Net Amount',
      dataIndex: 'netAmount',
      key: 'netAmount',
      render: (amount: number | string) => <strong>₹{Number(amount).toFixed(2)}</strong>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Processed',
      dataIndex: 'processedAt',
      key: 'processedAt',
      render: (date: string | null | undefined) => date ? format(new Date(date), 'MMM dd, yyyy') : '-'
    },
    {
      title: 'Completed',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date: string | null | undefined) => date ? format(new Date(date), 'MMM dd, yyyy') : '-'
    },
    {
      title: 'UTR',
      dataIndex: 'utr',
      key: 'utr',
      render: (utr: string) => utr || '-'
    }
  ];

  const ledgerColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => format(new Date(date), 'MMM dd, yyyy HH:mm')
    },
    {
      title: 'Source',
      dataIndex: 'sourceType',
      key: 'sourceType',
      filters: [
        { text: 'Chat (Subscription)', value: 'subscription' },
        { text: 'Brand Deal', value: 'brand_deal' },
        { text: 'Payout', value: 'payout' },
        { text: 'Adjustment', value: 'adjustment' }
      ],
      onFilter: (value: any, record: LedgerEntry) => record.sourceType === value,
      render: (sourceType: string) => (
        <Tag color={sourceType === 'subscription' ? 'purple' : sourceType === 'brand_deal' ? 'blue' : sourceType === 'payout' ? 'gold' : 'default'}>
          {sourceType?.toUpperCase() || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'CREDIT' ? 'green' : type === 'DEBIT' ? 'red' : 'blue'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number | string, record: LedgerEntry) => (
        <span style={{ color: record.type === 'CREDIT' ? '#52c41a' : '#ff4d4f' }}>
          {record.type === 'CREDIT' ? '+' : '-'}₹{Number(amount).toFixed(2)}
        </span>
      )
    },
    {
      title: 'Balance After',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      render: (balance: number | string) => `₹${Number(balance).toFixed(2)}`
    }
  ];

  return (
    <div style={{ padding: isMobile ? '8px' : '24px' }}>
      <div style={{ marginBottom: isMobile ? '24px' : '40px' }}>
        <h1 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 900, margin: 0, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1.2 }}>
          Payouts & Earnings
        </h1>
        <p style={{ color: '#94A3B8', fontSize: isMobile ? '15px' : '18px', fontWeight: 500, marginTop: '8px' }}>
          Financial center for your AI creator matrix
        </p>
      </div>

      {/* Earnings Overview */}
      <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
        <Col xs={24} lg={10}>
          <div style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            borderRadius: '28px',
            padding: isMobile ? '24px' : '32px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
              opacity: 0.15,
              borderRadius: '50%',
              filter: 'blur(40px)'
            }} />

            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <WalletOutlined /> Available Balance
              </div>
              <div style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                ₹{(earnings?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <Button
                type="primary"
                block
                size="large"
                onClick={() => setIsPayoutModalVisible(true)}
                disabled={!bankAccount || bankAccount.kycStatus !== 'VERIFIED' || (earnings?.availableBalance || 0) < 1000}
                style={{
                  height: '52px',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '16px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  border: 'none',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                }}
              >
                Withdraw Funds
              </Button>
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                Min. withdrawal ₹1,000 • Processing in 24-48h
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={14}>
          <Row gutter={[16, 16]}>
            {[
              { title: 'Pending Balance', value: earnings?.pendingBalance || 0, color: '#F59E0B', label: 'Payouts in progress' },
              { title: 'Lifetime Earnings', value: earnings?.lifetimeEarnings || 0, color: '#10B981', label: 'Total earned all time' },
              { title: 'Brand Deals', value: earnings?.brandDealEarnings || 0, color: '#6366F1', label: 'From collaborations' },
              { title: 'Subscriptions', value: earnings?.subscriptionEarnings || 0, color: '#EC4899', label: 'From fans' }
            ].map((item, i) => (
              <Col xs={12} sm={12} key={i}>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.4)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  borderRadius: '24px',
                  padding: '28px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#94A3B8', marginBottom: '12px' }}>{item.title}</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.01em' }}>₹{item.value.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px', fontWeight: 600 }}>{item.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Bank Account Section */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '32px',
        padding: '32px',
        marginBottom: '40px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '14px',
              borderRadius: '16px',
              color: '#818CF8',
              border: '1px solid rgba(99, 102, 241, 0.1)'
            }}>
              <BankOutlined style={{ fontSize: '22px' }} />
            </div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '22px', color: '#FFFFFF', letterSpacing: '-0.01em' }}>Bank Account</h3>
          </div>
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              if (bankAccount) {
                bankForm.setFieldsValue(bankAccount);
              }
              setIsBankModalVisible(true);
            }}
            style={{
              borderRadius: '14px',
              fontWeight: 700,
              height: '44px',
              padding: '0 24px'
            }}
          >
            {bankAccount ? 'Modify Details' : 'Account Setup'}
          </Button>
        </div>

        {bankAccount ? (
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: isMobile ? '20px' : '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
            <Row gutter={[32, 32]}>
              <Col xs={24} sm={12}>
                <div style={{ color: '#64748B', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Account Holder</div>
                <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '18px' }}>{bankAccount.accountHolderName}</div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ color: '#64748B', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Account Number</div>
                <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '18px', letterSpacing: '0.1em' }}>{bankAccount.accountNumber.replace(/.(?=.{4})/g, '•')}</div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ color: '#64748B', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Bank & IFSC</div>
                <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '18px' }}>{bankAccount.bankName} • {bankAccount.ifscCode}</div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ color: '#64748B', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Verification Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getKYCStatusTag(bankAccount.kycStatus)}
                  <span style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 600 }}>{bankAccount.accountType.toLowerCase()} account</span>
                </div>
              </Col>
            </Row>
            {bankAccount.kycStatus !== 'VERIFIED' && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: '#FFFBEB',
                border: '1px solid #FEF3C7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <ExclamationCircleOutlined style={{ color: '#D97706', fontSize: '18px' }} />
                <span style={{ color: '#92400E', fontSize: '13px', fontWeight: 500 }}>
                  Complete your identity verification (KYC) to enable withdrawals to this account.
                </span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '24px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
            <BankOutlined style={{ fontSize: '64px', color: 'rgba(255, 255, 255, 0.05)', marginBottom: '24px' }} />
            <p style={{ color: '#94A3B8', marginBottom: '32px', fontSize: '16px', fontWeight: 500 }}>Establish your payout matrix to receive earnings</p>
            <Button type="primary" size="large" onClick={() => setIsBankModalVisible(true)} style={{ borderRadius: '16px', fontWeight: 800, padding: '0 40px', height: '52px' }}>
              Initialize Payout Method
            </Button>
          </div>
        )}
      </div>

      {/* Tabs for Payouts and Ledger */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '32px',
        padding: isMobile ? '16px' : '32px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <Tabs defaultActiveKey="payouts" className="vibrant-tabs">
          <TabPane
            tab={
              <span style={{ fontWeight: 800 }}>
                <HistoryOutlined />
                Payout History
              </span>
            }
            key="payouts"
          >
            <Table
              columns={payoutColumns}
              dataSource={payouts}
              rowKey="id"
              pagination={{
                current: payoutPagination.page,
                pageSize: payoutPagination.limit,
                total: payoutPagination.total,
                showSizeChanger: true,
                onChange: (page, pageSize) => setPayoutPagination({ page, limit: pageSize || payoutPagination.limit, total: payoutPagination.total })
              }}
              locale={{ emptyText: <Empty description="No payouts recorded" /> }}
              className="flagship-table"
              style={{ marginTop: '24px' }}
              scroll={{ x: 'max-content' }}
            />
          </TabPane>
          <TabPane
            tab={
              <span style={{ fontWeight: 800 }}>
                <DollarOutlined />
                Earnings Ledger
              </span>
            }
            key="ledger"
          >
            <Table
              columns={ledgerColumns}
              dataSource={ledger}
              rowKey="id"
              pagination={{
                current: ledgerPagination.page,
                pageSize: ledgerPagination.limit,
                total: ledgerPagination.total,
                showSizeChanger: true,
                onChange: (page, pageSize) => setLedgerPagination({ page, limit: pageSize || ledgerPagination.limit, total: ledgerPagination.total })
              }}
              locale={{ emptyText: <Empty description="No transactions recorded" /> }}
              className="flagship-table"
              style={{ marginTop: '24px' }}
              scroll={{ x: 'max-content' }}
            />
          </TabPane>
        </Tabs>

        <style>{`
          .vibrant-tabs .ant-tabs-nav::before { border-bottom: 2px solid rgba(255,255,255,0.05) !important; }
          .vibrant-tabs .ant-tabs-tab { color: #64748B !important; font-size: 16px !important; transition: all 0.3s ease !important; }
          .vibrant-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #6366F1 !important; transform: scale(1.05); }
          .vibrant-tabs .ant-tabs-ink-bar { background: #6366F1 !important; height: 3px !important; border-radius: 3px 3px 0 0; }
          
          .flagship-table { background: transparent !important; }
          .flagship-table .ant-table { background: transparent !important; color: #E2E8F0 !important; }
          .flagship-table .ant-table-thead > tr > th { 
            background: rgba(255, 255, 255, 0.03) !important; 
            color: #94A3B8 !important; 
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
            font-weight: 700 !important;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.05em;
          }
          .flagship-table .ant-table-tbody > tr > td { border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important; }
          .flagship-table .ant-table-tbody > tr:hover > td { background: rgba(255, 255, 255, 0.02) !important; }
        `}</style>
      </div>

      {/* Bank Account Modal */}
      <Modal
        title={bankAccount ? 'Update Bank Account' : 'Add Bank Account'}
        open={isBankModalVisible}
        onCancel={() => {
          setIsBankModalVisible(false);
          bankForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={bankForm}
          layout="vertical"
          onFinish={handleAddBankAccount}
        >
          <Form.Item
            label="Account Holder Name"
            name="accountHolderName"
            rules={[
              { required: true, message: 'Please enter account holder name' },
              { min: 2, max: 100, message: 'Name must be between 2 and 100 characters' }
            ]}
          >
            <Input placeholder="As per bank records" />
          </Form.Item>

          <Form.Item
            label="Account Number"
            name="accountNumber"
            rules={[
              { required: true, message: 'Please enter account number' },
              { pattern: /^[0-9]{9,18}$/, message: 'Invalid account number' }
            ]}
          >
            <Input placeholder="Enter your account number" maxLength={18} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="IFSC Code"
                name="ifscCode"
                rules={[
                  { required: true, message: 'Please enter IFSC code' },
                  { pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC code' }
                ]}
              >
                <Input placeholder="IFSC Code" style={{ textTransform: 'uppercase' }} maxLength={11} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Bank Name"
                name="bankName"
                rules={[{ required: true, message: 'Please enter bank name' }]}
              >
                <Input placeholder="e.g., HDFC Bank" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Account Type"
            name="accountType"
            initialValue="SAVINGS"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="SAVINGS">Savings</Select.Option>
              <Select.Option value="CURRENT">Current</Select.Option>
            </Select>
          </Form.Item>

          <Divider />

          <Title level={5}>KYC Documents (Optional)</Title>
          <Paragraph type="secondary" style={{ fontSize: '12px' }}>
            Required for payouts. You can add these details later.
          </Paragraph>

          <Form.Item
            label="PAN Number"
            name="panNumber"
            rules={[
              { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format' }
            ]}
          >
            <Input placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} maxLength={10} />
          </Form.Item>

          <Form.Item
            label="Aadhar Last 4 Digits"
            name="aadharLast4"
            rules={[
              { pattern: /^[0-9]{4}$/, message: 'Enter last 4 digits' }
            ]}
          >
            <Input placeholder="1234" maxLength={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save Bank Account
              </Button>
              <Button onClick={() => {
                setIsBankModalVisible(false);
                bankForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Request Payout Modal */}
      <Modal
        title="Request Payout"
        open={isPayoutModalVisible}
        onCancel={() => {
          setIsPayoutModalVisible(false);
          setPayoutAmount(0);
        }}
        onOk={handleRequestPayout}
        confirmLoading={loading}
        okText="Request Payout"
      >
        <Paragraph>
          Available Balance: <Text strong>₹{earnings?.availableBalance ? Number(earnings.availableBalance).toFixed(2) : '0.00'}</Text>
        </Paragraph>
        <Paragraph type="secondary" style={{ fontSize: '12px' }}>
          Minimum payout amount: ₹1,000
        </Paragraph>

        <Form layout="vertical">
          <Form.Item
            label="Payout Amount"
            required
            rules={[
              { required: true, message: 'Please enter amount' }
            ]}
          >
            <Input
              type="number"
              prefix="₹"
              placeholder="Enter amount"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(Number(e.target.value))}
              min={1000}
              max={earnings?.availableBalance}
            />
          </Form.Item>
        </Form>

        <div style={{ padding: '12px', background: '#f0f5ff', borderRadius: '4px', marginTop: '16px' }}>
          <Text strong>Payout Details:</Text>
          <div style={{ marginTop: '8px' }}>
            <Row justify="space-between">
              <Text>Amount:</Text>
              <Text>₹{payoutAmount.toFixed(2)}</Text>
            </Row>
            <Row justify="space-between">
              <Text>Processing Fee:</Text>
              <Text>₹{(payoutAmount >= 20000 ? 20 : 3).toFixed(2)}</Text>
            </Row>
            <Divider style={{ margin: '8px 0' }} />
            <Row justify="space-between">
              <Text strong>Net Amount:</Text>
              <Text strong>₹{(payoutAmount - (payoutAmount >= 20000 ? 20 : 3)).toFixed(2)}</Text>
            </Row>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreatorPayouts;
