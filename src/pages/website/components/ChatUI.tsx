import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { RootState, AppDispatch } from '../../../store';
import { addMessage } from '../../../store/slices/chatSlice';
import { chatApi, creatorApi, programApi, getImageUrl } from '../../../services/api';
import socketService from '../../../services/socket';
import type { Creator } from '../../../types';
import type { RateLimitStatus } from '../../../types/chat';
import styles from "../WebsiteChat.module.css";
import VoiceModeModal from './VoiceModeModal';

const FREE_MESSAGE_LIMIT = 5;

type VoiceProvider = 'inworld';

type SuggestedCard =
  | { type: 'program'; id: string; name: string; price: number; link?: string; promoCode?: string; description?: string; duration?: string; level?: string }
  | { type: 'product'; id: string; name: string; price: number; link?: string; promoCode?: string; imageUrl?: string; description?: string }
  | { type: 'booking'; creatorId: string };

// Build a compact, token-efficient profile string from the user's fitness onboarding data.
// Result is stored in the Redux store (which hydrates from localStorage on page load),
// so it persists across window reloads without any extra API calls.
function buildFitnessProfile(user: import('../../../types').User | null): string | undefined {
  if (!user?.onboardingCompleted) return undefined;
  const parts: string[] = [];
  if (user.ageRange)         parts.push(user.ageRange.replace(' years', 'yr'));
  if (user.heightCm)         parts.push(`${user.heightCm}cm`);
  if (user.weightKg)         parts.push(`${user.weightKg}kg`);
  if (user.dietPreference)   parts.push(user.dietPreference.toLowerCase());
  if (user.fitnessGoal)      parts.push(`goal=${user.fitnessGoal.toLowerCase()}`);
  if (user.fitnessChallenge) parts.push(`challenge=${user.fitnessChallenge.toLowerCase()}`);
  if (user.coachStyle)       parts.push(`style=${user.coachStyle.toLowerCase()}`);
  if (parts.length === 0) return undefined;
  return `[User: ${parts.join(', ')}]`;
}

const BOOKING_KW = ['book', 'booking', 'meet', 'meeting', 'schedule', 'appointment', 'slot', 'availability', 'available', 'consult', 'consultation', 'session', '1:1', 'one-on-one', 'call', 'video call', 'zoom', 'google meet', 'calendar', 'reschedule', 'free time', 'hop on', 'connect live', 'talk live', 'live chat', 'when are you', 'what day', 'what time', 'free slot', 'speak to you', 'speak with you', 'talk to you', 'talk with you', 'chat with you', 'get in touch', 'catch up', 'connect with', 'arrange a', 'set up a', 'fix a time', 'find a time'];
const PROGRAM_KW = ['program', 'programmes', 'course', 'courses', 'coaching', 'training', 'workout', 'workouts', 'fitness plan', 'fitness program', 'challenge', 'diet plan', 'meal plan', 'nutrition plan', 'routine', 'regime', 'transformation', 'weight loss', 'lose weight', 'build muscle', 'gain muscle', 'get fit', 'get in shape', 'enroll', 'sign up', 'join', 'membership', 'class', 'lesson', 'tutorial', 'guide me', 'help me train', 'help me lose', 'help me gain'];
const PRODUCT_KW = ['product', 'products', 'buy', 'purchase', 'order', 'supplement', 'supplements', 'protein', 'vitamins', 'gear', 'equipment', 'recommend', 'recommendation', 'suggest', 'suggestion', 'shop', 'store', 'sell', 'selling', 'discount', 'promo code', 'promo', 'offer', 'deal', 'what do you sell', 'do you have', 'how much', 'price', 'cost'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSuggestedCards(text: string, creatorIdParam: string, programs: any[]): SuggestedCard[] {
  const lower = text.toLowerCase();
  const cards: SuggestedCard[] = [];
  const hasBooking = BOOKING_KW.some(kw => lower.includes(kw));
  const hasProgram = PROGRAM_KW.some(kw => lower.includes(kw));
  const hasProduct = PRODUCT_KW.some(kw => lower.includes(kw));
  if (hasBooking) cards.push({ type: 'booking', creatorId: creatorIdParam });
  if (hasProgram || hasProduct) {
    for (const p of programs) {
      let d: Record<string, string> = {};
      try { d = JSON.parse(p.description || '{}'); } catch { d = {}; }
      const isProduct = p.category === '__product__';
      if (isProduct && hasProduct) {
        cards.push({ type: 'product', id: p.id, name: p.name, price: Number(p.price || 0), link: d.link || undefined, promoCode: d.promoCode || undefined, imageUrl: d.imageUrl || undefined, description: d.desc || undefined });
      } else if (!isProduct && hasProgram) {
        cards.push({ type: 'program', id: p.id, name: p.name, price: Number(p.price || 0), link: d.link || undefined, promoCode: d.promoCode || undefined, description: d.desc || undefined, duration: d.duration || undefined, level: d.level || undefined });
      }
    }
  }
  return cards;
}

type UIMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  pending?: boolean;
  error?: boolean;
  time?: string;
  voiceProviderUsed?: VoiceProvider | null;
  suggestedCards?: SuggestedCard[];
};

