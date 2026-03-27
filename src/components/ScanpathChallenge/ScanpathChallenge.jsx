import { useState, useMemo, useEffect, useRef } from 'react';
import { simulateScanpath, drawPageElements, drawScanpath, getCanvasColors, onThemeChange } from '../../utils/scenewalkSimulator';
import './ScanpathChallenge.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const SIM_W         = 800;
const SIM_H         = 600;
const NUM_FIXATIONS = 8;

// ── Image geometry (shared by builder + reference) ────────────────────────────
const IMG_CENTER_X = 600;   // horizontal midpoint of the right column
const IMG_CENTER_Y = 150;   // vertical midpoint of the hero image zone
const IMG_MAX_W    = 420;   // clamp so image stays within 800 px canvas

// ── Element builder ───────────────────────────────────────────────────────────
function buildElements({ headlineSize, imageSize, ctaColor, adCount }) {
  const headlineH = Math.round(headlineSize * 2.1);
  const headlineY = 58;
  const textY     = headlineY + headlineH + 16;
  const ctaY      = textY + 72 + 18;

  const imgW = Math.min(Math.round(290 * imageSize), IMG_MAX_W);
  const imgH = Math.round(imgW * (210 / 290));
  const imgX = Math.round(IMG_CENTER_X - imgW / 2);
  const imgY = Math.round(IMG_CENTER_Y - imgH / 2);

  const ctaBrightness =
    ctaColor === '#d4553a' ? 0.9 :
    ctaColor === '#1a8a6a' ? 0.65 : 0.3;

  const els = [
    { type: 'headline', x: 40,   y: headlineY, width: 390, height: headlineH,
      fontSize: headlineSize, text: 'Organise your team' },
    { type: 'text',     x: 40,   y: textY,     width: 375, height: 72 },
    { type: 'cta',      x: 40,   y: ctaY,      width: 168, height: 44,
      color: ctaColor, brightness: ctaBrightness, ctaFontSize: 15 },
    { type: 'image',    x: imgX, y: imgY,       width: imgW, height: imgH, size: imageSize },
    // Bottom section — features row
    { type: 'headline', x: 40,   y: 370, width: 300, height: 28, fontSize: 18, text: 'Why should we do this?', color: '#2c2c2c' },
    { type: 'text',     x: 40,   y: 410, width: 220, height: 50 },
    { type: 'text',     x: 290,  y: 410, width: 220, height: 50 },
    { type: 'text',     x: 540,  y: 410, width: 220, height: 50 },
  ];

  const adSlots = [
    { x: 40, y: 300, width: 500, height: 50, color: '#c4960c' },   // small rectangle next to CTA
    { x: 40,  y: 540, width: 720, height: 35, color: '#d4553a' },   // leaderboard banner at bottom
    { x: 40,  y: 480, width: 340, height: 45, color: '#6b5ca5' },   // medium rectangle below features left
    { x: 400, y: 480, width: 360, height: 45, color: '#b04080' },   // medium rectangle below features right
  ];
  for (let i = 0; i < adCount; i++) els.push({ type: 'ad', ...adSlots[i] });

  return els;
}

// ── Reference (optimal) scanpath — computed once at module level ──────────────
// Large headline + warm CTA + moderate image + no ads = the intended viewing pattern.
const REF_ELEMENTS  = buildElements({ headlineSize: 36, imageSize: 1.25, ctaColor: '#d4553a', adCount: 0 });
const REF_FIXATIONS = simulateScanpath(REF_ELEMENTS, { numFixations: NUM_FIXATIONS, seed: 42, canvasW: SIM_W, canvasH: SIM_H });

// ── Dynamic Time Warping on (x, y) sequences ─────────────────────────────────
// DTW finds the optimal alignment between two fixation sequences of any length,
// minimising the sum of Euclidean distances between paired fixations.
// Coordinates are normalised to [0, 1] so x and y contribute equally regardless
// of canvas aspect ratio.
//
// Reference: Berndt & Clifford (1994). Using dynamic time warping to find
//   patterns in time series. AAAI Workshop on Knowledge Discovery in Databases.
function dtwSimilarity(a, b) {
  const n = a.length, m = b.length;
  if (n === 0 || m === 0) return 0;
  const d = (p, q) => Math.hypot((p.x - q.x) / SIM_W, (p.y - q.y) / SIM_H);
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(Infinity));
  dp[0][0] = 0;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      const cost = d(a[i - 1], b[j - 1]);
      dp[i][j] = cost + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  // Normalise: worst case is every fixation pair maximally separated (√2 in unit space)
  const maxCost = Math.max(n, m) * Math.SQRT2;
  return Math.round(Math.max(0, 1 - dp[n][m] / maxCost) * 100);
}

