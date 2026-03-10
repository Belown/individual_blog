import { useEffect, useRef } from 'react';
import styles from './shared.module.css';

export function StepBlock({ num, title, children }) {
  return (
    <div className={styles.stepBlock}>
      <h3><span className={styles.stepNum}>{num}</span> {title}</h3>
      {children}
    </div>
  );
}

export function InteractiveBlock({ title, hint, children }) {
  return (
    <div className={styles.interactiveBlock}>
      <div className={styles.interactiveHeader}>
        <h4>{title}</h4>
        {hint && <p className={styles.interactiveHint}>{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function SliderControl({ label, value, min, max, step, onChange, minLabel, maxLabel, valueDisplay }) {
  return (
    <div className={styles.sliderControl}>
      <label>
        {label}: <span className={styles.sliderValue}>{valueDisplay || value}</span>
      </label>
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      {(minLabel || maxLabel) && (
        <div className={styles.sliderLabels}>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

export function AlgoSummary({ title, items }) {
  return (
    <div className={styles.algoSummary}>
      <h3>{title}</h3>
      <ul>
        {items.map((item, i) => (
          <li key={i}><strong>{item.label}:</strong> {item.text}</li>
        ))}
      </ul>
    </div>
  );
}

export function Button({ variant = 'primary', active, onClick, children }) {
  const cls = variant === 'danger' ? styles.btnDanger
    : variant === 'secondary' ? styles.btnSecondary
    : styles.btnPrimary;
  return (
    <button
      className={`${cls} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ label, value, color }) {
  return (
    <div className={styles.progressBarContainer}>
      <span className={styles.progressBarLabel}>{label}</span>
      <div className={styles.progressBarTrack}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${(value * 100).toFixed(0)}%`, background: color }}
        />
      </div>
      <span className={styles.progressBarValue} style={{ color }}>
        {value.toFixed(3)}
      </span>
    </div>
  );
}

export function FadeIn({ children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(styles.fadeInVisible);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.fadeIn} ${className}`}>
      {children}
    </div>
  );
}

export function Callout({ children }) {
  return (
    <div className={styles.callout}>
      {children}
    </div>
  );
}