type Props = {
  creatorId: string;
};

function localId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getTimeStr(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const day = now.getDate().toString().padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[now.getMonth()]} ▪ ${h12.toString().padStart(2, "0")}:${m} ${ampm}`;
}

/* ---------- SVG Icons ---------- */
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FeedbackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12h8M8 8h8M8 16h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function _ImageIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
      <rect x="2" y="2" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="7" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M18 13l-4-4-8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
      <rect x="7" y="1" width="6" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 9a6 6 0 0 0 12 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 15v4M7 19h6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden>
      <path d="M18 10L2 2l4 8-4 8z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 18L12 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mdComponents: any = {
  p: ({ children }: { children: React.ReactNode }) => <p style={{ margin: '6px 0' }}>{children}</p>,
  ol: ({ children }: { children: React.ReactNode }) => <ol style={{ margin: '6px 0', padding: 0, listStyle: 'none' }}>{children}</ol>,
  ul: ({ children }: { children: React.ReactNode }) => <ul style={{ margin: '6px 0', padding: '0 0 0 16px' }}>{children}</ul>,
  li: ({ children, ordered, index }: { children?: React.ReactNode; ordered?: boolean; index?: number }) => (
    <li style={{ margin: '4px 0', padding: 0, display: 'flex', gap: 4 }}>
      {ordered !== false && typeof index === 'number' && <span style={{ flexShrink: 0, color: 'rgba(255,255,255,0.5)' }}>{index + 1}.</span>}
      <div>{children}</div>
    </li>
  ),
};

export function ChatUI({ creatorId }: Props) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [creator, setCreator] = useState<Creator | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [aiResponseCount, setAiResponseCount] = useState(0);
  const [trialExpired, setTrialExpired] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [showVoiceUpgradeModal, setShowVoiceUpgradeModal] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<'en' | 'hi'>('en');
  // Which voice engine the listener wants the AI reply spoken with.
  // Persisted per-user in localStorage so the choice sticks across sessions.
  const voiceProvider: VoiceProvider = 'inworld';
  const [_tokenGrant, setTokenGrant] = useState<number>(0);
  const [tokensPerMessage, setTokensPerMessage] = useState<number>(800);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const conversationIdRef = useRef<string | null>(null);

  /* ---------- auto-scroll ---------- */
  // Fires when initial load completes (loading flips false while messages already set)
  useLayoutEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [loading]);

  // Fires on new messages or streaming updates
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  useEffect(() => { inputRef.current?.focus(); }, [loading]);

  /* ---------- initialize: fetch creator + create conversation ---------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        // 1. Fetch creator data and programs in parallel
        const [creatorRes, programsRes] = await Promise.all([
          creatorApi.getById(creatorId),
          programApi.getByCreator(creatorId).catch(() => ({ data: { data: [] } })),
        ]);
        if (cancelled) return;
        const creatorData: Creator = creatorRes.data.data;
        setCreator(creatorData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const historyPrograms: any[] = (programsRes as any).data?.data || [];

        // 2. Create or get conversation
        const convRes = await chatApi.createConversation(creatorId);
        if (cancelled) return;
        const convId = convRes.data.data.conversation.id;
        setConversationId(convId);
        conversationIdRef.current = convId;

        // 3. Load existing messages
        try {
          const msgRes = await chatApi.getConversation(convId);
          if (!cancelled && msgRes.data.data?.messages) {
            const rawMsgs = msgRes.data.data.messages.filter((m: { role: string; content?: string }) => {
              if (m.role !== 'USER' && m.content && (
                m.content.includes('AI failed') ||
                m.content.includes('syntax error') ||
                m.content.includes('ECONNREFUSED')
              )) return false;
              return true;
            });
            let lastUserText = '';
            const existingMsgs: UIMessage[] = rawMsgs.map((m: { role: string; content?: string; id: string; createdAt: string }) => {
              const msg: UIMessage = {
                id: m.id,
                role: m.role === 'USER' ? 'user' as const : 'ai' as const,
                content: m.content || '',
                time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };
              if (m.role === 'USER') {
                lastUserText = m.content || '';
              } else if (lastUserText) {
                const cards = buildSuggestedCards(lastUserText, creatorId, historyPrograms);
                if (cards.length > 0) msg.suggestedCards = cards;
                lastUserText = '';
              }
              return msg;
            });
            setMessages(existingMsgs);
            const aiMsgs = existingMsgs.filter(m => m.role === 'ai');
            setAiResponseCount(Math.max(0, aiMsgs.length - 1)); // exclude welcome message
          }
        } catch {
          // No messages yet — that's fine
        }

        // 4. Fetch rate limit status + tokens — reset trial if user is now Premium
        try {
          const rlRes = await chatApi.getRateLimitStatus();
          if (!cancelled) {
            const rlData = rlRes.data.data;
            setRateLimitStatus(rlData);
            if (rlData?.tokens) {
              setTokenBalance(rlData.tokens.balance || 0);
              setTokenGrant(rlData.tokens.grant || 0);
              setTokensPerMessage(rlData.tokens.perMessage || 800);
            }
            if (rlData?.subscription?.plan === 'PREMIUM') {
              setTrialExpired(false);
            }
          }
        } catch {
          // Use local count fallback
        }

        // 5. Connect socket
        socketService.connect(token);
        socketService.joinConversation(convId, user?.id, undefined);

        setLoading(false);
      } catch (err: unknown) {
        if (cancelled) return;
        const e = err as { response?: { data?: { error?: string } }; message?: string };
        const msg = e?.response?.data?.error || e?.message || "Unable to start conversation";
        setInitError(msg);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      socketService.disconnect();
    };
  }, [creatorId, dispatch, token, user?.id]);

  /* ---------- socket listeners ---------- */
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const onStream = (data: { accumulated: string }) => {
      setStreamingContent(data.accumulated);
      setIsStreaming(true);
    };

    const onComplete = (data: { message: { id?: string; content?: string; voiceProviderUsed?: VoiceProvider | null; suggestedCards?: SuggestedCard[] } }) => {
      setStreamingContent("");
      setIsStreaming(false);
      setIsSending(false);

      const aiTime = getTimeStr();
      const aiMsg: UIMessage = {
        id: data.message?.id || localId("a"),
        role: "ai",
        content: data.message?.content || "",
        time: aiTime,
        voiceProviderUsed: data.message?.voiceProviderUsed ?? null,
        suggestedCards: data.message?.suggestedCards,
      };
      setMessages((prev) => {
        const filtered = prev.filter(m => !m.pending);
        return [...filtered, aiMsg];
      });

      setAiResponseCount((n) => n + 1);

      if (data.message) dispatch(addMessage(data.message as unknown as Parameters<typeof addMessage>[0]));
    };

    const onError = (data: { error?: { userMessage?: string } }) => {
      setStreamingContent("");
      setIsStreaming(false);
      setIsSending(false);
      const errorMsg = data.error?.userMessage || "Something went wrong.";
      // Show a friendly message instead of raw backend errors
      const friendlyMsg = errorMsg.includes('syntax error') || errorMsg.includes('AI failed')
        ? "Sorry, I couldn't process that. Please try again."
        : errorMsg;
      setMessages((prev) => {
        const idx = prev.findIndex(m => m.pending);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], pending: false, error: true, content: friendlyMsg };
          return updated;
        }
        return prev;
      });
    };

    socket.on('message_stream', onStream);
    socket.on('message_completed', onComplete);
    socket.on('message_error', onError);
    return () => { socket.off('message_stream', onStream); socket.off('message_completed', onComplete); socket.off('message_error', onError); };
  }, [dispatch, rateLimitStatus]);

  /* ---------- send ---------- */
  const handleSend = useCallback(async (rawText: string) => {
    const text = rawText.trim();
    if (!text || isSending || !conversationId) return;

    const isPremium = rateLimitStatus?.subscription?.plan === 'PREMIUM';

    if (isPremium) {
      // Premium users: check token balance
      if (tokenBalance <= 0) {
        setTrialExpired(true);
        return;
      }
    } else {
      // Free users: check message limit
      if (trialExpired) return;
      if (rateLimitStatus?.limits?.daily?.remaining !== undefined && rateLimitStatus.limits.daily.remaining <= 0) {
        setTrialExpired(true);
        return;
      }
      if (aiResponseCount >= FREE_MESSAGE_LIMIT) {
        setTrialExpired(true);
        return;
      }
    }

    const time = getTimeStr();
    const userMsg: UIMessage = { id: localId("u"), role: "user", content: text, time };
    const pendingAi: UIMessage = { id: localId("a"), role: "ai", content: "", pending: true, time: "" };
    setMessages((prev) => [...prev, userMsg, pendingAi]);
    setInput("");
    setIsSending(true);

    try {
      const res = await chatApi.sendMessage(conversationId, text, undefined, false, voiceProvider, buildFitnessProfile(user));
      const aiMsg = res.data?.data?.aiMessage;

      // If socket delivers the response, the socket handler will update the UI.
      // But if the REST response already has the AI message, use it as fallback
      // after a short delay to let socket take priority.
      if (aiMsg?.content) {
        setTimeout(() => {
          setMessages((prev) => {
            const stillPending = prev.some(m => m.id === pendingAi.id && m.pending);
            if (!stillPending) return prev; // Socket already handled it
            return prev.map((m) =>
              m.id === pendingAi.id
                ? { ...m, content: aiMsg.content, pending: false, time: getTimeStr(), id: aiMsg.id || m.id, voiceProviderUsed: aiMsg.voiceProviderUsed ?? null, suggestedCards: aiMsg.suggestedCards }
                : m
            );
          });
          setIsSending(false);
          // Deduct tokens for premium, count messages for free
          if (rateLimitStatus?.subscription?.plan === 'PREMIUM') {
            setTokenBalance(prev => {
              const next = prev - tokensPerMessage;
              if (next <= 0) setTrialExpired(true);
              return Math.max(0, next);
            });
          } else {
            setAiResponseCount((n) => {
              const next = n + 1;
              if (next >= FREE_MESSAGE_LIMIT) setTrialExpired(true);
              return next;
            });
          }
          // Update from response if tokens data present
          const tokensData = res.data?.data?.tokens;
          if (tokensData) {
            setTokenBalance(tokensData.tokenBalance || tokensData.balance || 0);
          }
        }, 500);
      }
    } catch (err: unknown) {
      setIsSending(false);
      const e = err as { response?: { data?: { error?: string } } };
      const raw = e?.response?.data?.error || "Failed to send.";
      const friendly = (raw.includes('AI failed') || raw.includes('syntax error'))
        ? "Sorry, I couldn't process that. Please try again."
        : raw;
      setMessages((prev) => prev.map((m) => m.id === pendingAi.id ? { ...m, content: friendly, pending: false, error: true } : m));
    }
  }, [conversationId, isSending, trialExpired, aiResponseCount, rateLimitStatus, voiceProvider, tokenBalance, tokensPerMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input); }
  };

  const creatorName = creator?.displayName || 'Creator';
  const creatorAvatar = creator?.profileImage ? getImageUrl(creator.profileImage) : '';
  const firstName = creatorName.split(' ')[0];
  const hasUserMessages = messages.some(m => m.role === 'user');

  const SUGGESTIONS = [
    "What services do you offer?",
    "How can you help me?",
    "What's your experience?",
  ];

  if (loading) {
    return (
      <div className={styles.page} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Loading chat...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button type="button" className={styles.backLink} onClick={() => navigate(-1)} aria-label="Go back">
            <BackIcon />
          </button>
        </div>

        <div className={styles.headerRight}>
          {/* Language toggle */}
          <div style={{ display: 'flex', alignItems: 'center', borderRadius: 99, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
            {(['en', 'hi'] as const).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setVoiceLanguage(lang)}
                style={{
                  padding: '5px 13px', border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                  background: voiceLanguage === lang ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: voiceLanguage === lang ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.15s',
                }}
              >
                {lang === 'en' ? 'EN' : 'हिं'}
              </button>
            ))}
          </div>

          {/* Token/Message counter */}
          {rateLimitStatus?.subscription?.plan === 'PREMIUM' ? (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 99,
              background: tokenBalance > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: tokenBalance > 0 ? '#10b981' : '#ef4444',
              border: `1px solid ${tokenBalance > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {Math.floor(tokenBalance).toLocaleString()} tokens left
            </span>
          ) : (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 99,
              background: 'rgba(255,62,72,0.08)', color: '#ff3e48',
              border: '1px solid rgba(255,62,72,0.2)',
            }}>
              {Math.max(0, FREE_MESSAGE_LIMIT - aiResponseCount)} / {FREE_MESSAGE_LIMIT} free
            </span>
          )}
          {rateLimitStatus?.subscription?.plan !== 'PREMIUM' && (
            <button type="button" onClick={() => { localStorage.setItem('checkoutReturnTo', window.location.pathname); navigate('/pricing'); }} style={{
              fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 99,
              background: 'linear-gradient(135deg, #ff5b1f 0%, #ff3e48 100%)',
              color: '#fff', border: 'none', cursor: 'pointer',
            }}>Subscribe</button>
          )}
          {creatorAvatar && (
            <div className={styles.headerAvatar}>
              <img src={creatorAvatar} alt={creatorName} className={styles.headerAvatarImg} />
            </div>
          )}
        </div>
      </header>

      {/* MESSAGES */}
      <div className={styles.scroll} ref={scrollRef}>
        <div className={styles.dateDivider}>
          <div className={styles.dateLine} />
          <span className={styles.dateText}>Today</span>
          <div className={styles.dateLine} />
        </div>

        {initError && (
          <div className={styles.errorBanner}><strong>Couldn&apos;t connect.</strong> {initError}</div>
        )}

        {/* Show empty state only if truly no messages at all */}
        {messages.length === 0 && !initError && (
          <div className={styles.empty}>
            {creatorAvatar && (
              <div className={styles.emptyAvatar}>
                <img src={creatorAvatar} alt={creatorName} className={styles.emptyAvatarImg} />
              </div>
            )}
            <h2 className={styles.emptyHeading}>Chat with {firstName}</h2>
            <p className={styles.emptyBody}>{creator?.category ? `Expert in ${creator.category}` : 'Ask me anything'}</p>
          </div>
        )}

        {/* Render messages */}
        {messages.map((m) => (
          <div key={m.id} className={styles.messageGroup}>
            <div className={`${styles.messageMeta} ${m.role === "user" ? styles.messageMetaUser : ""}`}>
              {m.role === "ai" && (
                <>
                  {creatorAvatar && (
                    <div className={styles.metaAvatar}>
                      <img src={creatorAvatar} alt="" className={styles.metaAvatarImg} />
                    </div>
                  )}
                  <span className={styles.metaName}>{creatorName}</span>
                </>
              )}
              {m.time && <span className={styles.metaTime}>{m.time}</span>}
              {m.role === "user" && (
                <div className={styles.metaAvatar} style={{ background: '#374151' }}>
                  <svg viewBox="0 0 20 20" width="16" height="16" style={{ margin: 'auto', display: 'block', marginTop: 8 }}>
                    <circle cx="10" cy="7" r="3.5" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
                    <path d="M3 18c0-3 3.1-5.5 7-5.5s7 2.5 7 5.5" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
            <div className={`${styles.bubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleAi} ${m.error ? styles.bubbleError : ""}`}>
              {m.pending ? (
                isStreaming && streamingContent
                  ? <ReactMarkdown components={mdComponents}>{streamingContent}</ReactMarkdown>
                  : <span className={styles.typing} aria-label="Typing"><span /> <span /> <span /></span>
              ) : (
                <ReactMarkdown components={mdComponents}>{m.content}</ReactMarkdown>
              )}
            </div>
            {m.role === 'ai' && !m.pending && m.suggestedCards && m.suggestedCards.length > 0 && (
              <div style={{ marginTop: 8, marginLeft: 44, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {m.suggestedCards.map((card, idx) => {
                  if (card.type === 'booking') {
                    return (
                      <a key={idx} href={`/creator/${card.creatorId}?tab=bookings`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          padding: '7px 14px', borderRadius: 99,
                          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
                          textDecoration: 'none', color: 'rgba(255,255,255,0.85)',
                          fontSize: 12, fontWeight: 600,
                          width: 'fit-content',
                        }}
                      >
                        <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <rect x="2" y="3" width="12" height="11" rx="2" />
                          <path d="M5 1v3M11 1v3M2 7h12" />
                        </svg>
                        Book a meeting
                        <span style={{ opacity: 0.5 }}>&#8594;</span>
                      </a>
                    );
                  }
                  if (card.type === 'product' || card.type === 'program') {
                    return (
                      <div key={idx} style={{
                        padding: '10px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{card.name}</div>
                            {card.description && (
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, lineHeight: 1.4 }}>{card.description}</div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>&#8377;{card.price.toFixed(0)}</span>
                              {card.type === 'program' && card.duration && (
                                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}>{card.duration}</span>
                              )}
                              {card.type === 'program' && card.level && (
                                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.2)', color: '#6ee7b7' }}>{card.level}</span>
                              )}
                              {card.promoCode && (
                                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(251,191,36,0.2)', color: '#fcd34d', fontWeight: 700 }}>Code: {card.promoCode}</span>
                              )}
                            </div>
                          </div>
                          {card.link && (
                            <a href={card.link} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 11, fontWeight: 600, color: '#ff3e48', textDecoration: 'none', flexShrink: 0, marginLeft: 12, paddingTop: 2 }}>
                              {card.type === 'product' ? 'Buy Now \u2192' : 'View \u2192'}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        ))}

        {/* Show suggestions if user hasn't sent any messages yet */}
        {!hasUserMessages && !initError && (
          <div className={styles.starters}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Try asking:</div>
            {SUGGESTIONS.map((q) => (
              <button key={q} type="button" className={styles.starterBtn} onClick={() => handleSend(q)} disabled={isSending || trialExpired}>{q}</button>
            ))}
          </div>
        )}
      </div>

      {/* COMPOSER */}
      <div className={styles.composerWrap}>
        <div className={styles.composer}>
          <textarea ref={inputRef} className={styles.composerInput} placeholder={trialExpired && rateLimitStatus?.subscription?.plan !== 'PREMIUM' ? "Free trial expired" : "Start your chat here"} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} disabled={isSending || (trialExpired && rateLimitStatus?.subscription?.plan !== 'PREMIUM')} aria-label={`Message ${creatorName}`} />
          <div className={styles.composerIcons}>
            <span className={styles.composerIconBtn} onClick={() => setVoiceModalOpen(true)} role="button" tabIndex={0} style={{ cursor: 'pointer' }}><MicIcon /></span>
          </div>
          <button type="button" className={styles.sendBtn} onClick={() => handleSend(input)} disabled={!input.trim() || isSending || trialExpired} aria-label="Send message"><SendIcon /></button>
        </div>
      </div>

      <div className={styles.disclaimer}>
        Free Research Preview. {creatorName} may produce inaccurate information about people, places, or facts.
      </div>

      {/* TRIAL EXPIRED MODAL */}
      {trialExpired && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="sub-modal-title">
          <div className={styles.modal}>
            <div className={styles.modalIcon} aria-hidden>&#10022;</div>
            <h2 id="sub-modal-title" className={styles.modalTitle}>
              {rateLimitStatus?.subscription?.plan === 'PREMIUM' ? 'Out of tokens' : 'Your free trial has expired'}
            </h2>
            <p className={styles.modalBody}>
              {rateLimitStatus?.subscription?.plan === 'PREMIUM'
                ? `You've used all your tokens. Purchase more tokens to continue chatting with ${firstName}.`
                : `You've used all ${FREE_MESSAGE_LIMIT} free replies with ${firstName}. Subscribe to keep chatting.`
              }
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalPrimary} onClick={() => {
                localStorage.setItem('checkoutReturnTo', window.location.pathname);
                navigate('/pricing');
              }}>View Plans</button>
              <button type="button" className={styles.modalSecondary} onClick={() => setTrialExpired(false)}>Go back</button>
            </div>
          </div>
        </div>
      )}

      {/* VOICE MODE MODAL */}
      <VoiceModeModal
        open={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        conversationId={conversationId}
        creatorName={creatorName}
        creatorAvatar={creator?.profileImage || null}
        voiceProvider={voiceProvider}
        language={voiceLanguage}
        onVoiceBlocked={() => setShowVoiceUpgradeModal(true)}
        onMessageSent={() => {
          // Refresh messages after voice message
          if (conversationId) {
            chatApi.getConversation(conversationId).then((res) => {
              const msgs = res.data?.data?.messages || [];
              setMessages(msgs.map((m: { id: string; role: string; content: string }) => ({
                id: m.id,
                role: m.role === 'ASSISTANT' ? 'ai' as const : 'user' as const,
                content: m.content,
                time: getTimeStr(),
              })));
            }).catch(() => {});
          }
        }}
      />
      {showVoiceUpgradeModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="voice-modal-title">
          <div className={styles.modal}>
            <div className={styles.modalIcon} aria-hidden>&#9835;</div>
            <h2 id="voice-modal-title" className={styles.modalTitle}>Voice limit reached</h2>
            <p className={styles.modalBody}>
              You&apos;ve used your 2 free voice replies. Subscribe to unlock unlimited voice conversations with {firstName}.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalPrimary} onClick={() => {
                localStorage.setItem('checkoutReturnTo', window.location.pathname);
                setShowVoiceUpgradeModal(false);
                navigate('/pricing');
              }}>View Plans</button>
              <button type="button" className={styles.modalSecondary} onClick={() => setShowVoiceUpgradeModal(false)}>Go back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
