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

/* Simulated product dashboard screenshot */
const TpDashboard = ({ style }) => (
  <div className="tp-img" style={{ background: '#1b2130', borderRadius: 10, overflow: 'hidden', padding: 14, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
    <div style={{ display: 'flex', gap: 8 }}>
      {[['Tasks due', '12', '#3ddc84'], ['In progress', '7', '#f0a500'], ['Completed', '34', '#4a9eff']].map(([lbl, val, c]) => (
        <div key={lbl} style={{ flex: 1, background: c + '18', border: `1px solid ${c}33`, borderRadius: 6, padding: '7px 10px' }}>
          <div style={{ fontSize: '0.6rem', color: c + 'cc', marginBottom: 3 }}>{lbl}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: c }}>{val}</div>
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 8, flex: 1 }}>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[['Design review', '#3ddc84', '85%'], ['API integration', '#f0a500', '52%'], ['User testing', '#4a9eff', '30%'], ['Documentation', '#d4553a', '68%']].map(([t, c, w]) => (
          <div key={t} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 5, padding: '6px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.7)' }}>{t}</span>
              <span style={{ fontSize: '0.58rem', color: c }}>{w}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <div style={{ width: w, height: '100%', background: c, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 3 }}>
        {[60, 80, 45, 90, 55, 70].map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
            <div style={{ flex: 1, height: h * 0.7, background: '#3ddc8444', borderRadius: '2px 2px 0 0', borderTop: '2px solid #3ddc84' }} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* Simulated editorial photo */
const TpPhoto = ({ style, caption = 'Remote team collaboration' }) => (
  <div className="tp-img" style={{ background: 'linear-gradient(135deg, #1a3a4a 0%, #2d6a8a 45%, #4a9eb5 100%)', position: 'relative', overflow: 'hidden', ...style }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 18px,rgba(255,255,255,0.15) 18px,rgba(255,255,255,0.15) 19px),repeating-linear-gradient(90deg,transparent,transparent 18px,rgba(255,255,255,0.15) 18px,rgba(255,255,255,0.15) 19px)' }} />
    <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10, background: 'rgba(0,0,0,0.45)', borderRadius: 4, padding: '3px 8px', fontSize: '0.62rem', color: 'rgba(255,255,255,0.85)' }}>📷 {caption}</div>
  </div>
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
                <p className="tp-body">Whether you manage a product team, a marketing squad, or a fully remote engineering group, Focusly adapts to your workflow. Used by over 14,000 teams at companies like Spotify, Notion, and Stripe.</p>
                <button className="tp-btn tp-btn-green tp-cta">Get Started Free →</button>
                <p className="tp-fine">Free for 30 days · No credit card required</p>
              </div>
              <div className="tp-hero-right">
                <TpDashboard />
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
                <p className="tp-body">Whether you manage a product team, a marketing squad, or a fully remote engineering group, Focusly adapts to your workflow. Used by over 14,000 teams at companies like Spotify, Notion, and Stripe.</p>
                <button className="tp-btn tp-btn-green tp-cta">Get Started Free →</button>
                <p className="tp-fine">Free for 30 days · No credit card required</p>
              </div>
              <div className="tp-hero-right">
                <TpDashboard />
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
                <p className="tp-body">Stop losing context across email threads and chat messages. Focusly keeps every decision, file, and update linked to the work it belongs to. Trusted by 14,000+ teams worldwide.</p>
                <button className="tp-btn tp-btn-green tp-cta">Start for free →</button>
                <p className="tp-fine">No credit card · Cancel anytime</p>
              </div>
              <div className="tp-hero-right">
                <TpDashboard />
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
                <p className="tp-body">Stop losing context across email threads and chat messages. Focusly keeps every decision, file, and update linked to the work it belongs to. Trusted by 14,000+ teams worldwide.</p>
                <button className="tp-btn tp-btn-warm tp-cta">Start for free →</button>
                <p className="tp-fine">No credit card · Cancel anytime</p>
              </div>
              <div className="tp-hero-right">
                <TpDashboard />
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
                  <p className="tp-body">The key is structured communication: instead of defaulting to "let's jump on a call," async-native teams invest in clear written documentation and recorded video updates that anyone can revisit across time zones.</p>
                </div>
                <TpPhoto style={{ width: 130, height: 97, flexShrink: 0 }} caption="Team at work" />
              </div>
              <p className="tp-body">This guide covers the five pillars of a high-functioning async culture: clear written communication, reliable documentation, structured check-ins, outcome-based management, and shared tooling that respects every time zone.</p>
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
              <TpPhoto style={{ width: '100%', aspectRatio: '16/6', marginBottom: 20 }} caption="Remote team collaboration" />
              <p className="tp-body">Async-first teams consistently outperform synchronous ones on project delivery speed, employee satisfaction, and meeting overhead reduction. The shift isn't easy — but the payoff is significant.</p>
              <p className="tp-body">The key is structured communication: instead of defaulting to "let's jump on a call," async-native teams invest in clear written documentation and recorded video updates that anyone can revisit across time zones.</p>
              <p className="tp-body">This guide covers the five pillars of a high-functioning async culture: clear written communication, reliable documentation, structured check-ins, outcome-based management, and shared tooling that respects every time zone.</p>
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
            <div style={{ display: 'flex', gap: 24 }}>
              <div className="tp-article" style={{ flex: 1, minWidth: 0 }}>
                <div className="tp-article-meta">Technology › Remote Work</div>
                <h1 className="tp-headline-article" style={{ fontSize: '1.7rem' }}>How AI Is Reshaping the Way Remote Teams Work Together</h1>
                <p className="tp-byline">By Sarah Chen · March 14, 2026 · 5 min read</p>
                <p className="tp-body">In 2024, remote and hybrid work crossed a new milestone — over 40% of knowledge workers globally operated outside a traditional office for the majority of their workday. But the bigger shift wasn't geographic; it was cognitive.</p>
                <p className="tp-body">AI-powered tools now draft meeting summaries, flag at-risk tasks, resolve scheduling conflicts, and write first-draft status updates. For distributed teams, the effect is transformative: coordination overhead drops, and the time saved goes toward actual work.</p>
                <blockquote className="tp-pullquote">"The best async tools don't just record what happened — they surface what matters." — Dr. Ana Reyes, Future of Work Institute</blockquote>
                <p className="tp-body">A 2025 Gartner study found that teams using AI-augmented project tools reduced internal meeting time by an average of 34%, without a measurable decline in alignment or output quality.</p>
              </div>
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
                <p className="tp-body">AI-powered tools now draft meeting summaries, flag at-risk tasks, resolve scheduling conflicts, and write first-draft status updates. For distributed teams, the effect is transformative: coordination overhead drops, and the time saved goes toward actual work.</p>
                <blockquote className="tp-pullquote">"The best async tools don't just record what happened — they surface what matters." — Dr. Ana Reyes, Future of Work Institute</blockquote>
                <p className="tp-body">A 2025 Gartner study found that teams using AI-augmented project tools reduced internal meeting time by an average of 34%, without a measurable decline in alignment or output quality.</p>
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
const VALID_MS       = 2200;  // ms to collect gaze samples per validation point
const VALID_SETTLE   = 600;   // ms to discard at start (saccade + settling time)
const VALID_GOOD_PX  = 120;   // avg error < this → "Good"
const VALID_FAIR_PX  = 200;   // avg error < this → "Fair", else "Poor"

/* ── Heatmap drawing ───────────────────────────────────────────── */
function drawHeatmap(ctx, pts, cw, ch) {
  if (!pts.length) return;
  const off = document.createElement('canvas');
  off.width = cw; off.height = ch;
  const oc = off.getContext('2d');
  const r = Math.max(cw, ch) * 0.055;
  // pts are stored as 0-1 fractions — filter out invalid values before scaling
  const validPts = pts.filter(({ x, y }) => isFinite(x) && isFinite(y) && x >= 0 && x <= 1 && y >= 0 && y <= 1);
  if (!validPts.length) return;
  validPts.forEach(({ x, y }) => {
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
  validPts.forEach(({ x, y }) => {
    const px = x * cw, py = y * ch;
    ctx.fillStyle = 'rgba(255,60,0,0.7)';
    ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}

/* ── Result card: scaled HTML content + heatmap overlay ──────────*/
const CONTENT_W  = 900;  // matches tp-page max-width
const THUMB_H    = 280;  // cropped thumbnail height

/* Full-size heatmap canvas rendered inside the modal */
function ModalHeatmap({ gazePoints }) {
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const w   = wrap.offsetWidth;
    const h   = wrap.offsetHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawHeatmap(ctx, gazePoints, w, h);
  }, [gazePoints]);
  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
}

function ResultCard({ content, gazePoints, label }) {
  const containerRef = useRef(null);
  const contentRef   = useRef(null);
  const canvasRef    = useRef(null);
  // dims.scale > 0 means phase 2 (measured); dims.height is the final px height
  const [dims, setDims] = useState({ scale: 0, height: 0 });
  const [modalOpen, setModalOpen] = useState(false);

  // Phase 1 → Phase 2: measure natural content height then apply scale
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;
    const w       = containerRef.current.offsetWidth;
    const scale   = w / CONTENT_W;
    const naturalH = contentRef.current.offsetHeight;
    setDims({ scale, height: Math.round(naturalH * scale) });
  }, []);

  // Close modal on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setModalOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  // Redraw heatmap whenever gaze data or dims change
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || dims.scale === 0) return;
    const w   = container.offsetWidth;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = w * dpr;
    canvas.height = THUMB_H * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = THUMB_H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Use the full scaled content height (dims.height) so gaze y-fractions map to
    // the same positions as in the modal. The canvas is cropped to THUMB_H, so
    // gaze points in the cut-off portion simply don't appear — which is correct.
    drawHeatmap(ctx, gazePoints, w, dims.height);
  }, [gazePoints, dims]);

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="ete-variant-label">{label}</div>
      <div
        ref={containerRef}
        onClick={() => dims.scale > 0 && setModalOpen(true)}
        style={{
          position: 'relative',
          height: THUMB_H,
          overflow: 'hidden',
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e8e8e8',
          cursor: dims.scale > 0 ? 'pointer' : 'default',
        }}
      >
        {/* Phase 1: invisible render at full width so we can measure natural height.
            Phase 2: scaled to fit the container width. */}
        <div
          ref={contentRef}
          style={{
            width: CONTENT_W,
            transformOrigin: 'top left',
            transform: dims.scale > 0 ? `scale(${dims.scale})` : undefined,
            visibility: dims.scale > 0 ? 'visible' : 'hidden',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {content()}
        </div>
        {/* Heatmap drawn on a transparent canvas on top */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      </div>
      <div className="ete-gaze-count">{gazePoints.length} gaze samples</div>

      {/* ── Lightbox modal ── */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9990,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              position: 'relative', maxWidth: CONTENT_W, width: '100%',
              maxHeight: '90vh', overflowY: 'auto',
              borderRadius: 12, background: '#fff',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'sticky', top: 10, float: 'right', marginRight: 10,
                background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff',
                borderRadius: '50%', width: 32, height: 32,
                cursor: 'pointer', fontSize: '1rem', zIndex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
            {/* Full-size content with heatmap overlay */}
            <div style={{ position: 'relative', userSelect: 'none', pointerEvents: 'none' }}>
              {content()}
              <ModalHeatmap gazePoints={gazePoints} />
            </div>
          </div>
        </div>
      )}
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
        left: `calc(${rx * 100}vw - 22px)`, top: `calc(${ry * 100}vh - 22px)`,
        width: 45, height: 45,
        borderRadius: '50%',
        background: done ? '#1a8a6a' : active ? '#d4553a' : '#ccc',
        border: `3px solid ${done ? '#0e5c48' : active ? '#a33' : '#999'}`,
        cursor: active ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '0.82rem', fontWeight: 700,
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

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Celebration overlay ─────────────────────────────────────────*/
function CelebrationOverlay({ onComplete }) {
  const canvasRef = useRef(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Confetti particles
    const COLORS = ['#1a8a6a', '#3ddc84', '#f0a500', '#4a9eff', '#d4553a', '#6b5ca5', '#c4960c', '#ff6b9d'];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.1 + 0.03,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.wobble) * 0.8;
        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotSpeed;
        p.vy += 0.04; // gravity
        if (p.y > H + 20) {
          p.y = Math.random() * -40;
          p.x = Math.random() * W;
          p.vy = Math.random() * 3 + 2;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    // Start fade-out after 2.8s, call onComplete after 3.5s
    const fadeTimer = setTimeout(() => setFadeOut(true), 2000);
    const doneTimer = setTimeout(() => onComplete(), 2500);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div className={`ete-celebration${fadeOut ? ' ete-celebration--fade' : ''}`}>
      <canvas ref={canvasRef} className="ete-celebration-canvas" />
      <div className="ete-celebration-content">
        <div className="ete-celebration-emoji">🎉</div>
        <h2 className="ete-celebration-title">Experiment Complete!</h2>
        <p className="ete-celebration-sub">Great job — let&apos;s see how your eyes explored the designs.</p>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────*/
export default function EyeTrackingExperiment() {
  // phase: idle | loading | calibrating | pre_validation | validating | validation_result | pretrial | viewing | celebrating | done | error
  const [phase,        setPhase]        = useState(() => {
    try {
      const saved = localStorage.getItem('ete-gaze-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === FACTORS.length && parsed.some(f => f.some(v => v.length > 0))) {
          return 'done';
        }
      }
    } catch { /* ignore */ }
    return 'idle';
  });
  const [errorMsg,     setErrorMsg]     = useState('');
  const [calibIdx,     setCalibIdx]     = useState(0);
  const [calibClicks,  setCalibClicks]  = useState(0);
  const [calibCooldown, setCalibCooldown] = useState(false); // brief delay between clicks
  const allTrials = FACTORS.flatMap((f, fi) => f.variants.map((_, vi) => ({ fi, vi })));
  const [trialList, setTrialList] = useState(() => shuffled(allTrials));
  const [trialStep, setTrialStep] = useState(0);
  const [countdown,    setCountdown]    = useState(5);
  const [gazeDot,      setGazeDot]      = useState(null);
  const [gazeData,     setGazeData]     = useState(() => {
    try {
      const saved = localStorage.getItem('ete-gaze-data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === FACTORS.length) return parsed;
      }
    } catch { /* ignore */ }
    return FACTORS.map(() => [[], []]);
  });
  const [validIdx,     setValidIdx]     = useState(0);
  const [validErrors,  setValidErrors]  = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const [openFactors,  setOpenFactors]  = useState(new Set([0])); // first tab open by default

  // Persist gaze data to localStorage so results survive a page reload
  useEffect(() => {
    const hasData = gazeData.some(f => f.some(v => v.length > 0));
    if (hasData) {
      try { localStorage.setItem('ete-gaze-data', JSON.stringify(gazeData)); } catch { /* ignore */ }
    }
  }, [gazeData]);

  const trialRef               = useRef(null); // the live trial content div
  const gazeBuffer             = useRef([]);
  const gazeSmoothed           = useRef(null); // EMA-smoothed gaze position

  // Exponential moving average — blends 35% new signal with 65% previous.
  // Lower alpha = smoother but more lag; raise toward 1.0 for raw output.
  const smooth = useCallback((raw) => {
    if (!raw || !isFinite(raw.x) || !isFinite(raw.y)) return gazeSmoothed.current;
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

  /* ── Stop camera stream & WebGazer ──────────────────────────── */
  const stopCamera = useCallback(() => {
    wgRef.current?.clearGazeListener();
    wgRef.current?.end();
    // WebGazer's end() doesn't always release the MediaStream, so stop
    // the tracks directly so the browser camera indicator turns off.
    const vid = document.querySelector('#webgazerVideoContainer video');
    if (vid?.srcObject) {
      vid.srcObject.getTracks().forEach(t => t.stop());
      vid.srcObject = null;
    }
    const container = document.getElementById('webgazerVideoContainer');
    if (container) container.style.display = 'none';
  }, []);

  /* ── Cleanup on unmount ──────────────────────────────────────── */
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(cdRef.current);
      stopCamera();
    };
  }, [stopCamera]);


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
    setTrialList(shuffled(allTrials));
    setTrialStep(0);
    setGazeData(FACTORS.map(() => [[], []]));
    setPhase('loading');
    try {
      const wg = await loadWG();
      wgRef.current = wg;
      wg.params.showVideoPreview    = true;
      wg.params.showFaceOverlay     = true;
      wg.params.showFaceFeedbackBox = false; // we draw our own face-position guide
      wg.setRegression('ridge');
      await wg.begin();
      wg.showPredictionPoints(false);
      // NOTE: Kalman filter is applied AFTER calibration (in handleCalibClick)
      // to avoid smoothing-lag from degrading the training click positions.
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
  }, [loadWG, allTrials, smooth]);

  /* ── Calibration click ───────────────────────────────────────── */
  const handleCalibClick = useCallback(() => {
    if (calibCooldown) return; // ignore rapid-fire clicks
    const next = calibClicks + 1;
    if (next < CLICKS_PER_DOT) {
      setCalibClicks(next);
      // Enforce a short cooldown so each click captures a distinct gaze frame
      setCalibCooldown(true);
      setTimeout(() => setCalibCooldown(false), 200);
    } else {
      const nextDot = calibIdx + 1;
      if (nextDot >= CALIB_PTS.length) {
        // Calibration done — enable Kalman filter now that training is complete
        wgRef.current?.applyKalmanFilter(true);
        wgRef.current?.clearGazeListener();
        setGazeDot(null);
        setValidErrors([]);
        setPhase('pre_validation');
      } else {
        setCalibIdx(nextDot);
        setCalibClicks(0);
        setCalibCooldown(true);
        setTimeout(() => setCalibCooldown(false), 200);
      }
    }
  }, [calibClicks, calibIdx, calibCooldown]);

  /* ── Validation point (auto-timed, recursive via ref) ────────── */
  const startValidationPoint = useCallback((idx) => {
    setValidIdx(idx);
    gazeSmoothed.current = null; // reset EMA so previous position doesn't pull avg
    const buf = [];
    const t0 = performance.now();

    wgRef.current?.setGazeListener((data) => {
      setFaceDetected(!!data);
      if (data) {
        const s = smooth({ x: data.x, y: data.y });
        setGazeDot(s);
        // Only keep samples after the settling period (saccade + Kalman lag)
        if (performance.now() - t0 >= VALID_SETTLE) buf.push(s);
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
      setValidIdx(-1);  // hide dot during the gap so next dot + progress bar mount together

      if (idx + 1 < VALID_PTS.length) {
        timerRef.current = setTimeout(() => startValidationPtRef.current?.(idx + 1), 450);
      } else {
        setPhase('validation_result');
      }
    }, VALID_MS);
  }, [smooth]);

  useEffect(() => {
    startValidationPtRef.current = startValidationPoint;
  }, [startValidationPoint]);

  /* ── Recalibrate ─────────────────────────────────────────────── */
  const handleRecalibrate = useCallback(() => {
    clearTimeout(timerRef.current);
    wgRef.current?.clearData?.(); // reset WebGazer's training data
    wgRef.current?.applyKalmanFilter(false); // disable filter during recalibration
    setPhase('calibrating');
    setCalibIdx(0);
    setCalibClicks(0);
    setCalibCooldown(false);
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

  /* ── Randomised trial lookup ─────────────────────────────────── */
  const { fi: actualFi, vi: actualVi } = trialList[trialStep] ?? { fi: 0, vi: 0 };
  const F = FACTORS[actualFi];

  /* ── Start a viewing trial ───────────────────────────────────── */
  const startViewing = useCallback(() => {
    gazeBuffer.current = [];
    // Reset EMA so stale positions from calibration/validation don't bleed in
    gazeSmoothed.current = null;
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
        next[actualFi][actualVi] = pts;
        return next;
      });
      const nextStep = trialStep + 1;
      if (nextStep >= trialList.length) {
        setPhase('celebrating');
        stopCamera();
      } else {
        setTrialStep(nextStep);
        setPhase('pretrial');
      }
    }, TRIAL_MS);
  }, [trialStep, trialList, smooth, actualFi, actualVi, stopCamera]);

  /* ── Overlay backdrop ────────────────────────────────────────── */
  const isOverlay = phase !== 'idle' && phase !== 'error' && phase !== 'done' && phase !== 'celebrating';
  const showFaceBadge = phase === 'loading' || phase === 'calibrating' || phase === 'pre_validation' || phase === 'validating';

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
            <span>⏱ 5-7 minutes to complete</span>
          </div>
          {/* Desktop-only gate */}
          <div className="ete-mobile-notice">
            <span style={{ fontSize: '1.2rem' }}>🖥️</span>
            <span>This experiment requires a desktop browser with a webcam. Please visit on a laptop or desktop computer.</span>
          </div>
          <button className="btn btn-primary ete-desktop-only" style={{ marginTop: 20 }} onClick={startWebGazer}>
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

      {/* Celebration overlay */}
      {phase === 'celebrating' && <CelebrationOverlay onComplete={() => {
        setPhase('done');
        // Scroll to the experiment section after a brief delay for render
        setTimeout(() => {
          const el = document.querySelector('.ete-wrapper');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }} />}

      {/* Done summary */}
      {phase === 'done' && (
        <div className="ete-done-card">
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎉</div>
          <h3 style={{ fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>Experiment Complete!</h3>
          {FACTORS.map((f, fi) => {
            const isOpen = openFactors.has(fi);
            const toggle = () => setOpenFactors(prev => {
              const next = new Set(prev);
              next.has(fi) ? next.delete(fi) : next.add(fi);
              return next;
            });
            return (
              <div key={fi} className="ete-result-block">
                <button className="ete-result-header" onClick={toggle} aria-expanded={isOpen}>
                  <span>{f.icon}</span>
                  <strong style={{ fontFamily: "'Inter', sans-serif" }}>{f.name}</strong>
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.6, display: 'inline-block', transition: 'transform 200ms ease', transform: isOpen ? 'rotate(-90deg)' : 'none' }}>
                    &#x25C0;
                  </span>
                </button>
                {isOpen && (
                  <>
                    <div className="ete-result-row">
                      {f.variants.map((v, vi) => (
                        <ResultCard key={vi} content={v.content} gazePoints={gazeData[fi][vi]} label={v.label} />
                      ))}
                    </div>
                    <p className="ete-insight-text">💡 {f.insight}</p>
                  </>
                )}
              </div>
            );
          })}
          <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => {
            setPhase('idle');
            setGazeData(FACTORS.map(() => [[], []]));
            try { localStorage.removeItem('ete-gaze-data'); } catch { /* ignore */ }
          }}>
            Reset experiment
          </button>
        </div>
      )}

      {/* CamGuide sits outside the overlay so its z-index is in the root stacking
          context and can exceed the WebGazer video container (z-index 2004). */}
      {(phase === 'calibrating' || phase === 'pre_validation' || phase === 'validating') && <CamGuide />}

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

          {/* ── Pre-validation instruction ─────────────────────*/}
          {phase === 'pre_validation' && (
            <div className="ete-centre-box" style={{ maxWidth: 440, gap: 14 }}>
              <div style={{ fontSize: '1.5rem' }}>✅</div>
              <h3 style={{ color: '#fff', margin: 0, fontFamily: "'Inter', sans-serif" }}>
                Calibration Complete
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                Next, we'll check accuracy. A <strong style={{ color: '#60a5fa' }}>blue dot</strong> will appear at {VALID_PTS.length} positions —
                <strong style={{ color: 'rgba(255,255,255,0.85)' }}> just look at each dot</strong> and
                hold your gaze steady. <strong style={{ color: 'rgba(255,255,255,0.85)' }}>No clicking needed</strong> — the dot will advance automatically.
              </p>
              <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => {
                setValidIdx(-1);    // sentinel: dot hidden until startValidationPoint sets it to 0
                setPhase('validating');
                setTimeout(() => startValidationPtRef.current?.(0), 400);
              }}>
                Start accuracy check
              </button>
            </div>
          )}

          {/* ── Validation phase (option 1) ──────────────────────*/}
          {phase === 'validating' && (
            <>
              <div className="ete-calib-instructions">
                <strong>Accuracy check</strong>&nbsp;—&nbsp;
                {validIdx >= 0
                  ? <>Look at the <span style={{ color: '#60a5fa' }}>blue dot</span> and hold still (no clicking). ({validIdx + 1}&nbsp;/&nbsp;{VALID_PTS.length})</>
                  : <>Get ready…</>}
              </div>
              <div className="ete-cam-label">
                <span className="ete-cam-label-icon">📷</span>
                Keep your face centred in the box
              </div>
              {/* Dot + progress bar only mount once startValidationPoint has set
                  validIdx, so the CSS animation and JS timer start in sync. */}
              {validIdx >= 0 && validIdx < VALID_PTS.length && (
                <>
                  <div
                    key={`vdot-${validIdx}`}
                    className="ete-valid-dot"
                    style={{
                      left: `calc(${VALID_PTS[validIdx].rx * 100}vw - 20px)`,
                      top:  `calc(${VALID_PTS[validIdx].ry * 100}vh - 20px)`,
                      animationDuration: `${VALID_MS}ms`,
                    }}
                  />
                  <div className="ete-valid-progress-track">
                    <div
                      key={`vprog-${validIdx}`}
                      className="ete-valid-progress-bar"
                      style={{ animationDuration: `${VALID_MS}ms` }}
                    />
                  </div>
                </>
              )}
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
                  setTrialStep(0);
                }}>
                  Start experiment →
                </button>
              </div>
            </div>
          )}

          {/* Pre-trial instruction */}
          {phase === 'pretrial' && (
            <div className="ete-centre-box">
              <div className="ete-factor-label">
                Trial {trialStep + 1} of {trialList.length}
              </div>
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
                  Trial {trialStep + 1} of {trialList.length}
                </span>
                <span className="ete-countdown-badge">{countdown}s</span>
              </div>
              <div ref={trialRef} className="ete-trial-content">
                {F.variants[actualVi].content()}
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


        </div>
      )}
    </div>
  );
}
