import { useEffect, useRef, useCallback } from 'react';
import { ProgressBar } from '../shared';
import { setupCanvas, clearCanvas, COLORS } from '../../utils/canvasHelpers';
import styles from './RadarChart.module.css';

/**
 * Reusable radar chart component.
 * @param {{ dimensions: Array<{key: string, label: string}>, scores: Object, color?: string }} props
 */
export default function RadarChart({ dimensions, scores, color = COLORS.multimatch }) {
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const result = setupCanvas(canvasRef.current);
    if (!result) return;
    const { ctx, width, height } = result;
    clearCanvas(ctx, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.min(width, height) * 0.38;
    const n = dimensions.length;
    const angleOffset = -Math.PI / 2;

    // Concentric circles
    for (let ring = 1; ring <= 4; ring++) {
      const r = maxR * (ring / 4);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (ring < 4) {
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.textAlign = 'center';
        ctx.fillText((ring * 0.25).toFixed(2), cx + 5, cy - r + 12);
      }
    }

    // Axes and labels
    const points = [];
    for (let i = 0; i < n; i++) {
      const angle = angleOffset + (2 * Math.PI * i) / n;
      const px = cx + maxR * Math.cos(angle);
      const py = cy + maxR * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const labelR = maxR + 20;
      const lx = cx + labelR * Math.cos(angle);
      const ly = cy + labelR * Math.sin(angle);
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = COLORS.textMuted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dimensions[i].label, lx, ly);

      const val = scores[dimensions[i].key] || 0;
      const dataR = maxR * val;
      points.push({
        x: cx + dataR * Math.cos(angle),
        y: cy + dataR * Math.sin(angle)
      });
    }

    // Data polygon
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = color.replace(')', ', 0.15)').replace('rgb', 'rgba');
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Data points
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }, [dimensions, scores, color]);

  useEffect(() => {
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [draw]);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{ width: '100%', maxWidth: 400, height: 'auto', borderRadius: 8, background: '#232635', border: '1px solid #2d3044' }}
      />
      <div className={styles.scores}>
        {dimensions.map(dim => (
          <ProgressBar
            key={dim.key}
            label={dim.label}
            value={scores[dim.key] || 0}
            color={color}
          />
        ))}
      </div>
    </div>
  );
}
