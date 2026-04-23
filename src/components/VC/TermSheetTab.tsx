import React, { useState, useMemo } from "react";

const C = {
  bg: "#0D1220",
  card: "#111827",
  border: "rgba(52,211,153,0.18)",
  accent: "#34D399",
  accentDim: "rgba(52,211,153,0.08)",
  accentBorder: "rgba(52,211,153,0.25)",
  text: "#F9FAFB",
  muted: "#9CA3AF",
  dim: "#6B7280",
  red: "#F87171",
  yellow: "#FCD34D",
  blue: "#60A5FA",
  purple: "#A78BFA",
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: C.muted }}>
          {label}
        </span>
        <span
          className="text-xs font-semibold font-mono"
          style={{ color: C.accent }}
        >
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: C.accent }}
      />
    </div>
  );
}

interface ExitScenario {
  label: string;
  exitVal: number; // $M
  color: string;
}

const defaultExits: ExitScenario[] = [
  { label: "Base Case", exitVal: 150, color: C.accent },
  { label: "Upside", exitVal: 400, color: "#60A5FA" },
  { label: "Downside", exitVal: 40, color: "#F87171" },
];

type LiqPrefType =
  | "non_participating"
  | "participating"
  | "capped_participating";
type AntiDilutionType =
  | "none"
  | "weighted_avg_broad"
  | "weighted_avg_narrow"
  | "full_ratchet";

const fmtM = (v: number) => `$${v.toFixed(1)}M`;
const fmtPct = (v: number) => `${v.toFixed(1)}%`;
const fmtx = (v: number) => `${v.toFixed(2)}x`;

