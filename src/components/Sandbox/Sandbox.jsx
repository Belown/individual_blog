import { useState, useEffect, useRef, useCallback } from 'react';
import AlgoPill from '../shared/AlgoPill';
import { Button, FadeIn } from '../shared';
import { NLD, ScaSim, MultiMatch } from '../../utils/algorithms';
import { setupCanvas, clearCanvas, drawScanpath, drawGrid, COLORS, SAMPLE_SCANPATHS } from '../../utils/canvasHelpers';
import styles from './Sandbox.module.css';

export default function Sandbox() {
  const [fixationsA, setFixationsA] = useState([]);
  const [fixationsB, setFixationsB] = useState([]);
  const [activePath, setActivePath] = useState('a');
  const [gridSize, setGridSize] = useState(4);
  const [simplifyThreshold, setSimplifyThreshold] = useState(50);
  const [results, setResults] = useState({ nld: null, scasim: null, mm: null });
  const canvasRef = useRef(null);

  const drawCanvas = useCallback(() => {
    const result = setupCanvas(canvasRef.current);
    if (!result) return;
    const { ctx, width, height } = result;
    clearCanvas(ctx, width, height);

    drawGrid(ctx, gridSize, width, height, false);

    if (fixationsA.length > 0) {
      drawScanpath(ctx, fixationsA, COLORS.scanpathA, true);
    }
    if (fixationsB.length > 0) {
      drawScanpath(ctx, fixationsB, COLORS.scanpathB, true);
    }
  }, [fixationsA, fixationsB, gridSize]);

  const computeResults = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (fixationsA.length < 2 || fixationsB.length < 2) {
      setResults({ nld: null, scasim: null, mm: null });
      return;
    }

    const nldResult = NLD.fromFixations(fixationsA, fixationsB, gridSize, width, height);
    const scasimResult = ScaSim.compute(fixationsA, fixationsB);
    const mmResult = MultiMatch.compute(fixationsA, fixationsB, simplifyThreshold);
    const avgMM = (mmResult.shape + mmResult.direction + mmResult.length + mmResult.position + mmResult.duration) / 5;

    setResults({
      nld: { score: nldResult.nld, detail: `"${nldResult.strA}" → "${nldResult.strB}" (dist=${nldResult.distance})` },
      scasim: { score: scasimResult.normalized, detail: `${scasimResult.normalized.toFixed(1)} px/pair (total=${scasimResult.cost.toFixed(0)}px)` },
      mm: {
        score: avgMM,
        detail: `Sh=${mmResult.shape.toFixed(2)} Di=${mmResult.direction.toFixed(2)} Le=${mmResult.length.toFixed(2)} Po=${mmResult.position.toFixed(2)} Du=${mmResult.duration.toFixed(2)}`
      }
    });
  }, [fixationsA, fixationsB, gridSize, simplifyThreshold]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    computeResults();
  }, [computeResults]);

  useEffect(() => {
    window.addEventListener('resize', drawCanvas);
    return () => window.removeEventListener('resize', drawCanvas);
  }, [drawCanvas]);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const fixation = { x, y, duration: 200 };

    if (activePath === 'a') {
      setFixationsA(prev => [...prev, fixation]);
    } else {
      setFixationsB(prev => [...prev, fixation]);
    }
  };

  const handleClear = () => {
    setFixationsA([]);
    setFixationsB([]);
    setActivePath('a');
  };

  const handleLoadExample = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / 600;
    const scaleY = rect.height / 400;
    setFixationsA(SAMPLE_SCANPATHS.a.map(f => ({ x: f.x * scaleX, y: f.y * scaleY, duration: f.duration })));
    setFixationsB(SAMPLE_SCANPATHS.b.map(f => ({ x: f.x * scaleX, y: f.y * scaleY, duration: f.duration })));
  };

  const getInstructionText = () => {
    if (fixationsA.length === 0 && activePath === 'a') {
      return <>👆 Click on the canvas to place fixations for <strong style={{ color: 'var(--scanpath-a, #6c8aff)' }}>Scanpath A</strong></>;
    }
    if (activePath === 'a') {
      return <>👆 Keep clicking to add more fixations to <strong style={{ color: '#6c8aff' }}>Scanpath A</strong>, or switch to B</>;
    }
    if (fixationsB.length === 0 && activePath === 'b') {
      return <>👆 Click on the canvas to place fixations for <strong style={{ color: '#ff8a65' }}>Scanpath B</strong></>;
    }
    if (activePath === 'b') {
      return <>👆 Keep clicking to add more fixations to <strong style={{ color: '#ff8a65' }}>Scanpath B</strong></>;
    }
    return null;
  };

  return (
    <section className={styles.section} id="sandbox-section">
      <div className={styles.container}>
        <h2>🎨 Draw Your Own Scanpaths</h2>
        <p>
          Now it's your turn. Draw two scanpaths on the canvas below and see how each algorithm
          scores their similarity. Click to place fixations, and the scanpath will be drawn automatically.
        </p>

        <FadeIn>
          <div className={styles.sandboxContainer}>
            <div className={styles.toolbar}>
              <div className={styles.drawingControls}>
                <Button
                  variant={activePath === 'a' ? 'primary' : 'secondary'}
                  active={activePath === 'a'}
                  onClick={() => setActivePath('a')}
                >
                  Draw Scanpath A
                </Button>
                <Button
                  variant={activePath === 'b' ? 'primary' : 'secondary'}
                  active={activePath === 'b'}
                  onClick={() => setActivePath('b')}
                >
                  Draw Scanpath B
                </Button>
                <Button variant="danger" onClick={handleClear}>Clear All</Button>
                <Button variant="secondary" onClick={handleLoadExample}>Load Example</Button>
              </div>
              <div className={styles.params}>
                <div className={styles.param}>
                  <label>NLD Grid: <span className={styles.paramValue}>{gridSize}×{gridSize}</span></label>
                  <input
                    type="range"
                    className={styles.paramSlider}
                    min={2}
                    max={8}
                    value={gridSize}
                    onChange={e => setGridSize(Number(e.target.value))}
                  />
                </div>
                <div className={styles.param}>
                  <label>MM Simplify: <span className={styles.paramValue}>{simplifyThreshold}px</span></label>
                  <input
                    type="range"
                    className={styles.paramSlider}
                    min={0}
                    max={150}
                    step={5}
                    value={simplifyThreshold}
                    onChange={e => setSimplifyThreshold(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className={styles.canvasWrapper}>
              <canvas
                ref={canvasRef}
                width={700}
                height={500}
                onClick={handleCanvasClick}
                style={{ width: '100%', height: 'auto', borderRadius: 8, background: '#232635', border: '1px solid #2d3044', cursor: 'crosshair' }}
              />
              <div className={`${styles.instructions} ${fixationsA.length > 0 && fixationsB.length > 0 ? styles.hidden : ''}`}>
                <p>{getInstructionText()}</p>
              </div>
            </div>

            <div className={styles.results}>
              <h3>Similarity Scores</h3>
              <div className={styles.resultCards}>
                <div className={styles.resultCard}>
                  <h4><AlgoPill type="nld" size="small">NLD</AlgoPill></h4>
                  <div className={`${styles.resultScore} ${styles.nldScore}`}>
                    {results.nld ? results.nld.score.toFixed(3) : '—'}
                  </div>
                  <div className={styles.resultDetail}>
                    {results.nld ? results.nld.detail : 'Need ≥2 fixations each'}
                  </div>
                </div>
                <div className={styles.resultCard}>
                  <h4><AlgoPill type="scasim" size="small">ScaSim</AlgoPill></h4>
                  <div className={`${styles.resultScore} ${styles.scasimScore}`}>
                    {results.scasim ? results.scasim.score.toFixed(1) : '—'}
                  </div>
                  <div className={styles.resultDetail}>
                    {results.scasim ? results.scasim.detail : 'Need ≥2 fixations each'}
                  </div>
                </div>
                <div className={styles.resultCard}>
                  <h4><AlgoPill type="multimatch" size="small">MultiMatch</AlgoPill></h4>
                  <div className={`${styles.resultScore} ${styles.mmScore}`}>
                    {results.mm ? results.mm.score.toFixed(3) : '—'}
                  </div>
                  <div className={styles.resultDetail}>
                    {results.mm ? results.mm.detail : 'Need ≥2 fixations each'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
