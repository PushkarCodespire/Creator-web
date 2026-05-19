import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { message as antMessage } from 'antd';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { creatorApi, contentApi } from '../../services/api';
import { Bot, Save, Youtube, FileText, HelpCircle, Trash2, RotateCcw, Eye, X, ChevronUp, Mic, Brain, MessageSquare, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { VoiceCloneSection } from '../../components/VoiceCloneSection/VoiceCloneSection';

const card: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ede8e3',
  borderRadius: 16,
  padding: 24,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ede8e3',
  fontSize: 14, outline: 'none', background: '#fff', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block',
};

export const SCENARIO_QUESTIONS = [
  "A fan says they keep making excuses not to show up. What do you tell them?",
  "A fan asks what your biggest mistake was early in your journey.",
  "A fan asks your honest opinion on a controversial topic in your space.",
  "A complete beginner asks where to start. What's your first advice?",
  "A fan asks how you stay motivated when you really don't feel like it.",
  "A fan is comparing themselves to others and feeling behind. What do you say?",
  "A fan asks what one piece of advice you'd give your younger self.",
  "A fan wants to know what a typical day looks like for you.",
  "A fan asks what's the most overrated thing people do in your niche.",
  "A fan asks what separates people who succeed from those who don't.",
];

const CreatorYourAI = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  // AI Config
  const [aiTone, setAiTone] = useState(user?.creator?.aiTone || '');
  const [aiPersonality, setAiPersonality] = useState(user?.creator?.aiPersonality || '');
  const [welcomeMessage, setWelcomeMessage] = useState(user?.creator?.welcomeMessage || '');

  // Structured Persona Config
  const [energyLevel, setEnergyLevel] = useState<'calm' | 'balanced' | 'high-energy' | ''>('');
  const [honestyStyle, setHonestyStyle] = useState<'supportive' | 'direct' | 'tough-love' | ''>('');
  const [humor, setHumor] = useState<'none' | 'light' | 'sarcastic' | ''>('');
  const [responseFormat, setResponseFormat] = useState<'short-punchy' | 'detailed' | 'bullet-lists' | ''>('');
  const [signaturePhrases, setSignaturePhrases] = useState<string[]>(['', '', '']);
  const [opinionatedTopics, setOpinionatedTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [fewShotAnswers, setFewShotAnswers] = useState<string[]>(Array(10).fill(''));
  const [currentScenario, setCurrentScenario] = useState(0);
  const [savingAi, setSavingAi] = useState(false);

  // Knowledge Base
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contents, setContents] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add content forms
  const [showAddYoutube, setShowAddYoutube] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [showAddFaq, setShowAddFaq] = useState(false);

  const [ytUrl, setYtUrl] = useState('');
  const [ytPreview, setYtPreview] = useState('');
  const [ytFetching, setYtFetching] = useState(false);
  const [ytError, setYtError] = useState('');

  const [manualTitle, setManualTitle] = useState('');
  const [manualText, setManualText] = useState('');

  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // AI Summary modal — stored in DB
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryNeedsRegenerate, setSummaryNeedsRegenerate] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [_summaryLoaded, setSummaryLoaded] = useState(false);

  // Fine-tune state
  const [ftStatus, setFtStatus] = useState<'none' | 'pending' | 'ready' | 'failed'>('none');
  const [ftCorrections, setFtCorrections] = useState(0);
  const [ftMinRequired, setFtMinRequired] = useState(10);
  const [ftCanTrain, setFtCanTrain] = useState(false);
  const [ftLastTrained, setFtLastTrained] = useState<string | null>(null);
  const [ftRunning, setFtRunning] = useState(false);

  // Voice clone status — owned and updated by <VoiceCloneSection />
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);

  // Auto-poll when any content is PROCESSING
  useEffect(() => {
    const hasProcessing = contents.some((c: { status?: string }) => c.status === 'PROCESSING');
    if (!hasProcessing) return;
    const interval = setInterval(() => {
      fetchContents();
    }, 3000);
    return () => clearInterval(interval);
  }, [contents]);

  useEffect(() => {
    fetchContents();
    // Fetch fresh creator profile so AI fields are always up-to-date
    // (the Redux store only stores a subset of creator fields at login)
    (async () => {
      try {
        const res = await creatorApi.getDashboard();
        const creator = res.data.data;
        if (creator) {
          if (creator.aiTone) setAiTone(creator.aiTone);
          if (creator.aiPersonality) setAiPersonality(creator.aiPersonality);
          if (creator.welcomeMessage) setWelcomeMessage(creator.welcomeMessage);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pc = creator.personaConfig as any;
          if (pc) {
            if (pc.energyLevel) setEnergyLevel(pc.energyLevel);
            if (pc.honestyStyle) setHonestyStyle(pc.honestyStyle);
            if (pc.humor) setHumor(pc.humor);
            if (pc.responseFormat) setResponseFormat(pc.responseFormat);
            if (pc.signaturePhrases) setSignaturePhrases([...pc.signaturePhrases, '', '', ''].slice(0, 3));
            if (pc.opinionatedTopics) setOpinionatedTopics(pc.opinionatedTopics);
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const qa = creator.fewShotQA as any[];
          if (Array.isArray(qa)) {
            const answers = Array(10).fill('');
            qa.forEach((item: { scenario: string; answer: string }) => {
              const idx = SCENARIO_QUESTIONS.indexOf(item.scenario);
              if (idx !== -1) answers[idx] = item.answer || '';
            });
            setFewShotAnswers(answers);
          }
          dispatch(updateUser({ creator: { ...user?.creator, ...creator } } as Parameters<typeof updateUser>[0]));
        }
      } catch {}
    })();
    // Voice clone status is now loaded inside <VoiceCloneSection />
    // Load cached summary from DB
    (async () => {
      try {
        const res = await contentApi.getAiSummary();
        const data = res.data.data;
        if (data?.summary) setSummary(data.summary);
        if (data?.needsRegenerate) setSummaryNeedsRegenerate(true);
        setSummaryLoaded(true);
      } catch {
        setSummaryLoaded(true);
      }
    })();

    // Load fine-tune status
    fetchFineTuneStatus();
  }, []);

  // Auto-poll while fine-tuning is pending
  useEffect(() => {
    if (ftStatus !== 'pending') return;
    const interval = setInterval(fetchFineTuneStatus, 30000); // every 30s
    return () => clearInterval(interval);
  }, [ftStatus]);

  const fetchFineTuneStatus = async () => {
    try {
      const res = await creatorApi.getTrainingStatus();
      const d = res.data.data;
      setFtStatus(d.status || 'none');
      setFtCorrections(d.totalExamples ?? d.correctionCount ?? 0);
      setFtMinRequired(d.minRequired || 10);
      setFtCanTrain(d.canTrain || false);
      if (d.lastFineTunedAt) setFtLastTrained(d.lastFineTunedAt);
    } catch {}
  };

  const handleStartFineTune = async () => {
    if (!ftCanTrain || ftRunning) return;
    setFtRunning(true);
    try {
      await creatorApi.startFineTune();
      setFtStatus('pending');
      antMessage.success('Fine-tuning started — check back in 15–20 minutes.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      antMessage.error(msg || 'Failed to start fine-tuning.');
    } finally {
      setFtRunning(false);
    }
  };

  const fetchContents = async () => {
    try {
      const res = await contentApi.getAll();
      const items = res.data.data?.contents || res.data.data || [];
      setContents(Array.isArray(items) ? items : []);
    } catch {}
    finally { setLoadingContent(false); }
  };

  const showMsg = (text: string) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handleOpenSummary = () => {
    // If we have a cached summary and it doesn't need regenerating, just show it
    if (summary && !summaryNeedsRegenerate) {
      setShowSummaryModal(true);
      return;
    }
    // Otherwise generate
    handleGenerateSummary();
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    setSummary('');
    setShowSummaryModal(true);
    try {
      const res = await contentApi.generateAiSummary();
      const text = res.data.data?.summary || 'No summary could be generated.';
      setSummary(text);
      setSummaryNeedsRegenerate(false);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setSummary(`Failed to generate summary: ${err?.response?.data?.error?.message || err?.message || 'Unknown error'}`);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleSaveAi = async () => {
    setSavingAi(true);
    try {
      const filledPhrases = signaturePhrases.filter(p => p.trim());
      const personaConfig = {
        ...(energyLevel && { energyLevel }),
        ...(honestyStyle && { honestyStyle }),
        ...(humor && { humor }),
        ...(responseFormat && { responseFormat }),
        ...(filledPhrases.length > 0 && { signaturePhrases: filledPhrases }),
        ...(opinionatedTopics.length > 0 && { opinionatedTopics }),
      };
      const fewShotQA = SCENARIO_QUESTIONS
        .map((scenario, i) => ({ scenario, answer: fewShotAnswers[i]?.trim() || '' }))
        .filter(qa => qa.answer.length > 0);
      await creatorApi.updateProfile({ aiTone, aiPersonality, welcomeMessage, personaConfig, fewShotQA });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch(updateUser({ creator: { ...user?.creator, aiTone, aiPersonality, welcomeMessage } } as any));
      showMsg('AI settings saved!');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      showMsg(err?.response?.data?.error || 'Failed to save');
    } finally { setSavingAi(false); }
  };

  const handleFetchTranscript = async () => {
    if (!ytUrl.trim()) return;
    setYtFetching(true); setYtError(''); setYtPreview('');
    try {
      const res = await contentApi.previewYouTube(ytUrl);
      setYtPreview(res.data.data?.transcript || 'No transcript found');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } }; message?: string };
      setYtError(err?.response?.data?.error?.message || err?.message || 'Failed to fetch transcript');
    } finally { setYtFetching(false); }
  };

  const handleAddYoutube = async () => {
    if (!ytUrl.trim()) return;
    setSaving(true);
    try {
      await contentApi.addYouTube(ytUrl);
      showMsg('YouTube content added! Processing...');
      setYtUrl(''); setYtPreview(''); setShowAddYoutube(false);
      await fetchContents();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string }; status?: number }; message?: string };
      if (err?.response?.status === 429) {
        antMessage.warning("You've reached the daily limit of 5 YouTube videos. Try again tomorrow.", 5);
      } else {
        showMsg(err?.response?.data?.error || err?.message || 'Failed to add');
      }
    } finally { setSaving(false); }
  };

  const handleAddManual = async () => {
    if (!manualText.trim() || manualText.length < 10) return;
    setSaving(true);
    try {
      await contentApi.addManual(manualTitle || 'Untitled', manualText);
      showMsg('Manual content added!');
      setManualTitle(''); setManualText(''); setShowAddManual(false);
      await fetchContents();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      showMsg(err?.response?.data?.error || 'Failed to add');
    } finally { setSaving(false); }
  };

  const handleAddFaq = async () => {
    if (!faqQ.trim() || !faqA.trim()) return;
    setSaving(true);
    try {
      await contentApi.addFAQ('FAQ', [{ question: faqQ, answer: faqA }]);
      showMsg('FAQ added!');
      setFaqQ(''); setFaqA(''); setShowAddFaq(false);
      await fetchContents();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } | string } } };
      const errMsg = typeof err?.response?.data?.error === 'string' ? err.response.data.error : (err?.response?.data?.error as { message?: string })?.message;
      showMsg(errMsg || 'Failed to add');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await contentApi.delete(id);
      setContents(prev => prev.filter(c => c.id !== id));
      showMsg('Content deleted');
    } catch { showMsg('Failed to delete'); }
  };

  const handleRetrain = async (id: string) => {
    try {
      await contentApi.retrain(id);
      showMsg('Retraining started!');
      await fetchContents();
    } catch { showMsg('Failed to retrain'); }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'YOUTUBE_VIDEO') return <Youtube size={16} style={{ color: '#ff0000' }} />;
    if (type === 'FAQ') return <HelpCircle size={16} style={{ color: '#ff3e48' }} />;
    return <FileText size={16} style={{ color: '#3b82f6' }} />;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      COMPLETED: { bg: '#ecfdf5', color: '#10b981' },
      PROCESSING: { bg: '#fffbeb', color: '#f59e0b' },
      PENDING: { bg: '#f3f4f6', color: '#6b7280' },
      FAILED: { bg: '#fef2f2', color: '#ef4444' },
    };
    const c = colors[status] || colors.PENDING;
    return <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: c.bg, color: c.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{status}</span>;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>Your AI</h1>
          <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Configure your AI personality and manage its knowledge base</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {msg && <span style={{ fontSize: 13, fontWeight: 600, color: msg.includes('Failed') ? '#ef4444' : '#10b981' }}>{msg}</span>}
          {/* Fine-Tune button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={handleStartFineTune}
              disabled={!ftCanTrain || ftRunning || ftStatus === 'pending'}
              title={
                ftStatus === 'pending'   ? 'Training in progress — check back soon' :
                ftStatus === 'ready'     ? `Fine-tuned model active${ftLastTrained ? ` · ${new Date(ftLastTrained).toLocaleDateString()}` : ''}` :
                !ftCanTrain              ? `${ftCorrections}/${ftMinRequired} corrections needed to fine-tune` :
                'Fine-tune your AI on real corrections'
              }
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10,
                background: ftStatus === 'ready'
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : ftStatus === 'pending'
                  ? '#6b7280'
                  : ftCanTrain
                  ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                  : '#e5e7eb',
                color: ftCanTrain || ftStatus !== 'none' ? '#fff' : '#9ca3af',
                fontSize: 13, fontWeight: 600, border: 'none',
                cursor: ftCanTrain && ftStatus !== 'pending' ? 'pointer' : 'default',
                boxShadow: ftCanTrain && ftStatus !== 'pending' ? '0 4px 12px rgba(99,102,241,0.25)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Zap size={14} />
              {ftStatus === 'pending' ? 'Training...' :
               ftStatus === 'ready'   ? 'Re-Train' :
               ftStatus === 'failed'  ? 'Retry Fine-Tune' :
               ftCanTrain             ? 'Fine-Tune AI' :
               `${ftCorrections}/${ftMinRequired} to Fine-Tune`}
            </button>
          </div>

          <button type="button" onClick={handleOpenSummary} disabled={generatingSummary} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg, #ff5b1f 0%, #ff3e48 100%)', color: '#fff',
            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255,62,72,0.25)',
          }}>
            <Brain size={15} /> {generatingSummary ? 'Generating...' : 'AI Summary'}
          </button>
        </div>
      </div>

      {/* AI Summary Modal */}
      {showSummaryModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setShowSummaryModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 640, maxHeight: '80vh', background: '#fff', borderRadius: 20,
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #f0ebe6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, #1a0f0f 0%, #2d1515 100%)', color: '#fff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Brain size={20} style={{ color: '#ff6b6b' }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>AI Summary</h2>
              </div>
              <button type="button" onClick={() => setShowSummaryModal(false)} style={{
                width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.1)',
                border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {generatingSummary ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Brain size={20} style={{ color: '#ff3e48', animation: 'spin 2s linear infinite' }} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Analyzing your AI...</div>
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>Reading all training data and generating a comprehensive summary</div>
                  <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
                </div>
              ) : (
                <div className="ai-summary-content" style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
                  <ReactMarkdown>{summary}</ReactMarkdown>
                  <style>{`
                    .ai-summary-content h1, .ai-summary-content h2 { font-size: 18px; font-weight: 700; color: #111827; margin: 20px 0 8px; }
                    .ai-summary-content h3 { font-size: 16px; font-weight: 700; color: #111827; margin: 16px 0 6px; }
                    .ai-summary-content h4 { font-size: 14px; font-weight: 700; color: #111827; margin: 12px 0 4px; }
                    .ai-summary-content p { margin: 6px 0; }
                    .ai-summary-content ul, .ai-summary-content ol { margin: 8px 0; padding-left: 20px; }
                    .ai-summary-content li { margin: 4px 0; }
                    .ai-summary-content strong { font-weight: 700; color: #111827; }
                    .ai-summary-content code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
                    .ai-summary-content blockquote { border-left: 3px solid #ff3e48; margin: 12px 0; padding: 8px 16px; color: #6b7280; background: #fafaf8; border-radius: 0 8px 8px 0; }
                  `}</style>
                </div>
              )}
            </div>
            {!generatingSummary && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f0ebe6', display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" onClick={() => handleGenerateSummary()} style={{
                  padding: '8px 18px', borderRadius: 8, background: '#fff', color: '#6b7280', fontSize: 13, fontWeight: 600, border: '1px solid #ede8e3', cursor: 'pointer',
                }}>Regenerate</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Knowledge Summary Stats */}
      {(() => {
        const completedContents = contents.filter(c => c.status === 'COMPLETED');
        const totalChunks = completedContents.reduce((sum: number, c: { _count?: { chunks?: number } }) => sum + (c._count?.chunks || 0), 0);
        const youtubeCount = completedContents.filter(c => c.type === 'YOUTUBE_VIDEO').length;
        const manualCount = completedContents.filter(c => c.type === 'MANUAL_TEXT').length;
        const faqCount = completedContents.filter(c => c.type === 'FAQ').length;
        const processingCount = contents.filter(c => c.status === 'PROCESSING').length;
        const totalChars = completedContents.reduce((sum: number, c: { rawText?: string }) => sum + (c.rawText?.length || 0), 0);

        if (completedContents.length === 0 && processingCount === 0) return null;

        return (
          <div style={{
            ...card, marginBottom: 20,
            background: 'linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #0a0505 100%)',
            color: '#fff', border: 'none', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,62,72,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,62,72,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={20} style={{ color: '#ff6b6b' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>AI Knowledge Summary</h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>What your CreatorPal knows</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{completedContents.length}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Sources</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{totalChunks}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Knowledge Chunks</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{totalChars > 1000 ? `${(totalChars / 1000).toFixed(1)}k` : totalChars}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Characters</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: processingCount > 0 ? '#f59e0b' : '#10b981' }}>{processingCount > 0 ? processingCount : '✓'}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{processingCount > 0 ? 'Processing' : 'All Ready'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                {youtubeCount > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Youtube size={12} style={{ color: '#ff4444' }} /> {youtubeCount} video{youtubeCount > 1 ? 's' : ''}</div>}
                {manualCount > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={12} style={{ color: '#60a5fa' }} /> {manualCount} text{manualCount > 1 ? 's' : ''}</div>}
                {faqCount > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HelpCircle size={12} style={{ color: '#fbbf24' }} /> {faqCount} FAQ{faqCount > 1 ? 's' : ''}</div>}
              </div>

              {(energyLevel || honestyStyle || humor || responseFormat) && (
                <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <MessageSquare size={10} /> Persona Style
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {energyLevel && <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(139,92,246,0.2)', color: '#c4b5fd', fontSize: 11, fontWeight: 600 }}>{energyLevel}</span>}
                    {honestyStyle && <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.2)', color: '#fcd34d', fontSize: 11, fontWeight: 600 }}>{honestyStyle}</span>}
                    {humor && humor !== 'none' && <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: 11, fontWeight: 600 }}>{humor} humor</span>}
                    {responseFormat && <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.2)', color: '#93c5fd', fontSize: 11, fontWeight: 600 }}>{responseFormat}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* AI Personality Config */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}><Bot size={18} /></div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>AI Personality</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Pick how your CreatorPal sounds — the AI uses these exactly</p>
          </div>
        </div>

        {/* 2×2 button group grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          {/* Energy Level */}
          <div style={{ padding: '14px 16px', borderRadius: 10, background: '#f9fafb', border: '1px solid #ede8e3' }}>
            <label style={{ ...labelStyle, marginBottom: 10, display: 'block' }}>Energy Level</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(['calm', 'balanced', 'high-energy'] as const).map(opt => (
                <button key={opt} type="button" onClick={() => setEnergyLevel(energyLevel === opt ? '' : opt)} style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                  borderColor: energyLevel === opt ? '#8b5cf6' : '#e5e7eb',
                  background: energyLevel === opt ? '#f5f3ff' : '#fff',
                  color: energyLevel === opt ? '#8b5cf6' : '#6b7280',
                }}>
                  {opt === 'calm' ? '😌 Calm' : opt === 'balanced' ? '⚖️ Balanced' : '⚡ High-Energy'}
                </button>
              ))}
            </div>
          </div>

          {/* Honesty Style */}
          <div style={{ padding: '14px 16px', borderRadius: 10, background: '#f9fafb', border: '1px solid #ede8e3' }}>
            <label style={{ ...labelStyle, marginBottom: 10, display: 'block' }}>Honesty Style</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(['supportive', 'direct', 'tough-love'] as const).map(opt => (
                <button key={opt} type="button" onClick={() => setHonestyStyle(honestyStyle === opt ? '' : opt)} style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                  borderColor: honestyStyle === opt ? '#f59e0b' : '#e5e7eb',
                  background: honestyStyle === opt ? '#fffbeb' : '#fff',
                  color: honestyStyle === opt ? '#d97706' : '#6b7280',
                }}>
                  {opt === 'supportive' ? '🤗 Supportive' : opt === 'direct' ? '🎯 Direct' : '💪 Tough Love'}
                </button>
              ))}
            </div>
          </div>

          {/* Humor */}
          <div style={{ padding: '14px 16px', borderRadius: 10, background: '#f9fafb', border: '1px solid #ede8e3' }}>
            <label style={{ ...labelStyle, marginBottom: 10, display: 'block' }}>Humor</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(['none', 'light', 'sarcastic'] as const).map(opt => (
                <button key={opt} type="button" onClick={() => setHumor(humor === opt ? '' : opt)} style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                  borderColor: humor === opt ? '#10b981' : '#e5e7eb',
                  background: humor === opt ? '#ecfdf5' : '#fff',
                  color: humor === opt ? '#059669' : '#6b7280',
                }}>
                  {opt === 'none' ? '🧱 None' : opt === 'light' ? '😄 Light' : '😏 Sarcastic'}
                </button>
              ))}
            </div>
          </div>

          {/* Response Format */}
          <div style={{ padding: '14px 16px', borderRadius: 10, background: '#f9fafb', border: '1px solid #ede8e3' }}>
            <label style={{ ...labelStyle, marginBottom: 10, display: 'block' }}>Response Format</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(['short-punchy', 'detailed', 'bullet-lists'] as const).map(opt => (
                <button key={opt} type="button" onClick={() => setResponseFormat(responseFormat === opt ? '' : opt)} style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                  borderColor: responseFormat === opt ? '#3b82f6' : '#e5e7eb',
                  background: responseFormat === opt ? '#eff6ff' : '#fff',
                  color: responseFormat === opt ? '#2563eb' : '#6b7280',
                }}>
                  {opt === 'short-punchy' ? '⚡ Short & Punchy' : opt === 'detailed' ? '📝 Detailed' : '• Bullet Lists'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Signature Phrases — 3 horizontal inputs */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Signature Phrases <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#b0b8c1' }}>— things you actually say (optional)</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 6 }}>
            {signaturePhrases.map((phrase, i) => (
              <input key={i} type="text" value={phrase} onChange={(e) => {
                const next = [...signaturePhrases];
                next[i] = e.target.value;
                setSignaturePhrases(next);
              }} placeholder={`e.g. "${["Let's get it", "No excuses", "Consistency is king"][i]}"`} style={inputStyle} />
            ))}
          </div>
        </div>

        {/* Opinionated Topics */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Topics You Have Strong Opinions On <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#b0b8c1' }}>— AI speaks with conviction here</span></label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input type="text" value={topicInput} onChange={e => setTopicInput(e.target.value)}
              onKeyDown={e => {
                if ((e.key === 'Enter' || e.key === ',') && topicInput.trim()) {
                  e.preventDefault();
                  setOpinionatedTopics(prev => [...prev, topicInput.trim()]);
                  setTopicInput('');
                }
              }}
              placeholder="Type a topic and press Enter" style={{ ...inputStyle, flex: 1 }} />
            <button type="button" onClick={() => {
              if (topicInput.trim()) { setOpinionatedTopics(prev => [...prev, topicInput.trim()]); setTopicInput(''); }
            }} style={{ padding: '0 16px', borderRadius: 8, background: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Add
            </button>
          </div>
          {opinionatedTopics.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {opinionatedTopics.map((t, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: '#f3f4f6', fontSize: 12, fontWeight: 600, color: '#374151' }}>
                  {t}
                  <button type="button" onClick={() => setOpinionatedTopics(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Welcome Message */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Welcome Message</label>
          <input type="text" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} placeholder="First thing your AI says to a new fan" style={inputStyle} />
        </div>

        <button type="button" onClick={handleSaveAi} disabled={savingAi} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 8,
          background: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
        }}>
          <Save size={14} /> {savingAi ? 'Saving...' : 'Save AI Settings'}
        </button>
      </div>

      {/* Scenario Training */}
      {(() => {
        const answered = fewShotAnswers.filter(a => a.trim().length > 0).length;
        const pct = Math.round((answered / 10) * 100);
        const strengthLabel = answered === 0 ? 'Not started' : answered <= 3 ? 'Weak' : answered <= 6 ? 'Getting there' : answered <= 9 ? 'Strong' : 'Fully trained';
        const strengthColor = answered === 0 ? '#9ca3af' : answered <= 3 ? '#ef4444' : answered <= 6 ? '#f59e0b' : answered <= 9 ? '#3b82f6' : '#10b981';
        return (
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff5b1f' }}><MessageSquare size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Scenario Training</h3>
                  <span style={{ fontSize: 12, fontWeight: 700, color: strengthColor }}>{answered}/10 — {strengthLabel}</span>
                </div>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Answer these in your own voice — the AI learns exactly how you talk</p>
              </div>
            </div>

            {/* Strength bar */}
            <div style={{ height: 6, borderRadius: 99, background: '#f3f4f6', marginBottom: 16, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: `linear-gradient(90deg, ${strengthColor}, ${strengthColor}cc)`, transition: 'width 0.4s ease' }} />
            </div>

            {/* Single question view */}
            <div style={{ minHeight: 110, marginBottom: 14 }}>
              <label style={{ ...labelStyle, color: '#374151', display: 'block', marginBottom: 8, lineHeight: 1.5 }}>
                {currentScenario + 1}. {SCENARIO_QUESTIONS[currentScenario]}
              </label>
              <textarea
                value={fewShotAnswers[currentScenario]}
                onChange={e => {
                  const next = [...fewShotAnswers];
                  next[currentScenario] = e.target.value;
                  setFewShotAnswers(next);
                }}
                placeholder="Write your answer here in your own words..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', padding: '8px 12px', minHeight: 72, fontSize: 13, lineHeight: 1.5, width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Numbered pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setCurrentScenario(i => Math.max(0, i - 1))} disabled={currentScenario === 0}
                style={{ padding: '5px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: '1px solid #e5e7eb', background: '#fff', color: currentScenario === 0 ? '#d1d5db' : '#374151', cursor: currentScenario === 0 ? 'not-allowed' : 'pointer' }}>
                ← Prev
              </button>
              <div style={{ display: 'flex', gap: 5 }}>
                {SCENARIO_QUESTIONS.map((_, i) => {
                  const isActive = i === currentScenario;
                  const isDone = fewShotAnswers[i]?.trim().length > 0;
                  return (
                    <button key={i} type="button" onClick={() => setCurrentScenario(i)} style={{
                      width: 28, height: 28, borderRadius: 7, fontSize: 11, fontWeight: 700, border: '1.5px solid',
                      borderColor: isActive ? '#ff5b1f' : isDone ? '#10b981' : '#e5e7eb',
                      background: isActive ? '#ff5b1f' : isDone ? '#ecfdf5' : '#fff',
                      color: isActive ? '#fff' : isDone ? '#10b981' : '#9ca3af',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={() => setCurrentScenario(i => Math.min(9, i + 1))} disabled={currentScenario === 9}
                style={{ padding: '5px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: '1px solid #e5e7eb', background: '#fff', color: currentScenario === 9 ? '#d1d5db' : '#374151', cursor: currentScenario === 9 ? 'not-allowed' : 'pointer' }}>
                Next →
              </button>
            </div>

            <div style={{ marginTop: 14, borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
              <button type="button" onClick={handleSaveAi} disabled={savingAi} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 8,
                background: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              }}>
                <Save size={14} /> {savingAi ? 'Saving...' : 'Save Answers'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Voice Clone */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}><Mic size={18} /></div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Voice Clone</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Record up to 10 clips — more clips = better voice accuracy</p>
          </div>
          {voiceStatus === 'READY' && (
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '3px 10px', borderRadius: 6 }}>
              Active
            </span>
          )}
        </div>

        <VoiceCloneSection onStatusChange={setVoiceStatus} />
      </div>

      {/* Knowledge Base */}
      <div style={{ ...card }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Knowledge Base</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Everything your AI knows — {contents.length} item{contents.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => { setShowAddYoutube(true); setShowAddManual(false); setShowAddFaq(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 8, background: '#fff5f5', color: '#ff3e48', fontSize: 12, fontWeight: 600, border: '1px solid #fecaca', cursor: 'pointer' }}>
              <Youtube size={13} /> YouTube
            </button>
            <button type="button" onClick={() => { setShowAddManual(true); setShowAddYoutube(false); setShowAddFaq(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 8, background: '#eff6ff', color: '#3b82f6', fontSize: 12, fontWeight: 600, border: '1px solid #bfdbfe', cursor: 'pointer' }}>
              <FileText size={13} /> Text
            </button>
            <button type="button" onClick={() => { setShowAddFaq(true); setShowAddYoutube(false); setShowAddManual(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 8, background: '#fef3c7', color: '#d97706', fontSize: 12, fontWeight: 600, border: '1px solid #fde68a', cursor: 'pointer' }}>
              <HelpCircle size={13} /> FAQ
            </button>
          </div>
        </div>

        {/* Add YouTube Form */}
        {showAddYoutube && (
          <div style={{ padding: 16, borderRadius: 12, border: '1px solid #fecaca', background: '#fff5f5', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Add YouTube Video</span>
              <button type="button" onClick={() => setShowAddYoutube(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="text" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} placeholder="Paste YouTube URL" style={{ ...inputStyle, flex: 1 }} />
              <button type="button" disabled={!ytUrl.trim() || ytFetching} onClick={handleFetchTranscript} style={{
                padding: '0 16px', borderRadius: 8, background: ytFetching ? '#d1d5db' : '#ff3e48', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: ytFetching ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
              }}>
                {ytFetching ? 'Fetching...' : 'Fetch Transcript'}
              </button>
            </div>
            {ytError && <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 12, marginBottom: 8 }}>{ytError}</div>}
            {ytPreview && (
              <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 12, color: '#374151', maxHeight: 150, overflowY: 'auto', lineHeight: 1.5, marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>TRANSCRIPT PREVIEW ({ytPreview.length} chars)</div>
                {ytPreview}
              </div>
            )}
            <button type="button" disabled={saving || !ytUrl.trim()} onClick={handleAddYoutube} style={{
              padding: '8px 20px', borderRadius: 8, background: '#ff3e48', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}>
              {saving ? 'Adding...' : 'Add to Knowledge Base'}
            </button>
          </div>
        )}

        {/* Add Manual Form */}
        {showAddManual && (
          <div style={{ padding: 16, borderRadius: 12, border: '1px solid #bfdbfe', background: '#eff6ff', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Add Manual Content</span>
              <button type="button" onClick={() => setShowAddManual(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={16} /></button>
            </div>
            <input type="text" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Title" style={{ ...inputStyle, marginBottom: 8 }} />
            <textarea value={manualText} onChange={(e) => setManualText(e.target.value)} placeholder="Paste your content here..." rows={4} style={{ ...inputStyle, resize: 'none', marginBottom: 8 }} />
            {manualText && <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>{manualText.length} characters</div>}
            <button type="button" disabled={saving || manualText.length < 10} onClick={handleAddManual} style={{
              padding: '8px 20px', borderRadius: 8, background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}>
              {saving ? 'Adding...' : 'Add to Knowledge Base'}
            </button>
          </div>
        )}

        {/* Add FAQ Form */}
        {showAddFaq && (
          <div style={{ padding: 16, borderRadius: 12, border: '1px solid #fde68a', background: '#fef3c7', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Add FAQ</span>
              <button type="button" onClick={() => setShowAddFaq(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={16} /></button>
            </div>
            <input type="text" value={faqQ} onChange={(e) => setFaqQ(e.target.value)} placeholder="Question" style={{ ...inputStyle, marginBottom: 8 }} />
            <input type="text" value={faqA} onChange={(e) => setFaqA(e.target.value)} placeholder="Answer" style={{ ...inputStyle, marginBottom: 8 }} />
            <button type="button" disabled={saving || !faqQ.trim() || !faqA.trim()} onClick={handleAddFaq} style={{
              padding: '8px 20px', borderRadius: 8, background: '#d97706', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}>
              {saving ? 'Adding...' : 'Add FAQ'}
            </button>
          </div>
        )}

        {/* Content List */}
        {loadingContent ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>Loading knowledge base...</div>
        ) : contents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            <Bot size={40} style={{ color: '#d1d5db', marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>No training data yet</div>
            <div style={{ fontSize: 13 }}>Add YouTube videos, text content, or FAQs to train your AI</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contents.map((c) => (
              <div key={c.id} style={{
                padding: '14px 16px', borderRadius: 10, border: '1px solid #ede8e3',
                background: expandedId === c.id ? '#fafaf8' : '#fff',
                transition: 'background 0.15s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flexShrink: 0 }}>{getTypeIcon(c.type)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title || 'Untitled'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      {getStatusBadge(c.status)}
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{c._count?.chunks || 0} chunks</span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{c.type?.replace('_', ' ')}</span>
                    </div>
                    {c.status === 'FAILED' && c.errorMessage && (
                      <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{c.errorMessage}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button type="button" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)} title="Preview" style={{
                      width: 30, height: 30, borderRadius: 6, border: '1px solid #ede8e3', background: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280',
                    }}>
                      {expandedId === c.id ? <ChevronUp size={14} /> : <Eye size={14} />}
                    </button>
                    {(c.status === 'COMPLETED' || c.status === 'FAILED') && (
                      <button type="button" onClick={() => handleRetrain(c.id)} title={c.status === 'FAILED' ? 'Retry processing' : 'Retrain'} style={{
                        width: 30, height: 30, borderRadius: 6,
                        border: c.status === 'FAILED' ? '1px solid #fecaca' : '1px solid #bfdbfe',
                        background: c.status === 'FAILED' ? '#fff1f1' : '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        color: c.status === 'FAILED' ? '#ef4444' : '#3b82f6',
                      }}>
                        <RotateCcw size={13} />
                      </button>
                    )}
                    <button type="button" onClick={() => handleDelete(c.id)} title="Delete" style={{
                      width: 30, height: 30, borderRadius: 6, border: '1px solid #fecaca', background: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ff3e48',
                    }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {/* Expanded preview */}
                {expandedId === c.id && (
                  <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 8, background: '#fff', border: '1px solid #ede8e3', fontSize: 12, color: '#6b7280', lineHeight: 1.6, maxHeight: 240, overflowY: 'auto' }}>
                    {c.type === 'FAQ' && c.rawText ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {c.rawText.split('\n\n').filter(Boolean).map((pair: string, i: number) => {
                          const qLine = pair.split('\n').find((l: string) => l.startsWith('Q:'));
                          const aLine = pair.split('\n').find((l: string) => l.startsWith('A:'));
                          return (
                            <div key={i} style={{ borderLeft: '3px solid #fbbf24', paddingLeft: 10 }}>
                              <div style={{ fontWeight: 600, color: '#111827', marginBottom: 2 }}>{qLine?.replace(/^Q:\s*/, '') || pair}</div>
                              {aLine && <div style={{ color: '#6b7280' }}>{aLine.replace(/^A:\s*/, '')}</div>}
                            </div>
                          );
                        })}
                      </div>
                    ) : c.rawText ? (
                      <>
                        {c.rawText.substring(0, 2000)}
                        {c.rawText.length > 2000 && <span style={{ color: '#9ca3af' }}> ... ({c.rawText.length} total chars)</span>}
                      </>
                    ) : c.sourceUrl ? (
                      <span>Source: {c.sourceUrl}</span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>No preview available</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorYourAI;
