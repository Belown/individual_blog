/**
 * algorithms.js
 * Core implementations of NLD, ScaSim, and MultiMatch algorithms.
 */

export function euclidean(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function angleBetween(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

export function vectorLength(p1, p2) {
  return euclidean(p1, p2);
}

// ===== NLD (Normalized Levenshtein Distance) =====

export const NLD = {
  discretize(fixations, gridSize, width, height) {
    const cellW = width / gridSize;
    const cellH = height / gridSize;
    let str = '';
    for (const f of fixations) {
      const col = Math.min(Math.floor(f.x / cellW), gridSize - 1);
      const row = Math.min(Math.floor(f.y / cellH), gridSize - 1);
      const idx = row * gridSize + col;
      str += String.fromCharCode(65 + idx);
    }
    return str;
  },

  levenshtein(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    const matrix = [];

    for (let i = 0; i <= m; i++) {
      matrix[i] = [];
      for (let j = 0; j <= n; j++) {
        if (i === 0) {
          matrix[i][j] = j;
        } else if (j === 0) {
          matrix[i][j] = i;
        } else {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }
    }

    const path = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      path.unshift([i, j]);
      if (i > 0 && j > 0) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        if (matrix[i][j] === matrix[i - 1][j - 1] + cost) {
          i--; j--;
        } else if (matrix[i][j] === matrix[i - 1][j] + 1) {
          i--;
        } else {
          j--;
        }
      } else if (i > 0) {
        i--;
      } else {
        j--;
      }
    }
    path.unshift([0, 0]);

    return { distance: matrix[m][n], matrix, path };
  },

  compute(s1, s2) {
    const { distance } = this.levenshtein(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    return maxLen === 0 ? 0 : distance / maxLen;
  },

  fromFixations(fixA, fixB, gridSize, width, height) {
    const strA = this.discretize(fixA, gridSize, width, height);
    const strB = this.discretize(fixB, gridSize, width, height);
    const { distance, matrix, path } = this.levenshtein(strA, strB);
    const maxLen = Math.max(strA.length, strB.length);
    const nld = maxLen === 0 ? 0 : distance / maxLen;
    return { strA, strB, distance, nld, matrix, path };
  }
};

// ===== ScaSim =====

export const ScaSim = {
  compute(pathA, pathB, gapPenalty = 0.5) {
    if (pathA.length === 0 || pathB.length === 0) {
      return { cost: Infinity, normalized: Infinity, alignment: [] };
    }

    const m = pathA.length;
    const n = pathB.length;
    const avgSaccade = 50;

    function subCost(i, j) {
      return euclidean(pathA[i], pathB[j]);
    }
    function gapCost() {
      return gapPenalty * avgSaccade;
    }

    const score = [];
    const trace = [];
    for (let i = 0; i <= m; i++) {
      score[i] = [];
      trace[i] = [];
      for (let j = 0; j <= n; j++) {
        if (i === 0 && j === 0) {
          score[i][j] = 0;
          trace[i][j] = -1;
        } else if (i === 0) {
          score[i][j] = score[i][j - 1] + gapCost();
          trace[i][j] = 2;
        } else if (j === 0) {
          score[i][j] = score[i - 1][j] + gapCost();
          trace[i][j] = 1;
        } else {
          const diag = score[i - 1][j - 1] + subCost(i - 1, j - 1);
          const up = score[i - 1][j] + gapCost();
          const left = score[i][j - 1] + gapCost();
          const minVal = Math.min(diag, up, left);
          score[i][j] = minVal;
          if (minVal === diag) trace[i][j] = 0;
          else if (minVal === up) trace[i][j] = 1;
          else trace[i][j] = 2;
        }
      }
    }

    const alignment = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && trace[i][j] === 0) {
        alignment.unshift({ type: 'match', a: i - 1, b: j - 1, cost: subCost(i - 1, j - 1) });
        i--; j--;
      } else if (i > 0 && trace[i][j] === 1) {
        alignment.unshift({ type: 'gap-b', a: i - 1, b: null, cost: gapCost() });
        i--;
      } else {
        alignment.unshift({ type: 'gap-a', a: null, b: j - 1, cost: gapCost() });
        j--;
      }
    }

    const totalCost = score[m][n];
    const numAligned = alignment.length;
    const normalized = numAligned === 0 ? 0 : totalCost / numAligned;

    return { cost: totalCost, normalized, alignment };
  }
};

// ===== MultiMatch =====

