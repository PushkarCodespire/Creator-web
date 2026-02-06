import { Avatar, Button, Divider, List, Space, Tag, Typography } from 'antd';
import {
    CheckCircleFilled,
    GlobalOutlined,
    MessageOutlined,
    StarFilled,
    TeamOutlined,
    ShareAltOutlined,
    UserAddOutlined,
    QuestionCircleOutlined,
    PlayCircleOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { Creator } from '../../types';
import { getImageUrl } from '../../services/api';
import { colors } from '../../styles/tokens';

const { Text, Title, Paragraph } = Typography;

interface ChatInfoPanelProps {
    creator: Creator | null;
    onSendMessage: (text: string) => void;
    isCollapsed: boolean;
}

export const ChatInfoPanel = ({ creator, onSendMessage, isCollapsed }: ChatInfoPanelProps) => {
    if (isCollapsed) return null;

    const faqs = [
        { q: "What are your core services?", a: "I can help with React development..." },
        { q: "Pricing for custom projects?", a: "Custom projects start at..." },
        { q: "How to get started?", a: "Simply send me your project requirements!" }
    ];

    const relatedContent = [
        { title: "React Tutorial 2024", type: "video", icon: <PlayCircleOutlined /> },
        { title: "Clean Code Guide", type: "doc", icon: <FileTextOutlined /> }
    ];

    return (
        <div className="chat-info-panel">
            <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
                {/* Creator Identity */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Avatar
                        size={120}
                        src={creator?.profileImage ? getImageUrl(creator.profileImage) : undefined}
                        style={{
                            marginBottom: '16px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                            border: '4px solid #fff'
                        }}
                    >
                        {creator?.displayName?.[0]}
                    </Avatar>
                    <Title level={4} style={{ margin: 0 }}>
                        {creator?.displayName} {creator?.isVerified && <CheckCircleFilled style={{ color: '#6366f1', fontSize: '16px' }} />}
                    </Title>
                    <Text type="secondary">{creator?.category || 'Expert Creator'}</Text>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Text strong style={{ fontSize: '16px', display: 'block' }}>2.5K</Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>Followers</Text>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Text strong style={{ fontSize: '16px', display: 'block' }}>4.9</Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>Rating</Text>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Text strong style={{ fontSize: '16px', display: 'block' }}>500+</Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>Chats</Text>
                        </div>
                    </div>

                    <Space style={{ marginTop: '20px' }}>
                        <Button type="primary" icon={<UserAddOutlined />} shape="round">Follow</Button>
                        <Button icon={<ShareAltOutlined />} shape="circle" />
                    </Space>
                </div>

                <Divider />

                {/* About Section */}
                <div style={{ marginBottom: '24px' }}>
                    <Title level={5} style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>About</Title>
                    <Paragraph style={{ fontSize: '13px', color: '#475569' }}>
                        {creator?.bio || "I'm a dedicated expert in technology and software development. I help builders create high-quality applications through AI-powered mentorship."}
                    </Paragraph>
                    <Space wrap>
                        <Tag color="blue">React</Tag>
                        <Tag color="geekblue">Node.js</Tag>
                        <Tag color="purple">TypeScript</Tag>
                    </Space>
                </div>

                {/* Quick FAQs */}
                <div style={{ marginBottom: '24px' }}>
                    <Title level={5} style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Quick FAQs</Title>
                    <List
                        size="small"
                        dataSource={faqs}
                        renderItem={item => (
                            <List.Item
                                style={{ cursor: 'pointer', padding: '8px 0', border: 'none' }}
                                onClick={() => onSendMessage(item.q)}
                            >
                                <Space>
                                    <QuestionCircleOutlined style={{ color: '#6366f1' }} />
                                    <Text style={{ fontSize: '13px' }}>{item.q}</Text>
                                </Space>
                            </List.Item>
                        )}
                    />
                </div>

                {/* Related Content */}
                <div>
                    <Title level={5} style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Resources</Title>
                    <List
                        size="small"
                        dataSource={relatedContent}
                        renderItem={item => (
                            <List.Item style={{ padding: '8px 0', border: 'none' }}>
                                <Space>
                                    <span style={{ color: '#6366f1' }}>{item.icon}</span>
                                    <Text style={{ fontSize: '13px' }}>{item.title}</Text>
                                </Space>
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};
