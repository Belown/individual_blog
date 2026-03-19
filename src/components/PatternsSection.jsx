import { useState, useEffect, useRef, useCallback } from 'react';

/* ── Pattern Demo Canvas ───────────────────────────────────────── */
function PatternCanvas({ pattern, label }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const animRef = useRef(null);

  const patterns = {
    'f-pattern': [
      { x: 40, y: 35 }, { x: 220, y: 35 }, { x: 390, y: 35 }, 
      { x: 40, y: 85 }, { x: 220, y: 85 }, { x: 390, y: 85 },
      { x: 40, y: 135 }, { x: 40, y: 185 }, { x: 40, y: 235 },
    ],
    'z-pattern': [
      { x: 50, y: 45 }, { x: 370, y: 45 },
      { x: 210, y: 145 },
      { x: 50, y: 240 }, { x: 370, y: 240 },
    ],
    'gutenberg': [
      { x: 60, y: 50 }, { x: 350, y: 55 },
      { x: 150, y: 145 }, { x: 260, y: 150 },
      { x: 60, y: 240 }, { x: 350, y: 240 },
    ],
    'layer-cake': [
      { x: 40, y: 23 }, { x: 160, y: 23 }, 
      { x: 40, y: 93 }, { x: 190, y: 93 }, { x: 320, y: 93 },
      { x: 40, y: 163 }, { x: 170, y: 163 }, { x: 295, y: 163 },
      { x: 40, y: 233 }, { x: 210, y: 233 },
    ],
  };

  const pts = patterns[pattern] || patterns['f-pattern'];

  // Draw different backgrounds per pattern type
  const drawBackground = (ctx, w, h) => {
    ctx.fillStyle = '#fafaf8';
    ctx.fillRect(0, 0, w, h);

    if (pattern === 'f-pattern') {
      // Text-heavy page: many lines of text
      ctx.fillStyle = '#e8e4dd';
      for (let row = 0; row < 5; row++) {
        const y0 = 20 + row * 52;
        const numLines = 3;
        for (let i = 0; i < numLines; i++) {
          const lw = (w - 60) * (0.5 + Math.abs(Math.sin(row * 3 + i * 1.7)) * 0.5);
          ctx.fillRect(30, y0 + i * 14, lw, 5);
        }
      }
    } else if (pattern === 'z-pattern') {
      // Visual landing page: logo top-left, nav top-right, hero center, CTA bottom-right
      // Top bar
      ctx.fillStyle = '#e8e4dd';
      ctx.fillRect(30, 35, 60, 18); // logo
      ctx.fillRect(355, 37, 30, 15); // login button

      // Central hero area
      const hx = 110, hy = 70, hw = 220, hh = 140;
      ctx.fillStyle = '#f0ede8';
      ctx.fillRect(hx, hy, hw, hh);
      ctx.strokeStyle = '#ddd8d0'; ctx.lineWidth = 1;
      ctx.strokeRect(hx, hy, hw, hh);

      // Mountain + sun inside hero (relative to hero box)
      ctx.fillStyle = '#ddd8d0';
      ctx.beginPath();
      ctx.moveTo(hx, hy + hh);
      ctx.lineTo(hx + hw * 0.25, hy + hh * 0.35);
      ctx.lineTo(hx + hw * 0.42, hy + hh * 0.65);
      ctx.lineTo(hx + hw * 0.65, hy + hh * 0.2);
      ctx.lineTo(hx + hw, hy + hh);
      ctx.closePath();
      ctx.fill();
      // Sun
      ctx.beginPath();
      ctx.arc(hx + hw * 0.82, hy + hh * 0.25, 10, 0, Math.PI * 2);
      ctx.fill();

      // Bottom area: tagline left, CTA right
      ctx.fillStyle = '#e8e4dd';
      ctx.fillRect(30, 225, 130, 8);
      ctx.fillRect(30, 240, 100, 8);

      // CTA button
      ctx.fillStyle = '#1a59ce';
      const bx = 340, by = 225, bw = 60, bh = 28, br = 5;
      ctx.beginPath();
      ctx.moveTo(bx+br,by); ctx.lineTo(bx+bw-br,by); ctx.quadraticCurveTo(bx+bw,by,bx+bw,by+br);
      ctx.lineTo(bx+bw,by+bh-br); ctx.quadraticCurveTo(bx+bw,by+bh,bx+bw-br,by+bh);
      ctx.lineTo(bx+br,by+bh); ctx.quadraticCurveTo(bx,by+bh,bx,by+bh-br);
      ctx.lineTo(bx,by+br); ctx.quadraticCurveTo(bx,by,bx+br,by);
      ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = "bold 8px 'Inter', sans-serif";
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Sign Up', bx+bw/2, by+bh/2);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    } else if (pattern === 'gutenberg') {
      const pad = 20, gap = 10;
      const qw = (w - pad * 2 - gap) / 2;
      const qh = (h - pad * 2 - gap) / 2;
      const x1 = pad, x2 = pad + qw + gap;
      const y1 = pad, y2 = pad + qh + gap;

      // Quadrant fills — colour = attention level
      // Primary (top-left): high attention → warm teal tint
      ctx.fillStyle = 'rgba(26,138,106,0.18)';
      ctx.fillRect(x1, y1, qw, qh);
      // Strong Fallow (top-right): medium-low → muted gold
      ctx.fillStyle = 'rgba(196,150,12,0.12)';
      ctx.fillRect(x2, y1, qw, qh);
      // Weak Fallow (bottom-left): low → muted warm
      ctx.fillStyle = 'rgba(196,150,12,0.08)';
      ctx.fillRect(x1, y2, qw, qh);
      // Terminal (bottom-right): high attention → warm teal tint (slightly less than primary)
      ctx.fillStyle = 'rgba(26,138,106,0.13)';
      ctx.fillRect(x2, y2, qw, qh);

      // Quadrant borders
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x1, y1, qw, qh);
      ctx.strokeRect(x2, y1, qw, qh);
      ctx.strokeRect(x1, y2, qw, qh);
      ctx.strokeRect(x2, y2, qw, qh);

      // Labels
      ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#3a6b5a';
      ctx.fillText('① Primary', x1 + qw / 2, y1 + qh / 2 - 8);
      ctx.fillStyle = '#555';
      ctx.font = "10px 'Inter', sans-serif";
      ctx.fillText('High attention', x1 + qw / 2, y1 + qh / 2 + 8);

      ctx.fillStyle = '#7a6820'; ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.fillText('Strong Fallow', x2 + qw / 2, y1 + qh / 2 - 8);
      ctx.fillStyle = '#888'; ctx.font = "10px 'Inter', sans-serif";
      ctx.fillText('Low attention', x2 + qw / 2, y1 + qh / 2 + 8);

      ctx.fillStyle = '#7a6820'; ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.fillText('Weak Fallow', x1 + qw / 2, y2 + qh / 2 - 8);
      ctx.fillStyle = '#888'; ctx.font = "10px 'Inter', sans-serif";
      ctx.fillText('Lowest attention', x1 + qw / 2, y2 + qh / 2 + 8);

      ctx.fillStyle = '#3a6b5a'; ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.fillText('④ Terminal', x2 + qw / 2, y2 + qh / 2 - 8);
      ctx.fillStyle = '#555'; ctx.font = "10px 'Inter', sans-serif";
      ctx.fillText('High attention', x2 + qw / 2, y2 + qh / 2 + 8);

      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    } else if (pattern === 'layer-cake') {
      // Headings with body text blocks
      const headingColor = '#d0ccc5';
      const bodyColor = '#e8e4dd';
      for (let i = 0; i < 4; i++) {
        const y0 = 18 + i * 70;
        // Heading bar
        ctx.fillStyle = headingColor;
        const hw = (w - 60) * (0.4 + Math.abs(Math.sin(i * 2)) * 0.5);
        ctx.fillRect(30, y0, hw, 8);
        // Body lines (lighter, to show they're skipped)
        ctx.fillStyle = bodyColor;
        for (let j = 0; j < 3; j++) {
          const lw = (w - 60) * (0.5 + Math.abs(Math.sin(i * 3 + j * 2)) * 0.4);
          ctx.fillRect(30, y0 + 16 + j * 12, lw, 4);
        }
      }
    }
  };

  const drawGutenbergArrow = useCallback((ctx, w, h, progress) => {
    // Draw "reading gravity" diagonal arrow from Primary (top-left) to Terminal (bottom-right)
    const pad = 20, gap = 10;
    const qw = (w - pad * 2 - gap) / 2;
    const qh = (h - pad * 2 - gap) / 2;
    const fromX = pad + qw * 0.5;
    const fromY = pad + qh * 0.5;
    const toX = pad + qw + gap + qw * 0.5;
    const toY = pad + qh + gap + qh * 0.5;
    const curX = fromX + (toX - fromX) * progress;
    const curY = fromY + (toY - fromY) * progress;

    ctx.save();
    ctx.strokeStyle = 'rgba(107,92,165,0.75)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(curX, curY); ctx.stroke();
    ctx.setLineDash([]);

    if (progress > 0.05) {
      const angle = Math.atan2(curY - fromY, curX - fromX);
      ctx.fillStyle = 'rgba(107,92,165,0.85)';
      ctx.beginPath();
      ctx.moveTo(curX, curY);
      ctx.lineTo(curX - 10 * Math.cos(angle - 0.4), curY - 10 * Math.sin(angle - 0.4));
      ctx.lineTo(curX - 10 * Math.cos(angle + 0.4), curY - 10 * Math.sin(angle + 0.4));
      ctx.fill();
    }

    // "Reading Gravity" label at midpoint when nearly done
    if (progress > 0.6) {
      const mx = fromX + (toX - fromX) * 0.5 - 14;
      const my = fromY + (toY - fromY) * 0.5 - 12;
      ctx.fillStyle = 'rgba(107,92,165,0.9)';
      ctx.font = "bold 10px 'Inter', sans-serif";
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Reading Gravity', mx + 14, my);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }
    ctx.restore();
  }, []);

  const drawScene = useCallback((upTo, progress) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);

    drawBackground(ctx, w, h);

    // Gutenberg: animate reading-gravity arrow instead of fixation dots
    if (pattern === 'gutenberg') {
      const arrowProgress = Math.min((upTo + progress) / (pts.length - 1), 1);
      drawGutenbergArrow(ctx, w, h, arrowProgress);
      return;
    }

    const count = Math.min(upTo + 1, pts.length);

    // Saccades
    for (let i = 1; i < count; i++) {
      const from = pts[i - 1];
      let to = pts[i];
      if (i === count - 1 && progress < 1) {
        to = { x: from.x + (pts[i].x - from.x) * progress, y: from.y + (pts[i].y - from.y) * progress };
      }
      ctx.strokeStyle = 'rgba(107,92,165,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();

      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      ctx.fillStyle = 'rgba(107,92,165,0.6)';
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - 7 * Math.cos(angle - 0.4), to.y - 7 * Math.sin(angle - 0.4));
      ctx.lineTo(to.x - 7 * Math.cos(angle + 0.4), to.y - 7 * Math.sin(angle + 0.4));
      ctx.fill();
    }

    // Fixations
    for (let i = 0; i < count; i++) {
      const p = pts[i];
      const isCur = i === count - 1;
      const r = isCur ? 10 : 7;

      ctx.fillStyle = isCur ? 'rgba(26,138,106,0.15)' : 'rgba(26,138,106,0.08)';
      ctx.beginPath(); ctx.arc(p.x, p.y, r + 6, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = isCur ? '#1a8a6a' : 'rgba(26,138,106,0.65)';
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = "bold 10px 'Inter', sans-serif";
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`${i + 1}`, p.x, p.y);
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }, [pts, pattern, drawGutenbergArrow]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    drawScene(pts.length, 1);
  }, [drawScene, pts.length]);

  useEffect(() => {
    if (!playing) return;
    let start = null;
    const stepDur = 380;
    const total = stepDur * pts.length;

    const step = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const idx = Math.min(Math.floor(elapsed / stepDur), pts.length - 1);
      const prog = Math.min((elapsed - idx * stepDur) / stepDur, 1);
      drawScene(idx, prog);
      if (elapsed < total) animRef.current = requestAnimationFrame(step);
      else { drawScene(pts.length, 1); setPlaying(false); }
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, pts, drawScene]);

  return (
    <div className="card" style={s.patternCard}>
      <h4 style={{ marginBottom: 6 }}>{label}</h4>
      <canvas ref={ref} className="demo-canvas" style={{ height: 280, marginBottom: 12 }} />
      <button className="btn btn-primary btn-sm" onClick={() => setPlaying(true)} disabled={playing}>
        {playing ? '⏳ Playing…' : '▶ Animate'}
      </button>
    </div>
  );
}

