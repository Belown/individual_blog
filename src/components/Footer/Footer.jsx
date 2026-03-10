import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        <p>Built as an interactive explainer for the <strong>DIET</strong> course at ETH Zürich.</p>
        <p className={styles.note}>
          Algorithms based on: Levenshtein (1966), von der Malsburg &amp; Vasishth (2011) — ScaSim,
          Dewhurst et al. (2012) — MultiMatch.
        </p>
      </div>
    </footer>
  );
}
