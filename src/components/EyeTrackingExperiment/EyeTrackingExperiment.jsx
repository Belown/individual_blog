import { useState, useEffect, useRef, useCallback } from 'react';
import { drawPageElements } from '../../utils/scenewalkSimulator';
import './EyeTrackingExperiment.css';

/* ── Trial definitions: 2 variants per factor ─────────────────── */
const FACTORS = [
  {
    name: 'Visual Hierarchy (Text Size)',
    icon: '📐',
    insight: 'The large headline captured more early fixations near the top-left, while the small headline let the image and CTA compete for first attention.',
    variants: [
      {
        label: 'Small Headline',
        hint: 'Small headline — where do your eyes go first?',
        elements: [
          { type: 'headline', x: 40, y: 60, width: 400, height: 30, fontSize: 13, text: 'Small Headline', color: '#2c2c2c' },
          { type: 'text',     x: 40, y: 108, width: 400, height: 100 },
          { type: 'image',    x: 500, y: 60, width: 260, height: 180, size: 1 },
          { type: 'cta',      x: 40, y: 238, width: 160, height: 42, color: '#1a8a6a', brightness: 0.7 },
          { type: 'text',     x: 40, y: 318, width: 720, height: 80 },
        ],
      },
      {
        label: 'Large Headline',
        hint: 'Large headline — does your gaze shift toward it?',
        elements: [
          { type: 'headline', x: 40, y: 55, width: 400, height: 62, fontSize: 40, text: 'Big Headline', color: '#2c2c2c' },
          { type: 'text',     x: 40, y: 148, width: 400, height: 80 },
          { type: 'image',    x: 500, y: 55, width: 260, height: 180, size: 1 },
          { type: 'cta',      x: 40, y: 258, width: 160, height: 42, color: '#1a8a6a', brightness: 0.7 },
          { type: 'text',     x: 40, y: 328, width: 720, height: 70 },
        ],
      },
    ],
  },
  {
    name: 'Color & Contrast',
    icon: '🎨',
    insight: 'The warm orange-red CTA drew more fixations and held gaze longer, demonstrating how warm colors increase attentional salience.',
    variants: [
      {
        label: 'Cold CTA',
        hint: 'Cool blue-green call-to-action button',
        elements: [
          { type: 'headline', x: 40, y: 60, width: 400, height: 50, fontSize: 28, text: 'Our Product', color: '#2c2c2c' },
          { type: 'text',     x: 40, y: 130, width: 400, height: 80 },
          { type: 'cta',      x: 40, y: 240, width: 180, height: 46, color: 'rgb(26,138,106)', brightness: 0.1 },
          { type: 'image',    x: 480, y: 60, width: 280, height: 200, size: 1 },
          { type: 'text',     x: 40, y: 330, width: 720, height: 80 },
        ],
      },
      {
        label: 'Warm CTA',
        hint: 'Warm orange-red call-to-action — notice it more?',
        elements: [
          { type: 'headline', x: 40, y: 60, width: 400, height: 50, fontSize: 28, text: 'Our Product', color: '#2c2c2c' },
          { type: 'text',     x: 40, y: 130, width: 400, height: 80 },
          { type: 'cta',      x: 40, y: 240, width: 180, height: 46, color: 'rgb(212,78,26)', brightness: 0.9 },
          { type: 'image',    x: 480, y: 60, width: 280, height: 200, size: 1 },
          { type: 'text',     x: 40, y: 330, width: 720, height: 80 },
        ],
      },
    ],
  },
  {
    name: 'Image Size & Placement',
    icon: '🖼️',
    insight: 'The large image monopolised early fixations — the CTA and headline received fewer first visits when a dominant image was present.',
    variants: [
      {
        label: 'Small Image',
        hint: 'Small image — where does attention go instead?',
        elements: [
          { type: 'headline', x: 40, y: 50, width: 350, height: 45, fontSize: 26, text: 'Welcome', color: '#2c2c2c' },
          { type: 'text',     x: 40, y: 110, width: 350, height: 60 },
          { type: 'image',    x: 530, y: 90, width: 104, height: 72, size: 0.4 },
          { type: 'cta',      x: 40, y: 200, width: 150, height: 40, color: '#1a8a6a', brightness: 0.6 },
          { type: 'text',     x: 40, y: 280, width: 720, height: 60 },
        ],
      },
      {
        label: 'Large Image',
        hint: 'Large image — does it pull your gaze away from text?',
        elements: [
          { type: 'headline', x: 40, y: 50, width: 350, height: 45, fontSize: 26, text: 'Welcome', color: '#2c2c2c' },
          { type: 'text',     x: 40, y: 110, width: 350, height: 60 },
          { type: 'image',    x: 400, y: 40, width: 360, height: 250, size: 1.38 },
          { type: 'cta',      x: 40, y: 200, width: 150, height: 40, color: '#1a8a6a', brightness: 0.6 },
          { type: 'text',     x: 40, y: 280, width: 720, height: 60 },
        ],
      },
    ],
  },
  {
    name: 'Ads & Visual Noise',
    icon: '📢',
    insight: 'Ads scattered gaze across the page — the CTA and headline received fewer fixations when competing with four ad banners.',
    variants: [
      {
        label: 'No Ads',
        hint: 'Clean layout — read naturally',
        elements: [
          { type: 'headline', x: 40, y: 50, width: 400, height: 45, fontSize: 28, text: 'Main Content', color: '#2c2c2c' },
          { type: 'text',     x: 40, y: 110, width: 400, height: 80 },
          { type: 'cta',      x: 40, y: 220, width: 160, height: 42, color: '#1a8a6a', brightness: 0.7 },
          { type: 'image',    x: 500, y: 50, width: 260, height: 155, size: 1 },
          { type: 'text',     x: 40, y: 310, width: 720, height: 55 },
        ],
      },
      {
        label: 'Four Ads',
        hint: '4 ad banners — can you stay focused on the content?',
        elements: [
          { type: 'headline', x: 40, y: 50, width: 400, height: 45, fontSize: 28, text: 'Main Content', color: '#2c2c2c' },
          { type: 'text',     x: 40, y: 110, width: 400, height: 80 },
          { type: 'cta',      x: 40, y: 220, width: 160, height: 42, color: '#1a8a6a', brightness: 0.7 },
          { type: 'image',    x: 500, y: 50, width: 260, height: 155, size: 1 },
          { type: 'text',     x: 40, y: 310, width: 720, height: 55 },
          { type: 'ad',       x: 500, y: 220, width: 260, height: 55, color: '#d4553a' },
          { type: 'ad',       x: 40,  y: 380, width: 720, height: 52, color: '#c4960c' },
          { type: 'ad',       x: 40,  y: 450, width: 340, height: 50, color: '#b04080' },
          { type: 'ad',       x: 400, y: 450, width: 360, height: 50, color: '#6b5ca5' },
        ],
      },
    ],
  },
];

