import React from "react";
import { A } from "../shared/theme";
import { Card, SectionHeader, Sub, ScoreBar } from "../shared/primitives";
import { getScoreColor, getScoreLabel } from "../shared/scoreStyle";
import { fmtN, fmtPct } from "../shared/format";

// ─── Props ────────────────────────────────────────────────────────────────────
interface ScoreC {
  totalScore: number;
  accrScore: number;
  premScore: number;
  levScore: number;
  synScore: number;
  strScore: number;
  isAccretive: boolean;
  epsChangePct: number;
  leverageRatio: number;
  synPct: number;
}

interface ScoreInputs {
  offerPremium: number;
  dealType: string;
}

interface IBScoreTabProps {
  C: ScoreC;
  inputs: ScoreInputs;
}

export default function IBScoreTab({ C, inputs }: IBScoreTabProps) {
  const scoreColor = getScoreColor(C.totalScore);
  const scoreLabel = getScoreLabel(C.totalScore);

  return (
    <div>
      <SectionHeader>Deal Score</SectionHeader>
      <Sub>
        100-point rubric across five dimensions. This is the framework used by
        IB analysts and DECA/YIS finance judges to evaluate deal quality.
      </Sub>

      {/* Score display */}
      <div className="flex items-center gap-8 mb-8">
        <div
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 120,
            height: 120,
            background: `conic-gradient(${scoreColor} ${C.totalScore * 3.6}deg, #1F2937 0deg)`,
          }}
        >
          <div
            className="flex flex-col items-center justify-center rounded-full"
            style={{
              width: 92,
              height: 92,
              background: "#111827",
            }}
          >
            <span
              className="text-3xl font-bold font-serif"
              style={{ color: scoreColor }}
            >
              {C.totalScore}
            </span>
            <span className="text-xs" style={{ color: "#4B5563" }}>
              / 100
            </span>
          </div>
        </div>
        <div>
          <div
            className="text-2xl font-bold font-serif mb-1"
            style={{ color: scoreColor }}
          >
            {scoreLabel}
          </div>
          <div className="text-sm" style={{ color: "#6B7280" }}>
            {C.totalScore >= 80
              ? "This deal creates clear shareholder value with manageable risk."
              : C.totalScore >= 60
                ? "A reasonable deal with some areas to strengthen."
                : C.totalScore >= 40
                  ? "Significant issues — revisit premium, leverage, or synergies."
                  : "This deal as structured is value-destructive. Major changes needed."}
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <Card>
        <div
          className="text-xs font-bold mb-5 tracking-widest"
          style={{ color: "#9CA3AF", fontFamily: "monospace" }}
        >
          RUBRIC BREAKDOWN
        </div>

        <ScoreBar
          label="Accretion / Dilution (25 pts)"
          score={C.accrScore}
          max={25}
          color={C.isAccretive ? "#22C55E" : "#EF4444"}
        />
        <div
          className="text-xs mb-5"
          style={{ color: "#4B5563", marginTop: "-0.75rem" }}
        >
          {C.isAccretive
            ? `Deal is accretive (+${fmtN(C.epsChangePct, 1)}%). Full marks.`
            : `Deal is dilutive (${fmtN(C.epsChangePct, 1)}%). Add synergies, reduce premium, or increase cash mix.`}
        </div>

        <ScoreBar
          label="Premium Reasonableness (20 pts)"
          score={C.premScore}
          max={20}
          color={A.light}
        />
        <div
          className="text-xs mb-5"
          style={{ color: "#4B5563", marginTop: "-0.75rem" }}
        >
          {inputs.offerPremium < 15
            ? "Premium too low — target may reject or trigger auction."
            : inputs.offerPremium <= 45
              ? `${inputs.offerPremium}% premium is within the 15–45% strategic target range.`
              : `${inputs.offerPremium}% premium is high — ensure synergies justify the cost.`}
        </div>

        <ScoreBar
          label="Leverage Ratio (20 pts)"
          score={C.levScore}
          max={20}
          color="#60A5FA"
        />
        <div
          className="text-xs mb-5"
          style={{ color: "#4B5563", marginTop: "-0.75rem" }}
        >
          {fmtN(C.leverageRatio, 1)}x Debt/EBITDA.{" "}
          {C.leverageRatio < 3
            ? "Conservative leverage — strong credit profile."
            : C.leverageRatio < 5
              ? "Moderate leverage — manageable for most deals."
              : "High leverage — elevated credit risk, limited flexibility."}
        </div>

        <ScoreBar
          label="Synergy Achievability (20 pts)"
          score={C.synScore}
          max={20}
          color="#A78BFA"
        />
        <div
          className="text-xs mb-5"
          style={{ color: "#4B5563", marginTop: "-0.75rem" }}
        >
          {fmtPct(C.synPct)} of target revenue in synergies.{" "}
          {C.synPct < 4
            ? "Conservative and credible."
            : C.synPct < 7
              ? "Achievable with solid integration planning."
              : "Ambitious — execution risk is elevated."}
        </div>

        <ScoreBar
          label="Strategic Rationale (15 pts)"
          score={C.strScore}
          max={15}
          color="#F472B6"
        />
        <div
          className="text-xs mb-1"
          style={{ color: "#4B5563", marginTop: "-0.75rem" }}
        >
          {inputs.dealType === "strategic"
            ? "Strategic acquisition — clear industrial logic, potential for long-term value creation."
            : "Financial acquisition (LBO) — return-driven with a defined exit horizon."}
        </div>
      </Card>

      {/* Improvement tips */}
      {C.totalScore < 80 && (
        <Card style={{ marginTop: "1.5rem" }}>
          <div
            className="text-xs font-bold mb-3 tracking-widest"
            style={{ color: A.light, fontFamily: "monospace" }}
          >
            HOW TO IMPROVE YOUR SCORE
          </div>
          <ul className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
            {!C.isAccretive && (
              <li>
                <span style={{ color: "#F9FAFB" }}>
                  ▲ Make the deal accretive:
                </span>{" "}
                increase synergies, reduce the premium, shift to more cash (if
                target earnings yield {">"} debt cost), or increase target
                earnings.
              </li>
            )}
            {inputs.offerPremium > 45 && (
              <li>
                <span style={{ color: "#F9FAFB" }}>▼ Reduce the premium:</span>{" "}
                a {inputs.offerPremium}% premium requires substantial synergies
                to be rational. Target 20–40% for strategic deals.
              </li>
            )}
            {C.leverageRatio > 4 && (
              <li>
                <span style={{ color: "#F9FAFB" }}>↓ Reduce leverage:</span>{" "}
                {fmtN(C.leverageRatio, 1)}x Debt/EBITDA is elevated. Consider
                more stock consideration or a lower purchase price.
              </li>
            )}
            {C.synPct > 7 && (
              <li>
                <span style={{ color: "#F9FAFB" }}>
                  ⚠ Lower synergy targets:
                </span>{" "}
                {fmtPct(C.synPct)} of target revenue is optimistic. Reduce to
                below 7% for a credible case.
              </li>
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}
