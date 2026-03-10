import AlgoPill from '../shared/AlgoPill';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>An Interactive Explainer</p>
        <h1 className={styles.title}>Seeing Similarity</h1>
        <p className={styles.subtitle}>
          How do we measure whether two people looked at the same thing in the same way?
          This guide gives you an intuitive, hands-on understanding of three scanpath
          comparison algorithms used in eye-tracking research.
        </p>
        <div className={styles.algorithms}>
          <AlgoPill type="nld">NLD</AlgoPill>
          <AlgoPill type="scasim">ScaSim</AlgoPill>
          <AlgoPill type="multimatch">MultiMatch</AlgoPill>
        </div>
        <div className={styles.scrollHint}>
          <span>Scroll to explore</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </header>
  );
}
