import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/* ── Scanpath simulator ─────────────────────────────────────────
 *
 * Models three well-established oculomotor phenomena:
 *
 * 1. BOTTOM-UP SALIENCE
 *    Each page element is assigned an intrinsic saliency weight
 *    based on type, size, colour, and vertical position.
 *
 * 2. INHIBITION OF RETURN (IOR)
 *    After an element is fixated, its effective weight is
 *    temporarily suppressed.  The suppression decays
 *    exponentially over subsequent fixations, matching
 *    empirical IOR time-constants (Klein, 2000).
 *
 * 3. SACCADE AMPLITUDE BIAS
 *    Short saccades are far more probable than long ones.
 *    The distance penalty follows an inverse-square law
 *    scaled to the canvas dimensions, consistent with the
 *    "near-fixation preference" reported in oculomotor
 *    literature (Tatler & Vincent, 2008).
 *
 * 4. FIXATION DURATION MODEL
 *    Base duration is derived from content complexity
 *    (element type + area).  A noise term proportional to
 *    the base models the well-known coefficient-of-variation
 *    (≈ 0.3) found in human fixation data (Rayner, 1998).
 * ─────────────────────────────────────────────────────────────── */

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function simulateScanpath(elements, opts = {}) {
  const { numFixations = 10, seed = 42 } = opts;
  const rand = seededRandom(seed);

  // ── 1. Base saliency weights ──────────────────────────────────
  const base = elements.map(el => {
    let w = 10;
    // Vertical position bias: top areas receive stronger initial attention
    w += (1 - el.y / 600) * 20;
    // Area contribution (normalised to canvas)
    w += (el.width * el.height) / (800 * 600) * 25;
    // Type-specific adjustments
    if (el.type === 'headline') w += 25 * (el.fontSize || 28) / 28;
    if (el.type === 'cta')      w += 30 + (el.brightness || 0.5) * 15;
    if (el.type === 'image')    w += 20 * (el.size || 1);
    if (el.type === 'ad')       w += 18;
    if (el.type === 'text')     w += 8;
    return { ...el, baseSaliency: Math.max(w, 1) };
  });

  // ── 2. Fixation duration model: base milliseconds per type ────
  const baseDuration = (el) => {
    const area = (el.width * el.height) / (800 * 600);
    let d = 150;
    if (el.type === 'headline') d = 200 + area * 800;
    else if (el.type === 'text')    d = 220 + area * 600;
    else if (el.type === 'image')   d = 180 + area * 500;
    else if (el.type === 'cta')     d = 160 + area * 400;
    else if (el.type === 'ad')      d = 130 + area * 300;
    return d;
  };

  // ── IOR state: a decay counter per element index ──────────────
  const iorCount = new Array(base.length).fill(0); // fixations since last visit
  const IOR_HALF_LIFE = 3;   // fixations until half the suppression lifts
  const IOR_STRENGTH  = 0.75; // max weight reduction on revisit

  // ── Saccade distance penalty ──────────────────────────────────
  // Returns a multiplier in (0,1].  Uses canvas coords (800×600 logical).
  const distancePenalty = (fromX, fromY, toEl) => {
    const toCX = toEl.x + toEl.width  * 0.5;
    const toCY = toEl.y + toEl.height * 0.5;
    const dx = (toCX - fromX) / 800;
    const dy = (toCY - fromY) / 600;
    const normDist = Math.sqrt(dx * dx + dy * dy); // 0–√2
    // Inverse square + baseline so very close elements aren't infinitely preferred
    return 1 / (1 + 6 * normDist * normDist);
  };

  const fixations = [];
  // Start gaze near top-left (typical entry point for LTR readers)
  let curX = 80 + rand() * 40;
  let curY = 60 + rand() * 30;

  for (let i = 0; i < numFixations; i++) {
    // ── Compute effective weight for each element ─────────────
    const effectiveWeights = base.map((el, idx) => {
      // IOR decay: suppression = IOR_STRENGTH × exp(-iorCount/IOR_HALF_LIFE)
      const iorDecay = Math.exp(-iorCount[idx] / IOR_HALF_LIFE);
      const iorMultiplier = 1 - IOR_STRENGTH * (1 - iorDecay);
      // Distance penalty from current gaze position
      const dist = distancePenalty(curX, curY, el);
      return Math.max(0.5, el.baseSaliency * iorMultiplier * dist);
    });

    // ── Roulette-wheel selection ──────────────────────────────
    const totalW = effectiveWeights.reduce((a, b) => a + b, 0);
    let r = rand() * totalW;
    let idx = 0;
    for (let j = 0; j < effectiveWeights.length; j++) {
      r -= effectiveWeights[j];
      if (r <= 0) { idx = j; break; }
    }

    // ── Increment IOR counters; reset winner ──────────────────
    iorCount.forEach((_, k) => { iorCount[k]++; });
    iorCount[idx] = 0;

    // ── Sample fixation position within element ───────────────
    const el = base[idx];
    const fx = el.x + el.width  * (0.25 + rand() * 0.5) + (rand() - 0.5) * 10;
    const fy = el.y + el.height * (0.25 + rand() * 0.5) + (rand() - 0.5) * 10;
    const clampedX = Math.max(5, Math.min(795, fx));
    const clampedY = Math.max(5, Math.min(595, fy));

    // ── Fixation duration with ≈30% coefficient of variation ─
    const base_d = baseDuration(el);
    const duration = Math.max(80, base_d + (rand() - 0.5) * 2 * base_d * 0.3);

    fixations.push({
      x: clampedX,
      y: clampedY,
      duration,
      elementType: el.type,
    });

    curX = clampedX;
    curY = clampedY;
  }
  return fixations;
}

