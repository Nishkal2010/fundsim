// Generic Monte Carlo estimation engine.
//
// `monteCarlo` averages a sample function over n draws and reports the mean,
// standard error, and a 95% confidence interval, plus a log-spaced convergence
// trace for charting. Antithetic variates are opt-in: each base draw u is
// paired with its reflection (1−u), which cuts variance for monotone
// integrands at no extra random cost.
//
// Variance accounting is done over INDEPENDENT observations. In plain mode an
// observation is one sample. In antithetic mode an observation is the MEAN of
// a (sample, reflected-sample) pair — these pairs are i.i.d. even though the
// two halves of a pair are negatively correlated, so the standard error
// correctly reflects the reduced variance of the pair estimator.

import { seededRand, makeNormalSampler } from "./stats";
import type { MonteCarloResult } from "./types";

export interface MonteCarloOptions {
  seed?: number;
  antithetic?: boolean;
}

// sampleFn receives a uniform generator and returns one realization of the
// quantity being averaged. When `antithetic` is on, sampleFn is invoked a
// second time against the reflected uniform stream (1−u for each u it drew),
// and the two results are averaged into one observation.
export function monteCarlo(
  sampleFn: (rng: () => number) => number,
  n: number,
  opts: MonteCarloOptions = {},
): MonteCarloResult {
  const rng = seededRand(opts.seed ?? 12345);
  const antithetic = !!opts.antithetic;

  // Number of independent observations and evaluations-per-observation.
  const evalsPerObs = antithetic ? 2 : 1;
  const nObs = Math.max(1, Math.floor(n / evalsPerObs));
  const checkpoints = logCheckpoints(nObs);

  const convergence: MonteCarloResult["convergence"] = [];
  let sum = 0;
  let sumSq = 0;
  let count = 0; // observations recorded
  let cpIdx = 0;

  const record = (obs: number) => {
    sum += obs;
    sumSq += obs * obs;
    count++;
    if (cpIdx < checkpoints.length && count === checkpoints[cpIdx]) {
      const m = sum / count;
      const v = count > 1 ? (sumSq - count * m * m) / (count - 1) : 0;
      convergence.push({
        // Report convergence on the evaluation axis so plain and antithetic
        // runs are comparable.
        n: count * evalsPerObs,
        estimate: m,
        stdError: Math.sqrt(Math.max(0, v) / count),
      });
      cpIdx++;
    }
  };

  for (let i = 0; i < nObs; i++) {
    if (antithetic) {
      const draws: number[] = [];
      const capture = () => {
        const u = rng();
        draws.push(u);
        return u;
      };
      const v1 = sampleFn(capture);
      let k = 0;
      const reflect = () => 1 - draws[k++];
      const v2 = sampleFn(reflect);
      record((v1 + v2) / 2);
    } else {
      record(sampleFn(rng));
    }
  }

  const m = sum / count;
  const v = count > 1 ? (sumSq - count * m * m) / (count - 1) : 0;
  const stdError = Math.sqrt(Math.max(0, v) / count);
  return {
    mean: m,
    stdError,
    ci95: [m - 1.959964 * stdError, m + 1.959964 * stdError],
    n: count * evalsPerObs,
    convergence,
  };
}

// Convenience: a normal sampler bound to the MC engine's seed discipline.
export function normalSampler(seed: number): () => number {
  return makeNormalSampler(seededRand(seed));
}

// Log-spaced checkpoints (plus the final n) for the convergence chart.
function logCheckpoints(n: number): number[] {
  const pts = new Set<number>();
  const decades = Math.log10(Math.max(10, n));
  for (let d = 1; d <= decades; d++) {
    const base = Math.pow(10, d);
    for (const mult of [1, 2, 5]) {
      const v = Math.round(base * mult * 0.1);
      if (v >= 10 && v <= n) pts.add(v);
    }
  }
  pts.add(n);
  return [...pts].sort((a, b) => a - b);
}
