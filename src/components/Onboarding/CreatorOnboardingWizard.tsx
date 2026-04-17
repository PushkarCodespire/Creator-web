import { useState, useEffect, useRef } from 'react';
import { Form, Input, Select, message as antMessage, Switch, InputNumber } from 'antd';
import { User, FileText, CircleDollarSign, Bot, Rocket, CheckCircle, Youtube, Plus, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api, { creatorApi, contentApi } from '../../services/api';
import { RootState } from '../../store';
import { updateUser, setProfileComplete } from '../../store/slices/authSlice';
import OnboardingProcessing from './OnboardingProcessing';
import '../../styles/Auth.css';

const { TextArea } = Input;
const { Option } = Select;

const TABS = [
  { key: 'identity', label: 'Identity', icon: <User size={16} /> },
  { key: 'knowledge', label: 'Knowledge', icon: <FileText size={16} /> },
  { key: 'economics', label: 'Economics', icon: <CircleDollarSign size={16} /> },
  { key: 'intelligence', label: 'Intelligence', icon: <Bot size={16} /> },
  { key: 'launch', label: 'Launch', icon: <Rocket size={16} /> },
];

const labelStyle: React.CSSProperties = { fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151' };
const inputStyle: React.CSSProperties = { height: 40, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, paddingLeft: 16 };
const textareaStyle: React.CSSProperties = { ...inputStyle, height: 'auto', padding: '10px 16px' };

export const CreatorOnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState('identity');
  const [processingStatus, setProcessingStatus] = useState<'none' | 'processing' | 'training' | 'completed'>('none');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(['']);
  const [youtubeTranscripts, setYoutubeTranscripts] = useState<Record<number, { text: string; loading: boolean; error: string }>>({});
  const [manualTexts, setManualTexts] = useState<{ title: string; text: string }[]>([{ title: '', text: '' }]);
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.creator?.profileImage || user?.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/upload/avatar', formData);
      if (res.data.success) {
        const url = res.data.data.url;
        await creatorApi.updateProfile({ profileImage: url });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatch(updateUser({ avatar: url, creator: { ...user?.creator, profileImage: url } } as any));
        setAvatarPreview(url);
        antMessage.success('Profile photo uploaded!');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      antMessage.error(e?.response?.data?.error || 'Failed to upload');
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (user && !isInitialized) {
      // Check for prefilled data from "Customize your profile" form
      let prefill: Record<string, string> = {};
      try {
        const raw = sessionStorage.getItem('creatorPrefill');
        if (raw) { prefill = JSON.parse(raw); sessionStorage.removeItem('creatorPrefill'); }
      } catch {}

      form.setFieldsValue({
        displayName: user.creator?.displayName || prefill.name || user.name,
        bio: user.creator?.bio || prefill.about || '',
        tagline: user.creator?.tagline || prefill.expertise || '',
        category: user.creator?.category || (prefill.topics?.split(',')?.[0]?.trim()) || '',
        aiPersonality: user.creator?.aiPersonality,
        aiTone: user.creator?.aiTone,
        welcomeMessage: user.creator?.welcomeMessage,
        bankName: user.creator?.bankAccount?.bankName,
        accountHolderName: user.creator?.bankAccount?.accountHolderName,
        accountNumber: user.creator?.bankAccount?.accountNumber,
        ifscCode: user.creator?.bankAccount?.ifscCode,
        pricePerMessage: user.creator?.pricePerMessage || 50,
        firstMessageFree: user.creator?.firstMessageFree ?? true,
        discountFirstFive: user.creator?.discountFirstFive || 0,
        tags: user.creator?.tags || (prefill.topics ? prefill.topics.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
      });
      setIsInitialized(true);
    }
  }, [user, form, isInitialized]);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (activeTab === 'identity') {
        const values = await form.validateFields(['displayName', 'category', 'tagline', 'bio', 'tags']);
        await creatorApi.updateProfile(values);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatch(updateUser({ creator: { ...user?.creator, ...values } } as any));
        antMessage.success('Identity saved');
        setCompletedTabs(prev => new Set(prev).add('identity'));
      } else if (activeTab === 'knowledge') {
        const validYoutube = youtubeUrls.filter(url => url.trim() !== '');
        let youtubeErrors = 0;
        for (const url of validYoutube) {
          try {
            await contentApi.addYouTube(url);
          } catch {
            youtubeErrors++;
          }
        }
        if (youtubeErrors > 0) {
          antMessage.warning(`${youtubeErrors} YouTube video(s) couldn't be processed. You can add content manually instead.`);
        }
        for (const mt of manualTexts) {
          if (mt.text.length >= 10) await contentApi.addManual(mt.title || 'Untitled', mt.text);
        }
        antMessage.success('Knowledge saved');
        setCompletedTabs(prev => new Set(prev).add('knowledge'));
      } else if (activeTab === 'economics') {
        const pricingValues = await form.validateFields(['pricePerMessage', 'firstMessageFree', 'discountFirstFive']);
        const bankValues = await form.validateFields(['bankName', 'accountHolderName', 'accountNumber', 'ifscCode']);
        await creatorApi.updateProfile(pricingValues);
        await api.put('/creators/profile', { bankAccount: bankValues });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatch(updateUser({ creator: { ...user?.creator, ...pricingValues, bankAccount: bankValues } } as any));
        antMessage.success('Economics saved');
        setCompletedTabs(prev => new Set(prev).add('economics'));
      } else if (activeTab === 'intelligence') {
        const values = await form.validateFields(['aiPersonality', 'aiTone', 'welcomeMessage']);
        await creatorApi.updateProfile(values);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatch(updateUser({ creator: { ...user?.creator, ...values } } as any));
        antMessage.success('Intelligence configured');
        setCompletedTabs(prev => new Set(prev).add('intelligence'));
      }
      // Auto-advance to next tab
      const idx = TABS.findIndex(t => t.key === activeTab);
      if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].key);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      antMessage.error(err.response?.data?.error || 'Please fill all required fields');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      await creatorApi.updateProfile({ isProfileComplete: true });
      setProcessingStatus('processing');
      setTimeout(() => { setProcessingStatus('training'); setTimeout(() => { setProcessingStatus('completed'); }, 5000); }, 4000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      antMessage.error(err.response?.data?.error || 'Failed to finalize');
    } finally {
      setLoading(false);
    }
  };

  if (processingStatus !== 'none') {
    return (
      <div style={{ minHeight: '100vh', background: '#fbf7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 600, background: '#fff', borderRadius: 16, padding: 40, boxShadow: '0 20px 60px -20px rgba(0,0,0,0.15)' }}>
          <OnboardingProcessing
            status={processingStatus === 'completed' ? 'completed' : (processingStatus === 'training' ? 'training' : 'processing')}
            onComplete={() => { dispatch(setProfileComplete(true)); navigate('/creator-dashboard'); }}
          />
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'identity':
        return (
          <Form form={form} layout="vertical" requiredMark={false}>
            {/* Profile Photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                  background: '#ff3e48', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 24, fontWeight: 700, border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  {avatarPreview ? (
                    <img src={avatarPreview.startsWith('http') ? avatarPreview : `/api${avatarPreview}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (user?.name?.[0] || 'C').toUpperCase()
                  )}
                </div>
                <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar} style={{
                  position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%',
                  background: '#111827', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}>
                  <Camera size={11} />
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{uploadingAvatar ? 'Uploading...' : 'Profile Photo'}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>Click the camera icon to upload</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Form.Item name="displayName" label={<span style={labelStyle}>Display Name</span>} rules={[{ required: true }]} style={{ marginBottom: 12 }}>
                <Input placeholder="Your name" style={inputStyle} />
              </Form.Item>
              <Form.Item name="category" label={<span style={labelStyle}>Category</span>} rules={[{ required: true }]} style={{ marginBottom: 12 }}>
                <Select placeholder="Select" style={{ width: '100%' }} size="middle">
                  <Option value="Fat Loss">Fat Loss</Option>
                  <Option value="Muscle Gain">Muscle Gain</Option>
                  <Option value="PCOS">PCOS</Option>
                  <Option value="Gut Health">Gut Health</Option>
                  <Option value="Yoga">Yoga</Option>
                  <Option value="Nutrition">Nutrition</Option>
                  <Option value="Strength Training">Strength Training</Option>
                  <Option value="Calisthenics">Calisthenics</Option>
                  <Option value="CrossFit">CrossFit</Option>
                  <Option value="Sports Performance">Sports Performance</Option>
                  <Option value="Mental Wellness">Mental Wellness</Option>
                  <Option value="Women's Fitness">Women's Fitness</Option>
                </Select>
              </Form.Item>
            </div>
            <Form.Item name="tagline" label={<span style={labelStyle}>Tagline</span>} rules={[{ required: true }]} style={{ marginBottom: 12 }}>
              <Input placeholder="Your mission in one line" style={inputStyle} />
            </Form.Item>
            <Form.Item name="bio" label={<span style={labelStyle}>Bio</span>} rules={[{ required: true }]} style={{ marginBottom: 12 }}>
              <TextArea rows={3} placeholder="Tell your fans who you are..." style={textareaStyle} />
            </Form.Item>
            <Form.Item name="tags" label={<span style={labelStyle}>Tags</span>} style={{ marginBottom: 0 }}>
              <Select mode="tags" style={{ width: '100%' }} placeholder="Add tags" tokenSeparators={[',']} />
            </Form.Item>
          </Form>
        );
      case 'knowledge':
        return (
          <div>
            {/* YouTube Videos */}
            <div style={{ marginBottom: 20 }}>
              <span style={labelStyle}>YouTube Videos</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                {youtubeUrls.map((url, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Input
                        value={url}
                        onChange={e => { const u = [...youtubeUrls]; u[idx] = e.target.value; setYoutubeUrls(u); }}
                        placeholder="Paste YouTube URL"
                        style={{ ...inputStyle, flex: 1 }}
                        prefix={<Youtube size={14} style={{ color: '#999' }} />}
                      />
                      <button
                        type="button"
                        disabled={!url.trim() || youtubeTranscripts[idx]?.loading}
                        onClick={async () => {
                          setYoutubeTranscripts(prev => ({ ...prev, [idx]: { text: '', loading: true, error: '' } }));
                          try {
                            const res = await contentApi.previewYouTube(url);
                            const data = res.data.data;
                            setYoutubeTranscripts(prev => ({ ...prev, [idx]: { text: data.transcript || '', loading: false, error: '' } }));
                          } catch (err: unknown) {
                            const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
                            setYoutubeTranscripts(prev => ({ ...prev, [idx]: { text: '', loading: false, error: e?.response?.data?.error?.message || e?.message || 'Failed to fetch' } }));
                          }
                        }}
                        style={{
                          padding: '0 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                          background: youtubeTranscripts[idx]?.loading ? '#d1d5db' : '#ff3e48', color: '#fff',
                          border: 'none', cursor: youtubeTranscripts[idx]?.loading || !url.trim() ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {youtubeTranscripts[idx]?.loading ? 'Fetching...' : youtubeTranscripts[idx]?.text ? '✓ Fetched' : 'Fetch Transcript'}
                      </button>
                    </div>
                    {/* Transcript preview */}
                    {youtubeTranscripts[idx]?.error && (
                      <div style={{ marginTop: 6, padding: '8px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 12 }}>
                        {youtubeTranscripts[idx].error}
                      </div>
                    )}
                    {youtubeTranscripts[idx]?.text && (
                      <div style={{ marginTop: 6, padding: '10px 12px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 12, color: '#374151', maxHeight: 120, overflowY: 'auto', lineHeight: 1.5 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                          Transcript Preview ({youtubeTranscripts[idx].text.length} chars)
                        </div>
                        {youtubeTranscripts[idx].text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setYoutubeUrls([...youtubeUrls, ''])} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#ff3e48', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                <Plus size={14} /> Add another video
              </button>
            </div>

            {/* Manual Content (multiple) */}
            <div>
              <span style={labelStyle}>Manual Content</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
                {manualTexts.map((mt, idx) => (
                  <div key={idx} style={{ padding: 14, borderRadius: 10, border: '1px solid #ede8e3', background: '#fafaf8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af' }}>Content {idx + 1}</span>
                      {manualTexts.length > 1 && (
                        <button type="button" onClick={() => setManualTexts(prev => prev.filter((_, i) => i !== idx))} style={{ fontSize: 11, color: '#ff3e48', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                      )}
                    </div>
                    <Input
                      placeholder="Title (e.g. Fitness Training Guide)"
                      value={mt.title}
                      onChange={e => { const m = [...manualTexts]; m[idx] = { ...m[idx], title: e.target.value }; setManualTexts(m); }}
                      style={{ ...inputStyle, marginBottom: 8 }}
                    />
                    <TextArea
                      rows={3}
                      placeholder="Paste articles, scripts, or notes..."
                      value={mt.text}
                      onChange={e => { const m = [...manualTexts]; m[idx] = { ...m[idx], text: e.target.value }; setManualTexts(m); }}
                      style={textareaStyle}
                    />
                    {mt.text && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>{mt.text.length} characters</div>}
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setManualTexts([...manualTexts, { title: '', text: '' }])} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#ff3e48', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                <Plus size={14} /> Add another content
              </button>
            </div>
          </div>
        );
      case 'economics':
        return (
          <Form form={form} layout="vertical" requiredMark={false}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Form.Item name="pricePerMessage" label={<span style={labelStyle}>Price / Message (₹)</span>} rules={[{ required: true }]} style={{ marginBottom: 12 }}>
                <InputNumber style={{ ...inputStyle, width: '100%' }} min={0} placeholder="100" />
              </Form.Item>
              <Form.Item name="discountFirstFive" label={<span style={labelStyle}>First 5 Discount (%)</span>} style={{ marginBottom: 12 }}>
                <InputNumber style={{ ...inputStyle, width: '100%' }} min={0} max={100} placeholder="15" />
              </Form.Item>
            </div>
            <Form.Item name="firstMessageFree" label={<span style={labelStyle}>First Message Free</span>} valuePropName="checked" style={{ marginBottom: 14 }}>
              <Switch />
            </Form.Item>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, marginBottom: 12 }}>
              <span style={{ ...labelStyle, fontSize: 13, marginBottom: 12, display: 'block' }}>Bank Details</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Form.Item name="bankName" label={<span style={labelStyle}>Bank Name</span>} rules={[{ required: true }]} style={{ marginBottom: 12 }}>
                <Input placeholder="e.g. HDFC Bank" style={inputStyle} />
              </Form.Item>
              <Form.Item name="accountHolderName" label={<span style={labelStyle}>Account Holder</span>} rules={[{ required: true }]} style={{ marginBottom: 12 }}>
                <Input placeholder="Full legal name" style={inputStyle} />
              </Form.Item>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Form.Item name="accountNumber" label={<span style={labelStyle}>Account Number</span>} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <Input placeholder="0000 0000 0000" style={inputStyle} type="password" />
              </Form.Item>
              <Form.Item name="ifscCode" label={<span style={labelStyle}>IFSC Code</span>} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <Input placeholder="IFSC0001234" style={inputStyle} />
              </Form.Item>
            </div>
          </Form>
        );
      case 'intelligence':
        return (
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item name="aiTone" label={<span style={labelStyle}>Communication Tone</span>} rules={[{ required: true }]} style={{ marginBottom: 14 }}>
              <Select placeholder="Select tone" size="middle">
                <Option value="friendly">Friendly & Approachable</Option>
                <Option value="professional">Professional</Option>
                <Option value="casual">Casual & Genuine</Option>
                <Option value="inspiring">Inspiring & High-Energy</Option>
                <Option value="educational">Educational</Option>
              </Select>
            </Form.Item>
            <Form.Item name="aiPersonality" label={<span style={labelStyle}>AI Personality (System Prompt)</span>} rules={[{ required: true }]} style={{ marginBottom: 14 }}>
              <TextArea rows={4} placeholder="Describe your AI persona..." style={textareaStyle} />
            </Form.Item>
            <Form.Item name="welcomeMessage" label={<span style={labelStyle}>Welcome Message</span>} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
              <Input placeholder="First thing your AI says to new fans" style={inputStyle} />
            </Form.Item>
          </Form>
        );
      case 'launch':
        return (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Rocket size={48} style={{ color: '#ff3e48', marginBottom: 16 }} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Ready to Launch</h3>
            <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 400, margin: '0 auto 24px' }}>
              Your AI creator profile is configured. Hit launch to go live and start receiving chats.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              {['Identity', 'Knowledge', 'Intelligence'].map((label, i) => (
                <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#ff3e48', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {completedTabs.has(label.toLowerCase()) ? '✓ Done' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  const stepInfo: Record<string, { title: string; subtitle: string }> = {
    identity: { title: 'Establish Your Identity', subtitle: 'Define your creator profile and brand' },
    knowledge: { title: 'Train Your AI', subtitle: 'Feed your knowledge to power your AI clone' },
    economics: { title: 'Set Up Monetization', subtitle: 'Configure pricing and payment details' },
    intelligence: { title: 'Configure AI Brain', subtitle: 'Customize how your AI communicates' },
    launch: { title: 'Ready to Launch', subtitle: 'Review and go live' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fbf7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 680, borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)' }}>

        {/* Header with gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #0a0505 100%)',
          padding: '28px 36px 20px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle glow */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,62,72,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,62,72,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {TABS.find(t => t.key === activeTab)?.icon}
              </div>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                {stepInfo[activeTab]?.title}
              </h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0, paddingLeft: 42 }}>
              {stepInfo[activeTab]?.subtitle}
            </p>
          </div>
        </div>

        {/* Pill Tabs */}
        <div style={{ background: '#fff', padding: '16px 36px 0' }}>
          <div style={{ position: 'relative', display: 'flex', background: '#f3f4f6', borderRadius: 12, padding: 3 }}>
            <div style={{
              position: 'absolute',
              top: 3,
              left: `calc(${TABS.findIndex(t => t.key === activeTab)} * ${100 / TABS.length}% + 3px)`,
              width: `calc(${100 / TABS.length}% - 6px)`,
              height: 'calc(100% - 6px)',
              background: '#ffffff',
              borderRadius: 10,
              boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 0,
            }} />
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  padding: '9px 4px',
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: activeTab === tab.key ? '#111827' : completedTabs.has(tab.key) ? '#10b981' : '#9ca3af',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderRadius: 10,
                }}
              >
                {completedTabs.has(tab.key) && activeTab !== tab.key ? <CheckCircle size={12} /> : tab.icon}
                <span className="hide-mobile">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Step progress */}
          <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
            {TABS.map((tab) => (
              <div key={tab.key} style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: completedTabs.has(tab.key) ? '#10b981' : activeTab === tab.key ? '#ff3e48' : '#e5e7eb',
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ background: '#fff', padding: '20px 36px 16px' }}>
          {renderTab()}
        </div>

        {/* Footer */}
        <div style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', padding: '0 36px 28px', gap: 12 }}>
          <button
            type="button"
            disabled={activeTab === 'identity' || loading}
            onClick={() => { const idx = TABS.findIndex(t => t.key === activeTab); if (idx > 0) setActiveTab(TABS[idx - 1].key); }}
            style={{
              padding: '11px 28px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff',
              color: activeTab === 'identity' ? '#d1d5db' : '#374151', fontSize: 14, fontWeight: 600,
              cursor: activeTab === 'identity' ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Back
          </button>
          {activeTab === 'launch' ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              style={{
                padding: '11px 36px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #ff5b1f 0%, #ff3e48 100%)', color: '#fff',
                fontSize: 14, fontWeight: 600, boxShadow: '0 4px 12px rgba(255,62,72,0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? 'Launching...' : '🚀 Launch My AI'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              style={{
                padding: '11px 32px', borderRadius: 10, background: '#111827', color: '#fff',
                fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? 'Saving...' : 'Save & Continue →'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .ant-input, .ant-input-affix-wrapper, .ant-input-number, .ant-input-number-input, .ant-select-selector {
          background-color: #ffffff !important;
          border-color: #e5e7eb !important;
          border-radius: 8px !important;
        }
        .ant-input:focus, .ant-input-affix-wrapper-focused, .ant-input-number-focused, .ant-select-focused .ant-select-selector {
          border-color: #ff3e48 !important;
          box-shadow: 0 0 0 3px rgba(255, 62, 72, 0.08) !important;
        }
        .ant-select-selector { height: 40px !important; display: flex; align-items: center; }
        .ant-form-item-label > label { font-size: 11px !important; }
      `}</style>
    </div>
  );
};

export default CreatorOnboardingWizard;