const CALIB_PTS = [
  { rx: 0.1, ry: 0.1 }, { rx: 0.5, ry: 0.1 }, { rx: 0.9, ry: 0.1 },
  { rx: 0.1, ry: 0.5 }, { rx: 0.5, ry: 0.5 }, { rx: 0.9, ry: 0.5 },
  { rx: 0.1, ry: 0.9 }, { rx: 0.5, ry: 0.9 }, { rx: 0.9, ry: 0.9 },
];

const TRIAL_MS = 5000;
const CLICKS_PER_DOT = 3; // clicks needed to confirm each calibration point

/* ── Heatmap drawing ───────────────────────────────────────────── */
function drawHeatmap(ctx, pts, cw, ch) {
  if (!pts.length) return;
  const off = document.createElement('canvas');
  off.width = cw; off.height = ch;
  const oc = off.getContext('2d');
  const r = Math.max(cw, ch) * 0.055;
  pts.forEach(({ x, y }) => {
    const g = oc.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0,   'rgba(255,40,0,0.22)');
    g.addColorStop(0.4, 'rgba(255,180,0,0.12)');
    g.addColorStop(1,   'rgba(0,0,255,0)');
    oc.fillStyle = g;
    oc.beginPath(); oc.arc(x, y, r, 0, Math.PI * 2); oc.fill();
  });
  ctx.save(); ctx.globalAlpha = 0.85; ctx.drawImage(off, 0, 0); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.55;
  pts.forEach(({ x, y }) => {
    ctx.fillStyle = 'rgba(255,60,0,0.7)';
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}

/* ── Result canvas (elements + heatmap) ──────────────────────────*/
function ResultCanvas({ elements, gazePoints, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#fafaf8';
    ctx.fillRect(0, 0, w, h);
    drawPageElements(ctx, elements, w / 800, h / 600);
    drawHeatmap(ctx, gazePoints, w, h);
  }, [elements, gazePoints]);

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="ete-variant-label">{label}</div>
      <canvas ref={ref} className="demo-canvas" style={{ height: 280, display: 'block', width: '100%' }} />
      <div className="ete-gaze-count">{gazePoints.length} gaze samples</div>
    </div>
  );
}

