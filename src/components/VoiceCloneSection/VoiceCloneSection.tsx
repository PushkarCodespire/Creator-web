// ===========================================
// VOICE CLONE SECTION (shared component)
// ===========================================
// Reusable voice clone UI used by both the Creator "Your AI" page
// and the Onboarding wizard. Handles upload, in-browser recording,
// and the Replace flow (never exposes a "Remove" action).
// ===========================================

import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Mic, Upload, X, RotateCcw } from 'lucide-react';
import { RootState } from '../../store';
import { contentApi } from '../../services/api';

interface Props {
  /**
   * Called whenever the voice clone status changes so the parent can react
   * (e.g. unlock the Launch step once status === 'READY').
   */
  onStatusChange?: (status: string | null) => void;
  /**
   * Compact visual style for embedding in smaller contexts (e.g., onboarding).
   * Defaults to false (full-size card for the dashboard).
   */
  compact?: boolean;
}

export function VoiceCloneSection({ onStatusChange, compact = false }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);

  // Voice state
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null);
  const [voiceUploading, setVoiceUploading] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [msg, setMsg] = useState('');
  const voiceFileRef = useRef<HTMLInputElement>(null);

  // Recording state
  const [showRecorder, setShowRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load current status on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await contentApi.getVoiceClone();
        const data = res.data.data;
        if (data?.status) {
          setVoiceStatus(data.status);
          onStatusChange?.(data.status);
        }
      } catch {
        // ignore - new creator, no voice yet
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const updateStatus = (s: string | null) => {
    setVoiceStatus(s);
    onStatusChange?.(s);
  };

  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVoiceUploading(true);
    setVoiceError('');
    try {
      const formData = new FormData();
      formData.append('audio', file);
      const res = await contentApi.uploadVoiceClone(formData);
      updateStatus(res.data.data?.status || 'READY');
      setIsReplacing(false); // return to Active view after successful upload
      setShowRecorder(false);
      showMsg('Voice clone saved!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setVoiceError(e?.response?.data?.error?.message || 'Voice clone failed');
    } finally {
      setVoiceUploading(false);
      if (voiceFileRef.current) voiceFileRef.current.value = '';
    }
  };

  const getReadingScript = () => {
    const name = user?.creator?.displayName || user?.name || 'there';
    const category = user?.creator?.category || 'fitness';
    const tagline = user?.creator?.tagline || '';
    return `Hi, I'm ${name}. I'm passionate about ${category} and helping people achieve their goals.${tagline ? ` ${tagline}.` : ''} Whether you're just starting your journey or looking to take things to the next level, I'm here to guide you every step of the way. I believe everyone deserves access to expert guidance and personalized support. Let's work together to build healthy habits, stay consistent, and unlock your full potential. I'm excited to be part of your journey and can't wait to help you become the best version of yourself.`;
  };

  const handleStartRecording = async () => {
    setVoiceError('');
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        mediaStreamRef.current?.getTracks().forEach(t => t.stop());
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (blob.size < 1000) {
          setVoiceError('Recording too short. Please record at least 30 seconds.');
          return;
        }

        setVoiceUploading(true);
        setShowRecorder(false);
        setIsRecording(false);
        setRecordingTime(0);
        try {
          const formData = new FormData();
          formData.append('audio', blob, 'voice-recording.webm');
          const res = await contentApi.uploadVoiceClone(formData);
          updateStatus(res.data.data?.status || 'READY');
          setIsReplacing(false); // return to Active view after successful recording upload
          showMsg('Voice clone saved from recording!');
        } catch (err: unknown) {
          const e = err as { response?: { data?: { error?: { message?: string } } } };
          setVoiceError(e?.response?.data?.error?.message || 'Voice clone failed');
        } finally {
          setVoiceUploading(false);
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      setVoiceError('Microphone access is required to record your voice. Please allow microphone access and try again.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setShowRecorder(false);
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  // Replace switches the UI back to the record/upload state without deleting
  // anything server-side. The next successful upload overwrites on the backend.
  const [isReplacing, setIsReplacing] = useState(false);
  const handleReplace = () => {
    setIsReplacing(true);
    setVoiceError('');
  };
  const handleCancelReplace = () => {
    setIsReplacing(false);
    setShowRecorder(false);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const padding = compact ? '22px 20px' : '28px 24px';
  const readyPadding = compact ? '12px 16px' : '16px 20px';

  // READY state with Replace UI
  if (voiceStatus === 'READY' && !isReplacing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: readyPadding, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Mic size={18} style={{ color: '#10b981' }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Voice clone is active</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Your AI will respond with your voice in chat</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReplace}
          disabled={voiceUploading}
          style={{
            padding: '6px 14px', borderRadius: 8, background: '#fff', color: '#374151',
            fontSize: 12, fontWeight: 600, border: '1px solid #d1d5db', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <RotateCcw size={12} /> Replace
        </button>
      </div>
    );
  }

  return (
    <div style={{ border: '2px dashed #ede8e3', borderRadius: 14, padding, background: '#fafaf8' }}>
      {voiceStatus === 'PROCESSING' || voiceUploading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#ff3e48', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{voiceUploading ? 'Uploading your voice...' : 'Processing your voice...'}</p>
        </div>
      ) : showRecorder ? (
        /* Recording Panel */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>Read the following paragraph aloud:</p>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 18px', fontSize: 14, lineHeight: 1.7, color: '#374151', fontStyle: 'italic' }}>
            &ldquo;{getReadingScript()}&rdquo;
          </div>

          {!isRecording ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button type="button" onClick={handleStartRecording} style={{
                padding: '10px 24px', borderRadius: 10, background: '#ff3e48', color: '#fff',
                fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Mic size={14} /> Start Recording
              </button>
              <button type="button" onClick={handleCancelRecording} style={{
                padding: '10px 18px', borderRadius: 10, background: '#fff', color: '#6b7280',
                fontSize: 13, fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <X size={14} /> Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <span style={{ fontSize: 20, fontWeight: 700, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{formatTime(recordingTime)}</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>/ 01:00 min recommended</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={handleStopRecording} style={{
                  padding: '10px 24px', borderRadius: 10, background: '#111827', color: '#fff',
                  fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#fff' }} /> Stop & Upload
                </button>
                <button type="button" onClick={handleCancelRecording} style={{
                  padding: '10px 18px', borderRadius: 10, background: '#fff', color: '#6b7280',
                  fontSize: 13, fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          )}
          {voiceError && <p style={{ fontSize: 12, color: '#dc2626', margin: 0, textAlign: 'center' }}>{voiceError}</p>}
        </div>
      ) : (
        /* Default: Record + Upload options */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <Mic size={24} style={{ color: '#9ca3af' }} />
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0, textAlign: 'center' }}>
            {isReplacing
              ? 'Record a new sample or upload a new audio file to replace your current voice.'
              : 'Record your voice or upload an audio sample (MP3, WAV, M4A)'}
          </p>
          {voiceError && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{voiceError}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => { setShowRecorder(true); setVoiceError(''); }} style={{
              padding: '8px 20px', borderRadius: 10, background: '#ff3e48', color: '#fff',
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Mic size={14} /> Record Voice
            </button>
            <input
              ref={voiceFileRef}
              type="file"
              accept="audio/mpeg,audio/wav,audio/x-m4a,audio/mp4,.mp3,.wav,.m4a"
              style={{ display: 'none' }}
              onChange={handleVoiceUpload}
            />
            <button type="button" onClick={() => voiceFileRef.current?.click()} style={{
              padding: '8px 20px', borderRadius: 10, background: '#fff', color: '#374151',
              fontSize: 13, fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Upload size={14} /> Upload Audio
            </button>
            {isReplacing && (
              <button type="button" onClick={handleCancelReplace} style={{
                padding: '8px 16px', borderRadius: 10, background: 'transparent', color: '#6b7280',
                fontSize: 13, fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer',
              }}>
                Cancel
              </button>
            )}
          </div>
          <p style={{ fontSize: 11, color: '#d1d5db', margin: 0 }}>Minimum 1 minute of clear speech recommended</p>
          {msg && <p style={{ fontSize: 12, color: '#10b981', margin: 0 }}>{msg}</p>}
        </div>
      )}
    </div>
  );
}

export default VoiceCloneSection;
