import React, { useState, useEffect } from 'react';
import { Card, Empty, Typography, Button, Row, Col, Select, Input, DatePicker, Avatar, Tag, Space } from 'antd';
import { DeleteOutlined, BookOutlined, SearchOutlined, FilterOutlined, StarFilled, CheckCircleFilled } from '@ant-design/icons';
import { bookmarkApi, getImageUrl } from '../../services/api';
import { motion } from 'framer-motion';
import DashboardContentLoader from '../../components/common/DashboardContentLoader';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const UserBookmarks = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    // Filter states
    const [search, setSearch] = useState('');
    const [creatorFilter, setCreatorFilter] = useState<string | undefined>(undefined);
    const [conversationFilter, setConversationFilter] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<[any, any] | null>(null);
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
            const params: any = {};
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
            console.error('Failed to fetch bookmarks:', err);
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
            console.error('Failed to fetch recommendations:', err);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const handleRemoveBookmark = async (messageId: string) => {
        try {
            await bookmarkApi.removeBookmark(messageId);
            setBookmarks(prev => prev.filter(b => b.messageId !== messageId));
        } catch (err) {
            console.error('Failed to remove bookmark:', err);
        }
    };

    const handleAddBookmark = async (messageId: string) => {
        try {
            await bookmarkApi.addBookmark(messageId);
            // Refresh recommendations after adding
            fetchRecommendations();
            fetchBookmarks();
        } catch (err) {
            console.error('Failed to add bookmark:', err);
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
                <Title level={2} style={{ color: '#fff', marginBottom: '4px', fontWeight: 800 }}>
                    <BookOutlined /> Bookmarks
                </Title>
                <Text style={{ color: '#94A3B8', fontSize: '16px' }}>
                    Your saved messages and important notes
                </Text>
            </div>

            {/* Search and Filters */}
            <Card
                style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
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
                            prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
                            style={{ borderRadius: '12px' }}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                background: showFilters ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                borderRadius: '12px'
                            }}
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                    </Col>

                    {showFilters && (
                        <>
                            <Col xs={24} sm={8}>
                                <Select
                                    placeholder="Filter by Creator"
                                    allowClear
                                    size="large"
                                    value={creatorFilter}
                                    onChange={setCreatorFilter}
                                    style={{ width: '100%' }}
                                >
                                    {uniqueCreators.map((creator: any) => (
                                        <Option key={creator.id} value={creator.id}>
                                            {creator.displayName}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Select
                                    placeholder="Filter by Conversation"
                                    allowClear
                                    size="large"
                                    value={conversationFilter}
                                    onChange={setConversationFilter}
                                    style={{ width: '100%' }}
                                >
                                    {uniqueConversations.map((conv: any) => (
                                        <Option key={conv.id} value={conv.id}>
                                            {conv.creator?.displayName || 'Unknown'}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={24} sm={8}>
                                <RangePicker
                                    size="large"
                                    value={dateRange}
                                    onChange={(dates) => setDateRange(dates as any)}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col xs={24}>
                                <Button
                                    onClick={handleResetFilters}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#94A3B8',
                                        borderRadius: '12px'
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
                    title={<span style={{ color: '#fff', fontWeight: 700 }}>✨ Recommended to Bookmark</span>}
                    style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '24px',
                        marginBottom: '24px'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {recommendations.map((rec: any) => (
                            <Card
                                key={rec.messageId}
                                style={{
                                    background: 'rgba(30, 41, 59, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '16px'
                                }}
                                bodyStyle={{ padding: '16px' }}
                            >
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                    <Avatar
                                        size={40}
                                        src={rec.creator?.profileImage ? getImageUrl(rec.creator.profileImage) : undefined}
                                        style={{ background: '#6366F1' }}
                                    >
                                        {rec.creator?.displayName?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <div style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', fontWeight: 600 }}>
                                            {rec.creator?.displayName}
                                        </Text>
                                        <div>
                                            <Text style={{ color: '#94A3B8', fontSize: '12px' }}>
                                                {rec.reason}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                                <Text style={{ color: '#E2E8F0', fontSize: '14px', display: 'block', marginBottom: '12px' }}>
                                    "{rec.content || rec.fullContent}"
                                </Text>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<BookOutlined />}
                                    onClick={() => handleAddBookmark(rec.messageId)}
                                    style={{ borderRadius: '8px' }}
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
                            style={{
                                background: 'rgba(30, 41, 59, 0.4)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '24px',
                            }}
                            actions={[
                                <Button
                                    type="text"
                                    onClick={() => navigate(`/chat/${bookmark.message?.conversation?.creatorId}`)}
                                    style={{ color: '#818CF8' }}
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
                                        style={{ background: '#6366F1' }}
                                    >
                                        {bookmark.message.conversation.creator.displayName?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Text style={{ color: '#fff', fontWeight: 600 }}>
                                                {bookmark.message.conversation.creator.displayName}
                                            </Text>
                                            {bookmark.message.conversation.creator.isVerified && (
                                                <CheckCircleFilled style={{ color: '#3B82F6', fontSize: '14px' }} />
                                            )}
                                        </div>
                                        <Text style={{ color: '#94A3B8', fontSize: '12px' }}>
                                            {bookmark.message.conversation.creator.category}
                                        </Text>
                                    </div>
                                </div>
                            )}

                            <Text style={{ color: '#fff', fontSize: '16px', display: 'block', marginBottom: '12px', lineHeight: '1.6' }}>
                                "{bookmark.message?.content || 'Message content unavailable'}"
                            </Text>

                            {bookmark.note && (
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '12px', marginTop: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                    <Text style={{ color: '#C7D2FE', fontSize: '13px' }}>
                                        <strong>Note:</strong> {bookmark.note}
                                    </Text>
                                </div>
                            )}

                            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: '#64748B', fontSize: '12px' }}>
                                    Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                                </Text>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card
                    style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '24px',
                        padding: '40px 0'
                    }}
                >
                    <Empty
                        description={<span style={{ color: '#94A3B8', fontSize: '16px' }}>No bookmarked messages yet</span>}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            )}
        </motion.div>
    );
};

export default UserBookmarks;
