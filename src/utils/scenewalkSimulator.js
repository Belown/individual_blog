/**
 * SceneWalk Scanpath Simulator
 *
 * Primary reference:
 *   Engbert, R., Trukenbrod, H. A., Barthelmé, S., & Wichmann, F. A. (2015).
 *   Spatial statistics and attentional dynamics in scene perception.
 *   Journal of Vision, 15(1):14, 1–19. https://doi.org/10.1167/15.1.14
 *
 * Extended by (task-dependence and fixation durations):
 *   Schwetlick, L., Rothkegel, L. O. M., Trukenbrod, H. A., & Engbert, R. (2023).
 *   A dynamical scan-path model for task-dependence during scene viewing.
 *   Psychological Review, 130(3), 799–821. https://doi.org/10.1037/rev0000379
 *
 * Central fixation bias:
 *   Tatler, B. W. (2007). The central fixation bias in scene viewing: Selecting an
 *   optimal viewing position independently of motor biases and image feature
 *   distributions. Journal of Vision, 7(14):4. https://doi.org/10.1167/7.14.4
 *
 * Fixation duration model:
 *   Rayner, K. (1998). Eye movements in reading and information processing:
 *   20 years of research. Psychological Bulletin, 124(3), 372–422.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Core algorithm — at each fixation step k:
 *
 *   S(x)        Saliency landscape — built once from scene element properties.
 *               Each element contributes a spatial Gaussian blob weighted by its
 *               visual prominence (type, size, contrast, colour).
 *               Multiplied by a central-fixation-bias prior (Tatler, 2007).
 *
 *   u_k(x)      Local excitation — Gaussian centred on the current gaze position.
 *               σ_u ≈ 4–5 visual degrees (Engbert et al., 2015 §3).
 *               An ε-floor ensures non-zero probability for distal saccades.
 *               u_k(x) = (1 − ε) · exp(−‖x − x_k‖² / 2σ_u²) + ε
 *
 *   H_k(x)      Inhibition-of-Return map — spatially distributed IOR.
 *               Suppresses locations that were recently fixated.
 *               H_{k+1}(x) = λ · H_k(x) + (1−λ) · ρ · exp(−‖x−x_{k+1}‖² / 2σ_h²)
 *               (IOR decays with factor λ per fixation; new inhibition added at x_{k+1})
 *
 *   A_k(x)      Activation map — combination of excitation, saliency, and IOR:
 *               A_k(x) = [ u_k(x) · S(x) · (1 − H_k(x)) ]^ω
 *               The exponent ω sharpens (ω > 1) or flattens (ω < 1) the distribution.
 *
 *   x_{k+1}     Next fixation — sampled from P(x) ∝ A_k(x)  via roulette selection.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Implementation note:
 *   The canvas (800 × 600 px) is discretised into a GW × GH grid of 10 × 10 px cells.
 *   All spatial computations operate on this grid; fixation coordinates are then
 *   mapped back to pixel space with sub-cell jitter.
 *   At GW = 80, GH = 60 the grid has 4 800 cells — cheap enough for real-time JS.
 */

// Grid dimensions (10 px per cell for the default 800 × 600 canvas)
const GW = 80;
const GH = 60;

// ── Utilities ─────────────────────────────────────────────────────────────────

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2_147_483_647;
    return (s - 1) / 2_147_483_646;
  };
}

/** Un-normalised 2-D isotropic Gaussian evaluated at grid cell (gi, gj). */
function gauss2D(gi, gj, cx, cy, sigma) {
  const dx = gi - cx, dy = gj - cy;
  return Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
}

// ── Saliency landscape ────────────────────────────────────────────────────────

/**
 * Build per-cell saliency S(x) from structured UI elements.
 *
 * Each element contributes a "saliency blob":
 *   • Cells inside the element receive full weight w.
 *   • Cells outside receive w · exp(−d² / 2σ_spread²) · 0.22,
 *     modelling the Gaussian spread of low-level visual signals.
 *
 * The final map is multiplied cell-wise by a central-fixation-bias prior
 * (bivariate Gaussian slightly above screen centre; Tatler, 2007).
 */