export const MultiMatch = {
  simplify(fixations, threshold) {
    if (fixations.length <= 2 || threshold === 0) {
      return fixations.map(f => ({ ...f, duration: f.duration || 200 }));
    }

    const result = [{ ...fixations[0], duration: fixations[0].duration || 200 }];

    for (let i = 1; i < fixations.length; i++) {
      const last = result[result.length - 1];
      const dist = euclidean(last, fixations[i]);

      if (dist < threshold) {
        const d1 = last.duration || 200;
        const d2 = fixations[i].duration || 200;
        const total = d1 + d2;
        last.x = (last.x * d1 + fixations[i].x * d2) / total;
        last.y = (last.y * d1 + fixations[i].y * d2) / total;
        last.duration = total;
      } else {
        result.push({ ...fixations[i], duration: fixations[i].duration || 200 });
      }
    }

    return result;
  },

  compute(pathA, pathB, simplifyThreshold = 50) {
    if (pathA.length < 2 || pathB.length < 2) {
      return { shape: 0, direction: 0, length: 0, position: 0, duration: 0, simplifiedA: pathA, simplifiedB: pathB };
    }

    const simpA = this.simplify(pathA, simplifyThreshold);
    const simpB = this.simplify(pathB, simplifyThreshold);

    const minLen = Math.min(simpA.length, simpB.length);
    const alignedA = simpA.slice(0, minLen);
    const alignedB = simpB.slice(0, minLen);

    if (minLen < 2) {
      return { shape: 0, direction: 0, length: 0, position: 0, duration: 0, simplifiedA: simpA, simplifiedB: simpB };
    }

    const numSaccades = minLen - 1;
    const sacA = [], sacB = [];
    for (let i = 0; i < numSaccades; i++) {
      sacA.push({
        dx: alignedA[i + 1].x - alignedA[i].x,
        dy: alignedA[i + 1].y - alignedA[i].y,
        angle: angleBetween(alignedA[i], alignedA[i + 1]),
        length: vectorLength(alignedA[i], alignedA[i + 1])
      });
      sacB.push({
        dx: alignedB[i + 1].x - alignedB[i].x,
        dy: alignedB[i + 1].y - alignedB[i].y,
        angle: angleBetween(alignedB[i], alignedB[i + 1]),
        length: vectorLength(alignedB[i], alignedB[i + 1])
      });
    }

    let shapeTotal = 0;
    for (let i = 0; i < numSaccades; i++) {
      const dot = sacA[i].dx * sacB[i].dx + sacA[i].dy * sacB[i].dy;
      const magA = sacA[i].length;
      const magB = sacB[i].length;
      if (magA > 0 && magB > 0) {
        shapeTotal += (dot / (magA * magB) + 1) / 2;
      }
    }
    const shapeSim = numSaccades > 0 ? shapeTotal / numSaccades : 0;

    let dirTotal = 0;
    for (let i = 0; i < numSaccades; i++) {
      let diff = Math.abs(sacA[i].angle - sacB[i].angle);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      dirTotal += 1 - diff / Math.PI;
    }
    const dirSim = numSaccades > 0 ? dirTotal / numSaccades : 0;

    let lenTotal = 0;
    for (let i = 0; i < numSaccades; i++) {
      const maxL = Math.max(sacA[i].length, sacB[i].length);
      if (maxL > 0) {
        lenTotal += 1 - Math.abs(sacA[i].length - sacB[i].length) / maxL;
      } else {
        lenTotal += 1;
      }
    }
    const lenSim = numSaccades > 0 ? lenTotal / numSaccades : 0;

    const maxDist = Math.sqrt(700 * 700 + 500 * 500);
    let posTotal = 0;
    for (let i = 0; i < minLen; i++) {
      const dist = euclidean(alignedA[i], alignedB[i]);
      posTotal += 1 - dist / maxDist;
    }
    const posSim = minLen > 0 ? posTotal / minLen : 0;

    let durTotal = 0;
    for (let i = 0; i < minLen; i++) {
      const dA = alignedA[i].duration || 200;
      const dB = alignedB[i].duration || 200;
      const maxD = Math.max(dA, dB);
      if (maxD > 0) {
        durTotal += 1 - Math.abs(dA - dB) / maxD;
      } else {
        durTotal += 1;
      }
    }
    const durSim = minLen > 0 ? durTotal / minLen : 0;

    return {
      shape: Math.max(0, Math.min(1, shapeSim)),
      direction: Math.max(0, Math.min(1, dirSim)),
      length: Math.max(0, Math.min(1, lenSim)),
      position: Math.max(0, Math.min(1, posSim)),
      duration: Math.max(0, Math.min(1, durSim)),
      simplifiedA: simpA,
      simplifiedB: simpB
    };
  }
};
