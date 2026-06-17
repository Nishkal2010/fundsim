import { useState } from "react";
import { ChevronDown, ChevronUp, Sigma } from "lucide-react";
import {
  QUANT_ACCENT,
  QUANT_BORDER,
  PANEL_BG,
  PANEL_BORDER,
} from "./QuantLayout";

interface Drill {
  topic: string;
  question: string;
  answer: string;
}

// A hand-curated set of canonical quant-interview problems. Answers are worked,
// not just stated, so the page teaches rather than tests.
const DRILLS: Drill[] = [
  {
    topic: "Probability",
    question:
      "You flip a fair coin until the first head. What is the expected number of flips?",
    answer:
      "E = Σ k·(½)^k = 2. Geometric with p=½ → E = 1/p = 2. Lever: E = 1 + ½·0 + ½·E ⇒ E = 2.",
  },
  {
    topic: "Probability",
    question:
      "Two cards drawn from a standard deck without replacement. P(both aces)?",
    answer:
      "(4/52)·(3/51) = 12/2652 = 1/221 ≈ 0.452%. Sequential conditional probability.",
  },
  {
    topic: "Expected value",
    question:
      "A die is rolled; you win its face value in dollars but may re-roll once if you choose. Optimal strategy and EV?",
    answer:
      "Re-roll when the first roll < EV of a fresh roll (3.5) → re-roll on 1,2,3. EV = ½·(avg of 4,5,6) + ½·3.5 = ½·5 + ½·3.5 = 4.25.",
  },
  {
    topic: "Options",
    question:
      "Why is a long option position always short theta and long gamma?",
    answer:
      "Convexity: the payoff is convex in spot, so any move helps (long gamma). You pay for that convexity through time decay — as expiry approaches, optionality erodes (short theta). In Black-Scholes the theta–gamma tradeoff is exact: Θ + ½σ²S²Γ + rSΔ = rV.",
  },
  {
    topic: "Options",
    question:
      "A call and put on the same strike/expiry both trade at $5 with S=K=100, r=0. Arbitrage?",
    answer:
      "Put-call parity at r=0: C − P = S − K = 0, so C should equal P. They do ($5=$5) → no arbitrage. If they differed, buy the cheap one, sell the dear one, hedge with stock.",
  },
  {
    topic: "Statistics",
    question:
      "Returns are i.i.d. with daily vol 1%. What is the annualized vol (252 days)?",
    answer:
      "Vol scales with √time: 1%·√252 ≈ 15.87%. Variance is additive over independent periods, so standard deviation grows like √T.",
  },
  {
    topic: "Risk",
    question:
      "A $10M book has daily σ = 2%. What is the 1-day 99% parametric VaR?",
    answer:
      "VaR = V·z₉₉·σ = 10M·2.326·0.02 ≈ $465,300. z₉₉ = Φ⁻¹(0.99) ≈ 2.326. CVaR would be larger: V·σ·φ(z)/(1−c).",
  },
  {
    topic: "Fixed income",
    question:
      "A bond has modified duration 7 and yields rise 50 bps. Approximate price change?",
    answer:
      "ΔP/P ≈ −D_mod·Δy = −7·0.005 = −3.5%. Add ½·convexity·Δy² for the second-order (always positive) correction.",
  },
  {
    topic: "Linear algebra",
    question: "Why must a covariance matrix be positive semi-definite?",
    answer:
      "For any weights w, portfolio variance wᵀΣw = Var(wᵀX) ≥ 0. A variance can't be negative, so Σ must be PSD. This is also why Cholesky (Σ = LLᵀ) exists for valid covariance matrices.",
  },
  {
    topic: "Markets",
    question:
      "You have a 55% edge on an even-money bet. What fraction of bankroll does Kelly say to wager?",
    answer:
      "f* = (b·p − q)/b with b=1, p=0.55, q=0.45 → f* = 0.55 − 0.45 = 0.10, i.e. 10% of bankroll. Maximizes long-run log growth.",
  },
];

export function DrillsTab() {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full">
      <div className="mb-5">
        <h2
          className="font-serif text-2xl"
          style={{ color: "#ece9e2", marginBottom: 4 }}
        >
          Quant Interview Drills
        </h2>
        <p className="text-sm" style={{ color: "#7d808a" }}>
          Canonical problems from quant first-rounds — probability, options,
          risk, and mental math. Reveal the worked solution when you're ready.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {DRILLS.map((d, i) => {
          const isOpen = open.has(i);
          return (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{
                background: PANEL_BG,
                border: `1px solid ${PANEL_BORDER}`,
              }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-start gap-3 p-4 text-left"
                style={{
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                }}
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                  style={{
                    background: "rgba(91,157,255,0.1)",
                    color: QUANT_ACCENT,
                    border: `1px solid ${QUANT_BORDER}`,
                  }}
                >
                  {d.topic}
                </span>
                <span className="flex-1 text-sm" style={{ color: "#ece9e2" }}>
                  {d.question}
                </span>
                {isOpen ? (
                  <ChevronUp size={16} color="#7d808a" />
                ) : (
                  <ChevronDown size={16} color="#7d808a" />
                )}
              </button>
              {isOpen && (
                <div
                  className="px-4 pb-4 text-sm"
                  style={{
                    color: "#a6a8b0",
                    lineHeight: 1.65,
                    borderTop: `1px solid ${PANEL_BORDER}`,
                    paddingTop: 12,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      color: QUANT_ACCENT,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    <Sigma size={13} /> Solution
                  </span>
                  <p style={{ marginTop: 4 }}>{d.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