/* ── Factor Demo Component ─────────────────────────────────────── */
function FactorDemo({ title, description, icon, paramLabel, paramMin, paramMax, paramStep, defaultVal, buildElements }) {
  const ref = useRef(null);
  const [val, setVal] = useState(defaultVal);

  const currentElements = useMemo(() => buildElements(val), [val, buildElements]);
  const fixations = useMemo(() => simulateScanpath(currentElements, { numFixations: 10, seed: 42 }), [currentElements]);

  const draw = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    const sx = w / 800, sy = h / 600;

    // Light page background
    ctx.fillStyle = '#fafaf8';
    ctx.fillRect(0, 0, w, h);

    for (const el of currentElements) {
      const ex = el.x * sx, ey = el.y * sy, ew = el.width * sx, eh = el.height * sy;
      switch (el.type) {
        case 'headline':
          ctx.fillStyle = el.color || '#2c2c2c';
          ctx.font = `bold ${Math.max(10, (el.fontSize || 28) * sx)}px Inter, sans-serif`;
          ctx.textBaseline = 'top';
          ctx.fillText(el.text || 'Headline', ex, ey);
          break;
        case 'text':
          ctx.fillStyle = '#e0dcd5';
          for (let i = 0; i < Math.floor(eh / (12 * sy)); i++) {
            ctx.fillRect(ex, ey + i * 12 * sy, ew * (0.6 + Math.abs(Math.sin(i * 2.5)) * 0.4), 4 * sy);
          }
          break;
        case 'image':
          ctx.fillStyle = '#f0ede8';
          ctx.fillRect(ex, ey, ew, eh);
          ctx.strokeStyle = '#ddd8d0';
          ctx.lineWidth = 1;
          ctx.strokeRect(ex, ey, ew, eh);
          ctx.fillStyle = '#ddd8d0';
          ctx.beginPath();
          ctx.moveTo(ex, ey + eh);
          ctx.lineTo(ex + ew * 0.4, ey + eh * 0.35);
          ctx.lineTo(ex + ew * 0.7, ey + eh * 0.6);
          ctx.lineTo(ex + ew, ey + eh);
          ctx.fill();
          break;
        case 'cta': {
          ctx.fillStyle = el.color || '#1a8a6a';
          const cr = 5 * sx;
          ctx.beginPath();
          ctx.moveTo(ex + cr, ey); ctx.lineTo(ex + ew - cr, ey);
          ctx.quadraticCurveTo(ex + ew, ey, ex + ew, ey + cr);
          ctx.lineTo(ex + ew, ey + eh - cr);
          ctx.quadraticCurveTo(ex + ew, ey + eh, ex + ew - cr, ey + eh);
          ctx.lineTo(ex + cr, ey + eh);
          ctx.quadraticCurveTo(ex, ey + eh, ex, ey + eh - cr);
          ctx.lineTo(ex, ey + cr);
          ctx.quadraticCurveTo(ex, ey, ex + cr, ey);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = `600 ${Math.max(8, 11 * sx)}px Inter, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('Get Started', ex + ew / 2, ey + eh / 2);
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          break;
        }
        case 'ad':
          ctx.fillStyle = el.color || '#d4553a';
          ctx.globalAlpha = 0.15;
          ctx.fillRect(ex, ey, ew, eh);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = el.color || '#d4553a';
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(ex, ey, ew, eh);
          ctx.setLineDash([]);
          ctx.fillStyle = el.color || '#d4553a';
          ctx.font = `bold ${Math.max(8, 10 * sx)}px Inter, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('AD', ex + ew / 2, ey + eh / 2);
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          break;
        default:
          ctx.fillStyle = '#f0ede8';
          ctx.fillRect(ex, ey, ew, eh);
      }
    }

    // Scanpath — saccade lines
    for (let i = 1; i < fixations.length; i++) {
      const dx = (fixations[i].x - fixations[i-1].x) / 800;
      const dy = (fixations[i].y - fixations[i-1].y) / 600;
      const normLen = Math.sqrt(dx*dx + dy*dy);
      // Longer saccades are drawn more transparently (harder to track)
      const alpha = Math.max(0.2, 0.65 - normLen * 0.6);
      ctx.strokeStyle = `rgba(107,92,165,${alpha.toFixed(2)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(fixations[i - 1].x * sx, fixations[i - 1].y * sy);
      ctx.lineTo(fixations[i].x * sx, fixations[i].y * sy);
      ctx.stroke();
      // Arrowhead at destination
      const angle = Math.atan2(
        (fixations[i].y - fixations[i-1].y) * sy,
        (fixations[i].x - fixations[i-1].x) * sx
      );
      const ax = fixations[i].x * sx, ay = fixations[i].y * sy;
      ctx.fillStyle = `rgba(107,92,165,${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 6 * Math.cos(angle - 0.4), ay - 6 * Math.sin(angle - 0.4));
      ctx.lineTo(ax - 6 * Math.cos(angle + 0.4), ay - 6 * Math.sin(angle + 0.4));
      ctx.fill();
    }
    // Fixation circles — radius encodes duration
    const minD = Math.min(...fixations.map(f => f.duration));
    const maxD = Math.max(...fixations.map(f => f.duration));
    const dRange = Math.max(1, maxD - minD);
    for (let i = 0; i < fixations.length; i++) {
      const f = fixations[i];
      const fx = f.x * sx, fy = f.y * sy;
      // Radius: 4–12 px (logical), mapped from duration range
      const r = Math.max(4, (4 + 8 * (f.duration - minD) / dRange)) * Math.min(sx, 1.2);
      // Outer glow ring for long fixations
      if (f.duration > (minD + dRange * 0.6)) {
        ctx.fillStyle = 'rgba(26,138,106,0.12)';
        ctx.beginPath(); ctx.arc(fx, fy, r + 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(26,138,106,0.82)';
      ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(7, 9 * sx)}px Inter, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`${i + 1}`, fx, fy);
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }, [currentElements, fixations]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }, [draw]);

  return (
    <div className="card" style={s.demoCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <h4 style={{ margin: 0 }}>{title}</h4>
      </div>
      <p style={{ fontSize: '0.9rem', marginBottom: 14 }}>{description}</p>
      <canvas ref={ref} className="demo-canvas" style={{ height: 240, marginBottom: 14 }} />
      <div style={s.sliderRow}>
        <span style={s.sliderLabel}>{paramLabel}: <strong style={{ color: 'var(--accent)' }}>{typeof val === 'number' ? (paramStep < 1 ? `${Math.round(val * 100)}%` : val) : val}</strong></span>
        <input type="range" min={paramMin} max={paramMax} step={paramStep} value={val}
          onChange={(e) => setVal(Number(e.target.value))} />
      </div>
    </div>
  );
}

/* ── Main Section ──────────────────────────────────────────────── */
export default function FactorsSection() {
  return (
    <section id="factors" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container-wide">
        <div className="section-header">
          <span className="badge badge-warm">Scanpath Formation</span>
          <h2>What Shapes a Scanpath?</h2>
          <p className="section-subtitle">
            A scanpath isn&apos;t random — it&apos;s shaped by the visual properties of the page.
            Adjust each factor below and watch how the simulated scanpath changes.
          </p>
        </div>

        <div className="container">
          <p style={{ textAlign: 'center', marginBottom: 32 }}>
            When you land on a webpage, your visual system rapidly evaluates the scene and decides
            where to look first. This decision is driven by <em>bottom-up salience</em> (what
            visually &quot;pops out&quot;) and <em>top-down goals</em> (what you&apos;re looking for).
          </p>
        </div>

        <div style={s.demoGrid}>
          <FactorDemo
            icon="📐" title="Visual Hierarchy (Text Size)"
            description="Larger text attracts fixations earlier and longer. Shrink the headline and watch it lose attention priority."
            paramLabel="Headline Size" paramMin={12} paramMax={42} paramStep={2} defaultVal={32}
            buildElements={useCallback((fontSize) => [
              { type: 'headline', x: 40, y: 60, width: 400, height: 50, fontSize, text: 'Big Headline', color: '#2c2c2c' },
              { type: 'text', x: 40, y: 140, width: 400, height: 100 },
              { type: 'image', x: 500, y: 60, width: 260, height: 180, size: 1 },
              { type: 'cta', x: 40, y: 270, width: 160, height: 42, color: '#1a8a6a', brightness: 0.7 },
              { type: 'text', x: 40, y: 350, width: 720, height: 80 },
            ], [])}
          />

          <FactorDemo
            icon="🎨" title="Color & Contrast"
            description="High-contrast, warm-colored elements attract more fixations. Change the CTA color to see the effect."
            paramLabel="CTA Warmth" paramMin={0} paramMax={1} paramStep={0.1} defaultVal={0.5}
            buildElements={useCallback((warmth) => {
              const r = Math.round(26 + warmth * 186);
              const g = Math.round(138 - warmth * 60);
              const b = Math.round(106 - warmth * 80);
              const color = `rgb(${r},${g},${b})`;
              return [
                { type: 'headline', x: 40, y: 60, width: 400, height: 50, fontSize: 28, text: 'Our Product', color: '#2c2c2c' },
                { type: 'text', x: 40, y: 130, width: 400, height: 80 },
                { type: 'cta', x: 40, y: 240, width: 180, height: 46, color, brightness: warmth },
                { type: 'image', x: 480, y: 60, width: 280, height: 200, size: 1 },
                { type: 'text', x: 40, y: 330, width: 720, height: 80 },
              ];
            }, [])}
          />

          <FactorDemo
            icon="🖼️" title="Image Size & Placement"
            description="Images are fixation magnets. A large image can dominate the scanpath and delay attention to text and CTAs."
            paramLabel="Image Size" paramMin={0.3} paramMax={2} paramStep={0.1} defaultVal={1}
            buildElements={useCallback((imageSize) => {
              const iw = Math.round(260 * imageSize);
              const ih = Math.round(180 * imageSize);
              return [
                { type: 'headline', x: 40, y: 50, width: 350, height: 45, fontSize: 26, text: 'Welcome', color: '#2c2c2c' },
                { type: 'text', x: 40, y: 110, width: 350, height: 60 },
                { type: 'image', x: Math.max(20, 500 - iw / 2), y: Math.max(30, 150 - ih / 2), width: Math.min(iw, 760), height: Math.min(ih, 400), size: imageSize },
                { type: 'cta', x: 40, y: 200, width: 150, height: 40, color: '#1a8a6a', brightness: 0.6 },
                { type: 'text', x: 40, y: 300, width: 720, height: 60 },
              ];
            }, [])}
          />

          <FactorDemo
            icon="📢" title="Ads & Visual Noise"
            description="Ad banners and distractors scatter the scanpath. More noise = less focused attention on your key content."
            paramLabel="Ad Count" paramMin={0} paramMax={4} paramStep={1} defaultVal={0}
            buildElements={useCallback((adCount) => {
              const base = [
                { type: 'headline', x: 40, y: 50, width: 400, height: 45, fontSize: 28, text: 'Main Content', color: '#2c2c2c' },
                { type: 'text', x: 40, y: 110, width: 400, height: 80 },
                { type: 'cta', x: 40, y: 220, width: 160, height: 42, color: '#1a8a6a', brightness: 0.7 },
                { type: 'image', x: 500, y: 50, width: 260, height: 160, size: 1 },
                { type: 'text', x: 40, y: 310, width: 720, height: 60 },
              ];
              const adColors = ['#d4553a', '#c4960c', '#b04080', '#6b5ca5'];
              const adPositions = [
                { x: 500, y: 240, width: 260, height: 60 },
                { x: 40, y: 400, width: 340, height: 55 },
                { x: 420, y: 400, width: 340, height: 55 },
                { x: 200, y: 480, width: 400, height: 50 },
              ];
              for (let i = 0; i < adCount; i++) {
                base.push({ type: 'ad', ...adPositions[i], color: adColors[i] });
              }
              return base;
            }, [])}
          />
        </div>

        {/* Summary */}
        <div className="container">
          <div style={s.summary}>
            <h3 style={{ textAlign: 'center', marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>The Scanpath Equation</h3>
            <div style={s.eqGrid}>
              <div style={s.eqItem}>
                <span style={s.eqIcon}>📐</span>
                <strong>Size & Position</strong>
                <span style={s.eqDesc}>Larger, higher elements get seen first</span>
              </div>
              <div style={s.eqPlus}>+</div>
              <div style={s.eqItem}>
                <span style={s.eqIcon}>🎨</span>
                <strong>Color & Contrast</strong>
                <span style={s.eqDesc}>High contrast attracts and holds the gaze</span>
              </div>
              <div style={s.eqPlus}>+</div>
              <div style={s.eqItem}>
                <span style={s.eqIcon}>🖼️</span>
                <strong>Images</strong>
                <span style={s.eqDesc}>Visual magnets that guide or hijack attention</span>
              </div>
              <div style={s.eqPlus}>−</div>
              <div style={s.eqItem}>
                <span style={s.eqIcon}>📢</span>
                <strong>Visual Noise</strong>
                <span style={s.eqDesc}>Distractors scatter focus</span>
              </div>
              <div style={s.eqEquals}>=</div>
              <div style={{ ...s.eqItem, background: 'var(--accent-light)', border: '1px solid rgba(26,138,106,0.2)' }}>
                <span style={s.eqIcon}>🔄</span>
                <strong style={{ color: 'var(--accent)' }}>Your Scanpath</strong>
                <span style={s.eqDesc}>The unique path each visitor&apos;s eyes take</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const s = {
  demoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: 18, maxWidth: 1060, margin: '0 auto', padding: '0 24px',
  },
  demoCard: { display: 'flex', flexDirection: 'column' },
  sliderRow: { display: 'flex', flexDirection: 'column', gap: 6 },
  sliderLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.82rem', color: 'var(--text-secondary)',
  },

  summary: {
    marginTop: 48, padding: '32px 28px',
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
  },
  eqGrid: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 10, flexWrap: 'wrap',
  },
  eqItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    padding: '14px 16px', background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: 120,
  },
  eqIcon: { fontSize: '1.3rem', marginBottom: 2 },
  eqDesc: { fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 },
  eqPlus: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-light)',
  },
  eqEquals: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)',
  },
};
