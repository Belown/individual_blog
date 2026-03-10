/**
 * canvasHelpers.js
 * Canvas-based rendering utilities for scanpath visualizations.
 */

export const COLORS = {
  scanpathA: '#6c8aff',
  scanpathB: '#ff8a65',
  scanpathADim: 'rgba(108, 138, 255, 0.3)',
  scanpathBDim: 'rgba(255, 138, 101, 0.3)',
  grid: 'rgba(255, 255, 255, 0.08)',
  gridText: 'rgba(255, 255, 255, 0.25)',
  bg: '#232635',
  bgLight: '#2d3044',
  text: '#e4e6f0',
  textMuted: '#9396a5',
  accent: '#6c8aff',
  nld: '#ff6b8a',
  scasim: '#4ecdc4',
  multimatch: '#ffd166',
  link: 'rgba(255, 255, 255, 0.15)',
  white: '#ffffff'
};

export const SAMPLE_SCANPATHS = {
  a: [
    { x: 80, y: 60, duration: 220 },
    { x: 200, y: 100, duration: 180 },
    { x: 350, y: 80, duration: 300 },
    { x: 450, y: 200, duration: 150 },
    { x: 400, y: 320, duration: 250 },
    { x: 250, y: 300, duration: 200 },
    { x: 150, y: 250, duration: 170 },
  ],
  b: [
    { x: 100, y: 80, duration: 200 },
    { x: 220, y: 120, duration: 160 },
    { x: 320, y: 110, duration: 280 },
    { x: 480, y: 180, duration: 140 },
    { x: 420, y: 300, duration: 230 },
    { x: 300, y: 330, duration: 210 },
    { x: 120, y: 280, duration: 190 },
  ]
};

export function setupCanvas(canvas) {
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  return { ctx, width: rect.width, height: rect.height };
}

export function clearCanvas(ctx, width, height) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);
}

export function drawFixation(ctx, x, y, radius, color, alpha = 1) {
  ctx.globalAlpha = alpha * 0.3;
  ctx.beginPath();
  ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawSaccade(ctx, x1, y1, x2, y2, color, alpha = 0.6, lineWidth = 2) {
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function drawScanpath(ctx, fixations, color, showNumbers = false, fixationScale = 1) {
  for (let i = 0; i < fixations.length - 1; i++) {
    drawSaccade(ctx, fixations[i].x, fixations[i].y,
      fixations[i + 1].x, fixations[i + 1].y, color, 0.5);
  }
  for (let i = 0; i < fixations.length; i++) {
    const dur = fixations[i].duration || 200;
    const radius = (Math.sqrt(dur / 100) * 4 + 3) * fixationScale;
    drawFixation(ctx, fixations[i].x, fixations[i].y, radius, color);
    if (showNumbers) {
      ctx.fillStyle = COLORS.white;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), fixations[i].x, fixations[i].y);
    }
  }
}

export function drawGrid(ctx, gridSize, width, height, showLabels = true) {
  const cellW = width / gridSize;
  const cellH = height / gridSize;

  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;

  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellW, 0);
    ctx.lineTo(i * cellW, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cellH);
    ctx.lineTo(width, i * cellH);
    ctx.stroke();
  }

  if (showLabels) {
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.gridText;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const idx = row * gridSize + col;
        if (idx < 26) {
          const letter = String.fromCharCode(65 + idx);
          ctx.fillText(letter, col * cellW + cellW / 2, row * cellH + cellH / 2);
        }
      }
    }
  }
}

export function highlightFixationCells(ctx, fixations, gridSize, width, height, color) {
  const cellW = width / gridSize;
  const cellH = height / gridSize;

  for (const f of fixations) {
    const col = Math.min(Math.floor(f.x / cellW), gridSize - 1);
    const row = Math.min(Math.floor(f.y / cellH), gridSize - 1);

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.12;
    ctx.fillRect(col * cellW + 1, row * cellH + 1, cellW - 2, cellH - 2);
    ctx.globalAlpha = 1;
  }
}
