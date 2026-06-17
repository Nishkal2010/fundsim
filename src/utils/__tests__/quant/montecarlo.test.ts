import { describe, it, expect } from "vitest";
import { monteCarlo } from "../../quant/montecarlo";
import { seededRand } from "../../quant/stats";

describe("monteCarlo", () => {
  it("estimates π via the unit-quarter-circle hit ratio", () => {
    // Each draw: point in unit square; indicator inside quarter circle ×4 → π.
    const result = monteCarlo(
      (rng) => {
        const x = rng();
        const y = rng();
        return x * x + y * y <= 1 ? 4 : 0;
      },
      200000,
      { seed: 2024 },
    );
    expect(result.mean).toBeCloseTo(Math.PI, 1);
    // True value lies within ~3 standard errors.
    expect(Math.abs(result.mean - Math.PI)).toBeLessThan(3 * result.stdError);
  });

  it("estimates E[U] = 0.5 with a tight CI", () => {
    const result = monteCarlo((rng) => rng(), 100000, { seed: 1 });
    expect(result.mean).toBeCloseTo(0.5, 2);
    expect(result.ci95[0]).toBeLessThan(0.5);
    expect(result.ci95[1]).toBeGreaterThan(0.5);
  });

  it("antithetic variates reduce the standard error for a monotone integrand", () => {
    // E[U] estimator: antithetic pairing (u, 1−u) is exact in the mean and
    // dramatically lower variance for the identity function.
    const plain = monteCarlo((rng) => rng(), 10000, { seed: 5 });
    const anti = monteCarlo((rng) => rng(), 10000, {
      seed: 5,
      antithetic: true,
    });
    expect(anti.stdError).toBeLessThan(plain.stdError);
  });

  it("records a convergence trace ending at n", () => {
    const result = monteCarlo((rng) => rng(), 1000, { seed: 3 });
    expect(result.convergence.length).toBeGreaterThan(0);
    expect(result.convergence[result.convergence.length - 1].n).toBe(1000);
  });

  it("is reproducible for a fixed seed", () => {
    const a = monteCarlo((rng) => rng(), 5000, { seed: 77 });
    const b = monteCarlo((rng) => rng(), 5000, { seed: 77 });
    expect(a.mean).toBe(b.mean);
    expect(a.stdError).toBe(b.stdError);
  });
});

// Guard the seeded RNG import is wired (used indirectly above).
describe("seededRand sanity", () => {
  it("exists and returns a function", () => {
    expect(typeof seededRand(1)).toBe("function");
  });
});
