import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  calculateMarketSizing,
  DEFAULT_MARKET_SIZING_INPUTS,
  type MarketSizingInputs,
  type MarketSizingResult,
} from "../../utils/marketSizing";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#0A0F1C",
  card: "#111827",
  cardAlt: "#0D1220",
  border: "rgba(52,211,153,0.18)",
  accent: "#34D399",
  accentLight: "#6EE7B7",
  accentDim: "rgba(52,211,153,0.08)",
  accentBorder: "rgba(52,211,153,0.25)",
  text: "#F9FAFB",
  muted: "#9CA3AF",
  dim: "#6B7280",
  red: "#F87171",
  yellow: "#FCD34D",
  blue: "#60A5FA",
  purple: "#A78BFA",
  inputBg: "#1F2937",
  inputBorder: "#374151",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(millions: number): string {
  if (millions >= 1_000_000) return `$${(millions / 1_000_000).toFixed(1)}T`;
  if (millions >= 1_000) return `$${(millions / 1_000).toFixed(1)}B`;
  return `$${millions.toFixed(0)}M`;
}

function fmtShort(millions: number): string {
  if (millions >= 1_000) return `$${(millions / 1_000).toFixed(1)}B`;
  return `$${millions.toFixed(0)}M`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-widest mb-3 mt-5"
      style={{ color: C.accentLight }}
    >
      {children}
    </p>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  tooltip,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1 items-center">
        <span className="text-xs" style={{ color: C.muted }}>
          {label}
        </span>
        {tooltip && (
          <span className="text-xs" style={{ color: C.dim }}>
            {tooltip}
          </span>
        )}
      </div>
      <div
        className="flex items-center rounded-lg overflow-hidden"
        style={{ border: `1px solid ${C.inputBorder}` }}
      >
        {prefix && (
          <span
            className="px-2 py-1.5 text-xs font-mono"
            style={{ background: C.inputBorder, color: C.muted }}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 px-2 py-1.5 text-sm font-mono outline-none bg-transparent"
          style={{ background: C.inputBg, color: C.text }}
        />
        {suffix && (
          <span
            className="px-2 py-1.5 text-xs font-mono"
            style={{ background: C.inputBorder, color: C.muted }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// Viability badge color map
const viabilityColor: Record<MarketSizingResult["vcViability"], string> = {
  Excellent: "#34D399",
  Good: "#60A5FA",
  Marginal: "#FCD34D",
  "Too Small": "#F87171",
};

// ─── Circular gauge ───────────────────────────────────────────────────────────
function CircularGauge({ score, label }: { score: number; label: string }) {
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;
  // Only fill the top 75% of the circle (like a speedometer)
  const arcLen = circumference * 0.75;
  const filled = (score / 100) * arcLen;
  const gap = circumference - arcLen;
  // Rotate so arc starts at bottom-left (135deg)
  const rotation = 135;

  // Interpolate color: red -> yellow -> green
  const color =
    score >= 75
      ? C.accent
      : score >= 50
        ? C.accentLight
        : score >= 30
          ? C.yellow
          : C.red;

  return (
    <div className="flex flex-col items-center">
      <svg width={140} height={110} viewBox="0 0 140 110">
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={C.inputBorder}
          strokeWidth={10}
          strokeDasharray={`${arcLen} ${gap}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
        {/* Fill */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.4s ease" }}
        />
        {/* Score text */}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={22}
          fontWeight={700}
          fontFamily="monospace"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={C.muted}
          fontSize={9}
        >
          / 100
        </text>
      </svg>
      <p className="text-sm font-semibold -mt-2" style={{ color }}>
        {label}
      </p>
      <p className="text-xs mt-0.5" style={{ color: C.muted }}>
        Market Timing Score
      </p>
    </div>
  );
}

// ─── Funnel (TAM / SAM / SOM) ─────────────────────────────────────────────────
function FunnelDisplay({
  tam,
  sam,
  som,
  label,
}: {
  tam: number;
  sam: number;
  som: number;
  label: string;
}) {
  const max = tam || 1;
  const samW = Math.max(10, (sam / max) * 100);
  const somW = Math.max(6, (som / max) * 100);

  return (
    <div className="w-full">
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: C.dim }}
      >
        {label}
      </p>
      {/* TAM */}
      <div className="mb-1.5">
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: C.muted }}>TAM — Total Addressable</span>
          <span className="font-mono font-bold" style={{ color: C.accent }}>
            {fmt(tam)}
          </span>
        </div>
        <div
          className="h-7 rounded-md w-full"
          style={{ background: "rgba(52,211,153,0.25)" }}
        />
      </div>
      {/* SAM */}
      <div className="mb-1.5">
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: C.muted }}>SAM — Serviceable</span>
          <span
            className="font-mono font-bold"
            style={{ color: C.accentLight }}
          >
            {fmt(sam)}
          </span>
        </div>
        <div
          className="h-7 rounded-md"
          style={{ background: "rgba(110,231,183,0.25)", width: `${samW}%` }}
        />
      </div>
      {/* SOM */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: C.muted }}>SOM — Obtainable</span>
          <span className="font-mono font-bold" style={{ color: C.blue }}>
            {fmt(som)}
          </span>
        </div>
        <div
          className="h-7 rounded-md"
          style={{ background: "rgba(96,165,250,0.25)", width: `${somW}%` }}
        />
      </div>
    </div>
  );
}

// ─── Benchmark comparison ─────────────────────────────────────────────────────
const BENCHMARKS = [
  {
    name: "Uber (original taxi TAM)",
    tam: 4_000,
    outcome: "Redefined to $2T+ mobility",
  },
  {
    name: "Airbnb (hotel market)",
    tam: 100_000,
    outcome: "$100B+ home-sharing market created",
  },
  {
    name: "Slack (enterprise chat)",
    tam: 28_000,
    outcome: "Disrupted $28B email market",
  },
  {
    name: "Stripe (online payments)",
    tam: 9_000_000,
    outcome: "$9T payments infrastructure",
  },
  {
    name: "Zoom (video conferencing)",
    tam: 43_000,
    outcome: "Pandemic accelerated $43B TAM",
  },
];

function BenchmarkRow({
  name,
  tam,
  outcome,
  myTam,
}: {
  name: string;
  tam: number;
  outcome: string;
  myTam: number;
}) {
  const maxTam = 9_000_000;
  const barW = Math.max(2, Math.log10(tam + 1) / Math.log10(maxTam + 1)) * 100;
  const myBarW =
    Math.max(2, Math.log10(myTam + 1) / Math.log10(maxTam + 1)) * 100;
  const isLarger = myTam >= tam;

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-0.5">
        <span style={{ color: C.text }}>{name}</span>
        <span className="font-mono" style={{ color: C.muted }}>
          {fmt(tam)}
        </span>
      </div>
      <div
        className="relative h-4 rounded overflow-hidden"
        style={{ background: C.inputBorder }}
      >
        <div
          className="h-full rounded"
          style={{
            width: `${barW}%`,
            background: "rgba(167,139,250,0.5)",
            transition: "width 0.4s",
          }}
        />
        <div
          className="absolute top-0 h-full rounded"
          style={{
            width: `${myBarW}%`,
            background: isLarger
              ? "rgba(52,211,153,0.6)"
              : "rgba(248,113,113,0.5)",
            opacity: 0.8,
            transition: "width 0.4s",
          }}
        />
      </div>
      <p className="text-xs mt-0.5 italic" style={{ color: C.dim }}>
        {outcome}
      </p>
    </div>
  );
}

// ─── Educational callout ──────────────────────────────────────────────────────
function VcPowerLawCallout() {
  return (
    <div
      className="rounded-xl p-4 mt-4"
      style={{ background: C.accentDim, border: `1px solid ${C.accentBorder}` }}
    >
      <p className="text-sm font-semibold mb-2" style={{ color: C.accent }}>
        Why market size matters to VCs — the power law behind fund returns
      </p>
      <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
        A typical $500M VC fund needs to return 3× → $1.5B. With a 20% ownership
        stake and 10% dilution at IPO, your company must reach a{" "}
        <span className="font-semibold" style={{ color: C.accentLight }}>
          $10B+ valuation
        </span>{" "}
        just to return the fund from one investment. This means the TAM must
        plausibly support a $10B+ outcome. VCs ask:{" "}
        <em style={{ color: C.text }}>
          "If this company wins, is there enough market to justify the
          valuation?"
        </em>
      </p>
      <p className="text-xs leading-relaxed mt-2" style={{ color: C.muted }}>
        The power law is brutal: the top 6% of investments generate 60% of
        returns. This is why VCs only fund companies that could be{" "}
        <span className="font-semibold" style={{ color: C.accentLight }}>
          category-defining at scale
        </span>{" "}
        — small markets simply cannot produce the outlier returns required.
      </p>
    </div>
  );
}

// ─── Approach tab button ──────────────────────────────────────────────────────
function ApproachTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: active ? C.accent : "transparent",
        color: active ? "#0A0F1C" : C.muted,
        border: `1px solid ${active ? C.accent : C.inputBorder}`,
      }}
    >
      {label}
    </button>
  );
}

// ─── Custom tooltip for AreaChart ─────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <p className="font-semibold mb-1" style={{ color: C.accent }}>
        Year {label}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: C.muted }}>{p.name}</span>
          <span className="font-mono font-bold" style={{ color: p.color }}>
            {fmtShort(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function MarketSizingTab() {
  const [inputs, setInputs] = useState<MarketSizingInputs>(
    DEFAULT_MARKET_SIZING_INPUTS,
  );

  const result = useMemo(() => calculateMarketSizing(inputs), [inputs]);

  function set<K extends keyof MarketSizingInputs>(
    key: K,
    value: MarketSizingInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  const viabilityBadgeColor = viabilityColor[result.vcViability];

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: C.text }}>
          Market Sizing Analysis
        </h2>
        <p className="text-sm mt-1" style={{ color: C.muted }}>
          TAM / SAM / SOM calculator with VC viability scoring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── LEFT: Inputs ── */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          {/* Approach tabs */}
          <div className="flex gap-2 mb-4">
            {(["top-down", "bottom-up", "both"] as const).map((a) => (
              <ApproachTab
                key={a}
                label={
                  a === "top-down"
                    ? "Top-Down"
                    : a === "bottom-up"
                      ? "Bottom-Up"
                      : "Both"
                }
                active={inputs.approach === a}
                onClick={() => set("approach", a)}
              />
            ))}
          </div>

          {/* Top-Down inputs */}
          {(inputs.approach === "top-down" || inputs.approach === "both") && (
            <>
              <SectionLabel>Top-Down Inputs</SectionLabel>
              <NumberInput
                label="Global Addressable Market"
                value={inputs.globalAddressableMarket}
                onChange={(v) => set("globalAddressableMarket", v)}
                prefix="$"
                suffix="B"
                tooltip="Total global spend"
              />
              <NumberInput
                label="Target Geography %"
                value={inputs.targetGeographyPct * 100}
                onChange={(v) => set("targetGeographyPct", v / 100)}
                suffix="%"
                tooltip="e.g. 10 = 10%"
              />
              <NumberInput
                label="Target Segment %"
                value={inputs.targetSegmentPct * 100}
                onChange={(v) => set("targetSegmentPct", v / 100)}
                suffix="%"
                tooltip="Subset of geography"
              />
              <NumberInput
                label="Realistic Market Share %"
                value={inputs.realisticSharePct * 100}
                onChange={(v) => set("realisticSharePct", v / 100)}
                suffix="%"
                tooltip="Your SOM share"
              />
            </>
          )}

          {/* Bottom-Up inputs */}
          {(inputs.approach === "bottom-up" || inputs.approach === "both") && (
            <>
              <SectionLabel>Bottom-Up Inputs</SectionLabel>
              <NumberInput
                label="Total Target Customers"
                value={inputs.totalTargetCustomers}
                onChange={(v) => set("totalTargetCustomers", v)}
                tooltip="ICP universe"
              />
              <NumberInput
                label="Avg Revenue Per Customer"
                value={inputs.avgRevenuePerCustomer}
                onChange={(v) => set("avgRevenuePerCustomer", v)}
                prefix="$"
                suffix="/yr"
                tooltip="ACV / ARR"
              />
              <NumberInput
                label="Conversion Rate %"
                value={inputs.conversionRate * 100}
                onChange={(v) => set("conversionRate", v / 100)}
                suffix="%"
                tooltip="Win rate from ICP"
              />
            </>
          )}

          {/* Market dynamics */}
          <SectionLabel>Market Dynamics</SectionLabel>
          <NumberInput
            label="Annual Market Growth Rate"
            value={inputs.marketGrowthRate}
            onChange={(v) => set("marketGrowthRate", v)}
            suffix="%/yr"
            tooltip="CAGR estimate"
          />
          <NumberInput
            label="Years to Model"
            value={inputs.yearsToModel}
            onChange={(v) =>
              set("yearsToModel", Math.min(10, Math.max(1, Math.round(v))))
            }
            suffix="yrs"
            tooltip="1–10"
          />

          {/* Educational callout */}
          <VcPowerLawCallout />
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* VC Viability badge */}
          <div
            className="rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div className="flex-1">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: C.dim }}
              >
                VC Viability
              </p>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{
                    background: `${viabilityBadgeColor}22`,
                    color: viabilityBadgeColor,
                    border: `1px solid ${viabilityBadgeColor}55`,
                  }}
                >
                  {result.vcViability}
                </span>
                <span
                  className="text-lg font-bold font-mono"
                  style={{ color: C.accent }}
                >
                  TAM {fmt(result.tam)}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
                {result.vcViabilityReason}
              </p>
            </div>
            <CircularGauge
              score={result.marketTimingScore}
              label={result.marketTimingLabel}
            />
          </div>

          {/* TAM/SAM/SOM funnels */}
          <div
            className="rounded-2xl p-5"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="text-sm font-semibold mb-4" style={{ color: C.text }}>
              Market Size Funnel
            </p>
            <div
              className={`grid gap-6 ${inputs.approach === "both" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
            >
              {(inputs.approach === "top-down" ||
                inputs.approach === "both") && (
                <FunnelDisplay
                  tam={result.tam}
                  sam={result.sam}
                  som={result.som}
                  label={
                    inputs.approach === "both" ? "Top-Down" : "Market Sizing"
                  }
                />
              )}
              {inputs.approach === "both" && (
                <FunnelDisplay
                  tam={result.tamBottomUp}
                  sam={result.samBottomUp}
                  som={result.somBottomUp}
                  label="Bottom-Up"
                />
              )}
              {inputs.approach === "bottom-up" && (
                <FunnelDisplay
                  tam={result.tamBottomUp}
                  sam={result.samBottomUp}
                  som={result.somBottomUp}
                  label="Market Sizing"
                />
              )}
            </div>
          </div>

          {/* 5-year projections chart */}
          <div
            className="rounded-2xl p-5"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: C.text }}>
              {inputs.yearsToModel}-Year Market Projections
            </p>
            <p className="text-xs mb-4" style={{ color: C.muted }}>
              At {inputs.marketGrowthRate}% annual growth — all values in $M
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={result.projections}
                margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="gTam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.accent} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSam" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={C.accentLight}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={C.accentLight}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="gSom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.blue} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="year"
                  tick={{ fill: C.muted, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `Y${v}`}
                />
                <YAxis
                  tick={{ fill: C.muted, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => fmtShort(v)}
                  width={58}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="tam"
                  name="TAM"
                  stroke={C.accent}
                  strokeWidth={2}
                  fill="url(#gTam)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="sam"
                  name="SAM"
                  stroke={C.accentLight}
                  strokeWidth={2}
                  fill="url(#gSam)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="som"
                  name="SOM"
                  stroke={C.blue}
                  strokeWidth={2}
                  fill="url(#gSom)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Benchmark comparison */}
          <div
            className="rounded-2xl p-5"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: C.text }}>
              Benchmark Comparison
            </p>
            <p className="text-xs mb-4" style={{ color: C.muted }}>
              Purple = benchmark TAM &nbsp;|&nbsp;{" "}
              <span style={{ color: C.accent }}>Green</span> /{" "}
              <span style={{ color: C.red }}>Red</span> = your TAM vs benchmark.
              Axes are log-scaled.
            </p>
            {BENCHMARKS.map((b) => (
              <BenchmarkRow
                key={b.name}
                name={b.name}
                tam={b.tam}
                outcome={b.outcome}
                myTam={result.tam}
              />
            ))}
            <p className="text-xs mt-3 italic" style={{ color: C.dim }}>
              Note: TAM comparisons use original analyst estimates at the time
              of initial VC funding, not current valuations. Uber's original TAM
              was pegged at the global taxi market (~$4B) — Peter Thiel and
              others argued this was far too narrow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
