import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
};

interface SafeInstrument {
  id: string;
  label: string;
  type: "pre_money_cap" | "post_money_cap" | "discount" | "mfn";
  amount: number; // $ invested
  valCap: number; // valuation cap ($M)
  discountRate: number; // %
  proRataRights: boolean;
  mostFavoredNation: boolean;
}

const defaultSafes: SafeInstrument[] = [
  {
    id: "s1",
    label: "Angel SAFE",
    type: "post_money_cap",
    amount: 250000,
    valCap: 5,
    discountRate: 0,
    proRataRights: false,
    mostFavoredNation: false,
  },
  {
    id: "s2",
    label: "Pre-Seed SAFE",
    type: "post_money_cap",
    amount: 750000,
    valCap: 8,
    discountRate: 20,
    proRataRights: true,
    mostFavoredNation: true,
  },
  {
    id: "s3",
    label: "Seed Bridge",
    type: "pre_money_cap",
    amount: 500000,
    valCap: 12,
    discountRate: 15,
    proRataRights: false,
    mostFavoredNation: false,
  },
];

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

const fmt$ = (v: number) =>
  v >= 1e6
    ? `$${(v / 1e6).toFixed(2)}M`
    : v >= 1000
      ? `$${(v / 1000).toFixed(0)}K`
      : `$${v.toFixed(0)}`;
const fmtPct = (v: number) => `${v.toFixed(1)}%`;
const fmtM = (v: number) => `$${v.toFixed(1)}M`;

