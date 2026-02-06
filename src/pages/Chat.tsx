// ===========================================
// PREMIUM FLAGSHIP CHAT INTERFACE
// Complete rebuild with WebSocket & Theming
// ===========================================

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, Avatar, message as antMessage, Spin } from 'antd';
import {
  SendOutlined,
  MenuOutlined,
  SunOutlined,
  MoonOutlined,
  SmileOutlined,
  PaperClipOutlined,
  ArrowDownOutlined,
  CheckCircleFilled,
  AudioOutlined,
  CameraOutlined,
  FileImageOutlined,
  CloseOutlined,
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  VerticalRightOutlined,
  VerticalLeftOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { startConversation, fetchConversation, sendMessage, addMessage } from '../store/slices/chatSlice';
import { creatorApi, chatApi, getImageUrl } from '../services/api';
import { Creator, Message } from '../types';
import { RateLimitStatus } from '../types/chat';
import socketService from '../services/socket';
import UpgradeModal from '../components/Chat/UpgradeModal';
import GuestLimitModal from '../components/Chat/GuestLimitModal';
import StreamingMessage from '../components/Chat/StreamingMessage';
// uuid import removed
import './ChatInterface.css';

const Chat = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { messages, isSending } = useSelector((state: RootState) => state.chat);

  // State
  const [creator, setCreator] = useState<Creator | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isCreatorOnline, setIsCreatorOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [loadingCreator, setLoadingCreator] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Control mobile drawer / wide sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // ChatGPT-style collapse
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New state for streaming and rate limiting
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isAIStreaming, setIsAIStreaming] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Initialize chat
  useEffect(() => {
    // If not authenticated, ensure we have a guest ID
    if (!isAuthenticated) {
      const existingGuestId = localStorage.getItem('guestId');
      if (!existingGuestId) {
        // Generate a simple ID if uuid package isn't available or just use random string
        const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('guestId', newGuestId);
      }
    }

    if (creatorId) {
      initializeChat();
    }
    return () => {
      cleanup();
    };
  }, [creatorId, isAuthenticated]);

  const initializeChat = async () => {
    try {
      setLoadingCreator(true);

      // Fetch creator data
      const creatorResponse = await creatorApi.getById(creatorId!);
      setCreator(creatorResponse.data.data);

      // Get or create conversation (works for guests too now)
      const convResponse = await chatApi.createConversation(creatorId!);
      const convId = convResponse.data.data.conversation.id;
      setConversationId(convId);

      // Load messages
      await loadMessages(convId);

      // Get rate limit status
      await fetchRateLimitStatus();

      // Initialize Socket.io
      const token = localStorage.getItem('token');
      // For guests, we might need a different auth mechanism for sockets or just public room
      // Current socket service likely requires token. 
      // If token exists, connect. If not, maybe skip socket or use guest ID handshake if supported.
      if (token) {
        socketService.connect(token);
        socketService.joinConversation(convId);
        setupSocketListeners();
      } else {
        // Simple polling fallback or partial functionality for guests if sockets require auth
        // For now, let's assume socket requires auth and guests rely on request/response
        // OR if backend supports guest socket, implement here.
      }

    } catch (error: any) {
      console.error('Failed to initialize chat:', error);
      antMessage.error('Failed to load chat');
    } finally {
      setLoadingCreator(false);
    }
  };

  const cleanup = () => {
    if (conversationId) {
      socketService.leaveConversation(conversationId);
    }
    socketService.removeAllListeners();
  };

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Handle scroll for "scroll to bottom" button
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
    };

    const scrollEl = scrollContainerRef.current;
    scrollEl?.addEventListener('scroll', handleScroll);
    return () => scrollEl?.removeEventListener('scroll', handleScroll);
  }, []);

  const loadMessages = async (convId: string) => {
    try {
      setLoadingMessages(true);
      await dispatch(fetchConversation(convId)).unwrap();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchRateLimitStatus = async () => {
    try {
      // Only fetch if authenticated or if endpoint supports public access via guest ID
      // Assuming endpoint handles guest ID via headers
      const response = await chatApi.getRateLimitStatus();
      setRateLimitStatus(response.data.data);

      const remaining = response.data.data?.limits?.daily?.remaining;
      if (remaining !== undefined && remaining <= 2 && remaining > 0) {
        antMessage.warning(`You have ${remaining} message${remaining === 1 ? '' : 's'} remaining today`);
      }
    } catch (error) {
      console.error('Failed to fetch rate limit status:', error);
    }
  };

  const setupSocketListeners = () => {
    socketService.onMessageStream((data) => {
      if (data.conversationId === conversationId) {
        setStreamingMessage(data.accumulated);
        setIsAIStreaming(true);
      }
    });

    socketService.onMessageComplete((data) => {
      if (data.conversationId === conversationId) {
        dispatch(addMessage(data.message as any));
        setStreamingMessage('');
        setIsAIStreaming(false);
        fetchRateLimitStatus();
      }
    });

    socketService.onMessageError((data) => {
      if (data.conversationId === conversationId) {
        setIsAIStreaming(false);
        setStreamingMessage('');
        antMessage.error(data.error.userMessage || 'Failed to send message');
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !conversationId) return;

    // Check rate limit locally if data available
    if (rateLimitStatus?.limits?.daily?.remaining !== undefined && rateLimitStatus.limits.daily.remaining <= 0) {
      if (isAuthenticated) {
        setShowUpgradeModal(true);
      } else {
        setShowGuestLimitModal(true);
      }
      return;
    }

    try {
      const messageContent = inputMessage;
      setInputMessage('');

      // Optimistic UI update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        role: 'USER',
        createdAt: new Date().toISOString(),
        conversationId: conversationId
      };
      dispatch(addMessage(tempMessage));

      // Send to server
      const response = await chatApi.sendMessage(conversationId, messageContent);

      // If backend returns AI response immediately (no socket/guest mode), add it
      if (response.data?.data?.aiMessage) {
        dispatch(addMessage(response.data.data.aiMessage));
      }

      // Update rate limit status
      if (response.data.data.remainingMessages !== undefined) {
        // Manually update local state if server returns it, or fetch fresh
        // await fetchRateLimitStatus(); 
        // We can just trust the server response for faster UI
        setRateLimitStatus(prev => prev ? ({
          ...prev,
          limits: {
            ...prev.limits,
            daily: {
              ...prev.limits?.daily,
              remaining: response.data.data.remainingMessages
            }
          }
        } as any) : null);
      } else {
        await fetchRateLimitStatus();
      }

    } catch (error: any) {
      console.error('Failed to send message:', error);

      // Handle rate limit error
      if (error.response?.status === 429) {
        if (isAuthenticated) {
          setShowUpgradeModal(true);
        } else {
          setShowGuestLimitModal(true);
        }
        antMessage.error('Message limit reached');
      } else if (error.response?.status === 403) {
        antMessage.error('Your account is suspended');
      } else if (error.response?.status === 400) {
        antMessage.error('Message contains inappropriate content');
      } else {
        antMessage.error('Failed to send message');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual voice recording logic
    antMessage.info(isRecording ? 'Recording stopped' : 'Recording started');
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (loadingCreator) {
    return (
      <div className={`chat-container chat-${theme}`}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <Spin size="large" />
          <div style={{ color: 'var(--chat-text-muted)', fontSize: '16px' }}>
            Loading chat...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-container chat-${theme} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* SIDEBAR - ChatGPT Style */}
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="chat-sidebar-header-new">
          {!sidebarCollapsed ? (
            <>
              <h3 className="sidebar-title">ai-creator</h3>
              <Button
                icon={<VerticalLeftOutlined />}
                type="text"
                className="sidebar-toggle-btn"
                onClick={() => setSidebarCollapsed(true)}
              />
            </>
          ) : (
            <div className="collapsed-header-icons">
              <Button
                icon={<VerticalRightOutlined />}
                type="text"
                className="sidebar-toggle-btn"
                onClick={() => setSidebarCollapsed(false)}
              />
            </div>
          )}
        </div>

        <div className="chat-sidebar-actions">
          <Button
            type="default"
            icon={<PlusOutlined />}
            className="new-chat-btn"
            block={!sidebarCollapsed}
            onClick={() => navigate('/creators')}
          >
            {!sidebarCollapsed && 'New chat'}
          </Button>

          <div className="sidebar-search-container">
            {sidebarCollapsed ? (
              <Button icon={<SearchOutlined />} type="text" className="collapsed-search-btn" />
            ) : (
              <Input
                prefix={<SearchOutlined style={{ color: 'var(--chat-text-muted)' }} />}
                placeholder="Search chats"
                className="sidebar-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="chat-sidebar-history">
          {!sidebarCollapsed && <div className="history-label">Previous 7 Days</div>}
          <div className="conversation-item active">
            <Avatar
              size={28}
              src={creator?.profileImage ? getImageUrl(creator.profileImage) : undefined}
              icon={!creator?.profileImage && <UserOutlined />}
              className="history-avatar"
            />
            {!sidebarCollapsed && (
              <div className="conversation-info">
                <div className="conversation-name">{creator?.displayName || 'Active Chat'}</div>
              </div>
            )}
          </div>
        </div>

        <div className="chat-sidebar-footer">
          <div className="sidebar-profile-section">
            <Avatar
              size={32}
              src={user?.avatar ? getImageUrl(user.avatar) : undefined}
              icon={<UserOutlined />}
            />
            {!sidebarCollapsed && (
              <div className="profile-info">
                <div className="profile-name">{user?.name || 'Guest User'}</div>
                <div className="profile-tier">{isAuthenticated ? 'Free Tier' : 'Guest'}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay - Mobile */}
      {sidebarOpen && (
        <div className="chat-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN CHAT */}
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
              src={creator?.profileImage ? getImageUrl(creator.profileImage) : undefined}
              icon={!creator?.profileImage && <UserOutlined />}
              className="chat-creator-avatar"
            >
              {creator?.displayName?.[0]}
            </Avatar>
            <div className="chat-creator-info">
              <div className="chat-creator-name">
                {creator?.displayName}
                {creator?.isVerified && (
                  <CheckCircleFilled style={{ color: '#00A3FF', fontSize: '14px', marginLeft: '6px' }} />
                )}
              </div>
              <div className="chat-creator-status">
                <span className={`status-dot ${isCreatorOnline ? 'online' : 'offline'}`}></span>
                {isCreatorOnline ? 'Online' : 'Offline'} • ₹{creator?.pricePerMessage || 50}/msg
              </div>
            </div>
          </div>
          <div className="chat-header-right">
            <Button
              type="text"
              className="view-profile-link"
              onClick={() => navigate(`/creator/${creator?.id}`)}
              style={{ color: 'var(--chat-accent)', fontWeight: 600, marginRight: '16px' }}
            >
              View Creator Profile
            </Button>
            <Button
              className="theme-toggle-btn"
              icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            />
          </div>
        </div>

        {/* Messages Area */}
        <div className="chat-messages-area" ref={scrollContainerRef}>
          {messages.length === 0 ? (
            <div className="chat-empty-state">
              <Avatar
                size={100}
                src={creator?.profileImage ? getImageUrl(creator.profileImage) : undefined}
                className="chat-empty-avatar"
              >
                {creator?.displayName?.[0]}
              </Avatar>
              <h2 className="chat-empty-title">
                Hi, I'm {creator?.displayName?.split(' ')[0]}! 👋
              </h2>
              <p className="chat-empty-subtitle">
                Ask me anything about {creator?.category || 'my expertise'}. I'm here to help you 24/7.
              </p>
              <div className="chat-suggestions">
                <div className="chat-suggestions-title">💡 Try asking:</div>
                <button
                  className="chat-suggestion-btn"
                  onClick={() => setInputMessage("What services do you offer?")}
                >
                  What services do you offer?
                </button>
                <button
                  className="chat-suggestion-btn"
                  onClick={() => setInputMessage("How can you help me?")}
                >
                  How can you help me?
                </button>
                <button
                  className="chat-suggestion-btn"
                  onClick={() => setInputMessage("What's your experience?")}
                >
                  What's your experience?
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isUser = msg.role === 'USER';
                return (
                  <div key={msg.id || index} className={`message-wrapper ${isUser ? 'user' : 'ai'}`}>
                    <Avatar
                      size={40}
                      src={isUser
                        ? (user?.avatar ? getImageUrl(user.avatar) : undefined)
                        : (creator?.profileImage ? getImageUrl(creator.profileImage) : undefined)
                      }
                      className="message-avatar"
                    >
                      {isUser ? (user?.name?.[0] || 'G') : creator?.displayName?.[0]}
                    </Avatar>
                    <div className="message-content-wrapper">
                      <div className="message-bubble">
                        {msg.content}
                      </div>
                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && !isAIStreaming && (
                <div className="message-wrapper ai">
                  <Avatar
                    size={40}
                    src={creator?.profileImage ? getImageUrl(creator.profileImage) : undefined}
                    className="message-avatar"
                  >
                    {creator?.displayName?.[0]}
                  </Avatar>
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Streaming AI Response */}
              {isAIStreaming && streamingMessage && (
                <StreamingMessage
                  content={streamingMessage}
                  creatorAvatar={creator?.profileImage ? getImageUrl(creator.profileImage) : undefined}
                  creatorName={creator?.displayName}
                />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <Button
            className="scroll-to-bottom"
            icon={<ArrowDownOutlined />}
            onClick={scrollToBottom}
            shape="circle"
            type="primary"
            size="large"
            title="Scroll to bottom"
          />
        )}

        {/* Input Area */}
        <div className="chat-input-wrapper">
          {/* File Preview */}
          {selectedFiles.length > 0 && (
            <div className="chat-file-preview">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-preview-item">
                  <span>{file.name}</span>
                  <Button
                    icon={<CloseOutlined />}
                    type="text"
                    size="small"
                    onClick={() => removeFile(index)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="chat-input-container">
            {/* Hidden file inputs moved for context */}
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              multiple
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              multiple
            />

            {/* Left '+' Icon with Dropdown Menu (Simplified for now) */}
            <div className="chat-input-left">
              <Button
                className="media-add-btn"
                icon={<PlusOutlined />}
                type="text"
                onClick={() => {
                  // Triggering image upload as the '+' action for now
                  imageInputRef.current?.click();
                }}
              />
            </div>

            <Input.TextArea
              className="chat-input-textarea"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything"
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={isSending}
            />

            {/* Internal Right Icons */}
            <div className="chat-input-right-internal">
              <Button
                className={`voice-inner-btn ${isRecording ? 'recording' : ''}`}
                icon={<AudioOutlined />}
                type="text"
                onClick={handleVoiceRecord}
                title={isRecording ? 'Stop recording' : 'Voice message'}
              />
              <Button
                className="send-inner-btn"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!inputMessage.trim() && selectedFiles.length === 0}
                title="Send message"
              />
            </div>
          </div>
          <div className="chat-input-meta">
            <span className="chat-premium-notice">
              🔒 Secure & encrypted
              {rateLimitStatus?.limits?.daily && (
                <>
                  {' • '}
                  <span style={{
                    color: (rateLimitStatus.limits.daily.remaining || 0) <= 2 ? '#F59E0B' : '#10B981',
                    fontWeight: 600
                  }}>
                    {rateLimitStatus.limits.daily.remaining || 0} message{(rateLimitStatus.limits.daily.remaining || 0) === 1 ? '' : 's'} remaining today
                  </span>
                  {(rateLimitStatus.limits.daily.remaining || 0) <= 2 && isAuthenticated && rateLimitStatus.subscription?.plan === 'FREE' && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setShowUpgradeModal(true)}
                      style={{ padding: '0 8px', height: 'auto', color: '#6366F1' }}
                    >
                      Upgrade for unlimited
                    </Button>
                  )}
                  {/* For guests, we might not want to show Upgrade link, but maybe "Register" */}
                  {!isAuthenticated && (rateLimitStatus.limits.daily.remaining || 0) <= 2 && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setShowGuestLimitModal(true)}
                      style={{ padding: '0 8px', height: 'auto', color: '#6366F1' }}
                    >
                      Register for unlimited
                    </Button>
                  )}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        remainingMessages={rateLimitStatus?.limits?.daily?.remaining || 0}
      />
      <GuestLimitModal
        visible={showGuestLimitModal}
        onClose={() => setShowGuestLimitModal(false)}
      />
    </div>
  );
};

export default Chat;
