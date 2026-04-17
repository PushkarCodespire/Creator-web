import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import styles from "../WebsiteCreateAI.module.css";

export function CustomizeForm({ onAction }: { onAction?: (data?: { name?: string; expertise?: string; about?: string; topics?: string; faqs?: string[] }) => void }) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [voiceClone, setVoiceClone] = useState(false);
  const [name, setName] = useState(isAuthenticated ? (user?.name || '') : '');
  const [expertise, setExpertise] = useState("");
  const [about, setAbout] = useState("");
  const [topics, setTopics] = useState("");
  const [faqs, setFaqs] = useState<string[]>([]);
  const [newFaq, setNewFaq] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFaq = () => {
    if (newFaq.trim() && faqs.length < 8) {
      setFaqs([...faqs, newFaq.trim()]);
      setNewFaq("");
    }
  };

  const removeFaq = (idx: number) => setFaqs(faqs.filter((_, i) => i !== idx));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className={styles.customizeCard}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', minHeight: 500 }}>

          {/* LEFT — Form */}
          <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14, borderRight: '1px solid #f3f0ec' }}>
            <input type="text" value={name} onChange={(e) => !isAuthenticated && setName(e.target.value)} placeholder="Your name" disabled={isAuthenticated}
              style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #ede8e3', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: isAuthenticated ? '#f3f4f6' : '#fafaf8', color: isAuthenticated ? '#6b7280' : '#111827', cursor: isAuthenticated ? 'not-allowed' : 'text' }} />

            <input type="text" value={expertise} onChange={(e) => setExpertise(e.target.value)} placeholder="Your expertise (e.g. Weight loss expert)"
              style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #ede8e3', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fafaf8' }} />

            <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="About you..." rows={3}
              style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #ede8e3', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fafaf8', resize: 'vertical' }} />

            <input type="text" value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="Topics (e.g. Nutrition, Weight Loss, Diet)"
              style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #ede8e3', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fafaf8' }} />

            <div style={{ display: 'flex', gap: 6 }}>
              <input type="text" value={newFaq} onChange={(e) => setNewFaq(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFaq()}
                placeholder="Add common questions..."
                style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #ede8e3', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fafaf8' }} />
              <button type="button" onClick={addFaq}
                style={{ padding: '0 16px', borderRadius: 10, background: '#ff3e48', color: '#fff', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+</button>
            </div>

            {faqs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {faqs.map((f, i) => (
                  <span key={i} onClick={() => removeFaq(i)}
                    style={{ padding: '5px 12px', borderRadius: 8, background: '#f3f4f6', color: '#374151', fontSize: 12, cursor: 'pointer' }}
                    title="Click to remove">
                    {f} ×
                  </span>
                ))}
              </div>
            )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#111827', borderRadius: '0 0 16px 16px' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'start' }}>Voice Clone</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Clone your voice for audio responses</div>
          </div>
          <button type="button" role="switch" aria-checked={voiceClone} className={`${styles.toggle} ${voiceClone ? styles.toggleOn : ""}`} onClick={() => setVoiceClone((v) => !v)}>
            <span className={styles.toggleKnob} />
          </button>
        </div>
          </div>

          {/* CENTER — Image upload / preview */}
          <div style={{ background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', borderRight: '1px solid #f3f0ec' }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ position: 'absolute', bottom: 16, right: 16, padding: '8px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                  Change Photo
                </button>
              </>
            ) : (
              <div onClick={() => fileRef.current?.click()}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 40, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fff', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>Upload your photo</p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Click to browse</p>
              </div>
            )}
          </div>

          {/* RIGHT — Live preview */}
          <div style={{ padding: '28px 24px', background: '#fff', display: 'flex', flexDirection: 'column', borderRadius: '0 16px 16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'start', gap: 6, marginBottom: 2 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: name ? '#111827' : '#e5e7eb', margin: 0 }}>{name || 'Your Name'}</h3>
              {name && <svg viewBox="0 0 18 18" width="16" height="16"><path d="M9 0l1.9 1.4 2.35-.11.45 2.3 1.9 1.41-1.02 2.1.65 2.27-2.08 1.11-.63 2.28-2.32-.5L9 13.9l-1.85-1.65-2.32.5-.49-2.22L2.25 9.42l.65-2.27-1.02-2.1 1.9-1.41.45-2.3L6.58 1.4z" fill="#1d9bf0" /><path d="M5.5 9l2.5 2.5L13 6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <p style={{ fontSize: 13, color: expertise ? '#6b7280' : '#e5e7eb', margin: '0 0 20px', textAlign: 'left' }}>{expertise || 'Your expertise'}</p>

            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 6px', textAlign: 'left' }}>About</h4>
            <p style={{ fontSize: 13, color: about ? '#6b7280' : '#e5e7eb', lineHeight: 1.6, margin: '0 0 20px', textAlign: 'left' }}>
              {about || ''}
            </p>

            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 6px', textAlign: 'left' }}>Topics</h4>
            <p style={{ fontSize: 13, color: topics ? '#6b7280' : '#e5e7eb', margin: '0 0 20px', textAlign: 'left' }}>
              {topics ? topics.split(',').map(t => t.trim()).filter(Boolean).join(' | ') : ''}
            </p>

            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 10px', textAlign: 'left' }}>Frequently Asked Questions</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
              {faqs.map((faq, i) => (
                <span key={i} style={{ padding: '6px 14px', borderRadius: 20, background: '#1a1a1a', color: '#fff', fontSize: 11, fontWeight: 500, height: 'fit-content' }}>{faq}</span>
              ))}
            </div>

            {/* Chat bar */}
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input style={{ flex: 1, fontSize: 13, color: '#9ca3af', borderRadius: 30, border: '1px solid #ede8e3', padding: '6px 14px' }} placeholder="Ask Anything"/>
              <button type="button" onClick={() => onAction?.({ name, expertise, about, topics, faqs })} style={{ padding: '6px 18px', borderRadius: 30, background: '#1a1a1a', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Start Chat</button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview AI — outside the card */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button type="button" onClick={() => onAction?.({ name, expertise, about, topics, faqs })} style={{
          padding: '16px 56px', borderRadius: 16,
          background: '#ff3e48', color: '#fff', fontSize: 17, fontWeight: 700,
          border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(255,62,72,0.3)',
        }}>
          Preview AI
        </button>
      </div>
    </>
  );
}