export function TermSheetTab() {
  // Deal parameters
  const [investmentAmount, setInvestmentAmount] = useState(5); // $M
  const [preMoney, setPreMoney] = useState(20); // $M
  const [liquidationMultiple, setLiquidationMultiple] = useState(1); // 1x, 1.5x, 2x
  const [liqPrefType, setLiqPrefType] =
    useState<LiqPrefType>("non_participating");
  const [participationCap, setParticipationCap] = useState(3); // x for capped participating
  const [antiDilution, setAntiDilution] =
    useState<AntiDilutionType>("weighted_avg_broad");
  const [dividendRate, setDividendRate] = useState(8); // % cumulative
  const [dividendType, setDividendType] = useState<
    "cumulative" | "non_cumulative" | "none"
  >("non_cumulative");
  const [holdYears, setHoldYears] = useState(5);
  const [proRata, setProRata] = useState(true);
  const [boardSeats, setBoardSeats] = useState(1);
  const [dragAlong, setDragAlong] = useState(true);
  const [rofr, setRofr] = useState(true);
  const [activeScenario, setActiveScenario] = useState(0);
  const [activeSection, setActiveSection] = useState<
    "economics" | "control" | "antidilution" | "scenarios"
  >("economics");

  const results = useMemo(() => {
    const postMoney = preMoney + investmentAmount;
    const investorOwnership = investmentAmount / postMoney;
    const founderOwnership = 1 - investorOwnership;

    // Cumulative dividends
    const cumulativeDivs =
      dividendType === "cumulative"
        ? investmentAmount * (dividendRate / 100) * holdYears
        : 0;
    const totalPreference =
      investmentAmount * liquidationMultiple + cumulativeDivs;

    const scenarioResults = defaultExits.map((exit) => {
      const exitValM = exit.exitVal;

      // Step 1: Investor gets liquidation preference first
      let investorProceeds = 0;
      let founderProceeds = 0;
      const remainingAfterPref = Math.max(0, exitValM - totalPreference);

      if (liqPrefType === "non_participating") {
        // Investor gets max of: preference OR their ownership %
        const pctProceeds = exitValM * investorOwnership;
        const prefProceeds = Math.min(exitValM, totalPreference);
        investorProceeds = Math.max(prefProceeds, pctProceeds);
        founderProceeds = exitValM - investorProceeds;
      } else if (liqPrefType === "participating") {
        // Full participation: preference THEN share pro-rata in remainder
        investorProceeds =
          Math.min(exitValM, totalPreference) +
          remainingAfterPref * investorOwnership;
        founderProceeds = exitValM - investorProceeds;
      } else if (liqPrefType === "capped_participating") {
        // Participating up to cap
        const cap = investmentAmount * participationCap;
        const uncapped =
          Math.min(exitValM, totalPreference) +
          remainingAfterPref * investorOwnership;
        investorProceeds = Math.min(uncapped, cap);
        // Founder recapture: if capped, investor converts to common if better
        const ifConverted = exitValM * investorOwnership;
        investorProceeds = Math.max(investorProceeds, ifConverted);
        founderProceeds = exitValM - investorProceeds;
      }

      const investorMOIC =
        investmentAmount > 0 ? investorProceeds / investmentAmount : 0;
      const investorIRR =
        Math.pow(Math.max(0, investorMOIC), 1 / holdYears) - 1;

      return {
        ...exit,
        investorProceeds,
        founderProceeds,
        investorMOIC,
        investorIRR: investorIRR * 100,
        founderProceeds_pct: (founderProceeds / exitValM) * 100,
        investorProceeds_pct: (investorProceeds / exitValM) * 100,
        totalPreference,
        prefBreakeven: totalPreference, // Exit val where pref vs convert is same
      };
    });

    return {
      postMoney,
      investorOwnership: investorOwnership * 100,
      founderOwnership: founderOwnership * 100,
      totalPreference,
      cumulativeDivs,
      scenarioResults,
    };
  }, [
    investmentAmount,
    preMoney,
    liquidationMultiple,
    liqPrefType,
    participationCap,
    dividendRate,
    dividendType,
    holdYears,
  ]);

  const sections = [
    { id: "economics", label: "Economics" },
    { id: "control", label: "Control Rights" },
    { id: "antidilution", label: "Anti-Dilution" },
    { id: "scenarios", label: "Exit Scenarios" },
  ];

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100%",
        padding: "28px 32px",
        color: C.text,
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-serif mb-1" style={{ color: C.text }}>
          Term Sheet Provisions Simulator
        </h2>
        <p className="text-sm" style={{ color: C.muted }}>
          Model how term sheet clauses affect founder vs. investor payoffs at
          exit — liquidation preferences, anti-dilution, control rights
        </p>
      </div>

      {/* Section Nav */}
      <div className="flex gap-2 mb-6">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as typeof activeSection)}
            style={{
              background: activeSection === s.id ? C.accentDim : C.card,
              border: `1px solid ${activeSection === s.id ? C.accent : C.border}`,
              borderRadius: 8,
              padding: "8px 18px",
              cursor: "pointer",
              color: activeSection === s.id ? C.accent : C.muted,
              fontSize: 13,
              fontWeight: activeSection === s.id ? 600 : 400,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Deal Parameters */}
        <div>
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <div
              className="text-sm font-semibold mb-4"
              style={{ color: C.text }}
            >
              Deal Terms
            </div>
            <Slider
              label="Investment Amount"
              value={investmentAmount}
              min={0.5}
              max={50}
              step={0.5}
              format={(v) => `$${v}M`}
              onChange={setInvestmentAmount}
            />
            <Slider
              label="Pre-Money Valuation"
              value={preMoney}
              min={2}
              max={200}
              step={1}
              format={(v) => `$${v}M`}
              onChange={setPreMoney}
            />
            <div
              className="text-xs p-2 rounded mt-1 mb-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${C.border}`,
              }}
            >
              <div className="flex justify-between mb-1">
                <span style={{ color: C.muted }}>Post-Money</span>
                <span className="font-mono" style={{ color: C.text }}>
                  {fmtM(preMoney + investmentAmount)}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span style={{ color: C.muted }}>Investor Ownership</span>
                <span className="font-mono" style={{ color: C.accent }}>
                  {fmtPct(results.investorOwnership)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: C.muted }}>Founder Ownership</span>
                <span className="font-mono" style={{ color: C.blue }}>
                  {fmtPct(results.founderOwnership)}
                </span>
              </div>
            </div>
            <Slider
              label="Hold Period (yrs)"
              value={holdYears}
              min={1}
              max={12}
              step={1}
              format={(v) => `${v}yr`}
              onChange={setHoldYears}
            />
          </div>

          {/* Liquidation Preference */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <div
              className="text-sm font-semibold mb-3"
              style={{ color: C.text }}
            >
              Liquidation Preference
            </div>

            <div className="mb-3">
              <div className="text-xs mb-2" style={{ color: C.muted }}>
                Type
              </div>
              <div className="space-y-1.5">
                {(
                  [
                    {
                      id: "non_participating",
                      label: "Non-Participating",
                      badge: "Founder-Friendly",
                      badgeColor: C.accent,
                    },
                    {
                      id: "participating",
                      label: "Full Participating",
                      badge: "Investor-Friendly",
                      badgeColor: C.red,
                    },
                    {
                      id: "capped_participating",
                      label: "Capped Participating",
                      badge: "Compromise",
                      badgeColor: C.yellow,
                    },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setLiqPrefType(t.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded text-xs"
                    style={{
                      background:
                        liqPrefType === t.id ? C.accentDim : "transparent",
                      border: `1px solid ${liqPrefType === t.id ? C.accent : C.border}`,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{ color: liqPrefType === t.id ? C.text : C.muted }}
                    >
                      {t.label}
                    </span>
                    <span style={{ color: t.badgeColor, fontSize: 10 }}>
                      {t.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Slider
              label="Liquidation Multiple"
              value={liquidationMultiple}
              min={1}
              max={3}
              step={0.5}
              format={(v) => `${v}x`}
              onChange={setLiquidationMultiple}
            />

            {liqPrefType === "capped_participating" && (
              <Slider
                label="Participation Cap"
                value={participationCap}
                min={1.5}
                max={5}
                step={0.5}
                format={(v) => `${v}x`}
                onChange={setParticipationCap}
              />
            )}

            <div
              className="text-xs p-2 rounded mt-2"
              style={{
                background: "rgba(252,211,77,0.06)",
                border: "1px solid rgba(252,211,77,0.15)",
              }}
            >
              <span style={{ color: C.yellow }}>Total Preference: </span>
              <span className="font-mono" style={{ color: C.text }}>
                {fmtM(results.totalPreference)}
              </span>
              {results.cumulativeDivs > 0 && (
                <span style={{ color: C.dim }}>
                  {" "}
                  (incl. {fmtM(results.cumulativeDivs)} cumulative divs)
                </span>
              )}
            </div>
          </div>

          {/* Dividends */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              className="text-sm font-semibold mb-3"
              style={{ color: C.text }}
            >
              Dividends
            </div>
            <div className="flex gap-1.5 mb-3">
              {(["none", "non_cumulative", "cumulative"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDividendType(d)}
                  className="flex-1 text-xs py-1 rounded"
                  style={{
                    background:
                      dividendType === d ? C.accentDim : "transparent",
                    border: `1px solid ${dividendType === d ? C.accent : C.border}`,
                    color: dividendType === d ? C.accent : C.muted,
                    cursor: "pointer",
                  }}
                >
                  {d === "none"
                    ? "None"
                    : d === "non_cumulative"
                      ? "Non-Cumul."
                      : "Cumulative"}
                </button>
              ))}
            </div>
            {dividendType !== "none" && (
              <Slider
                label="Dividend Rate"
                value={dividendRate}
                min={4}
                max={15}
                step={1}
                format={(v) => `${v}%`}
                onChange={setDividendRate}
              />
            )}
            <div className="text-xs" style={{ color: C.muted }}>
              {dividendType === "cumulative"
                ? `Cumulative dividends accrue unpaid — add ${fmtM((investmentAmount * dividendRate) / 100)}/yr to preference`
                : dividendType === "non_cumulative"
                  ? "Dividends paid only if declared by board — typically not paid pre-exit"
                  : "No dividend provision"}
            </div>
          </div>
        </div>

        {/* Middle: Main content based on active section */}
        <div>
          {activeSection === "economics" && (
            <>
              {/* Liquidation Preference Explainer */}
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                <div
                  className="text-sm font-semibold mb-3"
                  style={{ color: C.text }}
                >
                  {liqPrefType === "non_participating"
                    ? "Non-Participating Preferred"
                    : liqPrefType === "participating"
                      ? "Full Participating Preferred"
                      : "Capped Participating Preferred"}
                  : How It Works
                </div>

                {liqPrefType === "non_participating" && (
                  <div className="space-y-2 text-xs">
                    <div
                      className="p-3 rounded"
                      style={{
                        background: C.accentDim,
                        border: `1px solid ${C.accentBorder}`,
                      }}
                    >
                      <div
                        style={{ color: C.accent }}
                        className="font-semibold mb-1"
                      >
                        Standard (Most Common in Competitive Rounds)
                      </div>
                      <div style={{ color: C.muted }}>
                        Investor chooses the BETTER of two options at exit:
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-2">
                          <span style={{ color: C.yellow }}>Option A:</span>{" "}
                          <span style={{ color: C.muted }}>
                            Get liquidation preference (${liquidationMultiple}x
                            invested = {fmtM(results.totalPreference)})
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span style={{ color: C.yellow }}>Option B:</span>{" "}
                          <span style={{ color: C.muted }}>
                            Convert to common and take{" "}
                            {fmtPct(results.investorOwnership)} of exit proceeds
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="p-2 rounded text-xs"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <span style={{ color: C.text }}>Breakeven point: </span>
                      <span className="font-mono" style={{ color: C.accent }}>
                        {fmtM(
                          results.totalPreference /
                            (results.investorOwnership / 100),
                        )}
                      </span>
                      <span style={{ color: C.muted }}>
                        {" "}
                        — above this exit value, investor converts to common for
                        higher payout
                      </span>
                    </div>
                  </div>
                )}

                {liqPrefType === "participating" && (
                  <div className="space-y-2 text-xs">
                    <div
                      className="p-3 rounded"
                      style={{
                        background: "rgba(248,113,113,0.08)",
                        border: "1px solid rgba(248,113,113,0.2)",
                      }}
                    >
                      <div
                        style={{ color: C.red }}
                        className="font-semibold mb-1"
                      >
                        Double-Dip Structure (Investor-Friendly)
                      </div>
                      <div style={{ color: C.muted }}>
                        Investor gets BOTH preference AND participation:
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-2">
                          <span style={{ color: C.yellow }}>Step 1:</span>{" "}
                          <span style={{ color: C.muted }}>
                            Take {fmtM(results.totalPreference)} liquidation
                            preference off the top
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span style={{ color: C.yellow }}>Step 2:</span>{" "}
                          <span style={{ color: C.muted }}>
                            Then ALSO take {fmtPct(results.investorOwnership)}{" "}
                            of remaining proceeds
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="p-2 rounded"
                      style={{
                        background: "rgba(252,211,77,0.06)",
                        border: "1px solid rgba(252,211,77,0.15)",
                      }}
                    >
                      <span style={{ color: C.yellow }}>Founder Impact: </span>
                      <span style={{ color: C.muted }}>
                        At any exit, founders receive less than their %
                        ownership suggests. This provision significantly reduces
                        founder economics in small-to-mid exits.
                      </span>
                    </div>
                  </div>
                )}

                {liqPrefType === "capped_participating" && (
                  <div className="space-y-2 text-xs">
                    <div
                      className="p-3 rounded"
                      style={{
                        background: "rgba(252,211,77,0.08)",
                        border: "1px solid rgba(252,211,77,0.2)",
                      }}
                    >
                      <div
                        style={{ color: C.yellow }}
                        className="font-semibold mb-1"
                      >
                        Hybrid Structure (Negotiated Compromise)
                      </div>
                      <div style={{ color: C.muted }}>
                        Investor participates like full-participating, BUT has a
                        cap:
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-2">
                          <span style={{ color: C.yellow }}>Steps 1-2:</span>{" "}
                          <span style={{ color: C.muted }}>
                            Same as full participating (pref + pro-rata share)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span style={{ color: C.yellow }}>Cap:</span>{" "}
                          <span style={{ color: C.muted }}>
                            Total investor proceeds capped at {participationCap}
                            x invested ={" "}
                            {fmtM(investmentAmount * participationCap)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span style={{ color: C.accent }}>If hit cap:</span>{" "}
                          <span style={{ color: C.muted }}>
                            Investor may convert to common if conversion gives
                            more
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Proceeds Waterfall for selected scenario */}
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                <div
                  className="text-sm font-semibold mb-3"
                  style={{ color: C.text }}
                >
                  Proceeds Waterfall
                </div>
                <div className="flex gap-2 mb-3">
                  {results.scenarioResults.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveScenario(i)}
                      className="text-xs px-3 py-1 rounded"
                      style={{
                        background:
                          activeScenario === i
                            ? "rgba(255,255,255,0.08)"
                            : "transparent",
                        border: `1px solid ${activeScenario === i ? s.color : C.border}`,
                        color: activeScenario === i ? s.color : C.muted,
                        cursor: "pointer",
                      }}
                    >
                      {s.label} ({fmtM(s.exitVal)})
                    </button>
                  ))}
                </div>

                {(() => {
                  const s = results.scenarioResults[activeScenario];
                  return (
                    <div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div
                          style={{
                            background: C.accentDim,
                            border: `1px solid ${C.accentBorder}`,
                            borderRadius: 8,
                            padding: "12px",
                          }}
                        >
                          <div className="text-xs" style={{ color: C.muted }}>
                            Investor Proceeds
                          </div>
                          <div
                            className="text-lg font-bold font-mono"
                            style={{ color: C.accent }}
                          >
                            {fmtM(s.investorProceeds)}
                          </div>
                          <div className="text-xs" style={{ color: C.dim }}>
                            {fmtPct(s.investorProceeds_pct)} of exit ·{" "}
                            {fmtx(s.investorMOIC)} MOIC ·{" "}
                            {fmtPct(s.investorIRR)} IRR
                          </div>
                        </div>
                        <div
                          style={{
                            background: "rgba(96,165,250,0.08)",
                            border: "1px solid rgba(96,165,250,0.2)",
                            borderRadius: 8,
                            padding: "12px",
                          }}
                        >
                          <div className="text-xs" style={{ color: C.muted }}>
                            Founder Proceeds
                          </div>
                          <div
                            className="text-lg font-bold font-mono"
                            style={{ color: C.blue }}
                          >
                            {fmtM(s.founderProceeds)}
                          </div>
                          <div className="text-xs" style={{ color: C.dim }}>
                            {fmtPct(s.founderProceeds_pct)} of exit
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          height: 20,
                          borderRadius: 6,
                          overflow: "hidden",
                          display: "flex",
                        }}
                      >
                        <div
                          style={{
                            width: `${s.investorProceeds_pct}%`,
                            background: C.accent,
                            opacity: 0.8,
                          }}
                        />
                        <div
                          style={{ flex: 1, background: C.blue, opacity: 0.5 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span style={{ color: C.accent }}>
                          Investor: {fmtPct(s.investorProceeds_pct)}
                        </span>
                        <span style={{ color: C.blue }}>
                          Founder: {fmtPct(s.founderProceeds_pct)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Cross-scenario comparison */}
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div
                  className="text-sm font-semibold mb-3"
                  style={{ color: C.text }}
                >
                  Scenario Comparison
                </div>
                <table
                  className="w-full"
                  style={{ borderCollapse: "collapse", fontSize: 11 }}
                >
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {[
                        "Exit",
                        "Investor $",
                        "Investor %",
                        "MOIC",
                        "IRR",
                        "Founder $",
                      ].map((h) => (
                        <th
                          key={h}
                          className="pb-2 text-left font-medium"
                          style={{ color: C.muted }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.scenarioResults.map((s) => (
                      <tr
                        key={s.label}
                        style={{
                          borderBottom: `1px solid rgba(52,211,153,0.07)`,
                        }}
                      >
                        <td
                          className="py-1.5 font-semibold"
                          style={{ color: s.color }}
                        >
                          {s.label}
                        </td>
                        <td
                          className="py-1.5 font-mono"
                          style={{ color: C.accent }}
                        >
                          {fmtM(s.investorProceeds)}
                        </td>
                        <td
                          className="py-1.5 font-mono"
                          style={{ color: C.muted }}
                        >
                          {fmtPct(s.investorProceeds_pct)}
                        </td>
                        <td
                          className="py-1.5 font-mono"
                          style={{
                            color: s.investorMOIC >= 2 ? C.accent : C.yellow,
                          }}
                        >
                          {fmtx(s.investorMOIC)}
                        </td>
                        <td
                          className="py-1.5 font-mono"
                          style={{
                            color: s.investorIRR >= 20 ? C.accent : C.muted,
                          }}
                        >
                          {fmtPct(s.investorIRR)}
                        </td>
                        <td
                          className="py-1.5 font-mono"
                          style={{ color: C.blue }}
                        >
                          {fmtM(s.founderProceeds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeSection === "control" && (
            <>
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                <div
                  className="text-sm font-semibold mb-4"
                  style={{ color: C.text }}
                >
                  Control Rights Configuration
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div
                        className="text-xs font-semibold"
                        style={{ color: C.text }}
                      >
                        Board Seats
                      </div>
                      <div className="text-xs" style={{ color: C.muted }}>
                        Investor-designated directors
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[0, 1, 2].map((n) => (
                        <button
                          key={n}
                          onClick={() => setBoardSeats(n)}
                          className="w-8 h-8 rounded text-xs font-bold"
                          style={{
                            background:
                              boardSeats === n ? C.accentDim : "transparent",
                            border: `1px solid ${boardSeats === n ? C.accent : C.border}`,
                            color: boardSeats === n ? C.accent : C.muted,
                            cursor: "pointer",
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  {[
                    {
                      label: "Pro-Rata Rights",
                      desc: "Right to maintain % in future rounds",
                      state: proRata,
                      setter: setProRata,
                      impact: "Dilution protection",
                    },
                    {
                      label: "Drag-Along Rights",
                      desc: "Force other shareholders to join a sale",
                      state: dragAlong,
                      setter: setDragAlong,
                      impact: "Exit flexibility",
                    },
                    {
                      label: "ROFR / Co-Sale",
                      desc: "Right of first refusal + co-sale on secondary",
                      state: rofr,
                      setter: setRofr,
                      impact: "Liquidity control",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between py-2"
                      style={{ borderTop: `1px solid ${C.border}` }}
                    >
                      <div>
                        <div
                          className="text-xs font-semibold"
                          style={{ color: C.text }}
                        >
                          {item.label}
                        </div>
                        <div className="text-xs" style={{ color: C.muted }}>
                          {item.desc}
                        </div>
                        <div className="text-xs" style={{ color: C.accent }}>
                          {item.impact}
                        </div>
                      </div>
                      <button
                        onClick={() => item.setter(!item.state)}
                        className="text-xs px-3 py-1 rounded"
                        style={{
                          background: item.state
                            ? C.accentDim
                            : "rgba(248,113,113,0.08)",
                          border: `1px solid ${item.state ? C.accent : "rgba(248,113,113,0.3)"}`,
                          color: item.state ? C.accent : C.red,
                          cursor: "pointer",
                        }}
                      >
                        {item.state ? "Included" : "Excluded"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protective Provisions */}
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div
                  className="text-sm font-semibold mb-3"
                  style={{ color: C.text }}
                >
                  Standard Protective Provisions
                </div>
                <p className="text-xs mb-3" style={{ color: C.muted }}>
                  Protective provisions require preferred shareholder approval
                  for major actions. These are standard in virtually all VC term
                  sheets.
                </p>
                <div className="space-y-1.5">
                  {[
                    {
                      action: "New share issuance above authorized",
                      risk: "High",
                    },
                    {
                      action: "Change to certificate of incorporation",
                      risk: "High",
                    },
                    {
                      action: "Declare or pay dividends on common",
                      risk: "Medium",
                    },
                    {
                      action: "Acquire or merge with another company",
                      risk: "High",
                    },
                    {
                      action: "Liquidate or dissolve the company",
                      risk: "High",
                    },
                    { action: "Incur debt above $X threshold", risk: "Medium" },
                    { action: "Change number of board seats", risk: "High" },
                    {
                      action: "Create new preferred series with senior rights",
                      risk: "High",
                    },
                  ].map((item) => (
                    <div
                      key={item.action}
                      className="flex items-center gap-2 text-xs py-1"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: item.risk === "High" ? C.red : C.yellow,
                        }}
                      />
                      <span style={{ color: C.muted }}>{item.action}</span>
                      <span
                        className="ml-auto text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background:
                            item.risk === "High"
                              ? "rgba(248,113,113,0.1)"
                              : "rgba(252,211,77,0.1)",
                          color: item.risk === "High" ? C.red : C.yellow,
                        }}
                      >
                        {item.risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeSection === "antidilution" && (
            <>
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                <div
                  className="text-sm font-semibold mb-4"
                  style={{ color: C.text }}
                >
                  Anti-Dilution Provision Type
                </div>
                <div className="space-y-2">
                  {(
                    [
                      {
                        id: "none",
                        label: "No Anti-Dilution",
                        badge: "Founder-Friendly",
                        desc: "Investor absorbs full dilution in down rounds. Rare in institutional deals.",
                        color: C.accent,
                      },
                      {
                        id: "weighted_avg_broad",
                        label: "Broad-Based Weighted Average",
                        badge: "Market Standard",
                        desc: "Adjusts conversion price based on all shares outstanding (including options). Most founder-friendly anti-dilution.",
                        color: C.blue,
                      },
                      {
                        id: "weighted_avg_narrow",
                        label: "Narrow-Based Weighted Average",
                        badge: "More Protective",
                        desc: "Only counts preferred shares outstanding. More adjustment than broad-based — better for investors, worse for founders.",
                        color: C.yellow,
                      },
                      {
                        id: "full_ratchet",
                        label: "Full Ratchet",
                        badge: "Investor-Friendly",
                        desc: "Conversion price resets to the down-round price, regardless of amount raised. Extremely punishing for founders. Rare post-2010.",
                        color: C.red,
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setAntiDilution(opt.id)}
                      className="w-full text-left p-3 rounded text-xs"
                      style={{
                        background:
                          antiDilution === opt.id
                            ? "rgba(255,255,255,0.04)"
                            : "transparent",
                        border: `1px solid ${antiDilution === opt.id ? opt.color : C.border}`,
                        cursor: "pointer",
                      }}
                    >
                      <div className="flex justify-between mb-1">
                        <span
                          className="font-semibold"
                          style={{
                            color: antiDilution === opt.id ? opt.color : C.text,
                          }}
                        >
                          {opt.label}
                        </span>
                        <span style={{ color: opt.color, fontSize: 10 }}>
                          {opt.badge}
                        </span>
                      </div>
                      <div style={{ color: C.muted }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Down Round Calculator */}
              <div
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div
                  className="text-sm font-semibold mb-3"
                  style={{ color: C.text }}
                >
                  Down Round Scenario
                </div>
                <p className="text-xs mb-3" style={{ color: C.muted }}>
                  Assume a Series B priced at 50% of current post-money. How
                  does each anti-dilution mechanism affect the investor's
                  conversion price?
                </p>
                {(() => {
                  const origPPS = (preMoney + investmentAmount) / 10e6; // rough normalized
                  const downPPS = origPPS * 0.5;
                  const sharesIssued = (investmentAmount * 1e6) / origPPS;
                  const totalShares = 10e6; // simplified
                  const newSharesDownRound = 2e6; // assume 2M shares at down round

                  const adjustedPPS_broad =
                    (origPPS * (totalShares + sharesIssued)) /
                    (totalShares +
                      sharesIssued +
                      newSharesDownRound * (origPPS / downPPS - 1));
                  const adjustedPPS_narrow =
                    (origPPS * sharesIssued) /
                    (sharesIssued +
                      newSharesDownRound * (origPPS / downPPS - 1));
                  const adjustedPPS_ratchet = downPPS;

                  const getPPS = () => {
                    switch (antiDilution) {
                      case "none":
                        return origPPS;
                      case "weighted_avg_broad":
                        return Math.max(downPPS, adjustedPPS_broad);
                      case "weighted_avg_narrow":
                        return Math.max(downPPS, adjustedPPS_narrow);
                      case "full_ratchet":
                        return adjustedPPS_ratchet;
                      default:
                        return origPPS;
                    }
                  };
                  const adjPPS = getPPS();
                  const newShares =
                    (investmentAmount * 1e6) / adjPPS - sharesIssued;
                  const dilutionToFounders =
                    (newShares / (totalShares + sharesIssued + newShares)) *
                    100;

                  return (
                    <div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                            padding: "10px",
                          }}
                        >
                          <div className="text-xs" style={{ color: C.muted }}>
                            Original PPS
                          </div>
                          <div
                            className="font-mono font-bold text-sm"
                            style={{ color: C.text }}
                          >
                            ${origPPS.toFixed(4)}
                          </div>
                        </div>
                        <div
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: `1px solid ${C.border}`,
                            borderRadius: 8,
                            padding: "10px",
                          }}
                        >
                          <div className="text-xs" style={{ color: C.muted }}>
                            Down Round PPS
                          </div>
                          <div
                            className="font-mono font-bold text-sm"
                            style={{ color: C.red }}
                          >
                            ${downPPS.toFixed(4)}
                          </div>
                        </div>
                        <div
                          style={{
                            background: C.accentDim,
                            border: `1px solid ${C.accentBorder}`,
                            borderRadius: 8,
                            padding: "10px",
                          }}
                        >
                          <div className="text-xs" style={{ color: C.muted }}>
                            Adjusted PPS
                          </div>
                          <div
                            className="font-mono font-bold text-sm"
                            style={{ color: C.accent }}
                          >
                            ${adjPPS.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      {newShares > 0 && (
                        <div
                          className="text-xs p-2 rounded"
                          style={{
                            background: "rgba(248,113,113,0.08)",
                            border: "1px solid rgba(248,113,113,0.2)",
                          }}
                        >
                          <span style={{ color: C.red }}>
                            Investor receives {newShares.toFixed(0)} additional
                            shares
                          </span>
                          <span style={{ color: C.muted }}>
                            , diluting founders by an additional{" "}
                            {dilutionToFounders.toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}

          {activeSection === "scenarios" && (
            <>
              {/* All 3 scenarios side by side */}
              {results.scenarioResults.map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: C.card,
                    border: `1px solid ${s.color}30`,
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 12,
                  }}
                >
                  <div className="flex justify-between mb-3">
                    <div
                      className="font-semibold text-sm"
                      style={{ color: s.color }}
                    >
                      {s.label}
                    </div>
                    <div
                      className="font-mono text-sm font-bold"
                      style={{ color: C.text }}
                    >
                      {fmtM(s.exitVal)} exit
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-xs">
                      <div style={{ color: C.muted }}>Investor</div>
                      <div
                        className="font-bold font-mono"
                        style={{ color: C.accent }}
                      >
                        {fmtM(s.investorProceeds)}
                      </div>
                      <div style={{ color: C.dim }}>
                        {fmtx(s.investorMOIC)} · {fmtPct(s.investorIRR)} IRR
                      </div>
                    </div>
                    <div className="text-xs">
                      <div style={{ color: C.muted }}>Founder</div>
                      <div
                        className="font-bold font-mono"
                        style={{ color: C.blue }}
                      >
                        {fmtM(s.founderProceeds)}
                      </div>
                      <div style={{ color: C.dim }}>
                        {fmtPct(s.founderProceeds_pct)} of exit
                      </div>
                    </div>
                    <div className="text-xs">
                      <div style={{ color: C.muted }}>Preference Used?</div>
                      <div
                        className="font-semibold"
                        style={{
                          color:
                            s.exitVal <= s.totalPreference ? C.red : C.yellow,
                        }}
                      >
                        {s.exitVal <= s.totalPreference
                          ? "Yes (full pref)"
                          : "Partially"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right: Term Sheet Glossary + Negotiation Tips */}
        <div>
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <div
              className="text-sm font-semibold mb-3"
              style={{ color: C.text }}
            >
              Current Term Sheet Summary
            </div>
            <div className="space-y-2 text-xs">
              {[
                {
                  term: "Investment",
                  value: fmtM(investmentAmount),
                  color: C.text,
                },
                { term: "Pre-Money", value: fmtM(preMoney), color: C.text },
                {
                  term: "Post-Money",
                  value: fmtM(preMoney + investmentAmount),
                  color: C.text,
                },
                {
                  term: "Investor Ownership",
                  value: fmtPct(results.investorOwnership),
                  color: C.accent,
                },
                {
                  term: "Liquidation Preference",
                  value: `${liquidationMultiple}x ${liqPrefType === "non_participating" ? "NP" : liqPrefType === "participating" ? "Participating" : `Capped ${participationCap}x`}`,
                  color: C.yellow,
                },
                {
                  term: "Total Preference",
                  value: fmtM(results.totalPreference),
                  color: C.yellow,
                },
                {
                  term: "Dividends",
                  value:
                    dividendType === "none"
                      ? "None"
                      : `${dividendRate}% ${dividendType === "cumulative" ? "Cumulative" : "Non-Cumulative"}`,
                  color: C.text,
                },
                {
                  term: "Anti-Dilution",
                  value:
                    antiDilution === "none"
                      ? "None"
                      : antiDilution === "weighted_avg_broad"
                        ? "Broad WA"
                        : antiDilution === "weighted_avg_narrow"
                          ? "Narrow WA"
                          : "Full Ratchet",
                  color: C.blue,
                },
                {
                  term: "Board Seats",
                  value: `${boardSeats} investor seat${boardSeats !== 1 ? "s" : ""}`,
                  color: C.text,
                },
                {
                  term: "Pro-Rata Rights",
                  value: proRata ? "Yes" : "No",
                  color: proRata ? C.accent : C.muted,
                },
                {
                  term: "Drag-Along",
                  value: dragAlong ? "Yes" : "No",
                  color: dragAlong ? C.yellow : C.muted,
                },
                {
                  term: "ROFR / Co-Sale",
                  value: rofr ? "Yes" : "No",
                  color: rofr ? C.yellow : C.muted,
                },
              ].map((row) => (
                <div
                  key={row.term}
                  className="flex justify-between py-1"
                  style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}
                >
                  <span style={{ color: C.muted }}>{row.term}</span>
                  <span
                    className="font-mono font-semibold"
                    style={{ color: row.color }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Founder vs Investor Score */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <div
              className="text-sm font-semibold mb-3"
              style={{ color: C.text }}
            >
              Term Sheet Score
            </div>
            {(() => {
              let founderScore = 50;
              if (liqPrefType === "non_participating") founderScore += 15;
              if (liqPrefType === "participating") founderScore -= 20;
              if (liqPrefType === "capped_participating") founderScore += 5;
              if (liquidationMultiple <= 1) founderScore += 10;
              if (liquidationMultiple >= 2) founderScore -= 15;
              if (antiDilution === "none") founderScore += 15;
              if (antiDilution === "weighted_avg_broad") founderScore += 8;
              if (antiDilution === "full_ratchet") founderScore -= 20;
              if (dividendType === "cumulative") founderScore -= 10;
              if (boardSeats <= 1) founderScore += 5;
              if (boardSeats >= 2) founderScore -= 10;
              founderScore = Math.max(0, Math.min(100, founderScore));

              return (
                <div>
                  <div className="flex justify-between mb-2">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: C.blue }}
                    >
                      Founder-Friendly
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: C.red }}
                    >
                      Investor-Friendly
                    </span>
                  </div>
                  <div
                    style={{
                      height: 10,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 5,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${founderScore}%`,
                        height: "100%",
                        background:
                          founderScore > 60
                            ? C.accent
                            : founderScore > 40
                              ? C.yellow
                              : C.red,
                        borderRadius: 5,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span style={{ color: C.muted }}>
                      Score: {founderScore}/100
                    </span>
                    <span
                      style={{
                        color:
                          founderScore > 60
                            ? C.accent
                            : founderScore > 40
                              ? C.yellow
                              : C.red,
                      }}
                    >
                      {founderScore > 70
                        ? "Very Founder-Friendly"
                        : founderScore > 55
                          ? "Balanced"
                          : founderScore > 40
                            ? "Slightly Investor-Favorable"
                            : "Investor-Friendly"}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Negotiation Tips */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              className="text-sm font-semibold mb-3"
              style={{ color: C.text }}
            >
              Negotiation Priorities
            </div>
            <div className="space-y-2 text-xs">
              {[
                {
                  priority: "1",
                  item: "Non-participating preferred",
                  impact: "Highest founder impact at exit",
                  side: "founder",
                },
                {
                  priority: "2",
                  item: "1x liquidation multiple",
                  impact: "Standard — anything above is aggressive",
                  side: "founder",
                },
                {
                  priority: "3",
                  item: "Broad-based weighted average",
                  impact: "Standard anti-dilution protection",
                  side: "neutral",
                },
                {
                  priority: "4",
                  item: "Single board seat",
                  impact: "Maintain founder control at seed/A",
                  side: "founder",
                },
                {
                  priority: "5",
                  item: "Pro-rata capped at round size",
                  impact: "Prevents investor from crowding out others",
                  side: "neutral",
                },
                {
                  priority: "6",
                  item: "Non-cumulative dividends",
                  impact: "Don't let preference balloon over time",
                  side: "founder",
                },
              ].map((item) => (
                <div
                  key={item.priority}
                  className="flex gap-2 items-start p-2 rounded"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: C.accentDim, color: C.accent }}
                  >
                    {item.priority}
                  </span>
                  <div>
                    <div style={{ color: C.text }}>{item.item}</div>
                    <div style={{ color: C.dim }}>{item.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