function buildSaliencyMap(elements, canvasW = 800, canvasH = 600) {
  const cW = canvasW / GW; // pixels per grid cell (x)
  const cH = canvasH / GH; // pixels per grid cell (y)
  const S = new Float32Array(GW * GH).fill(0);

  // Base saliency weights — reflect empirical fixation rates per element category
  // (Rayner, 1998; Castelhano & Henderson, 2008)
  const typeWeight = { headline: 3.0, image: 2.6, cta: 2.4, ad: 2.5, text: 0.8 };
  const sigmaSpread = 2.8; // Gaussian spread outside element bounds (grid cells)

  for (const el of elements) {
    // Scale by element-specific visual properties
    let w = typeWeight[el.type] ?? 1.0;
    if (el.type === 'headline') w *= Math.sqrt((el.fontSize || 28) / 28);
    if (el.type === 'cta')      w *= (0.6 + 0.8 * (el.brightness || 0.5));
    if (el.type === 'image')    w *= Math.sqrt(el.size || 1);

    // Element bounds in grid coordinates
    const gx0 = el.x / cW;
    const gy0 = el.y / cH;
    const gx1 = (el.x + el.width) / cW;
    const gy1 = (el.y + el.height) / cH;

    for (let gi = 0; gi < GW; gi++) {
      for (let gj = 0; gj < GH; gj++) {
        const inside = gi >= gx0 && gi < gx1 && gj >= gy0 && gj < gy1;
        let val;
        if (inside) {
          val = w;
        } else {
          // Distance from nearest element edge (in grid cells)
          const dx = Math.max(0, gx0 - gi, gi - gx1);
          const dy = Math.max(0, gy0 - gj, gj - gy1);
          val = w * Math.exp(-(dx * dx + dy * dy) / (2 * sigmaSpread * sigmaSpread)) * 0.22;
        }
        const idx = gj * GW + gi;
        if (val > S[idx]) S[idx] = val; // take the highest-saliency element
      }
    }
  }

  // Central fixation bias (Tatler, 2007) ─────────────────────────────────────
  // Empirically, observers tend to fixate near the screen centre; for web pages
  // the bias is shifted slightly upward (Buswell, 1935; Rayner, 1998).
  // Modelled as a bivariate Gaussian prior multiplied into the saliency map.
  // σ_x ≈ 3.7°, σ_y ≈ 2.35° visual angle (Tatler, 2007; Rothkegel et al., 2017)
  // → at ~10 px/cell and ~35 px/degree: σ_x ≈ 13 cells, σ_y ≈ 8 cells.
  // We use slightly broader values to account for larger screen size and page context.
  const biasCX   = GW * 0.50; // horizontal centre of screen
  const biasCY   = GH * 0.38; // shifted above geometric centre
  const biasSigX = GW * 0.42;
  const biasSigY = GH * 0.38;

  for (let gi = 0; gi < GW; gi++) {
    for (let gj = 0; gj < GH; gj++) {
      const dx = (gi - biasCX) / biasSigX;
      const dy = (gj - biasCY) / biasSigY;
      const bias = Math.exp(-(dx * dx + dy * dy) / 2);
      S[gj * GW + gi] *= (0.35 + 0.65 * bias);
    }
  }

  // Floor — avoids zero-probability cells
  for (let i = 0; i < S.length; i++) {
    if (S[i] < 0.005) S[i] = 0.005;
  }

  return S;
}

// ── SceneWalk simulation ──────────────────────────────────────────────────────

