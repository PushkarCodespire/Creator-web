// ===========================================
// CREATOR CHAT VIEW
// Rendered inside Chat.tsx when the logged-in user is a CREATOR.
// Reuses the same ChatInterface.css shell so the layout matches
// the fan-facing chat (dark sidebar + main area + header).
// Read-only: creators cannot reply — their AI clone does.
// Updates live via socket.io on creator:message:new.
// ===========================================

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Spin, Empty, Tag, Input, message as antMessage } from 'antd';
import {
  UserOutlined,
  MenuOutlined,
  CheckCircleFilled,
  MoonOutlined,
  SunOutlined,
  SendOutlined
} from '@ant-design/icons';
import { Info, Radio, Hand, Bot } from 'lucide-react';
import { creatorApi, getImageUrl } from '../../services/api';
import socketService from '../../services/socket';
import '../../pages/ChatInterface.css';

type ConversationMode = 'AI' | 'MANUAL';
type MsgRole = 'USER' | 'ASSISTANT' | 'CREATOR' | 'SYSTEM';

interface ConversationListItem {
  id: string;
  user: { id: string | null; name: string; avatar: string | null };
  isGuest: boolean;
  isActive: boolean;
  mode: ConversationMode;
  messageCount: number;
  lastMessage: { content: string; role: string; createdAt: string } | null;
  lastMessageAt: string | null;
  createdAt: string;
}

interface ConversationDetailMessage {
  id: string;
  role: MsgRole;
  content: string;
  media: any;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  isActive: boolean;
  mode: ConversationMode;
  takenOverAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  lastMessageAt: string | null;
  user: { id: string | null; name: string; avatar: string | null };
  isGuest: boolean;
  creator: { id: string; displayName: string };
}

interface Props {
  currentCreator: {
    id: string;
    displayName?: string;
    profileImage?: string | null;
    isVerified?: boolean;
    pricePerMessage?: number | null;
  } | null;
  currentUser: { name?: string; avatar?: string | null } | null;
}

const formatTime = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
};

