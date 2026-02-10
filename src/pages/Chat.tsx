// ===========================================
// PREMIUM FLAGSHIP CHAT INTERFACE
// Complete rebuild with WebSocket & Theming
// ===========================================

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, Avatar, message as antMessage, Spin, Modal, Rate } from 'antd';
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
  VerticalLeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HistoryOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { startConversation, fetchConversation, sendMessage, addMessage } from '../store/slices/chatSlice';
import { creatorApi, chatApi, getImageUrl, reviewApi, subscriptionApi } from '../services/api';
import { Creator, Message, Review } from '../types';
import { RateLimitStatus } from '../types/chat';
import socketService from '../services/socket';
import UpgradeModal from '../components/Chat/UpgradeModal';
import GuestLimitModal from '../components/Chat/GuestLimitModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import StreamingMessage from '../components/Chat/StreamingMessage';
import MediaMessage from '../components/Chat/MediaMessage';
// uuid import removed
import './ChatInterface.css';

const getNextGuestSequence = () => {
  const key = 'guestIdSequence';
  const current = Number(localStorage.getItem(key) || '0');
  const next = current + 1;
  localStorage.setItem(key, String(next));
  return next;
};

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
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768); // Open by default on desktop, closed on mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // ChatGPT-style collapse - Default to true as per request
  const [allConversations, setAllConversations] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [skipReviewForSession, setSkipReviewForSession] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [tokenGrant, setTokenGrant] = useState<number | null>(null);
  const [tokensPerMessage, setTokensPerMessage] = useState<number | null>(null);
  const [showTokenRenewModal, setShowTokenRenewModal] = useState(false);

  // New state for streaming and rate limiting
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState(''); // Keep streaming message separate
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize chat
  useEffect(() => {
    // If not authenticated, ensure we have a guest ID
    if (!isAuthenticated) {
      const existingGuestId = localStorage.getItem('guestId');
      if (!existingGuestId) {
        // Generate a simple deterministic guest ID for anonymous sessions
        const newGuestId = `guest_${Date.now()}_${getNextGuestSequence()}`;
        localStorage.setItem('guestId', newGuestId);
      }
    }

    if (creatorId) {
      initializeChat();
    }

    if (isAuthenticated) {
      loadHistory();
    }

    return () => {
      cleanup();
    };
  }, [creatorId, isAuthenticated]);

  useEffect(() => {
    if (!creatorId) return;
    setSkipReviewForSession(false);
    setPendingNavigation(null);

    if (isAuthenticated) {
      loadMyReview();
    } else {
      setMyReview(null);
      setReviewRating(5);
      setReviewText('');
    }
  }, [creatorId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setTokenBalance(null);
      setTokenGrant(null);
      setTokensPerMessage(null);
      return;
    }

    const loadTokenInfo = async () => {
      try {
        const response = await subscriptionApi.getDetails();
        const data = response?.data?.data || {};
        const tokens = data?.usage?.tokens;
        if (tokens) {
          setTokenBalance(tokens.balance ?? null);
          setTokenGrant(tokens.grant ?? null);
          setTokensPerMessage(tokens.perMessage ?? null);
        } else if (data?.subscription) {
          setTokenBalance(data.subscription?.tokenBalance ?? null);
          setTokenGrant(data.subscription?.tokenGrant ?? null);
        }
      } catch (error) {
        // Token info is optional; ignore errors here
      }
    };

    loadTokenInfo();
  }, [isAuthenticated]);

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
      conversationIdRef.current = convId;

      // Load messages
      await loadMessages(convId);

      // Get rate limit status
      await fetchRateLimitStatus();

      // Initialize Socket.io
      const token = localStorage.getItem('token');
      const guestId = localStorage.getItem('guestId') || undefined;

      socketService.connect(token);
      socketService.joinConversation(convId, user?.id, guestId);
      setupSocketListeners();

    } catch (error: any) {
      console.error('Failed to initialize chat:', error);
      antMessage.error('Failed to load chat');
    } finally {
      setLoadingCreator(false);
    }
  };

  const loadHistory = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingHistory(true);
      const response = await chatApi.getUserConversations({ limit: 50 });
      setAllConversations(response.data.data.conversations || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const cleanup = () => {
    if (conversationIdRef.current) {
      socketService.leaveConversation(conversationIdRef.current);
    }
    socketService.removeAllListeners();
  };

  const loadMyReview = async () => {
    if (!creatorId || !isAuthenticated) return;
    try {
      const response = await reviewApi.getMyReview(creatorId);
      const payload = response?.data?.data || response?.data || {};
      const review = payload.review || payload.data || payload;
      setMyReview(review || null);
      setReviewRating(review?.rating ?? 5);
      setReviewText(review?.review ?? '');
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Failed to load review:', error);
      }
      setMyReview(null);
      setReviewRating(5);
      setReviewText('');
    }
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
    console.log('🔌 Setting up socket listeners...');

    socketService.onMessageStream((data) => {
      console.log('🌊 Received message stream:', data);
      if (data.conversationId === conversationIdRef.current) {
        setStreamingMessage(data.accumulated);
        setIsAIStreaming(true);
      }
    });

    socketService.onMessageComplete((data) => {
      setIsTyping(false);
      dispatch(addMessage(data.message as any));
      setStreamingMessage('');
      setIsAIStreaming(false);
      fetchRateLimitStatus();
    });

    socketService.onMessageError((data) => {
      setIsAIStreaming(false);
      setIsTyping(false);
      setStreamingMessage('');
      antMessage.error(data.error?.userMessage || data.error?.message || 'Failed to send message');
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if ((!inputMessage.trim() && selectedFiles.length === 0) || !conversationId) return;
    if (tokenBalance !== null && tokenBalance <= 0) {
      setShowTokenRenewModal(true);
      return;
    }

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

      // Handle file uploads
      let mediaAttachments: any[] = [];
      if (selectedFiles.length > 0) {
        // Create optimistic media objects for immediate display
        const optimisticMedia = selectedFiles.map(file => ({
          type: file.type.startsWith('image/') ? 'image' :
            file.type.startsWith('video/') ? 'video' :
              file.type.startsWith('audio/') ? 'audio' : 'file',
          url: URL.createObjectURL(file), // Create temporary URL for preview
          name: file.name,
          size: file.size,
          mimetype: file.type
        }));

        // Optimistic UI update with media
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          content: messageContent,
          role: 'USER',
          createdAt: new Date().toISOString(),
          conversationId: conversationId,
          media: optimisticMedia as any
        };
        dispatch(addMessage(tempMessage));
        setIsTyping(true);
        setSelectedFiles([]); // Clear selection immediately for UI

        // Upload actual files
        try {
          const uploadResponse = await chatApi.uploadChatMedia(selectedFiles);
          if (uploadResponse.data?.data?.media) {
            mediaAttachments = uploadResponse.data.data.media;
          }
        } catch (uploadError) {
          console.error('Failed to upload media:', uploadError);
          antMessage.error('Failed to upload attachments');
          // Stop typing indicator if upload fails
          setIsTyping(false);
          // Start over - in a real app would probably show error state on message
          return;
        }
      } else {
        // Optimistic UI update with text only
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          content: messageContent,
          role: 'USER',
          createdAt: new Date().toISOString(),
          conversationId: conversationId
        };
        dispatch(addMessage(tempMessage));
        setIsTyping(true);
      }

      // Send to server with media if present
      const response = await chatApi.sendMessage(conversationId, messageContent, mediaAttachments);

      // If backend returns AI response immediately (no socket/guest mode), add it
      if (response.data?.data?.aiMessage) {
        dispatch(addMessage(response.data.data.aiMessage));
      }
      // In non-streaming scenarios ensure typing indicator is cleared
      setIsTyping(false);

      // Update token usage if provided (premium users)
      if (response.data?.data?.tokens) {
        const tokens = response.data.data.tokens;
        if (typeof tokens.tokenBalance === 'number') {
          setTokenBalance(tokens.tokenBalance);
        }
        if (typeof tokens.tokenGrant === 'number') {
          setTokenGrant(tokens.tokenGrant);
        }
        if (typeof tokens.tokensPerMessage === 'number') {
          setTokensPerMessage(tokens.tokensPerMessage);
        }
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

      // For non-streaming responses, ensure typing indicator is cleared once reply is handled
      setIsTyping(false);
      setIsAIStreaming(false);
      setStreamingMessage('');

    } catch (error: any) {
      console.error('Failed to send message:', error);
      // Always clear typing/streaming state on failure
      setIsTyping(false);
      setIsAIStreaming(false);
      setStreamingMessage('');

      // Handle rate limit error
      if (error.response?.status === 429) {
        if (isAuthenticated) {
          setShowUpgradeModal(true);
        } else {
          setShowGuestLimitModal(true);
        }
        antMessage.error('Message limit reached');
      } else if (error.response?.status === 402) {
        setShowTokenRenewModal(true);
        antMessage.error('Out of tokens. Please renew to continue.');
      } else if (error.response?.status === 403) {
        antMessage.error('Your account is suspended');
      } else if (error.response?.status === 400) {
        antMessage.error('Message contains inappropriate content');
      } else {
        antMessage.error('Failed to send message');
      }

      // Always clear typing state on error so UI doesn't get stuck
      setIsTyping(false);
      setIsAIStreaming(false);
      setStreamingMessage('');
    }
  };

  const shouldPromptReview = () => {
    if (!isAuthenticated) return false;
    if (!creatorId) return false;
    if (skipReviewForSession) return false;
    if (myReview) return false;
    return messages.some((msg) => msg.role === 'USER');
  };

  const requestLeave = (path: string) => {
    if (shouldPromptReview()) {
      setPendingNavigation(path);
      setReviewModalOpen(true);
      return;
    }
    navigate(path);
  };

  const handleSubmitReview = async () => {
    if (!creatorId) return;
    if (!reviewRating) {
      antMessage.error('Please select a rating');
      return;
    }

    try {
      setReviewSubmitting(true);
      const payload = { rating: reviewRating, review: reviewText };

      if (myReview) {
        await reviewApi.updateMyReview(creatorId, payload);
      } else {
        await reviewApi.create(creatorId, payload);
      }

      antMessage.success('Thanks for your feedback!');
      await loadMyReview();
      setSkipReviewForSession(true);
      setReviewModalOpen(false);

      if (pendingNavigation) {
        navigate(pendingNavigation);
        setPendingNavigation(null);
      }
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      antMessage.error(error?.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSkipReview = () => {
    setReviewModalOpen(false);
    setSkipReviewForSession(true);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setPendingNavigation(null);
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

  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioFile = new File([audioBlob], `voice_message_${Date.now()}.wav`, { type: 'audio/wav' });
          setSelectedFiles(prev => [...prev, audioFile]);

          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        antMessage.info('Recording started');
      } catch (err) {
        console.error('Error accessing microphone:', err);
        antMessage.error('Could not access microphone');
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const filteredHistory = allConversations.filter(conv =>
    conv.creator?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`chat-container chat-${theme} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* SIDEBAR - ChatGPT Style */}
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="chat-sidebar-header-new">
          {!sidebarCollapsed ? (
            <>
              <h3 className="sidebar-title">ai-creator</h3>
              <Button
                icon={<MenuFoldOutlined />}
                type="text"
                className="sidebar-toggle-btn"
                onClick={() => setSidebarCollapsed(true)}
              />
            </>
          ) : (
            <div className="collapsed-header-icons">
              <Button
                icon={<MenuUnfoldOutlined />}
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
            onClick={() => requestLeave('/creators')}
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
          {isAuthenticated && (
            <>
              {!sidebarCollapsed && <div className="history-label">Past Conversations</div>}
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="small" />
                </div>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((conv) => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${conv.creatorId === creatorId ? 'active' : ''}`}
                    onClick={() => navigate(`/chat/${conv.creatorId}`)}
                  >
                    <Avatar
                      size={28}
                      src={conv.creator?.profileImage ? getImageUrl(conv.creator.profileImage) : undefined}
                      icon={!conv.creator?.profileImage && <UserOutlined />}
                      className="history-avatar"
                    />
                    {!sidebarCollapsed && (
                      <div className="conversation-info">
                        <div className="conversation-name">{conv.creator?.displayName || 'Chat'}</div>
                        <div className="conversation-preview" style={{ fontSize: '11px', color: 'var(--chat-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conv.lastMessage?.content || 'No messages yet'}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : !sidebarCollapsed && (
                <div className="no-history-msg" style={{ padding: '20px', textAlign: 'center', color: 'var(--chat-text-muted)', fontSize: '12px' }}>
                  No conversations found
                </div>
              )}
            </>
          )}

          {!isAuthenticated && !sidebarCollapsed && (
            <div className="guest-history-msg" style={{ padding: '20px', textAlign: 'center', color: 'var(--chat-text-muted)', fontSize: '12px' }}>
              Log in to see your chat history
            </div>
          )}
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
              onClick={() => requestLeave(creator?.id ? `/creator/${creator.id}` : '/creators')}
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
          {loadingCreator ? (
            <div className="chat-loading-overlay">
              <Spin size="large" tip="Setting up your experience..." />
            </div>
          ) : messages.length === 0 ? (
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
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      {msg.media && msg.media.length > 0 && (
                        <MediaMessage media={msg.media} />
                      )}
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
              {selectedFiles.map((file, index) => {
                const isImage = file.type.startsWith('image/');
                const isAudio = file.type.startsWith('audio/');
                const previewUrl = isImage ? URL.createObjectURL(file) : null;

                return (
                  <div key={index} className={`file-preview-item ${isImage ? 'image-preview' : 'doc-preview'}`}>
                    {isImage ? (
                      <div className="image-thumb-container">
                        <img src={previewUrl!} alt="upload-preview" />
                      </div>
                    ) : isAudio ? (
                      <div className="doc-icon-container">
                        <AudioOutlined />
                        <span className="file-name-short">Voice Message</span>
                      </div>
                    ) : (
                      <div className="doc-icon-container">
                        <FileImageOutlined />
                        <span className="file-name-short">
                          {file.name.length > 15
                            ? `${file.name.substring(0, 10)}...${file.name.split('.').pop()}`
                            : file.name
                          }
                        </span>
                      </div>
                    )}
                    <button className="remove-file-btn" onClick={() => removeFile(index)}>
                      <CloseOutlined />
                    </button>
                  </div>
                );
              })}
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
                disabled={(!inputMessage.trim() && selectedFiles.length === 0) || (tokenBalance !== null && tokenBalance <= 0)}
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
              {tokenBalance !== null && (
                <>
                  {' â€¢ '}
                  <span style={{
                    color: tokenBalance <= 0 ? '#EF4444' : '#10B981',
                    fontWeight: 600
                  }}>
                    {Number(tokenBalance).toLocaleString()} tokens remaining
                  </span>
                  {tokensPerMessage !== null && (
                    <span style={{ color: '#94A3B8', marginLeft: 6 }}>
                      (burn {Number(tokensPerMessage).toLocaleString()}/msg)
                    </span>
                  )}
                  {tokenBalance <= 0 && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setShowTokenRenewModal(true)}
                      style={{ padding: '0 8px', height: 'auto', color: '#EF4444' }}
                    >
                      Renew
                    </Button>
                  )}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        title={`Rate your conversation${creator?.displayName ? ` with ${creator.displayName}` : ''}`}
        open={reviewModalOpen}
        onCancel={handleCloseReviewModal}
        footer={[
          <Button key="skip" onClick={handleSkipReview}>
            Skip for now
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={reviewSubmitting}
            onClick={handleSubmitReview}
          >
            Submit Review
          </Button>
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Your rating</div>
            <Rate allowClear={false} value={reviewRating} onChange={setReviewRating} />
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Feedback (optional)</div>
            <Input.TextArea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share what you liked or what could be improved..."
            />
          </div>
        </div>
      </Modal>
      <Modal
        title="Out of tokens"
        open={showTokenRenewModal}
        onCancel={() => setShowTokenRenewModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowTokenRenewModal(false)}>
            Not now
          </Button>,
          <Button
            key="renew"
            type="primary"
            onClick={() => {
              setShowTokenRenewModal(false);
              navigate('/dashboard/subscription');
            }}
          >
            Renew Tokens
          </Button>
        ]}
      >
        <p>
          You’ve used all your premium tokens. Renew to continue chatting without interruption.
        </p>
      </Modal>
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
