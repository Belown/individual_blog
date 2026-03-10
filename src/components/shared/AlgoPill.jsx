import styles from './AlgoPill.module.css';

export default function AlgoPill({ type, size = 'default', children }) {
  const sizeClass = size === 'large' ? styles.large : size === 'small' ? styles.small : '';
  return (
    <span className={`${styles.pill} ${styles[type]} ${sizeClass}`}>
      {children || type.toUpperCase()}
    </span>
  );
}
