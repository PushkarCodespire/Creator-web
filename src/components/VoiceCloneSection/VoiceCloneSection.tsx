// ===========================================
// VOICE CLONE SECTION
// Dynamic multi-clip voice cloning powered by Inworld.
// Clips are added one at a time, named by the creator,
// and can be individually removed or replaced.
//
// CAPS & VALIDATIONS
// • Max 10 clips total
// • Min 15 seconds per recorded clip (Stop locked until then)
// • Min 10 seconds per uploaded file (Audio API check)
// • Max 10 minutes per uploaded file
// • Max 25 MB per file
// • One file at a time (record OR upload)
// • Accepted: MP3, WAV, M4A, WebM, OGG
// ===========================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Mic, Upload, X, Play, Pause, Check, AlertCircle, Plus, RotateCcw } from 'lucide-react';
import { RootState } from '../../store';
import { contentApi } from '../../services/api';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_CLIPS        = 10;
const MIN_RECORD_SECS  = 15;
const MIN_UPLOAD_SECS  = 10;
const MAX_UPLOAD_SECS  = 600;   // 10 min
const MAX_FILE_MB      = 25;
const ACCEPTED_FORMATS = 'audio/mpeg,audio/wav,audio/webm,audio/ogg,audio/mp4,audio/x-m4a';
const PREVIEW_ID       = '__preview__';

// ── Script suggestions ────────────────────────────────────────────────────────
// 10 scripts covering distinct emotional registers — longer samples capture more
// phonemes and prosody variation, producing a higher-quality voice clone.

