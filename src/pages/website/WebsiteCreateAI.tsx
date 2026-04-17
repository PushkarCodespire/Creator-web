import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { authApi } from '../../services/api';
import { logger } from '../../utils/logger';
import styles from './WebsiteCreateAI.module.css';
import { CustomizeForm } from './components/CustomizeForm';

const ASSETS = {
  alexChen: "/website/figma/9bbdfb06a5eae3ca01387e38cee556cb0ba93eb3.png",
  sarahMiller: "/website/figma/56d9e68ccff12413f144bdf75269165f5e84005a.png",
  mikeTorres: "/website/figma/8f649ffb9509e27c1a5cfa2575f93e2a1f744127.png",
};

const TESTIMONIALS = [
  { quote: "Best passive income builder I've ever used. My AI handles 100+ questions daily.", name: "Alex Chen", role: "Fitness Coach", img: ASSETS.alexChen },
  { quote: "Scale your expertise without scaling your time. This is a game-changer for creators.", name: "Sarah Miller", role: "Nutrition Expert", img: ASSETS.sarahMiller },
  { quote: "My audience gets instant answers 24/7. I focus on creating, not answering DMs.", name: "Mike Torres", role: "Strength Coach", img: ASSETS.mikeTorres },
];

const STEPS = [
  { n: 1, title: "Connect Content", desc: "Upload your YouTube videos, PDFs, or notes. Your AI learns from your existing knowledge.", icon: "upload" as const },
  { n: 2, title: "Tweak It", desc: "Customize personality, topics, and speaking style. Make it sound exactly like you.", icon: "sliders" as const },
  { n: 3, title: "Ready to Launch", desc: "Share your AI with your audience. Start monetizing your expertise immediately.", icon: "rocket" as const },
];

const TRAIN_SOURCES = [
  { title: "YouTube", desc: "Import videos", icon: "play" as const },
  { title: "PDFs", desc: "Upload documents", icon: "document" as const },
  { title: "Notes", desc: "Add text content", icon: "pencil" as const },
];

