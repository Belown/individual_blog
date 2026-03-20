import { useState, useMemo, useEffect, useRef } from 'react';
import { simulateScanpath, drawPageElements, drawScanpath } from '../../utils/scenewalkSimulator';
import './ScanpathChallenge.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const SIM_W = 800;
const SIM_H = 600;
const NUM_FIXATIONS = 8;

// The intended viewing order the user is trying to achieve
const TARGET = ['headline', 'cta', 'image'];

// Display metadata for each AOI type
const AOI_META = {
  headline:   { label: 'Headline', color: '#6b5ca5', bg: '#eeeafc' },
  cta:        { label: 'CTA',      color: '#1a8a6a', bg: '#e0f5ee' },
  image:      { label: 'Image',    color: '#c4960c', bg: '#fdf5e0' },
  text:       { label: 'Text',     color: '#777',    bg: '#f0ede8' },
  ad:         { label: 'Ad',       color: '#d4553a', bg: '#fce8e4' },
  background: { label: 'BG',       color: '#aaa',    bg: '#f0f0f0' },
};

// ── Element builder ───────────────────────────────────────────────────────────
// Fixed center of the image area — scaling expands outward in all directions
const IMG_CENTER_X = 622;  // (455 + 790) / 2 — middle of the right column
const IMG_CENTER_Y = 150;  // vertical midpoint of the hero image zone
const IMG_MAX_W    = 335;  // clamp so image stays within 800px canvas

function buildElements({ headlineSize, imageSize, ctaColor, adsEnabled }) {
  const headlineH = Math.round(headlineSize * 2.1);
  const headlineY = 58;
  const textY     = headlineY + headlineH + 16;
  const ctaY      = textY + 72 + 18;

  // Image: center is fixed, size grows/shrinks around it
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
      color: ctaColor, brightness: ctaBrightness },
    { type: 'image',    x: imgX, y: imgY,       width: imgW, height: imgH, size: imageSize },
  ];

  if (adsEnabled) {
    // Fixed positions — independent of any dynamic element sizes
    els.push(
      { type: 'ad', x: 40,    y: 480, width: 720, height: 44, color: '#c4960c' },
      { type: 'ad', x: IMG_CENTER_X - IMG_MAX_W / 2, y: 310, width: 325, height: 50, color: '#d4553a' },
    );
  }

  return els;
}