/* ── Main Section ──────────────────────────────────────────────── */
export default function PatternsSection() {
  return (
    <section id="patterns" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container-wide">
        <div className="section-header">
          <span className="badge badge-purple">Gaze Behavior</span>
          <h2>How Eyes Scan a Page</h2>
          <p className="section-subtitle" style={{ maxWidth:'8000px' }}>
            Eye-tracking research has revealed several recurring patterns in how people scan
            visual content. Understanding these patterns is the foundation of attention-aware design. And they are also widly used for guiding the attention of users.
          </p>
        </div>

        <div className="container">
          <div style={s.explBlock}>
            <h3 style={{ marginBottom: 8 }}>📖 Reading-Based Patterns</h3>
            <p>
              When a page is <strong>text-heavy</strong>, readers in left-to-right languages tend to
              follow predictable horizontal scanning behaviors. The most famous is the <em>F-pattern</em>,
              discovered by Jakob Nielsen&apos;s eye-tracking studies at the Nielsen Norman Group.
            </p>
            <p>
              Users first read across the top (the first horizontal bar of the &quot;F&quot;), then move down
              and read a shorter second line, and finally scan the left side vertically. This means
              <strong> content placed in the top-left gets the most attention</strong>, while the
              bottom-right is often ignored.
            </p>
            <p style={s.refLink}>
              📎 Reference: <a href="https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/" target="_blank" rel="noopener noreferrer">Nielsen, J. (2006). F-Shaped Pattern For Reading Web Content</a>
            </p>
          </div>

          <div style={s.explBlock}>
            <h3 style={{ marginBottom: 8 }}>🎨 Visual-Based Patterns</h3>
            <p>
              For pages with <strong>less text and more visual elements</strong> (landing pages,
              posters, ads), the <em>Z-pattern</em> applies: the eye moves from top-left → top-right
              → diagonally to bottom-left → bottom-right. This is why logos go top-left and CTAs
              go bottom-right.
            </p>
            <p>
              The <em>Gutenberg diagram</em> divides a page into four quadrants: the Primary Optical
              Area (top-left), Strong Fallow (top-right), Weak Fallow (bottom-left), and Terminal
              Area (bottom-right). Attention naturally flows from primary to terminal along a
              &quot;reading gravity&quot; diagonal.
            </p>
            <p style={s.refLink}>
              📎 References: <a href="https://vanseodesign.com/web-design/3-design-layouts/#:~:text=3%20Design%20Layouts%3A%20Gutenberg%20Diagram,-Pattern%2C%20And%20F-Pattern" target="_blank" rel="noopener noreferrer">Z-Pattern</a> · <a href="https://medium.com/user-experience-3/the-gutenberg-diagram-in-web-design-e5347c172627" target="_blank" rel="noopener noreferrer">Gutenberg Diagram</a>
            </p>
          </div>

          <div style={s.explBlock}>
            <h3 style={{ marginBottom: 8 }}>📊 The Layer-Cake Pattern</h3>
            <p>
              A variation of the F-pattern where users <strong>only read headings and subheadings</strong>,
              skipping body text entirely. The scanpath looks like horizontal &quot;layers&quot; separated
              by vertical jumps — like a layer cake. This is extremely common on mobile devices
              and content-heavy pages.
            </p>
            <p style={s.refLink}>
              📎 Reference: <a href="https://www.nngroup.com/articles/layer-cake-pattern-scanning/" target="_blank" rel="noopener noreferrer">The Layer-Cake Pattern of Scanning Content on the Web</a>
            </p>
          </div>
        </div>

        <h3 style={{ textAlign: 'center', marginBottom: 8, marginTop: 40, fontFamily: "'Inter', sans-serif" }}>
          Interactive Pattern Demos
        </h3>
        <p style={{ textAlign: 'center', maxWidth: 460, margin: '0 auto 28px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Click &quot;Animate&quot; to watch each pattern unfold step by step.
        </p>
        <div style={s.patternGrid}>
          <PatternCanvas pattern="f-pattern" label="F-Pattern" />
          <PatternCanvas pattern="z-pattern" label="Z-Pattern" />
          <PatternCanvas pattern="gutenberg" label="Gutenberg Diagram" />
          <PatternCanvas pattern="layer-cake" label="Layer-Cake Pattern" />
        </div>

        <div className="container">
          <div className="insight-box" style={{ maxWidth: 640, margin: '36px auto 0' }}>
            💡 <strong>Key insight:</strong> The design of a page doesn&apos;t just <em>display</em> content —
            it actively shapes the scanpath. By understanding these natural patterns, designers
            can place critical information where eyes naturally go.
          </div>
        </div>
      </div>
    </section>
  );
}

const s = {
  explBlock: {
    marginBottom: 24, padding: '22px 26px',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
  },
  refLink: {
    fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8, marginBottom: 0,
    fontFamily: "'Inter', sans-serif",
  },
  patternGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16, maxWidth: 1060, margin: '0 auto', padding: '0 24px',
  },
  patternCard: { display: 'flex', flexDirection: 'column' },
};
