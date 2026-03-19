import { useState, useEffect, useRef, useCallback } from 'react';
import './EyeTrackingExperiment.css';

/* ── Shared trial page sub-components ────────────────────────────*/
const TpNav = ({ links = ['Features', 'Pricing', 'Blog'], brand = 'Focusly' }) => (
  <nav className="tp-nav">
    <span className="tp-logo">{brand}</span>
    <div className="tp-nav-links">{links.map(l => <a key={l}>{l}</a>)}</div>
    <div className="tp-nav-actions">
      <button className="tp-btn tp-btn-ghost">Sign in</button>
      <button className="tp-btn tp-btn-green">Try free</button>
    </div>
  </nav>
);

const TpImg = ({ style, label = 'Product screenshot' }) => (
  <div className="tp-img" style={style}>{label}</div>
);

/* ── Trial definitions: 2 variants per factor ─────────────────── */
const FACTORS = [
  /* ── Factor 1: Visual Hierarchy ──────────────────────────────── */
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
        content: () => (
          <div className="tp-page">
            <TpNav />
            <div className="tp-hero">
              <div className="tp-hero-left">
                <h3 className="tp-headline-sm">Manage your team's work in one place</h3>
                <p className="tp-body">Focusly gives distributed teams a shared space to plan projects, assign tasks, and track progress — from kickoff to delivery. No more scattered spreadsheets or missed handoffs.</p>
                <p className="tp-body">Used by over 14,000 teams at companies like Spotify, Notion, and Stripe.</p>
                <button className="tp-btn tp-btn-green tp-cta">Get Started Free →</button>
                <p className="tp-fine">Free for 30 days · No credit card required</p>
              </div>
              <div className="tp-hero-right">
                <TpImg label="📊 Product dashboard" />
              </div>
            </div>
            <div className="tp-strip">
              <span>✓ Task boards</span><span>✓ Timelines</span><span>✓ Reporting</span><span>✓ 50+ integrations</span>
            </div>
          </div>
        ),
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
        content: () => (
          <div className="tp-page">
            <TpNav />
            <div className="tp-hero">
              <div className="tp-hero-left">
                <h1 className="tp-headline-lg">Manage your team's work in one place</h1>
                <p className="tp-body">Focusly gives distributed teams a shared space to plan, track, and ship — without the chaos of scattered emails and missed deadlines.</p>
                <button className="tp-btn tp-btn-green tp-cta">Get Started Free →</button>
                <p className="tp-fine">Free for 30 days · No credit card required</p>
              </div>
              <div className="tp-hero-right">
                <TpImg label="📊 Product dashboard" />
              </div>
            </div>
            <div className="tp-strip">
              <span>✓ Task boards</span><span>✓ Timelines</span><span>✓ Reporting</span><span>✓ 50+ integrations</span>
            </div>
          </div>
        ),
      },
    ],
  },

  /* ── Factor 2: Color & Contrast ───────────────────────────────── */
  {
    name: 'Color & Contrast',
    icon: '🎨',
    insight: 'The warm orange-red CTA drew more fixations and held gaze longer, demonstrating how warm colors increase attentional salience.',
    variants: [
      {
        label: 'Cold CTA',
        hint: 'Cool blue-green call-to-action — does it stand out?',
        elements: [
          { type: 'headline', x: 40, y: 60, width: 400, height: 50, fontSize: 28, text: 'Our Product', color: '#2c2c2c' },
          { type: 'text',     x: 40, y: 130, width: 400, height: 80 },
          { type: 'cta',      x: 40, y: 240, width: 180, height: 46, color: 'rgb(26,138,106)', brightness: 0.1 },
          { type: 'image',    x: 480, y: 60, width: 280, height: 200, size: 1 },
          { type: 'text',     x: 40, y: 330, width: 720, height: 80 },
        ],
        content: () => (
          <div className="tp-page">
            <TpNav links={['Features', 'Pricing', 'Enterprise', 'Blog']} />
            <div className="tp-hero">
              <div className="tp-hero-left">
                <h2 className="tp-headline-md">Your team's work, organised.</h2>
                <p className="tp-body">Bring tasks, timelines, and conversations into one place. Focusly helps teams of all sizes plan, prioritise, and deliver — without the coordination overhead.</p>
                <p className="tp-body">Trusted by 14,000+ teams worldwide.</p>
                <button className="tp-btn tp-btn-green tp-cta">Start for free →</button>
                <p className="tp-fine">No credit card · Cancel anytime</p>
              </div>
              <div className="tp-hero-right">
                <TpImg label="🗂 Project overview" />
              </div>
            </div>
          </div>
        ),
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
        content: () => (
          <div className="tp-page">
            <TpNav links={['Features', 'Pricing', 'Enterprise', 'Blog']} />
            <div className="tp-hero">
              <div className="tp-hero-left">
                <h2 className="tp-headline-md">Your team's work, organised.</h2>
                <p className="tp-body">Bring tasks, timelines, and conversations into one place. Focusly helps teams of all sizes plan, prioritise, and deliver — without the coordination overhead.</p>
                <p className="tp-body">Trusted by 14,000+ teams worldwide.</p>
                <button className="tp-btn tp-btn-warm tp-cta">Start for free →</button>
                <p className="tp-fine">No credit card · Cancel anytime</p>
              </div>
              <div className="tp-hero-right">
                <TpImg label="🗂 Project overview" />
              </div>
            </div>
          </div>
        ),
      },
    ],
  },

  /* ── Factor 3: Image Size & Placement ─────────────────────────── */
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
        content: () => (
          <div className="tp-page">
            <TpNav links={['Resources', 'Blog', 'About']} />
            <div className="tp-article">
              <div className="tp-article-meta">Resources › Guides</div>
              <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h2 className="tp-headline-article">The Complete Guide to Running an Async-First Team</h2>
                  <p className="tp-byline">By Marcus Webb · February 20, 2026 · 8 min read</p>
                  <p className="tp-body">Async-first teams consistently outperform synchronous ones on project delivery speed, employee satisfaction, and meeting overhead reduction. The shift isn't easy — but the payoff is significant.</p>
                  <p className="tp-body">This guide covers the five pillars of a high-functioning async culture: clear written communication, reliable documentation, structured check-ins, outcome-based management, and shared tooling that respects time zones.</p>
                </div>
                <TpImg style={{ width: 130, height: 97, flexShrink: 0, fontSize: '0.65rem' }} label="📷 Team photo" />
              </div>
              <p className="tp-body">Pioneers like GitLab, Automattic, and Basecamp have scaled globally distributed teams of hundreds without a central office — proving co-location isn't a prerequisite for performance.</p>
              <button className="tp-btn tp-btn-green" style={{ marginTop: 8 }}>Download the full guide →</button>
            </div>
          </div>
        ),
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
        content: () => (
          <div className="tp-page">
            <TpNav links={['Resources', 'Blog', 'About']} />
            <div className="tp-article">
              <div className="tp-article-meta">Resources › Guides</div>
              <h2 className="tp-headline-article">The Complete Guide to Running an Async-First Team</h2>
              <p className="tp-byline">By Marcus Webb · February 20, 2026 · 8 min read</p>
              <TpImg style={{ width: '100%', aspectRatio: '16/6', marginBottom: 20, fontSize: '0.8rem' }} label="📷 Remote team collaboration" />
              <p className="tp-body">Async-first teams consistently outperform synchronous ones on project delivery speed, employee satisfaction, and meeting overhead reduction. The shift isn't easy — but the payoff is significant.</p>
              <p className="tp-body">This guide covers the five pillars of a high-functioning async culture: clear written communication, reliable documentation, and outcome-based management.</p>
              <button className="tp-btn tp-btn-green" style={{ marginTop: 8 }}>Download the full guide →</button>
            </div>
          </div>
        ),
      },
    ],
  },

  /* ── Factor 4: Ads & Visual Noise ─────────────────────────────── */
  {
    name: 'Ads & Visual Noise',
    icon: '📢',
    insight: 'Ads scattered gaze across the page — the CTA and headline received fewer fixations when competing with four ad banners.',
    variants: [
      {
        label: 'No Ads',
        hint: 'Clean article layout — read naturally',
        elements: [
          { type: 'headline', x: 40, y: 50, width: 400, height: 45, fontSize: 28, text: 'Main Content', color: '#2c2c2c' },
          { type: 'text',     x: 40, y: 110, width: 400, height: 80 },
          { type: 'cta',      x: 40, y: 220, width: 160, height: 42, color: '#1a8a6a', brightness: 0.7 },
          { type: 'image',    x: 500, y: 50, width: 260, height: 155, size: 1 },
          { type: 'text',     x: 40, y: 310, width: 720, height: 55 },
        ],
        content: () => (
          <div className="tp-page">
            <TpNav brand="TechReport" links={['World', 'Business', 'Technology', 'Science']} />
            <div className="tp-article">
              <div className="tp-article-meta">Technology › Remote Work</div>
              <h1 className="tp-headline-article" style={{ fontSize: '1.7rem' }}>How AI Is Reshaping the Way Remote Teams Work Together</h1>
              <p className="tp-byline">By Sarah Chen · March 14, 2026 · 5 min read</p>
              <TpImg style={{ width: '100%', aspectRatio: '16/5', marginBottom: 18, fontSize: '0.8rem' }} label="🌍 Remote work" />
              <p className="tp-body">In 2024, remote and hybrid work crossed a new milestone — over 40% of knowledge workers globally operated outside a traditional office for the majority of their workday. But the bigger shift wasn't geographic; it was cognitive.</p>
              <p className="tp-body">AI-powered tools now draft meeting summaries, flag at-risk tasks, resolve scheduling conflicts, and write first-draft status updates. For distributed teams, the effect is transformative: coordination overhead drops, and the time saved goes toward actual work.</p>
              <blockquote className="tp-pullquote">"The best async tools don't just record what happened — they surface what matters." — Dr. Ana Reyes, Future of Work Institute</blockquote>
              <p className="tp-body">A 2025 Gartner study found that teams using AI-augmented project tools reduced internal meeting time by an average of 34%, without a measurable decline in alignment or output quality.</p>
            </div>
          </div>
        ),
      },
      {
        label: 'Four Ads',
        hint: '4 ad banners — can you stay focused on the article?',
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
        content: () => (
          <div className="tp-page">
            <TpNav brand="TechReport" links={['World', 'Business', 'Technology', 'Science']} />
            <div className="tp-ad tp-ad-leaderboard">AD · CloudHost Pro — 99.9% uptime · Trusted by 50,000+ developers · Try free →</div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div className="tp-article" style={{ flex: 1, minWidth: 0 }}>
                <div className="tp-article-meta">Technology › Remote Work</div>
                <h1 className="tp-headline-article" style={{ fontSize: '1.7rem' }}>How AI Is Reshaping the Way Remote Teams Work Together</h1>
                <p className="tp-byline">By Sarah Chen · March 14, 2026 · 5 min read</p>
                <p className="tp-body">In 2024, remote and hybrid work crossed a new milestone — over 40% of knowledge workers globally operated outside a traditional office for the majority of their workday. But the bigger shift wasn't geographic; it was cognitive.</p>
                <div className="tp-ad tp-ad-mid">AD · TravelPlus · Business travel made simple · Book your next trip →</div>
                <p className="tp-body">AI-powered tools now draft meeting summaries, flag at-risk tasks, resolve scheduling conflicts, and write first-draft status updates. For distributed teams, the effect is transformative.</p>
                <blockquote className="tp-pullquote">"The best async tools don't just record what happened — they surface what matters." — Dr. Ana Reyes</blockquote>
              </div>
              <div className="tp-ads-sidebar">
                <div className="tp-ad tp-ad-sidebar">AD · ClearDesk · Ergonomic home office furniture · Shop now</div>
              </div>
            </div>
            <div className="tp-ad tp-ad-bottom">AD · SecureVPN · Protect your remote workforce · From $4/user/month →</div>
          </div>
        ),
      },
    ],
  },
];