const CreatorChatView = ({ currentCreator, currentUser }: Props) => {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<ConversationDetailMessage[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [pulseMap, setPulseMap] = useState<Record<string, number>>({});
  const [togglingMode, setTogglingMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [sendingManual, setSendingManual] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  const selectedIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ---------- Fetching ----------
  const loadConversations = async () => {
    try {
      setLoadingList(true);
      const res = await creatorApi.getMyConversations({ page: 1, limit: 100 });
      if (res.data.success) {
        const list: ConversationListItem[] = res.data.data.conversations || [];
        setConversations(list);
        // Auto-select the most recent conversation on first load
        if (list.length > 0 && !selectedIdRef.current) {
          openConversation(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load creator conversations', err);
    } finally {
      setLoadingList(false);
    }
  };

  const openConversation = async (conversationId: string) => {
    selectedIdRef.current = conversationId;
    setSelectedId(conversationId);
    setDetail(null);
    setMessages([]);
    setManualInput('');
    setLoadingDetail(true);
    try {
      const res = await creatorApi.getMyConversationDetails(conversationId);
      if (res.data.success) {
        setDetail(res.data.data.conversation);
        setMessages(res.data.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load conversation details', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ---------- Manual takeover handlers ----------
  const toggleMode = async () => {
    if (!detail || togglingMode) return;
    const next: ConversationMode = detail.mode === 'AI' ? 'MANUAL' : 'AI';
    setTogglingMode(true);
    try {
      const res = await creatorApi.setConversationMode(detail.id, next);
      if (res.data.success) {
        setDetail((prev) => (prev ? { ...prev, mode: res.data.data.mode } : prev));
        setConversations((prev) =>
          prev.map((c) => (c.id === detail.id ? { ...c, mode: res.data.data.mode } : c))
        );
        antMessage.success(
          next === 'MANUAL'
            ? 'You have taken over this chat. AI is paused.'
            : 'Released back to AI. Your AI clone will respond automatically.'
        );
      }
    } catch (err) {
      console.error('Failed to toggle mode', err);
      antMessage.error('Failed to change mode');
    } finally {
      setTogglingMode(false);
    }
  };

  const generateAiReply = async () => {
    if (!detail || generatingAi) return;
    setGeneratingAi(true);
    try {
      const res = await creatorApi.generateAiReplyForLast(detail.id);
      if (res.data.success) {
        // The new ASSISTANT message will also arrive via the socket and be
        // deduped by id; appending here is just for instant UX.
        const newMsg = res.data.data.message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [
            ...prev,
            {
              id: newMsg.id,
              role: newMsg.role,
              content: newMsg.content,
              media: newMsg.media ?? null,
              createdAt: newMsg.createdAt
            }
          ];
        });
        antMessage.success('AI reply generated');
      }
    } catch (err: any) {
      console.error('Failed to generate AI reply', err);
      antMessage.error(
        err?.response?.data?.error?.message || 'Failed to generate AI reply'
      );
    } finally {
      setGeneratingAi(false);
    }
  };

  const sendManualReply = async () => {
    const text = manualInput.trim();
    if (!text || !detail || sendingManual) return;
    if (detail.mode !== 'MANUAL') {
      antMessage.warning('Take over the conversation first');
      return;
    }
    setSendingManual(true);
    try {
      const res = await creatorApi.replyAsCreator(detail.id, text);
      if (res.data.success) {
        const newMsg = res.data.data.message;
        // Optimistic-ish: backend already emitted the socket event,
        // but append immediately for snappy UX. Dedupe by id.
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [
            ...prev,
            {
              id: newMsg.id,
              role: newMsg.role,
              content: newMsg.content,
              media: newMsg.media ?? null,
              createdAt: newMsg.createdAt
            }
          ];
        });
        setManualInput('');
        // Patch the conversation list (bump to top with new lastMessage)
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === detail.id);
          if (idx === -1) return prev;
          const existing = prev[idx];
          const updated: ConversationListItem = {
            ...existing,
            messageCount: existing.messageCount + 1,
            lastMessage: { content: text, role: 'CREATOR', createdAt: newMsg.createdAt },
            lastMessageAt: newMsg.createdAt
          };
          return [updated, ...prev.filter((_, i) => i !== idx)];
        });
      }
    } catch (err: any) {
      console.error('Failed to send manual reply', err);
      antMessage.error(err?.response?.data?.error?.message || 'Failed to send message');
    } finally {
      setSendingManual(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------- Live updates ----------
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const socket = socketService.connect(token);

    const handleConnect = () => setLiveConnected(true);
    const handleDisconnect = () => setLiveConnected(false);
    if (socket.connected) setLiveConnected(true);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    const handleCreatorMessage = (payload: {
      conversationId: string;
      message: {
        id: string;
        role: 'USER' | 'ASSISTANT' | 'SYSTEM';
        content: string;
        media?: any;
        createdAt: string;
      };
      creatorId: string;
    }) => {
      const { conversationId, message } = payload;

      // Patch the conversation list — bump to top, update lastMessage, increment count
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === conversationId);
        if (idx === -1) {
          // New conversation we don't have yet — refetch the list
          loadConversations();
          return prev;
        }
        const existing = prev[idx];
        const updated: ConversationListItem = {
          ...existing,
          messageCount: existing.messageCount + 1,
          lastMessage: {
            content: message.content,
            role: message.role,
            createdAt: message.createdAt
          },
          lastMessageAt: message.createdAt
        };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });

      // Append to the open conversation if it matches
      if (selectedIdRef.current === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [
            ...prev,
            {
              id: message.id,
              role: message.role,
              content: message.content,
              media: message.media ?? null,
              createdAt: message.createdAt
            }
          ];
        });
      }

      // Visual pulse on the row
      setPulseMap((prev) => ({ ...prev, [conversationId]: Date.now() }));
      setTimeout(() => {
        setPulseMap((prev) => {
          const copy = { ...prev };
          delete copy[conversationId];
          return copy;
        });
      }, 1500);
    };

    socket.on('creator:message:new', handleCreatorMessage);

    // ---------- Mode-changed listener ----------
    // Fires when the mode is changed in another tab, OR when the auto-release
    // on disconnect kicks in. Update the conversation list and the open detail.
    const handleModeChanged = (payload: {
      conversationId: string;
      mode: ConversationMode;
      autoReleased?: boolean;
    }) => {
      const { conversationId, mode, autoReleased } = payload;
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, mode } : c))
      );
      if (selectedIdRef.current === conversationId) {
        setDetail((prev) => (prev ? { ...prev, mode } : prev));
      }
      if (autoReleased && mode === 'AI') {
        antMessage.info('Auto-released to AI: creator went offline');
      }
    };
    socket.on('conversation:mode-changed', handleModeChanged);

    return () => {
      socket.off('creator:message:new', handleCreatorMessage);
      socket.off('conversation:mode-changed', handleModeChanged);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeConv = conversations.find((c) => c.id === selectedId);

  return (
    <div className={`chat-container chat-${theme} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* SIDEBAR */}
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="chat-sidebar-header-new">
          {!sidebarCollapsed ? (
            <>
              <h3 className="sidebar-title">your chats</h3>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Tag
                  color={liveConnected ? 'green' : 'default'}
                  style={{
                    margin: 0,
                    fontSize: 10,
                    padding: '1px 6px',
                    lineHeight: '16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Radio size={10} />
                  {liveConnected ? 'Live' : 'Offline'}
                </Tag>
                <Button
                  type="text"
                  size="small"
                  onClick={() => setSidebarCollapsed(true)}
                  style={{ color: 'var(--chat-text-muted)' }}
                >
                  «
                </Button>
              </div>
            </>
          ) : (
            <Button
              type="text"
              size="small"
              onClick={() => setSidebarCollapsed(false)}
              style={{ color: 'var(--chat-text-muted)' }}
            >
              »
            </Button>
          )}
        </div>

        <div className="chat-history-list">
          {loadingList ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="small" />
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${conv.id === selectedId ? 'active' : ''}`}
                style={{
                  background: pulseMap[conv.id] ? 'rgba(16, 185, 129, 0.12)' : undefined,
                  transition: 'background 0.6s ease'
                }}
                onClick={() => openConversation(conv.id)}
              >
                <Avatar
                  size={28}
                  src={conv.user.avatar ? getImageUrl(conv.user.avatar) : undefined}
                  icon={<UserOutlined />}
                  className="history-avatar"
                />
                {!sidebarCollapsed && (
                  <div
                    className="conversation-info"
                    style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}
                  >
                    <div
                      className="conversation-name"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 6,
                        minWidth: 0
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {conv.user.name || 'Guest'}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--chat-text-muted)', flexShrink: 0 }}>
                        {formatTime(conv.lastMessageAt || conv.createdAt)}
                      </span>
                    </div>
                    <div
                      className="conversation-preview"
                      style={{
                        fontSize: 11,
                        color: 'var(--chat-text-muted)',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-word',
                        maxWidth: '100%'
                      }}
                    >
                      {conv.lastMessage
                        ? `${conv.lastMessage.role === 'ASSISTANT' ? 'AI: ' : ''}${conv.lastMessage.content.replace(/\s+/g, ' ').slice(0, 80)}${conv.lastMessage.content.length > 80 ? '…' : ''}`
                        : 'No messages yet'}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : !sidebarCollapsed ? (
            <div
              className="no-history-msg"
              style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--chat-text-muted)',
                fontSize: 12
              }}
            >
              No conversations yet. When fans chat with your AI clone, they will appear here.
            </div>
          ) : null}
        </div>

        <div className="chat-sidebar-footer">
          <div className="sidebar-profile-section">
            <Avatar
              size={32}
              src={currentUser?.avatar ? getImageUrl(currentUser.avatar) : undefined}
              icon={<UserOutlined />}
            />
            {!sidebarCollapsed && (
              <div className="profile-info">
                <div className="profile-name">{currentUser?.name || 'Creator'}</div>
                <div className="profile-tier">Creator</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {sidebarOpen && <div className="chat-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN */}
      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <Button
              icon={<MenuOutlined />}
              type="text"
              size="large"
              onClick={() => setSidebarOpen(true)}
              className="mobile-only"
            />
            <Avatar
              size={40}
              src={
                activeConv?.user?.avatar
                  ? getImageUrl(activeConv.user.avatar)
                  : currentCreator?.profileImage
                    ? getImageUrl(currentCreator.profileImage)
                    : undefined
              }
              icon={<UserOutlined />}
              className="chat-creator-avatar"
            >
              {activeConv?.user?.name?.[0] || currentCreator?.displayName?.[0]}
            </Avatar>
            <div className="chat-creator-info">
              <div className="chat-creator-name">
                {activeConv ? activeConv.user.name : currentCreator?.displayName}
                {currentCreator?.isVerified && (
                  <CheckCircleFilled
                    style={{ color: '#00A3FF', fontSize: 14, marginLeft: 6 }}
                  />
                )}
              </div>
              <div className="chat-creator-status">
                {activeConv ? (
                  <>
                    Chatting with <strong>{currentCreator?.displayName}</strong> (AI) •{' '}
                    {activeConv.messageCount} messages
                  </>
                ) : (
                  <>Select a conversation to view</>
                )}
              </div>
            </div>
          </div>
          <div className="chat-header-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {detail && (
              <>
                <Tag
                  color={detail.mode === 'MANUAL' ? 'orange' : 'blue'}
                  style={{
                    margin: 0,
                    fontSize: 11,
                    padding: '2px 8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  {detail.mode === 'MANUAL' ? <Hand size={12} /> : <Bot size={12} />}
                  {detail.mode === 'MANUAL' ? 'Manual (you)' : 'AI mode'}
                </Tag>
                <Button
                  type={detail.mode === 'MANUAL' ? 'default' : 'primary'}
                  icon={detail.mode === 'MANUAL' ? <Bot size={14} /> : <Hand size={14} />}
                  loading={togglingMode}
                  onClick={toggleMode}
                  size="small"
                >
                  {detail.mode === 'MANUAL' ? 'Release to AI' : 'Take over'}
                </Button>
              </>
            )}
            <Button
              type="text"
              className="view-profile-link"
              onClick={() => navigate('/creator-dashboard')}
              style={{ color: 'var(--chat-accent)', fontWeight: 600 }}
            >
              Dashboard
            </Button>
            <Button
              className="theme-toggle-btn"
              icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            />
          </div>
        </div>

        {/* Mode notice */}
        {detail && (
          <div
            style={{
              margin: '12px 16px 0',
              padding: '10px 14px',
              borderRadius: 12,
              background:
                detail.mode === 'MANUAL'
                  ? 'rgba(245, 158, 11, 0.10)'
                  : 'rgba(99, 102, 241, 0.08)',
              border:
                detail.mode === 'MANUAL'
                  ? '1px solid rgba(245, 158, 11, 0.35)'
                  : '1px solid rgba(99, 102, 241, 0.25)',
              color: detail.mode === 'MANUAL' ? '#92400E' : '#4338CA',
              fontSize: 13,
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {detail.mode === 'MANUAL' ? <Hand size={16} /> : <Info size={16} />}
            <span>
              {detail.mode === 'MANUAL' ? (
                <>
                  <strong>You are replying manually.</strong> The AI is paused for this
                  conversation. If you go offline, the chat will auto-revert to AI mode.
                </>
              ) : (
                <>
                  <strong>AI mode.</strong> Your AI clone is replying automatically. Click{' '}
                  <strong>Take over</strong> to step in and reply yourself.
                </>
              )}
            </span>
          </div>
        )}

        {/* Messages area */}
        <div className="chat-messages-area">
          {loadingDetail ? (
            <div className="chat-loading-overlay">
              <Spin size="large" tip="Loading conversation..." />
            </div>
          ) : !detail ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Empty
                description={
                  conversations.length === 0
                    ? 'No conversations yet. Fan chats with your AI clone will appear here live.'
                    : 'Select a conversation from the sidebar to view messages.'
                }
              />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Empty description="No messages in this conversation yet." />
            </div>
          ) : (
            <>
              {messages.map((m) => {
                const isAI = m.role === 'ASSISTANT';
                const isManualCreator = m.role === 'CREATOR';
                const isFromCreatorSide = isAI || isManualCreator;
                // bubble styling
                const bubbleBg = isManualCreator
                  ? '#10B981' // green for manual creator
                  : isAI
                    ? 'var(--chat-ai-bubble, #F3F4F6)'
                    : 'var(--chat-user-bubble, #6366F1)';
                const bubbleColor = isManualCreator || !isAI ? '#FFFFFF' : 'var(--chat-text, #0F172A)';
                const labelText = isManualCreator
                  ? `${currentCreator?.displayName} (you)`
                  : isAI
                    ? `${currentCreator?.displayName} (AI)`
                    : detail.user.name;
                return (
                  <div
                    key={m.id}
                    className={`chat-message ${isFromCreatorSide ? 'ai' : 'user'}`}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '12px 20px',
                      flexDirection: isFromCreatorSide ? 'row' : 'row-reverse'
                    }}
                  >
                    <Avatar
                      size={36}
                      src={
                        isFromCreatorSide
                          ? currentCreator?.profileImage
                            ? getImageUrl(currentCreator.profileImage)
                            : undefined
                          : detail.user.avatar
                            ? getImageUrl(detail.user.avatar)
                            : undefined
                      }
                      icon={isManualCreator ? <Hand size={16} /> : <UserOutlined />}
                      style={{
                        flexShrink: 0,
                        background: isManualCreator ? '#10B981' : undefined
                      }}
                    >
                      {isFromCreatorSide
                        ? currentCreator?.displayName?.[0]
                        : detail.user.name?.[0] || 'G'}
                    </Avatar>
                    <div style={{ maxWidth: '70%' }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--chat-text-muted)',
                          marginBottom: 4,
                          textAlign: isFromCreatorSide ? 'left' : 'right'
                        }}
                      >
                        {labelText}
                        {' • '}
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div
                        style={{
                          background: bubbleBg,
                          color: bubbleColor,
                          padding: '12px 16px',
                          borderRadius: 16,
                          fontSize: 14,
                          lineHeight: 1.55,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          border: isManualCreator ? '1px solid #059669' : undefined
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Unanswered fan message → "Generate AI reply" button.
                  Only shows when:
                    - The latest message is from USER (fan)
                    - Conversation is in AI mode (in MANUAL the creator is replying themselves) */}
              {detail.mode === 'AI' &&
                messages.length > 0 &&
                messages[messages.length - 1].role === 'USER' && (
                  <div
                    style={{
                      margin: '12px 20px',
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px dashed rgba(99, 102, 241, 0.40)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#4338CA' }}>
                      <Bot size={18} />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        1 unanswered message — your AI didn't reply (likely arrived during a takeover).
                      </span>
                    </div>
                    <Button
                      type="primary"
                      icon={<Bot size={14} />}
                      loading={generatingAi}
                      onClick={generateAiReply}
                    >
                      Generate AI reply
                    </Button>
                  </div>
                )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Footer: manual reply input (when MANUAL) OR read-only notice (when AI) */}
        {detail && detail.mode === 'MANUAL' ? (
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--chat-border, rgba(0,0,0,0.08))',
              background: 'rgba(16, 185, 129, 0.04)'
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <Input.TextArea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    sendManualReply();
                  }
                }}
                placeholder="Type your reply as the real creator..."
                autoSize={{ minRows: 1, maxRows: 5 }}
                disabled={sendingManual}
                style={{ flex: 1, borderRadius: 12 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={sendingManual}
                onClick={sendManualReply}
                disabled={!manualInput.trim()}
                style={{ background: '#10B981', borderColor: '#10B981' }}
              >
                Send
              </Button>
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: 'var(--chat-text-muted)',
                textAlign: 'center'
              }}
            >
              You are replying manually. The fan will see your message immediately. Press{' '}
              <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for newline.
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '16px 20px',
              textAlign: 'center',
              color: 'var(--chat-text-muted)',
              borderTop: '1px solid var(--chat-border, rgba(0,0,0,0.08))',
              fontSize: 13
            }}
          >
            Your AI clone is handling this conversation. Click <strong>Take over</strong> in the
            header to reply manually.
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorChatView;