const SCRIPT_SUGGESTIONS: Array<(name: string, cat: string, tag: string) => string> = [

  // 1. Warm Introduction
  (name, cat, tag) =>
    `Hi, I'm ${name}. I create content around ${cat || 'what I love'}, and if you're here right now I'm guessing you're either just getting started or you've been stuck somewhere in the middle — and honestly, that's exactly where I was not too long ago.${tag ? ' ' + tag + '.' : ''}

I remember the moment everything clicked. I had been overcomplicating it for months — putting in twice the work and getting half the results. Something had to change. So I stripped everything back, focused on what actually moved the needle, and slowly things started clicking into place.

Everything I share comes from real experience — not textbooks, not theory, not what sounds good on paper. I've made the mistakes so you don't have to. I've tested the strategies so you can skip the months of spinning your wheels.

What I want for you is simple: clarity. I want you to walk away from every conversation knowing exactly what to do next — not overwhelmed, not confused. If you're ready to cut through the noise and make real progress, you're in the right place.

Let's get to work. I'm genuinely glad you're here.`,

  // 2. Teaching — Authoritative
  () =>
    `Alright, let's talk about one of the most important principles you'll ever learn — and it's one most people skip because it's not exciting enough.

Fundamentals compound. That's it. That's the whole thing. But here's the problem: most people intellectually understand this and still refuse to act on it. They keep searching for the shortcut, the hack, the one strategy that bypasses all the foundational work.

Here's what I've learned after years of doing this: there is no version of real, lasting success that doesn't run through the basics. None. The people at the top of any field aren't doing secret techniques nobody else knows. They're doing the same things as everyone else — but they've been doing them longer, with more consistency, and with a level of attention to detail that most people simply don't have the patience for.

So if you take nothing else from me, take this: master the fundamentals before you chase complexity. Do the obvious things first, and do them very well. Be boring in your process so you can be extraordinary in your results.

The people who win are rarely the most talented. They're the most consistent. That's not motivational talk — that's a fact.`,

  // 3. Conversational — Casual & Honest
  () =>
    `You know what's funny? The question I get asked the most is always the one I have the least clean answer for. It's never 'what's the best strategy' or 'what framework do you use' — it's always just... 'how do I actually stick with this?'

And honestly, I've thought about that a lot. Because I'm not naturally disciplined either. I don't wake up every morning feeling motivated and completely on fire. Some days I really, genuinely do not want to do the work.

What I've figured out is that discipline isn't a personality trait — it's a system. It's about making the right choice the easiest choice. Removing friction. Building habits that don't depend on willpower. Being honest with yourself when something isn't working instead of forcing it harder.

A lot of us were taught that struggle means we're doing something wrong. But sometimes struggle just means you're doing something hard. And hard things take time. That's not a failure — that's just how it works.

So yeah, there's no perfect answer. But showing up consistently, even imperfectly, will beat waiting for the perfect moment every single time. Progress over perfection. Always.`,

  // 4. Motivational — High Energy
  () =>
    `I need you to hear this, because I mean every word of it: you are capable of significantly more than you're currently allowing yourself to believe.

I know how that sounds. I know it sounds like a poster on a wall somewhere. But stay with me, because the thing standing between where you are and where you want to be is almost never skill — and it's almost never resources. It's the story you're telling yourself about what's actually possible for someone like you.

I've watched people with less talent, less money, and less time build things that seem impossible — simply because they decided to stop waiting for permission. They didn't wait until they felt ready. They didn't wait until the conditions were perfect. They started messy, they learned fast, and they refused to quit when it got uncomfortable.

That's not luck. That's a decision. A daily decision to show up anyway, to take one more step even when you're tired, to remember why you started on the days when everything feels like it's going sideways.

You have what it takes. What you might be missing is the conviction to actually believe it — and then act accordingly. So stop waiting. This is the moment. Now go do the thing.`,

  // 5. Storytelling — Narrative
  () =>
    `There was a point where I almost gave up on all of this entirely. I remember it clearly — it was about eighteen months in, and nothing was working the way I thought it would.

I had done everything right, or at least I thought I had. I had a plan. I had worked consistently. I had tried all the advice I kept seeing everywhere. And still, nothing was moving. Nothing was clicking. I was exhausted and starting to wonder if I was just fundamentally wrong about what I was doing.

I sat down one night and genuinely asked myself whether this was worth continuing. The answer I landed on in that moment wasn't 'yes, just keep going.' It was: 'what do I actually still need to learn here?'

That one question changed everything. I stopped treating every setback as a signal to quit and started treating it as data. What does this mean? What can I adjust? What haven't I actually tried yet?

Within three months, things started turning around. Not because I worked harder — I was already working hard enough. But because I started asking better questions.

Stay curious when you're frustrated. That's the thing. That's the whole thing.`,

  // 6. Serious — Direct & Firm
  () =>
    `I'm going to be direct with you right now, because I think that's what you actually need.

Stop looking for a shortcut. There isn't one. I know that's not what you came here to hear, but it is the truth — and somewhere, honestly, you already know it.

The people who succeed aren't people who found the magic strategy nobody else knew about. They're people who did the work consistently, over a long enough period of time, without making excuses for themselves. That's the entire formula. That's it.

Here's what I watch happen constantly: someone gets excited, starts strong, hits their first real obstacle, gets discouraged, starts looking for something easier, finds it, feels relief briefly, hits another obstacle, and repeats the whole cycle. Nothing ever gets built. Nothing compounds. Nothing grows.

Breaking that cycle requires honesty. Real honesty. Looking at your own pattern and saying: this is not working, and I am the variable that needs to change.

That's uncomfortable. I'm not going to pretend it isn't. But discomfort is the price you pay for growth, and anyone telling you otherwise is selling you something.

I'll never tell you what you want to hear at the expense of what you need to hear. That's my commitment to you.`,

  // 7. Empathetic — Warm & Supportive
  () =>
    `I want you to know that wherever you are right now — whatever you're dealing with, whatever obstacles are in front of you — it's okay. You don't have to have it all figured out. Nobody actually does.

One of the most damaging things I see online is this constant pressure to look like you've got it together. To be further along, to perform certainty, to never show the parts that are messy or confusing. It's exhausting, and it's not real.

Behind every polished post is a person who has moments of doubt. Moments of feeling lost. Moments of wondering if they're on the right track at all. That includes me. That includes everyone you admire.

Progress is not linear. Some weeks you'll take three steps forward. Other weeks you'll feel like you're sliding backward. That doesn't mean you're failing — it means you're human, and you're in the middle of something genuinely difficult.

My job isn't to pretend this is easy. My job is to be honest with you through the whole process — the good weeks and the frustrating ones — and to remind you that you are more capable than you're currently giving yourself credit for.

You've already done something brave just by showing up. Don't underestimate that. I'm in your corner.`,

  // 8. Humorous — Playful & Authentic
  () =>
    `Okay, I tried doing the very polished, inspiration-only version of this for a while. And I kept writing things that sounded like motivational posters and then deleting them, because honestly — who actually talks like that?

So here's what you're actually getting from me: real advice, honest opinions, and the kind of conversation I'd have with a close friend over coffee — not the kind I'd put on a glossy slide deck.

I'm not always serious. I laugh at myself constantly, because if you can't find some humor in the process of trying to figure out your life and your work, you are going to have a very rough time.

The honest truth is that most of what I teach I figured out by doing it completely wrong first. There was a solid period where I was the walking definition of what not to do. It was chaotic, it was expensive, and I'm a little bit proud of it.

The point is — you don't have to be perfect to make progress. You don't have to have all the answers before you start. You just have to be willing to be a little ridiculous in pursuit of something that actually matters to you.

Embrace the mess. Enjoy the process. And if you make a truly spectacular mistake along the way, I genuinely want to hear about it.`,

  // 9. Reflective — Thoughtful & Measured
  () =>
    `The longer I do this, the more I realize that the most valuable thing I can offer isn't the tactics or the specific strategies. It's perspective.

Anyone can search for a framework. What's harder to find is someone who's been through the actual process — who can sit with you in the uncertainty and say 'yes, this part is genuinely confusing, and here's how I've learned to think about it' — not just 'here are the five steps.'

I think a lot about why some people keep growing while others stay stuck in the same patterns for years. And what I've noticed, consistently, is that the people who progress are the ones who take time to actually reflect. They're not just doing more. They're thinking about what they're doing and why.

There's a kind of busyness that prevents learning from your own experience. You're always moving but never processing. Always executing but never evaluating. And so the same essential mistakes repeat, sometimes in slightly different forms, but the same underlying pattern.

Slowing down — even briefly — to ask 'what is actually going on here?' can be more valuable than any amount of additional effort.

I try to build that kind of thinking into everything I teach. Not just what to do, but how to think about what you're doing.`,

  // 10. Challenging — Provocative & Direct
  () =>
    `Here's a question I want you to actually sit with — not just skim past: what would you do differently if you genuinely believed you couldn't fail?

Not what would you try, because trying already implies you're planning for failure. I mean: what would you fully commit to? What would you stop hedging on? What decision have you been delaying because you're afraid of being wrong, or looking foolish, or wasting your time?

Most people are operating at about sixty percent of their real capacity. Not because they lack talent — talent is rarely the limiting factor. Not because the opportunity isn't there. But because they're constantly protecting themselves from a level of discomfort that, in the grand scheme of things, really isn't that bad.

The risk of doing something bold is almost always smaller than the risk of staying comfortable and watching years go by without making the progress you know you're capable of.

I'm not saying be reckless. I'm saying be honest about the difference between real risk and manufactured fear. Most of what holds people back lives almost entirely in their own heads.

You've already proven something just by being here. The only question is whether you're willing to take what you've learned and actually do something with it. I think you are. Now prove me right.`,
];

