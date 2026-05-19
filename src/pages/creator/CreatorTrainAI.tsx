import { useState, useEffect, useCallback } from 'react';
import { trainingApi } from '../../services/api';

// ── Types ────────────────────────────────────────────────────────────────────
interface Correction {
  id: string;
  userMessage: string;
  rejectedResponse: string;
  chosenResponse: string;
  isActive: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  user?: { name?: string; avatar?: string };
  lastMessage?: { preview: string; timestamp: string };
  totalMessages: number;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface TrainingStatus {
  status: 'none' | 'pending' | 'ready' | 'failed';
  modelId: string | null;
  lastFineTunedAt: string | null;
  correctionCount: number;
  canTrain: boolean;
  minRequired: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  none: '#9ca3af', pending: '#f59e0b', ready: '#10b981', failed: '#ef4444',
};
const statusLabels: Record<string, string> = {
  none: 'Not trained yet', pending: 'Training in progress…', ready: 'Fine-tuned model active', failed: 'Training failed',
};

// ── Main component ────────────────────────────────────────────────────────────
export default function CreatorTrainAI() {
  const [tab, setTab] = useState<'review' | 'corrections'>('review');

  // Status
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [expandedConvId, setExpandedConvId] = useState<string | null>(null);
  const [convMessages, setConvMessages] = useState<Record<string, ConversationMessage[]>>({});
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Corrections
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [corrLoading, setCorrLoading] = useState(false);

  // Edit state (inline correction editor)
  const [editingMsg, setEditingMsg] = useState<{ convId: string; userMsg: ConversationMessage; aiMsg: ConversationMessage } | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsgId, setSavedMsgId] = useState<string | null>(null);

  // Fine-tune (kept for compat but hidden from UI)
  const [training, setTraining] = useState(false);
  const [trainError, setTrainError] = useState('');