export function simulateScanpath(elements, opts = {}) {
  const { numFixations = 6, seed = 42, canvasW = 800, canvasH = 600 } = opts;

  const rand = seededRandom(seed);
  const cW = canvasW / GW;
  const cH = canvasH / GH;

  const S = buildSaliencyMap(elements, canvasW, canvasH);

  // ── SceneWalk parameters ──────────────────────────────────────────────────
  //
  // sigmaU    Local excitation σ_u (Engbert et al., 2015, §3): ≈ 4–5 visual
  //           degrees. At the assumed ~10 px/cell and 35 px/° this corresponds
  //           to ≈ 14–18 grid cells. We use 16 cells (≈ 4.6°).
  //
  // epsilon   Exploration floor: ensures the local-excitation Gaussian never
  //           completely blocks distant high-saliency locations.
  //           u_k(x) = (1−ε) · Gauss(d, σ_u) + ε
  //
  // sigmaH    IOR spatial spread (grid cells): controls how many nearby cells
  //           are co-inhibited after a fixation.
  //
  // lambdaH   IOR decay factor per fixation (Engbert et al., 2015):
  //           H_{k+1} = λ · H_k + new inhibition
  //           Lower λ → faster decay (less persistent IOR).
  //
  // rhoIOR    Peak spatial IOR suppression at the fixated cell.
  //
  // rhoObject Object-based IOR (Tipper, Driver & Weaver, 1991): fixating a cell
  //           within an element suppresses all cells of that element uniformly.
  //           This prevents the eye from staying locked on large high-saliency
  //           elements by treating the element as a single inhibited object once
  //           it has been fixated, not just the fixated pixel cluster.
  //           Tipper, S. P., Driver, J., & Weaver, B. (1991). Object-centred
  //           inhibition of return of visual attention. Quarterly Journal of
  //           Experimental Psychology, 43A(2), 289–298.
  //
  // omega     Activation sharpening exponent (Engbert et al., 2015):
  //           A_k(x) = [u_k · S · (1−H_k)]^ω
  //           ω > 1 concentrates probability on the most active locations.
  //
  const sigmaU    = 16;   // local excitation σ_u (grid cells ≈ 160 px ≈ 4.6°)
  const epsilon   = 0.18; // exploration floor
  const sigmaH    = 5;    // IOR spatial spread (grid cells ≈ 50 px)
  const lambdaH   = 0.62; // IOR decay per fixation
  const rhoIOR    = 0.88; // peak spatial IOR suppression
  const rhoObject = 0.92; // object-based IOR suppression (applied to whole element)
  const omega     = 2.0;  // activation sharpening exponent

  // Inhibition-of-Return map — initialised to zero (no prior inhibition)
  const H = new Float32Array(GW * GH);

  // Initial gaze: slightly left of centre, near top of page
  // (consistent with first-fixation data on web pages; Nielsen & Pernice, 2010)
  let gx = GW * 0.07 + rand() * GW * 0.08;
  let gy = GH * 0.04 + rand() * GH * 0.05;

  const fixations = [];

  for (let step = 0; step < numFixations; step++) {

    // ── Build activation landscape A_k(x) ──────────────────────────────────
    const A = new Float32Array(GW * GH);
    let totalA = 0;

    for (let gi = 0; gi < GW; gi++) {
      for (let gj = 0; gj < GH; gj++) {
        const idx = gj * GW + gi;
        // Local excitation with exploration floor (Engbert et al., 2015 eq. 1)
        const u = (1 - epsilon) * gauss2D(gi, gj, gx, gy, sigmaU) + epsilon;
        // Combined activation (eq. 2 in Engbert et al., 2015)
        const raw = u * S[idx] * (1 - H[idx]);
        const a   = Math.pow(Math.max(raw, 1e-9), omega);
        A[idx] = a;
        totalA += a;
      }
    }

    // ── Sample next fixation (roulette-wheel / inverse CDF) ─────────────────
    let r = rand() * totalA;
    let sel = A.length - 1;
    for (let i = 0; i < A.length; i++) {
      r -= A[i];
      if (r <= 0) { sel = i; break; }
    }

    const ngi = sel % GW;                       // grid column of selected cell
    const ngj = Math.floor(sel / GW);           // grid row of selected cell

    // Sub-cell jitter → canvas pixel coordinates
    const fx = Math.max(5, Math.min(canvasW - 5,
      (ngi + 0.5 + (rand() - 0.5) * 0.7) * cW));
    const fy = Math.max(5, Math.min(canvasH - 5,
      (ngj + 0.5 + (rand() - 0.5) * 0.7) * cH));

    // ── Identify fixated element (for duration model + object-based IOR) ─────
    let elType = 'background';
    let fixatedEl = null;
    for (const el of elements) {
      if (fx >= el.x && fx <= el.x + el.width &&
          fy >= el.y && fy <= el.y + el.height) {
        elType = el.type;
        fixatedEl = el;
        break;
      }
    }

    // ── Fixation duration (Rayner, 1998; Castelhano et al., 2009) ───────────
    // Duration reflects cognitive processing load of the fixated content type.
    // Mean values are in the range reported for scene viewing (260–330 ms).
    const durBase = { headline: 240, text: 285, image: 210, cta: 195, ad: 155, background: 135 };
    const base    = durBase[elType] ?? 190;
    const duration = Math.max(80, base * (0.72 + rand() * 0.56));

    fixations.push({ x: fx, y: fy, duration, elementType: elType });

    // Advance gaze position to sampled grid cell
    gx = ngi;
    gy = ngj;

    // ── Update IOR map ──────────────────────────────────────────────────────
    // Combines two mechanisms:
    //   1. Spatial IOR   — Gaussian around the fixated cell (Engbert et al., 2015)
    //      H_{k+1}(x) = λ · H_k(x) + (1−λ) · ρ_spatial · N(x; x_{k+1}, σ_h)
    //   2. Object-based IOR — uniform suppression across the entire fixated element
    //      (Tipper, Driver & Weaver, 1991): prevents large high-saliency elements
    //      from capturing all fixations by inhibiting the whole object at once.
    //      Cells inside the element receive max(spatial, ρ_object).
    const elGx0 = fixatedEl ? fixatedEl.x / cW : -1;
    const elGy0 = fixatedEl ? fixatedEl.y / cH : -1;
    const elGx1 = fixatedEl ? (fixatedEl.x + fixatedEl.width)  / cW : -1;
    const elGy1 = fixatedEl ? (fixatedEl.y + fixatedEl.height) / cH : -1;

    for (let gi = 0; gi < GW; gi++) {
      for (let gj = 0; gj < GH; gj++) {
        const idx        = gj * GW + gi;
        const spatialIOR = rhoIOR * gauss2D(gi, gj, ngi, ngj, sigmaH);
        const inElement  = fixatedEl &&
          gi >= elGx0 && gi < elGx1 && gj >= elGy0 && gj < elGy1;
        const newIOR = inElement ? Math.max(spatialIOR, rhoObject) : spatialIOR;
        H[idx] = Math.min(1, lambdaH * H[idx] + (1 - lambdaH) * newIOR);
      }
    }
  }

  return fixations;
}