const STEP_STROKE = { fill: "none" as const, stroke: "#ffffff", strokeWidth: 2.66667, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const TRAIN_STROKE = { fill: "none" as const, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function StepIcon({ kind }: { kind: "upload" | "sliders" | "rocket" }) {
  if (kind === "upload") return (<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden><path d="M28 20V25.3333C28 26.0406 27.719 26.7189 27.219 27.219C26.7189 27.719 26.0406 28 25.3333 28H6.66667C5.95942 28 5.28115 27.719 4.78105 27.219C4.28095 26.7189 4 26.0406 4 25.3333V20" {...STEP_STROKE} /><path d="M22.6667 10.6667L16 4L9.33333 10.6667" {...STEP_STROKE} /><path d="M16 4V20" {...STEP_STROKE} /></svg>);
  if (kind === "sliders") return (<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden><path d="M13.2493 20.6667C13.1303 20.2052 12.8898 19.7841 12.5528 19.4472C12.2159 19.1102 11.7948 18.8697 11.3333 18.7507L3.15333 16.6413C3.01377 16.6017 2.89094 16.5177 2.80348 16.4019C2.71602 16.2862 2.6687 16.1451 2.6687 16C2.6687 15.8549 2.71602 15.7138 2.80348 15.5981C2.89094 15.4823 3.01377 15.3983 3.15333 15.3587L11.3333 13.248C11.7946 13.1291 12.2156 12.8888 12.5525 12.5521C12.8895 12.2153 13.1301 11.7945 13.2493 11.3333L15.3587 3.15333C15.3979 3.01322 15.4818 2.88979 15.5978 2.80186C15.7137 2.71393 15.8552 2.66633 16.0007 2.66633C16.1462 2.66633 16.2877 2.71393 16.4036 2.80186C16.5195 2.88979 16.6035 3.01322 16.6427 3.15333L18.7507 11.3333C18.8697 11.7948 19.1102 12.2159 19.4472 12.5528C19.7841 12.8898 20.2052 13.1303 20.6667 13.2493L28.8467 15.3573C28.9873 15.3961 29.1114 15.48 29.1998 15.5961C29.2882 15.7122 29.3361 15.8541 29.3361 16C29.3361 16.1459 29.2882 16.2878 29.1998 16.4039C29.1114 16.52 28.9873 16.6039 28.8467 16.6427L20.6667 18.7507C20.2052 18.8697 19.7841 19.1102 19.4472 19.4472C19.1102 19.7841 18.8697 20.2052 18.7507 20.6667L16.6413 28.8467C16.6021 28.9868 16.5182 29.1102 16.4022 29.1981C16.2863 29.2861 16.1448 29.3337 15.9993 29.3337C15.8538 29.3337 15.7123 29.2861 15.5964 29.1981C15.4805 29.1102 15.3965 28.9868 15.3573 28.8467L13.2493 20.6667Z" {...STEP_STROKE} /><path d="M26.6667 4V9.33333" {...STEP_STROKE} /><path d="M29.3333 6.66667H24" {...STEP_STROKE} /><path d="M5.33333 22.6667V25.3333" {...STEP_STROKE} /><path d="M6.66667 24H4" {...STEP_STROKE} /></svg>);
  return (<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden><path d="M5.33333 18.6667C5.08102 18.6675 4.83364 18.5968 4.61994 18.4626C4.40623 18.3285 4.23498 18.1365 4.12607 17.9089C4.01715 17.6813 3.97506 17.4274 4.00467 17.1769C4.03427 16.9263 4.13437 16.6893 4.29333 16.4933L17.4933 2.89333C17.5923 2.77904 17.7273 2.70181 17.876 2.67431C18.0247 2.64681 18.1783 2.67068 18.3116 2.742C18.445 2.81333 18.5501 2.92786 18.6098 3.06681C18.6694 3.20576 18.6801 3.36086 18.64 3.50667L16.08 11.5333C16.0045 11.7354 15.9792 11.9527 16.0061 12.1667C16.0331 12.3807 16.1115 12.5849 16.2348 12.7619C16.358 12.9389 16.5224 13.0834 16.7137 13.1829C16.905 13.2824 17.1177 13.334 17.3333 13.3333H26.6667C26.919 13.3325 27.1664 13.4032 27.3801 13.5374C27.5938 13.6715 27.765 13.8635 27.8739 14.0911C27.9828 14.3187 28.0249 14.5726 27.9953 14.8231C27.9657 15.0737 27.8656 15.3107 27.7067 15.5067L14.5067 29.1067C14.4077 29.221 14.2727 29.2982 14.124 29.3257C13.9753 29.3532 13.8217 29.3293 13.6884 29.258C13.555 29.1867 13.4499 29.0721 13.3902 28.9332C13.3306 28.7942 13.3199 28.6391 13.36 28.4933L15.92 20.4667C15.9955 20.2646 16.0208 20.0473 15.9939 19.8333C15.9669 19.6193 15.8885 19.4151 15.7652 19.2381C15.642 19.0611 15.4776 18.9166 15.2863 18.8171C15.095 18.7176 14.8823 18.666 14.6667 18.6667H5.33333Z" {...STEP_STROKE} /></svg>);
}

function TrainIcon({ kind }: { kind: "play" | "document" | "pencil" }) {
  if (kind === "play") return (<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><path d="M16 13L21.223 16.482C21.2983 16.5321 21.3858 16.5608 21.4761 16.5652C21.5664 16.5695 21.6563 16.5492 21.736 16.5065C21.8157 16.4639 21.8824 16.4003 21.9289 16.3228C21.9754 16.2452 22 16.1564 22 16.066V7.87C22 7.78202 21.9768 7.6956 21.9328 7.61945C21.8887 7.5433 21.8253 7.48012 21.7491 7.4363C21.6728 7.39248 21.5863 7.36956 21.4983 7.36985C21.4103 7.37015 21.324 7.39366 21.248 7.438L16 10.5" {...TRAIN_STROKE} stroke="#FF0000" /><path d="M14 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H14C15.1046 18 16 17.1046 16 16V8C16 6.89543 15.1046 6 14 6Z" {...TRAIN_STROKE} stroke="#FF0000" /></svg>);
  if (kind === "document") return (<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><path d="M15 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7L15 2Z" {...TRAIN_STROKE} stroke="#EF4444" /><path d="M14 2V6C14 6.53043 14.2107 7.03914 14.5858 7.41421C14.9609 7.78929 15.4696 8 16 8H20" {...TRAIN_STROKE} stroke="#EF4444" /><path d="M10 9H8" {...TRAIN_STROKE} stroke="#EF4444" /><path d="M16 13H8" {...TRAIN_STROKE} stroke="#EF4444" /><path d="M16 17H8" {...TRAIN_STROKE} stroke="#EF4444" /></svg>);
  return (<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><path d="M12 7V21" {...TRAIN_STROKE} stroke="#EF4444" /><path d="M3 18C2.73478 18 2.48043 17.8946 2.29289 17.7071C2.10536 17.5196 2 17.2652 2 17V4C2 3.73478 2.10536 3.48043 2.29289 3.29289C2.48043 3.10536 2.73478 3 3 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7C12 5.93913 12.4214 4.92172 13.1716 4.17157C13.9217 3.42143 14.9391 3 16 3H21C21.2652 3 21.5196 3.10536 21.7071 3.29289C21.8946 3.48043 22 3.73478 22 4V17C22 17.2652 21.8946 17.5196 21.7071 17.7071C21.5196 17.8946 21.2652 18 21 18H15C14.2044 18 13.4413 18.3161 12.8787 18.8787C12.3161 19.4413 12 20.2044 12 21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H3Z" {...TRAIN_STROKE} stroke="#EF4444" /></svg>);
}

function PlusIcon() {
  return (<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden><path d="M15.75 11.25V14.25C15.75 14.6478 15.592 15.0294 15.3107 15.3107C15.0294 15.592 14.6478 15.75 14.25 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V11.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12.75 6L9 2.25L5.25 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 2.25V11.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}

function InstagramIcon() {
  return (<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z" fill="none" stroke="#E4405F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61992 14.1902 8.22773 13.4229 8.09407 12.5922C7.9604 11.7616 8.09207 10.9099 8.47033 10.1584C8.84859 9.40685 9.45419 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87659 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z" fill="none" stroke="#E4405F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M17.5 6.5H17.51" fill="none" stroke="#E4405F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}

function ShareIcon() {
  return (<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden><path d="M15 6.66667C16.3807 6.66667 17.5 5.54738 17.5 4.16667C17.5 2.78595 16.3807 1.66667 15 1.66667C13.6193 1.66667 12.5 2.78595 12.5 4.16667C12.5 5.54738 13.6193 6.66667 15 6.66667Z" fill="none" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 12.5C6.38071 12.5 7.5 11.3807 7.5 10C7.5 8.61929 6.38071 7.5 5 7.5C3.61929 7.5 2.5 8.61929 2.5 10C2.5 11.3807 3.61929 12.5 5 12.5Z" fill="none" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 18.3333C16.3807 18.3333 17.5 17.214 17.5 15.8333C17.5 14.4526 16.3807 13.3333 15 13.3333C13.6193 13.3333 12.5 14.4526 12.5 15.8333C12.5 17.214 13.6193 18.3333 15 18.3333Z" fill="none" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.15833 11.2583L12.85 14.575" fill="none" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" /><path d="M12.8417 5.425L7.15833 8.74167" fill="none" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}

export default function WebsiteCreateAI() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleCreateAI = async (prefillData?: { name?: string; expertise?: string; about?: string; topics?: string; faqs?: string[] }) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role === 'CREATOR') {
      navigate('/creator-dashboard/settings');
      return;
    }
    // Fan → become creator and go straight to onboarding
    try {
      const res = await authApi.becomeCreator({
        about: prefillData?.about,
        expertise: prefillData?.expertise,
        topics: prefillData?.topics,
      });
      const data = res.data.data;
      if (data.token) localStorage.setItem('token', data.token);
      dispatch(updateUser({ ...data.user, role: 'CREATOR' }));
      // Store prefill for onboarding
      if (prefillData) sessionStorage.setItem('creatorPrefill', JSON.stringify(prefillData));
      // Small delay to ensure token is saved before navigation
      setTimeout(() => navigate('/onboarding/creator'), 100);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      logger.error('Become creator failed:', e?.response?.data);
      // If already a creator, just go to onboarding
      if (e?.response?.data?.error?.message?.includes('Already')) {
        if (prefillData) sessionStorage.setItem('creatorPrefill', JSON.stringify(prefillData));
        navigate('/onboarding/creator');
      } else {
        navigate('/login');
      }
    }
  };

  return (
    <div className={styles.page}>
      {/* HERO BANNER */}
      <section className={styles.hero}>
        <div className={`${styles.blob} ${styles.blobA}`} aria-hidden />
        <div className={`${styles.blob} ${styles.blobB}`} aria-hidden />
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Create Your<br /><span className={styles.heroTitleAccent}>Creator Pal</span></h1>
          <p className={styles.heroSub}>Turn your knowledge into an AI that answers questions, helps your audience, and sells your programs — on autopilot.</p>
          <div className={styles.heroCtas}>
            <button type="button" className={styles.heroPrimary} onClick={() => handleCreateAI()}>Create My AI</button>
          </div>
          <p className={styles.heroDisclaimer}>Free till 31st May · No credit card required · Launch in minutes</p>
        </div>
      </section>

      {/* TESTIMONIALS ROW */}
      <section className={styles.testimonials}>
        <h2 className={styles.sectionTitle}>Testimonials</h2>
        <div className={styles.testimonialRow}>
          {TESTIMONIALS.map((t) => (
            <article key={t.name} className={styles.testimonialCard}>
              <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
              <div className={styles.testimonialMeta}>
                <div className={styles.testimonialAvatar}>
                  <img src={t.img} alt={t.name} className={styles.testimonialImg} />
                </div>
                <div>
                  <p className={styles.testimonialName}>{t.name}</p>
                  <p className={styles.testimonialRole}>{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.howSection}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <p className={styles.sectionSub}>Launch your AI in minutes, not months</p>
        <div className={styles.stepRow}>
          {STEPS.map((s) => (
            <div key={s.n} className={styles.step}>
              <div className={styles.stepIconWrap}>
                <StepIcon kind={s.icon} />
              </div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRAIN YOUR AI */}
      <section className={styles.trainSection}>
        <h2 className={styles.sectionTitle}>Train Your AI</h2>
        <p className={styles.sectionSub}>Add your existing content to teach your AI</p>
        <div className={styles.trainRow}>
          {TRAIN_SOURCES.map((t) => (
            <button key={t.title} type="button" className={styles.trainCard}>
              <div className={styles.trainIconWrap}><TrainIcon kind={t.icon} /></div>
              <p className={styles.trainTitle}>{t.title}</p>
              <p className={styles.trainDesc}>{t.desc}</p>
            </button>
          ))}
        </div>
        <button type="button" className={styles.addContentBtn} onClick={() => handleCreateAI()}><PlusIcon /> Add Content</button>
      </section>

      {/* CUSTOMIZE AI */}
      <section className={styles.customizeSection}>
        <h2 className={styles.sectionTitle}>Customize your profile</h2>
        <p className={styles.sectionSub}>Set up how your AI looks and sounds</p>
        <CustomizeForm onAction={handleCreateAI} />
      </section>

      {/* YOUR CREATORPAL IS LIVE */}
      <section className={styles.liveSection}>
        <h2 className={styles.sectionTitle}>Your CreatorPal is Live</h2>
        <p className={styles.sectionSub}>Your fitness expertise is now available 24/7</p>
        <div className={styles.shareCard}>
          <div className={styles.shareHeader}><InstagramIcon /><span>Share on Instagram</span></div>
          <div className={styles.shareBody}>
            <p>Got fitness questions? My AI is here to help!</p>
            <p>Ask me anything about strength training, nutrition, recovery, and more — available 24/7.</p>
          </div>
        </div>
        <button type="button" className={styles.shareBtn} onClick={() => handleCreateAI()}><ShareIcon /> Share Your CreatorPal</button>
        <p className={styles.liveFootnote}>Fans can now ask your AI anything about strength training, nutrition, and recovery.</p>
      </section>
    </div>
  );
}