/* ── Calibration dot ─────────────────────────────────────────────*/
function CalibDot({ rx, ry, idx, done, active, clicksLeft, onClick }) {
  const x = rx * window.innerWidth;
  const y = ry * window.innerHeight;
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        left: x - 18, top: y - 18,
        width: 36, height: 36,
        borderRadius: '50%',
        background: done ? '#1a8a6a' : active ? '#d4553a' : '#ccc',
        border: `3px solid ${done ? '#0e5c48' : active ? '#a33' : '#999'}`,
        cursor: active ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '0.72rem', fontWeight: 700,
        fontFamily: "'Inter', sans-serif",
        transition: 'background 200ms, transform 100ms',
        transform: active ? 'scale(1.1)' : 'scale(1)',
        zIndex: 2001,
        userSelect: 'none',
      }}
    >
      {done ? '✓' : active ? clicksLeft : idx + 1}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────*/
export default function EyeTrackingExperiment() {
  // phase: idle | loading | calibrating | pretrial | viewing | comparing | done | error
  const [phase,      setPhase]      = useState('idle');
  const [errorMsg,   setErrorMsg]   = useState('');
  const [calibIdx,   setCalibIdx]   = useState(0);   // which dot we're on
  const [calibClicks, setCalibClicks] = useState(0); // clicks on current dot
  const [factorIdx,  setFactorIdx]  = useState(0);
  const [variantIdx, setVariantIdx] = useState(0);
  const [countdown,  setCountdown]  = useState(5);
  const [gazeDot,    setGazeDot]    = useState(null); // {x, y} in viewport px during calibration
  // gazeData[factorIdx] = [pointsVariant0, pointsVariant1]
  const [gazeData,   setGazeData]   = useState(() => FACTORS.map(() => [[], []]));

  const canvasRef    = useRef(null);
  const gazeBuffer   = useRef([]);
  const timerRef     = useRef(null);
  const cdRef        = useRef(null);
  const wgRef        = useRef(null); // webgazer instance

  /* ── Cleanup on unmount ──────────────────────────────────────── */
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(cdRef.current);
      wgRef.current?.end();
    };
  }, []);

  /* ── Draw trial canvas ───────────────────────────────────────── */
  const drawTrial = useCallback((elements) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#fafaf8';
    ctx.fillRect(0, 0, w, h);
    drawPageElements(ctx, elements, w / 800, h / 600);
  }, []);

  /* ── Load WebGazer & start camera ────────────────────────────── */
  /* Loaded as a plain script (public/webgazer.js) to avoid Vite/mediapipe bundling issues.
     WebGazer exposes itself on window.webgazer; it cannot be imported as an ES module. */
  const loadWG = useCallback(() => new Promise((resolve, reject) => {
    if (window.webgazer) { resolve(window.webgazer); return; }
    const s = document.createElement('script');
    s.src = `${import.meta.env.BASE_URL}webgazer.js`;
    s.onload = () => window.webgazer ? resolve(window.webgazer) : reject(new Error('webgazer not found on window after load'));
    s.onerror = () => reject(new Error('Failed to load WebGazer script'));
    document.head.appendChild(s);
  }), []);

  const startWebGazer = useCallback(async () => {
    setPhase('loading');
    try {
      const wg = await loadWG();
      wgRef.current = wg;
      wg.params.showVideoPreview    = false;
      wg.params.showFaceOverlay     = false;
      wg.params.showFaceFeedbackBox = false;
      await wg.begin();
      wg.showPredictionPoints(false);
      // Hide the video container WebGazer injects into the DOM
      const vid = document.getElementById('webgazerVideoContainer');
      if (vid) vid.style.display = 'none';
      setPhase('calibrating');
      setCalibIdx(0);
      setCalibClicks(0);
      wg.setGazeListener((data) => {
        if (data) setGazeDot({ x: data.x, y: data.y });
      });
    } catch (e) {
      setErrorMsg('Could not start camera: ' + (e?.message ?? e));
      setPhase('error');
    }
  }, []);

  /* ── Calibration click ───────────────────────────────────────── */
  const handleCalibClick = useCallback(() => {
    const next = calibClicks + 1;
    if (next < CLICKS_PER_DOT) {
      setCalibClicks(next);
    } else {
      // Move to next dot
      const nextDot = calibIdx + 1;
      if (nextDot >= CALIB_PTS.length) {
        wgRef.current?.clearGazeListener();
        setGazeDot(null);
        setPhase('pretrial');
        setFactorIdx(0);
        setVariantIdx(0);
      } else {
        setCalibIdx(nextDot);
        setCalibClicks(0);
      }
    }
  }, [calibClicks, calibIdx]);

  /* ── Start a viewing trial ───────────────────────────────────── */
  const startViewing = useCallback(() => {
    const elements = FACTORS[factorIdx].variants[variantIdx].elements;
    gazeBuffer.current = [];
    setPhase('viewing');
    setCountdown(Math.ceil(TRIAL_MS / 1000));

    // Slight delay so canvas mounts first
    setTimeout(() => drawTrial(elements), 80);

    wgRef.current?.setGazeListener((data) => {
      if (!data) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const lx = data.x - rect.left;
      const ly = data.y - rect.top;
      setGazeDot({ x: data.x, y: data.y });
      if (lx >= 0 && lx <= rect.width && ly >= 0 && ly <= rect.height) {
        gazeBuffer.current.push({ x: lx, y: ly });
      }
    });

    let rem = Math.ceil(TRIAL_MS / 1000);
    cdRef.current = setInterval(() => {
      rem -= 1;
      setCountdown(rem);
      if (rem <= 0) clearInterval(cdRef.current);
    }, 1000);

    timerRef.current = setTimeout(() => {
      wgRef.current?.clearGazeListener();
      setGazeDot(null);
      const pts = [...gazeBuffer.current];
      setGazeData(prev => {
        const next = prev.map(f => f.map(v => [...v]));
        next[factorIdx][variantIdx] = pts;
        return next;
      });
      if (variantIdx === 0) {
        // Go to second variant
        setVariantIdx(1);
        setPhase('pretrial');
      } else {
        // Both variants done → compare
        setPhase('comparing');
      }
    }, TRIAL_MS);
  }, [factorIdx, variantIdx, drawTrial]);

  /* ── Next factor ─────────────────────────────────────────────── */
  const nextFactor = useCallback(() => {
    const next = factorIdx + 1;
    if (next >= FACTORS.length) {
      setPhase('done');
      wgRef.current?.end();
      const vid = document.getElementById('webgazerVideoContainer');
      if (vid) vid.style.display = 'none';
    } else {
      setFactorIdx(next);
      setVariantIdx(0);
      setPhase('pretrial');
    }
  }, [factorIdx]);

  /* ── Overlay backdrop ────────────────────────────────────────── */
  const isOverlay = phase !== 'idle' && phase !== 'error' && phase !== 'done';

  return (
    <div className="ete-wrapper">
      {/* Entry card */}
      {phase === 'idle' && (
        <div className="ete-entry-card">
          <div style={{ fontSize: '2.6rem', marginBottom: 10 }}>👁️</div>
          <h3 style={{ margin: '0 0 8px', fontFamily: "'Inter', sans-serif" }}>
            Try It With Your Own Eyes
          </h3>
          <p style={{ maxWidth: 500, textAlign: 'center', marginBottom: 22, color: 'var(--text-secondary)' }}>
            Use your webcam to record your actual gaze while viewing two versions of each
            design factor. See how your real scanpath compares to the simulation.
          </p>
          <div className="ete-requires-list">
            <span>📷 Webcam required</span>
            <span>🔒 All processing is local — no data leaves your browser</span>
            <span>⏱ ~3 minutes to complete</span>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={startWebGazer}>
            Start Eye Tracking Experiment
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div className="ete-entry-card ete-entry-card--error">
          <p style={{ color: '#d4553a' }}>{errorMsg}</p>
          <button className="btn btn-secondary" onClick={() => setPhase('idle')}>Try again</button>
        </div>
      )}

      {/* Done summary */}
      {phase === 'done' && (
        <div className="ete-done-card">
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎉</div>
          <h3 style={{ fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>Experiment Complete!</h3>
          {FACTORS.map((f, fi) => (
            <div key={fi} className="ete-result-block">
              <div className="ete-result-header">
                <span>{f.icon}</span>
                <strong style={{ fontFamily: "'Inter', sans-serif" }}>{f.name}</strong>
              </div>
              <div className="ete-result-row">
                {f.variants.map((v, vi) => (
                  <ResultCanvas key={vi} elements={v.elements} gazePoints={gazeData[fi][vi]} label={v.label} />
                ))}
              </div>
              <p className="ete-insight-text">💡 {f.insight}</p>
            </div>
          ))}
          <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => {
            setPhase('idle');
            setGazeData(FACTORS.map(() => [[], []]));
          }}>
            Reset experiment
          </button>
        </div>
      )}

      {/* ── Fullscreen overlay ─────────────────────────────────── */}
      {isOverlay && (
        <div className="ete-overlay">

          {/* Loading */}
          {phase === 'loading' && (
            <div className="ete-centre-box">
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
              <p style={{ color: '#fff', fontFamily: "'Inter', sans-serif" }}>Starting camera…</p>
            </div>
          )}

          {/* Calibration */}
          {phase === 'calibrating' && (
            <>
              <div className="ete-calib-instructions">
                <strong>Calibration</strong>&nbsp;—&nbsp;
                Look at each red dot and click it {CLICKS_PER_DOT} times.&nbsp;
                ({calibIdx + 1} / {CALIB_PTS.length})
              </div>
              {CALIB_PTS.map((pt, i) => (
                <CalibDot
                  key={i} rx={pt.rx} ry={pt.ry} idx={i}
                  done={i < calibIdx}
                  active={i === calibIdx}
                  clicksLeft={CLICKS_PER_DOT - calibClicks}
                  onClick={i === calibIdx ? handleCalibClick : undefined}
                />
              ))}
              {gazeDot && (
                <div style={{
                  position: 'fixed',
                  left: gazeDot.x - 8, top: gazeDot.y - 8,
                  width: 16, height: 16,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  border: '2px solid rgba(107,92,165,0.8)',
                  boxShadow: '0 0 6px rgba(107,92,165,0.6)',
                  pointerEvents: 'none',
                  zIndex: 2003,
                  transform: 'translate(0,0)',
                }} />
              )}
            </>
          )}

          {/* Pre-trial instruction */}
          {phase === 'pretrial' && (
            <div className="ete-centre-box">
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>{FACTORS[factorIdx].icon}</div>
              <div className="ete-factor-label">
                Factor {factorIdx + 1} / {FACTORS.length} — {FACTORS[factorIdx].name}
              </div>
              <div className="ete-variant-badge">
                Variant {variantIdx + 1} of 2: <strong>&nbsp;{FACTORS[factorIdx].variants[variantIdx].label}</strong>
              </div>
              <p className="ete-hint-text">{FACTORS[factorIdx].variants[variantIdx].hint}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginBottom: 20 }}>
                View the page naturally for {TRIAL_MS / 1000} seconds. Recording starts immediately.
              </p>
              <button className="btn btn-primary" onClick={startViewing}>
                Start ({TRIAL_MS / 1000}s recording)
              </button>
            </div>
          )}

          {/* Viewing trial */}
          {phase === 'viewing' && (
            <div className="ete-viewing-wrap">
              <div className="ete-viewing-bar">
                <span className="ete-viewing-label">
                  {FACTORS[factorIdx].icon}&nbsp;{FACTORS[factorIdx].variants[variantIdx].label}
                </span>
                <span className="ete-countdown-badge">{countdown}s</span>
              </div>
              <canvas ref={canvasRef} className="ete-trial-canvas" />
              {gazeDot && (
                <div style={{
                  position: 'fixed',
                  left: gazeDot.x - 10, top: gazeDot.y - 10,
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: '2px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 0 8px rgba(255,255,255,0.5)',
                  pointerEvents: 'none',
                  zIndex: 2003,
                }} />
              )}
            </div>
          )}

          {/* Comparing two variants */}
          {phase === 'comparing' && (
            <div className="ete-compare-wrap">
              <div className="ete-compare-header">
                <span style={{ fontSize: '1.4rem' }}>{FACTORS[factorIdx].icon}</span>
                <h3 style={{ color: '#fff', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                  {FACTORS[factorIdx].name} — Your Gaze
                </h3>
              </div>
              <div className="ete-compare-row">
                {FACTORS[factorIdx].variants.map((v, vi) => (
                  <div key={vi} className="ete-compare-card">
                    <ResultCanvas
                      elements={v.elements}
                      gazePoints={gazeData[factorIdx][vi]}
                      label={v.label}
                    />
                  </div>
                ))}
              </div>
              <p className="ete-insight-overlay">💡 {FACTORS[factorIdx].insight}</p>
              <button className="btn btn-primary" onClick={nextFactor}>
                {factorIdx + 1 < FACTORS.length
                  ? `Next factor →`
                  : 'View full summary'}
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
