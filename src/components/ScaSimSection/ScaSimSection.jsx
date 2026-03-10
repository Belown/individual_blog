import { useState, useEffect, useRef, useCallback } from 'react';
import AlgoPill from '../shared/AlgoPill';
import { StepBlock, InteractiveBlock, AlgoSummary, Button, FadeIn } from '../shared';
import { ScaSim, euclidean } from '../../utils/algorithms';
import { setupCanvas, clearCanvas, drawScanpath, drawFixation, COLORS, SAMPLE_SCANPATHS } from '../../utils/canvasHelpers';
import styles from './ScaSimSection.module.css';

export default function ScaSimSection() {
  const [step, setStep] = useState(0);
  const [maxSteps, setMaxSteps] = useState(1);
  const alignCanvasRef = useRef(null);
  const costCanvasRef = useRef(null);

  const drawAlignment = useCallback(() => {
    const result = setupCanvas(alignCanvasRef.current);
    if (!result) return;
    const { ctx, width, height } = result;
    clearCanvas(ctx, width, height);

    const scaleX = width / 700;
    const scaleY = height / 450;
    const pathA = SAMPLE_SCANPATHS.a.map(f => ({ x: f.x * scaleX, y: (f.y * 0.8 + 30) * scaleY, duration: f.duration }));
    const pathB = SAMPLE_SCANPATHS.b.map(f => ({ x: f.x * scaleX, y: (f.y * 0.8 + 100) * scaleY, duration: f.duration }));

    const { alignment } = ScaSim.compute(
      SAMPLE_SCANPATHS.a.map(f => ({ x: f.x * scaleX, y: (f.y * 0.8 + 30) * scaleY })),
      SAMPLE_SCANPATHS.b.map(f => ({ x: f.x * scaleX, y: (f.y * 0.8 + 100) * scaleY }))
    );
    setMaxSteps(alignment.length + 1);

    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillStyle = COLORS.scanpathA;
    ctx.textAlign = 'left';
    ctx.fillText('Scanpath A', 10, 20);
    ctx.fillStyle = COLORS.scanpathB;
    ctx.fillText('Scanpath B', 10, height - 10);

    drawScanpath(ctx, pathA, COLORS.scanpathA, true, step === 0 ? 1 : 0.7);
    drawScanpath(ctx, pathB, COLORS.scanpathB, true, step === 0 ? 1 : 0.7);

    if (step > 0) {
      const showCount = Math.min(step, alignment.length);
      for (let s = 0; s < showCount; s++) {
        const pair = alignment[s];
        if (pair.type === 'match') {
          const a = pathA[pair.a];
          const b = pathB[pair.b];
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = COLORS.link;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.setLineDash([]);

          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const dist = euclidean(a, b);
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillStyle = COLORS.textMuted;
          ctx.textAlign = 'center';
          ctx.fillText(dist.toFixed(0) + 'px', midX + 15, midY);

          drawFixation(ctx, a.x, a.y, 6, COLORS.scasim, 0.8);
          drawFixation(ctx, b.x, b.y, 6, COLORS.scasim, 0.8);
        } else if (pair.type === 'gap-b' && pair.a !== null) {
          const a = pathA[pair.a];
          ctx.beginPath();
          ctx.arc(a.x, a.y, 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 107, 138, 0.5)';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillStyle = '#ff6b8a';
          ctx.textAlign = 'center';
          ctx.fillText('gap', a.x, a.y - 15);
        } else if (pair.type === 'gap-a' && pair.b !== null) {
          const b = pathB[pair.b];
          ctx.beginPath();
          ctx.arc(b.x, b.y, 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 107, 138, 0.5)';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillStyle = '#ff6b8a';
          ctx.textAlign = 'center';
          ctx.fillText('gap', b.x, b.y + 20);
        }
      }
    }
  }, [step]);

  const drawCost = useCallback(() => {
    const result = setupCanvas(costCanvasRef.current);
    if (!result) return;
    const { ctx, width, height } = result;
    clearCanvas(ctx, width, height);

    const scaleX = width / 700;
    const scaleY = height / 350;
    const pathA = SAMPLE_SCANPATHS.a.map(f => ({ x: f.x * scaleX, y: f.y * scaleY * 0.7 + 20 }));
    const pathB = SAMPLE_SCANPATHS.b.map(f => ({ x: f.x * scaleX, y: f.y * scaleY * 0.7 + 40 }));

    drawScanpath(ctx, pathA, COLORS.scanpathA, false, 0.7);
    drawScanpath(ctx, pathB, COLORS.scanpathB, false, 0.7);

    const computeResult = ScaSim.compute(pathA, pathB);
    for (const pair of computeResult.alignment) {
      if (pair.type === 'match') {
        const a = pathA[pair.a];
        const b = pathB[pair.b];
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = COLORS.scasim;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
    }

    return computeResult;
  }, []);

  const [costResult, setCostResult] = useState({ cost: 0, normalized: 0 });

  useEffect(() => {
    drawAlignment();
    window.addEventListener('resize', drawAlignment);
    return () => window.removeEventListener('resize', drawAlignment);
  }, [drawAlignment]);

  useEffect(() => {
    const result = drawCost();
    if (result) setCostResult(result);
    const handler = () => {
      const r = drawCost();
      if (r) setCostResult(r);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [drawCost]);

  return (
    <section className={styles.section} id="scasim-section">
      <div className={styles.container}>
        <div className={styles.algoHeader}>
          <AlgoPill type="scasim" size="large">ScaSim</AlgoPill>
          <h2>Scanpath Similarity (ScaSim)</h2>
        </div>

        <p>
          Unlike NLD, ScaSim works <strong>directly in coordinate space</strong> — no grid, no
          letters. It uses a variant of the Needleman-Wunsch sequence alignment algorithm to find
          the best spatial alignment between two scanpaths, then totals up the distances.
        </p>

        <FadeIn>
          <StepBlock num={1} title="Sequence Alignment">
            <p>
              ScaSim adapts the classic Needleman-Wunsch algorithm from bioinformatics. Instead of
              comparing characters, it compares <strong>fixation positions</strong>. The algorithm
              finds the optimal alignment that minimizes total spatial cost, allowing fixations to
              be paired or "gapped" (skipped).
            </p>

            <InteractiveBlock
              title="Visual Walkthrough: Scanpath Alignment"
              hint="Step through the alignment process to see how fixations are paired."
            >
              <div className={styles.alignmentViz}>
                <canvas
                  ref={alignCanvasRef}
                  width={700}
                  height={450}
                  style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#232635', border: '1px solid #2d3044' }}
                />
                <div className={styles.controls}>
                  <Button onClick={() => setStep(s => Math.min(s + 1, maxSteps - 1))}>
                    Next Step →
                  </Button>
                  <Button variant="secondary" onClick={() => setStep(0)}>Reset</Button>
                  <span className={styles.stepLabel}>Step {step} / {maxSteps - 1}</span>
                </div>
              </div>
            </InteractiveBlock>
          </StepBlock>
        </FadeIn>

        <FadeIn>
          <StepBlock num={2} title="Distance Accumulation">
            <p>
              Once aligned, ScaSim sums the Euclidean distances between each pair of aligned
              fixations. Gaps incur a penalty based on the length of the skipped saccade. The total
              is then normalized by the number of aligned pairs.
            </p>

            <InteractiveBlock
              title="Interactive: Substitution vs. Gap Cost"
              hint="Move a fixation and see how the alignment cost changes."
            >
              <div className={styles.costViz}>
                <canvas
                  ref={costCanvasRef}
                  width={700}
                  height={350}
                  style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#232635', border: '1px solid #2d3044' }}
                />
                <div className={styles.costOutput}>
                  <p>Total alignment cost: <strong>{costResult.cost.toFixed(1)} px</strong></p>
                  <p>Normalized ScaSim: <strong>{costResult.normalized.toFixed(1)} px/pair</strong></p>
                </div>
              </div>
            </InteractiveBlock>
          </StepBlock>
        </FadeIn>

        <FadeIn>
          <AlgoSummary
            title="ScaSim Summary"
            items={[
              { label: 'Strengths', text: 'Works in continuous space — no information loss from discretization. Handles scanpaths of different lengths via gap penalties.' },
              { label: 'Weaknesses', text: 'More computationally expensive. The gap penalty parameter requires tuning.' },
              { label: 'Output', text: 'A distance score (lower = more similar). Can compare scanpaths of unequal lengths.' },
            ]}
          />
        </FadeIn>
      </div>
    </section>
  );
}