// Generic fallback for clips beyond index 9
const GENERIC_SCRIPT = () =>
  `Keep going — the more variety in your voice samples, the better your clone will sound. This time, try a different energy level or speaking pace. You could share a quick story from your experience, walk through a concept you explain often, or just speak freely about something you care about. The goal is natural, genuine speech — different rhythm, different emotion from your previous clips. There's no script here on purpose. Just talk. Your voice sounds best when you're not thinking too hard about it.`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Clip {
  id:        string;
  name:      string;
  blob:      Blob | null;
  file:      File | null;
  objectUrl: string | null;
  duration:  number;
}

interface SavedSample {
  id:        string;
  name:      string;
  url:       string;
  duration:  number;
  createdAt: string;
}

// ── Quality indicator ─────────────────────────────────────────────────────────

function quality(count: number) {
  if (count === 0) return { label: '',       color: '#9ca3af' };
  if (count <= 2)  return { label: 'Good',   color: '#f59e0b' };
  if (count <= 5)  return { label: 'Better', color: '#3b82f6' };
  return              { label: 'Best',   color: '#10b981' };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2); }

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url   = URL.createObjectURL(file);
    audio.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(audio.duration); };
    audio.onerror          = () => { URL.revokeObjectURL(url); reject(new Error('Cannot read audio')); };
    audio.src = url;
  });
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onStatusChange?: (status: string | null) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function VoiceCloneSection({ onStatusChange }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);

  const [voiceStatus,    setVoiceStatus]    = useState<string | null>(null);
  const [voiceUploading, setVoiceUploading] = useState(false);
  const [voiceError,     setVoiceError]     = useState('');
  const [msg,            setMsg]            = useState('');

  const [previewUrl,     setPreviewUrl]     = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError,   setPreviewError]   = useState<string | null>(null);
  const [isPlaying,      setIsPlaying]      = useState(false);

  // Prosody settings
  const [speakingRate,    setSpeakingRate]    = useState(1.1);
  const [pitch,           setPitch]           = useState(4.0);
  const [settingsSaving,  setSettingsSaving]  = useState(false);
  const [settingsSaved,   setSettingsSaved]   = useState(false);

  // Saved samples (persisted in DB)
  const [savedSamples,      setSavedSamples]      = useState<SavedSample[]>([]);
  const [editingSavedId,    setEditingSavedId]    = useState<string | null>(null);
  const [editingSavedName,  setEditingSavedName]  = useState('');
  const [savingRename,      setSavingRename]      = useState(false);

  // Clips (in-memory, for building a new clone submission)
  const [clips,        setClips]        = useState<Clip[]>([]);
  // Ever-increasing counter so default names never collide (even after removes)
  const [clipCounter,  setClipCounter]  = useState(0);
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [editingName,  setEditingName]  = useState('');
  // Controls whether AddClipPanel auto-opens (used after Replace)
  const [openAddPanel, setOpenAddPanel] = useState(false);

  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const playingIdRef = useRef<string | null>(null);

  // Load status and saved samples on mount
  useEffect(() => {
    contentApi.getVoiceClone()
      .then(res => {
        const d = res.data.data;
        if (d?.status) {
          setVoiceStatus(d.status);
          onStatusChange?.(d.status);
          if (d.status === 'READY') loadPreview();
        }
        if (Array.isArray(d?.voiceSamples)) {
          setSavedSamples(d.voiceSamples as SavedSample[]);
        }
        if (d?.speakingRate != null) setSpeakingRate(d.speakingRate as number);
        if (d?.pitch != null)        setPitch(d.pitch as number);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => { clips.forEach(c => { if (c.objectUrl) URL.revokeObjectURL(c.objectUrl); }); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMsg      = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 4000); };
  const updateStatus = (s: string | null) => { setVoiceStatus(s); onStatusChange?.(s); };
  const isReady      = voiceStatus === 'READY';
  const q            = quality(savedSamples.length || clips.length);

  const getScript = useCallback((index: number) => {
    const name = user?.creator?.displayName || user?.name || 'there';
    const cat  = user?.creator?.category   || 'what I do';
    const tag  = user?.creator?.tagline    || '';
    const fn   = SCRIPT_SUGGESTIONS[index] ?? GENERIC_SCRIPT;
    return fn(name, cat, tag);
  }, [user]);

  // ── Clip management ─────────────────────────────────────────────────────────

  const addClip = (clip: Omit<Clip, 'id'>) => {
    setClips(prev => [...prev, { ...clip, id: uid() }]);
    setClipCounter(c => c + 1);
  };

  const removeClip = (id: string) => {
    setClips(prev => {
      const c = prev.find(x => x.id === id);
      if (c?.objectUrl) URL.revokeObjectURL(c.objectUrl);
      return prev.filter(x => x.id !== id);
    });
    if (playingIdRef.current === id) stopAudio();
  };

  // Replace: remove the clip and auto-open the add panel for a new one
  const replaceClip = (id: string) => {
    removeClip(id);
    setOpenAddPanel(true);
  };

  const startEditName = (clip: Clip) => { setEditingId(clip.id); setEditingName(clip.name); };
  const commitName    = () => {
    if (!editingId) return;
    const trimmed = editingName.trim();
    if (trimmed) setClips(prev => prev.map(c => c.id === editingId ? { ...c, name: trimmed } : c));
    setEditingId(null);
  };

  // ── Saved sample operations ─────────────────────────────────────────────────

  const startEditSaved = (sample: SavedSample) => {
    setEditingSavedId(sample.id);
    setEditingSavedName(sample.name);
  };

  const commitSavedName = async () => {
    if (!editingSavedId) return;
    const trimmed = editingSavedName.trim();
    if (!trimmed) { setEditingSavedId(null); return; }
    setSavingRename(true);
    try {
      await contentApi.renameSample(editingSavedId, trimmed);
      setSavedSamples(prev => prev.map(s => s.id === editingSavedId ? { ...s, name: trimmed } : s));
    } catch { /* keep existing name on failure */ }
    setSavingRename(false);
    setEditingSavedId(null);
  };

  const deleteSavedSample = async (id: string) => {
    try {
      await contentApi.deleteSample(id);
      setSavedSamples(prev => prev.filter(s => s.id !== id));
    } catch { /* non-fatal */ }
  };

  const applySettings = async () => {
    setSettingsSaving(true);
    setSettingsSaved(false);
    try {
      await contentApi.updateVoiceSettings({ speakingRate, pitch });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch { /* non-fatal */ }
    finally { setSettingsSaving(false); }
  };

  const playSavedSample = (sample: SavedSample) => {
    stopAudio();
    const a = new Audio(sample.url);
    audioRef.current     = a;
    playingIdRef.current = sample.id;
    a.onended = () => { setIsPlaying(false); playingIdRef.current = null; };
    a.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  // ── Playback ────────────────────────────────────────────────────────────────

  const stopAudio = () => {
    audioRef.current?.pause();
    audioRef.current     = null;
    playingIdRef.current = null;
    setIsPlaying(false);
  };

  const playClip = (clip: Clip) => {
    stopAudio();
    if (!clip.objectUrl) return;
    const a = new Audio(clip.objectUrl);
    audioRef.current     = a;
    playingIdRef.current = clip.id;
    a.onended = () => { setIsPlaying(false); playingIdRef.current = null; };
    a.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const playPreview = () => {
    stopAudio();
    if (!previewUrl) return;
    const a = new Audio(previewUrl);
    audioRef.current     = a;
    playingIdRef.current = PREVIEW_ID;
    a.onended = () => { setIsPlaying(false); playingIdRef.current = null; };
    a.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const previewIsPlaying = isPlaying && playingIdRef.current === PREVIEW_ID;

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!clips.length) { setVoiceError('Add at least one voice clip.'); return; }
    setVoiceUploading(true);
    setVoiceError('');
    try {
      const formData = new FormData();
      formData.append('voiceProvider', 'inworld');
      clips.forEach((clip, i) => {
        if (clip.blob) formData.append('audio', clip.blob, `${clip.name || 'clip-' + (i + 1)}.webm`);
        else if (clip.file) formData.append('audio', clip.file);
      });
      const res = await contentApi.uploadVoiceClone(formData);
      updateStatus(res.data.data?.status || 'READY');
      showMsg(isReady ? 'Voice clone updated!' : 'Voice clone created!');
      // Persist saved samples from response
      if (Array.isArray(res.data.data?.voiceSamples)) {
        setSavedSamples(res.data.data.voiceSamples as SavedSample[]);
      }
      setClips([]);
      // Show spinner immediately; give Inworld 4s to index the cloned voice
      // before requesting TTS — calling immediately often returns 404/not-ready.
      setPreviewLoading(true);
      setPreviewUrl(null);
      setPreviewError(null);
      setTimeout(() => loadPreview(), 4000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setVoiceError(e?.response?.data?.error?.message || 'Voice clone failed. Please try again.');
    } finally {
      setVoiceUploading(false);
    }
  };

  const loadPreview = async () => {
    setPreviewLoading(true);
    setPreviewUrl(null);
    setPreviewError(null);
    try {
      const res = await contentApi.previewVoiceClone();
      const { audioUrl, previewError: apiErr } = res.data.data ?? {};
      setPreviewUrl(audioUrl || null);
      setPreviewError(audioUrl ? null : (apiErr || 'TTS unavailable'));
    } catch { setPreviewError('Could not reach preview endpoint'); }
    finally { setPreviewLoading(false); }
  };

  // ── PROCESSING ───────────────────────────────────────────────────────────────

  if (voiceStatus === 'PROCESSING' || voiceUploading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 24px' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#ff3e48', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>
          {voiceUploading ? `Uploading ${clips.length} clip${clips.length > 1 ? 's' : ''}…` : 'Processing your voice clone…'}
        </p>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>This usually takes about 30 seconds</p>
      </div>
    );
  }

  // ── MAIN RENDER ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Header row: status/title on left · listen + quality on right ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

        {/* Left */}
        {isReady ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Voice clone active</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Your AI responds in your voice</p>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Voice Clips</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>
              Add clips one at a time · up to {MAX_CLIPS} · min {MIN_RECORD_SECS}s each
            </p>
          </div>
        )}

        {/* Right: listen button + quality dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

          {/* Listen / Pause — shown when READY, collapsed to spinner while loading */}
          {isReady && (
            previewLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: '#f3f4f6', fontSize: 12, color: '#9ca3af' }}>
                <div style={{ width: 11, height: 11, border: '2px solid #e5e7eb', borderTopColor: '#9ca3af', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Generating…
              </div>
            ) : previewUrl ? (
              <button
                type="button"
                onClick={previewIsPlaying ? stopAudio : playPreview}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 13px', borderRadius: 8, background: '#111827', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {previewIsPlaying ? <Pause size={11} /> : <Play size={11} />}
                {previewIsPlaying ? 'Pause' : 'Listen'}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <button
                  type="button"
                  onClick={loadPreview}
                  title={previewError ?? 'Click to retry preview generation'}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: '#fff', color: '#9ca3af', fontSize: 11, fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <RotateCcw size={10} /> Retry preview
                </button>
                {previewError && (
                  <span style={{ fontSize: 10, color: '#ef4444', maxWidth: 200, textAlign: 'right', lineHeight: 1.4, wordBreak: 'break-all' }}>
                    {previewError.length > 90 ? previewError.slice(0, 90) + '…' : previewError}
                  </span>
                )}
              </div>
            )
          )}

          {/* Quality dot */}
          {(savedSamples.length > 0 || clips.length > 0) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: q.color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: q.color, whiteSpace: 'nowrap' }}>
                {q.label} · {savedSamples.length || clips.length}/{MAX_CLIPS}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Saved samples (persisted in DB) ── */}
      {savedSamples.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Saved Voice Samples
          </p>
          {savedSamples.map(sample => (
            <div key={sample.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #d1fae5' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={12} style={{ color: '#10b981' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {editingSavedId === sample.id ? (
                  <input
                    autoFocus
                    value={editingSavedName}
                    onChange={e => setEditingSavedName(e.target.value)}
                    onBlur={commitSavedName}
                    onKeyDown={e => { if (e.key === 'Enter') commitSavedName(); if (e.key === 'Escape') setEditingSavedId(null); }}
                    disabled={savingRename}
                    style={{ width: '100%', fontSize: 13, fontWeight: 600, color: '#111827', border: 'none', borderBottom: '1.5px solid #ff3e48', background: 'transparent', outline: 'none', padding: '2px 0' }}
                  />
                ) : (
                  <button type="button" onClick={() => startEditSaved(sample)} title="Click to rename"
                    style={{ fontSize: 13, fontWeight: 600, color: '#111827', background: 'none', border: 'none', cursor: 'text', padding: 0, textAlign: 'left', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sample.name}
                  </button>
                )}
                <p style={{ fontSize: 11, color: '#6b7280', margin: '1px 0 0' }}>Saved</p>
              </div>

              {/* Play */}
              <button type="button"
                onClick={() => playingIdRef.current === sample.id && isPlaying ? stopAudio() : playSavedSample(sample)}
                title={playingIdRef.current === sample.id && isPlaying ? 'Pause' : 'Play'}
                style={{ width: 26, height: 26, borderRadius: 6, background: '#fff', border: '1px solid #d1d5db', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {playingIdRef.current === sample.id && isPlaying ? <Pause size={10} /> : <Play size={10} />}
              </button>

              {/* Delete */}
              <button type="button" onClick={() => deleteSavedSample(sample.id)} title="Remove this sample"
                style={{ width: 26, height: 26, borderRadius: 6, background: 'transparent', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9ca3af' }}>
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── New clips being staged (in-memory) ── */}
      {clips.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {savedSamples.length > 0 && (
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              New Clips (for re-training)
            </p>
          )}
          {clips.map((clip, i) => (
            <div key={clip.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #d1fae5' }}>

              {/* Check badge */}
              <div style={{ width: 22, height: 22, borderRadius: 6, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={12} style={{ color: '#10b981' }} />
              </div>

              {/* Editable name + duration */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingId === clip.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onBlur={commitName}
                    onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingId(null); }}
                    style={{ width: '100%', fontSize: 13, fontWeight: 600, color: '#111827', border: 'none', borderBottom: '1.5px solid #ff3e48', background: 'transparent', outline: 'none', padding: '2px 0' }}
                  />
                ) : (
                  <button type="button" onClick={() => startEditName(clip)} title="Click to rename"
                    style={{ fontSize: 13, fontWeight: 600, color: '#111827', background: 'none', border: 'none', cursor: 'text', padding: 0, textAlign: 'left', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {clip.name || `Clip ${i + 1}`}
                  </button>
                )}
                {clip.duration > 0 && (
                  <p style={{ fontSize: 11, color: '#6b7280', margin: '1px 0 0' }}>{fmt(clip.duration)}</p>
                )}
              </div>

              {/* Play / Pause clip */}
              {clip.objectUrl && (
                <button type="button"
                  onClick={() => playingIdRef.current === clip.id && isPlaying ? stopAudio() : playClip(clip)}
                  title={playingIdRef.current === clip.id && isPlaying ? 'Pause' : 'Play'}
                  style={{ width: 26, height: 26, borderRadius: 6, background: '#fff', border: '1px solid #d1d5db', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {playingIdRef.current === clip.id && isPlaying ? <Pause size={10} /> : <Play size={10} />}
                </button>
              )}

              {/* Replace */}
              <button type="button" onClick={() => replaceClip(clip.id)} title="Replace this clip"
                style={{ padding: '3px 9px', borderRadius: 6, background: '#fff', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#6b7280', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <RotateCcw size={10} /> Replace
              </button>

              {/* Remove */}
              <button type="button" onClick={() => removeClip(clip.id)} title="Remove this clip"
                style={{ width: 26, height: 26, borderRadius: 6, background: 'transparent', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9ca3af' }}>
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Add clip panel ── */}
      {clips.length < MAX_CLIPS && (
        <AddClipPanel
          clipIndex={clips.length}
          clipNumber={clipCounter + 1}
          script={getScript(clips.length)}
          hasSaved={savedSamples.length > 0}
          initialOpen={openAddPanel}
          onAdd={(clip) => {
            addClip(clip);
            setOpenAddPanel(false);
            setVoiceError('');
          }}
          onClose={() => setOpenAddPanel(false)}
          onError={setVoiceError}
        />
      )}

      {clips.length >= MAX_CLIPS && (
        <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
          Maximum {MAX_CLIPS} clips reached. Remove one to add another.
        </div>
      )}

      {/* Voice is active but has no persisted samples yet (clone was created before sample tracking) */}
      {isReady && clips.length === 0 && savedSamples.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #d1fae5' }}>
          <Check size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#065f46', margin: 0 }}>Voice clone active</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0', lineHeight: 1.5 }}>
              Upload new clips below to retrain — your saved samples will appear here for management.
            </p>
          </div>
        </div>
      )}

      {/* ── Validation hint ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <AlertCircle size={13} style={{ color: '#9ca3af', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
          Each clip min {MIN_RECORD_SECS}s · max {MAX_UPLOAD_SECS / 60} min · max {MAX_FILE_MB} MB · MP3, WAV, M4A, WebM · your voice only, no background music or other speakers
        </p>
      </div>

      {/* ── Error / success ── */}
      {voiceError && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '10px 12px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
          <AlertCircle size={13} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{voiceError}</p>
        </div>
      )}
      {msg && <p style={{ fontSize: 12, color: '#10b981', margin: 0, textAlign: 'center' }}>{msg}</p>}

      {/* ── Submit ── */}
      {clips.length > 0 && (
        <button type="button" onClick={handleSubmit} disabled={voiceUploading}
          style={{ padding: '13px', borderRadius: 12, background: '#ff3e48', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background 0.15s ease' }}>
          {isReady
            ? `Retrain Voice Clone · ${clips.length} new clip${clips.length > 1 ? 's' : ''}`
            : `Create Voice Clone · ${clips.length} clip${clips.length > 1 ? 's' : ''} · ${q.label} quality`}
        </button>
      )}

      {!isReady && clips.length === 0 && savedSamples.length === 0 && (
        <div style={{ padding: '13px', borderRadius: 12, background: '#f3f4f6', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
          Add at least one clip to create your voice clone
        </div>
      )}

      {/* ── Voice Delivery Tuning — only shown when a clone is active ── */}
      {isReady && (
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Voice Delivery
            </p>
            <button
              type="button"
              onClick={applySettings}
              disabled={settingsSaving}
              style={{ padding: '3px 10px', borderRadius: 6, background: settingsSaved ? '#10b981' : '#111827', color: '#fff', fontSize: 11, fontWeight: 600, border: 'none', cursor: settingsSaving ? 'not-allowed' : 'pointer', opacity: settingsSaving ? 0.6 : 1, transition: 'background 0.2s ease' }}
            >
              {settingsSaving ? 'Saving…' : settingsSaved ? '✓ Saved' : 'Apply'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            {/* Speed slider */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#6b7280' }}>Speed</span>
                <span style={{ fontSize: 11, color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>{speakingRate.toFixed(2)}×</span>
              </div>
              <input
                type="range" min={0.5} max={2.0} step={0.05}
                value={speakingRate}
                onChange={e => setSpeakingRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ff3e48', cursor: 'pointer', height: 3 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#d1d5db' }}>
                <span>Slow</span><span>Fast</span>
              </div>
            </div>

            {/* Energy slider */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#6b7280' }}>Energy</span>
                <span style={{ fontSize: 11, color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>{pitch > 0 ? `+${pitch.toFixed(1)}` : pitch.toFixed(1)} st</span>
              </div>
              <input
                type="range" min={-5} max={5} step={0.5}
                value={pitch}
                onChange={e => setPitch(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ff3e48', cursor: 'pointer', height: 3 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#d1d5db' }}>
                <span>Flat</span><span>High</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD CLIP PANEL — record or upload one clip at a time
// ─────────────────────────────────────────────────────────────────────────────

interface AddClipPanelProps {
  clipIndex:    number;
  clipNumber:   number;   // Ever-incrementing — prevents duplicate default names
  script:       string;
  hasSaved?:    boolean;  // true when saved samples already exist
  onAdd:        (clip: Omit<Clip, 'id'>) => void;
  onError:      (msg: string) => void;
  initialOpen?: boolean;  // auto-open (e.g. after Replace)
  onClose?:     () => void;
}

type PanelMode = 'idle' | 'recording' | 'uploading';

function AddClipPanel({ clipIndex, clipNumber, script, hasSaved = false, onAdd, onError, initialOpen = false, onClose }: AddClipPanelProps) {
  const [open,          setOpen]          = useState(initialOpen);
  const [mode,          setMode]          = useState<PanelMode>('idle');
  const [clipName,      setClipName]      = useState(`Clip ${clipNumber}`);
  const [recordingTime, setRecordingTime] = useState(0);
  const [localError,    setLocalError]    = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef   = useRef<MediaStream | null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimeRef = useRef(0);
  const fileInputRef     = useRef<HTMLInputElement>(null);
  const startingRef      = useRef(false); // guard against double-click during getUserMedia await

  const canStop = recordingTime >= MIN_RECORD_SECS;

  // Unmount cleanup — always stop the interval and release mic
  useEffect(() => {
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Re-sync when clip slot, forced-open state, or clip number changes.
  // Must also stop any in-flight recording so the interval doesn't outlive the reset.
  useEffect(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') { rec.ondataavailable = null; rec.onstop = null; rec.stop(); }
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    recordingTimeRef.current = 0;
    startingRef.current = false;
    setClipName(`Clip ${clipNumber}`);
    setOpen(initialOpen);
    setMode('idle');
    setLocalError('');
    setRecordingTime(0);
  }, [clipIndex, initialOpen, clipNumber]);

  // ── Cancel helper (safe even when no recording is active) ──────────────────

  const cancelRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      rec.ondataavailable = null;
      rec.onstop          = null;
      rec.stop();
    }
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setMode('idle');
    setRecordingTime(0);
  };

  const closePanel = () => {
    cancelRecording();
    setOpen(false);
    setLocalError('');
    onClose?.();
  };

  const err = (m: string) => { setLocalError(m); onError(m); };

  // ── Recording ───────────────────────────────────────────────────────────────

  const startRecording = async () => {
    // Prevent re-entry: mode check covers the normal path; startingRef covers the
    // getUserMedia await window where mode is still 'idle' but a call is in-flight.
    if (mode === 'recording' || startingRef.current) return;
    startingRef.current = true;
    setLocalError('');
    audioChunksRef.current   = [];
    recordingTimeRef.current = 0;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        mediaStreamRef.current?.getTracks().forEach(t => t.stop());
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

        const blob     = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const finalDur = recordingTimeRef.current;

        if (blob.size < 1000 || finalDur < 5) {
          err('Recording too short. Please try again.');
          setMode('idle');
          setRecordingTime(0);
          return;
        }

        const objectUrl = URL.createObjectURL(blob);
        onAdd({ name: clipName.trim() || `Clip ${clipNumber}`, blob, file: null, objectUrl, duration: finalDur });
        setOpen(false);
        setMode('idle');
        setRecordingTime(0);
        setLocalError('');
      };

      recorder.start(200);
      startingRef.current = false; // getUserMedia succeeded, mode is now 'recording'
      setMode('recording');
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        recordingTimeRef.current++;
        setRecordingTime(recordingTimeRef.current);
      }, 1000);
    } catch {
      startingRef.current = false;
      err('Microphone access required. Allow it in your browser settings.');
    }
  };

  const stopRecording = () => {
    if (!canStop) return;
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') rec.stop();
  };

  // ── File upload ─────────────────────────────────────────────────────────────

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setMode('uploading');
    setLocalError('');

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      err(`File too large — max ${MAX_FILE_MB} MB`);
      setMode('idle');
      return;
    }

    try {
      const dur = await getAudioDuration(file);
      if (dur < MIN_UPLOAD_SECS) {
        err(`File too short (${Math.round(dur)}s) — minimum ${MIN_UPLOAD_SECS}s`);
        setMode('idle');
        return;
      }
      if (dur > MAX_UPLOAD_SECS) {
        err(`File too long — maximum ${MAX_UPLOAD_SECS / 60} minutes`);
        setMode('idle');
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      onAdd({ name: clipName.trim() || file.name.replace(/\.[^.]+$/, ''), blob: null, file, objectUrl, duration: Math.round(dur) });
      setOpen(false);
      setMode('idle');
      setLocalError('');
    } catch {
      err('Could not read audio file. Use MP3, WAV, M4A, or WebM.');
      setMode('idle');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 10, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, border: '1.5px dashed #d1d5db', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#ff3e48')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#d1d5db')}>
        <Plus size={15} style={{ color: '#ff3e48' }} />
        {clipIndex === 0 && !hasSaved ? 'Add your first voice clip' : 'Add another clip'}
      </button>
    );
  }

  return (
    <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>

      {/* Name input */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, color: '#6b7280', flexShrink: 0, fontWeight: 500 }}>Name</span>
        <input
          value={clipName}
          onChange={e => setClipName(e.target.value)}
          placeholder={`Clip ${clipNumber}`}
          maxLength={40}
          style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#111827', border: 'none', outline: 'none', background: 'transparent' }}
        />
        <button type="button" onClick={closePanel}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      {/* Script suggestion */}
      <div style={{ padding: '12px 14px', background: '#fafafa', borderBottom: '1px solid #f3f4f6', fontSize: 12, color: '#374151', lineHeight: 1.7, maxHeight: 180, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
        {script}
      </div>

      {/* Controls */}
      <div style={{ padding: '12px 14px' }}>
        {mode === 'idle' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={startRecording}
              style={{ flex: 1, padding: '9px', borderRadius: 9, background: '#ff3e48', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Mic size={14} /> Record
            </button>
            <input ref={fileInputRef} type="file" accept={ACCEPTED_FORMATS} style={{ display: 'none' }} onChange={handleFile} />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              style={{ flex: 1, padding: '9px', borderRadius: 9, background: '#f9fafb', color: '#374151', fontSize: 13, fontWeight: 600, border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Upload size={14} /> Upload
            </button>
          </div>
        )}

        {mode === 'uploading' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 0' }}>
            <div style={{ width: 16, height: 16, border: '2px solid #e5e7eb', borderTopColor: '#ff3e48', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: 13, color: '#6b7280' }}>Checking file…</span>
          </div>
        )}

        {mode === 'recording' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(recordingTime)}
                </span>
              </div>
              {!canStop && (
                <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
                  {MIN_RECORD_SECS - recordingTime}s more to unlock Stop
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={stopRecording} disabled={!canStop}
                style={{ padding: '7px 16px', borderRadius: 8, background: canStop ? '#111827' : '#e5e7eb', color: canStop ? '#fff' : '#9ca3af', fontSize: 12, fontWeight: 600, border: 'none', cursor: canStop ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: canStop ? '#fff' : '#9ca3af' }} />
                {canStop ? 'Stop & Save' : `Stop (${MIN_RECORD_SECS - recordingTime}s)`}
              </button>
              <button type="button" onClick={cancelRecording}
                style={{ padding: '7px 12px', borderRadius: 8, background: 'transparent', color: '#9ca3af', fontSize: 12, border: '1px solid #e5e7eb', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {localError && (
          <p style={{ fontSize: 12, color: '#dc2626', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle size={12} /> {localError}
          </p>
        )}
      </div>
    </div>
  );
}

export default VoiceCloneSection;
