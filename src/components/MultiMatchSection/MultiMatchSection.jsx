import { useState, useEffect, useRef, useCallback } from 'react';
import AlgoPill from '../shared/AlgoPill';
import { StepBlock, InteractiveBlock, SliderControl, AlgoSummary, FadeIn } from '../shared';
import RadarChart from '../RadarChart/RadarChart';
import { MultiMatch } from '../../utils/algorithms';
import { setupCanvas, clearCanvas, drawScanpath, COLORS, SAMPLE_SCANPATHS } from '../../utils/canvasHelpers';
import styles from './MultiMatchSection.module.css';

const MM_DIMENSIONS = [
  { key: 'shape', label: 'Shape' },
  { key: 'direction', label: 'Direction' },
  { key: 'length', label: 'Length' },
  { key: 'position', label: 'Position' },
  { key: 'duration', label: 'Duration' },
];

const denseFixations = [
  { x: 50, y: 40, duration: 200 },
  { x: 80, y: 55, duration: 180 },
  { x: 120, y: 50, duration: 220 },
  { x: 200, y: 100, duration: 160 },
  { x: 210, y: 120, duration: 190 },
  { x: 280, y: 80, duration: 250 },
  { x: 350, y: 150, duration: 170 },
  { x: 360, y: 170, duration: 200 },
  { x: 340, y: 220, duration: 140 },
  { x: 250, y: 250, duration: 230 },
  { x: 240, y: 230, duration: 160 },
  { x: 150, y: 200, duration: 210 },
  { x: 100, y: 230, duration: 180 },
];

