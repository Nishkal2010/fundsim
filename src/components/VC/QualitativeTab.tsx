import { useMemo, useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  calculatePayne,
  calculateBerkus,
  calculateFounderDNA,
  DEFAULT_PAYNE_DIMENSIONS,
  DEFAULT_BERKUS_FACTORS,
  DEFAULT_FOUNDER_DNA_DIMENSIONS,
} from "../../utils/qualitative";

// ─── Colour tokens ─────────────────────────────────────────────────────────────

const C = {
  bg: "#0A0F1C",
  card: "#111827",
  cardAlt: "#0D1220",
  border: "#1F2937",
  accent: "#818CF8",
  green: "#34D399",
  muted: "#6B7280",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  yellow: "#FBBF24",
  red: "#F87171",
};

// ─── Tab pill ──────────────────────────────────────────────────────────────────

type InnerTab = "payne" | "berkus" | "dna";

function TabPill({
  id,
  label,
  active,
  onClick,
}: {
  id: InnerTab;
  label: string;
  active: boolean;
  onClick: (id: InnerTab) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        padding: "6px 18px",
        borderRadius: 9999,
        border: active ? `1px solid ${C.accent}` : `1px solid ${C.border}`,
        background: active ? `${C.accent}22` : "transparent",
        color: active ? C.accent : C.textSecondary,
        fontWeight: active ? 600 : 400,
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

// ─── Slider ────────────────────────────────────────────────────────────────────

function DarkSlider({
  value,
  min,
  max,
  step,
  onChange,
  accent,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accent?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const color = accent ?? C.accent;
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          WebkitAppearance: "none",
          appearance: "none",
          width: "100%",
          height: 6,
          borderRadius: 9999,
          background: `linear-gradient(to right, ${color} ${pct}%, ${C.border} ${pct}%)`,
          outline: "none",
          cursor: "pointer",
        }}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid ${C.bg};
          cursor: pointer;
          box-shadow: 0 0 6px ${color}88;
        }
        input[type=range]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid ${C.bg};
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <span style={{ fontWeight: 600, color: C.textPrimary, fontSize: 13 }}>
        {title}
      </span>
      <span style={{ color: C.muted, fontSize: 12, marginLeft: 8 }}>{sub}</span>
    </div>
  );
}

// ─── Valuation badge ───────────────────────────────────────────────────────────

