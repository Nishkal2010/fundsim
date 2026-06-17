// Shared numeric core for the Quant simulator engines.
//
// No external math library — every primitive here is hand-built and tested
// against closed-form golden values (see __tests__/quant/stats.test.ts).
// Determinism is a hard requirement: all randomness flows through a seeded
// LCG so a given seed always reproduces the same paths (mirrors the LCG in
// portfolio.ts), which makes Monte Carlo results shareable and testable.

// ─── Seeded PRNG ────────────────────────────────────────────────────────────
// Numerical Recipes LCG constants. Returns a generator of uniforms in [0,1).
// Same constants as portfolio.ts's seededRand so behavior is consistent.
export function seededRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// ─── Normal distribution ────────────────────────────────────────────────────
export function normalPDF(x: number, mean = 0, sd = 1): number {
  const z = (x - mean) / sd;
  return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
}

// Standard normal CDF via Abramowitz & Stegun 26.2.17 (|error| < 7.5e-8).
export function normalCDF(x: number, mean = 0, sd = 1): number {
  const z = (x - mean) / sd;
  const sign = z < 0 ? -1 : 1;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = normalPDF(Math.abs(z));
  const p =
    d *
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return 0.5 + sign * (0.5 - p);
}

// Inverse standard normal CDF — Acklam's rational approximation
// (|error| < 1.15e-9 in the central region, refined by one Halley step).
export function inverseNormalCDF(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let x: number;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    x =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x =
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  // One Halley refinement step against the A&S CDF.
  const e = normalCDF(x) - p;
  const u = e * Math.sqrt(2 * Math.PI) * Math.exp((x * x) / 2);
  x = x - u / (1 + (x * u) / 2);
  return x;
}

// ─── Normal sampling (Box-Muller) ───────────────────────────────────────────
// Draws one standard-normal variate from a uniform generator. Box-Muller
// produces pairs; we cache the second to avoid wasting draws.
export function makeNormalSampler(rng: () => number): () => number {
  let spare: number | null = null;
  return () => {
    if (spare !== null) {
      const v = spare;
      spare = null;
      return v;
    }
    let u1 = 0;
    let u2 = 0;
    // Guard against log(0).
    while (u1 <= Number.EPSILON) u1 = rng();
    u2 = rng();
    const mag = Math.sqrt(-2 * Math.log(u1));
    spare = mag * Math.sin(2 * Math.PI * u2);
    return mag * Math.cos(2 * Math.PI * u2);
  };
}

// ─── Moments & descriptive stats ────────────────────────────────────────────
export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

// Sample variance (Bessel-corrected, n−1). Returns 0 for n < 2.
export function variance(xs: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) * (x - m), 0) / (n - 1);
}

export function std(xs: number[]): number {
  return Math.sqrt(variance(xs));
}

// Sample covariance (n−1). Arrays must be equal length.
export function covariance(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2 || ys.length !== n) return 0;
  const mx = mean(xs);
  const my = mean(ys);
  let s = 0;
  for (let i = 0; i < n; i++) s += (xs[i] - mx) * (ys[i] - my);
  return s / (n - 1);
}

export function correlation(xs: number[], ys: number[]): number {
  const sx = std(xs);
  const sy = std(ys);
  if (sx === 0 || sy === 0) return 0;
  return covariance(xs, ys) / (sx * sy);
}

// Covariance matrix of column vectors (each entry of `series` is one variable's
// observations). Returns a symmetric n×n matrix.
export function covarianceMatrix(series: number[][]): number[][] {
  const n = series.length;
  const m: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const c = covariance(series[i], series[j]);
      m[i][j] = c;
      m[j][i] = c;
    }
  }
  return m;
}

// Percentile via linear interpolation between closest ranks (p in [0,100]).
export function percentile(xs: number[], p: number): number {
  if (xs.length === 0) return NaN;
  const sorted = [...xs].sort((a, b) => a - b);
  if (sorted.length === 1) return sorted[0];
  const rank = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  const frac = rank - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

// Quantile is percentile with q in [0,1].
export function quantile(xs: number[], q: number): number {
  return percentile(xs, q * 100);
}

export function skewness(xs: number[]): number {
  const n = xs.length;
  if (n < 3) return 0;
  const m = mean(xs);
  const s = std(xs);
  if (s === 0) return 0;
  const sum = xs.reduce((acc, x) => acc + ((x - m) / s) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * sum;
}

// Excess kurtosis (normal → 0), sample-corrected.
export function kurtosis(xs: number[]): number {
  const n = xs.length;
  if (n < 4) return 0;
  const m = mean(xs);
  const s = std(xs);
  if (s === 0) return 0;
  const sum = xs.reduce((acc, x) => acc + ((x - m) / s) ** 4, 0);
  const a = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
  const b = (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
  return a * sum - b;
}

// ─── Small linear algebra (kept minimal — no general LA library) ─────────────
export function transpose(a: number[][]): number[][] {
  const rows = a.length;
  const cols = a[0]?.length ?? 0;
  const t: number[][] = Array.from({ length: cols }, () => new Array(rows));
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) t[j][i] = a[i][j];
  return t;
}

export function matMul(a: number[][], b: number[][]): number[][] {
  const n = a.length;
  const m = b[0].length;
  const k = b.length;
  const out: number[][] = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++)
    for (let p = 0; p < k; p++) {
      const aip = a[i][p];
      for (let j = 0; j < m; j++) out[i][j] += aip * b[p][j];
    }
  return out;
}

export function matVec(a: number[][], v: number[]): number[] {
  return a.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
}

export function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

// Cholesky decomposition: lower-triangular L with L·Lᵀ = A (A symmetric PD).
// Used to draw correlated normals: correlated = L · independent.
export function cholesky(a: number[][]): number[][] {
  const n = a.length;
  const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
      if (i === j) {
        const d = a[i][i] - sum;
        // Clamp tiny negatives from floating error to 0.
        L[i][j] = Math.sqrt(Math.max(0, d));
      } else {
        L[i][j] = L[j][j] === 0 ? 0 : (a[i][j] - sum) / L[j][j];
      }
    }
  }
  return L;
}

// Inverse of a symmetric matrix via Gauss-Jordan with partial pivoting.
// Intended for small N (portfolio optimization on a handful of assets).
export function invertMatrix(a: number[][]): number[][] {
  const n = a.length;
  const M = a.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++)
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    if (Math.abs(M[pivot][col]) < 1e-15)
      throw new Error("invertMatrix: matrix is singular");
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const pv = M[col][col];
    for (let j = 0; j < 2 * n; j++) M[col][j] /= pv;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      for (let j = 0; j < 2 * n; j++) M[r][j] -= factor * M[col][j];
    }
  }
  return M.map((row) => row.slice(n));
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}
