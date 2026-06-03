import { useState, useEffect, useCallback } from 'react';
import { Grid } from 'antd';
import { trainingApi } from '../../services/api';
import { Brain, MessageSquare, CheckCircle, XCircle, Trash2, ChevronDown, Pencil, Zap } from 'lucide-react';

const { useBreakpoint } = Grid;

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

// ── Main component ────────────────────────────────────────────────────────────
export default function CreatorTrainAI() {
  const screens = useBreakpoint();
  const isMobile = screens.md === false;

  const [tab, setTab] = useState<'review' | 'corrections'>('review');
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [expandedConvId, setExpandedConvId] = useState<string | null>(null);
  const [convMessages, setConvMessages] = useState<Record<string, ConversationMessage[]>>({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [corrLoading, setCorrLoading] = useState(false);
  const [editingMsg, setEditingMsg] = useState<{ convId: string; userMsg: ConversationMessage; aiMsg: ConversationMessage } | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsgId, setSavedMsgId] = useState<string | null>(null);
  const [training, setTraining] = useState(false);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await trainingApi.getStatus();
      setTrainingStatus(res.data.data);
    } catch { /* silent */ } finally { setStatusLoading(false); }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  useEffect(() => {
    if (trainingStatus?.status !== 'pending') return;
    const id = setInterval(loadStatus, 30_000);
    return () => clearInterval(id);
  }, [trainingStatus?.status, loadStatus]);

  const loadConversations = useCallback(async () => {
    setConvLoading(true);
    try {
      const res = await trainingApi.getMyConversations({ limit: 30 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setConversations(res.data.data?.conversations || res.data.data || []);
    } catch { /* silent */ } finally { setConvLoading(false); }
  }, []);

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

  const handleExpandConv = async (convId: string) => {
    if (expandedConvId === convId) { setExpandedConvId(null); return; }
    setExpandedConvId(convId);
    if (convMessages[convId]) return;
    setMessagesLoading(true);
    try {
      const res = await trainingApi.getMyConversationDetails(convId);
      setConvMessages(prev => ({ ...prev, [convId]: res.data.data?.messages || [] }));
    } catch { /* silent */ } finally { setMessagesLoading(false); }
  };

  const handleEdit = (convId: string, userMsg: ConversationMessage, aiMsg: ConversationMessage) => {
    setEditingMsg({ convId, userMsg, aiMsg });
    setEditText(aiMsg.content);
  };

  const handleSave = async () => {
    if (!editingMsg || !editText.trim()) return;
    setSaving(true);
    try {
      await trainingApi.saveCorrection({
        userMessage: editingMsg.userMsg.content,
        rejectedResponse: editingMsg.aiMsg.content,
        chosenResponse: editText.trim(),
      });
      const savedId = editingMsg.aiMsg.id;
      setEditingMsg(null);
      setSavedMsgId(savedId);
      setTimeout(() => setSavedMsgId(null), 3000);
      await loadStatus();
    } catch { /* silent */ } finally { setSaving(false); }
  };

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

  const handleFineTune = async () => {
    setTraining(true);
    try {
      await trainingApi.startFineTune();
      await loadStatus();
    } catch { /* silent */ } finally { setTraining(false); }
  };

  const status = trainingStatus;
  const pct = status ? Math.min(100, Math.round((status.correctionCount / Math.max(status.minRequired, 1)) * 100)) : 0;

  const statusConfig = {
    none:    { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)', label: 'Not trained yet' },
    pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Training in progress…' },
    ready:   { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  label: 'Fine-tuned model active' },
    failed:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Training failed' },
  };
  const sc = statusConfig[status?.status || 'none'];

  return (
    <div>
      {/* ── Hero header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #0a0505 100%)',
        borderRadius: 20, padding: isMobile ? '20px 20px' : '28px 32px', marginBottom: 20, position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,62,72,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,62,72,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Brain size={24} style={{ color: '#ff6b6b' }} />
            </div>
            <div>
              <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Train Your AI</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '3px 0 0', lineHeight: 1.4 }}>
                Correct AI responses — each fix improves your CreatorPal immediately
              </p>
            </div>
          </div>

          {/* Fine-tune button */}
          {status && status.canTrain && (
            <button
              type="button"
              onClick={handleFineTune}
              disabled={training || status.status === 'pending'}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 22px', borderRadius: 10,
                background: status.status === 'pending' ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff', fontSize: 13, fontWeight: 600, border: 'none',
                cursor: training || status.status === 'pending' ? 'default' : 'pointer',
                boxShadow: status.status !== 'pending' ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
                width: isMobile ? '100%' : 'auto', justifyContent: 'center',
              }}
            >
              <Zap size={14} />
              {training ? 'Starting…' : status.status === 'pending' ? 'Training…' : 'Fine-Tune AI'}
            </button>
          )}
        </div>
      </div>

      {/* ── Status card ── */}
      {!statusLoading && status && (
        <div style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: 16, padding: isMobile ? 16 : 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 16 : 28, flexDirection: isMobile ? 'column' : 'row' }}>

            {/* Big correction count */}
            <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 80 }}>
              <div style={{ fontSize: isMobile ? 40 : 52, fontWeight: 800, color: '#111827', lineHeight: 1, letterSpacing: '-0.04em' }}>
                {status.correctionCount}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
                Corrections
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: isMobile ? '100%' : 1, height: isMobile ? 1 : 56, background: '#ede8e3', flexShrink: 0 }} />

            {/* Progress + status */}
            <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  Progress to fine-tune
                </span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                  {status.correctionCount} / {status.minRequired} needed
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: '#f3f4f6', overflow: 'hidden', marginBottom: 10 }}>
                <div style={{
                  height: '100%', width: `${pct}%`, borderRadius: 99,
                  background: pct >= 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ff5b1f, #ff3e48)',
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: sc.bg }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: sc.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: sc.color }}>{sc.label}</span>
              </div>
            </div>

            {/* Last trained */}
            {status.lastFineTunedAt && (
              <div style={{ textAlign: isMobile ? 'left' : 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Last Trained</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  {new Date(status.lastFineTunedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f3f4f6', borderRadius: 12, padding: 4 }}>
        {(['review', 'corrections'] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{
            flex: 1, padding: '9px 16px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: tab === t ? '#fff' : 'transparent',
            color: tab === t ? '#111827' : '#6b7280',
            boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}>
            {t === 'review' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <MessageSquare size={14} /> Review Chats
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <CheckCircle size={14} /> Corrections
                {status && status.correctionCount > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#ff3e48', color: '#fff', borderRadius: 99, padding: '1px 7px', lineHeight: 1.6 }}>
                    {status.correctionCount}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── REVIEW TAB ── */}
      {tab === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {convLoading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading conversations…</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', background: '#fff', border: '1px solid #ede8e3', borderRadius: 16 }}>
              <MessageSquare size={32} style={{ color: '#e5e7eb', marginBottom: 12 }} />
              <p style={{ color: '#9ca3af', fontSize: 14, margin: 0, fontWeight: 500 }}>No conversations yet</p>
              <p style={{ color: '#d1d5db', fontSize: 12, margin: '4px 0 0' }}>Once fans chat with your AI, conversations will appear here</p>
            </div>
          ) : conversations.map(conv => (
            <div key={conv.id} style={{ background: '#fff', border: '1px solid #ede8e3', borderRadius: 14, overflow: 'hidden', transition: 'box-shadow 0.15s' }}>
              {/* Row */}
              <button type="button" onClick={() => handleExpandConv(conv.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'linear-gradient(135deg, #ff5b1f22, #ff3e4822)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, color: '#ff3e48', flexShrink: 0,
                }}>
                  {(conv.user?.name || 'A')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{conv.user?.name || 'Anonymous'}</div>
                  {conv.lastMessage && (
                    <div style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.lastMessage.preview}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#d1d5db', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>
                  {conv.totalMessages} msgs
                </span>
                <ChevronDown size={16} style={{ color: '#d1d5db', flexShrink: 0, transform: expandedConvId === conv.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {/* Expanded */}
              {expandedConvId === conv.id && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {messagesLoading && !convMessages[conv.id] ? (
                    <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 16 }}>Loading…</div>
                  ) : (convMessages[conv.id] || []).map((msg, idx) => {
                    const isAI = msg.role.toLowerCase() === 'assistant';
                    const prevMsg = (convMessages[conv.id] || [])[idx - 1];
                    const prevIsUser = prevMsg?.role.toLowerCase() === 'user';
                    const isEditing = isAI && editingMsg?.convId === conv.id && editingMsg?.aiMsg.id === msg.id;
                    const justSaved = isAI && savedMsgId === msg.id;

                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{
                          padding: '10px 14px', borderRadius: 12,
                          maxWidth: isMobile ? '95%' : '85%',
                          fontSize: 13, lineHeight: 1.55,
                          background: isAI ? '#f8f9fa' : '#fff5f5',
                          border: `1px solid ${isEditing ? '#fde68a' : isAI ? '#e5e7eb' : '#fecaca'}`,
                          color: '#111827',
                          alignSelf: isAI ? 'flex-start' : 'flex-end',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: isAI ? '#9ca3af' : '#ff3e48', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              {isAI ? '🤖 AI' : '👤 Fan'}
                            </span>
                            {isAI && prevIsUser && !isEditing && (
                              justSaved ? (
                                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <CheckCircle size={12} /> Saved
                                </span>
                              ) : (
                                <button type="button" onClick={() => handleEdit(conv.id, prevMsg, msg)} style={{
                                  display: 'flex', alignItems: 'center', gap: 4,
                                  padding: '2px 8px', borderRadius: 6,
                                  border: '1px solid #e5e7eb', background: '#fff',
                                  color: '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                }}>
                                  <Pencil size={10} /> Correct
                                </button>
                              )
                            )}
                          </div>
                          {msg.content}
                        </div>

                        {/* Inline editor */}
                        {isEditing && (
                          <div style={{
                            maxWidth: isMobile ? '100%' : '85%', padding: '14px 16px',
                            borderRadius: 12, background: '#fffbeb', border: '1.5px solid #fde68a',
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                              ✏️ Write the better response
                            </div>
                            <textarea
                              autoFocus
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              rows={4}
                              style={{
                                width: '100%', padding: '10px 12px', borderRadius: 8,
                                border: '1.5px solid #fde68a', fontSize: 13, lineHeight: 1.5,
                                resize: 'vertical', outline: 'none', background: '#fff',
                                boxSizing: 'border-box', fontFamily: 'inherit', color: '#111827',
                              }}
                            />
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              <button type="button" onClick={handleSave} disabled={saving || !editText.trim()} style={{
                                padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
                                background: saving || !editText.trim() ? '#e5e7eb' : '#ff3e48',
                                color: saving || !editText.trim() ? '#9ca3af' : '#fff',
                                cursor: saving || !editText.trim() ? 'not-allowed' : 'pointer',
                              }}>
                                {saving ? 'Saving…' : 'Save Correction'}
                              </button>
                              <button type="button" onClick={() => setEditingMsg(null)} style={{
                                padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer',
                              }}>Cancel</button>
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

      {/* ── CORRECTIONS TAB ── */}
      {tab === 'corrections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {corrLoading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading corrections…</div>
          ) : corrections.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', background: '#fff', border: '1px solid #ede8e3', borderRadius: 16 }}>
              <CheckCircle size={32} style={{ color: '#e5e7eb', marginBottom: 12 }} />
              <p style={{ color: '#9ca3af', fontSize: 14, margin: 0, fontWeight: 500 }}>No corrections yet</p>
              <p style={{ color: '#d1d5db', fontSize: 12, margin: '4px 0 0' }}>Go to "Review Chats" and tap Correct on any AI response to start training</p>
            </div>
          ) : corrections.map(c => (
            <div key={c.id} style={{
              background: '#fff', border: `1px solid ${c.isActive ? '#ede8e3' : '#f3f4f6'}`,
              borderRadius: 16, padding: isMobile ? 14 : 20,
              opacity: c.isActive ? 1 : 0.5, transition: 'opacity 0.2s',
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Fan asked</div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, fontWeight: 500 }}>
                    "{c.userMessage.slice(0, 120)}{c.userMessage.length > 120 ? '…' : ''}"
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button type="button" onClick={() => handleToggle(c.id)} style={{
                    padding: '5px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
                    background: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    color: c.isActive ? '#f59e0b' : '#10b981',
                  }}>
                    {c.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button type="button" onClick={() => handleDelete(c.id)} style={{
                    width: 30, height: 30, borderRadius: 8, border: '1px solid #fecaca',
                    background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444',
                  }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Comparison — stacks on mobile */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                <div style={{ padding: '12px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <XCircle size={13} style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Original AI response</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
                    {c.rejectedResponse.slice(0, 200)}{c.rejectedResponse.length > 200 ? '…' : ''}
                  </div>
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <CheckCircle size={13} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your correction</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
                    {c.chosenResponse.slice(0, 200)}{c.chosenResponse.length > 200 ? '…' : ''}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 10 }}>
                {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suppress unused var warning */}
      {false && training && handleFineTune}
    </div>
  );
}
