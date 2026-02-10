// ===========================================
// ADMIN AI MODERATION PAGE
// ===========================================

import { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Button,
    Input,
    Space,
    Typography,
    Row,
    Col,
    Statistic,
    message,
    Tabs,
    Progress,
    Divider,
    Tooltip
} from 'antd';
import {
    RobotOutlined,
    StopOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined,
    ExperimentOutlined,
    ThunderboltOutlined,
    ReloadOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { adminApi } from '../../services/api';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import '../../styles/AdminPanel.css';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminAIModeration = () => {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [testContent, setTestContent] = useState('');
    const [testResult, setTestResult] = useState<any>(null);
    const [testLoading, setTestLoading] = useState(false);

    useEffect(() => {
        loadStats();
        loadLogs(1, 20);
    }, []);

    const loadStats = async () => {
        try {
            const response = await adminApi.getAIModerationStats('30d');
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to load stats');
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
        } catch (error: any) {
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
        } catch (error: any) {
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
            render: (date: string) => <span style={{ color: '#475569', fontWeight: 500 }}>{format(new Date(date), 'MMM dd, HH:mm:ss')}</span>
        },
        {
            title: 'Type',
            dataIndex: 'targetType',
            key: 'targetType',
            width: 120,
            render: (type: string) => <Tag style={{ borderRadius: '4px' }}>{type}</Tag>
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
            render: (reason: string) => <Text style={{ fontWeight: 500, color: '#1f2a44' }}>{reason?.replace(/_/g, ' ') || 'N/A'}</Text>
        },
        {
            title: 'AI Scores',
            key: 'scores',
            render: (record: any) => {
                const metadata = record.metadata || {};
                const scores = metadata.scores || {};
                const topScores = Object.entries(scores)
                    .filter(([_, val]: [string, any]) => val > 0.1)
                    .sort((a: any, b: any) => b[1] - a[1]);

                return (
                    <Space wrap>
                        {topScores.map(([key, val]: [string, any]) => (
                            <Tooltip title={`${key}: ${Math.round(val * 100)}%`} key={key}>
                                <Tag
                                    color={val > 0.8 ? 'red' : 'orange'}
                                    style={{ borderRadius: '12px', fontSize: '11px' }}
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
            render: (record: any) => {
                const autoAction = record.metadata?.autoAction || 'NONE';
                let color = 'default';
                if (autoAction === 'BLOCKED') color = 'error';
                if (autoAction === 'FLAGGED') color = 'warning';
                if (autoAction === 'APPROVED') color = 'success';

                return <Tag color={color} style={{ borderRadius: '4px', fontWeight: 600 }}>{autoAction}</Tag>;
            }
        }
    ];

    return (
        <div className="admin-page">
            <div className="admin-hero">
                <div>
                    <h2 className="admin-hero-title">AI Moderation Center</h2>
                    <p className="admin-hero-subtitle">Automated content filter statistics and system simulation.</p>
                </div>
            </div>

            {/* Stats Section */}
            {stats && (
                <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="admin-card">
                            <Statistic
                                title="Total Scans (30d)"
                                value={stats.totalAIReports}
                                prefix={<SafetyCertificateOutlined style={{ color: '#3B82F6', marginRight: 8 }} />}
                                valueStyle={{ fontWeight: 700 }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="admin-card">
                            <Statistic
                                title="Auto-Blocked"
                                value={stats.blocked}
                                prefix={<StopOutlined style={{ color: '#EF4444', marginRight: 8 }} />}
                                valueStyle={{ color: '#EF4444', fontWeight: 700 }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="admin-card">
                            <Statistic
                                title="Flagged for Review"
                                value={stats.flagged}
                                prefix={<WarningOutlined style={{ color: '#F59E0B', marginRight: 8 }} />}
                                valueStyle={{ color: '#F59E0B', fontWeight: 700 }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="admin-card" title={<span style={{ fontWeight: 600, fontSize: '14px', color: '#64748B' }}>Top Violation</span>} size="small">
                            {Object.entries(stats.byReason || {} as Record<string, number>).slice(0, 1).map(([reason, count]) => (
                                <div key={reason} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Tag style={{ margin: 0, textTransform: 'capitalize' }}>{reason.toLowerCase().replace(/_/g, ' ')}</Tag>
                                    <Text strong>{count as any}</Text>
                                </div>
                            ))}
                            {Object.keys(stats.byReason || {}).length === 0 && <Text type="secondary">No violations</Text>}
                        </Card>
                    </Col>
                </Row>
            )}

            <Card className="admin-card admin-table" style={{ padding: '20px' }}>
                <Tabs
                    defaultActiveKey="logs"
                    items={[
                        {
                            key: 'logs',
                            label: (
                                <span>
                                    <ThunderboltOutlined /> Activity Logs
                                </span>
                            ),
                            children: (
                                <div>
                                    <div className="admin-toolbar" style={{ padding: '12px 0 20px' }}>
                                        <div className="admin-hero-subtitle">Recent automated decisions</div>
                                        <Button
                                            className="admin-cta-secondary"
                                            icon={<ReloadOutlined />}
                                            onClick={() => loadLogs(1, 20)}
                                        >
                                            Refresh
                                        </Button>
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
                                <span>
                                    <ExperimentOutlined /> Sandbox Simulator
                                </span>
                            ),
                            children: (
                                <Row gutter={24} style={{ padding: '20px 0' }}>
                                    <Col span={12}>
                                        <Card title="Input Content" bordered size="small">
                                            <TextArea
                                                rows={10}
                                                value={testContent}
                                                onChange={e => setTestContent(e.target.value)}
                                                placeholder="Paste content here to test against the AI..."
                                                style={{ borderRadius: '8px' }}
                                            />
                                            <Button
                                                type="primary"
                                                onClick={handleTestModeration}
                                                loading={testLoading}
                                                style={{ marginTop: 20 }}
                                                icon={<RobotOutlined />}
                                                block
                                            >
                                                Analyze Content
                                            </Button>
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card title="Analysis Result" bordered size="small" style={{ minHeight: '100%' }}>
                                            {!testResult ? (
                                                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
                                                    <SearchOutlined style={{ fontSize: '40px', marginBottom: 16 }} />
                                                    <p>Enter text on the left to see AI analysis</p>
                                                </div>
                                            ) : (
                                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ color: '#475569', fontWeight: 600 }}>Auto-Decision</Text>
                                                        {testResult.isFlagged ?
                                                            <Tag color="red" style={{ fontWeight: 600 }}>FLAGGED</Tag> :
                                                            <Tag color="green" style={{ fontWeight: 600 }}>SAFE</Tag>
                                                        }
                                                    </div>

                                                    {testResult.isFlagged && (
                                                        <div style={{ padding: '12px', background: '#FFF1F2', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                                                            <Text strong style={{ color: '#BE123C' }}>Recommendation:</Text>
                                                            <p style={{ color: '#BE123C', margin: '4px 0 0' }}>{testResult.recommendation}</p>
                                                        </div>
                                                    )}

                                                    <Divider style={{ margin: '12px 0', borderBlockStart: '1px solid rgba(102, 126, 234, 0.1)' }} />

                                                    <Text style={{ color: '#1f2a44', fontWeight: 700, fontSize: '15px' }}>Risk Categories</Text>

                                                    {testResult.violatedCategories?.length > 0 ? (
                                                        testResult.violatedCategories.map((cat: string) => (
                                                            <div key={cat} style={{ marginBottom: 10 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                                                    <Text style={{ fontSize: '13px', color: '#1f2a44', fontWeight: 500 }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                                                                    <Text style={{ color: '#1f2a44', fontWeight: 700 }}>{Math.round(testResult.scores[cat] * 100)}%</Text>
                                                                </div>
                                                                <Progress
                                                                    percent={testResult.scores[cat] * 100}
                                                                    status={testResult.scores[cat] > 0.8 ? 'exception' : 'active'}
                                                                    showInfo={false}
                                                                    strokeColor={testResult.scores[cat] > 0.8 ? '#EF4444' : '#F59E0B'}
                                                                />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                                            <CheckCircleOutlined style={{ color: '#10B981', fontSize: '24px' }} />
                                                            <p style={{ color: '#10B981', marginTop: 8 }}>No significant risks detected</p>
                                                        </div>
                                                    )}
                                                </Space>
                                            )}
                                        </Card>
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
