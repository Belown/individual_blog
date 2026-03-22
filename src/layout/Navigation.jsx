import { useState, useEffect } from 'react';
import eyeIcon from "../assets/eye.svg";
const sections = [
  { id: 'intro', label: 'What is Eye Tracking' },
  { id: 'patterns', label: 'Gaze Patterns' },
  { id: 'factors', label: 'Scanpath Formation' },
  { id: 'sandbox', label: 'Sandbox' },
];

export default function Navigation() {
  const [active, setActive] = useState('intro');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  return (
    <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
      <div style={s.inner}>
        <div style={s.brand} onClick={() => scrollTo('intro')}>
          <img src={eyeIcon} alt="Eye tracker icon" style={{ width: '2.5em', height: '2.5em' }} />
          <span style={s.brandText}>EyeTrack Explorer</span>
        </div>
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {menuOpen
              ? <path d="M4.3 4.3a1 1 0 0 1 1.4 0L10 8.6l4.3-4.3a1 1 0 1 1 1.4 1.4L11.4 10l4.3 4.3a1 1 0 0 1-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 0 1-1.4-1.4L8.6 10 4.3 5.7a1 1 0 0 1 0-1.4Z" />
              : <><rect x="2" y="4" width="16" height="2" rx="1" /><rect x="2" y="9" width="16" height="2" rx="1" /><rect x="2" y="14" width="16" height="2" rx="1" /></>}
          </svg>
        </button>
        <div className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollTo(sec.id)}
              className={`nav-link${active === sec.id ? ' nav-link--active' : ''}`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

const s = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
    borderBottom: '1px solid transparent',
    transition: 'all 200ms ease',
  },
  navScrolled: {
    borderBottom: '1px solid #e0dcd5',
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
  },
  inner: {
    maxWidth: 1060, margin: '0 auto', padding: '0 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: 56,
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 8,
    cursor: 'pointer', userSelect: 'none',
  },
  brandIcon: { fontSize: '1.2rem' },
  brandText: {
    fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 700,
    color: '#2c2c2c',
  },
};
