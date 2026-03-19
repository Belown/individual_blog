import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { simulateScanpath, drawPageElements, drawScanpath } from '../utils/scenewalkSimulator';
import EyeTrackingExperiment from './EyeTrackingExperiment';

function FactorDemo({ title, description, icon, paramLabel, paramMin, paramMax, paramStep, defaultVal, buildElements, numFixations = 6 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(defaultVal);
  const [visibleCount, setVisibleCount] = useState(0);
  const timerRef = useRef(null);

  const currentElements = useMemo(() => buildElements(val), [val, buildElements]);
  // Seed derived from parameter value: different settings → different viewer behaviour
  const seed = useMemo(() => Math.round(val * 1000) + 7, [val]);
  const fixations = useMemo(() => simulateScanpath(currentElements, { numFixations, seed }), [currentElements, numFixations, seed]);

  useEffect(() => { setVisibleCount(0); }, [fixations]);
  useEffect(() => {
    if (visibleCount < fixations.length) {
      timerRef.current = setTimeout(() => setVisibleCount(c => c + 1), visibleCount === 0 ? 250 : 420);
      return () => clearTimeout(timerRef.current);
    }
  }, [visibleCount, fixations.length]);

  const draw = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    const sx = w / 800, sy = h / 600;
    ctx.fillStyle = '#fafaf8';
    ctx.fillRect(0, 0, w, h);
    drawPageElements(ctx, currentElements, sx, sy);
    drawScanpath(ctx, fixations.slice(0, visibleCount), sx, sy);
  }, [currentElements, fixations, visibleCount]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div className="card" style={sty.demoCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <h4 style={{ margin: 0 }}>{title}</h4>
      </div>
      <p style={{ fontSize: '0.9rem', marginBottom: 14 }}>{description}</p>
      <canvas ref={ref} className="demo-canvas" style={{ height: 300, marginBottom: 14 }} />
      <div style={sty.sliderRow}>
        <span style={sty.sliderLabel}>
          {paramLabel}:{' '}
          <strong style={{ color: 'var(--accent)' }}>
            {typeof val === 'number' ? (paramStep < 1 ? `${Math.round(val * 100)}%` : val) : val}
          </strong>
        </span>
        <input type="range" min={paramMin} max={paramMax} step={paramStep} value={val}
          onChange={(e) => setVal(Number(e.target.value))} />
      </div>
    </div>
  );
}

