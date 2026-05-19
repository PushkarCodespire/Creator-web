import { useState, useEffect, useRef, useCallback } from 'react';
import { chatApi, getImageUrl } from '../../../services/api';

type ModalState = 'idle' | 'listening' | 'sending' | 'speaking' | 'error';

type Props = {
  open: boolean;
  onClose: () => void;
  conversationId: string | null;
  creatorName: string;
  creatorAvatar: string | null;
  onMessageSent?: () => void;
  onVoiceBlocked?: () => void;
  voiceProvider?: 'chatterbox' | 'inworld' | 'elevenlabs';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

/** Strip markdown formatting like **bold**, *italic*, etc. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^[-*+]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .trim();
}

export default function VoiceModeModal({ open, onClose, conversationId, creatorName, creatorAvatar, onMessageSent, onVoiceBlocked, voiceProvider }: Props) {
  const [state, setState]                     = useState<ModalState>('idle');
  const [transcript, setTranscript]           = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [aiText, setAiText]                   = useState('');
  const [highlightIndex, setHighlightIndex]   = useState(-1);
  const [currentLine, setCurrentLine]         = useState(0);
  const [error, setError]                     = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef   = useRef<any>(null);
  const audioRef         = useRef<HTMLAudioElement | null>(null);
  // stateRef mirrors `state` so async / event callbacks always see the current value
  const stateRef         = useRef<ModalState>('idle');
  // Tracks consecutive network-error retries so we don't loop forever
  const networkRetryRef  = useRef(0);

  // Keep stateRef in sync
  const setStateSafe = useCallback((s: ModalState) => {
    stateRef.current = s;
    setState(s);
  }, []);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStateSafe('idle');
      setTranscript('');
      setInterimTranscript('');
      setAiText('');
      setHighlightIndex(-1);
      setError('');
      networkRetryRef.current = 0;
    } else {
      stopEverything();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape key to close
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopEverything();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const stopEverything = useCallback(() => {
    recognitionRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setStateSafe('idle');
    setAiText('');
    setHighlightIndex(-1);
  }, [setStateSafe]);

  // ── Audio playback with per-word highlighting ────────────────────────────────
  //
  // Uses `ontimeupdate` (fires ~4×/s based on actual playback position) instead
  // of a setInterval with estimated msPerWord.  This works even when the audio
  // has an unknown / Infinity duration at load time (common with Cloudinary CDN).

  const playAudio = useCallback((audioUrl: string, text: string) => {
    const cleanText = stripMarkdown(text);
    setStateSafe('speaking');
    setAiText(cleanText);
    setHighlightIndex(0);
    setCurrentLine(0);

    const words = cleanText.split(/\s+/).filter(Boolean);

    // Pre-compute per-line word ranges for caption display
    const sentences = cleanText.split(/(?<=[.!?])\s+/);
    let wordCount = 0;
    const lineWordCounts = sentences.map(s => {
      const wc = s.split(/\s+/).filter(Boolean).length;
      const result = { start: wordCount, end: wordCount + wc };
      wordCount += wc;
      return result;
    });

    const fullUrl = getImageUrl(audioUrl);
    const audio   = new Audio(fullUrl);
    audioRef.current = audio;

    // ontimeupdate: fires on actual playback progress — handles Infinity duration gracefully
    audio.ontimeupdate = () => {
      const dur = audio.duration;
      if (!dur || !isFinite(dur) || dur === 0) return;
      const pct = audio.currentTime / dur;
      const idx = Math.min(Math.floor(pct * words.length), words.length - 1);
      setHighlightIndex(idx);
      const lineIdx = lineWordCounts.findIndex(l => idx >= l.start && idx < l.end);
      if (lineIdx >= 0) setCurrentLine(lineIdx);
    };

    audio.onended = () => {
      setStateSafe('idle');
      setAiText('');
      setHighlightIndex(-1);
      setCurrentLine(0);
    };
    audio.onerror = () => {
      setStateSafe('idle');
      setHighlightIndex(-1);
    };
    audio.play().catch(() => setStateSafe('idle'));
  }, [setStateSafe]);

  // ── Speech recognition ───────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. Try Chrome.');
      return;
    }

    setTranscript('');
    setInterimTranscript('');
    setError('');
    setStateSafe('listening');

    const recognition = new SpeechRecognition();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = 'en-US';

    recognition.onresult = (event: { results: { [index: number]: { [index: number]: { transcript: string }; isFinal: boolean }; length: number }; resultIndex: number }) => {
      let final   = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) setTranscript(final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: { error: string }) => {
      // Ignore errors that arrive after we've already moved past 'listening'.
      // Chrome frequently fires 'network' or 'aborted' after recognition.stop()
      // is called from stopAndSend — these are stale events, not real failures.
      if (stateRef.current !== 'listening') return;

      if (event.error === 'no-speech') {
        setStateSafe('idle');
        return;
      }
      if (event.error === 'aborted') return;

      if (event.error === 'network') {
        // Network errors from Chrome STT are often transient (Google server hiccup).
        // Silently retry once; show a message only if the second attempt also fails.
        if (networkRetryRef.current < 1) {
          networkRetryRef.current++;
          console.warn('[STT] transient network error — auto-retrying…');
          setTimeout(() => {
            if (stateRef.current === 'listening') startListening();
          }, 400);
          return;
        }
        // Second failure — show a concise message, stay tappable
        setError('Connection interrupted. Tap to try again.');
        setStateSafe('error');
        return;
      }

      const micErrorMessages: Record<string, string> = {
        'not-allowed':           'Microphone access was denied. Allow it in your browser and tap to try again.',
        'service-not-allowed':   'Speech recognition is blocked on this page. Make sure the site is loaded over HTTPS.',
        'audio-capture':         'No microphone was found. Connect a microphone and tap to try again.',
        'bad-grammar':           'Speech recognition configuration error. Tap to try again.',
        'language-not-supported':'Your language is not supported. Switch your browser language to English.',
      };
      setError(micErrorMessages[event.error] || `Speech recognition failed (${event.error}). Tap to try again.`);
      setStateSafe('error');
    };

    recognition.onend = () => {
      // If recognition ends on its own while we're still in listening state
      // (can happen after ~60 s of silence on some browsers), return to idle.
      if (stateRef.current === 'listening') {
        setStateSafe('idle');
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  // startListening intentionally references itself for retry — safe because
  // it only recurses once (networkRetryRef guard) and the ref is stable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStateSafe]);

  const stopAndSend = useCallback(async () => {
    // abort() instead of stop() — cancels immediately without queuing any
    // further result or error events, eliminating spurious 'network' errors
    // that fire when stop() is called mid-stream.
    recognitionRef.current?.abort();

    const text = (transcript + ' ' + interimTranscript).trim();

    if (!text) {
      setStateSafe('idle');
      return;
    }

    setTranscript(text);
    setInterimTranscript('');
    setError('');          // wipe any stale error from the previous listen attempt
    setStateSafe('sending');

    if (!conversationId) {
      setError('No active conversation');
      setStateSafe('error');
      return;
    }

    try {
      const res = await chatApi.sendMessage(conversationId, text, undefined, true, voiceProvider);

      if (res.data?.data?.voice?.blocked) {
        onClose();
        onVoiceBlocked?.();
        return;
      }

      const aiMsg = res.data?.data?.aiMessage;

      if (aiMsg?.audioUrl) {
        playAudio(aiMsg.audioUrl, aiMsg.content);
      } else if (aiMsg?.content) {
        // No audio — show clean text as caption briefly
        const cleanText = stripMarkdown(aiMsg.content);
        setAiText(cleanText);
        setStateSafe('speaking');
        setTimeout(() => {
          setStateSafe('idle');
          setAiText('');
        }, 4000);
      } else {
        setStateSafe('idle');
      }

      onMessageSent?.();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || 'Failed to send');
      setStateSafe('error');
    }
  }, [transcript, interimTranscript, conversationId, playAudio, onMessageSent, setStateSafe, onClose, onVoiceBlocked, voiceProvider]);

  const handleMicTap = useCallback(() => {
    if (state === 'idle' || state === 'error') {
      networkRetryRef.current = 0;
      startListening();
    } else if (state === 'listening') {
      stopAndSend();
    } else if (state === 'speaking') {
      stopSpeaking();
    }
  }, [state, startListening, stopAndSend, stopSpeaking]);

  if (!open) return null;

  const avatarUrl = creatorAvatar ? getImageUrl(creatorAvatar) : null;
  const initial   = creatorName.charAt(0).toUpperCase();

  // Split into lines (sentences) for caption display
  const lines    = aiText ? aiText.split(/(?<=[.!?])\s+/).filter(Boolean) : [];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Close button */}
      <button
        type="button"
        onClick={() => { stopEverything(); onClose(); }}
        style={{
          position: 'absolute', top: 20, right: 24,
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 20, cursor: 'pointer',
        }}
      >
        &times;
      </button>

      {/* Creator name */}
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24, fontWeight: 500 }}>
        {creatorName}
      </p>

      {/* Avatar circle */}
      <div
        onClick={handleMicTap}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleMicTap(); }}
        style={{
          width: 140, height: 140, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: state === 'sending' ? 'wait' : 'pointer',
          position: 'relative',
          transition: 'transform 0.2s ease',
          transform: state === 'listening' ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {/* Pulsing rings */}
        {(state === 'listening' || state === 'speaking') && (
          <>
            <div style={{
              position: 'absolute', inset: -12, borderRadius: '50%',
              border: `2px solid ${state === 'listening' ? '#ff3e48' : '#10b981'}`,
              opacity: 0.4, animation: 'voicePulse 1.5s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: -24, borderRadius: '50%',
              border: `2px solid ${state === 'listening' ? '#ff3e48' : '#10b981'}`,
              opacity: 0.2, animation: 'voicePulse 1.5s ease-in-out infinite 0.3s',
            }} />
            <div style={{
              position: 'absolute', inset: -36, borderRadius: '50%',
              border: `2px solid ${state === 'listening' ? '#ff3e48' : '#10b981'}`,
              opacity: 0.1, animation: 'voicePulse 1.5s ease-in-out infinite 0.6s',
            }} />
          </>
        )}

        {/* Sending spinner ring */}
        {state === 'sending' && (
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: '3px solid transparent', borderTop: '3px solid #ff3e48',
            animation: 'voiceSpin 0.8s linear infinite',
          }} />
        )}

        {/* Avatar */}
        <div style={{
          width: 140, height: 140, borderRadius: '50%', overflow: 'hidden',
          background: avatarUrl ? 'none' : 'linear-gradient(135deg, #ff5b1f, #ff3e48)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `3px solid ${state === 'listening' ? '#ff3e48' : state === 'speaking' ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
          transition: 'border-color 0.3s ease',
        }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={creatorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#fff', fontSize: 48, fontWeight: 700 }}>{initial}</span>
          )}
        </div>
      </div>

      {/* State label + stop button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, minHeight: 32 }}>
        <p style={{
          color: state === 'listening' ? '#ff3e48' : state === 'speaking' ? '#10b981' : 'rgba(255,255,255,0.5)',
          fontSize: 14, fontWeight: 600, letterSpacing: '0.02em', margin: 0,
        }}>
          {state === 'idle'      && 'Tap to speak'}
          {state === 'listening' && 'Listening… tap to send'}
          {state === 'sending'   && 'Thinking…'}
          {state === 'speaking'  && 'Speaking…'}
          {state === 'error'     && 'Tap to try again'}
        </p>
        {state === 'speaking' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); stopSpeaking(); }}
            style={{
              padding: '4px 14px', borderRadius: 20,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,62,72,0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            Stop
          </button>
        )}
      </div>

      {/* Transcript / AI captions with word highlighting */}
      <div style={{
        maxWidth: 600, width: '100%', textAlign: 'center', marginTop: 20,
        minHeight: 80, padding: '0 32px',
        maxHeight: 200, overflowY: 'auto',
      }}>
        {state === 'listening' && (
          <p style={{ color: '#fff', fontSize: 18, fontWeight: 400, lineHeight: 1.6 }}>
            {transcript}{interimTranscript && <span style={{ opacity: 0.5 }}>{interimTranscript}</span>}
            {!transcript && !interimTranscript && (
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Say something…</span>
            )}
          </p>
        )}
        {state === 'sending' && transcript && (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontStyle: 'italic' }}>
            "{transcript}"
          </p>
        )}
        {state === 'speaking' && aiText && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lines.map((line, lineIdx) => {
              const prevWords  = lines.slice(0, lineIdx).join(' ').split(/\s+/).filter(Boolean).length;
              const lineWords  = line.split(/\s+/).filter(Boolean);
              const isCurrentLine = lineIdx === currentLine;
              const isPastLine    = lineIdx < currentLine;

              return (
                <p
                  key={lineIdx}
                  style={{
                    fontSize: 17, lineHeight: 1.7, fontWeight: 400, margin: 0,
                    opacity: isCurrentLine ? 1 : isPastLine ? 0.3 : 0.15,
                    transition: 'opacity 0.3s ease',
                    display: isCurrentLine || isPastLine || lineIdx === currentLine + 1 ? 'block' : 'none',
                  }}
                >
                  {lineWords.map((word, wi) => {
                    const globalIdx = prevWords + wi;
                    return (
                      <span
                        key={wi}
                        style={{
                          color: globalIdx <= highlightIndex ? '#ffffff' : 'rgba(255,255,255,0.3)',
                          transition: 'color 0.1s ease',
                        }}
                      >
                        {word}{' '}
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>
        )}
        {/* Only show error text when actually in error state — prevents stale
            network-error messages from leaking into speaking/sending states */}
        {state === 'error' && error && (
          <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{error}</p>
        )}
      </div>

      {/* Keyboard hint */}
      <p style={{
        position: 'absolute', bottom: 30,
        color: 'rgba(255,255,255,0.2)', fontSize: 12,
      }}>
        Press Escape to close
      </p>

      <style>{`
        @keyframes voicePulse {
          0%   { transform: scale(1);    opacity: 0.4; }
          50%  { transform: scale(1.08); opacity: 0.15; }
          100% { transform: scale(1);    opacity: 0.4; }
        }
        @keyframes voiceSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
