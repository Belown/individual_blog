export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div className="container" style={{ textAlign: 'center', padding: '36px 24px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0, fontFamily: "'Inter', sans-serif" }}>
          EyeTrack Explorer — An Interactive Explorable Explanation
          <br />
          Built for DIET · ETH Zürich · 2026
        </p>
      </div>
    </footer>
  );
}

const footerStyle = {
  borderTop: '1px solid var(--border)',
  background: 'var(--bg-primary)',
};
