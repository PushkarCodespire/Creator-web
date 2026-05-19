import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Activity, Leaf, Target, Zap, GraduationCap } from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { updateUser, setProfileComplete } from '../../store/slices/authSlice';
import { userApi } from '../../services/api';

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
const TABS = [
  { key: 'age',       label: 'Age',       icon: <Calendar size={16} />,      title: 'Your Age',                           subtitle: 'Helps us personalise your fitness journey' },
  { key: 'body',      label: 'Body',      icon: <Activity size={16} />,      title: 'Height & Weight',                    subtitle: 'Used to calculate targets and recommendations' },
  { key: 'diet',      label: 'Diet',      icon: <Leaf size={16} />,          title: 'Diet Preference',                    subtitle: 'We\'ll match you with the right nutrition guidance' },
  { key: 'goal',      label: 'Goal',      icon: <Target size={16} />,        title: 'Your Main Fitness Goal',             subtitle: 'Set the direction for your AI coach' },
  { key: 'challenge', label: 'Challenge', icon: <Zap size={16} />,           title: 'Biggest Challenge',                  subtitle: 'So your coach knows where to focus first' },
  { key: 'coach',     label: 'Coach',     icon: <GraduationCap size={16} />, title: 'Your Coach Style',                   subtitle: 'Choose the coaching approach that works for you' },
];

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
const AGE_RANGES   = ['18 - 24 years', '25 - 34 years', '35 - 45 years', '44 - 55 years', '55+ years'];
const DIET_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'];
const GOAL_OPTIONS = ['Lose fat', 'Gain muscle', 'Fix hormones / PCOS', 'Improve energy & health', 'General fitness', 'Others'];
const CHALLENGE_OPTIONS = ["Can't lose weight despite trying", "Can't stick to a diet", 'Low on motivation', 'Sleep issues', 'PCOS', 'Inconsistent — On & off diet & workout', 'Others'];
const COACH_OPTIONS = ['Strict', 'Friendly', 'Science-based'];

const HEIGHTS = Array.from({ length: 81 }, (_, i) => 140 + i);
const WEIGHTS = Array.from({ length: 121 }, (_, i) => 30 + i);