const CALIB_PTS = [
  { rx: 0.18, ry: 0.1 }, { rx: 0.5, ry: 0.1 }, { rx: 0.9, ry: 0.1 },
  { rx: 0.1, ry: 0.5 }, { rx: 0.5, ry: 0.5 }, { rx: 0.9, ry: 0.5 },
  { rx: 0.1, ry: 0.9 }, { rx: 0.5, ry: 0.9 }, { rx: 0.9, ry: 0.9 },
];

/* Validation points — different positions from calibration grid.
   All placed outside the 280×210 camera panel at top-left. */
const VALID_PTS = [
  { rx: 0.46, ry: 0.32 },  // was (0.3, 0.28) — moved right of camera
  { rx: 0.75, ry: 0.2  },
  { rx: 0.5,  ry: 0.6  },
  { rx: 0.18, ry: 0.75 },
  { rx: 0.82, ry: 0.7  },
];

const TRIAL_MS       = 5000;
const CLICKS_PER_DOT = 5;
const VALID_MS       = 1600;  // ms to collect gaze samples per validation point
const VALID_GOOD_PX  = 80;    // avg error < this → "Good"
const VALID_FAIR_PX  = 140;   // avg error < this → "Fair", else "Poor"

/* ── Heatmap drawing ───────────────────────────────────────────── */
function drawHeatmap(ctx, pts, cw, ch) {
  if (!pts.length) return;
  const off = document.createElement('canvas');
  off.width = cw; off.height = ch;
  const oc = off.getContext('2d');
  const r = Math.max(cw, ch) * 0.055;
  // pts are stored as 0-1 fractions — scale to this canvas's pixel dimensions
  pts.forEach(({ x, y }) => {
    const px = x * cw, py = y * ch;
    const g = oc.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0,   'rgba(255,40,0,0.22)');
    g.addColorStop(0.4, 'rgba(255,180,0,0.12)');
    g.addColorStop(1,   'rgba(0,0,255,0)');
    oc.fillStyle = g;
    oc.beginPath(); oc.arc(px, py, r, 0, Math.PI * 2); oc.fill();
  });
  ctx.save(); ctx.globalAlpha = 0.85; ctx.drawImage(off, 0, 0); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.55;
  pts.forEach(({ x, y }) => {
    const px = x * cw, py = y * ch;
    ctx.fillStyle = 'rgba(255,60,0,0.7)';
    ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}

/* ── Result card: scaled HTML content + heatmap overlay ──────────*/
const RESULT_H   = 280;  // fixed display height for result thumbnails
const CONTENT_W  = 900;  // matches tp-page max-width

function ResultCard({ content, gazePoints, label }) {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const [scale, setScale] = useState(0);

  // Measure container width after mount to compute scale factor
  useEffect(() => {
    if (containerRef.current) {
      setScale(containerRef.current.offsetWidth / CONTENT_W);
    }
  }, []);

  // Redraw heatmap whenever gaze data or scale changes
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || scale === 0) return;
    const w   = container.offsetWidth;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = w * dpr;
    canvas.height = RESULT_H * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = RESULT_H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawHeatmap(ctx, gazePoints, w, RESULT_H);
  }, [gazePoints, scale]);

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="ete-variant-label">{label}</div>
      <div
        ref={containerRef}
        style={{ position: 'relative', height: RESULT_H, overflow: 'hidden',
                 background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8' }}
      >
        {/* Scaled-down replica of the trial page */}
        {scale > 0 && (
          <div style={{
            width: CONTENT_W,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            {content()}
          </div>
        )}
        {/* Heatmap drawn on a transparent canvas on top */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      </div>
      <div className="ete-gaze-count">{gazePoints.length} gaze samples</div>
    </div>
  );
}

/* ── Calibration dot ─────────────────────────────────────────────*/
function CalibDot({ rx, ry, idx, done, active, clicksLeft, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        left: `calc(${rx * 100}vw - 18px)`, top: `calc(${ry * 100}vh - 18px)`,
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
        zIndex: 2010,
        userSelect: 'none',
      }}
    >
      {done ? '✓' : active ? clicksLeft : idx + 1}
    </div>
  );
}

/* ── Camera face-position guide overlay ──────────────────────────*/
// Camera panel base dimensions (used as SVG viewBox units and max pixel size).
// Actual rendered size is viewport-relative: min(280px, 22vw) × min(210px, 16.5vw).
const CAM_W = 280, CAM_H = 210;
// Camera panel uses CSS min(280px, 15vw) × min(210px, 11.25vw) so it stays
// narrower than the first calibration column (rx=0.18) on all screen sizes.
function CamGuide() {
  return (
    <svg
      style={{ position: 'fixed', top: 0, left: 0, width: 'min(280px, 15vw)', height: 'min(210px, 11.25vw)', zIndex: 9900, pointerEvents: 'none' }}
      viewBox={`0 0 ${CAM_W} ${CAM_H}`}
    >
      <defs>
        <mask id="face-oval-mask">
          <rect width={CAM_W} height={CAM_H} fill="white" />
          <ellipse cx={CAM_W / 2} cy={CAM_H / 2 - 5} rx="72" ry="88" fill="black" />
        </mask>
      </defs>
      {/* Dim outside the oval */}
      <rect width={CAM_W} height={CAM_H} fill="rgba(0,0,0,0.38)" mask="url(#face-oval-mask)" />
      {/* Dashed guide oval */}
      <ellipse
        cx={CAM_W / 2} cy={CAM_H / 2 - 5} rx="72" ry="88"
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="2"
        strokeDasharray="8 5"
      />
      {/* Label */}
      <text x={CAM_W / 2} y={CAM_H - 7} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10" fontFamily="Inter, sans-serif">
        centre your face here
      </text>
    </svg>
  );
}

/* ── Face detection badge ────────────────────────────────────────*/
function FaceDetectionBadge({ detected }) {
  return (
    <div className="ete-face-badge">
      <span className={`ete-face-dot ${detected ? 'ete-face-dot--ok' : 'ete-face-dot--no'}`} />
      <span className="ete-face-label">
        {detected ? 'Face detected' : 'No face detected'}
      </span>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────*/
export default function EyeTrackingExperiment() {
  // phase: idle | loading | calibrating | validating | validation_result | pretrial | viewing | comparing | done | error
  const [phase,        setPhase]        = useState('idle');
  const [errorMsg,     setErrorMsg]     = useState('');
  const [calibIdx,     setCalibIdx]     = useState(0);
  const [calibClicks,  setCalibClicks]  = useState(0);
  const [factorIdx,    setFactorIdx]    = useState(0);
  const [variantIdx,   setVariantIdx]   = useState(0);
  const [countdown,    setCountdown]    = useState(5);
  const [gazeDot,      setGazeDot]      = useState(null);
  const [gazeData,     setGazeData]     = useState(() => FACTORS.map(() => [[], []]));
  const [validIdx,     setValidIdx]     = useState(0);
  const [validErrors,  setValidErrors]  = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);

  const trialRef               = useRef(null); // the live trial content div
  const gazeBuffer             = useRef([]);
  const gazeSmoothed           = useRef(null); // EMA-smoothed gaze position

  // Exponential moving average — blends 35% new signal with 65% previous.
  // Lower alpha = smoother but more lag; raise toward 1.0 for raw output.
  const smooth = useCallback((raw) => {
    const ALPHA = 0.35;
    const prev  = gazeSmoothed.current;
    const next  = prev
      ? { x: prev.x + ALPHA * (raw.x - prev.x), y: prev.y + ALPHA * (raw.y - prev.y) }
      : raw;
    gazeSmoothed.current = next;
    return next;
  }, []);
  const timerRef               = useRef(null);
  const cdRef                  = useRef(null);
  const wgRef                  = useRef(null);
  const startValidationPtRef   = useRef(null); // forward ref for recursive scheduling

  /* ── Cleanup on unmount ──────────────────────────────────────── */
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(cdRef.current);
      wgRef.current?.end();
    };
  }, []);


  /* ── Load WebGazer & start camera ────────────────────────────── */
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
      wg.params.showVideoPreview    = true;
      wg.params.showFaceOverlay     = true;
      wg.params.showFaceFeedbackBox = false; // we draw our own face-position guide
      await wg.begin();
      wg.showPredictionPoints(false);
      wg.applyKalmanFilter(true);
      // Reposition the injected video container to the top-left (matching the
      // official WebGazer demo). Size it at a 4:3 ratio so the full feed shows.
      const vid = document.getElementById('webgazerVideoContainer');
      if (vid) {
        Object.assign(vid.style, {
          position:      'fixed',
          top:           '0',
          left:          '0',
          bottom:        'auto',
          right:         'auto',
          width:         'min(280px, 15vw)',
          height:        'min(210px, 11.25vw)',
          borderRadius:  '0 0 10px 0',
          overflow:      'hidden',
          border:        'none',
          borderRight:   '2px solid rgba(255,255,255,0.15)',
          borderBottom:  '2px solid rgba(255,255,255,0.15)',
          zIndex:        '2004',
          display:       'block',
        });
        // Make the video & face-overlay canvas fill the container without cropping
        vid.querySelectorAll('video, canvas').forEach(el => {
          el.style.width    = '100%';
          el.style.height   = '100%';
          el.style.position = 'absolute';
          el.style.top      = '0';
          el.style.left     = '0';
        });
      }
      setPhase('calibrating');
      setCalibIdx(0);
      setCalibClicks(0);
      wg.setGazeListener((data) => {
        setFaceDetected(!!data);
        if (data) setGazeDot(smooth({ x: data.x, y: data.y }));
        else setGazeDot(null);
      });
    } catch (e) {
      setErrorMsg('Could not start camera: ' + (e?.message ?? e));
      setPhase('error');
    }
  }, [loadWG]);

  /* ── Calibration click ───────────────────────────────────────── */
  const handleCalibClick = useCallback(() => {
    const next = calibClicks + 1;
    if (next < CLICKS_PER_DOT) {
      setCalibClicks(next);
    } else {
      const nextDot = calibIdx + 1;
      if (nextDot >= CALIB_PTS.length) {
        // Calibration done → run accuracy validation
        wgRef.current?.clearGazeListener();
        setGazeDot(null);
        setValidErrors([]);
        setPhase('validating');
        setTimeout(() => startValidationPtRef.current?.(0), 400);
      } else {
        setCalibIdx(nextDot);
        setCalibClicks(0);
      }
    }
  }, [calibClicks, calibIdx]);

  /* ── Validation point (auto-timed, recursive via ref) ────────── */
  const startValidationPoint = useCallback((idx) => {
    setValidIdx(idx);
    const buf = [];

    wgRef.current?.setGazeListener((data) => {
      setFaceDetected(!!data);
      if (data) {
        const s = smooth({ x: data.x, y: data.y });
        setGazeDot(s);
        buf.push(s);
      } else {
        setGazeDot(null);
      }
    });

    timerRef.current = setTimeout(() => {
      wgRef.current?.clearGazeListener();
      setGazeDot(null);

      const pt = VALID_PTS[idx];
      const cx = pt.rx * window.innerWidth;
      const cy = pt.ry * window.innerHeight;

      const err = buf.length === 0
        ? 999
        : Math.hypot(
            buf.reduce((s, p) => s + p.x, 0) / buf.length - cx,
            buf.reduce((s, p) => s + p.y, 0) / buf.length - cy,
          );

      setValidErrors(prev => [...prev, err]);

      if (idx + 1 < VALID_PTS.length) {
        timerRef.current = setTimeout(() => startValidationPtRef.current?.(idx + 1), 450);
      } else {
        setPhase('validation_result');
      }
    }, VALID_MS);
  }, []); // stable: only refs and stable setState calls

  useEffect(() => {
    startValidationPtRef.current = startValidationPoint;
  }, [startValidationPoint]);

  /* ── Recalibrate ─────────────────────────────────────────────── */
  const handleRecalibrate = useCallback(() => {
    clearTimeout(timerRef.current);
    wgRef.current?.clearData?.(); // reset WebGazer's training data
    setPhase('calibrating');
    setCalibIdx(0);
    setCalibClicks(0);
    setValidErrors([]);
    // Re-show camera preview
    const vid = document.getElementById('webgazerVideoContainer');
    if (vid) vid.style.display = 'block';

    // Re-enable mouse event listeners so click training works during recalibration
    wgRef.current?.addMouseEventListeners?.();
    wgRef.current?.setGazeListener((data) => {
      setFaceDetected(!!data);
      if (data) setGazeDot(smooth({ x: data.x, y: data.y }));
      else setGazeDot(null);
    });
  }, [smooth]);

  /* ── Start a viewing trial ───────────────────────────────────── */
  const startViewing = useCallback(() => {
    gazeBuffer.current = [];
    setPhase('viewing');
    setCountdown(Math.ceil(TRIAL_MS / 1000));

    // Hide camera preview during trials — it would distract from gaze recording
    const vid = document.getElementById('webgazerVideoContainer');
    if (vid) vid.style.display = 'none';

    // Stop WebGazer from treating mouse movement as gaze training data.
    // Without this, moving the mouse shifts the gaze prediction even if
    // the user's eyes haven't moved.
    wgRef.current?.removeMouseEventListeners?.();

    wgRef.current?.setGazeListener((data) => {
      if (!data) return;
      const el = trialRef.current;
      if (!el) return;
      const s    = smooth({ x: data.x, y: data.y });
      const rect = el.getBoundingClientRect();
      const lx = s.x - rect.left;
      const ly = s.y - rect.top;
      setGazeDot(s);
      if (lx >= 0 && lx <= rect.width && ly >= 0 && ly <= rect.height) {
        // Store as 0-1 fractions so they scale correctly to any result canvas size
        gazeBuffer.current.push({ x: lx / rect.width, y: ly / rect.height });
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
        setVariantIdx(1);
        setPhase('pretrial');
      } else {
        setPhase('comparing');
      }
    }, TRIAL_MS);
  }, [factorIdx, variantIdx, smooth]);

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
  const showFaceBadge = phase === 'loading' || phase === 'calibrating' || phase === 'validating';

  /* ── Validation result helpers ───────────────────────────────── */
  const validAvg = (() => {
    const finite = validErrors.filter(e => e < 999);
    return finite.length ? finite.reduce((s, e) => s + e, 0) / finite.length : 999;
  })();
  const validRating = validAvg < VALID_GOOD_PX ? 'Good' : validAvg < VALID_FAIR_PX ? 'Fair' : 'Poor';
  const validRatingColor = { Good: '#3ddc84', Fair: '#f0a500', Poor: '#d4553a' }[validRating];

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
                  <ResultCard key={vi} content={v.content} gazePoints={gazeData[fi][vi]} label={v.label} />
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

      {/* CamGuide sits outside the overlay so its z-index is in the root stacking
          context and can exceed the WebGazer video container (z-index 2004). */}
      {(phase === 'calibrating' || phase === 'validating') && <CamGuide />}

      {/* ── Fullscreen overlay ─────────────────────────────────── */}
      {isOverlay && (
        <div className="ete-overlay">

          {/* ── Face detection badge (option 6) ────────────────── */}
          {showFaceBadge && <FaceDetectionBadge detected={faceDetected} />}

          {/* Loading */}
          {phase === 'loading' && (
            <div className="ete-centre-box">
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
              <p style={{ color: '#fff', fontFamily: "'Inter', sans-serif" }}>Starting camera…</p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontFamily: "'Inter', sans-serif", marginTop: 8 }}>
                Watch the badge in the top-right corner — it turns green once your face is detected.
              </p>
            </div>
          )}

          {/* Calibration */}
          {phase === 'calibrating' && (
            <>
              <div className="ete-calib-instructions">
                <strong>Calibration</strong>&nbsp;—&nbsp;
                Look at each red dot, then click it {CLICKS_PER_DOT} times.&nbsp;
                ({calibIdx + 1}&nbsp;/&nbsp;{CALIB_PTS.length})
              </div>
              {/* Camera preview label — sits above the WebGazer video container */}
              <div className="ete-cam-label">
                <span className="ete-cam-label-icon">📷</span>
                Keep your face centred in the box
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
                <div className="ete-gaze-cursor" style={{ left: gazeDot.x - 8, top: gazeDot.y - 8 }} />
              )}
            </>
          )}

          {/* ── Validation phase (option 1) ──────────────────────*/}
          {phase === 'validating' && (
            <>
              <div className="ete-calib-instructions">
                <strong>Accuracy check</strong>&nbsp;—&nbsp;
                Look at the dot and hold still. ({validIdx + 1}&nbsp;/&nbsp;{VALID_PTS.length})
              </div>
              <div className="ete-cam-label">
                <span className="ete-cam-label-icon">📷</span>
                Keep your face centred in the box
              </div>
              {/* Validation dot — key forces animation restart on each point */}
              <div
                key={`vdot-${validIdx}`}
                className="ete-valid-dot"
                style={{
                  left: `calc(${VALID_PTS[validIdx].rx * 100}vw - 20px)`,
                  top:  `calc(${VALID_PTS[validIdx].ry * 100}vh - 20px)`,
                  animationDuration: `${VALID_MS}ms`,
                }}
              />
              {/* Progress bar draining left-to-right */}
              <div className="ete-valid-progress-track">
                <div
                  key={`vprog-${validIdx}`}
                  className="ete-valid-progress-bar"
                  style={{ animationDuration: `${VALID_MS}ms` }}
                />
              </div>
              {gazeDot && (
                <div className="ete-gaze-cursor" style={{ left: gazeDot.x - 8, top: gazeDot.y - 8 }} />
              )}
            </>
          )}

          {/* ── Validation result (option 1) ─────────────────────*/}
          {phase === 'validation_result' && (
            <div className="ete-centre-box" style={{ maxWidth: 480, gap: 18 }}>
              <div style={{ fontSize: '1.5rem' }}>🎯</div>
              <h3 style={{ color: '#fff', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                Calibration Accuracy
              </h3>
              {/* Per-point coloured dots */}
              <div className="ete-valid-dots-row">
                {validErrors.map((err, i) => {
                  const col = err >= 999
                    ? '#777'
                    : err < VALID_GOOD_PX  ? '#3ddc84'
                    : err < VALID_FAIR_PX  ? '#f0a500'
                    :                        '#d4553a';
                  return (
                    <div key={i} className="ete-valid-result-item">
                      <div className="ete-valid-result-dot" style={{ background: col }}>
                        {err >= 999 ? '?' : Math.round(err)}
                      </div>
                      <span className="ete-valid-result-label">pt {i + 1}</span>
                    </div>
                  );
                })}
              </div>
              {/* Summary */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.05rem', fontFamily: "'Inter', sans-serif", color: validRatingColor, fontWeight: 700 }}>
                  {validRating} — avg {validAvg < 999 ? Math.round(validAvg) : '?'} px error
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', sans-serif", marginTop: 6, maxWidth: 360 }}>
                  {validRating === 'Poor'
                    ? 'Accuracy is low — recalibrating should improve gaze data quality.'
                    : validRating === 'Fair'
                    ? 'Accuracy is acceptable. You can proceed or recalibrate for better results.'
                    : 'Great accuracy! Your eye tracking is ready.'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button className="btn btn-secondary" onClick={handleRecalibrate}>
                  Recalibrate
                </button>
                <button className="btn btn-primary" onClick={() => {
                  const vid = document.getElementById('webgazerVideoContainer');
                  if (vid) vid.style.display = 'none';
                  setPhase('pretrial');
                  setFactorIdx(0);
                  setVariantIdx(0);
                }}>
                  Start experiment →
                </button>
              </div>
            </div>
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
              <div ref={trialRef} className="ete-trial-content">
                {FACTORS[factorIdx].variants[variantIdx].content()}
              </div>
              {gazeDot && (
                <div style={{
                  position: 'fixed',
                  left: gazeDot.x - 10, top: gazeDot.y - 10,
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: 'rgba(212,85,58,0.25)',
                  border: '2px solid rgba(212,85,58,0.9)',
                  boxShadow: '0 0 8px rgba(212,85,58,0.5)',
                  pointerEvents: 'none',
                  zIndex: 3003,
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
                    <ResultCard
                      content={v.content}
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
