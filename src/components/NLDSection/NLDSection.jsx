import { useState, useEffect, useRef, useCallback } from 'react';
import AlgoPill from '../shared/AlgoPill';
import { StepBlock, InteractiveBlock, SliderControl, AlgoSummary, Button, Callout, FadeIn } from '../shared';
import { NLD } from '../../utils/algorithms';
import { setupCanvas, clearCanvas, drawScanpath, drawGrid, highlightFixationCells, COLORS, SAMPLE_SCANPATHS } from '../../utils/canvasHelpers';
import styles from './NLDSection.module.css';

export default function NLDSection() {
  const [gridSize, setGridSize] = useState(4);
  const [strA, setStrA] = useState('');
  const [strB, setStrB] = useState('');
  const canvasRef = useRef(null);

  // Levenshtein animation state
  const [levCells, setLevCells] = useState([]);
  const [levStep, setLevStep] = useState(-1);
  const [levPath, setLevPath] = useState(new Set());
  const [levDistance, setLevDistance] = useState(null);
  const [levNld, setLevNld] = useState(null);
  const animTimerRef = useRef(null);

  const drawNLDGrid = useCallback(() => {
    const result = setupCanvas(canvasRef.current);
    if (!result) return;
    const { ctx, width, height } = result;
    clearCanvas(ctx, width, height);

    const scaleX = width / 600;
    const scaleY = height / 400;
    const scaledA = SAMPLE_SCANPATHS.a.map(f => ({ x: f.x * scaleX, y: f.y * scaleY, duration: f.duration }));
    const scaledB = SAMPLE_SCANPATHS.b.map(f => ({ x: f.x * scaleX, y: f.y * scaleY, duration: f.duration }));

    drawGrid(ctx, gridSize, width, height, gridSize <= 6);
    highlightFixationCells(ctx, scaledA, gridSize, width, height, COLORS.scanpathA);
    highlightFixationCells(ctx, scaledB, gridSize, width, height, COLORS.scanpathB);
    drawScanpath(ctx, scaledA, COLORS.scanpathA, true, 0.8);
    drawScanpath(ctx, scaledB, COLORS.scanpathB, true, 0.8);

    const sA = NLD.discretize(scaledA, gridSize, width, height);
    const sB = NLD.discretize(scaledB, gridSize, width, height);
    setStrA(sA);
    setStrB(sB);
  }, [gridSize]);

  useEffect(() => {
    drawNLDGrid();
    window.addEventListener('resize', drawNLDGrid);
    return () => window.removeEventListener('resize', drawNLDGrid);
  }, [drawNLDGrid]);

  // Build Levenshtein matrix display
  useEffect(() => {
    if (!strA || !strB) return;
    const { matrix } = NLD.levenshtein(strA, strB);
    const m = strA.length;
    const n = strB.length;
    const cells = [];
    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= n; j++) {
        cells.push({ i, j, val: matrix[i][j] });
      }
    }
    setLevCells(cells);
    setLevStep(-1);
    setLevPath(new Set());
    setLevDistance(null);
    setLevNld(null);
  }, [strA, strB]);

  const playAnimation = () => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    if (!strA || !strB) return;

    const { distance, matrix, path } = NLD.levenshtein(strA, strB);
    const m = strA.length;
    const n = strB.length;
    const totalCells = (m + 1) * (n + 1);
    let step = 0;

    setLevStep(0);
    setLevPath(new Set());
    setLevDistance(null);
    setLevNld(null);

    const advance = () => {
      if (step >= totalCells) {
        // Show path
        const pathSet = new Set(path.map(p => `${p[0]},${p[1]}`));
        setLevPath(pathSet);
        setLevDistance(distance);
        const maxLen = Math.max(strA.length, strB.length);
        setLevNld(maxLen === 0 ? 0 : distance / maxLen);
        return;
      }
      setLevStep(step);
      step++;
      animTimerRef.current = setTimeout(advance, 60);
    };
    advance();
  };

  const resetAnimation = () => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setLevStep(-1);
    setLevPath(new Set());
    setLevDistance(null);
    setLevNld(null);
  };

  const m = strA.length;
  const n = strB.length;
  const cols = n + 2;

  return (
    <section className={styles.section} id="nld-section">
      <div className={styles.container}>
        <div className={styles.algoHeader}>
          <AlgoPill type="nld" size="large">NLD</AlgoPill>
          <h2>Normalized Levenshtein Distance</h2>
        </div>

        <p>
          NLD borrows an elegant idea from computational linguistics: treat scanpaths like{' '}
          <strong>strings of characters</strong>, then measure how many "edit operations" are
          needed to transform one into the other.
        </p>

        <FadeIn>
          <StepBlock num={1} title="Discretization — Turning Gaze into Letters">
            <p>
              The first step is to overlay a grid on the stimulus image. Each cell in the grid is
              assigned a unique letter. Every fixation is then mapped to the letter of the cell it
              falls in, producing a <strong>string representation</strong> of the scanpath.
            </p>

            <InteractiveBlock
              title="Interactive: Grid Size Trade-off"
              hint="Drag the slider to change the grid resolution and observe how the resulting strings change."
            >
              <SliderControl
                label="Grid Size"
                value={gridSize}
                min={2}
                max={8}
                step={1}
                onChange={setGridSize}
                minLabel="Coarse (2×2)"
                maxLabel="Fine (8×8)"
                valueDisplay={`${gridSize} × ${gridSize}`}
              />

              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#232635', border: '1px solid #2d3044' }}
              />

              <div className={styles.stringsOutput}>
                <div className={styles.stringRow}>
                  <span className={styles.stringLabel} style={{ color: COLORS.scanpathA }}>Scanpath A:</span>
                  <code className={styles.stringCode}>{strA || '—'}</code>
                </div>
                <div className={styles.stringRow}>
                  <span className={styles.stringLabel} style={{ color: COLORS.scanpathB }}>Scanpath B:</span>
                  <code className={styles.stringCode}>{strB || '—'}</code>
                </div>
              </div>

              <Callout>
                <p>
                  <strong>⚠ The Grid-Size Dilemma:</strong> A coarse grid groups distant fixations
                  together, inflating similarity. A fine grid can separate nearby fixations into
                  different cells, deflating similarity. There's no universally "correct" grid size
                  — it depends on your research question.
                </p>
              </Callout>
            </InteractiveBlock>
          </StepBlock>
        </FadeIn>

        <FadeIn>
          <StepBlock num={2} title="The Levenshtein Distance — Counting Edits">
            <p>
              Once we have two character strings, we compute the <strong>Levenshtein distance</strong>:
              the minimum number of single-character <em>insertions</em>, <em>deletions</em>, or{' '}
              <em>substitutions</em> needed to transform one string into the other.
            </p>

            <InteractiveBlock
              title="Visual Walkthrough: Edit Distance Matrix"
              hint="Watch how the dynamic programming matrix fills in to compute the distance."
            >
              <div className={styles.levViz}>
                <div className={styles.levControls}>
                  <Button onClick={playAnimation}>▶ Play Animation</Button>
                  <Button variant="secondary" onClick={resetAnimation}>Reset</Button>
                </div>

                <div className={styles.levMatrixContainer}>
                  <div
                    className={styles.levMatrix}
                    style={{ gridTemplateColumns: `repeat(${cols}, 38px)` }}
                  >
                    {/* Top-left corner */}
                    <div className={`${styles.levCell} ${styles.levCellHeader}`} />
                    <div className={`${styles.levCell} ${styles.levCellHeader}`} />
                    {/* Top header (string B) */}
                    {strB.split('').map((ch, j) => (
                      <div key={`hb-${j}`} className={`${styles.levCell} ${styles.levCellHeader} ${styles.levCellHeaderB}`}>
                        {ch}
                      </div>
                    ))}

                    {/* Rows */}
                    {Array.from({ length: m + 1 }, (_, i) => (
                      <>
                        {/* Row header */}
                        <div key={`ha-${i}`} className={`${styles.levCell} ${styles.levCellHeader} ${styles.levCellHeaderA}`}>
                          {i > 0 ? strA[i - 1] : ''}
                        </div>
                        {/* Data cells */}
                        {Array.from({ length: n + 1 }, (_, j) => {
                          const cellIdx = i * (n + 1) + j;
                          const key = `${i},${j}`;
                          const isPath = levPath.has(key);
                          const isActive = levStep === cellIdx;
                          const isFilled = levStep >= 0 && cellIdx <= levStep;
                          const cellData = levCells[cellIdx];

                          let cellClass = styles.levCell;
                          if (isPath) cellClass += ` ${styles.levCellPath}`;
                          else if (isActive) cellClass += ` ${styles.levCellActive}`;
                          else if (isFilled) cellClass += ` ${styles.levCellFilled}`;

                          return (
                            <div key={`c-${i}-${j}`} className={cellClass}>
                              {isFilled && cellData ? cellData.val : ''}
                            </div>
                          );
                        })}
                      </>
                    ))}
                  </div>
                </div>

                <div className={styles.levResult}>
                  <p>Levenshtein Distance: <strong>{levDistance !== null ? levDistance : '—'}</strong></p>
                  <p>Normalized (NLD): <strong>{levNld !== null ? levNld.toFixed(3) : '—'}</strong></p>
                </div>
              </div>
            </InteractiveBlock>
          </StepBlock>
        </FadeIn>

        <FadeIn>
          <AlgoSummary
            title="NLD Summary"
            items={[
              { label: 'Strengths', text: 'Simple, intuitive, well-established in string matching.' },
              { label: 'Weaknesses', text: 'Discretization is lossy — spatial precision is sacrificed. The result is sensitive to grid size choice.' },
              { label: 'Output', text: 'A single score from 0 (identical) to 1 (completely different).' },
            ]}
          />
        </FadeIn>
      </div>
    </section>
  );
}