// ---------------------------------------------------------------------------
// Scroll Picker
// ---------------------------------------------------------------------------
function ScrollPicker({ items, value, label, onChange }: { items: number[]; value: number; label: string; onChange: (v: number) => void }) {
  const ITEM_H = 44;
  const VISIBLE = 7;
  const selectedIndex = items.indexOf(value);
  const touchStartY = useRef(0);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0 && selectedIndex < items.length - 1) onChange(items[selectedIndex + 1]);
    if (e.deltaY < 0 && selectedIndex > 0)               onChange(items[selectedIndex - 1]);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 10 && selectedIndex < items.length - 1) onChange(items[selectedIndex + 1]);
    if (diff < -10 && selectedIndex > 0)               onChange(items[selectedIndex - 1]);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div
        style={{ height: ITEM_H * VISIBLE, overflow: 'hidden', position: 'relative', width: '100%', cursor: 'ns-resize' }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to bottom, #f9fafb, transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, #f9fafb, transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 8, right: 8, height: ITEM_H, background: 'rgba(255,62,72,0.08)', border: '1.5px solid rgba(255,62,72,0.25)', borderRadius: 10, zIndex: 1 }} />
        <div style={{ transform: `translateY(${(Math.floor(VISIBLE / 2) - selectedIndex) * ITEM_H}px)`, transition: 'transform 0.15s ease' }}>
          {items.map((item, i) => (
            <div key={item} onClick={() => onChange(item)} style={{
              height: ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: i === selectedIndex ? 18 : 14,
              fontWeight: i === selectedIndex ? 700 : 400,
              color: i === selectedIndex ? '#ff3e48' : Math.abs(i - selectedIndex) === 1 ? '#6b7280' : '#c4c4c4',
              cursor: 'pointer', zIndex: 3, position: 'relative', transition: 'all 0.15s ease',
            }}>
              {item} {label === 'Height' ? 'cm' : 'kg'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Radio Option
// ---------------------------------------------------------------------------
function RadioOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', width: '100%',
      border: `1.5px solid ${selected ? '#ff3e48' : '#e5e7eb'}`,
      background: selected ? '#fff5f5' : '#fff',
      transition: 'all 0.15s ease',
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${selected ? '#ff3e48' : '#d1d5db'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff3e48' }} />}
      </div>
      <span style={{ fontSize: 14, fontWeight: selected ? 600 : 400, color: '#111827' }}>{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function WebsiteOnboarding() {
  const navigate   = useNavigate();
  const dispatch   = useDispatch<AppDispatch>();
  const { user }   = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState('age');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());

  const [ageRange,   setAgeRange]   = useState('');
  const [heightCm,   setHeightCm]   = useState(170);
  const [weightKg,   setWeightKg]   = useState(70);
  const [diet,       setDiet]       = useState('');
  const [goal,       setGoal]       = useState('');
  const [challenge,  setChallenge]  = useState('');
  const [coachStyle, setCoachStyle] = useState('');

  const isEditing = !!user?.onboardingCompleted;

  useEffect(() => {
    if (!user) { navigate('/login', { replace: true }); }
  }, [user, navigate]);

  // Pre-populate when editing
  useEffect(() => {
    if (!user) return;
    if (user.ageRange)        setAgeRange(user.ageRange);
    if (user.heightCm)        setHeightCm(user.heightCm);
    if (user.weightKg)        setWeightKg(user.weightKg);
    if (user.dietPreference)  setDiet(user.dietPreference);
    if (user.fitnessGoal)     setGoal(user.fitnessGoal);
    if (user.fitnessChallenge) setChallenge(user.fitnessChallenge);
    if (user.coachStyle)      setCoachStyle(user.coachStyle);

    // Mark already-answered tabs as complete
    const done = new Set<string>();
    if (user.ageRange)         done.add('age');
    if (user.heightCm)         done.add('body');
    if (user.dietPreference)   done.add('diet');
    if (user.fitnessGoal)      done.add('goal');
    if (user.fitnessChallenge) done.add('challenge');
    if (user.coachStyle)       done.add('coach');
    setCompletedTabs(done);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  const currentTabIdx = TABS.findIndex(t => t.key === activeTab);
  const current       = TABS[currentTabIdx];

  const getAnswer = (key: string) => ({ age: ageRange, diet, goal, challenge, coach: coachStyle }[key] ?? '');
  const setAnswer = (key: string, val: string) => {
    if (key === 'age')       setAgeRange(val);
    if (key === 'diet')      setDiet(val);
    if (key === 'goal')      setGoal(val);
    if (key === 'challenge') setChallenge(val);
    if (key === 'coach')     setCoachStyle(val);
  };

  const canAdvance = current.key === 'body' || !!getAnswer(current.key);

  const markComplete = () => setCompletedTabs(prev => new Set(prev).add(activeTab));

  const handleNext = () => {
    if (!canAdvance) return;
    markComplete();
    if (currentTabIdx < TABS.length - 1) {
      setActiveTab(TABS[currentTabIdx + 1].key);
    }
  };

  const handleSave = async () => {
    if (!canAdvance) return;
    markComplete();
    setSaving(true);
    setError('');
    try {
      await userApi.completeOnboarding({ ageRange, heightCm, weightKg, dietPreference: diet, fitnessGoal: goal, fitnessChallenge: challenge, coachStyle });
      dispatch(updateUser({ onboardingCompleted: true, ageRange, heightCm, weightKg, dietPreference: diet, fitnessGoal: goal, fitnessChallenge: challenge, coachStyle }));
      dispatch(setProfileComplete(true));
      navigate(isEditing ? '/user/profile' : '/', { replace: true });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    dispatch(setProfileComplete(true));
    navigate(isEditing ? '/user/profile' : '/', { replace: true });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'age':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {AGE_RANGES.map(opt => <RadioOption key={opt} label={opt} selected={ageRange === opt} onClick={() => setAgeRange(opt)} />)}
          </div>
        );
      case 'body':
        return (
          <div style={{ background: '#f9fafb', borderRadius: 14, border: '1px solid #e5e7eb', padding: '20px 28px', display: 'flex', gap: 28 }}>
            <ScrollPicker items={HEIGHTS} value={heightCm} label="Height" onChange={setHeightCm} />
            <div style={{ width: 1, background: '#e5e7eb', flexShrink: 0 }} />
            <ScrollPicker items={WEIGHTS} value={weightKg} label="Weight" onChange={setWeightKg} />
          </div>
        );
      case 'diet':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DIET_OPTIONS.map(opt => <RadioOption key={opt} label={opt} selected={diet === opt} onClick={() => setDiet(opt)} />)}
          </div>
        );
      case 'goal':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {GOAL_OPTIONS.map(opt => <RadioOption key={opt} label={opt} selected={goal === opt} onClick={() => setGoal(opt)} />)}
          </div>
        );
      case 'challenge':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CHALLENGE_OPTIONS.map(opt => <RadioOption key={opt} label={opt} selected={challenge === opt} onClick={() => setChallenge(opt)} />)}
          </div>
        );
      case 'coach':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {COACH_OPTIONS.map(opt => <RadioOption key={opt} label={opt} selected={coachStyle === opt} onClick={() => setCoachStyle(opt)} />)}
          </div>
        );
      default:
        return null;
    }
  };

  const isLastTab = currentTabIdx === TABS.length - 1;

  return (
    <div style={{ minHeight: '100vh', background: '#fbf7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 620, borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)' }}>

        {/* Dark header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #0a0505 100%)',
          padding: '28px 36px 20px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,62,72,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,62,72,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3e48' }}>
                {current.icon}
              </div>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                {current.title}
              </h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0, paddingLeft: 42 }}>
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Pill tabs */}
        <div style={{ background: '#fff', padding: '16px 36px 0' }}>
          <div style={{ position: 'relative', display: 'flex', background: '#f3f4f6', borderRadius: 12, padding: 3 }}>
            {/* Sliding indicator */}
            <div style={{
              position: 'absolute', top: 3,
              left: `calc(${currentTabIdx} * ${100 / TABS.length}% + 3px)`,
              width: `calc(${100 / TABS.length}% - 6px)`,
              height: 'calc(100% - 6px)',
              background: '#ffffff', borderRadius: 10,
              boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 0,
            }} />
            {TABS.map((tab) => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} style={{
                flex: 1, position: 'relative', zIndex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '9px 4px', fontSize: 10, fontWeight: 700,
                color: activeTab === tab.key ? '#111827' : completedTabs.has(tab.key) ? '#10b981' : '#9ca3af',
                background: 'transparent', border: 'none', cursor: 'pointer',
                transition: 'color 0.2s ease', textTransform: 'uppercase', letterSpacing: '0.04em', borderRadius: 10,
              }}>
                {tab.icon}
                <span style={{ display: 'none' }} className="hide-mobile">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Per-tab progress bars */}
          <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
            {TABS.map((tab) => (
              <div key={tab.key} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: completedTabs.has(tab.key) ? '#10b981' : activeTab === tab.key ? '#ff3e48' : '#e5e7eb',
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ background: '#fff', padding: '24px 36px 16px' }}>
          {error && <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>{error}</div>}
          {renderContent()}
        </div>

        {/* Footer */}
        <div style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', padding: '0 36px 28px', gap: 12 }}>
          <button type="button"
            onClick={currentTabIdx === 0 ? handleCancel : () => setActiveTab(TABS[currentTabIdx - 1].key)}
            style={{
              padding: '11px 28px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff',
              color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            {currentTabIdx === 0 ? (isEditing ? 'Cancel' : 'Skip') : 'Back'}
          </button>

          {isLastTab ? (
            <button type="button" onClick={handleSave} disabled={!canAdvance || saving}
              style={{
                padding: '11px 36px', borderRadius: 10, border: 'none',
                background: canAdvance ? 'linear-gradient(135deg, #ff5b1f 0%, #ff3e48 100%)' : '#d1d5db',
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: canAdvance ? 'pointer' : 'not-allowed',
                boxShadow: canAdvance ? '0 4px 12px rgba(255,62,72,0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {saving ? 'Saving...' : isEditing ? '✓ Save Changes' : '🏋️ Get Started'}
            </button>
          ) : (
            <button type="button" onClick={handleNext} disabled={!canAdvance}
              style={{
                padding: '11px 32px', borderRadius: 10, border: 'none',
                background: canAdvance ? '#111827' : '#d1d5db',
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: canAdvance ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
              }}
            >
              Save & Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
