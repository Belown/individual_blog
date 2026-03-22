import { useEffect, useRef, useState } from 'react';
import { getCanvasColors } from '../../utils/scenewalkSimulator';
import './IntroSection.css';

/* ── Scanpath visualization for hero ───────────────────────────── */
const FIXATIONS = [
  { x: 170, y: 36  },   // nav / logo
  { x: 108, y: 108 },   // hero image
  { x: 252, y: 108 },   // sidebar
  { x: 130, y: 175 },   // body text
  { x:  60, y: 218 },   // CTA button
  { x: 210, y: 162 },   // more text
  { x: 170, y: 36  },   // back to nav
];
const DWELL_MS   = 1100;  // time spent fixating at each point
const SACCADE_MS =  480;  // time for each jump between points
const STEP_MS    = DWELL_MS + SACCADE_MS;
const CYCLE_MS   = STEP_MS * FIXATIONS.length;

// Time-based: ts is the requestAnimationFrame DOMHighResTimeStamp
function getGaze(ts) {
  const t       = ts % CYCLE_MS;
  const stepIdx = Math.floor(t / STEP_MS) % FIXATIONS.length;
  const stepT   = t - stepIdx * STEP_MS;
  const cur     = FIXATIONS[stepIdx];
  const nxt     = FIXATIONS[(stepIdx + 1) % FIXATIONS.length];

  if (stepT <= DWELL_MS) {
    return { x: cur.x, y: cur.y, fixing: true };
  }
  const s    = (stepT - DWELL_MS) / SACCADE_MS;
  const ease = s < 0.5 ? 4*s*s*s : 1 - Math.pow(-2*s + 2, 3) / 2;
  return { x: cur.x + (nxt.x - cur.x) * ease, y: cur.y + (nxt.y - cur.y) * ease, fixing: false };
}

