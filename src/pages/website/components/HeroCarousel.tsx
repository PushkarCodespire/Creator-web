import { CREATORS } from "../data/creators-data";
import styles from "../WebsiteCreateAI.module.css";

export function HeroCarousel() {
  return (
    <div className={styles.carousel} aria-label="Featured creators">
      <div className={styles.carouselTrack}>
        {CREATORS.map((c) => (
          <CarouselCard key={`a-${c.id}`} creator={c} />
        ))}
        {CREATORS.map((c) => (
          <CarouselCard key={`b-${c.id}`} creator={c} ariaHidden />
        ))}
      </div>
    </div>
  );
}

function CarouselCard({
  creator,
  ariaHidden,
}: {
  creator: (typeof CREATORS)[number];
  ariaHidden?: boolean;
}) {
  return (
    <div className={styles.carouselCard} aria-hidden={ariaHidden ? "true" : undefined}>
      <div className={styles.carouselCardPhoto}>
        <img src={creator.modalImg} alt={creator.name} className={styles.carouselCardImg} />
      </div>
      <div className={styles.carouselCardText}>
        <p className={styles.carouselCardName}>{creator.name}</p>
        <p className={styles.carouselCardTitle}>{creator.title}</p>
      </div>
    </div>
  );
}
