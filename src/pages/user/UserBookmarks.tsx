import React, { useState, useEffect } from 'react';
import { Card, Empty, Typography, Button, Row, Col, Select, Input, DatePicker, Avatar } from 'antd';
import { DeleteOutlined, BookOutlined, SearchOutlined, FilterOutlined, CheckCircleFilled } from '@ant-design/icons';
import { bookmarkApi, getImageUrl } from '../../services/api';
import { motion } from 'framer-motion';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';
import { useNavigate } from 'react-router-dom';
import { colors, shadows } from '../../styles/tokens';
import { logger } from '../../utils/logger';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const UserBookmarks = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [_loadingRecommendations, setLoadingRecommendations] = useState(false);

    // Filter states
    const [search, setSearch] = useState('');
    const [creatorFilter, setCreatorFilter] = useState<string | undefined>(undefined);
    const [conversationFilter, setConversationFilter] = useState<string | undefined>(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [dateRange, setDateRange] = useState<any>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Get unique creators and conversations for filters
    const uniqueCreators = Array.from(new Map(
        bookmarks
            .filter(b => b.message?.conversation?.creator)
            .map(b => [b.message.conversation.creator.id, b.message.conversation.creator])
    ).values());

    const uniqueConversations = Array.from(new Map(
        bookmarks
            .filter(b => b.message?.conversation)
            .map(b => [b.message.conversation.id, b.message.conversation])
    ).values());

    useEffect(() => {
        fetchBookmarks();
        fetchRecommendations();
    }, [search, creatorFilter, conversationFilter, dateRange]);

    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (creatorFilter) params.creatorId = creatorFilter;
            if (conversationFilter) params.conversationId = conversationFilter;
            if (dateRange && dateRange[0] && dateRange[1]) {
                params.from = dateRange[0].toISOString();
                params.to = dateRange[1].toISOString();
            }

            const response = await bookmarkApi.getBookmarks(params);
            setBookmarks(response.data.data.bookmarks || []);
        } catch (err) {
            logger.error('Failed to fetch bookmarks:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            setLoadingRecommendations(true);
            const response = await bookmarkApi.getRecommendations({ limit: 5 });
            setRecommendations(response.data.data.recommendations || []);
        } catch (err) {
            logger.error('Failed to fetch recommendations:', err);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const handleRemoveBookmark = async (messageId: string) => {
        try {
            await bookmarkApi.removeBookmark(messageId);
            setBookmarks(prev => prev.filter(b => b.messageId !== messageId));
        } catch (err) {
            logger.error('Failed to remove bookmark:', err);
        }
    };

    const handleAddBookmark = async (messageId: string) => {
        try {
            await bookmarkApi.addBookmark(messageId);
            // Refresh recommendations after adding
            fetchRecommendations();
            fetchBookmarks();
        } catch (err) {
            logger.error('Failed to add bookmark:', err);
        }
    };

    const handleResetFilters = () => {
        setSearch('');
        setCreatorFilter(undefined);
        setConversationFilter(undefined);
        setDateRange(null);
    };

    if (loading && bookmarks.length === 0) return <DashboardContentLoader />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: '32px' }}
        >
            <div style={{ marginBottom: '32px' }}>
                <Title level={2} style={{ color: colors.text.primary, marginBottom: '4px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    <BookOutlined /> Bookmarks
                </Title>
                <Text style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>
                    Your saved messages and important notes
                </Text>
            </div>

            {/* Search and Filters */}
            <Card
                bordered={false}
                style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    border: `1px solid ${colors.gray[100]}`,
                    boxShadow: shadows.md,
                    marginBottom: '24px'
                }}
                bodyStyle={{ padding: '20px' }}
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={12}>
                        <Search
                            placeholder="Search in message content..."
                            allowClear
                            size="large"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            prefix={<SearchOutlined style={{ color: colors.text.tertiary }} />}
                            style={{ borderRadius: '12px' }}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                background: showFilters ? colors.primary.subtle : 'transparent',
                                border: `1px solid ${colors.gray[200]}`,
                                color: colors.text.primary,
                                borderRadius: '12px',
                                fontWeight: 700
                            }}
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                    </Col>

                    {showFilters && (
                        <>
                            <Col xs={24} sm={8}>
                                <div title="Filter by Creator">
                                <Select
                                    placeholder="Filter by Creator"
                                    allowClear
                                    size="large"
                                    value={creatorFilter}
                                    onChange={setCreatorFilter}
                                    style={{ width: '100%' }}
                                >
                                    {uniqueCreators.map((creator: { id: string; displayName: string }) => (
                                        <Option key={creator.id} value={creator.id}>
                                            {creator.displayName}
                                        </Option>
                                    ))}
                                </Select>
                                </div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <div title="Filter by Conversation">
                                <Select
                                    placeholder="Filter by Conversation"
                                    allowClear
                                    size="large"
                                    value={conversationFilter}
                                    onChange={setConversationFilter}
                                    style={{ width: '100%' }}
                                >
                                    {uniqueConversations.map((conv: { id: string; creator?: { displayName: string } }) => (
                                        <Option key={conv.id} value={conv.id}>
                                            {conv.creator?.displayName || 'Unknown'}
                                        </Option>
                                    ))}
                                </Select>
                                </div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <RangePicker
                                    size="large"
                                    value={dateRange}
                                    onChange={(dates) => setDateRange(dates)}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col xs={24}>
                                <Button
                                    onClick={handleResetFilters}
                                    style={{
                                        background: 'transparent',
                                        border: `1px solid ${colors.gray[200]}`,
                                        color: colors.text.tertiary,
                                        borderRadius: '12px',
                                        fontWeight: 700
                                    }}
                                >
                                    Reset Filters
                                </Button>
                            </Col>
                        </>
                    )}
                </Row>
            </Card>

            {/* Bookmark Recommendations */}
            {recommendations.length > 0 && (
                <Card
                    title={<span style={{ color: colors.text.primary, fontWeight: 800, fontSize: '18px' }}>✨ Recommended to Bookmark</span>}
                    bordered={false}
                    style={{
                        background: 'linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%)',
                        border: `1px solid ${colors.primary.subtle}`,
                        borderRadius: '24px',
                        boxShadow: shadows.sm,
                        marginBottom: '24px'
                    }}
                    bodyStyle={{ padding: '24px' }}
                >
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {recommendations.map((rec: { id: string; displayName: string; profileImage?: string; category?: string; bio?: string; messageId?: string; creator?: { displayName?: string; profileImage?: string }; reason?: string; content?: string; fullContent?: string }) => (
                            <Card
                                key={rec.messageId}
                                bordered={false}
                                style={{
                                    background: '#ffffff',
                                    border: `1px solid ${colors.gray[100]}`,
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 12px rgba(16, 24, 40, 0.04)'
                                }}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                    <Avatar
                                        size={40}
                                        src={rec.creator?.profileImage ? getImageUrl(rec.creator.profileImage) : undefined}
                                        style={{ background: colors.primary.solid }}
                                    >
                                        {rec.creator?.displayName?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <div style={{ flex: 1 }}>
                                        <Text style={{ color: colors.text.primary, fontWeight: 700 }}>
                                            {rec.creator?.displayName}
                                        </Text>
                                        <div>
                                            <Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {rec.reason}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                                <Text style={{ color: colors.text.secondary, fontSize: '14px', display: 'block', marginBottom: '12px', fontStyle: 'italic', fontWeight: 500 }}>
                                    "{rec.content || rec.fullContent}"
                                </Text>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<BookOutlined />}
                                    onClick={() => handleAddBookmark(rec.messageId!)}
                                    style={{ borderRadius: '8px', fontWeight: 700, height: '36px' }}
                                >
                                    Bookmark This
                                </Button>
                            </Card>
                        ))}
                    </div>
                </Card>
            )}

            {/* Bookmarked Messages */}
            {bookmarks.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {bookmarks.map((bookmark) => (
                        <Card
                            key={bookmark.id}
                            bordered={false}
                            style={{
                                background: '#ffffff',
                                border: `1px solid ${colors.gray[100]}`,
                                borderRadius: '24px',
                                boxShadow: shadows.md,
                            }}
                            actions={[
                                <Button
                                    type="text"
                                    onClick={() => navigate(`/chat/${bookmark.message?.conversation?.creator?.id || bookmark.message?.conversation?.creatorId}`)}
                                    style={{ color: colors.primary.solid, fontWeight: 700 }}
                                >
                                    View Chat
                                </Button>,
                                <Button
                                    type="text"
                                    danger
                                    onClick={() => handleRemoveBookmark(bookmark.messageId)}
                                    icon={<DeleteOutlined />}
                                >
                                    Remove
                                </Button>
                            ]}
                        >
                            {/* Creator Info */}
                            {bookmark.message?.conversation?.creator && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <Avatar
                                        size={48}
                                        src={getImageUrl(bookmark.message.conversation.creator.profileImage)}
                                        style={{ background: colors.primary.solid, border: `2px solid ${colors.primary.subtle}` }}
                                    >
                                        {bookmark.message.conversation.creator.displayName?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Text style={{ color: colors.text.primary, fontWeight: 800, fontSize: '15px' }}>
                                                {bookmark.message.conversation.creator.displayName}
                                            </Text>
                                            {bookmark.message.conversation.creator.isVerified && (
                                                <CheckCircleFilled style={{ color: colors.primary.solid, fontSize: '14px' }} />
                                            )}
                                        </div>
                                        <Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {bookmark.message.conversation.creator.category}
                                        </Text>
                                    </div>
                                </div>
                            )}

                            <Text style={{ color: colors.text.primary, fontSize: '16px', display: 'block', marginBottom: '12px', lineHeight: '1.6', fontWeight: 500 }}>
                                "{bookmark.message?.content || 'Message content unavailable'}"
                            </Text>

                            {bookmark.note && (
                                <div style={{ background: colors.primary.subtle, padding: '12px', borderRadius: '12px', marginTop: '12px', border: `1px solid ${colors.primary.subtle}` }}>
                                    <Text style={{ color: colors.primary.solid, fontSize: '13px', fontWeight: 600 }}>
                                        <strong>Note:</strong> {bookmark.note}
                                    </Text>
                                </div>
                            )}

                            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: colors.text.tertiary, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {new Date(bookmark.createdAt).toLocaleDateString()}
                                </Text>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card
                    bordered={false}
                    style={{
                        background: '#ffffff',
                        border: `1px solid ${colors.gray[100]}`,
                        borderRadius: '24px',
                        padding: '60px 0',
                        textAlign: 'center'
                    }}
                >
                    <Empty
                        description={<span style={{ color: colors.text.tertiary, fontSize: '16px', fontWeight: 500 }}>No bookmarked messages yet</span>}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            )}
        </motion.div>
    );
};

export default UserBookmarks;