function ScanpathViz() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = 340, H = 270;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const accent = '#1a8a6a';
    // trail stores {x, y, ts} — faded by elapsed time, not frame count
    const TRAIL_FADE_MS = 2200;
    let trail = [], animId;

    const rr = (x, y, w, h, r) => {
      ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    };

    const draw = (ts) => {
      const c = getCanvasColors();
      ctx.clearRect(0, 0, W, H);

      // ── Wireframe ─────────────────────────────────────────────
      // Nav bar
      ctx.fillStyle = c.navBg; ctx.strokeStyle = c.navBorder; ctx.lineWidth = 1;
      rr(16, 16, 308, 30, 4); ctx.fill(); ctx.stroke();
      // Nav logo pill
      ctx.fillStyle = c.navLogo; rr(24, 23, 48, 16, 3); ctx.fill();
      // Nav links
      [82, 104, 126].forEach(x => { ctx.fillStyle = c.navLink; rr(x, 26, 16, 10, 2); ctx.fill(); });

      // Hero image block
      ctx.fillStyle = c.heroBg; ctx.strokeStyle = c.heroBorder;
      rr(16, 56, 185, 90, 5); ctx.fill(); ctx.stroke();
      // Image placeholder X lines
      ctx.strokeStyle = c.heroBorder; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(16, 56); ctx.lineTo(201, 146); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(201, 56); ctx.lineTo(16, 146); ctx.stroke();

      // Sidebar
      ctx.fillStyle = c.sidebarBg; ctx.strokeStyle = c.sidebarBorder; ctx.lineWidth = 1;
      rr(209, 56, 115, 90, 5); ctx.fill(); ctx.stroke();
      [68, 84, 100, 116].forEach(y => {
        ctx.fillStyle = c.sidebarText; rr(218, y, [70, 85, 65, 50][y===68?0:y===84?1:y===100?2:3], 7, 2); ctx.fill();
      });

      // Text lines
      [[16, 156, 220], [16, 170, 190], [16, 184, 245], [16, 198, 160]].forEach(([x, y, w]) => {
        ctx.fillStyle = c.bodyText; rr(x, y, w, 7, 2); ctx.fill();
      });

      // CTA button
      ctx.fillStyle = c.ctaBg; ctx.strokeStyle = c.ctaDefault; ctx.lineWidth = 1.5;
      rr(16, 215, 90, 24, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = c.ctaDefault; ctx.font = '8px Inter,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Read more →', 61, 230);

      // ── Trail ─────────────────────────────────────────────────
      const gaze = getGaze(ts);
      trail.push({ x: gaze.x, y: gaze.y, ts });
      trail = trail.filter(p => ts - p.ts < TRAIL_FADE_MS);

      for (let i = 1; i < trail.length; i++) {
        const a = trail[i-1], b = trail[i];
        const alpha = (1 - (ts - b.ts) / TRAIL_FADE_MS) * 0.4;
        ctx.strokeStyle = `rgba(26,138,106,${alpha})`;
        ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }

      // ── Gaze cursor ───────────────────────────────────────────
      if (gaze.fixing) {
        ctx.strokeStyle = `rgba(26,138,106,0.45)`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(gaze.x, gaze.y, 13, 0, Math.PI*2); ctx.stroke();
      }
      ctx.fillStyle = accent;
      ctx.beginPath(); ctx.arc(gaze.x, gaze.y, 4.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(gaze.x, gaze.y, 2, 0, Math.PI*2); ctx.fill();

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={ref} style={{ width: 340, height: 270, borderRadius: 10, border: '1px solid var(--border)', display: 'block' }} />;
}

/* ── Horizontal Timeline with hover cards ──────────────────────── */
const timelineData = [
  { year: '1879', 
    title: 'First Eye Movement Studies', 
    desc: 'Louis Émile Javal observed that reading involves a series of short stops (fixations) rather than smooth sweeping.', 
    link: 'https://en.wikipedia.org/wiki/Louis_%C3%89mile_Javal' },
  { year: '1901', 
    title: 'Corneal Reflection Method', 
    desc: 'Raymond Dodge and Thomas Cline built the first non-invasive eye tracker using light reflected from the cornea.', 
    link: 'https://pure.mpg.de/rest/items/item_2316343_3/component/file_2316342/content' },
  { year: '1950', 
    title: 'Fitts & Jones — Aviation', 
    desc: 'Paul Fitts used eye tracking to study how pilots scan cockpit instruments, founding applied eye-tracking research.', 
    link: 'https://psycnet.apa.org/record/1950-05519-001' },
  { year: '1967', 
    title: 'Task-Dependent Viewing', 
    desc: 'Alfred Yarbus published his seminal book demonstrating that visual scanpaths are fundamentally altered by a subject\'s cognitive goals', 
    link: 'http://wexler.free.fr/library/files/yarbus%20(1967)%20eye%20movements%20and%20vision.pdf' },
  { year: '1980', 
    title: 'Eye-Mind Hypothesis', 
    desc: 'Just & Carpenter formulated the theory that there is no appreciable lag between what is fixated and what the brain processes.', 
    link: 'https://doi.org/10.1037/0033-295X.87.4.329' },
  { year: '1998', 
    title: 'Cognitive Synthesis', 
    desc: "Keith Rayner's landmark review solidified eye tracking as a primary methodology for studying reading and visual cognition.", 
    link: 'https://doi.org/10.1037/0033-2909.124.3.372' },
  { year: '2010s', 
    title: 'Naturalistic & Mobile', 
    desc: 'Miniaturized trackers allowed scientists to study visual attention in real-world, dynamic environments outside the lab.', 
    link: 'https://en.wikipedia.org/wiki/Eye_tracking#Mobile_eye_tracking' },
  { year: '2020s', 
    title: 'Neuro-Diagnostics & AI', 
    desc: 'Focus shifted to combining gaze data with EEG/fMRI and using ML to study neurodevelopmental conditions.'},
];

function HorizontalTimeline() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = timelineData[activeIdx];

  return (
    <div className="is-ht-container">
      {/* Card above the line */}
      <div className="is-ht-card">
        <div className="is-ht-card-year">{active.year}</div>
        <div className="is-ht-card-title">{active.title}</div>
        <div className="is-ht-card-desc">{active.desc}</div>
        {active.link && (
          <a href={active.link} target="_blank" rel="noopener noreferrer" className="is-ht-card-link">
            Read more →
          </a>
        )}
      </div>
      {/* Arrow from card to dot */}
      <div className="is-ht-arrow-wrap">
        <svg width="16" height="10" viewBox="0 0 16 10" style={{ display: 'block', margin: '0 auto' }}>
          <polygon points="0,0 16,0 8,10" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
        </svg>
      </div>
      {/* Horizontal axis */}
      <div className="is-ht-axis">
        <div className="is-ht-line" />
        <div className="is-ht-dots">
          {timelineData.map((item, i) => (
            <button
              key={item.year}
              className="is-ht-dot-wrap"
              onMouseEnter={() => setActiveIdx(i)}
              onFocus={() => setActiveIdx(i)}
              onClick={() => setActiveIdx(i)}
              aria-label={`${item.year} — ${item.title}`}
              aria-pressed={i === activeIdx}
            >
              <span className={`is-ht-dot${i === activeIdx ? ' is-ht-dot--active' : ''}`} />
              <span className={`is-ht-label${i === activeIdx ? ' is-ht-label--active' : ''}`}>
                {item.year}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Application card ──────────────────────────────────────────── */
function AppCard({ icon, title, desc }) {
  return (
    <div className="card is-app-card">
      <div className="is-app-icon">{icon}</div>
      <h4 style={{ marginBottom: 4 }}>{title}</h4>
      <p style={{ fontSize: '0.92rem', margin: 0 }}>{desc}</p>
    </div>
  );
}

/* ── Main Section ──────────────────────────────────────────────── */
export default function IntroSection() {
  return (
    <section id="intro">
      {/* Split editorial hero */}
      <div className="is-hero">
        <div className="is-hero-inner">
          <div className="is-hero-left">
            <h1 className="is-hero-title">
              Eye Tracking<br />
              <span className="is-hero-title-accent">&amp; How We See the Web</span>
            </h1>
            <p className="is-hero-desc">
              Every time you look at a screen, your eyes make 3–4 rapid movements per second.
              Explore how eye tracking reveals where attention goes — and why it matters for design.
            </p>
          </div>
          <div className="is-hero-right">
            <ScanpathViz />
            <p className="is-hero-caption">Simulated scanpath on a webpage wireframe</p>
          </div>
        </div>
      </div>

      {/* Light content area */}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        <p className="is-lead-text">
          Every time you look at a screen, your eyes make 3–4 rapid movements per second.
          Eye tracking captures these invisible micro-movements to reveal <em>where</em> you
          look, <em>how long</em> you linger, and <em>what</em> you skip entirely.
          Here&apos;s an interactive guide to understanding this fascinating field.
        </p>

        {/* What is Eye Tracking */}
        <h2 className="is-section-title">What is Eye Tracking?</h2>
        <p>
          Eye tracking is the process of measuring where a person is looking (the <em>point of gaze</em>)
          or the motion of the eye relative to the head. Modern eye trackers use infrared light
          reflected off the cornea and pupil to calculate gaze direction with high precision.
        </p>

        <div className="is-concept-grid">
          <div className="card is-concept-card">
            <div className="is-concept-icon">🎯</div>
            <h4>Fixation</h4>
            <p style={{ fontSize: '0.92rem', margin: 0 }}>
              A moment (100–600 ms) when the eye is relatively still, actively processing visual information.
              This is when you actually <em>see</em>.
            </p>
          </div>
          <div className="card is-concept-card">
            <div className="is-concept-icon">⚡</div>
            <h4>Saccade</h4>
            <p style={{ fontSize: '0.92rem', margin: 0 }}>
              A rapid, ballistic eye movement between fixations (20–80 ms). During saccades,
              vision is suppressed — you are essentially <em>blind</em>.
            </p>
          </div>
          <div className="card is-concept-card">
            <div className="is-concept-icon">🔄</div>
            <h4>Scanpath</h4>
            <p style={{ fontSize: '0.92rem', margin: 0 }}>
              The complete sequence of fixations and saccades as someone views a scene.
              It reveals the viewer&apos;s <em>visual strategy</em>.
            </p>
          </div>
        </div>

        {/* Brief History */}
        <h2 className="is-section-title" style={{ marginTop: 56 }}>A Brief History</h2>
        <p style={{ marginBottom: 28 }}>
          From mechanical contraptions to webcam-based AI — eye tracking has come a long way.
        </p>
        <p className="interaction-hint" style={{ textAlign: 'center', justifyContent: 'center', marginBottom: 10 }}>
          Hover or click the years to explore
        </p>
        <HorizontalTimeline />

        {/* Applications */}
        <h2 className="is-section-title" style={{ marginTop: 56 }}>Where is Eye Tracking Applied?</h2>
        <p style={{ marginBottom: 28 }}>
          Eye tracking has moved far beyond the research lab.
        </p>
        <div className="is-app-grid">
          <AppCard icon="🖥️" title="UX & Web Design"
            desc="Understanding how users scan websites to optimize layouts, CTAs, and content hierarchy." />
          <AppCard icon="📢" title="Advertising"
            desc="Measuring which parts of an ad attract attention and how long viewers engage with key messages." />
          <AppCard icon="♿" title="Accessibility"
            desc="Enabling people with motor disabilities to control computers using only their eyes." />
          <AppCard icon="🧠" title="Neuroscience"
            desc="Studying cognitive processes, attention disorders, reading difficulties, and decision-making." />
          <AppCard icon="🚗" title="Automotive Safety"
            desc="Monitoring driver attention and drowsiness to prevent accidents in modern vehicles." />
          <AppCard icon="🎮" title="Gaming & VR"
            desc="Foveated rendering in VR headsets and gaze-based interaction in immersive experiences." />
        </div>
      </div>
    </section>
  );
}
