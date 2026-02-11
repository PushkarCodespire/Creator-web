// ===========================================
// CREATOR PAYOUTS PAGE - Premium Light Theme
// ===========================================

import { useState, useEffect } from 'react';
import {
  Row,
  Col,
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
  Wallet,
  Landmark,
  CircleDollarSign,
  History,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Users
} from 'lucide-react';
import { payoutApi } from '../../services/api';
import { format } from 'date-fns';
import { colors, spacing, shadows, borderRadius } from '../../styles/tokens';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
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
      console.error('Failed to load earnings');
    }
  };

  const loadBankAccount = async () => {
    try {
      const response = await payoutApi.getBankAccount();
      setBankAccount(response.data.data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Failed to load bank account');
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
      console.error('Failed to load payouts');
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
      console.error('Failed to load ledger');
    }
  };

  const handleAddBankAccount = async (values: any) => {
    try {
      setLoading(true);
      await payoutApi.addBankAccount(values);
      message.success('Bank account synchronization successful');
      setIsBankModalVisible(false);
      bankForm.resetFields();
      loadBankAccount();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to sync bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    try {
      setLoading(true);
      await payoutApi.requestPayout(payoutAmount);
      message.success('Capital withdrawal initiated');
      setIsPayoutModalVisible(false);
      setPayoutAmount(0);
      loadEarnings();
      loadPayouts();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to initiate withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    let color = colors.gray[500];
    let bgColor = colors.gray[50];
    let icon = <Clock size={12} />;

    switch (status) {
      case 'COMPLETED':
        color = colors.success.solid;
        bgColor = colors.success.subtle;
        icon = <CheckCircle size={12} />;
        break;
      case 'FAILED':
      case 'REJECTED':
        color = colors.error.solid;
        bgColor = colors.error.subtle;
        icon = <XCircle size={12} />;
        break;
      case 'PENDING':
      case 'PROCESSING':
        color = colors.primary.solid;
        bgColor = colors.primary.subtle;
        icon = <Clock size={12} />;
        break;
    }

    return (
      <Tag bordered={false} icon={icon} style={{
        background: bgColor,
        color: color,
        borderRadius: '6px',
        fontWeight: 700,
        fontSize: '11px',
        padding: '2px 10px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {status}
      </Tag>
    );
  };

  const getKYCStatusTag = (status: string) => {
    const isVerified = status === 'VERIFIED';
    return (
      <Tag bordered={false} style={{
        background: isVerified ? colors.success.subtle : colors.warning.subtle,
        color: isVerified ? colors.success.solid : colors.warning.solid,
        borderRadius: '6px',
        fontWeight: 700,
        fontSize: '11px',
        padding: '2px 10px'
      }}>
        {isVerified ? 'VERIFIED' : status}
      </Tag>
    );
  };

  const payoutColumns = [
    {
      title: 'Temporal Mark',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date: string) => (
        <div style={{ color: colors.text.primary, fontWeight: 600 }}>
          {format(new Date(date), 'MMM dd, yyyy')}
          <div style={{ fontSize: '11px', color: colors.text.tertiary, fontWeight: 500 }}>{format(new Date(date), 'HH:mm')}</div>
        </div>
      )
    },
    {
      title: 'Net Capital',
      dataIndex: 'netAmount',
      key: 'netAmount',
      render: (amount: number | string) => <div style={{ fontWeight: 800, color: colors.text.primary, fontSize: '15px' }}>₹{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
    },
    {
      title: 'Breakdown',
      key: 'breakdown',
      render: (record: Payout) => (
        <div style={{ fontSize: '12px', color: colors.text.secondary }}>
          <div>Gross: ₹{Number(record.amount).toLocaleString()}</div>
          <div style={{ color: colors.error.solid }}>Fee: -₹{Number(record.fee).toLocaleString()}</div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Transaction Details',
      key: 'utr',
      render: (record: Payout) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>{record.utr || '---'}</div>
          <div style={{ fontSize: '11px', color: colors.text.tertiary }}>UTR Reference</div>
        </div>
      )
    }
  ];

  const ledgerColumns = [
    {
      title: 'Temporal Mark',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div style={{ color: colors.text.primary, fontWeight: 600 }}>
          {format(new Date(date), 'MMM dd, yyyy')}
          <div style={{ fontSize: '11px', color: colors.text.tertiary, fontWeight: 500 }}>{format(new Date(date), 'HH:mm')}</div>
        </div>
      )
    },
    {
      title: 'Neural Stream',
      dataIndex: 'sourceType',
      key: 'sourceType',
      render: (sourceType: string) => {
        let color = colors.primary.solid;
        let bgColor = colors.primary.subtle;
        if (sourceType === 'subscription') { color = '#ec4899'; bgColor = '#fdf2f8'; }
        if (sourceType === 'payout') { color = colors.warning.solid; bgColor = colors.warning.subtle; }

        return (
          <Tag bordered={false} style={{
            background: bgColor,
            color: color,
            fontWeight: 800,
            fontSize: '10px',
            textTransform: 'uppercase',
            borderRadius: '6px'
          }}>
            {sourceType?.replace('_', ' ') || 'SYSTEM'}
          </Tag>
        );
      }
    },
    {
      title: 'Narrative',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <div style={{ color: colors.text.secondary, fontWeight: 500, maxWidth: '200px' }}>{text}</div>
    },
    {
      title: 'Quantum Change',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number | string, record: LedgerEntry) => (
        <div style={{
          color: record.type === 'CREDIT' ? colors.success.solid : colors.error.solid,
          fontWeight: 800,
          fontSize: '15px'
        }}>
          {record.type === 'CREDIT' ? '+' : '-'}₹{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      )
    },
    {
      title: 'Balance Reserve',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      render: (balance: number | string) => <div style={{ fontWeight: 700, color: colors.text.primary }}>₹{Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
    }
  ];

  return (
    <div style={{ padding: isMobile ? spacing[3] : spacing[8], background: colors.background, minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: spacing[10] }}
      >
        <Title level={isMobile ? 3 : 1} style={{ fontWeight: 800, margin: 0, letterSpacing: '-0.03em', color: colors.text.primary, lineHeight: 1.1 }}>
          Financial <span style={{ color: colors.primary.solid }}>Nexus</span>
        </Title>
        <Text style={{ color: colors.text.secondary, fontSize: isMobile ? '14px' : '16px', fontWeight: 500, marginTop: '12px', display: 'block' }}>
          Real-time capital synchronization for your creator matrix
        </Text>
      </motion.div>

      {/* Main Stats Card */}
      <Row gutter={[24, 24]} style={{ marginBottom: spacing[10] }}>
        <Col xs={24} lg={10}>
          <div style={{
            background: colors.primary.gradient,
            borderRadius: '28px',
            padding: isMobile ? '32px' : '48px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: shadows.lg,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '240px',
              height: '240px',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '50%',
              filter: 'blur(50px)'
            }} />

            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: 800,
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <Wallet size={18} /> Available for Withdrawal
              </div>
              <div style={{ fontSize: isMobile ? '40px' : '56px', fontWeight: 900, letterSpacing: '-0.03em', color: '#FFFFFF', lineHeight: 1 }}>
                ₹{(earnings?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ marginTop: '48px' }}>
              <Button
                type="primary"
                block
                size="large"
                onClick={() => setIsPayoutModalVisible(true)}
                disabled={!bankAccount || bankAccount.kycStatus !== 'VERIFIED' || (earnings?.availableBalance || 0) < 1000}
                style={{
                  height: '56px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '16px',
                  background: '#FFFFFF',
                  color: colors.primary.solid,
                  border: 'none',
                  boxShadow: shadows.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                Capture Funds <Zap size={16} />
              </Button>
              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                Min. Withdrawal ₹1,000 • Temporal Delay 24-48h
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={14}>
          <Row gutter={[20, 20]}>
            {[
              { title: 'In-Transit', value: earnings?.pendingBalance || 0, color: colors.warning.solid, bg: colors.warning.subtle, icon: <Clock size={20} /> },
              { title: 'Total Injected', value: earnings?.lifetimeEarnings || 0, color: colors.success.solid, bg: colors.success.subtle, icon: <TrendingUp size={20} /> },
              { title: 'Deal Revenue', value: earnings?.brandDealEarnings || 0, color: colors.primary.solid, bg: colors.primary.subtle, icon: <ShieldCheck size={20} /> },
              { title: 'Agent Subs', value: earnings?.subscriptionEarnings || 0, color: '#ec4899', bg: '#fdf2f8', icon: <Users size={20} /> }
            ].map((item, i) => (
              <Col xs={12} sm={12} key={i}>
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '32px 24px',
                  border: `1px solid ${colors.gray[100]}`,
                  boxShadow: shadows.md,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: colors.text.tertiary,
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: item.color }}>{item.icon}</span>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.02em' }}>₹{item.value.toLocaleString()}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Account Matrix */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: isMobile ? '32px' : '48px',
        marginBottom: spacing[10],
        border: `1px solid ${colors.gray[100]}`,
        boxShadow: shadows.lg
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              background: colors.primary.subtle,
              padding: '16px',
              borderRadius: '16px',
              color: colors.primary.solid,
              border: `1px solid ${colors.primary.solid}15`
            }}>
              <Landmark size={28} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '22px', color: colors.text.primary, letterSpacing: '-0.02em' }}>Payout Matrix</h3>
              <Text style={{ color: colors.text.tertiary, fontSize: '13px', fontWeight: 500 }}>Secure endpoint for capital transmission</Text>
            </div>
          </div>
          <Button
            onClick={() => {
              if (bankAccount) bankForm.setFieldsValue(bankAccount);
              setIsBankModalVisible(true);
            }}
            style={{
              borderRadius: '12px',
              fontWeight: 700,
              height: '48px',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: shadows.sm
            }}
          >
            <Plus size={18} /> {bankAccount ? 'Update Protocol' : 'Setup Matrix'}
          </Button>
        </div>

        {bankAccount ? (
          <div style={{ background: colors.gray[50], padding: isMobile ? '32px 24px' : '40px', borderRadius: '24px', border: `1px solid ${colors.gray[100]}` }}>
            <Row gutter={[40, 40]}>
              <Col xs={24} sm={12}>
                <div style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em' }}>Protocol Holder</div>
                <div style={{ color: colors.text.primary, fontWeight: 800, fontSize: '20px' }}>{bankAccount.accountHolderName}</div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em' }}>Endpoint ID</div>
                <div style={{ color: colors.text.primary, fontWeight: 800, fontSize: '20px', letterSpacing: '0.1em' }}>{bankAccount.accountNumber.replace(/.(?=.{4})/g, '•')}</div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em' }}>Gateway & IFSC</div>
                <div style={{ color: colors.text.primary, fontWeight: 800, fontSize: '20px' }}>{bankAccount.bankName} <span style={{ color: colors.primary.solid, margin: '0 8px' }}>•</span> {bankAccount.ifscCode}</div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em' }}>Verification Integrity</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getKYCStatusTag(bankAccount.kycStatus)}
                  <span style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: 700, textTransform: 'capitalize' }}>{bankAccount.accountType.toLowerCase()} Channel</span>
                </div>
              </Col>
            </Row>
            {bankAccount.kycStatus !== 'VERIFIED' && (
              <div style={{
                marginTop: '32px',
                padding: '20px',
                background: colors.warning.subtle,
                border: `1px solid ${colors.warning.solid}20`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <AlertCircle size={24} style={{ color: colors.warning.solid }} />
                <span style={{ color: colors.text.secondary, fontSize: '14px', fontWeight: 600 }}>
                  Strategic Note: Verification (KYC) is required for capital capture. Please complete the identity protocol.
                </span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', background: colors.gray[50], borderRadius: '24px', border: `2px dashed ${colors.gray[200]}` }}>
            <Landmark size={64} style={{ color: colors.gray[200], marginBottom: '24px' }} />
            <p style={{ color: colors.text.tertiary, marginBottom: '32px', fontSize: '18px', fontWeight: 600 }}>Neutral Payout matrix. Initialize to receive earnings.</p>
            <Button type="primary" size="large" onClick={() => setIsBankModalVisible(true)} style={{ borderRadius: '12px', fontWeight: 700, padding: '0 32px', height: '44px', background: colors.primary.solid, color: '#FFFFFF', border: 'none', boxShadow: shadows.md }}>
              Initialize Protocol
            </Button>
          </div>
        )}
      </div>

      {/* Synchronized History */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        padding: isMobile ? '24px' : '40px',
        border: `1px solid ${colors.gray[100]}`,
        boxShadow: shadows.lg,
        overflow: 'hidden'
      }}>
        <Tabs defaultActiveKey="payouts" className="premium-tabs">
          <Tabs.TabPane
            tab={
              <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} /> Withdrawal History
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
                style: { marginTop: '32px' }
              }}
              locale={{ emptyText: <Empty description="No temporal marks recorded" /> }}
              className="flagship-table"
              style={{ marginTop: '32px' }}
              scroll={{ x: 'max-content' }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CircleDollarSign size={18} /> Earnings Ledger
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
                style: { marginTop: '32px' }
              }}
              locale={{ emptyText: <Empty description="No quantum entries recorded" /> }}
              className="flagship-table"
              style={{ marginTop: '32px' }}
              scroll={{ x: 'max-content' }}
            />
          </Tabs.TabPane>
        </Tabs>

        <style>{`
          .premium-tabs .ant-tabs-nav::before { border-bottom: 1px solid ${colors.gray[100]} !important; }
          .premium-tabs .ant-tabs-tab { padding: 12px 0 !important; margin-right: 32px !important; color: ${colors.text.tertiary} !important; font-size: 15px !important; transition: all 0.2s ease; }
          .premium-tabs .ant-tabs-tab:hover { color: ${colors.primary.solid} !important; }
          .premium-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: ${colors.primary.solid} !important; font-weight: 700 !important; }
          .premium-tabs .ant-tabs-ink-bar { background: ${colors.primary.solid} !important; height: 3px !important; }
          
          .flagship-table .ant-table { background: #ffffff !important; }
          .flagship-table .ant-table-thead > tr > th {
            background: ${colors.gray[50]} !important;
            color: ${colors.text.tertiary} !important;
            border-bottom: 1px solid ${colors.gray[100]} !important;
            font-weight: 700 !important;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.1em;
            padding: 16px !important;
          }
          .flagship-table .ant-table-tbody > tr > td { 
            border-bottom: 1px solid ${colors.gray[100]} !important; 
            padding: 16px !important;
            background: #ffffff !important;
            color: ${colors.text.primary} !important;
          }
          .flagship-table .ant-table-tbody > tr:hover > td { background: ${colors.gray[50]} !important; }
          .flagship-table .ant-table-placeholder .ant-table-cell { background: #ffffff !important; border-bottom: none !important; }

          .premium-modal .ant-modal-content { border-radius: 12px !important; padding: 24px !important; background: #FFFFFF !important; border: 1px solid ${colors.gray[200]} !important; box-shadow: ${shadows.xl} !important; }
          .premium-modal .ant-modal-header { border-bottom: none !important; margin-bottom: 24px !important; background: transparent !important; }
          .premium-modal .ant-modal-title { color: ${colors.text.primary} !important; }
          
          .ant-input, .ant-input-number, .ant-select-selector { border-radius: 8px !important; height: 40px !important; border: 1px solid ${colors.gray[200]} !important; background: #ffffff !important; color: ${colors.text.primary} !important; }
          .ant-input:focus, .ant-select-focused .ant-select-selector { border-color: ${colors.primary.solid} !important; box-shadow: 0 0 0 2px ${colors.primary.subtle} !important; }
          .ant-form-item-label label { fontWeight: 600 !important; color: ${colors.text.secondary} !important; font-size: 13px !important; text-transform: uppercase !important; letterSpacing: 0.05em !important; }
          .ant-empty-description { color: ${colors.text.tertiary} !important; }
        `}</style>
      </div>

      {/* Bank Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: colors.primary.subtle, padding: '8px', borderRadius: '10px' }}>
              <Landmark size={20} style={{ color: colors.primary.solid }} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.02em' }}>
              Matrix Configuration
            </div>
          </div>
        }
        open={isBankModalVisible}
        onCancel={() => { setIsBankModalVisible(false); bankForm.resetFields(); }}
        footer={null}
        width={isMobile ? '95%' : 600}
        centered
        className="premium-modal"
      >
        <Form form={bankForm} layout="vertical" onFinish={handleAddBankAccount} requiredMark={false}>
          <Form.Item label="Registry Holder Name" name="accountHolderName" rules={[{ required: true, message: 'Registry name required' }]}>
            <Input placeholder="As per legal records" />
          </Form.Item>

          <Form.Item label="Endpoint Identifier" name="accountNumber" rules={[{ required: true, message: 'Endpoint ID required' }]}>
            <Input placeholder="Account Number" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Gateway IFSC" name="ifscCode" rules={[{ required: true, message: 'IFSC required' }]}>
                <Input placeholder="IFSC Code" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Neural Bank" name="bankName" rules={[{ required: true, message: 'Bank name required' }]}>
                <Input placeholder="e.g. HDFC Bank" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Channel Type" name="accountType" initialValue="SAVINGS">
            <Select>
              <Select.Option value="SAVINGS">Savings Matrix</Select.Option>
              <Select.Option value="CURRENT">Current Stream</Select.Option>
            </Select>
          </Form.Item>

          <Divider style={{ margin: '32px 0' }} />

          <Form.Item label="Regional Identity (PAN)" name="panNumber" rules={[{ pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid format' }]}>
            <Input placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block style={{ height: '56px', borderRadius: '14px', fontWeight: 800, marginTop: '24px', background: colors.primary.gradient, border: 'none', boxShadow: shadows.lg }}>
            Synchronize Protocol
          </Button>
        </Form>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: colors.success.subtle, padding: '8px', borderRadius: '10px' }}>
              <CreditCard size={20} style={{ color: colors.success.solid }} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: colors.text.primary, letterSpacing: '-0.02em' }}>
              Capital Capture
            </div>
          </div>
        }
        open={isPayoutModalVisible}
        onCancel={() => { setIsPayoutModalVisible(false); setPayoutAmount(0); }}
        onOk={handleRequestPayout}
        confirmLoading={loading}
        okText="Authorize Capture"
        centered
        className="premium-modal"
        okButtonProps={{ style: { height: '52px', borderRadius: '14px', fontWeight: 800, background: colors.primary.gradient, border: 'none' } }}
        cancelButtonProps={{ style: { height: '52px', borderRadius: '14px', fontWeight: 700 } }}
      >
        <div style={{ background: colors.gray[50], padding: '24px', borderRadius: '20px', marginBottom: '32px', border: `1px solid ${colors.gray[100]}` }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: colors.text.tertiary, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Liquid Reserve</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: colors.text.primary, letterSpacing: '-0.02em' }}>₹{(earnings?.availableBalance || 0).toLocaleString()}</div>
        </div>

        <Form layout="vertical">
          <Form.Item label="Capture Volume (₹)" required>
            <Input
              type="number"
              prefix={<span style={{ color: colors.text.tertiary, fontWeight: 700 }}>₹</span>}
              placeholder="0.00"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(Number(e.target.value))}
              min={1000}
              max={earnings?.availableBalance}
            />
          </Form.Item>
        </Form>

        <div style={{ padding: '24px', background: `${colors.success.solid}05`, borderRadius: '16px', border: `1px dashed ${colors.success.solid}30`, marginTop: '24px' }}>
          <Row justify="space-between" style={{ marginBottom: '12px' }}>
            <Text style={{ color: colors.text.secondary, fontWeight: 600 }}>Gross Capture:</Text>
            <Text strong style={{ color: colors.text.primary }}>₹{Number(payoutAmount).toFixed(2)}</Text>
          </Row>
          <Row justify="space-between" style={{ marginBottom: '12px' }}>
            <Text style={{ color: colors.text.secondary, fontWeight: 600 }}>Protocol Fee:</Text>
            <Text style={{ color: colors.error.solid, fontWeight: 700 }}>-₹{(payoutAmount >= 20000 ? 20 : 3).toFixed(2)}</Text>
          </Row>
          <Divider style={{ margin: '16px 0', borderColor: `${colors.success.solid}20` }} />
          <Row justify="space-between">
            <Text style={{ color: colors.text.primary, fontWeight: 800, fontSize: '15px' }}>Net Capital Surge:</Text>
            <Text style={{ color: colors.success.solid, fontWeight: 900, fontSize: '22px' }}>₹{(payoutAmount - (payoutAmount >= 20000 ? 20 : 3)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </Row>
        </div>
      </Modal>
    </div>
  );
};

export default CreatorPayouts;