export default function FactorsSection() {
  return (
    <section id="factors" className="section" style={{ background: 'var(--bg-primary)' }}>
      <div className="container-wide">
        <div className="section-header">
          <span className="badge badge-warm">Scanpath Formation</span>
          <h2>What Shapes a Scanpath?</h2>
          <p className="section-subtitle">
            A scanpath isn&apos;t random &mdash; it&apos;s shaped by the visual properties of the page.
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

        <div style={sty.demoGrid}>

          <FactorDemo icon="&#x1F4D0;" title="Visual Hierarchy (Text Size)"
            description="Larger text attracts fixations earlier and longer. Shrink the headline and watch it lose attention priority."
            paramLabel="Headline Size" paramMin={12} paramMax={42} paramStep={2} defaultVal={32}
            buildElements={useCallback((fontSize) => [
              { type: 'headline', x: 40, y: 60, width: 400, height: 50, fontSize, text: 'Big Headline', color: '#2c2c2c' },
              { type: 'text', x: 40, y: 140, width: 400, height: 100 },
              { type: 'image', x: 500, y: 60, width: 260, height: 180, size: 1 },
              { type: 'cta', x: 40, y: 270, width: 160, height: 42, color: '#1a8a6a', brightness: 0.7 },
              { type: 'text', x: 40, y: 350, width: 720, height: 80 },
            ], [])} />

          <FactorDemo icon="&#x1F3A8;" title="Color &amp; Contrast"
            description="High-contrast, warm-colored elements attract more fixations. Change the CTA color to see the effect."
            paramLabel="CTA Warmth" paramMin={0} paramMax={1} paramStep={0.1} defaultVal={0.5}
            buildElements={useCallback((warmth) => {
              const r = Math.round(26 + warmth * 186), g = Math.round(138 - warmth * 60), b = Math.round(106 - warmth * 80);
              return [
                { type: 'headline', x: 40, y: 60, width: 400, height: 50, fontSize: 28, text: 'Our Product', color: '#2c2c2c' },
                { type: 'text', x: 40, y: 130, width: 400, height: 80 },
                { type: 'cta', x: 40, y: 240, width: 180, height: 46, color: `rgb(${r},${g},${b})`, brightness: warmth },
                { type: 'image', x: 480, y: 60, width: 280, height: 200, size: 1 },
                { type: 'text', x: 40, y: 330, width: 720, height: 80 },
              ];
            }, [])} />

          <FactorDemo icon="&#x1F5BC;&#xFE0F;" title="Image Size &amp; Placement"
            description="Images are fixation magnets. A large image can dominate the scanpath and delay attention to text and CTAs."
            paramLabel="Image Size" paramMin={0.3} paramMax={1.4} paramStep={0.1} defaultVal={1}
            numFixations={8}
            buildElements={useCallback((imageSize) => {
              const iw = Math.round(260 * imageSize), ih = Math.round(180 * imageSize);
              return [
                { type: 'headline', x: 40, y: 50, width: 350, height: 45, fontSize: 26, text: 'Welcome', color: '#2c2c2c' },
                { type: 'text', x: 40, y: 110, width: 350, height: 60 },
                { type: 'image', x: Math.max(20, 600 - iw / 2), y: Math.max(30, 150 - ih / 2), width: Math.min(iw, 760), height: Math.min(ih, 400), size: imageSize },
                { type: 'cta', x: 40, y: 200, width: 150, height: 40, color: '#1a8a6a', brightness: 0.6 },
                { type: 'text', x: 40, y: 300, width: 720, height: 60 },
              ];
            }, [])} />

          <FactorDemo icon="&#x1F4E2;" title="Ads &amp; Visual Noise"
            description="Ad banners and distractors scatter the scanpath. More noise = less focused attention on your key content."
            paramLabel="Ad Count" paramMin={0} paramMax={4} paramStep={1} defaultVal={0}
            numFixations={8}
            buildElements={useCallback((adCount) => {
              const base = [
                { type: 'headline', x: 40, y: 50, width: 400, height: 45, fontSize: 28, text: 'Main Content', color: '#2c2c2c' },
                { type: 'text', x: 40, y: 110, width: 400, height: 80 },
                { type: 'cta', x: 40, y: 220, width: 160, height: 42, color: '#1a8a6a', brightness: 0.7 },
                { type: 'image', x: 500, y: 50, width: 260, height: 155, size: 1 },
                { type: 'text', x: 40, y: 310, width: 720, height: 55 },
              ];
              const adColors = ['#d4553a', '#c4960c', '#b04080', '#6b5ca5'];
              // Ads are placed within the active content zone so they intercept
              // the natural reading path and compete with key elements.
              const adPos = [
                { x: 500, y: 220, width: 260, height: 55 },  // right side, just below image
                { x: 40,  y: 380, width: 720, height: 52 },  // full-width banner below text
                { x: 40,  y: 450, width: 340, height: 50 },  // lower-left
                { x: 400, y: 450, width: 360, height: 50 },  // lower-right
              ];
              for (let i = 0; i < adCount; i++) base.push({ type: 'ad', ...adPos[i], color: adColors[i] });
              return base;
            }, [])} />
        </div>

        <EyeTrackingExperiment />
      </div>
    </section>
  );
}

const sty = {
  demoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: 18, maxWidth: 1060, margin: '0 auto', padding: '0 24px',
  },
  demoCard: { display: 'flex', flexDirection: 'column' },
  sliderRow: { display: 'flex', flexDirection: 'column', gap: 6 },
  sliderLabel: { fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'var(--text-secondary)' },
  summary: {
    marginTop: 48, padding: '32px 28px', background: 'var(--bg-secondary)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
  },
  eqGrid: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap',
  },
  eqItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: 120,
  },
  eqIcon: { fontSize: '1.3rem', marginBottom: 2 },
  eqDesc: { fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 },
  eqPlus: { fontFamily: "'Inter', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-light)' },
  eqEquals: { fontFamily: "'Inter', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' },
};
