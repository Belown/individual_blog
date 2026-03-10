import { useEffect, useRef } from 'react';
import { setupCanvas, clearCanvas, drawScanpath, COLORS } from '../../utils/canvasHelpers';
import { FadeIn } from '../shared';
import styles from './ScanpathIntro.module.css';

const demoFixations = [
  { x: 150, y: 85, duration: 280 },
  { x: 155, y: 115, duration: 200 },
  { x: 470, y: 130, duration: 350 },
  { x: 160, y: 205, duration: 180 },
  { x: 160, y: 240, duration: 220 },
  { x: 470, y: 270, duration: 300 },
  { x: 170, y: 265, duration: 150 },
];

export default function ScanpathIntro() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const draw = () => {
      const result = setupCanvas(canvasRef.current);
      if (!result) return;
      const { ctx, width, height } = result;
      clearCanvas(ctx, width, height);

      const scaleX = width / 700;
      const scaleY = height / 400;

      // Stimulus placeholders
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(40 * scaleX, 30 * scaleY, (width - 80 * scaleX), (height - 60 * scaleY));
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.strokeRect(40 * scaleX, 30 * scaleY, (width - 80 * scaleX), (height - 60 * scaleY));

      const placeholders = [
        { x: 120, y: 80, w: 180, h: 20 },
        { x: 120, y: 110, w: 140, h: 20 },
        { x: 120, y: 140, w: 200, h: 20 },
        { x: 400, y: 80, w: 150, h: 120 },
        { x: 120, y: 200, w: 180, h: 20 },
        { x: 120, y: 230, w: 160, h: 20 },
        { x: 120, y: 260, w: 190, h: 20 },
        { x: 400, y: 230, w: 150, h: 100 },
      ];
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      for (const p of placeholders) {
        ctx.fillRect(p.x * scaleX, p.y * scaleY, p.w * scaleX, p.h * scaleY);
      }

      const scaled = demoFixations.map(f => ({ x: f.x * scaleX, y: f.y * scaleY, duration: f.duration }));
      drawScanpath(ctx, scaled, COLORS.scanpathA, true);
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  return (
    <section className={styles.section} id="what-is-scanpath">
      <div className={styles.container}>
        <h2>What Is a Scanpath?</h2>
        <p>
          When you look at an image, your eyes don't sweep smoothly across it. Instead, they make
          a series of rapid jumps called <strong>saccades</strong>, landing briefly on specific
          points of interest called <strong>fixations</strong>. A <em>scanpath</em> is simply the
          ordered sequence of these fixations — it's a trace of <em>where</em> you looked and{' '}
          <em>in what order</em>.
        </p>

        <div className={styles.figureContainer}>
          <canvas ref={canvasRef} width={700} height={400} style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#232635', border: '1px solid #2d3044' }} />
          <p className={styles.figureCaption}>
            An example scanpath. Circles represent fixations (larger = longer duration). Lines represent saccades.
          </p>
        </div>

        <p>
          Comparing scanpaths lets researchers answer questions like:{' '}
          <em>Did two viewers attend to the same regions? Did they follow a similar viewing strategy?</em>{' '}
          But "similarity" is surprisingly hard to define. The three algorithms we'll explore each
          take a fundamentally different approach.
        </p>

        <FadeIn>
          <div className={styles.overviewCards}>
            <div className={`${styles.card} ${styles.nldCard}`}>
              <h3>NLD</h3>
              <p className={styles.cardApproach}>String Editing</p>
              <p>Converts fixations into letters on a grid, then measures how many edits it takes to turn one string into another.</p>
            </div>
            <div className={`${styles.card} ${styles.scasimCard}`}>
              <h3>ScaSim</h3>
              <p className={styles.cardApproach}>Spatial Alignment</p>
              <p>Aligns two scanpaths in time and measures the spatial distance between paired fixation segments.</p>
            </div>
            <div className={`${styles.card} ${styles.multimatchCard}`}>
              <h3>MultiMatch</h3>
              <p className={styles.cardApproach}>Multi-Dimensional</p>
              <p>Simplifies, aligns, and then compares scanpaths across five different dimensions of similarity.</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