function ValuationBadge({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 28px",
        borderRadius: 12,
        background: `${C.green}18`,
        border: `1px solid ${C.green}44`,
      }}
    >
      <span
        style={{
          color: C.muted,
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </span>
      <span
        style={{ color: C.green, fontSize: 28, fontWeight: 700, marginTop: 4 }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Educational callout ───────────────────────────────────────────────────────

function EducationalCallout() {
  return (
    <div
      style={{
        background: `${C.accent}12`,
        border: `1px solid ${C.accent}33`,
        borderRadius: 12,
        padding: "14px 18px",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          color: C.accent,
          fontWeight: 600,
          fontSize: 13,
          marginBottom: 6,
        }}
      >
        Why qualitative signals matter more than spreadsheets
      </div>
      <p
        style={{
          color: C.textSecondary,
          fontSize: 12,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        The best investments rarely fit a model. Airbnb was rejected by every
        major VC three times before becoming a $75B company. Instagram had just
        13 users when Kevin Systrom first pitched it. Apple was dismissed as
        "too niche" for the enterprise market that dominated VC thinking at the
        time. Quantitative methods anchor to the past; qualitative frameworks
        force investors to assess the team, timing, and thesis that determine
        whether a company can bend the future. Use the three frameworks below
        together — no single method captures the full picture.
      </p>
    </div>
  );
}

// ─── Score label chip ──────────────────────────────────────────────────────────

function ScoreLabel({ score, max }: { score: number; max: number }) {
  const pct = score / max;
  const color = pct >= 0.7 ? C.green : pct >= 0.4 ? C.yellow : C.red;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color,
        background: `${color}22`,
        borderRadius: 6,
        padding: "2px 7px",
        minWidth: 36,
        textAlign: "center",
        display: "inline-block",
      }}
    >
      {score}/{max}
    </span>
  );
}

// ─── PAYNE TAB ─────────────────────────────────────────────────────────────────

function PayneTab() {
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(DEFAULT_PAYNE_DIMENSIONS.map((d) => [d.key, d.score])),
  );

  const result = useMemo(
    () =>
      calculatePayne(
        Object.entries(scores).map(([key, score]) => ({ key, score })),
      ),
    [scores],
  );

  const radarData = result.dimensions.map((d) => ({
    subject: d.label.split("/")[0].trim(),
    score: d.score,
    fullMark: 2,
  }));

  const scoreLabel = (s: number) =>
    s === 0 ? "Weak" : s === 1 ? "Average" : "Strong";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Valuation output */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ValuationBadge
          label="Estimated Pre-Money"
          value={`$${result.valuation.toFixed(2)}M`}
        />
        <ValuationBadge
          label="Weighted Score"
          value={`${result.weightedScore.toFixed(2)} / 2.00`}
        />
      </div>

      {/* Interpretation */}
      <div
        style={{
          background: C.cardAlt,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "12px 16px",
          color: C.textSecondary,
          fontSize: 13,
          lineHeight: 1.65,
        }}
      >
        {result.interpretation}
      </div>

      {/* Radar chart */}
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius={100}>
            <PolarGrid stroke={C.border} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: C.textSecondary, fontSize: 11 }}
            />
            <PolarRadiusAxis
              domain={[0, 2]}
              tickCount={3}
              tick={{ fill: C.muted, fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke={C.accent}
              fill={C.accent}
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SectionHeader
          title="Dimension Scores"
          sub="0 = Weak · 1 = Average · 2 = Strong"
        />
        {result.dimensions.map((d) => (
          <div key={d.key}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div>
                <span
                  style={{
                    color: C.textPrimary,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {d.label}
                </span>
                <span
                  style={{
                    color: C.muted,
                    fontSize: 11,
                    marginLeft: 8,
                    fontStyle: "italic",
                  }}
                >
                  weight {(d.weight * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.muted, fontSize: 11 }}>
                  {scoreLabel(scores[d.key] ?? d.score)}
                </span>
                <ScoreLabel score={scores[d.key] ?? d.score} max={2} />
              </div>
            </div>
            <DarkSlider
              value={scores[d.key] ?? d.score}
              min={0}
              max={2}
              step={1}
              onChange={(v) => setScores((prev) => ({ ...prev, [d.key]: v }))}
              accent={C.accent}
            />
            <p style={{ color: C.muted, fontSize: 11, margin: "4px 0 0" }}>
              {d.tooltip}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BERKUS TAB ────────────────────────────────────────────────────────────────

function BerkusTab() {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(DEFAULT_BERKUS_FACTORS.map((f) => [f.key, f.value])),
  );

  const result = useMemo(
    () =>
      calculateBerkus(
        Object.entries(values).map(([key, value]) => ({ key, value })),
      ),
    [values],
  );

  const barData = result.factors.map((f) => ({
    name: f.label.replace("Quality ", ""),
    value: f.value,
    max: f.maxValue,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Valuation */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <ValuationBadge
          label="Pre-Revenue Valuation"
          value={`$${result.totalValuation.toFixed(2)}M`}
        />
        <ValuationBadge label="Max Possible" value="$2.50M" />
      </div>

      {/* Interpretation */}
      <div
        style={{
          background: C.cardAlt,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "12px 16px",
          color: C.textSecondary,
          fontSize: 13,
          lineHeight: 1.65,
        }}
      >
        {result.interpretation}
      </div>

      {/* Horizontal bar chart */}
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 140, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke={C.border} />
            <XAxis
              type="number"
              domain={[0, 0.5]}
              tickFormatter={(v) => `$${(v * 1000).toFixed(0)}K`}
              tick={{ fill: C.muted, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: C.textSecondary, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={135}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [
                `$${(Number(v) * 1000).toFixed(0)}K`,
                "Value",
              ]}
              contentStyle={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                color: C.textPrimary,
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {barData.map((entry, i) => {
                const pct = entry.value / entry.max;
                const fill =
                  pct >= 0.7 ? C.green : pct >= 0.4 ? C.yellow : C.red;
                return <Cell key={i} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SectionHeader
          title="Factor Values"
          sub="Drag to adjust each risk-reduction credit (max $500K each)"
        />
        {result.factors.map((f) => (
          <div key={f.key}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span
                style={{ color: C.textPrimary, fontSize: 13, fontWeight: 500 }}
              >
                {f.label}
              </span>
              <ScoreLabel
                score={Math.round((values[f.key] ?? f.value) * 1000)}
                max={500}
              />
            </div>
            <DarkSlider
              value={values[f.key] ?? f.value}
              min={0}
              max={f.maxValue}
              step={0.05}
              onChange={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
              accent={C.green}
            />
            <p style={{ color: C.muted, fontSize: 11, margin: "4px 0 0" }}>
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FOUNDER DNA TAB ───────────────────────────────────────────────────────────

/** SVG circular progress ring */
function ProgressRing({
  score,
  icon,
  label,
  size = 72,
}: {
  score: number;
  icon: string;
  label: string;
  size?: number;
}) {
  const radius = (size - 10) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = score / 10;
  const dash = pct * circ;
  const color = pct >= 0.7 ? C.green : pct >= 0.4 ? C.accent : C.muted;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={C.border}
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.3s ease" }}
        />
      </svg>
      {/* Label / score overlay — positioned relative to parent */}
      <div
        style={{
          position: "absolute",
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{score}</span>
      </div>
      <span
        style={{
          fontSize: 11,
          color: C.textSecondary,
          textAlign: "center",
          maxWidth: size + 8,
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** Archetype badge */
function ArchetypeBadge({
  archetype,
  vcAppeal,
}: {
  archetype: string;
  vcAppeal: "High" | "Medium" | "Low";
}) {
  const appealColor =
    vcAppeal === "High" ? C.green : vcAppeal === "Medium" ? C.yellow : C.red;
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <div
        style={{
          padding: "6px 16px",
          borderRadius: 9999,
          background: `${C.accent}22`,
          border: `1px solid ${C.accent}55`,
          color: C.accent,
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {archetype}
      </div>
      <div
        style={{
          padding: "6px 14px",
          borderRadius: 9999,
          background: `${appealColor}18`,
          border: `1px solid ${appealColor}44`,
          color: appealColor,
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        VC Appeal: {vcAppeal}
      </div>
    </div>
  );
}

function FounderDNATab() {
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      DEFAULT_FOUNDER_DNA_DIMENSIONS.map((d) => [d.key, d.score]),
    ),
  );

  const result = useMemo(
    () =>
      calculateFounderDNA(
        Object.entries(scores).map(([key, score]) => ({ key, score })),
      ),
    [scores],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Total score bar */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <ValuationBadge
          label="Founder DNA Score"
          value={`${result.totalScore} / 100`}
        />
        <ArchetypeBadge
          archetype={result.archetype}
          vcAppeal={result.vcAppeal}
        />
      </div>

      {/* Narrative */}
      <div
        style={{
          background: C.cardAlt,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "12px 16px",
          color: C.textSecondary,
          fontSize: 13,
          lineHeight: 1.65,
          fontStyle: "italic",
        }}
      >
        "{result.narrative}"
      </div>

      {/* Ring grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
          gap: 20,
          padding: "4px 0",
        }}
      >
        {result.dimensions.map((d) => (
          <div
            key={d.key}
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ProgressRing
              score={scores[d.key] ?? d.score}
              icon={d.icon}
              label={d.label}
              size={72}
            />
          </div>
        ))}
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <SectionHeader
          title="Dimension Scores"
          sub="0 = None · 5 = Solid · 10 = World-class"
        />
        {result.dimensions.map((d) => (
          <div key={d.key}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <span
                style={{ color: C.textPrimary, fontSize: 13, fontWeight: 500 }}
              >
                {d.icon} {d.label}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: C.muted, fontSize: 11 }}>
                  weight {(d.weight * 100).toFixed(0)}%
                </span>
                <ScoreLabel score={scores[d.key] ?? d.score} max={10} />
              </div>
            </div>
            <DarkSlider
              value={scores[d.key] ?? d.score}
              min={0}
              max={10}
              step={1}
              onChange={(v) => setScores((prev) => ({ ...prev, [d.key]: v }))}
              accent={C.accent}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root export ───────────────────────────────────────────────────────────────

export function QualitativeTab() {
  const [tab, setTab] = useState<InnerTab>("payne");

  const tabs: { id: InnerTab; label: string }[] = [
    { id: "payne", label: "Payne Scorecard" },
    { id: "berkus", label: "Berkus Method" },
    { id: "dna", label: "Founder DNA" },
  ];

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100%",
        padding: "24px 0",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <EducationalCallout />

      {/* Inner tab bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {tabs.map((t) => (
          <TabPill
            key={t.id}
            id={t.id}
            label={t.label}
            active={tab === t.id}
            onClick={setTab}
          />
        ))}
      </div>

      {/* Panel */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: "24px 20px",
        }}
      >
        {tab === "payne" && <PayneTab />}
        {tab === "berkus" && <BerkusTab />}
        {tab === "dna" && <FounderDNATab />}
      </div>
    </div>
  );
}
