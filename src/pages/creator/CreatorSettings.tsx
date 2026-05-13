import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { creatorApi, contentApi, userApi, getImageUrl } from '../../services/api';
import AvatarUpload from '../../components/upload/AvatarUpload';
import { Share2, HelpCircle, Plus, Trash2, Eye, DollarSign, Save, User } from 'lucide-react';

const card: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ede8e3',
  borderRadius: 16,
  padding: 28,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ede8e3',
  fontSize: 14, outline: 'none', background: '#fff', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block',
};

const CreatorSettings = () => {
  const _navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [profileLink, setProfileLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [faqs, setFaqs] = useState<{ q: string; a: string; views: number; id?: string }[]>([]);
  const [newFaq, setNewFaq] = useState({ q: '', a: '' });
  const [showAddFaq, setShowAddFaq] = useState(false);

  // Pricing
  const [pricePerMessage, setPricePerMessage] = useState(user?.creator?.pricePerMessage || 50);
  const [firstMessageFree, setFirstMessageFree] = useState(user?.creator?.firstMessageFree ?? true);
  const [discountFirstFive, setDiscountFirstFive] = useState(user?.creator?.discountFirstFive || 0);
  const [savingPricing, setSavingPricing] = useState(false);

  const [msg, setMsg] = useState('');

  useEffect(() => {
    const creatorId = user?.creator?.id;
    if (creatorId) {
      setProfileLink(`${window.location.origin}/creator/${creatorId}`);
    }

    // Load FAQs from API
    (async () => {
      try {
        const res = await contentApi.getAll();
        const contents = res.data.data?.contents || res.data.data || [];
        const faqContent = contents.filter((c: { type: string }) => c.type === 'FAQ');
        if (faqContent.length > 0) {
          // Try to extract FAQ items from content
          const items = faqContent.map((c: { title?: string; rawText?: string; _count?: { chunks?: number; views?: number }; id: string }) => ({
            q: c.title || 'Question',
            a: c.rawText || '',
            views: c._count?.views || 0,
            id: c.id,
          }));
          setFaqs(items);
        }
      } catch {
        // Use defaults if API fails
        setFaqs([
          { q: 'What is your training philosophy?', a: 'I believe in sustainable, science-based approaches to fitness.', views: 234 },
          { q: 'Do you offer one-on-one coaching?', a: 'Yes, I offer personalized coaching packages.', views: 189 },
        ]);
      }
    })();
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareNative = () => {
    if (navigator.share) {
      navigator.share({ title: 'My CreatorPal', url: profileLink });
    } else {
      handleCopyLink();
    }
  };

  const handleAddFaq = async () => {
    if (newFaq.q.trim() && newFaq.a.trim()) {
      try {
        await contentApi.addFAQ('FAQ', [{ question: newFaq.q, answer: newFaq.a }]);
      } catch {}
      setFaqs(prev => [...prev, { q: newFaq.q, a: newFaq.a, views: 0 }]);
      setNewFaq({ q: '', a: '' });
      setShowAddFaq(false);
    }
  };

  const handleDeleteFaq = async (idx: number) => {
    const faq = faqs[idx];
    if (faq.id) {
      try { await contentApi.delete(faq.id); } catch {}
    }
    setFaqs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSavePricing = async () => {
    setSavingPricing(true);
    try {
      await creatorApi.updateProfile({ pricePerMessage, firstMessageFree, discountFirstFive });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch(updateUser({ creator: { ...user?.creator, pricePerMessage, firstMessageFree, discountFirstFive } } as any));
      setMsg('Pricing saved!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setMsg(err?.response?.data?.error || 'Failed to save');
    } finally {
      setSavingPricing(false);
    }
  };

  const handleAvatarUpdate = async (url: string) => {
    try {
      await userApi.updateProfile({ avatar: url });
      dispatch(updateUser({ avatar: url }));
    } catch {
      // Avatar URL already saved by the upload endpoint; profile sync is best-effort
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>Settings</h1>
        {msg && <span style={{ fontSize: 13, fontWeight: 600, color: msg.includes('Failed') ? '#ef4444' : '#10b981' }}>{msg}</span>}
      </div>

      {/* Profile Photo */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3e48' }}><User size={18} /></div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Profile Photo</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Update your creator avatar shown on your profile and chat</p>
          </div>
        </div>
        <AvatarUpload
          currentAvatar={user?.creator?.profileImage ? getImageUrl(user.creator.profileImage) : user?.avatar ? getImageUrl(user.avatar) : undefined}
          userId={user?.id}
          onUploadSuccess={handleAvatarUpdate}
          size={100}
        />
      </div>

      {/* Change Pricing */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><DollarSign size={18} /></div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Change Pricing</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Update prices on your programs</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Price Per 1000 Messages (₹)</label>
            <input type="number" value={pricePerMessage} onChange={(e) => setPricePerMessage(Number(e.target.value))} min={0} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>First 5 Discount (%)</label>
            <input type="number" value={discountFirstFive} onChange={(e) => setDiscountFirstFive(Number(e.target.value))} min={0} max={100} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>First Message Free</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40 }}>
              <button type="button" onClick={() => setFirstMessageFree(!firstMessageFree)} style={{
                width: 44, height: 24, borderRadius: 99, padding: 2,
                background: firstMessageFree ? '#10b981' : '#d1d5db',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s ease',
              }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'transform 0.2s ease', transform: firstMessageFree ? 'translateX(20px)' : 'translateX(0)' }} />
              </button>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{firstMessageFree ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
        <button type="button" onClick={handleSavePricing} disabled={savingPricing} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 8,
          background: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
        }}>
          <Save size={14} /> {savingPricing ? 'Saving...' : 'Save Pricing'}
        </button>
      </div>


      {/* Share Your Page */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><Share2 size={18} /></div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Share Your Page</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Share your profile link with your audience</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 10px 18px', borderRadius: 12, border: '1px solid #ede8e3', background: '#fafaf8', marginBottom: 10 }}>
          <span style={{ flex: 1, fontSize: 14, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profileLink}</span>
          <button type="button" onClick={handleCopyLink} style={{ padding: '8px 20px', borderRadius: 8, background: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <button type="button" onClick={handleShareNative} style={{ fontSize: 13, color: '#ff3e48', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
          Share via social media →
        </button>
      </div>

      {/* FAQs */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3e48' }}><HelpCircle size={18} /></div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>FAQs</h3>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Manage frequently asked questions</p>
            </div>
          </div>
          <button type="button" onClick={() => setShowAddFaq(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#ff3e48', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Plus size={16} /> Add FAQ
          </button>
        </div>

        {showAddFaq && (
          <div style={{ padding: 16, borderRadius: 12, border: '1px solid #ff3e48', background: '#fff5f5', marginBottom: 12 }}>
            <input type="text" placeholder="Question" value={newFaq.q} onChange={(e) => setNewFaq(p => ({ ...p, q: e.target.value }))} style={{ ...inputStyle, marginBottom: 8 }} />
            <input type="text" placeholder="Answer" value={newFaq.a} onChange={(e) => setNewFaq(p => ({ ...p, a: e.target.value }))} style={{ ...inputStyle, marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={handleAddFaq} style={{ padding: '8px 20px', borderRadius: 8, background: '#ff3e48', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Save</button>
              <button type="button" onClick={() => setShowAddFaq(false)} style={{ padding: '8px 20px', borderRadius: 8, background: '#fff', color: '#6b7280', fontSize: 12, fontWeight: 600, border: '1px solid #ede8e3', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.length === 0 && <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>No FAQs yet. Add your first one!</div>}
          {faqs.map((faq, i) => (
            <div key={i} style={{ padding: '16px 18px', borderRadius: 12, border: '1px solid #ede8e3', background: '#fff', borderLeft: '3px solid #ff3e48' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{faq.q}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{faq.a}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: '#9ca3af' }}>
                    <Eye size={12} /> {faq.views} views
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button type="button" onClick={() => handleDeleteFaq(i)} style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #fecaca', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ff3e48' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatorSettings;
