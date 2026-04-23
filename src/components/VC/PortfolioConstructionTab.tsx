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

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      <div className="text-xs mb-1" style={{ color: C.muted }}>
        {label}
      </div>
      <div
        className="text-xl font-bold font-mono"
        style={{ color: color ?? C.accent }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: C.dim }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// Power law outcome distribution for VC portfolio
function generatePortfolioOutcomes(
  numCompanies: number,
  checkSize: number,
  reserveRatio: number,
  medianMOIC: number,
) {
  // Power law distribution: ~50% lose money, 30% 1-3x, 15% 3-10x, 4% 10-30x, 1% 30x+
  const buckets = [
    { label: "Total Loss (0x)", prob: 0.35, moic: 0, color: C.red },
    {
      label: "Partial Loss (0.1-0.5x)",
      prob: 0.15,
      moic: 0.3,
      color: "#FB923C",
    },
    {
      label: "Return of Capital (0.5-1x)",
      prob: 0.1,
      moic: 0.75,
      color: C.yellow,
    },
    { label: "Modest Return (1-3x)", prob: 0.2, moic: 2.0, color: "#A3E635" },
    { label: "Good Return (3-10x)", prob: 0.12, moic: 6.0, color: C.accent },
    { label: "Great Return (10-30x)", prob: 0.06, moic: 18.0, color: C.blue },
    { label: "Fund Returner (30x+)", prob: 0.02, moic: 50.0, color: C.purple },
  ];

  // Scale MOIC by the median param
  const scaleFactor = medianMOIC / 2.0;
  const scaledBuckets = buckets.map((b) => ({
    ...b,
    moic: b.moic * scaleFactor,
  }));

  const companies = Array.from({ length: numCompanies }, (_, i) => {
    const rand = (i + 0.5) / numCompanies; // deterministic spread
    let cumProb = 0;
    let bucket = scaledBuckets[0];
    for (const b of scaledBuckets) {
      cumProb += b.prob;
      if (rand <= cumProb) {
        bucket = b;
        break;
      }
    }
    // Add some variance within bucket
    const variance = 0.8 + (((i * 137) % 100) / 100) * 0.4;
    return {
      id: i + 1,
      moic: bucket.moic * variance,
      bucket: bucket.label,
      color: bucket.color,
    };
  });

  return { companies, buckets: scaledBuckets };
}

const fmtM = (v: number) => `$${v.toFixed(1)}M`;
const fmtx = (v: number) => `${v.toFixed(1)}x`;
const fmtPct = (v: number) => `${v.toFixed(1)}%`;

