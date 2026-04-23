import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import styles from '../WebsiteHome.module.css';
import { CREATORS, type Creator as LegacyCreator } from "../data/creators-data";
import { getBackendIdForSlug } from "../data/config";
import { getImageUrl } from "../../../services/api";

export { CREATORS };
export type { LegacyCreator as Creator };

// API-driven creator shape (matches /home/featured response)
export interface ApiCreator {
  id: string;
  displayName: string;
  category?: string | null;
  tagline?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  tags?: string[];
  suggestedQuestions?: string[];
  totalChats?: number;
}

function formatChats(total?: number): string {
  if (!total || total < 10) return '';
  if (total >= 1000) return `${Math.floor(total / 1000)}K+ Chats`;
  const rounded = Math.floor(total / 100) * 100;
  if (rounded >= 100) return `${rounded}+ Chats`;
  const roundedTen = Math.floor(total / 10) * 10;
  return `${roundedTen}+ Chats`;
}

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 20 20" width="22" height="22" aria-label="verified" className={styles.verified}>
      <path d="M10 0l2.47 1.79 3.05-.14.58 3L18.21 7l-1.32 2.74.84 2.94-2.69 1.44L14.4 17l-3-.65L9 18.5 6.6 16.35l-3 .65-.64-2.88L.27 12.68 1.11 9.74-.21 7l2.11-2.35.58-3 3.05.14L8 0z" transform="translate(1 1)" fill="#1d9bf0" />
      <path d="M6 10l3 3 5-6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Convert an ApiCreator to the shape the legacy modal expects.
function adaptApiCreator(api: ApiCreator): LegacyCreator {
  const slug = api.id; // use DB id (getBackendIdForSlug handles both)
  const img = api.profileImage ? getImageUrl(api.profileImage) : '';
  return {
    id: slug,
    name: api.displayName,
    title: api.tagline || api.category || 'Creator',
    chats: formatChats(api.totalChats),
    about: api.bio || '',
    tags: api.tags || [],
    questions: api.suggestedQuestions || [],
    cardImg: img,
    modalImg: img,
  };
}

function CreatorModal({ creator, onClose }: { creator: LegacyCreator; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby={`creator-modal-${creator.id}-name`} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className={styles.modalPhoto}>
          {creator.modalImg ? (
            <img src={creator.modalImg} alt={creator.name} className={styles.modalPhotoImg} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: '#ffb4b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ff3e48', fontSize: 160, fontWeight: 700,
            }}>
              {creator.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        <div className={styles.modalBody}>
          <h3 id={`creator-modal-${creator.id}-name`} className={styles.modalName}>
            {creator.name}
            <VerifiedBadge />
          </h3>
          {creator.title && <p className={styles.modalTitle}>{creator.title}</p>}
          {creator.chats && <p className={styles.modalChats}>{creator.chats}</p>}

          {creator.about && (
            <>
              <h4 className={styles.modalHeading}>About</h4>
              <p className={styles.modalAbout}>{creator.about}</p>
            </>
          )}

          {creator.tags.length > 0 && (
            <>
              <h4 className={styles.modalHeading}>Topics</h4>
              <p className={styles.modalTags}>
                {creator.tags.map((t, i) => (
                  <span key={t}>
                    {t}
                    {i < creator.tags.length - 1 && (
                      <span className={styles.modalTagSep} aria-hidden>{" | "}</span>
                    )}
                  </span>
                ))}
              </p>
            </>
          )}

          {creator.questions.length > 0 && (
            <>
              <h4 className={styles.modalHeading}>Frequently Asked Questions (FAQ)</h4>
              <div className={styles.modalQuestions}>
                {creator.questions.map((q) => (
                  <span key={q} className={styles.modalQuestion}>{q}</span>
                ))}
              </div>
            </>
          )}

          <div className={styles.modalInputRow}>
            <input type="text" placeholder="Ask Anything" className={styles.modalInput} readOnly />
            <Link to={`/website-chat/${getBackendIdForSlug(creator.id) || creator.id}`} className={styles.modalAskBtn}>
              Start Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  /** API-driven creators (preferred). Falls back to hardcoded CREATORS if not provided. */
  creators?: ApiCreator[];
}

export function CreatorsGrid({ creators }: Props = {}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Use API data when provided, otherwise fall back to hardcoded
  const list: LegacyCreator[] = creators && creators.length > 0
    ? creators.map(adaptApiCreator)
    : CREATORS;

  const active = list.find((c) => c.id === activeId) ?? null;

  return (
    <>
      <section className={styles.expertCards}>
        {list.map((c) => (
          <button key={c.id} type="button" className={styles.expertCard} onClick={() => setActiveId(c.id)} aria-label={`View ${c.name}`}>
            {c.cardImg ? (
              <img src={c.cardImg} alt={c.name} className={styles.expertPhoto} />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: '#ffb4b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ff3e48', fontSize: 140, fontWeight: 700,
              }}>
                {c.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </button>
        ))}
      </section>
      {active && <CreatorModal creator={active} onClose={() => setActiveId(null)} />}
    </>
  );
}