export default function MultiMatchSection() {
  const [threshold, setThreshold] = useState(50);
  const [origCount, setOrigCount] = useState(0);
  const [simpCount, setSimpCount] = useState(0);
  const [mmScores, setMmScores] = useState({ shape: 0, direction: 0, length: 0, position: 0, duration: 0 });
  const origCanvasRef = useRef(null);
  const simpCanvasRef = useRef(null);

  const drawSimplification = useCallback(() => {
    const origResult = setupCanvas(origCanvasRef.current);
    const simpResult = setupCanvas(simpCanvasRef.current);
    if (!origResult || !simpResult) return;

    const { ctx: ctxO, width: wO, height: hO } = origResult;
    const { ctx: ctxS, width: wS, height: hS } = simpResult;

    const scaleX = wO / 600;
    const scaleY = hO / 400;

    const scaled = denseFixations.map(f => ({ x: f.x * scaleX, y: f.y * scaleY, duration: f.duration }));

    clearCanvas(ctxO, wO, hO);
    drawScanpath(ctxO, scaled, COLORS.scanpathA, true, 0.7);
    setOrigCount(scaled.length);

    const simplified = MultiMatch.simplify(scaled, threshold * scaleX);
    clearCanvas(ctxS, wS, hS);
    drawScanpath(ctxS, simplified, COLORS.multimatch, true, 0.8);
    setSimpCount(simplified.length);
  }, [threshold]);

  useEffect(() => {
    drawSimplification();
    window.addEventListener('resize', drawSimplification);
    return () => window.removeEventListener('resize', drawSimplification);
  }, [drawSimplification]);

  useEffect(() => {
    const result = MultiMatch.compute(SAMPLE_SCANPATHS.a, SAMPLE_SCANPATHS.b, threshold);
    setMmScores(result);
  }, [threshold]);

  return (
    <section className={styles.section} id="multimatch-section">
      <div className={styles.container}>
        <div className={styles.algoHeader}>
          <AlgoPill type="multimatch" size="large">MultiMatch</AlgoPill>
          <h2>MultiMatch</h2>
        </div>

        <p>
          MultiMatch takes the most nuanced approach. Rather than producing a single similarity
          score, it evaluates scanpaths across <strong>five distinct dimensions</strong>: shape,
          direction, length, position, and duration. Before comparing, it simplifies the scanpaths
          to focus on their essential structure.
        </p>

        <FadeIn>
          <StepBlock num={0} title="The MultiMatch Pipeline">
            <div className={styles.pipeline}>
              <div className={styles.pipelineStep}>
                <div className={styles.pipelineIcon}>✂️</div>
                <div className={styles.pipelineLabel}>Simplify</div>
              </div>
              <div className={styles.pipelineArrow}>→</div>
              <div className={styles.pipelineStep}>
                <div className={styles.pipelineIcon}>🔗</div>
                <div className={styles.pipelineLabel}>Align</div>
              </div>
              <div className={styles.pipelineArrow}>→</div>
              <div className={styles.pipelineStep}>
                <div className={styles.pipelineIcon}>📊</div>
                <div className={styles.pipelineLabel}>Compare (5D)</div>
              </div>
            </div>
          </StepBlock>
        </FadeIn>

        <FadeIn>
          <StepBlock num={1} title="Scanpath Simplification">
            <p>
              MultiMatch first simplifies each scanpath by merging consecutive fixations that are
              close together or roughly collinear. This removes noise and highlights the{' '}
              <strong>structural skeleton</strong> of the viewing pattern. The simplification
              threshold controls how aggressively fixations are merged.
            </p>

            <InteractiveBlock
              title="Interactive: Simplification Threshold"
              hint="Adjust the threshold to see how the scanpath gets progressively simplified."
            >
              <SliderControl
                label="Simplification Threshold"
                value={threshold}
                min={0}
                max={150}
                step={5}
                onChange={setThreshold}
                minLabel="No simplification"
                maxLabel="Aggressive"
                valueDisplay={`${threshold}px`}
              />

              <div className={styles.simplifyContainer}>
                <div className={styles.simplifyPanel}>
                  <h5>Original Scanpath</h5>
                  <canvas
                    ref={origCanvasRef}
                    width={340}
                    height={280}
                    style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#232635', border: '1px solid #2d3044' }}
                  />
                  <p className={styles.fixationCount}>Fixations: {origCount}</p>
                </div>
                <div className={styles.simplifyPanel}>
                  <h5>Simplified Scanpath</h5>
                  <canvas
                    ref={simpCanvasRef}
                    width={340}
                    height={280}
                    style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#232635', border: '1px solid #2d3044' }}
                  />
                  <p className={styles.fixationCount}>Fixations: {simpCount}</p>
                </div>
              </div>
            </InteractiveBlock>
          </StepBlock>
        </FadeIn>

        <FadeIn>
          <StepBlock num={2} title="Alignment & Five-Dimensional Comparison">
            <p>
              After simplification, the two scanpaths are temporally aligned. Then, for each pair
              of aligned saccade-fixation units, MultiMatch computes similarity on five dimensions:
            </p>

            <div className={styles.fiveDimensions}>
              {[
                { icon: '📐', title: 'Shape', desc: 'Similarity of the overall geometric shape formed by the scanpath vectors.' },
                { icon: '🧭', title: 'Direction', desc: 'How similar are the angles of corresponding saccades?' },
                { icon: '📏', title: 'Length', desc: 'How similar are the amplitudes (lengths) of corresponding saccades?' },
                { icon: '📍', title: 'Position', desc: 'How close in space are the corresponding fixation positions?' },
                { icon: '⏱️', title: 'Duration', desc: 'How similar are the durations of corresponding fixations?' },
              ].map(dim => (
                <div key={dim.title} className={styles.dimCard}>
                  <div className={styles.dimIcon}>{dim.icon}</div>
                  <h4>{dim.title}</h4>
                  <p>{dim.desc}</p>
                </div>
              ))}
            </div>

            <InteractiveBlock
              title="Visual: Five-Dimension Radar Chart"
              hint="See how similarity distributes across the five dimensions for the sample scanpaths."
            >
              <RadarChart
                dimensions={MM_DIMENSIONS}
                scores={mmScores}
                color="#ffd166"
              />
            </InteractiveBlock>
          </StepBlock>
        </FadeIn>

        <FadeIn>
          <AlgoSummary
            title="MultiMatch Summary"
            items={[
              { label: 'Strengths', text: 'Rich, multi-dimensional comparison. Simplification reduces noise. Captures both spatial and temporal aspects.' },
              { label: 'Weaknesses', text: 'Complex to interpret. Simplification threshold significantly affects results. Five scores instead of one can be harder to summarize.' },
              { label: 'Output', text: 'Five similarity scores (one per dimension), each from 0 to 1.' },
            ]}
          />
        </FadeIn>
      </div>
    </section>
  );
}
