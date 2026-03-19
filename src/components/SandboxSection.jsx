import { useState } from 'react';

export default function SandboxSection() {
  const [activeTab, setActiveTab] = useState('coming');

  return (
    <section id="sandbox" className="section" style={{ background: 'var(--bg-secondary)', minHeight: '70vh' }}>
      <div className="container-wide">
        <div className="section-header">
          <span className="badge badge-green">Experiment</span>
          <h2>🧪 Interactive Sandbox</h2>
          <p className="section-subtitle">
            Apply what you&apos;ve learned. This is your laboratory for experimenting with
            eye-tracking principles in a hands-on environment.
          </p>
        </div>

        <div style={s.tabs}>
          {[
            { id: 'coming', label: '🚧 Coming Soon' },
            { id: 'ideas', label: '💡 Planned Features' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...s.tab,
                ...(activeTab === tab.id ? s.tabActive : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'coming' && (
          <div style={s.placeholder}>
            <div style={s.placeholderInner}>
              <div style={{ fontSize: '3rem', marginBottom: 14 }}>🧪</div>
              <h3 style={{ marginBottom: 10 }}>Sandbox Under Construction</h3>
              <p style={{ maxWidth: 480, textAlign: 'center', marginBottom: 28 }}>
                This section will house a full interactive sandbox where you can manipulate
                a webpage layout and observe real-time changes to the simulated scanpath
                and heatmap.
              </p>
              <div style={s.previewGrid}>
                <div style={s.previewCard}>
                  <span style={{ fontSize: '1.2rem' }}>🎛️</span>
                  <strong>Design Controls</strong>
                  <span style={s.previewDesc}>Sliders, color pickers, drag-and-drop</span>
                </div>
                <div style={s.previewCard}>
                  <span style={{ fontSize: '1.2rem' }}>📍</span>
                  <strong>Live Scanpath</strong>
                  <span style={s.previewDesc}>Real-time simulated eye movement</span>
                </div>
                <div style={s.previewCard}>
                  <span style={{ fontSize: '1.2rem' }}>🔥</span>
                  <strong>Heatmap</strong>
                  <span style={s.previewDesc}>Attention density overlay</span>
                </div>
                <div style={s.previewCard}>
                  <span style={{ fontSize: '1.2rem' }}>⇄</span>
                  <strong>Comparison</strong>
                  <span style={s.previewDesc}>Side-by-side before/after</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ideas' && (
          <div style={s.ideasContainer}>
            <div className="card">
              <h4>🎮 Webpage Layout Editor</h4>
              <p style={{ margin: 0, fontSize: '0.92rem' }}>
                A visual editor where you can modify a sample landing page: change headline
                font sizes, reposition images, adjust CTA button colors and placement,
                and add/remove distractor elements.
              </p>
            </div>
            <div className="card">
              <h4>📊 Real-Time Feedback</h4>
              <p style={{ margin: 0, fontSize: '0.92rem' }}>
                Every change instantly updates a simulated scanpath and fixation
                heatmap. See exactly how your design decisions influence where a user would look.
              </p>
            </div>
            <div className="card">
              <h4>⇄ A/B Comparison</h4>
              <p style={{ margin: 0, fontSize: '0.92rem' }}>
                Toggle between your modified design and the original to see side-by-side
                scanpath and heatmap differences.
              </p>
            </div>
            <div className="card">
              <h4>🏆 Optimization Challenge</h4>
              <p style={{ margin: 0, fontSize: '0.92rem' }}>
                Given a &quot;poorly designed&quot; page, optimize it so that
                a visitor sees the contact form within the first two fixations.
              </p>
            </div>
            <div className="card">
              <h4>📷 WebGazer Integration</h4>
              <p style={{ margin: 0, fontSize: '0.92rem' }}>
                Optional webcam-based eye tracking using WebGazer.js — see your
                own real gaze data overlaid on the page.
              </p>
            </div>
          </div>
        )}

        {/* Mockup teaser */}
        <div style={s.teaserBox}>
          <div style={s.teaserMockup}>
            <div style={s.mockLeft}>
              <div style={s.mockSlider}><div style={s.mockSliderLabel}>Headline Size</div><div style={s.mockSliderTrack}><div style={s.mockSliderThumb} /></div></div>
              <div style={s.mockSlider}><div style={s.mockSliderLabel}>Image Position</div><div style={s.mockSliderTrack}><div style={{ ...s.mockSliderThumb, left: '60%' }} /></div></div>
              <div style={s.mockSlider}><div style={s.mockSliderLabel}>CTA Color</div><div style={s.mockColorRow}>
                {['#1a8a6a', '#d4553a', '#c4960c', '#6b5ca5'].map(c => (
                  <div key={c} style={{ ...s.mockColorDot, background: c }} />
                ))}
              </div></div>
              <div style={s.mockSlider}><div style={s.mockSliderLabel}>Distractor Level</div><div style={s.mockSliderTrack}><div style={{ ...s.mockSliderThumb, left: '20%' }} /></div></div>
            </div>
            <div style={s.mockRight}>
              <div style={s.mockPage}>
                <div style={{ background: '#e0dcd5', height: 10, width: '60%', borderRadius: 3, marginBottom: 8 }} />
                <div style={{ background: '#e0dcd5', height: 5, width: '80%', borderRadius: 2, marginBottom: 4 }} />
                <div style={{ background: '#e0dcd5', height: 5, width: '65%', borderRadius: 2, marginBottom: 12 }} />
                <div style={{ background: '#f0ede8', height: 45, width: '42%', borderRadius: 4, float: 'right', marginLeft: 8 }} />
                <div style={{ background: '#e0dcd5', height: 5, width: '50%', borderRadius: 2, marginBottom: 4 }} />
                <div style={{ background: '#e0dcd5', height: 5, width: '45%', borderRadius: 2, marginBottom: 12 }} />
                <div style={{ background: '#1a8a6a', height: 12, width: '28%', borderRadius: 4, clear: 'both' }} />
              </div>
              <svg style={s.mockSvg} viewBox="0 0 200 130">
                <line x1="30" y1="18" x2="120" y2="14" stroke="rgba(107,92,165,0.4)" strokeWidth="1" />
                <line x1="120" y1="14" x2="155" y2="48" stroke="rgba(107,92,165,0.4)" strokeWidth="1" />
                <line x1="155" y1="48" x2="50" y2="55" stroke="rgba(107,92,165,0.4)" strokeWidth="1" />
                <line x1="50" y1="55" x2="55" y2="100" stroke="rgba(107,92,165,0.4)" strokeWidth="1" />
                <circle cx="30" cy="18" r="5" fill="rgba(26,138,106,0.75)" />
                <circle cx="120" cy="14" r="4.5" fill="rgba(26,138,106,0.75)" />
                <circle cx="155" cy="48" r="6" fill="rgba(26,138,106,0.75)" />
                <circle cx="50" cy="55" r="4" fill="rgba(26,138,106,0.75)" />
                <circle cx="55" cy="100" r="5.5" fill="rgba(26,138,106,0.75)" />
                <text x="30" y="21" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="Inter, sans-serif">1</text>
                <text x="120" y="17" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="Inter, sans-serif">2</text>
                <text x="155" y="51" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="Inter, sans-serif">3</text>
                <text x="50" y="58" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="Inter, sans-serif">4</text>
                <text x="55" y="103" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="Inter, sans-serif">5</text>
              </svg>
            </div>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 14, fontFamily: "'Inter', sans-serif" }}>
            ↑ Preview mockup of the planned sandbox interface
          </p>
        </div>
      </div>
    </section>
  );
}

const s = {
  tabs: {
    display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32,
  },
  tab: {
    padding: '10px 22px', border: '1px solid var(--border)', borderRadius: 8,
    background: 'var(--bg-card)', color: 'var(--text-secondary)',
    fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all 200ms ease',
  },
  tabActive: {
    borderColor: 'var(--accent)', color: 'var(--accent)',
    background: 'var(--accent-light)',
  },

  placeholder: { display: 'flex', justifyContent: 'center' },
  placeholderInner: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '36px 24px', maxWidth: 600,
  },
  previewGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%',
  },
  previewCard: {
    display: 'flex', flexDirection: 'column', gap: 3,
    padding: '14px 16px', background: 'var(--bg-card)',
    border: '1px solid var(--border)', borderRadius: 10,
    fontFamily: "'Inter', sans-serif", fontSize: '0.85rem',
  },
  previewDesc: { fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 },

  ideasContainer: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 14, maxWidth: 860, margin: '0 auto',
  },

  teaserBox: {
    marginTop: 40, padding: '28px',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 14, maxWidth: 640, margin: '40px auto 0',
  },
  teaserMockup: {
    display: 'grid', gridTemplateColumns: '180px 1fr', gap: 20,
  },
  mockLeft: { display: 'flex', flexDirection: 'column', gap: 14 },
  mockSlider: { display: 'flex', flexDirection: 'column', gap: 5 },
  mockSliderLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600,
  },
  mockSliderTrack: {
    position: 'relative', height: 3, background: 'var(--bg-surface)',
    borderRadius: 2,
  },
  mockSliderThumb: {
    position: 'absolute', top: -4,  left: '40%',
    width: 10, height: 10, borderRadius: '50%',
    background: 'var(--accent)', boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  },
  mockColorRow: { display: 'flex', gap: 5 },
  mockColorDot: { width: 14, height: 14, borderRadius: 3 },
  mockRight: { position: 'relative' },
  mockPage: {
    padding: 14, background: '#fafaf8', borderRadius: 8,
    border: '1px solid var(--border)', minHeight: 120, overflow: 'hidden',
  },
  mockSvg: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    pointerEvents: 'none',
  },
};
