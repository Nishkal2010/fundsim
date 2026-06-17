// Stochastic price-path simulation.
//
// All paths are driven by a seeded normal sampler so a given seed reproduces
// the same paths exactly. Time is in years; steps slice [0,T] uniformly.

import { makeNormalSampler, cholesky, seededRand } from "./stats";
import type { PricePath, PathStats } from "./types";

// Geometric Brownian Motion via the exact log-Euler scheme:
//   S_{t+Δ} = S_t · exp((μ − σ²/2)·Δ + σ·√Δ·Z),  Z ~ N(0,1)
// This is exact (not an approximation) because GBM has a closed-form
// transition density. With σ = 0 the path is deterministic: S0·exp(μt).
export function gbmPath(
  s0: number,
  mu: number,
  sigma: number,
  T: number,
  steps: number,
  sample: () => number,
): PricePath {
  const dt = T / steps;
  const drift = (mu - 0.5 * sigma * sigma) * dt;
  const vol = sigma * Math.sqrt(dt);
  const path: PricePath = new Array(steps + 1);
  path[0] = s0;
  for (let i = 1; i <= steps; i++) {
    path[i] = path[i - 1] * Math.exp(drift + vol * sample());
  }
  return path;
}

// Merton jump-diffusion: GBM plus compound-Poisson lognormal jumps.
//   λ = expected jumps per year, jump size ~ lognormal(jumpMean, jumpStd) in log.
export function jumpDiffusionPath(
  s0: number,
  mu: number,
  sigma: number,
  lambda: number,
  jumpMean: number,
  jumpStd: number,
  T: number,
  steps: number,
  sample: () => number,
  rng: () => number,
): PricePath {
  const dt = T / steps;
  const drift = (mu - 0.5 * sigma * sigma) * dt;
  const vol = sigma * Math.sqrt(dt);
  const path: PricePath = new Array(steps + 1);
  path[0] = s0;
  for (let i = 1; i <= steps; i++) {
    let logStep = drift + vol * sample();
    // Number of jumps this interval ~ Poisson(λ·dt), drawn via Knuth.
    const nJumps = poisson(lambda * dt, rng);
    for (let j = 0; j < nJumps; j++) {
      logStep += jumpMean + jumpStd * sample();
    }
    path[i] = path[i - 1] * Math.exp(logStep);
  }
  return path;
}

// Ornstein-Uhlenbeck mean reversion (exact discretization):
//   x_{t+Δ} = θ + (x_t − θ)·e^{−κΔ} + σ·√((1−e^{−2κΔ})/(2κ))·Z
// Long-run mean → θ. Used for rates (Vasicek) and mean-reverting signals.
export function ouPath(
  x0: number,
  kappa: number,
  theta: number,
  sigma: number,
  T: number,
  steps: number,
  sample: () => number,
): PricePath {
  const dt = T / steps;
  const ek = Math.exp(-kappa * dt);
  const sd =
    kappa > 0
      ? sigma * Math.sqrt((1 - ek * ek) / (2 * kappa))
      : sigma * Math.sqrt(dt);
  const path: PricePath = new Array(steps + 1);
  path[0] = x0;
  for (let i = 1; i <= steps; i++) {
    path[i] = theta + (path[i - 1] - theta) * ek + sd * sample();
  }
  return path;
}

// Vasicek short-rate model is OU on the interest rate.
export const vasicekPath = ouPath;

// Correlated multi-asset GBM. `corr` is an n×n correlation matrix; per-asset
// vols/drifts are supplied separately. Correlated shocks = L · independentZ.
export function correlatedGbmPaths(
  s0: number[],
  mu: number[],
  sigma: number[],
  corr: number[][],
  T: number,
  steps: number,
  sample: () => number,
): PricePath[] {
  const n = s0.length;
  const L = cholesky(corr);
  const dt = T / steps;
  const sqdt = Math.sqrt(dt);
  const paths: PricePath[] = s0.map((s) => {
    const p = new Array(steps + 1);
    p[0] = s;
    return p;
  });
  for (let t = 1; t <= steps; t++) {
    const z = Array.from({ length: n }, () => sample());
    // Correlated shock for asset i = Σ_k L[i][k]·z[k]
    for (let i = 0; i < n; i++) {
      let shock = 0;
      for (let k = 0; k <= i; k++) shock += L[i][k] * z[k];
      const drift = (mu[i] - 0.5 * sigma[i] * sigma[i]) * dt;
      paths[i][t] = paths[i][t - 1] * Math.exp(drift + sigma[i] * sqdt * shock);
    }
  }
  return paths;
}

// Knuth's algorithm for small-mean Poisson sampling.
function poisson(lambda: number, rng: () => number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}

// Simulate many GBM paths and reduce them into display-ready fan-chart bands,
// terminal distribution, and a handful of sampled individual paths.
export function simulateGbmStats(
  s0: number,
  mu: number,
  sigma: number,
  T: number,
  steps: number,
  nPaths: number,
  seed: number,
  displayPaths = 12,
): PathStats {
  const sample = makeNormalSampler(seededRand(seed));
  const times = Array.from({ length: steps + 1 }, (_, i) => (i * T) / steps);
  const all: PricePath[] = [];
  for (let p = 0; p < nPaths; p++) {
    all.push(gbmPath(s0, mu, sigma, T, steps, sample));
  }
  // Percentile bands at each time step.
  const p5: number[] = [];
  const p25: number[] = [];
  const p50: number[] = [];
  const p75: number[] = [];
  const p95: number[] = [];
  for (let t = 0; t <= steps; t++) {
    const col = all.map((path) => path[t]).sort((a, b) => a - b);
    p5.push(quantileSorted(col, 0.05));
    p25.push(quantileSorted(col, 0.25));
    p50.push(quantileSorted(col, 0.5));
    p75.push(quantileSorted(col, 0.75));
    p95.push(quantileSorted(col, 0.95));
  }
  const terminal = all.map((path) => path[steps]);
  const paths = all.slice(0, Math.min(displayPaths, all.length));
  return { times, paths, bands: { p5, p25, p50, p75, p95 }, terminal };
}

// Quantile on an already-sorted array (linear interpolation).
function quantileSorted(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN;
  if (sorted.length === 1) return sorted[0];
  const rank = q * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  return sorted[lo] * (hi - rank) + sorted[hi] * (rank - lo);
}
