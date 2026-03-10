import AlgoPill from '../shared/AlgoPill';
import { FadeIn } from '../shared';
import styles from './ComparisonTable.module.css';

const rows = [
  { label: 'Input Space', nld: 'Discrete (grid cells)', scasim: 'Continuous (coordinates)', mm: 'Continuous (coordinates)' },
  { label: 'Alignment', nld: 'Levenshtein (edit distance)', scasim: 'Needleman-Wunsch', mm: 'Temporal alignment' },
  { label: 'Output', nld: 'Single score (0–1)', scasim: 'Single distance', mm: 'Five scores (0–1)' },
  { label: 'Duration Info', nld: '❌ Lost', scasim: '❌ Not used', mm: '✅ Included' },
  { label: 'Spatial Precision', nld: 'Low (grid-dependent)', scasim: 'High', mm: 'High' },
  { label: 'Key Parameter', nld: 'Grid size', scasim: 'Gap penalty', mm: 'Simplification threshold' },
];

export default function ComparisonTable() {
  return (
    <section className={styles.section} id="comparison-section">
      <div className={styles.container}>
        <h2>Side-by-Side Comparison</h2>
        <p>Here's a quick reference of how these three algorithms stack up:</p>

        <FadeIn>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th></th>
                  <th><AlgoPill type="nld" size="small">NLD</AlgoPill></th>
                  <th><AlgoPill type="scasim" size="small">ScaSim</AlgoPill></th>
                  <th><AlgoPill type="multimatch" size="small">MultiMatch</AlgoPill></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.label}>
                    <td><strong>{row.label}</strong></td>
                    <td>{row.nld}</td>
                    <td>{row.scasim}</td>
                    <td>{row.mm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