// ── Drawing helpers (unchanged API) ──────────────────────────────────────────

export function drawPageElements(ctx, elements, sx, sy) {
  for (const el of elements) {
    const ex = el.x * sx, ey = el.y * sy, ew = el.width * sx, eh = el.height * sy;
    switch (el.type) {
      case 'headline':
        ctx.fillStyle = el.color || '#2c2c2c';
        ctx.font = `bold ${Math.max(10, (el.fontSize || 28) * sx)}px Inter, sans-serif`;
        ctx.textBaseline = 'top';
        ctx.fillText(el.text || 'Headline', ex, ey);
        break;
      case 'text':
        ctx.fillStyle = '#e0dcd5';
        for (let i = 0; i < Math.floor(eh / (12 * sy)); i++)
          ctx.fillRect(ex, ey + i * 12 * sy, ew * (0.6 + Math.abs(Math.sin(i * 2.5)) * 0.4), 4 * sy);
        break;
      case 'image':
        ctx.fillStyle = '#f0ede8'; ctx.fillRect(ex, ey, ew, eh);
        ctx.strokeStyle = '#ddd8d0'; ctx.lineWidth = 1; ctx.strokeRect(ex, ey, ew, eh);
        ctx.fillStyle = '#ddd8d0'; ctx.beginPath();
        ctx.moveTo(ex, ey + eh); ctx.lineTo(ex + ew * 0.4, ey + eh * 0.35);
        ctx.lineTo(ex + ew * 0.7, ey + eh * 0.6); ctx.lineTo(ex + ew, ey + eh); ctx.fill();
        break;
      case 'cta': {
        ctx.fillStyle = el.color || '#1a8a6a';
        const cr = 5 * sx;
        ctx.beginPath(); ctx.moveTo(ex + cr, ey); ctx.lineTo(ex + ew - cr, ey);
        ctx.quadraticCurveTo(ex + ew, ey, ex + ew, ey + cr); ctx.lineTo(ex + ew, ey + eh - cr);
        ctx.quadraticCurveTo(ex + ew, ey + eh, ex + ew - cr, ey + eh); ctx.lineTo(ex + cr, ey + eh);
        ctx.quadraticCurveTo(ex, ey + eh, ex, ey + eh - cr); ctx.lineTo(ex, ey + cr);
        ctx.quadraticCurveTo(ex, ey, ex + cr, ey); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = `600 ${Math.max(8, 11 * sx)}px Inter, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('Get Started', ex + ew / 2, ey + eh / 2);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        break;
      }
      case 'ad':
        ctx.fillStyle = el.color || '#d4553a'; ctx.globalAlpha = 0.15;
        ctx.fillRect(ex, ey, ew, eh); ctx.globalAlpha = 1;
        ctx.strokeStyle = el.color || '#d4553a'; ctx.setLineDash([3, 3]);
        ctx.strokeRect(ex, ey, ew, eh); ctx.setLineDash([]);
        ctx.fillStyle = el.color || '#d4553a';
        ctx.font = `bold ${Math.max(8, 10 * sx)}px Inter, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('AD', ex + ew / 2, ey + eh / 2);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        break;
      default:
        ctx.fillStyle = '#f0ede8'; ctx.fillRect(ex, ey, ew, eh);
    }
  }
}

export function drawScanpath(ctx, shown, sx, sy) {
  if (!shown.length) return;
  for (let i = 1; i < shown.length; i++) {
    const x1 = shown[i - 1].x * sx, y1 = shown[i - 1].y * sy;
    const x2 = shown[i].x * sx,     y2 = shown[i].y * sy;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
    const curv = len * 0.12 * (i % 2 === 0 ? 1 : -1);
    const cpx = len > 0 ? mx + (-dy / len) * curv : mx;
    const cpy = len > 0 ? my + (dx / len) * curv : my;
    const rec = i / shown.length;
    const alpha = (0.2 + 0.5 * rec).toFixed(2);
    ctx.strokeStyle = `rgba(107,92,165,${alpha})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cpx, cpy, x2, y2); ctx.stroke();
    const angle = Math.atan2(y2 - cpy, x2 - cpx);
    ctx.fillStyle = `rgba(107,92,165,${alpha})`; ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 6 * Math.cos(angle - 0.4), y2 - 6 * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - 6 * Math.cos(angle + 0.4), y2 - 6 * Math.sin(angle + 0.4)); ctx.fill();
  }
  const minD = Math.min(...shown.map(f => f.duration));
  const maxD = Math.max(...shown.map(f => f.duration));
  const dR = Math.max(1, maxD - minD);
  for (let i = 0; i < shown.length; i++) {
    const f = shown[i], fx = f.x * sx, fy = f.y * sy;
    const rec = (i + 1) / shown.length;
    const r = Math.max(5, (5 + 7 * (f.duration - minD) / dR)) * Math.min(sx, 1.2);
    ctx.fillStyle = `rgba(26,138,106,${(0.06 + 0.1 * rec).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(fx, fy, r + 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(26,138,106,${(0.35 + 0.55 * rec).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${(0.5 + 0.5 * rec).toFixed(2)})`;
    ctx.font = `bold ${Math.max(7, 9 * sx)}px Inter, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${i + 1}`, fx, fy);
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}