// ── Similarity: longest common subsequence of target inside simulated ─────────
function lcsLength(target, seq) {
  const m = target.length, n = seq.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = target[i - 1] === seq[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}

// ── Contextual tip ────────────────────────────────────────────────────────────
function getTip(aoiSeq, score, controls) {
  if (score === 100) return 'Perfect match! Your layout guides visitors exactly as intended.';

  const first  = aoiSeq[0];
  const ctaIdx = aoiSeq.indexOf('cta');
  const imgIdx = aoiSeq.indexOf('image');

  if (first === 'image' || first === 'ad')
    return 'The image is dominating first attention. Reduce its size so the headline wins the opening fixation.';
  if (first !== 'headline')
    return 'Increase headline size — it must be the most visually dominant element to attract the very first fixation.';
  if (controls.adsEnabled)
    return 'Ads are fragmenting gaze. Disable distractors to give the CTA a cleaner path to second attention.';
  if (ctaIdx === -1)
    return 'The CTA is not drawing enough attention. Switch to the warm orange color — warm tones have higher attentional salience.';
  if (imgIdx !== -1 && ctaIdx > imgIdx)
    return 'Users see the image before the CTA. Try reducing image size so the CTA competes for second fixation.';

  return 'Almost there — try nudging headline size or CTA color to close the gap.';
}

// ── Default (intentionally suboptimal) starting controls ─────────────────────
const DEFAULT_CONTROLS = {
  headlineSize: 16,
  imageSize:    1.1,
  ctaColor:     '#6b5ca5',
  adsEnabled:   false,
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScanpathChallenge() {
  const [controls, setControls] = useState(DEFAULT_CONTROLS);
  const canvasRef = useRef(null);
  const drawRef   = useRef(null);

  const set = (key, val) => setControls(c => ({ ...c, [key]: val }));

  // Derive elements and simulate scanpath
  const elements  = useMemo(() => buildElements(controls), [controls]);
  const fixations = useMemo(
    () => simulateScanpath(elements, { numFixations: NUM_FIXATIONS, seed: 42, canvasW: SIM_W, canvasH: SIM_H }),
    [elements],
  );

  // Deduplicate consecutive same-AOI fixations (standard eye-tracking pre-processing)
  const aoiSequence = useMemo(() => {
    const raw = fixations.map(f => f.elementType).filter(t => t !== 'background');
    return raw.filter((v, i) => i === 0 || v !== raw[i - 1]);
  }, [fixations]);

  const score = Math.round((lcsLength(TARGET, aoiSequence) / TARGET.length) * 100);
  const tip   = getTip(aoiSequence, score, controls);

  const scoreColor =
    score >= 80 ? '#1a8a6a' :
    score >= 50 ? '#c4960c' : '#d4553a';

  // ── Canvas draw ─────────────────────────────────────────────────
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
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#fafaf8';
      ctx.fillRect(0, 0, W, H);
      drawPageElements(ctx, elements, W / SIM_W, H / SIM_H);
      drawScanpath(ctx, fixations, W / SIM_W, H / SIM_H);
    };
    drawRef.current = fn;
    fn();
  }, [elements, fixations]);

  // Stable ResizeObserver — always calls the latest draw via ref
  useEffect(() => {
    const ro = new ResizeObserver(() => drawRef.current?.());
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="sc-root">

      {/* Challenge brief */}
      <div className="sc-brief">
        <span className="sc-brief-icon">🎯</span>
        <p>
          <strong>Goal:</strong> Adjust the design controls so visitors explore the page in the order{' '}
          <AoiChip aoi="headline" /> → <AoiChip aoi="cta" /> → <AoiChip aoi="image" />.
          {' '}Watch the simulated scanpath update live and raise your similarity score to 100%.
        </p>
      </div>

      <div className="sc-layout">

        {/* ── Left panel: controls + score ── */}
        <div className="sc-panel">

          <span className="sc-section-label">Design Controls</span>

          {/* Headline size */}
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

          {/* Image size */}
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

          {/* CTA color */}
          <div className="sc-control">
            <label>CTA Color</label>
            <div className="sc-color-row">
              {[
                { color: '#6b5ca5', label: 'Muted purple' },
                { color: '#1a8a6a', label: 'Standard green' },
                { color: '#d4553a', label: 'Warm orange-red' },
              ].map(({ color, label }) => (
                <button
                  key={color}
                  title={label}
                  onClick={() => set('ctaColor', color)}
                  className={`sc-color-btn${controls.ctaColor === color ? ' sc-color-btn--active' : ''}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          {/* Distractor ads */}
          <div className="sc-control">
            <label className="sc-toggle-label">
              <input type="checkbox"
                checked={controls.adsEnabled}
                onChange={e => set('adsEnabled', e.target.checked)}
                className="sc-toggle"
              />
              Add distractor ads
            </label>
          </div>

          {/* Reset */}
          <button className="sc-reset" onClick={() => setControls(DEFAULT_CONTROLS)}>
            Reset to default
          </button>

        </div>

        {/* ── Right panel: canvas + results strip ── */}
        <div className="sc-canvas-wrap">
          <canvas ref={canvasRef} className="sc-canvas" />
          <p className="sc-canvas-caption">
            Fixation circles encode dwell time · arrows show saccade direction · numbers show visit order
          </p>

          {/* Results strip */}
          <div className="sc-results">

            {/* Score ring */}
            <div className="sc-score-wrap">
              <svg viewBox="0 0 80 80" className="sc-score-ring">
                <circle cx="40" cy="40" r="32"
                  fill="none" stroke="var(--bg-surface)" strokeWidth="7" />
                <circle cx="40" cy="40" r="32"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - score / 100)}`}
                  transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dashoffset 380ms ease, stroke 380ms ease' }}
                />
                <text x="40" y="45" textAnchor="middle"
                  fontSize="16" fontWeight="700"
                  fontFamily="Inter, sans-serif"
                  fill={scoreColor}>
                  {score}%
                </text>
              </svg>
              <div className="sc-score-label" style={{ color: scoreColor }}>
                {score === 100 ? 'Perfect match' :
                 score >= 80  ? 'Close' :
                 score >= 50  ? 'Partial match' : 'Low match'}
              </div>
            </div>

            {/* Sequences */}
            <div className="sc-results-seqs">
              <div className="sc-seq-block">
                <span className="sc-seq-label">Target path</span>
                <div className="sc-seq">
                  {TARGET.map((aoi, i) => (
                    <span key={i} className="sc-seq-item">
                      {i > 0 && <span className="sc-arrow">→</span>}
                      <AoiChip aoi={aoi} />
                    </span>
                  ))}
                </div>
              </div>
              <div className="sc-seq-block">
                <span className="sc-seq-label">Simulated (first 5 unique AOIs)</span>
                <div className="sc-seq">
                  {aoiSequence.slice(0, 5).map((aoi, i) => (
                    <span key={i} className="sc-seq-item">
                      {i > 0 && <span className="sc-arrow">→</span>}
                      <AoiChip aoi={aoi} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="sc-tip">
              <span className="sc-tip-icon">💡</span>
              <span>{tip}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// Small helper — AOI label chip
function AoiChip({ aoi }) {
  const meta = AOI_META[aoi] ?? { label: aoi, color: '#888', bg: '#eee' };
  return (
    <span className="sc-chip" style={{ background: meta.bg, color: meta.color }}>
      {meta.label}
    </span>
  );
}