export function SAFENotesTab() {
  const [safes, setSafes] = useState<SafeInstrument[]>(defaultSafes);
  const [priceRound, setPriceRound] = useState(20); // Series A pre-money $M
  const [seriesAAmount, setSeriesAAmount] = useState(5); // $M raised
  const [preIssueShares, setPreIssueShares] = useState(10000000); // founder shares
  const [esop, setEsop] = useState(10); // % option pool created at Series A
  const [expandedSafe, setExpandedSafe] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<
    "pre_money_cap" | "post_money_cap" | "discount" | "mfn"
  >("post_money_cap");

  const results = useMemo(() => {
    const priceRoundPre = priceRound * 1e6;
    const totalShares = preIssueShares;

    // Option pool top-up (shuffle)
    const optionShares = Math.round(
      ((esop / 100) * totalShares) / (1 - esop / 100),
    );
    const postOptionShares = totalShares + optionShares;
    const pricedRoundPPSAfterPool = priceRoundPre / postOptionShares;

    // Series A: price per share
    const seriesAInvestment = seriesAAmount * 1e6;
    const seriesAShares = Math.round(
      seriesAInvestment / pricedRoundPPSAfterPool,
    );
    const postSeriesAPreSAFE = postOptionShares + seriesAShares;
    const seriesAPostMoney = priceRoundPre + seriesAInvestment;

    // Convert each SAFE
    const safeDetails = safes.map((s) => {
      let effectivePPS: number;
      let conversionValuation: number;

      if (s.type === "post_money_cap") {
        const capPPS = (s.valCap * 1e6) / preIssueShares; // post-money cap, shares at issuance
        const discountPPS =
          pricedRoundPPSAfterPool * (1 - s.discountRate / 100);
        effectivePPS = Math.min(capPPS, discountPPS, pricedRoundPPSAfterPool);
        conversionValuation = s.valCap;
      } else if (s.type === "pre_money_cap") {
        const capPPS = (s.valCap * 1e6) / postOptionShares;
        const discountPPS =
          pricedRoundPPSAfterPool * (1 - s.discountRate / 100);
        effectivePPS = Math.min(capPPS, discountPPS, pricedRoundPPSAfterPool);
        conversionValuation = s.valCap;
      } else if (s.type === "discount") {
        effectivePPS = pricedRoundPPSAfterPool * (1 - s.discountRate / 100);
        conversionValuation = priceRound * (1 - s.discountRate / 100);
      } else {
        // MFN: uses best terms from other SAFEs
        const otherCaps = safes
          .filter((x) => x.id !== s.id && x.valCap > 0)
          .map((x) => x.valCap);
        const bestCap =
          otherCaps.length > 0 ? Math.min(...otherCaps) : s.valCap;
        effectivePPS = (bestCap * 1e6) / preIssueShares;
        conversionValuation = bestCap;
      }

      const shares = Math.round(s.amount / effectivePPS);

      return {
        ...s,
        effectivePPS,
        shares,
        conversionValuation,
        discountToRound:
          ((pricedRoundPPSAfterPool - effectivePPS) / pricedRoundPPSAfterPool) *
          100,
        impliedDiscount:
          ((pricedRoundPPSAfterPool - effectivePPS) / pricedRoundPPSAfterPool) *
          100,
      };
    });
    const totalSafeShares = safeDetails.reduce((sum, s) => sum + s.shares, 0);

    const totalFullyDiluted = postSeriesAPreSAFE + totalSafeShares;

    const safeDetailsWithOwnership = safeDetails.map((s) => ({
      ...s,
      ownership: (s.shares / totalFullyDiluted) * 100,
    }));

    const founderOwnership = (preIssueShares / totalFullyDiluted) * 100;
    const esopOwnership = (optionShares / totalFullyDiluted) * 100;
    const seriesAOwnership = (seriesAShares / totalFullyDiluted) * 100;
    const safeOwnership = (totalSafeShares / totalFullyDiluted) * 100;
    const totalInvested =
      safes.reduce((a, s) => a + s.amount, 0) + seriesAInvestment;

    return {
      priceRoundPre,
      pricedRoundPPSAfterPool,
      seriesAPostMoney,
      optionShares,
      seriesAShares,
      totalSafeShares,
      totalFullyDiluted,
      founderOwnership,
      esopOwnership,
      seriesAOwnership,
      safeOwnership,
      safeDetails: safeDetailsWithOwnership,
      totalInvested,
    };
  }, [safes, priceRound, seriesAAmount, preIssueShares, esop]);

  const updateSafe = (
    id: string,
    field: keyof SafeInstrument,
    val: unknown,
  ) => {
    setSafes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    );
  };

  const safeTypes = [
    { id: "post_money_cap", label: "Post-Money Cap SAFE" },
    { id: "pre_money_cap", label: "Pre-Money Cap SAFE" },
    { id: "discount", label: "Discount-Only SAFE" },
    { id: "mfn", label: "MFN SAFE" },
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
          SAFE Notes & Convertible Instruments
        </h2>
        <p className="text-sm" style={{ color: C.muted }}>
          Model how SAFE agreements convert at Series A — see dilution
          mechanics, discount rates, and cap table impact
        </p>
      </div>

      {/* SAFE Type Explainer */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {safeTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveType(t.id as typeof activeType)}
            style={{
              background: activeType === t.id ? C.accentDim : C.card,
              border: `1px solid ${activeType === t.id ? C.accent : C.border}`,
              borderRadius: 8,
              padding: "10px 12px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              className="text-xs font-semibold"
              style={{ color: activeType === t.id ? C.accent : C.text }}
            >
              {t.label}
            </div>
          </button>
        ))}
      </div>

      {/* SAFE Type Explainer Box */}
      <div
        style={{
          background: C.accentDim,
          border: `1px solid ${C.accentBorder}`,
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 24,
        }}
      >
        {activeType === "post_money_cap" && (
          <div>
            <div
              className="text-sm font-semibold mb-1"
              style={{ color: C.accent }}
            >
              Post-Money Cap SAFE (Y Combinator Standard)
            </div>
            <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
              Valuation cap is set on a{" "}
              <strong style={{ color: C.text }}>post-money basis</strong> —
              meaning the cap includes all SAFE money raised. Converts at the
              lower of: (cap ÷ shares outstanding at SAFE issuance) or (Series A
              price × discount). YC introduced this in 2018 to give founders
              more clarity on dilution. The key insight: a $5M post-money cap
              means SAFE holders own ($investment ÷ $5M) of the company
              regardless of how many other SAFEs are issued.
              <strong style={{ color: C.yellow }}>
                {" "}
                Watch out for the "SAFE stack" — multiple post-money SAFEs can
                cause unexpected dilution.
              </strong>
            </p>
          </div>
        )}
        {activeType === "pre_money_cap" && (
          <div>
            <div
              className="text-sm font-semibold mb-1"
              style={{ color: C.accent }}
            >
              Pre-Money Cap SAFE (Older YC / Custom)
            </div>
            <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
              Valuation cap is set on a{" "}
              <strong style={{ color: C.text }}>pre-money basis</strong> —
              excludes SAFE money. Converts at the lower of: (cap ÷ shares at
              time of priced round, after option pool) or (priced round price ×
              discount). More founder-friendly than post-money in early stages,
              but creates ambiguity when multiple SAFEs coexist. The option pool
              shuffle happens{" "}
              <strong style={{ color: C.yellow }}>before</strong> conversion,
              increasing dilution for SAFE holders.
            </p>
          </div>
        )}
        {activeType === "discount" && (
          <div>
            <div
              className="text-sm font-semibold mb-1"
              style={{ color: C.accent }}
            >
              Discount-Only SAFE
            </div>
            <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
              No valuation cap — converts at a fixed discount to the priced
              round price. Common discount: 15–25%.
              <strong style={{ color: C.text }}> Example:</strong> 20% discount
              means if Series A prices at $2.00/share, SAFE converts at
              $1.60/share. Upside: simpler to negotiate. Downside: investor has
              no cap — if company raises at very high valuation, a 20% discount
              on a $50M Series A still means minimal effective discount relative
              to early risk taken.
              <strong style={{ color: C.yellow }}>
                {" "}
                Typically used by angels writing small checks with less
                negotiating leverage.
              </strong>
            </p>
          </div>
        )}
        {activeType === "mfn" && (
          <div>
            <div
              className="text-sm font-semibold mb-1"
              style={{ color: C.accent }}
            >
              Most Favored Nation (MFN) SAFE
            </div>
            <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
              No cap, no discount at issuance. Instead, investor gets the{" "}
              <strong style={{ color: C.text }}>best terms</strong> of any
              subsequent SAFE issued. If you later issue a SAFE with a $5M cap,
              the MFN investor automatically gets that cap. Used when founders
              want quick capital without setting a valuation. Risk: if you later
              issue SAFEs with aggressive terms (low caps), early MFN holders
              "inherit" those terms retroactively.
              <strong style={{ color: C.yellow }}>
                {" "}
                Always close SAFE rounds before issuing any new SAFEs to avoid
                surprise MFN triggers.
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div>
          {/* Series A Parameters */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div
              className="text-sm font-semibold mb-4"
              style={{ color: C.text }}
            >
              Series A Parameters
            </div>
            <Slider
              label="Pre-Money Valuation"
              value={priceRound}
              min={5}
              max={100}
              step={1}
              format={(v) => `$${v}M`}
              onChange={setPriceRound}
            />
            <Slider
              label="Series A Raise"
              value={seriesAAmount}
              min={1}
              max={30}
              step={0.5}
              format={(v) => `$${v}M`}
              onChange={setSeriesAAmount}
            />
            <Slider
              label="Founder Shares Outstanding"
              value={preIssueShares / 1e6}
              min={5}
              max={20}
              step={0.5}
              format={(v) => `${v}M`}
              onChange={(v) => setPreIssueShares(v * 1e6)}
            />
            <Slider
              label="Option Pool Created (Series A)"
              value={esop}
              min={5}
              max={25}
              step={1}
              format={fmtPct}
              onChange={setEsop}
            />
            <div
              className="mt-3 p-3 rounded-lg text-xs"
              style={{
                background: "rgba(252,211,77,0.08)",
                border: "1px solid rgba(252,211,77,0.2)",
              }}
            >
              <span style={{ color: C.yellow }}>Option Pool Shuffle:</span>
              <span style={{ color: C.muted }}>
                {" "}
                {results.optionShares.toLocaleString()} new option shares
                created pre-close, diluting{" "}
                <strong style={{ color: C.text }}>existing holders</strong>{" "}
                (founders + SAFEs), not Series A investors.
              </span>
            </div>
          </div>

          {/* SAFE Stack */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              className="text-sm font-semibold mb-4"
              style={{ color: C.text }}
            >
              SAFE Stack
            </div>
            {safes.map((s) => (
              <div
                key={s.id}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  marginBottom: 10,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() =>
                    setExpandedSafe(expandedSafe === s.id ? null : s.id)
                  }
                  className="w-full flex items-center justify-between px-3 py-2.5"
                  style={{
                    background: "rgba(52,211,153,0.04)",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: C.text }}
                    >
                      {s.label}
                    </span>
                    <span className="text-xs ml-2" style={{ color: C.muted }}>
                      {fmt$(s.amount)} @ ${s.valCap}M cap
                    </span>
                  </div>
                  {expandedSafe === s.id ? (
                    <ChevronUp size={14} color={C.muted} />
                  ) : (
                    <ChevronDown size={14} color={C.muted} />
                  )}
                </button>
                {expandedSafe === s.id && (
                  <div className="px-3 pb-3 pt-2">
                    <div className="flex gap-2 mb-3">
                      {(
                        [
                          "pre_money_cap",
                          "post_money_cap",
                          "discount",
                          "mfn",
                        ] as const
                      ).map((t) => (
                        <button
                          key={t}
                          onClick={() => updateSafe(s.id, "type", t)}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            background:
                              s.type === t ? C.accentDim : "transparent",
                            border: `1px solid ${s.type === t ? C.accent : C.border}`,
                            color: s.type === t ? C.accent : C.muted,
                            cursor: "pointer",
                          }}
                        >
                          {t === "pre_money_cap"
                            ? "Pre"
                            : t === "post_money_cap"
                              ? "Post"
                              : t === "discount"
                                ? "Disc"
                                : "MFN"}
                        </button>
                      ))}
                    </div>
                    <Slider
                      label="Investment Amount"
                      value={s.amount / 1000}
                      min={50}
                      max={5000}
                      step={50}
                      format={(v) => `$${v}K`}
                      onChange={(v) => updateSafe(s.id, "amount", v * 1000)}
                    />
                    {s.type !== "discount" && s.type !== "mfn" && (
                      <Slider
                        label="Valuation Cap"
                        value={s.valCap}
                        min={1}
                        max={50}
                        step={0.5}
                        format={(v) => `$${v}M`}
                        onChange={(v) => updateSafe(s.id, "valCap", v)}
                      />
                    )}
                    {s.type !== "mfn" && (
                      <Slider
                        label="Discount Rate"
                        value={s.discountRate}
                        min={0}
                        max={30}
                        step={5}
                        format={fmtPct}
                        onChange={(v) => updateSafe(s.id, "discountRate", v)}
                      />
                    )}
                    <div className="flex gap-3 mt-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={s.proRataRights}
                          onChange={(e) =>
                            updateSafe(s.id, "proRataRights", e.target.checked)
                          }
                          style={{ accentColor: C.accent }}
                        />
                        <span className="text-xs" style={{ color: C.muted }}>
                          Pro-Rata Rights
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={s.mostFavoredNation}
                          onChange={(e) =>
                            updateSafe(
                              s.id,
                              "mostFavoredNation",
                              e.target.checked,
                            )
                          }
                          style={{ accentColor: C.accent }}
                        />
                        <span className="text-xs" style={{ color: C.muted }}>
                          MFN Clause
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Conversion Analysis */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <MetricCard
              label="Post-Money (Series A)"
              value={fmtM(priceRound + seriesAAmount)}
              sub={`Pre: $${priceRound}M`}
            />
            <MetricCard
              label="Series A Price / Share"
              value={`$${results.pricedRoundPPSAfterPool.toFixed(4)}`}
              sub="After option pool"
            />
            <MetricCard
              label="Total SAFE Investment"
              value={fmt$(safes.reduce((a, s) => a + s.amount, 0))}
              sub={`${safes.length} instruments`}
            />
            <MetricCard
              label="Founder Dilution"
              value={fmtPct(100 - results.founderOwnership)}
              sub="Pre → post Series A"
              color={results.founderOwnership < 50 ? C.red : C.yellow}
            />
          </div>

          {/* SAFE Conversion Table */}
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
              SAFE Conversion Details
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                className="w-full"
                style={{ borderCollapse: "collapse", fontSize: 12 }}
              >
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {[
                      "Instrument",
                      "Invested",
                      "Eff. PPS",
                      "Discount",
                      "Shares",
                      "Ownership",
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
                  {results.safeDetails.map((s) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: `1px solid rgba(52,211,153,0.07)`,
                      }}
                    >
                      <td
                        className="py-2 font-medium"
                        style={{ color: C.text }}
                      >
                        {s.label}
                      </td>
                      <td className="py-2 font-mono" style={{ color: C.muted }}>
                        {fmt$(s.amount)}
                      </td>
                      <td
                        className="py-2 font-mono"
                        style={{ color: C.accent }}
                      >
                        ${s.effectivePPS.toFixed(4)}
                      </td>
                      <td
                        className="py-2 font-mono"
                        style={{
                          color: s.discountToRound > 0 ? C.yellow : C.muted,
                        }}
                      >
                        {s.discountToRound > 0
                          ? `${s.discountToRound.toFixed(1)}%`
                          : "—"}
                      </td>
                      <td className="py-2 font-mono" style={{ color: C.text }}>
                        {s.shares.toLocaleString()}
                      </td>
                      <td
                        className="py-2 font-mono"
                        style={{ color: C.accent }}
                      >
                        {s.ownership.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ownership Waterfall */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              className="text-sm font-semibold mb-4"
              style={{ color: C.text }}
            >
              Post-Series A Cap Table Ownership
            </div>
            {[
              {
                label: "Founders",
                pct: results.founderOwnership,
                color: "#818CF8",
              },
              {
                label: "ESOP Pool",
                pct: results.esopOwnership,
                color: C.yellow,
              },
              ...results.safeDetails.map((s) => ({
                label: s.label,
                pct: s.ownership,
                color: C.accent,
              })),
              {
                label: "Series A",
                pct: results.seriesAOwnership,
                color: C.blue,
              },
            ].map((row) => (
              <div key={row.label} className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: C.muted }}>
                    {row.label}
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: row.color }}
                  >
                    {row.pct.toFixed(2)}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${row.pct}%`,
                      height: "100%",
                      background: row.color,
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
            <div
              className="mt-3 pt-3"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <div className="flex justify-between text-xs">
                <span style={{ color: C.muted }}>
                  Total Fully Diluted Shares
                </span>
                <span className="font-mono" style={{ color: C.text }}>
                  {results.totalFullyDiluted.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Key Concepts & Scenarios */}
        <div>
          {/* Pro-Rata Rights Analysis */}
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
              Pro-Rata Rights Analysis
            </div>
            <p
              className="text-xs leading-relaxed mb-3"
              style={{ color: C.muted }}
            >
              Pro-rata rights allow SAFE holders to maintain their ownership %
              in future rounds. Investors with pro-rata can participate in
              Series A up to their ownership stake.
            </p>
            {results.safeDetails.filter((s) => s.proRataRights).length === 0 ? (
              <div
                className="text-xs p-2 rounded"
                style={{
                  background: "rgba(248,113,113,0.08)",
                  color: C.red,
                  border: "1px solid rgba(248,113,113,0.2)",
                }}
              >
                No SAFEs have pro-rata rights
              </div>
            ) : (
              results.safeDetails
                .filter((s) => s.proRataRights)
                .map((s) => (
                  <div
                    key={s.id}
                    className="mb-2 p-2 rounded text-xs"
                    style={{
                      background: C.accentDim,
                      border: `1px solid ${C.accentBorder}`,
                    }}
                  >
                    <div className="font-semibold" style={{ color: C.text }}>
                      {s.label}
                    </div>
                    <div style={{ color: C.muted }}>
                      Can invest up to{" "}
                      {fmt$(
                        (s.ownership / 100) *
                          (priceRound + seriesAAmount) *
                          1e6,
                      )}{" "}
                      in Series A to maintain {s.ownership.toFixed(2)}%
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Cap vs Discount Analysis */}
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
              Cap vs. Discount: Which Wins?
            </div>
            <p
              className="text-xs leading-relaxed mb-3"
              style={{ color: C.muted }}
            >
              At conversion, each SAFE uses whichever mechanism gives the
              investor MORE shares (lower price).
            </p>
            {results.safeDetails.map((s) => {
              const capPPS =
                s.type !== "discount" && s.type !== "mfn"
                  ? (s.valCap * 1e6) /
                    (s.type === "post_money_cap"
                      ? preIssueShares
                      : preIssueShares + results.optionShares)
                  : Infinity;
              const discPPS =
                s.discountRate > 0
                  ? results.pricedRoundPPSAfterPool * (1 - s.discountRate / 100)
                  : Infinity;
              const capWins = capPPS < discPPS;
              return (
                <div
                  key={s.id}
                  className="mb-2 p-2 rounded text-xs"
                  style={{ border: `1px solid ${C.border}`, borderRadius: 6 }}
                >
                  <div className="flex justify-between mb-1">
                    <span style={{ color: C.text }}>{s.label}</span>
                    <span
                      style={{
                        color:
                          capWins && capPPS !== Infinity ? C.accent : C.yellow,
                      }}
                    >
                      {s.type === "mfn"
                        ? "MFN"
                        : capPPS === Infinity
                          ? "Discount"
                          : discPPS === Infinity
                            ? "Cap"
                            : capWins
                              ? "Cap Wins"
                              : "Discount Wins"}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    {capPPS !== Infinity && (
                      <span style={{ color: C.muted }}>
                        Cap PPS:{" "}
                        <span style={{ color: C.accent }}>
                          ${capPPS.toFixed(4)}
                        </span>
                      </span>
                    )}
                    {discPPS !== Infinity && (
                      <span style={{ color: C.muted }}>
                        Disc PPS:{" "}
                        <span style={{ color: C.yellow }}>
                          ${discPPS.toFixed(4)}
                        </span>
                      </span>
                    )}
                    <span style={{ color: C.muted }}>
                      Round:{" "}
                      <span style={{ color: C.blue }}>
                        ${results.pricedRoundPPSAfterPool.toFixed(4)}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conversion Scenario: What if valuation is higher? */}
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
              Sensitivity: Cap Breakeven
            </div>
            <p
              className="text-xs leading-relaxed mb-3"
              style={{ color: C.muted }}
            >
              At what Series A valuation does the valuation cap start providing
              a meaningful discount?
            </p>
            {results.safeDetails
              .filter(
                (s) =>
                  s.valCap > 0 && s.type !== "mfn" && s.type !== "discount",
              )
              .map((s) => {
                const currentPremium =
                  ((priceRound - s.valCap) / s.valCap) * 100;
                return (
                  <div
                    key={s.id}
                    className="mb-3 p-2 rounded"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      className="text-xs font-semibold mb-1"
                      style={{ color: C.text }}
                    >
                      {s.label}
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: C.muted }}>Cap: ${s.valCap}M</span>
                      <span style={{ color: C.muted }}>
                        Round: ${priceRound}M
                      </span>
                      <span
                        style={{ color: currentPremium > 0 ? C.accent : C.red }}
                      >
                        {currentPremium > 0
                          ? `+${currentPremium.toFixed(0)}% premium`
                          : "Below cap"}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: 4,
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, (s.valCap / priceRound) * 100)}%`,
                          height: "100%",
                          background: C.accent,
                          borderRadius: 4,
                        }}
                      />
                    </div>
                    <div className="text-xs mt-1" style={{ color: C.dim }}>
                      Cap kicks in when Series A pre-money &gt; ${s.valCap}M
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Bottom: Convertible Note vs SAFE Comparison */}
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
          SAFE vs. Convertible Note: Key Differences
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-bold mb-2" style={{ color: C.accent }}>
              SAFE (Simple Agreement for Future Equity)
            </div>
            <div className="space-y-1.5">
              {[
                "Not a debt instrument — no maturity date",
                "No interest accrual",
                "Converts automatically at priced round",
                "Doesn't appear on balance sheet as liability",
                "Standard YC docs — minimal legal cost",
                "No board seat or voting rights before conversion",
                "Risk: may never convert if company fails before priced round",
              ].map((item) => (
                <div key={item} className="flex gap-2 text-xs">
                  <span style={{ color: C.accent }}>+</span>
                  <span style={{ color: C.muted }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold mb-2" style={{ color: C.blue }}>
              Convertible Note
            </div>
            <div className="space-y-1.5">
              {[
                "Is a debt instrument with maturity (typically 18-24 months)",
                "Accrues interest (typically 5-8% simple)",
                "Must be repaid if not converted by maturity",
                "Appears on balance sheet as liability",
                "More complex docs — higher legal cost",
                "Can include voting rights in some structures",
                "Converts at priced round (with same cap/discount mechanics)",
              ].map((item) => (
                <div key={item} className="flex gap-2 text-xs">
                  <span style={{ color: C.blue }}>→</span>
                  <span style={{ color: C.muted }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold mb-2" style={{ color: C.yellow }}>
              When to Use Which
            </div>
            <div className="space-y-2">
              <div
                className="text-xs p-2 rounded"
                style={{
                  background: "rgba(52,211,153,0.06)",
                  border: "1px solid rgba(52,211,153,0.15)",
                }}
              >
                <div style={{ color: C.text }} className="font-semibold mb-0.5">
                  Use SAFE when:
                </div>
                <div style={{ color: C.muted }}>
                  Early-stage, YC-backed, angels, &lt;$2M, no urgency on priced
                  round, US-based startup
                </div>
              </div>
              <div
                className="text-xs p-2 rounded"
                style={{
                  background: "rgba(96,165,250,0.06)",
                  border: "1px solid rgba(96,165,250,0.15)",
                }}
              >
                <div style={{ color: C.text }} className="font-semibold mb-0.5">
                  Use Conv. Note when:
                </div>
                <div style={{ color: C.muted }}>
                  International investors prefer debt, bridge before known
                  priced round, investors want interest protection,
                  strategic/corporate investors
                </div>
              </div>
              <div
                className="text-xs p-2 rounded"
                style={{
                  background: "rgba(252,211,77,0.06)",
                  border: "1px solid rgba(252,211,77,0.15)",
                }}
              >
                <div
                  style={{ color: C.yellow }}
                  className="font-semibold mb-0.5"
                >
                  Founder Warning:
                </div>
                <div style={{ color: C.muted }}>
                  Maturity cliffs on convertible notes create pressure to raise
                  or grant note holders board leverage at extension. SAFE
                  eliminates this risk.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