// ── Ghost scanpath draw (reference path) ─────────────────────────────────────
function drawReferencePath(ctx, fixations, sx, sy) {
  if (fixations.length < 2) return;
  const c = getCanvasColors();
  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = c.refLine;
  ctx.lineWidth   = 1.5;
  for (let i = 1; i < fixations.length; i++) {
    ctx.beginPath();
    ctx.moveTo(fixations[i - 1].x * sx, fixations[i - 1].y * sy);
    ctx.lineTo(fixations[i].x * sx,     fixations[i].y * sy);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  const refR = 12 * Math.min(sx, 1.2);
  fixations.forEach((f, i) => {
    const fx = f.x * sx, fy = f.y * sy;
    ctx.fillStyle   = c.refHalo;
    ctx.strokeStyle = c.refCircle;
    ctx.lineWidth   = 1.5;
    ctx.beginPath(); ctx.arc(fx, fy, refR, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.font = `bold ${Math.max(7, Math.round(refR * 0.85))}px Inter, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeStyle = c.refTextStroke; ctx.lineWidth = 0.8;
    ctx.strokeText(`${i + 1}`, fx, fy);
    ctx.fillStyle = c.refText;
    ctx.fillText(`${i + 1}`, fx, fy);
  });
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

// ── Contextual tip ────────────────────────────────────────────────────────────
function getTip(fixations, score, controls) {
  if (score >= 95) return <>Your scanpath closely matches the reference! The design is <b>guiding attention along the intended path</b>.</>;

  const first = fixations[0]?.elementType;
  const types = fixations.map(f => f.elementType);
  const ctaIdx = types.indexOf('cta');
  const imgIdx = types.indexOf('image');

  if (controls.adCount > 0)
    return <>Ads are scattering fixations across the canvas, increasing DTW distance. <b>Remove distractors</b> first.</>;
  if (first !== 'headline' && controls.headlineSize < 30)
    return <>First fixation is far from the reference start. <b>Increase headline size</b> so it anchors the opening gaze near the top-left.</>;
  if (controls.ctaColor !== '#d4553a' && (ctaIdx === -1 || (imgIdx !== -1 && ctaIdx > imgIdx)))
    return <>The CTA fixation appears too late, creating a large displacement from the reference path. Try a <b>warmer CTA color</b>.</>;
  if (controls.imageSize < 1.0)
    return <>The image is too small to anchor the right side. <b>Increase image size</b> to draw fixations toward the reference trajectory.</>;

  return <>Paths are partially aligned. Fine-tune <b>headline size</b>, <b>image size</b>, or <b>CTA color</b> to bring fixations closer to the reference.</>;
}

// ── Default (intentionally suboptimal) starting controls ─────────────────────
const DEFAULT_CONTROLS = {
  headlineSize: 16,
  imageSize:    1.1,
  ctaColor:     '#6b5ca5',
  adCount:      4,
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScanpathChallenge() {
  const [controls, setControls] = useState(DEFAULT_CONTROLS);
  const [canvasH, setCanvasH]   = useState(null);
  const [tipOpen, setTipOpen]   = useState(false);
  const [dtwInfoOpen, setDtwInfoOpen] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const canvasRef  = useRef(null);
  const drawRef    = useRef(null);
  const rootRef    = useRef(null);
  const infoBtnRef = useRef(null);

  const set = (key, val) => setControls(c => ({ ...c, [key]: val }));

  const toggleDtwInfo = () => {
    setDtwInfoOpen(prev => {
      if (!prev && infoBtnRef.current && rootRef.current) {
        const btnRect  = infoBtnRef.current.getBoundingClientRect();
        const rootRect = rootRef.current.getBoundingClientRect();
        setPopupPos({
          top:  btnRect.top  - rootRect.top + btnRect.height / 2,
          left: btnRect.right - rootRect.left + 10,
        });
      }
      return !prev;
    });
  };

  const elements  = useMemo(() => buildElements(controls), [controls]);
  const fixations = useMemo(
    () => simulateScanpath(elements, { numFixations: NUM_FIXATIONS, seed: 42, canvasW: SIM_W, canvasH: SIM_H }),
    [elements],
  );

  const score = useMemo(() => dtwSimilarity(fixations, REF_FIXATIONS), [fixations]);
  const tip   = getTip(fixations, score, controls);

  const scoreColor =
    score >= 80 ? '#1a8a6a' :
    score >= 50 ? '#c4960c' : '#d4553a';

  // ── Canvas draw ──────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const W = canvas.offsetWidth;
      if (!W) return;
      const H   = Math.round(W * (SIM_H / SIM_W));
      const dpr = window.devicePixelRatio || 1;
      canvas.width        = W * dpr;
      canvas.height       = H * dpr;
      canvas.style.height = H + 'px';
      setCanvasH(H);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = getCanvasColors().canvasBg;
      ctx.fillRect(0, 0, W, H);
      const sx = W / SIM_W, sy = H / SIM_H;
      drawPageElements(ctx, elements, sx, sy);
      // Reference path first (behind), then user's path on top
      drawReferencePath(ctx, REF_FIXATIONS, sx, sy);
      drawScanpath(ctx, fixations, sx, sy);
    };
    drawRef.current = fn;
    fn();
  }, [elements, fixations]);

  useEffect(() => {
    const redraw = () => drawRef.current?.();
    const ro = new ResizeObserver(redraw);
    if (canvasRef.current) ro.observe(canvasRef.current);
    const stopTheme = onThemeChange(redraw);
    return () => { ro.disconnect(); stopTheme(); };
  }, []);

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="sc-root" ref={rootRef}>

      {/* Brief */}
      <div className="sc-brief">
        <p className="sc-brief-headline">Task🎯: Tweak the sliders to match the <span className="sc-ref-tag">reference path</span></p>
        <div className="sc-brief-steps">
          <span className="sc-step"><span className="sc-step-num">1</span> Drag the sliders on the left</span>
          <span className="sc-step"><span className="sc-step-num">2</span> Watch the coloured scanpath update</span>
          <span className="sc-step"><span className="sc-step-num">3</span> Aim for high similarity score</span>
        </div>
      </div>

      <div className="sc-layout">

        {/* ── Left: controls ── */}
        <div className="sc-panel" style={canvasH ? { maxHeight: canvasH } : undefined}>

          <div className="sc-control">
            <div className="sc-control-header">
              <label htmlFor="sc-headline">Headline Size</label>
              <span className="sc-value">{controls.headlineSize}px</span>
            </div>
            <input id="sc-headline" type="range" min="14" max="38" step="2"
              value={controls.headlineSize}
              onChange={e => set('headlineSize', +e.target.value)}
              className="sc-slider"
            />
            <div className="sc-range-labels"><span>Small</span><span>Large</span></div>
          </div>

          <div className="sc-control">
            <div className="sc-control-header">
              <label htmlFor="sc-image">Image Size</label>
              <span className="sc-value">{Math.round(controls.imageSize * 100)}%</span>
            </div>
            <input id="sc-image" type="range" min="0.3" max="1.3" step="0.1"
              value={controls.imageSize}
              onChange={e => set('imageSize', +e.target.value)}
              className="sc-slider"
            />
            <div className="sc-range-labels"><span>Small</span><span>Large</span></div>
          </div>


          <div className="sc-control">
            <div className="sc-control-header">
              <label htmlFor="sc-ads">Distractor Ads</label>
              <span className="sc-value">{controls.adCount}</span>
            </div>
            <input id="sc-ads" type="range" min="0" max="4" step="1"
              value={controls.adCount}
              onChange={e => set('adCount', +e.target.value)}
              className="sc-slider"
            />
            <div className="sc-range-labels"><span>None</span><span>4</span></div>
          </div>

          <div className="sc-control">
            <label>CTA Color</label>
            <div className="sc-color-row">
              {[
                { color: '#6b5ca5', label: 'Muted purple' },
                { color: '#1a8a6a', label: 'Standard green' },
                { color: '#d4553a', label: 'Warm orange-red' },
              ].map(({ color, label }) => (
                <button key={color} title={label}
                  onClick={() => set('ctaColor', color)}
                  className={`sc-color-btn${controls.ctaColor === color ? ' sc-color-btn--active' : ''}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
          <button className="sc-reset" onClick={() => setControls(DEFAULT_CONTROLS)}>
            Reset to default
          </button>

          {/* Score + DTW info below controls */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

          <div className="sc-score-wrap">
            <button
              ref={infoBtnRef}
              className={`sc-dtw-info-btn${dtwInfoOpen ? ' sc-dtw-info-btn--open' : ''}`}
              onClick={toggleDtwInfo}
              title="What is DTW?"
              aria-label="Learn about DTW algorithm"
            >
              ℹ
            </button>
            <svg viewBox="0 0 80 80" className="sc-score-ring">
              <circle cx="40" cy="40" r="32"
                fill="none" stroke="var(--bg-surface)" strokeWidth="7" />
              <circle cx="40" cy="40" r="32"
                fill="none" stroke={scoreColor} strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - score / 100)}`}
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 380ms ease, stroke 380ms ease' }}
              />
              <text x="40" y="45" textAnchor="middle" fontSize="16" fontWeight="700"
                fontFamily="Inter, sans-serif" fill={scoreColor}>
                {score}%
              </text>
            </svg>
            <div className={`sc-score-label${score >= 95 ? ' sc-congrats' : ''}`} style={{ color: scoreColor }}>
              {score >= 95 ? 'You\'ve mastered the design controls!' : score >= 80 ? 'Close' : score >= 50 ? 'Partial' : 'Low match'}
            </div>
          </div>

        </div>

        {/* ── Right: canvas ── */}
        <div className="sc-canvas-wrap" style={{ position: 'relative' }}>
          <canvas ref={canvasRef} className="sc-canvas" />

          {/* Hint overlay on canvas */}
          <div className={`sc-hint-overlay${tipOpen ? ' sc-hint-overlay--open' : ''}`}>
            <button
              className={`sc-hint-btn${tipOpen ? ' sc-hint-btn--open' : ''}`}
              onClick={() => setTipOpen(o => !o)}
            >
              <span className="sc-hint-bulb">💡</span>
              <span className="sc-hint-label">{tipOpen ? 'Hide Hint' : 'Show Hint'}</span>
            </button>
            <div className={`sc-tip-bar${tipOpen ? ' sc-tip-bar--visible' : ''}`}>
              <p className="sc-tip-text">{tip}</p>
            </div>
          </div>

          {/* Canvas legend */}
          <div className="sc-legend">
            <span className="sc-legend-item sc-legend-ref">
              <span className="sc-legend-line sc-legend-line--ref" />
              Reference path
            </span>
            <span className="sc-legend-item">
              <span className="sc-legend-line sc-legend-line--user" />
              Your scanpath
            </span>
          </div>
        </div>

      </div>

      {/* DTW info popup — rendered outside the scrollable panel, positioned near the ℹ button */}
      {dtwInfoOpen && (
        <>
          <div className="sc-dtw-backdrop" onClick={() => setDtwInfoOpen(false)} />
          <div
            className="sc-dtw-info-panel sc-dtw-info-panel--open"
            style={{ top: popupPos.top, left: popupPos.left }}
          >
            <p className="sc-dtw-info-title">Dynamic Time Warping (DTW)</p>
            <p className="sc-dtw-info-body">
              DTW measures similarity between two sequences that may vary in timing or speed.
              It finds the <b>optimal alignment</b> by warping the time axis — stretching or compressing
              points — to minimise the total distance between paired elements.
            </p>
            <p className="sc-dtw-info-body">
              Here, each scanpath is a sequence of <b>(x, y) fixations</b>. DTW aligns your path to the
              reference path, computing the summed Euclidean distance. A lower DTW distance →
              higher similarity score.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