  // ── Load training status ──────────────────────────────────────────────────
  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await trainingApi.getStatus();
      setTrainingStatus(res.data.data);
    } catch { /* silent */ } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // Poll while pending
  useEffect(() => {
    if (trainingStatus?.status !== 'pending') return;
    const id = setInterval(loadStatus, 30_000);
    return () => clearInterval(id);
  }, [trainingStatus?.status, loadStatus]);

  // ── Load conversations ────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setConvLoading(true);
    try {
      const res = await trainingApi.getMyConversations({ limit: 30 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setConversations(res.data.data?.conversations || res.data.data || []);
    } catch { /* silent */ } finally { setConvLoading(false); }
  }, []);

  // ── Load corrections ──────────────────────────────────────────────────────
  const loadCorrections = useCallback(async () => {
    setCorrLoading(true);
    try {
      const res = await trainingApi.getCorrections();
      setCorrections(res.data.data?.corrections || []);
    } catch { /* silent */ } finally { setCorrLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === 'review') loadConversations();
    else loadCorrections();
  }, [tab, loadConversations, loadCorrections]);

  // ── Expand conversation → load messages ──────────────────────────────────
  const handleExpandConv = async (convId: string) => {
    if (expandedConvId === convId) { setExpandedConvId(null); return; }
    setExpandedConvId(convId);
    if (convMessages[convId]) return;
    setMessagesLoading(true);
    try {
      const res = await trainingApi.getMyConversationDetails(convId);
      const msgs = res.data.data?.messages || [];
      setConvMessages(prev => ({ ...prev, [convId]: msgs }));
    } catch { /* silent */ } finally { setMessagesLoading(false); }
  };

  // ── Open inline editor ────────────────────────────────────────────────────
  const handleEdit = (convId: string, userMsg: ConversationMessage, aiMsg: ConversationMessage) => {
    setEditingMsg({ convId, userMsg, aiMsg });
    setEditText(aiMsg.content);
  };

  // ── Save correction ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editingMsg || !editText.trim()) return;
    setSaving(true);
    try {
      await trainingApi.saveCorrection({
        userMessage:      editingMsg.userMsg.content,
        rejectedResponse: editingMsg.aiMsg.content,
        chosenResponse:   editText.trim(),
      });
      const savedId = editingMsg.aiMsg.id;
      setEditingMsg(null);
      setSavedMsgId(savedId);
      setTimeout(() => setSavedMsgId(null), 3000);
      await loadStatus();
    } catch { /* silent */ } finally { setSaving(false); }
  };

  // ── Toggle/delete corrections ─────────────────────────────────────────────
  const handleToggle = async (id: string) => {
    try {
      await trainingApi.toggleCorrection(id);
      setCorrections(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
      await loadStatus();
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this correction? This cannot be undone.')) return;
    try {
      await trainingApi.deleteCorrection(id);
      setCorrections(prev => prev.filter(c => c.id !== id));
      await loadStatus();
    } catch { /* silent */ }
  };

  // ── Trigger fine-tune ─────────────────────────────────────────────────────
  const handleFineTune = async () => {
    setTraining(true);
    setTrainError('');
    try {
      await trainingApi.startFineTune();
      await loadStatus();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setTrainError(err.response?.data?.error?.message || 'Failed to start training');
    } finally { setTraining(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const status = trainingStatus;
  const pct = status ? Math.min(100, Math.round((status.correctionCount / status.minRequired) * 100)) : 0;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Train Your AI</h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>
          Review AI responses, correct them, and train a model that perfectly matches your voice.
        </p>
      </div>

      {/* Status card */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        {statusLoading ? (
          <div style={{ color: '#9ca3af', fontSize: 13 }}>Loading…</div>
        ) : status ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.15)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>Active</span>
            </div>

            {/* Correction count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{status.correctionCount}</span>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                correction{status.correctionCount !== 1 ? 's' : ''} improving your AI
              </span>
            </div>

            {/* Explanation */}
            <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
              Each correction takes effect instantly — no training required.
            </span>
          </div>
        ) : null}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f3f4f6', borderRadius: 10, padding: 3, width: 'fit-content' }}>
        {(['review', 'corrections'] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: tab === t ? '#fff' : 'transparent',
            color: tab === t ? '#111827' : '#6b7280',
            boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}>
            {t === 'review' ? 'Review Conversations' : `Corrections${status ? ` (${status.correctionCount})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── REVIEW TAB ─────────────────────────────────────────────────────── */}
      {tab === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {convLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading conversations…</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No conversations yet.</div>
          ) : conversations.map(conv => (
            <div key={conv.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
              {/* Conversation header */}
              <button type="button" onClick={() => handleExpandConv(conv.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#374151', flexShrink: 0 }}>
                  {(conv.user?.name || 'A')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{conv.user?.name || 'Anonymous'}</div>
                  {conv.lastMessage && (
                    <div style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 }}>
                      {conv.lastMessage.preview}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#d1d5db', flexShrink: 0, marginRight: 4 }}>
                  {conv.totalMessages} msgs
                </div>
                <svg viewBox="0 0 20 20" width={16} height={16} fill="none" stroke="#9ca3af" strokeWidth={2} style={{ flexShrink: 0, transform: expandedConvId === conv.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Expanded messages */}
              {expandedConvId === conv.id && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {messagesLoading && !convMessages[conv.id] ? (
                    <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 16 }}>Loading messages…</div>
                  ) : (convMessages[conv.id] || []).map((msg, idx) => {
                    const isAI = msg.role.toLowerCase() === 'assistant';
                    const prevMsg = (convMessages[conv.id] || [])[idx - 1];
                    const prevIsUser = prevMsg?.role.toLowerCase() === 'user';
                    const isEditing = isAI && editingMsg?.convId === conv.id && editingMsg?.aiMsg.id === msg.id;
                    const justSaved = isAI && savedMsgId === msg.id;

                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {/* Message bubble */}
                        <div style={{
                          padding: '10px 14px', borderRadius: 12, maxWidth: '85%', fontSize: 13, lineHeight: 1.5,
                          background: isAI ? '#f8f9fa' : '#fff5f5',
                          border: `1px solid ${isEditing ? '#fde68a' : isAI ? '#e5e7eb' : '#fecaca'}`,
                          color: '#111827',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: isAI ? '#9ca3af' : '#ff3e48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {isAI ? 'AI' : 'Fan'}
                            </div>
                            {isAI && prevIsUser && !isEditing && (
                              justSaved ? (
                                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Applied ✓</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleEdit(conv.id, prevMsg, msg)}
                                  style={{
                                    padding: '2px 7px', borderRadius: 5, border: '1px solid #e5e7eb',
                                    background: '#fff', color: '#9ca3af', fontSize: 11, cursor: 'pointer', lineHeight: 1.6,
                                  }}
                                >
                                  ✏️
                                </button>
                              )
                            )}
                          </div>
                          {msg.content}
                        </div>

                        {/* Inline editor — expands below this bubble only */}
                        {isEditing && (
                          <div style={{ maxWidth: '85%', padding: '12px 14px', borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a' }}>
                            <textarea
                              autoFocus
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              rows={3}
                              style={{ width: '100%', padding: '9px 11px', borderRadius: 8, border: '1px solid #fde68a', fontSize: 13, lineHeight: 1.5, resize: 'vertical', outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit' }}
                            />
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                              <button type="button" onClick={handleSave} disabled={saving || !editText.trim()} style={{
                                padding: '7px 18px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600,
                                background: '#ff3e48', color: '#fff', cursor: saving || !editText.trim() ? 'not-allowed' : 'pointer',
                                opacity: saving || !editText.trim() ? 0.6 : 1,
                              }}>
                                {saving ? 'Saving…' : 'Save'}
                              </button>
                              <button type="button" onClick={() => setEditingMsg(null)} style={{
                                padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12, cursor: 'pointer',
                              }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── CORRECTIONS TAB ────────────────────────────────────────────────── */}
      {tab === 'corrections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {corrLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading corrections…</div>
          ) : corrections.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              No corrections yet. Go to "Review Conversations" to start correcting AI responses.
            </div>
          ) : corrections.map(c => (
            <div key={c.id} style={{ background: '#fff', border: `1px solid ${c.isActive ? '#e5e7eb' : '#f3f4f6'}`, borderRadius: 14, padding: 18, opacity: c.isActive ? 1 : 0.55 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                  Fan asked: <span style={{ color: '#111827' }}>"{c.userMessage.slice(0, 120)}{c.userMessage.length > 120 ? '…' : ''}"</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button type="button" onClick={() => handleToggle(c.id)} style={{
                    padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    color: c.isActive ? '#f59e0b' : '#10b981',
                  }}>
                    {c.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button type="button" onClick={() => handleDelete(c.id)} style={{
                    padding: '4px 10px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#ef4444',
                  }}>
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ padding: '10px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>❌ Original AI</div>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{c.rejectedResponse.slice(0, 200)}{c.rejectedResponse.length > 200 ? '…' : ''}</div>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>✓ Your Correction</div>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{c.chosenResponse.slice(0, 200)}{c.chosenResponse.length > 200 ? '…' : ''}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 8 }}>
                {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
