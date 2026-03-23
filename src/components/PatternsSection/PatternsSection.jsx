import { useState, useEffect, useRef, useCallback } from 'react';
import { getCanvasColors, onThemeChange } from '../../utils/scenewalkSimulator';
import './PatternsSection.css';

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
    const c = getCanvasColors();
    ctx.fillStyle = c.canvasBg;
    ctx.fillRect(0, 0, w, h);

    if (pattern === 'f-pattern') {
      ctx.fillStyle = c.navBg;
      for (let row = 0; row < 5; row++) {
        const y0 = 20 + row * 52;
        const numLines = 3;
        for (let i = 0; i < numLines; i++) {
          const lw = (w - 60) * (0.5 + Math.abs(Math.sin(row * 3 + i * 1.7)) * 0.5);
          ctx.fillRect(30, y0 + i * 14, lw, 5);
        }
      }
    } else if (pattern === 'z-pattern') {
      // Top bar
      ctx.fillStyle = c.navBg;
      ctx.fillRect(30, 35, 60, 18);
      ctx.fillRect(355, 37, 30, 15);

      // Central hero area
      const hx = 110, hy = 70, hw = 220, hh = 140;
      ctx.fillStyle = c.imageBg;
      ctx.fillRect(hx, hy, hw, hh);
      ctx.strokeStyle = c.imageBorder; ctx.lineWidth = 1;
      ctx.strokeRect(hx, hy, hw, hh);

      // Mountain + sun inside hero
      ctx.fillStyle = c.imageBorder;
      ctx.beginPath();
      ctx.moveTo(hx, hy + hh);
      ctx.lineTo(hx + hw * 0.25, hy + hh * 0.35);
      ctx.lineTo(hx + hw * 0.42, hy + hh * 0.65);
      ctx.lineTo(hx + hw * 0.65, hy + hh * 0.2);
      ctx.lineTo(hx + hw, hy + hh);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx + hw * 0.82, hy + hh * 0.25, 10, 0, Math.PI * 2);
      ctx.fill();

      // Bottom area
      ctx.fillStyle = c.navBg;
      ctx.fillRect(30, 225, 130, 8);
      ctx.fillRect(30, 240, 100, 8);

      // CTA button
      ctx.fillStyle = c.ctaBlue
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

      ctx.fillStyle = 'rgba(26,138,106,0.18)';
      ctx.fillRect(x1, y1, qw, qh);
      ctx.fillStyle = 'rgba(196,150,12,0.12)';
      ctx.fillRect(x2, y1, qw, qh);
      ctx.fillStyle = 'rgba(196,150,12,0.08)';
      ctx.fillRect(x1, y2, qw, qh);
      ctx.fillStyle = 'rgba(26,138,106,0.13)';
      ctx.fillRect(x2, y2, qw, qh);

      ctx.strokeStyle = c.quadrantBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(x1, y1, qw, qh);
      ctx.strokeRect(x2, y1, qw, qh);
      ctx.strokeRect(x1, y2, qw, qh);
      ctx.strokeRect(x2, y2, qw, qh);

      ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = c.labelPrimary;
      ctx.fillText('① Primary', x1 + qw / 2, y1 + qh / 2 - 8);
      ctx.fillStyle = c.labelSecondary;
      ctx.font = "10px 'Inter', sans-serif";
      ctx.fillText('High attention', x1 + qw / 2, y1 + qh / 2 + 8);

      ctx.fillStyle = c.labelFallow; ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.fillText('Strong Fallow', x2 + qw / 2, y1 + qh / 2 - 8);
      ctx.fillStyle = c.labelMuted; ctx.font = "10px 'Inter', sans-serif";
      ctx.fillText('Low attention', x2 + qw / 2, y1 + qh / 2 + 8);

      ctx.fillStyle = c.labelFallow; ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.fillText('Weak Fallow', x1 + qw / 2, y2 + qh / 2 - 8);
      ctx.fillStyle = c.labelMuted; ctx.font = "10px 'Inter', sans-serif";
      ctx.fillText('Lowest attention', x1 + qw / 2, y2 + qh / 2 + 8);

      ctx.fillStyle = c.labelPrimary; ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.fillText('④ Terminal', x2 + qw / 2, y2 + qh / 2 - 8);
      ctx.fillStyle = c.labelSecondary; ctx.font = "10px 'Inter', sans-serif";
      ctx.fillText('High attention', x2 + qw / 2, y2 + qh / 2 + 8);

      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    } else if (pattern === 'layer-cake') {
      for (let i = 0; i < 4; i++) {
        const y0 = 18 + i * 70;
        ctx.fillStyle = c.headingBar;
        const hw = (w - 60) * (0.4 + Math.abs(Math.sin(i * 2)) * 0.5);
        ctx.fillRect(30, y0, hw, 8);
        ctx.fillStyle = c.bodyBar;
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
    const dpr = window.devicePixelRatio || 1;
    const realW = canvas.width / dpr;
    const realH = canvas.height / dpr;
    const VW = 430, VH = 280;
    const sx = realW / VW, sy = realH / VH;
    ctx.clearRect(0, 0, realW, realH);
    ctx.save();
    ctx.scale(sx, sy);

    drawBackground(ctx, VW, VH);

    // Gutenberg: animate reading-gravity arrow instead of fixation dots
    if (pattern === 'gutenberg') {
      const arrowProgress = Math.min((upTo + progress) / (pts.length - 1), 1);
      drawGutenbergArrow(ctx, VW, VH, arrowProgress);
      ctx.restore();
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
    ctx.restore();
  }, [pts, pattern, drawGutenbergArrow]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScene(pts.length, 1);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const stopTheme = onThemeChange(resize);
    return () => { ro.disconnect(); stopTheme(); };
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
    <div className="ps-demo-inline" style={{ position: 'relative' }}>
      <canvas ref={ref} className="demo-canvas" style={{ aspectRatio: '430 / 280' }} />
      {!playing && (
        <button
          className="ps-play-overlay"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${label} animation`}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="23" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
            <polygon points="19,14 19,34 35,24" fill="rgba(255,255,255,0.9)" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── Main Section ──────────────────────────────────────────────── */
export default function PatternsSection() {
  return (
    <section id="patterns" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container-wide">
        <div className="section-header">
          <span className="badge badge-purple">Gaze Patterns</span>
          <h2>How Eyes Scan a Page</h2>
          <p className="section-subtitle" style={{ maxWidth: '800px' }}>
            Recurring gaze patterns reveal where eyes naturally go — and where they don&apos;t.
          </p>
        </div>

        <div className="container">
          {/* ── F-Pattern ── */}
          <div className="ps-expl-block">
            <div className="ps-block-inner">
              <div className="ps-block-text">
                <h3 style={{ marginBottom: 8 }}>📖 F-Pattern (Reading-Based)</h3>
                <p>
                  On <strong>text-heavy pages</strong>, left-to-right readers scan in an
                  {' '}<em>F-shape</em>: across the top, a shorter second sweep, then down the
                  left edge. <strong>Top-left content gets the most attention; bottom-right
                  is often ignored.</strong>
                </p>
                <details className="ps-learn-more">
                  <summary>Learn more</summary>
                  <p>
                    Jakob Nielsen&apos;s eye-tracking studies showed users first read across the
                    top (the first bar of the &quot;F&quot;), then move down for a shorter second line,
                    and finally scan vertically along the left side.
                  </p>
                  <p className="ps-ref-link">
                    📎 <a href="https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/" target="_blank" rel="noopener noreferrer">Nielsen, J. (2006). F-Shaped Pattern</a>
                  </p>
                </details>
              </div>
              <PatternCanvas pattern="f-pattern" label="F-Pattern" />
            </div>
          </div>

          {/* ── Z-Pattern ── */}
          <div className="ps-expl-block">
            <div className="ps-block-inner">
              <div className="ps-block-text">
                <h3 style={{ marginBottom: 8 }}>🎨 Z-Pattern</h3>
                <p>
                  On pages with <strong>more visuals than text</strong> (landing pages, ads),
                  eyes follow a <em>Z-shape</em>: top-left → top-right → diagonal to
                  bottom-left → bottom-right. <strong>Logos go top-left, CTAs go
                  bottom-right.</strong>
                </p>
                <details className="ps-learn-more">
                  <summary>Learn more</summary>
                  <p>
                    The Z-pattern is most effective on visually driven layouts with minimal
                    copy. The diagonal sweep connects the brand identity (top-left) to the
                    primary call-to-action (bottom-right), making it ideal for landing pages
                    and advertisements.
                  </p>
                  <p className="ps-ref-link">
                    📎 <a href="https://vanseodesign.com/web-design/3-design-layouts/#:~:text=3%20Design%20Layouts%3A%20Gutenberg%20Diagram,-Pattern%2C%20And%20F-Pattern" target="_blank" rel="noopener noreferrer">Z-Pattern &amp; Design Layouts</a>
                  </p>
                </details>
              </div>
              <PatternCanvas pattern="z-pattern" label="Z-Pattern" />
            </div>
          </div>

          {/* ── Gutenberg Diagram ── */}
          <div className="ps-expl-block">
            <div className="ps-block-inner">
              <div className="ps-block-text">
                <h3 style={{ marginBottom: 8 }}>📐 Gutenberg Diagram</h3>
                <p>
                  Divides a page into four quadrants: <strong>Primary Optical Area</strong>{' '}
                  (top-left, high attention), <strong>Terminal Area</strong> (bottom-right,
                  high). Attention flows along a &quot;reading gravity&quot; diagonal from primary
                  to terminal.
                </p>
                <details className="ps-learn-more">
                  <summary>Learn more</summary>
                  <p>
                    The two remaining zones — Strong Fallow (top-right) and Weak Fallow
                    (bottom-left) — receive less attention. Designers use this model to place
                    key content along the gravity diagonal and avoid burying important
                    elements in the fallow areas.
                  </p>
                  <p className="ps-ref-link">
                    📎 <a href="https://medium.com/user-experience-3/the-gutenberg-diagram-in-web-design-e5347c172627" target="_blank" rel="noopener noreferrer">Gutenberg Diagram in Web Design</a>
                  </p>
                </details>
              </div>
              <PatternCanvas pattern="gutenberg" label="Gutenberg Diagram" />
            </div>
          </div>

          {/* ── Layer-Cake Pattern ── */}
          <div className="ps-expl-block">
            <div className="ps-block-inner">
              <div className="ps-block-text">
                <h3 style={{ marginBottom: 8 }}>📊 Layer-Cake Pattern</h3>
                <p>
                  Users <strong>only read headings and subheadings</strong>, skipping body
                  text entirely. The scanpath looks like horizontal &quot;layers&quot; separated by
                  vertical jumps — common on mobile and content-heavy pages.
                </p>
                <details className="ps-learn-more">
                  <summary>Learn more</summary>
                  <p>
                    A variation of the F-pattern, the &quot;layer cake&quot; emerges when pages use
                    clear heading hierarchy. Users jump between bold headings, reading just
                    enough to decide whether the section is relevant before skipping ahead.
                  </p>
                  <p className="ps-ref-link">
                    📎 <a href="https://www.nngroup.com/articles/layer-cake-pattern-scanning/" target="_blank" rel="noopener noreferrer">The Layer-Cake Pattern of Scanning Content on the Web</a>
                  </p>
                </details>
              </div>
              <PatternCanvas pattern="layer-cake" label="Layer-Cake Pattern" />
            </div>
          </div>

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
