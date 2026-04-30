// ===========================================
// CREATOR CARD COMPONENT
// Premium UI Card for displaying creator info
// ===========================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Tooltip } from 'antd';
import {
    CheckCircleFilled,
    MessageOutlined,
    StarFilled,
    ThunderboltFilled
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Creator } from '../../types';
import { colors, shadows } from '../../styles/tokens';
import { getImageUrl } from '../../services/api';

interface CreatorCardProps {
    creator: Creator;
    layout?: 'grid' | 'carousel' | 'list';
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, layout = 'grid' }) => {
    const navigate = useNavigate();
    const isList = layout === 'list';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={isList ? { x: 8 } : { y: -8 }}
            transition={{ duration: 0.3 }}
            style={{
                flex: layout === 'carousel' ? '0 0 auto' : undefined,
                width: layout === 'carousel' ? 280 : '100%',
                height: '100%',
                scrollSnapAlign: layout === 'carousel' ? 'start' : undefined,
            }}
        >
            <div
                style={{
                    background: '#ffffff',
                    borderRadius: isList ? 20 : 24,
                    padding: isList ? '16px 24px' : '24px 20px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: isList ? 'row' : 'column',
                    alignItems: 'center',
                    textAlign: isList ? 'left' : 'center',
                    position: 'relative',
                    border: '1px solid rgba(229, 231, 235, 0.5)',
                    boxShadow: isList ? '0 4px 20px -5px rgba(0,0,0,0.05)' : '0 10px 40px -10px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    gap: isList ? 24 : 0,
                }}
                onClick={() => navigate(`/creator/${creator.id}`)}
            >
                {/* Decorative Background Blur - Only for grid */}
                {!isList && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 100,
                        background: `linear-gradient(180deg, ${colors.primary.subtle} 0%, rgba(255,255,255,0) 100%)`,
                        zIndex: 0,
                    }} />
                )}

                {/* Rating Badge */}
                <div style={{
                    position: isList ? 'static' : 'absolute',
                    top: isList ? undefined : 16,
                    right: isList ? undefined : 16,
                    zIndex: 2,
                    display: 'flex',
                    order: isList ? 4 : undefined
                }}>
                    <div style={{
                        background: isList ? colors.gray[50] : 'rgba(255, 255, 255, 0.9)',
                        padding: '4px 8px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: isList ? 'none' : shadows.sm,
                        color: colors.text.primary,
                        border: isList ? `1px solid ${colors.gray[100]}` : 'none'
                    }}>
                        <StarFilled style={{ color: '#F59E0B' }} />
                        {creator.rating ? Number(creator.rating).toFixed(1) : 'New'}
                    </div>
                </div>

                {/* Avatar */}
                <div style={{ position: 'relative', zIndex: 1, marginBottom: isList ? 0 : 16, flexShrink: 0 }}>
                    <div style={{
                        padding: 3,
                        background: '#fff',
                        borderRadius: '50%',
                        boxShadow: shadows.md,
                        display: 'inline-block'
                    }}>
                        <Avatar
                            src={creator.profileImage ? getImageUrl(creator.profileImage) : undefined}
                            size={isList ? 64 : 96}
                            style={{
                                border: `2px solid ${colors.gray[100]}`,
                                backgroundColor: !creator.profileImage ? colors.primary.solid : undefined,
                                color: !creator.profileImage ? '#fff' : undefined,
                                fontWeight: 600
                            }}
                        >
                            {creator.displayName?.[0]?.toUpperCase()}
                        </Avatar>
                    </div>
                    {creator.isVerified && (
                        <Tooltip title="Verified Creator">
                            <div style={{
                                position: 'absolute',
                                bottom: isList ? 0 : 4,
                                right: isList ? 0 : 4,
                                background: '#fff',
                                borderRadius: '50%',
                                width: isList ? 20 : 24,
                                height: isList ? 20 : 24,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: shadows.sm,
                            }}>
                                <CheckCircleFilled style={{ color: colors.primary.solid, fontSize: isList ? 14 : 16 }} />
                            </div>
                        </Tooltip>
                    )}
                </div>

                {/* Content Wrapper for List */}
                <div style={{
                    flex: isList ? 1 : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isList ? 4 : 0
                }}>
                    <h3 style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: colors.text.primary,
                        marginBottom: isList ? 0 : 4,
                        lineHeight: 1.2
                    }}>
                        {creator.displayName}
                    </h3>

                    <p style={{
                        fontSize: 14,
                        color: colors.text.secondary,
                        marginBottom: isList ? 8 : 16,
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: isList ? 1 : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: isList ? 'auto' : 42,
                        maxWidth: isList ? '500px' : '100%'
                    }}>
                        {creator.tagline || `Chat with my AI twin to learn about ${creator.category || 'anything'}.`}
                    </p>

                    {/* Tags/Stats */}
                    <div style={{
                        display: 'flex',
                        justifyContent: isList ? 'flex-start' : 'center',
                        gap: 12,
                        marginBottom: isList ? 0 : 20,
                        width: '100%'
                    }}>
                        <Badge icon={<ThunderboltFilled />} text={`${creator.totalChats || 0} chats`} color={colors.primary.solid} bg={colors.primary.light} />
                        {creator.category && <Badge text={creator.category} bg={colors.gray[100]} />}
                    </div>
                </div>

                {/* Action Button */}
                <div style={{
                    marginTop: isList ? 0 : 'auto',
                    width: isList ? 'auto' : '100%',
                    marginLeft: isList ? 'auto' : 0,
                    order: isList ? 5 : undefined
                }}>
                    <Button
                        type="primary"
                        shape="round"
                        size={isList ? "middle" : "large"}
                        icon={<MessageOutlined />}
                        style={{
                            width: isList ? 'auto' : '100%',
                            background: colors.primary.solid,
                            boxShadow: `0 8px 20px -4px ${colors.primary.light}`,
                            border: 'none',
                            height: isList ? 40 : 44,
                            fontSize: isList ? 14 : 15,
                            fontWeight: 600,
                            padding: isList ? '0 24px' : undefined
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/chat/${creator.id}`);
                        }}
                    >
                        Start Chat
                    </Button>
                </div>

            </div>
        </motion.div>
    );
};

const Badge = ({ icon, text, color, bg }: { icon?: React.ReactNode, text: string, color?: string, bg?: string }) => (
    <div style={{
        padding: '4px 10px',
        borderRadius: 8,
        background: bg || 'rgba(239, 246, 255, 0.6)',
        color: color || colors.gray[600],
        fontSize: 12,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 4
    }}>
        {icon}
        {text}
    </div>
);

export default CreatorCard;
