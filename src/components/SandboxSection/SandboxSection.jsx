import './SandboxSection.css';
import ScanpathChallenge from '../ScanpathChallenge/ScanpathChallenge';

export default function SandboxSection() {
  return (
    <section id="sandbox" className="section" style={{ background: 'var(--bg-secondary)', paddingBottom: '20px' }}>
      <div className="container-wide">
        <div className="section-header">
          <span className="badge badge-green">Sandbox</span>
          <h2>🧪 Interactive Sandbox</h2>
          <p className="section-subtitle">
            Apply what you&apos;ve learned. Tweak the design controls and see how
            the simulated scanpath responds — then try to hit a perfect similarity score.
          </p>
        </div>
        <ScanpathChallenge />
      </div>
    </section>
  );
}
