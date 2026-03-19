import { useEffect, useRef, useState } from 'react';
import './IntroSection.css';

/* ── Animated particle background for hero ─────────────────────── */
function HeroCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let animId;
    let shapes = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Create small floating eye/triangle shapes
    for (let i = 0; i < 40; i++) {
      shapes.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: 4 + Math.random() * 10,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: 0.15 + Math.random() * 0.25,
        type: Math.random() > 0.5 ? 'triangle' : 'circle',
      });
    }

    const draw = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const s of shapes) {
        s.x += s.vx; s.y += s.vy; s.rotation += s.rotSpeed;
        if (s.x < -20) s.x = w + 20;
        if (s.x > w + 20) s.x = -20;
        if (s.y < -20) s.y = h + 20;
        if (s.y > h + 20) s.y = -20;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.globalAlpha = s.opacity;
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1;

        if (s.type === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(0, -s.size);
          ctx.lineTo(s.size * 0.87, s.size * 0.5);
          ctx.lineTo(-s.size * 0.87, s.size * 0.5);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, s.size * 0.5, 0, Math.PI * 2);
          ctx.stroke();
          // dot in center
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
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
            <div
              key={item.year}
              className="is-ht-dot-wrap"
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => setActiveIdx(i)}
            >
              <div className={`is-ht-dot${i === activeIdx ? ' is-ht-dot--active' : ''}`} />
              <div className={`is-ht-label${i === activeIdx ? ' is-ht-label--active' : ''}`}>
                {item.year}
              </div>
            </div>
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
      {/* Dark hero header — Explorable Explanations style */}
      <div className="is-hero">
        <HeroCanvas />
        <div className="is-hero-content">
          <h1 className="is-hero-title">
            EYE TRACKING
          </h1>
          <p className="is-hero-subtitle">& How We See the Web</p>
        </div>
        {/* Speech bubble arrow pointing down */}
        <div className="is-arrow">
          <svg width="60" height="30" viewBox="0 0 60 30">
            <polygon points="0,0 60,0 30,30" fill="#ffffff" />
          </svg>
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
