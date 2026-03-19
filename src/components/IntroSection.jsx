import { useEffect, useRef, useState } from 'react';

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
    <div style={s.htContainer}>
      {/* Card above the line */}
      <div style={s.htCard}>
        <div style={s.htCardYear}>{active.year}</div>
        <div style={s.htCardTitle}>{active.title}</div>
        <div style={s.htCardDesc}>{active.desc}</div>
        {active.link && (
          <a href={active.link} target="_blank" rel="noopener noreferrer" style={s.htCardLink}>
            Read more →
          </a>
        )}
      </div>
      {/* Arrow from card to dot */}
      <div style={s.htArrowWrap}>
        <svg width="16" height="10" viewBox="0 0 16 10" style={{ display: 'block', margin: '0 auto' }}>
          <polygon points="0,0 16,0 8,10" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
        </svg>
      </div>
      {/* Horizontal axis */}
      <div style={s.htAxis}>
        <div style={s.htLine} />
        <div style={s.htDots}>
          {timelineData.map((item, i) => (
            <div
              key={item.year}
              style={s.htDotWrap}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => setActiveIdx(i)}
            >
              <div style={{
                ...s.htDot,
                ...(i === activeIdx ? s.htDotActive : {}),
              }} />
              <div style={{
                ...s.htLabel,
                ...(i === activeIdx ? s.htLabelActive : {}),
              }}>{item.year}</div>
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
    <div className="card" style={s.appCard}>
      <div style={s.appIcon}>{icon}</div>
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
      <div style={s.hero}>
        <HeroCanvas />
        <div style={s.heroContent}>
          <h1 style={s.heroTitle}>
            EYE TRACKING
          </h1>
          <p style={s.heroSubtitle}>& How We See the Web</p>
        </div>
        {/* Speech bubble arrow pointing down */}
        <div style={s.arrow}>
          <svg width="60" height="30" viewBox="0 0 60 30">
            <polygon points="0,0 60,0 30,30" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Light content area */}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        <p style={s.leadText}>
          Every time you look at a screen, your eyes make 3–4 rapid movements per second.
          Eye tracking captures these invisible micro-movements to reveal <em>where</em> you
          look, <em>how long</em> you linger, and <em>what</em> you skip entirely.
          Here&apos;s an interactive guide to understanding this fascinating field.
        </p>

        {/* What is Eye Tracking */}
        <h2 style={s.sectionTitle}>What is Eye Tracking?</h2>
        <p>
          Eye tracking is the process of measuring where a person is looking (the <em>point of gaze</em>)
          or the motion of the eye relative to the head. Modern eye trackers use infrared light
          reflected off the cornea and pupil to calculate gaze direction with high precision.
        </p>

        <div style={s.conceptGrid}>
          <div className="card" style={s.conceptCard}>
            <div style={s.conceptIcon}>🎯</div>
            <h4>Fixation</h4>
            <p style={{ fontSize: '0.92rem', margin: 0 }}>
              A moment (100–600 ms) when the eye is relatively still, actively processing visual information.
              This is when you actually <em>see</em>.
            </p>
          </div>
          <div className="card" style={s.conceptCard}>
            <div style={s.conceptIcon}>⚡</div>
            <h4>Saccade</h4>
            <p style={{ fontSize: '0.92rem', margin: 0 }}>
              A rapid, ballistic eye movement between fixations (20–80 ms). During saccades,
              vision is suppressed — you are essentially <em>blind</em>.
            </p>
          </div>
          <div className="card" style={s.conceptCard}>
            <div style={s.conceptIcon}>🔄</div>
            <h4>Scanpath</h4>
            <p style={{ fontSize: '0.92rem', margin: 0 }}>
              The complete sequence of fixations and saccades as someone views a scene.
              It reveals the viewer&apos;s <em>visual strategy</em>.
            </p>
          </div>
        </div>

        {/* Brief History */}
        <h2 style={{ ...s.sectionTitle, marginTop: 56 }}>A Brief History</h2>
        <p style={{ marginBottom: 28 }}>
          From mechanical contraptions to webcam-based AI — eye tracking has come a long way.
        </p>
        <HorizontalTimeline />

        {/* Applications */}
        <h2 style={{ ...s.sectionTitle, marginTop: 56 }}>Where is Eye Tracking Applied?</h2>
        <p style={{ marginBottom: 28 }}>
          Eye tracking has moved far beyond the research lab.
        </p>
        <div style={s.appGrid}>
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

const s = {
  hero: {
    position: 'relative', background: '#2c2c2c',
    minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center',
    paddingTop: 56, overflow: 'hidden',
  },
  heroContent: {
    position: 'relative', zIndex: 1, textAlign: 'center',
    padding: '60px 24px 50px',
  },
  heroTitle: {
    fontFamily: "'Inter', sans-serif", fontSize: 'clamp(2.2rem, 6vw, 4rem)',
    fontWeight: 900, color: '#ffffff', letterSpacing: '0.06em',
    textTransform: 'uppercase', margin: 0, lineHeight: 1.1,
  },
  heroSubtitle: {
    fontFamily: "'Lora', serif", fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
    color: 'rgba(255,255,255,0.65)', fontStyle: 'italic',
    marginTop: 8, marginBottom: 0,
  },
  arrow: {
    position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
    zIndex: 2, lineHeight: 0,
  },

  leadText: {
    fontSize: '1.1rem', lineHeight: 1.9, textAlign: 'justify',
    maxWidth: 640, margin: '0 auto 40px', color: 'var(--text-secondary)',
  },

  sectionTitle: {
    textAlign: 'center', marginBottom: 12,
  },

  conceptGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16, marginTop: 24,
  },
  conceptCard: { textAlign: 'center' },
  conceptIcon: { fontSize: '2rem', marginBottom: 10 },

  // Horizontal timeline
  htContainer: {
    maxWidth: 720, margin: '0 auto', position: 'relative',
  },
  htCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '18px 22px',
    minHeight: 90, textAlign: 'center',
    transition: 'all 200ms ease',
  },
  htCardYear: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)',
    marginBottom: 3,
  },
  htCardTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)',
    marginBottom: 6,
  },
  htCardDesc: {
    fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6,
  },
  htCardLink: {
    display: 'inline-block', marginTop: 8,
    fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', fontWeight: 600,
    color: 'var(--accent)', textDecoration: 'none',
  },
  htArrowWrap: {
    textAlign: 'center', marginTop: -1, marginBottom: -1, position: 'relative', zIndex: 1,
  },
  htAxis: {
    position: 'relative', paddingTop: 0,
  },
  htLine: {
    position: 'absolute', top: 4, left: 0, right: 0, height: 2,
    background: 'linear-gradient(to right, var(--accent), var(--accent-warm))',
    opacity: 0.3, borderRadius: 1,
  },
  htDots: {
    display: 'flex', justifyContent: 'space-between', position: 'relative',
  },
  htDotWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    cursor: 'pointer', padding: '0 2px', flex: 1,
  },
  htDot: {
    width: 10, height: 10, borderRadius: '50%',
    background: 'var(--border)', border: '2px solid #fff',
    boxShadow: '0 0 0 1px var(--border)',
    transition: 'all 200ms ease', marginBottom: 8,
  },
  htDotActive: {
    background: 'var(--accent)',
    boxShadow: '0 0 0 2px var(--accent)',
    transform: 'scale(1.3)',
  },
  htLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)',
    transition: 'color 200ms ease',
  },
  htLabelActive: {
    color: 'var(--accent)', fontWeight: 700,
  },

  appGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 14,
  },
  appCard: { display: 'flex', flexDirection: 'column', gap: 2 },
  appIcon: { fontSize: '1.6rem', marginBottom: 6 },
};
