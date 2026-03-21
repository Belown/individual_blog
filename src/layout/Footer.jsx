export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div className="container" style={{ textAlign: 'center', padding: '40px 24px 36px' }}>
        <p style={{
          color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 6px',
          fontFamily: "'Inter', sans-serif", fontWeight: 500,
        }}>
          EyeTrack Explorer — An Interactive Explorable Explanation
        </p>
        <p style={{
          color: 'var(--text-light)', fontSize: '0.75rem', margin: 0,
          fontFamily: "'Inter', sans-serif",
        }}>
          Built for DIET · ETH Zürich · 2026
        </p>
      </div>
    </footer>
  );
}

const footerStyle = {
  borderTop: '1px solid var(--border)',
  background: 'var(--bg-secondary)',
};