export function PortfolioConstructionTab() {
  const [fundSize, setFundSize] = useState(100); // $M
  const [numCompanies, setNumCompanies] = useState(25);
  const [reserveRatio, setReserveRatio] = useState(50); // % of fund for follow-ons
  const [avgCheckSize, setAvgCheckSize] = useState(2); // $M initial check
  const [targetOwnership, setTargetOwnership] = useState(10); // % ownership at entry
  const [followOnRounds, setFollowOnRounds] = useState(2); // avg follow-ons per company
  const [medianMOIC, setMedianMOIC] = useState(2); // median MOIC multiplier
  const [stageFilter, setStageFilter] = useState<
    "seed" | "seriesA" | "seriesB"
  >("seed");
  const [showPowerLaw, setShowPowerLaw] = useState(true);

  const results = useMemo(() => {
    const initialCapital = fundSize * (1 - reserveRatio / 100) * 1e6;
    const reserveCapital = fundSize * (reserveRatio / 100) * 1e6;
    const effectiveCheckSize = avgCheckSize * 1e6;
    const maxCompanies = Math.floor(initialCapital / effectiveCheckSize);
    const effectiveCompanies = Math.min(numCompanies, maxCompanies);

    const { companies, buckets } = generatePortfolioOutcomes(
      effectiveCompanies,
      effectiveCheckSize,
      reserveRatio,
      medianMOIC,
    );

    const totalReturns = companies.reduce(
      (sum, c) => sum + c.moic * effectiveCheckSize,
      0,
    );
    const grossMOIC = totalReturns / (fundSize * 1e6);
    const winners = companies.filter((c) => c.moic >= 3);
    const fundReturners = companies.filter(
      (c) => c.moic * effectiveCheckSize >= fundSize * 1e6,
    );
    const totalLosses = companies.filter((c) => c.moic < 0.5);

    // Top company contribution
    const sorted = [...companies].sort((a, b) => b.moic - a.moic);
    const top1Contribution =
      ((sorted[0]?.moic * effectiveCheckSize) / totalReturns) * 100;
    const top3Contribution =
      (sorted.slice(0, 3).reduce((s, c) => s + c.moic * effectiveCheckSize, 0) /
        totalReturns) *
      100;

    // Reserve deployment
    const avgFollowOnPerCo = reserveCapital / (effectiveCompanies * 1e6);
    const reservePerWinner = reserveCapital / Math.max(1, winners.length * 1e6);

    // Net IRR estimate (simplified, assuming 7yr hold)
    const mgmtFees = fundSize * 0.02 * 7; // 2% for 7 years approx
    const grossProceeds = totalReturns;
    const netProceeds = grossProceeds - mgmtFees * 1e6;
    const netMOIC = netProceeds / (fundSize * 1e6);
    const netIRR = Math.pow(Math.max(0, netMOIC), 1 / 7) - 1;

    // Ownership at exit (dilution through rounds)
    const dilutionFactor =
      stageFilter === "seed" ? 0.45 : stageFilter === "seriesA" ? 0.6 : 0.7;
    const exitOwnership = targetOwnership * dilutionFactor;

    return {
      effectiveCompanies,
      maxCompanies,
      initialCapital,
      reserveCapital,
      companies: sorted,
      buckets,
      grossMOIC,
      netMOIC,
      netIRR: netIRR * 100,
      winners: winners.length,
      fundReturners: fundReturners.length,
      totalLosses: totalLosses.length,
      top1Contribution,
      top3Contribution,
      totalReturns,
      avgFollowOnPerCo,
      reservePerWinner,
      exitOwnership,
    };
  }, [
    fundSize,
    numCompanies,
    reserveRatio,
    avgCheckSize,
    targetOwnership,
    medianMOIC,
    stageFilter,
  ]);

  const stageProfiles = {
    seed: {
      label: "Seed",
      valRange: "$3-10M pre",
      checkRange: "$500K-$2M",
      ownershipRange: "10-20%",
      dilutionRounds: "Series A, B, C",
      avgDilution: "55% by exit",
    },
    seriesA: {
      label: "Series A",
      valRange: "$15-40M pre",
      checkRange: "$2-8M",
      ownershipRange: "12-20%",
      dilutionRounds: "Series B, C, D",
      avgDilution: "40% by exit",
    },
    seriesB: {
      label: "Series B",
      valRange: "$50-150M pre",
      checkRange: "$10-25M",
      ownershipRange: "8-15%",
      dilutionRounds: "Series C, D",
      avgDilution: "30% by exit",
    },
  };

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
          Portfolio Construction & Power Law Returns
        </h2>
        <p className="text-sm" style={{ color: C.muted }}>
          Model your fund's portfolio construction strategy — diversification,
          reserve ratios, and how power law dynamics determine fund returns
        </p>
      </div>

      {/* Stage Toggle */}
      <div className="flex gap-2 mb-6">
        {(["seed", "seriesA", "seriesB"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStageFilter(s)}
            style={{
              background: stageFilter === s ? C.accentDim : C.card,
              border: `1px solid ${stageFilter === s ? C.accent : C.border}`,
              borderRadius: 8,
              padding: "8px 20px",
              cursor: "pointer",
              color: stageFilter === s ? C.accent : C.muted,
              fontSize: 13,
              fontWeight: stageFilter === s ? 600 : 400,
            }}
          >
            {stageProfiles[s].label}
          </button>
        ))}
        <div
          className="ml-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{
            background: C.accentDim,
            border: `1px solid ${C.accentBorder}`,
          }}
        >
          <span style={{ color: C.muted }}>Entry valuation:</span>
          <span style={{ color: C.accent }}>
            {stageProfiles[stageFilter].valRange}
          </span>
          <span style={{ color: C.dim }}>|</span>
          <span style={{ color: C.muted }}>Typical check:</span>
          <span style={{ color: C.accent }}>
            {stageProfiles[stageFilter].checkRange}
          </span>
          <span style={{ color: C.dim }}>|</span>
          <span style={{ color: C.muted }}>Avg dilution by exit:</span>
          <span style={{ color: C.yellow }}>
            {stageProfiles[stageFilter].avgDilution}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Controls */}
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
              Fund Parameters
            </div>
            <Slider
              label="Fund Size"
              value={fundSize}
              min={25}
              max={500}
              step={25}
              format={(v) => `$${v}M`}
              onChange={setFundSize}
            />
            <Slider
              label="Target Companies"
              value={numCompanies}
              min={5}
              max={60}
              step={1}
              format={(v) => `${v}`}
              onChange={setNumCompanies}
            />
            <Slider
              label="Initial Check Size"
              value={avgCheckSize}
              min={0.25}
              max={20}
              step={0.25}
              format={(v) => `$${v}M`}
              onChange={setAvgCheckSize}
            />
            <Slider
              label="Reserve Ratio"
              value={reserveRatio}
              min={20}
              max={70}
              step={5}
              format={(v) => `${v}%`}
              onChange={setReserveRatio}
            />
            <div
              className="text-xs p-3 rounded-lg mt-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${C.border}`,
              }}
            >
              <div className="flex justify-between mb-1">
                <span style={{ color: C.muted }}>Initial capital</span>
                <span style={{ color: C.text }} className="font-mono">
                  {fmtM(fundSize * (1 - reserveRatio / 100))}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: C.muted }}>Reserve capital</span>
                <span style={{ color: C.yellow }} className="font-mono">
                  {fmtM((fundSize * reserveRatio) / 100)}
                </span>
              </div>
            </div>
          </div>

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
              Investment Strategy
            </div>
            <Slider
              label="Target Ownership at Entry"
              value={targetOwnership}
              min={3}
              max={25}
              step={1}
              format={(v) => `${v}%`}
              onChange={setTargetOwnership}
            />
            <Slider
              label="Avg Follow-On Rounds"
              value={followOnRounds}
              min={0}
              max={4}
              step={0.5}
              format={(v) => `${v}`}
              onChange={setFollowOnRounds}
            />
            <Slider
              label="Median Portfolio MOIC (scenario)"
              value={medianMOIC}
              min={0.5}
              max={5}
              step={0.5}
              format={(v) => `${v}x`}
              onChange={setMedianMOIC}
            />
            <div
              className="mt-3 text-xs p-2 rounded"
              style={{
                background: "rgba(167,139,250,0.06)",
                border: "1px solid rgba(167,139,250,0.2)",
              }}
            >
              <span style={{ color: C.purple }}>
                Exit ownership: ~{results.exitOwnership.toFixed(1)}%
              </span>
              <span style={{ color: C.muted }}>
                {" "}
                after expected dilution through{" "}
                {stageProfiles[stageFilter].dilutionRounds}
              </span>
            </div>
          </div>

          {/* Reserve Strategy */}
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
              Reserve Strategy
            </div>
            <div className="space-y-2">
              {[
                {
                  label: "Pro-rata in all companies",
                  desc: "Maintain % ownership; ~equal allocation",
                  risk: "Wastes reserves on losers",
                },
                {
                  label: "Double-down on winners",
                  desc: "Concentrate reserves in top performers",
                  risk: "Requires early signal detection",
                },
                {
                  label: "Hybrid (threshold-based)",
                  desc: "Reserve for companies hitting milestones",
                  risk: "Requires portfolio monitoring rigor",
                },
              ].map((strategy, i) => (
                <div
                  key={i}
                  className="text-xs p-2 rounded"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    className="font-semibold mb-0.5"
                    style={{ color: C.text }}
                  >
                    {strategy.label}
                  </div>
                  <div style={{ color: C.muted }}>{strategy.desc}</div>
                  <div style={{ color: C.red }}>Risk: {strategy.risk}</div>
                </div>
              ))}
            </div>
            <div
              className="mt-3 text-xs p-2 rounded"
              style={{
                background: C.accentDim,
                border: `1px solid ${C.accentBorder}`,
              }}
            >
              <span style={{ color: C.accent }}>Avg reserve per company: </span>
              <span style={{ color: C.text }} className="font-mono">
                {fmtM(results.avgFollowOnPerCo)}
              </span>
              <br />
              <span style={{ color: C.accent }}>
                Reserve per winner (if concentrated):{" "}
              </span>
              <span style={{ color: C.text }} className="font-mono">
                {fmtM(results.reservePerWinner)}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Portfolio Metrics + Power Law Viz */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <MetricCard
              label="Gross MOIC"
              value={fmtx(results.grossMOIC)}
              sub="Pre-fees/carry"
              color={
                results.grossMOIC >= 3
                  ? C.accent
                  : results.grossMOIC >= 2
                    ? C.yellow
                    : C.red
              }
            />
            <MetricCard
              label="Net MOIC"
              value={fmtx(results.netMOIC)}
              sub="2/20, 8% hurdle"
              color={results.netMOIC >= 2.5 ? C.accent : C.yellow}
            />
            <MetricCard
              label="Est. Net IRR"
              value={fmtPct(results.netIRR)}
              sub="7yr fund life"
              color={
                results.netIRR >= 25
                  ? C.accent
                  : results.netIRR >= 15
                    ? C.yellow
                    : C.red
              }
            />
            <MetricCard
              label="Winners (3x+)"
              value={`${results.winners}/${results.effectiveCompanies}`}
              sub="Companies returning 3x+"
              color={C.blue}
            />
          </div>

          {/* Power Law Distribution */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold" style={{ color: C.text }}>
                Power Law Return Distribution
              </div>
              <button
                onClick={() => setShowPowerLaw(!showPowerLaw)}
                className="text-xs px-2 py-1 rounded"
                style={{
                  background: C.accentDim,
                  border: `1px solid ${C.accentBorder}`,
                  color: C.accent,
                  cursor: "pointer",
                }}
              >
                {showPowerLaw ? "Show Contribution" : "Show Distribution"}
              </button>
            </div>

            {showPowerLaw ? (
              // Show return distribution by bucket
              <div>
                {results.buckets.map((b) => {
                  const count = results.companies.filter(
                    (c) => c.bucket === b.label,
                  ).length;
                  const pct = (count / results.effectiveCompanies) * 100;
                  return (
                    <div key={b.label} className="mb-2">
                      <div className="flex justify-between mb-1 text-xs">
                        <span style={{ color: C.muted }}>{b.label}</span>
                        <span style={{ color: b.color }} className="font-mono">
                          {count} co ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 4,
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: b.color,
                            borderRadius: 4,
                            opacity: 0.8,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Show value contribution by bucket
              <div>
                {results.buckets.map((b) => {
                  const bucketCompanies = results.companies.filter(
                    (c) => c.bucket === b.label,
                  );
                  const contribution = bucketCompanies.reduce(
                    (s, c) => s + c.moic * avgCheckSize * 1e6,
                    0,
                  );
                  const pct =
                    results.totalReturns > 0
                      ? (contribution / results.totalReturns) * 100
                      : 0;
                  return (
                    <div key={b.label} className="mb-2">
                      <div className="flex justify-between mb-1 text-xs">
                        <span style={{ color: C.muted }}>{b.label}</span>
                        <span style={{ color: b.color }} className="font-mono">
                          {pct.toFixed(0)}% of total returns
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 4,
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, pct)}%`,
                            height: "100%",
                            background: b.color,
                            borderRadius: 4,
                            opacity: 0.8,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Company Concentration */}
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
              Return Concentration
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div
                style={{
                  background: "rgba(167,139,248,0.08)",
                  border: "1px solid rgba(167,139,248,0.2)",
                  borderRadius: 8,
                  padding: "12px",
                }}
              >
                <div className="text-xs" style={{ color: C.muted }}>
                  Top 1 company
                </div>
                <div
                  className="text-lg font-bold font-mono"
                  style={{ color: C.purple }}
                >
                  {results.top1Contribution.toFixed(0)}%
                </div>
                <div className="text-xs" style={{ color: C.dim }}>
                  of total fund returns
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
                  Top 3 companies
                </div>
                <div
                  className="text-lg font-bold font-mono"
                  style={{ color: C.blue }}
                >
                  {results.top3Contribution.toFixed(0)}%
                </div>
                <div className="text-xs" style={{ color: C.dim }}>
                  of total fund returns
                </div>
              </div>
            </div>
            <div
              className="text-xs p-3 rounded"
              style={{
                background: "rgba(252,211,77,0.06)",
                border: "1px solid rgba(252,211,77,0.15)",
              }}
            >
              <span style={{ color: C.yellow }}>Power Law Reality: </span>
              <span style={{ color: C.muted }}>
                In VC, typically 1-2 companies return the entire fund. The rest
                must break even for the fund to be considered "good." This means{" "}
                <strong style={{ color: C.text }}>
                  missing one Uber or Airbnb is more costly than 10 failures.
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Individual Company List + Metrics */}
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
              Portfolio Company Outcomes
            </div>
            <div className="flex gap-3 mb-3 text-xs">
              <div
                className="px-2 py-1 rounded"
                style={{
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  color: C.red,
                }}
              >
                {results.totalLosses} losses
              </div>
              <div
                className="px-2 py-1 rounded"
                style={{
                  background: "rgba(52,211,153,0.1)",
                  border: `1px solid ${C.accentBorder}`,
                  color: C.accent,
                }}
              >
                {results.winners} winners
              </div>
              <div
                className="px-2 py-1 rounded"
                style={{
                  background: "rgba(167,139,250,0.1)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  color: C.purple,
                }}
              >
                {results.fundReturners} fund returners
              </div>
            </div>
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {results.companies.map((co, i) => (
                <div
                  key={co.id}
                  className="flex items-center gap-2 py-1.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <span
                    className="text-xs w-6 text-right font-mono"
                    style={{ color: C.dim }}
                  >
                    #{i + 1}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 3,
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (co.moic / 60) * 100)}%`,
                        height: "100%",
                        background: co.color,
                        borderRadius: 3,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs w-12 text-right font-mono"
                    style={{ color: co.color }}
                  >
                    {fmtx(co.moic)}
                  </span>
                  <span
                    className="text-xs w-16 text-right font-mono"
                    style={{ color: C.muted }}
                  >
                    {fmtM(co.moic * avgCheckSize)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Diversification Analysis */}
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
              Diversification Analysis
            </div>
            <div className="space-y-2 text-xs">
              {[
                {
                  label: "Spray & Pray (50+ cos)",
                  checkSize: "Small",
                  moicTarget: "3-4x fund",
                  pros: "Maximum shots at unicorns",
                  cons: "No reserves, brand suffers",
                  fit: "Micro-VCs, syndicates",
                },
                {
                  label: "Focused (15-25 cos)",
                  checkSize: "Medium",
                  moicTarget: "3-5x fund",
                  pros: "Meaningful reserves, board support",
                  cons: "Higher individual company risk",
                  fit: "Most top-tier VCs",
                },
                {
                  label: "Concentrated (5-12 cos)",
                  checkSize: "Large",
                  moicTarget: "4-8x fund",
                  pros: "Deep ownership, big wins matter more",
                  cons: "Zero margin for error, high variance",
                  fit: "Tiger-style, crossover funds",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="p-2 rounded"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="font-semibold mb-1" style={{ color: C.text }}>
                    {row.label}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <span style={{ color: C.muted }}>Target: </span>
                      <span style={{ color: C.yellow }}>{row.moicTarget}</span>
                    </div>
                    <div>
                      <span style={{ color: C.muted }}>Best for: </span>
                      <span style={{ color: C.blue }}>{row.fit}</span>
                    </div>
                    <div>
                      <span style={{ color: C.accent }}>+ </span>
                      <span style={{ color: C.muted }}>{row.pros}</span>
                    </div>
                    <div>
                      <span style={{ color: C.red }}>- </span>
                      <span style={{ color: C.muted }}>{row.cons}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="mt-3 text-xs p-2 rounded"
              style={{
                background: C.accentDim,
                border: `1px solid ${C.accentBorder}`,
              }}
            >
              <span style={{ color: C.accent }}>Your model: </span>
              <span style={{ color: C.text }}>
                {results.effectiveCompanies} companies
              </span>
              <span style={{ color: C.muted }}> with </span>
              <span style={{ color: C.text }}>{fmtM(avgCheckSize)} checks</span>
              <span style={{ color: C.muted }}>
                {" "}
                —{" "}
                {results.effectiveCompanies >= 35
                  ? "Spray & Pray range"
                  : results.effectiveCompanies >= 15
                    ? "Focused portfolio range"
                    : "Concentrated portfolio range"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Fund Return Benchmarks */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 24,
          marginTop: 20,
        }}
      >
        <div className="text-sm font-semibold mb-4" style={{ color: C.text }}>
          VC Fund Performance Benchmarks (Top-Quartile Standards)
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              category: "Seed Fund",
              dpi: "2.5-4x",
              tvpi: "3-6x",
              irr: "25-40%",
              life: "10-12yr",
              color: C.accent,
            },
            {
              category: "Series A Fund",
              dpi: "2-3.5x",
              tvpi: "3-5x",
              irr: "20-35%",
              life: "10-12yr",
              color: C.blue,
            },
            {
              category: "Multi-Stage Fund",
              dpi: "1.8-3x",
              tvpi: "2.5-4x",
              irr: "18-28%",
              life: "12-14yr",
              color: C.yellow,
            },
            {
              category: "Growth Fund",
              dpi: "1.5-2.5x",
              tvpi: "2-3.5x",
              irr: "15-22%",
              life: "10yr",
              color: C.purple,
            },
          ].map((bench) => (
            <div
              key={bench.category}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div
                className="text-xs font-bold mb-3"
                style={{ color: bench.color }}
              >
                {bench.category}
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span style={{ color: C.muted }}>DPI (Top Q)</span>
                  <span className="font-mono" style={{ color: C.text }}>
                    {bench.dpi}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: C.muted }}>TVPI (Top Q)</span>
                  <span className="font-mono" style={{ color: C.text }}>
                    {bench.tvpi}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: C.muted }}>Net IRR</span>
                  <span className="font-mono" style={{ color: bench.color }}>
                    {bench.irr}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: C.muted }}>Fund Life</span>
                  <span className="font-mono" style={{ color: C.dim }}>
                    {bench.life}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs" style={{ color: C.dim }}>
          Sources: Cambridge Associates, Preqin, PitchBook benchmarks.
          Top-quartile defined as funds in 75th percentile by vintage year. DPI
          = Distributed to Paid-In (realized). TVPI = Total Value to Paid-In
          (realized + unrealized).
        </div>
      </div>
    </div>
  );
}
