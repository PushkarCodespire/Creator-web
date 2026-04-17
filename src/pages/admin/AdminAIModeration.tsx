// ===========================================
// ADMIN AI MODERATION PAGE
// ===========================================

import { useState, useEffect } from 'react';
import { Card, Table, Tag, Input, Space, Typography, Row, Col, Statistic, message, Tabs, Progress, Divider, Tooltip } from 'antd';
import { Activity, ShieldCheck, Ban, AlertTriangle, CheckCircle2, ShieldAlert, Zap, RefreshCw, Search, FlaskConical } from 'lucide-react';
import { adminApi } from '../../services/api';
import { format } from 'date-fns';
import { colors, spacing, shadows } from '../../styles/tokens';
import CustomCard from '../../components/common/Card/CustomCard';
import CustomButton from '../../components/common/Button/CustomButton';
import '../../styles/AdminPanel.css';
import { logger } from '../../utils/logger';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminAIModeration = () => {
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [logs, setLogs] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = useState<any>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [testContent, setTestContent] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [testResult, setTestResult] = useState<any>(null);
    const [testLoading, setTestLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('logs');

    useEffect(() => {
        loadStats();
        loadLogs(1, 20);
    }, []);

    const loadStats = async () => {
        try {
            const response = await adminApi.getAIModerationStats('30d');
            setStats(response.data.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            logger.error('Failed to load stats');
        }
    };

    const loadLogs = async (page: number, limit: number) => {
        try {
            setLoading(true);
            const response = await adminApi.getAIModerationLogs({ page, limit });
            setLogs(response.data.data.logs || []);
            setPagination({
                current: response.data.data.pagination.page,
                pageSize: limit,
                total: response.data.data.pagination.total
            });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error: unknown) {
            message.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const handleTestModeration = async () => {
        if (!testContent.trim()) return;

        try {
            setTestLoading(true);
            const response = await adminApi.testAIModeration(testContent);
            setTestResult(response.data.data);
            message.success('Moderation check complete');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (__error: unknown) {
            message.error('Test failed');
        } finally {
            setTestLoading(false);
        }
    };

    const columns = [
        {
            title: 'Time',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (date: string) => <span style={{ color: colors.text.secondary, fontWeight: 500 }}>{format(new Date(date), 'MMM dd, HH:mm:ss')}</span>
        },
        {
            title: 'Type',
            dataIndex: 'targetType',
            key: 'targetType',
            width: 120,
            render: (type: string) => <Tag className="admin-tag-neutral">{type}</Tag>
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
            render: (reason: string) => <Text style={{ fontWeight: 500, color: colors.text.primary }}>{reason?.replace(/_/g, ' ') || 'N/A'}</Text>
        },
        {
            title: 'AI Scores',
            key: 'scores',
            render: (record: { metadata?: { scores?: Record<string, number>; autoAction?: string } }) => {
                const metadata = record.metadata || {};
                const scores = metadata.scores || {};
                const topScores = Object.entries(scores)
                    .filter(([, val]) => val > 0.1)
                    .sort((a, b) => (b[1] as number) - (a[1] as number));

                return (
                    <Space wrap>
                        {topScores.map(([key, val]) => (
                            <Tooltip title={`${key}: ${Math.round((val as number) * 100)}%`} key={key}>
                                <Tag
                                    className={(val as number) > 0.8 ? 'admin-tag-error' : 'admin-tag-warning'}
                                    style={{ borderRadius: '12px' }}
                                >
                                    {key}
                                </Tag>
                            </Tooltip>
                        ))}
                        {topScores.length === 0 && <Text type="secondary" style={{ fontSize: '12px' }}>Low Risk</Text>}
                    </Space>
                );
            }
        },
        {
            title: 'Decision',
            key: 'action',
            width: 120,
            render: (record: { metadata?: { autoAction?: string } }) => {
                const autoAction = record.metadata?.autoAction || 'NONE';
                let tagClass = 'admin-tag-neutral';
                if (autoAction === 'BLOCKED') tagClass = 'admin-tag-error';
                if (autoAction === 'FLAGGED') tagClass = 'admin-tag-warning';
                if (autoAction === 'APPROVED') tagClass = 'admin-tag-success';

                return <Tag className={tagClass}>{autoAction}</Tag>;
            }
        }
    ];

    return (
        <div className="admin-page">
            <div className="admin-hero" style={{ marginBottom: '32px' }}>
                <h1 className="admin-hero-title">AI Content Guard</h1>
                <p className="admin-hero-subtitle">Real-time automated content filtering and safety intelligence.</p>
            </div>

            {/* Stats Section */}
            {stats && (
                <Row gutter={[24, 24]} style={{ marginBottom: spacing[8], marginTop: '24px' }}>
                    <Col xs={24} sm={12} md={6}>
                        <CustomCard hoverable style={{ border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
                            <Statistic
                                title={<Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Scans (30d)</Text>}
                                value={stats.totalAIReports}
                                prefix={<ShieldCheck size={20} color={colors.primary.solid} style={{ marginRight: '8px' }} />}
                                valueStyle={{ fontWeight: 900, color: colors.text.primary, fontSize: '28px' }}
                            />
                        </CustomCard>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <CustomCard hoverable style={{ border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
                            <Statistic
                                title={<Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auto-Blocked</Text>}
                                value={stats.blocked}
                                prefix={<Ban size={20} color={colors.error.solid} style={{ marginRight: '8px' }} />}
                                valueStyle={{ color: colors.error.solid, fontWeight: 900, fontSize: '28px' }}
                            />
                        </CustomCard>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <CustomCard hoverable style={{ border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
                            <Statistic
                                title={<Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flagged</Text>}
                                value={stats.flagged}
                                prefix={<AlertTriangle size={20} color={colors.warning.solid} style={{ marginRight: '8px' }} />}
                                valueStyle={{ color: colors.warning.solid, fontWeight: 900, fontSize: '28px' }}
                            />
                        </CustomCard>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <CustomCard hoverable style={{ border: `1px solid ${colors.gray[100]}`, boxShadow: shadows.sm }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Text style={{ fontSize: '11px', fontWeight: 800, color: colors.text.tertiary, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Top Violation</Text>
                                {Object.entries(stats.byReason || {} as Record<string, number>).slice(0, 1).map(([reason, count]) => (
                                    <div key={reason} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Tag className="admin-tag-error" style={{ margin: 0 }}>{reason.toLowerCase().replace(/_/g, ' ')}</Tag>
                                        <Text style={{ fontWeight: 900, fontSize: '28px', color: colors.text.primary }}>{String(count)}</Text>
                                    </div>
                                ))}
                                {Object.keys(stats.byReason || {}).length === 0 && <Text type="secondary" style={{ fontSize: '14px', marginTop: '4px' }}>Clean Record</Text>}
                            </div>
                        </CustomCard>
                    </Col>
                </Row>
            )}

            <Card className="admin-card admin-table" style={{ padding: '0px', overflow: 'hidden' }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ padding: '20px 24px' }}
                    items={[
                        {
                            key: 'logs',
                            label: (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Zap size={16} /> Activity Logs
                                </span>
                            ),
                            children: (
                                <div style={{ paddingTop: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <Text style={{ fontSize: '15px', color: colors.text.tertiary, fontWeight: 500 }}>Recent automated safety decisions</Text>
                                        <CustomButton
                                            variant="secondary"
                                            onClick={() => loadLogs(1, 20)}
                                            style={{ height: '44px' }}
                                        >
                                            <RefreshCw size={16} /> Refresh
                                        </CustomButton>
                                    </div>
                                    <Table
                                        dataSource={logs}
                                        columns={columns}
                                        rowKey="id"
                                        loading={loading}
                                        pagination={{
                                            ...pagination,
                                            onChange: (page, pageSize) => loadLogs(page, pageSize),
                                            showTotal: (total) => `Total ${total} entries`
                                        }}
                                    />
                                </div>
                            )
                        },
                        {
                            key: 'test',
                            label: (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FlaskConical size={16} /> Sandbox Simulator
                                </span>
                            ),
                            children: (
                                <Row gutter={32} style={{ padding: '24px 0' }}>
                                    <Col span={12}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <Text strong style={{ fontSize: '14px', color: colors.text.primary, display: 'block', marginBottom: '8px' }}>Content Input</Text>
                                            <TextArea
                                                rows={10}
                                                value={testContent}
                                                onChange={e => setTestContent(e.target.value)}
                                                placeholder="Paste content here to test against the AI safety model..."
                                                style={{ borderRadius: '12px', padding: '16px', border: `1.5px solid ${colors.gray[200]}` }}
                                            />
                                            <CustomButton
                                                variant="primary"
                                                onClick={handleTestModeration}
                                                loading={testLoading}
                                                style={{ marginTop: 24, height: '48px', width: '100%', fontSize: '15px' }}
                                            >
                                                <Activity size={18} /> Run Safety Analysis
                                            </CustomButton>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '24px', border: `1px solid ${colors.gray[200]}`, minHeight: '100%' }}>
                                            <Text strong style={{ fontSize: '14px', color: colors.text.primary, display: 'block', marginBottom: '20px' }}>Analysis Results</Text>

                                            {!testResult ? (
                                                <div style={{ textAlign: 'center', padding: '60px 0', color: colors.text.tertiary }}>
                                                    <Search size={48} strokeWidth={1.5} style={{ marginBottom: 16, opacity: 0.5 }} />
                                                    <p style={{ fontSize: '14px' }}>Analyze content to see safety metrics</p>
                                                </div>
                                            ) : (
                                                <Space direction="vertical" style={{ width: '100%' }} size="large">
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ color: colors.text.secondary, fontWeight: 600 }}>System Decision</Text>
                                                        {testResult.isFlagged ?
                                                            <Tag color="error">FLAGGED</Tag> :
                                                            <Tag color="success">PASSED</Tag>
                                                        }
                                                    </div>

                                                    {testResult.isFlagged && (
                                                        <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecdd3' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                                <ShieldAlert size={16} color={colors.error.solid} />
                                                                <Text strong style={{ color: colors.error.solid }}>Safety Warning</Text>
                                                            </div>
                                                            <p style={{ color: colors.error.solid, margin: 0, fontSize: '13px', lineHeight: '1.6' }}>{testResult.recommendation}</p>
                                                        </div>
                                                    )}

                                                    <Divider style={{ margin: '8px 0' }} />

                                                    <Text style={{ color: '#101828', fontWeight: 700, fontSize: '15px' }}>Category Breakdown</Text>

                                                    {testResult.violatedCategories?.length > 0 ? (
                                                        testResult.violatedCategories.map((cat: string) => (
                                                            <div key={cat} style={{ marginBottom: 12 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                                    <Text style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                                                                    <Text style={{ color: '#101828', fontWeight: 700 }}>{Math.round(testResult.scores[cat] * 100)}%</Text>
                                                                </div>
                                                                <Progress
                                                                    percent={testResult.scores[cat] * 100}
                                                                    status={testResult.scores[cat] > 0.8 ? 'exception' : 'active'}
                                                                    showInfo={false}
                                                                    strokeWidth={8}
                                                                    strokeColor={testResult.scores[cat] > 0.8 ? '#EF4444' : '#F59E0B'}
                                                                    trailColor="#E2E8F0"
                                                                />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                                            <CheckCircle2 size={32} color="#10B981" style={{ marginBottom: 12 }} />
                                                            <p style={{ color: '#10B981', fontWeight: 600, margin: 0 }}>Content meets all safety standards</p>
                                                        </div>
                                                    )}
                                                </Space>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            )
                        }
                    ]}
                />
            </Card>
        </div>
    );
};

export default AdminAIModeration;
