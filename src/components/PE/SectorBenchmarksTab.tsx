import React, { useState } from "react";
import { Info } from "lucide-react";
import { Tooltip } from "../Tooltip";

interface SectorData {
  id: string;
  name: string;
  color: string;
  evEbitda: { min: number; median: number; max: number };
  leverage: { min: number; median: number; max: number };
  ebitdaGrowth: { min: number; median: number; max: number };
  marginPct: { min: number; median: number; max: number };
  holdPeriod: { min: number; median: number; max: number };
  irr: { low: number; mid: number; top: number };
  valueDrivers: string[];
  risks: string[];
  notableDeals: { name: string; year: number; ev: string; multiple: string }[];
}

const SECTORS: SectorData[] = [
  {
    id: "tech",
    name: "Technology / Software",
    color: "#818CF8",
    evEbitda: { min: 12, median: 18, max: 30 },
    leverage: { min: 4, median: 5.5, max: 7 },
    ebitdaGrowth: { min: 8, median: 18, max: 35 },
    marginPct: { min: 20, median: 30, max: 45 },
    holdPeriod: { min: 3, median: 5, max: 7 },
    irr: { low: 18, mid: 25, top: 35 },
    valueDrivers: [
      "ARR growth and net revenue retention (NRR > 110%)",
      "Rule of 40 (revenue growth % + EBITDA margin % ≥ 40)",
      "Customer acquisition cost (CAC) payback < 18 months",
      "Churn rate < 5% annually (enterprise SaaS)",
      "Land-and-expand motions driving expansion revenue",
      "Platform buildout through bolt-on acquisitions",
    ],
    risks: [
      "Customer concentration (top 10 = >30% revenue)",
      "Technology obsolescence and competitive displacement",
      "Key man dependency on founders/engineering talent",
      "Margin compression from headcount scaling",
    ],
    notableDeals: [
      {
        name: "Qualtrics (SAP carveout)",
        year: 2023,
        ev: "$12.5B",
        multiple: "25x EBITDA",
      },
      {
        name: "Citrix Systems",
        year: 2022,
        ev: "$16.5B",
        multiple: "14x EBITDA",
      },
      { name: "Zendesk", year: 2022, ev: "$10.2B", multiple: "21x EBITDA" },
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare & Life Sciences",
    color: "#34D399",
    evEbitda: { min: 10, median: 14, max: 22 },
    leverage: { min: 4, median: 5.5, max: 7 },
    ebitdaGrowth: { min: 5, median: 10, max: 20 },
    marginPct: { min: 15, median: 22, max: 35 },
    holdPeriod: { min: 4, median: 5.5, max: 8 },
    irr: { low: 15, mid: 22, top: 30 },
    valueDrivers: [
      "Recurring revenue from recurring procedures / scripts",
      "Regulatory moat (FDA clearance, CON laws)",
      "Reimbursement rate optimization and payor mix shift",
      "Physician rollup — platform + bolt-on acquisition",
      "Clinical outcome data driving margin premium",
      "Demographic tailwinds (aging population)",
    ],
    risks: [
      "Reimbursement rate cuts by CMS / commercial payors",
      "Regulatory risk: FDA, DEA, state licensing",
      "Physician recruitment and retention",
      "Malpractice liability exposure",
    ],
    notableDeals: [
      {
        name: "Envision Healthcare",
        year: 2018,
        ev: "$9.9B",
        multiple: "12x EBITDA",
      },
      {
        name: "BrightSpring Health",
        year: 2019,
        ev: "$1.9B",
        multiple: "11x EBITDA",
      },
      {
        name: "WebMD / Internet Brands",
        year: 2017,
        ev: "$2.8B",
        multiple: "13x EBITDA",
      },
    ],
  },
  {
    id: "consumer",
    name: "Consumer & Retail",
    color: "#F59E0B",
    evEbitda: { min: 7, median: 10, max: 16 },
    leverage: { min: 3, median: 4.5, max: 6 },
    ebitdaGrowth: { min: 2, median: 7, max: 15 },
    marginPct: { min: 8, median: 15, max: 25 },
    holdPeriod: { min: 4, median: 6, max: 9 },
    irr: { low: 12, mid: 18, top: 28 },
    valueDrivers: [
      "Brand repositioning and channel optimization",
      "E-commerce penetration and DTC conversion",
      "Geographic expansion (international white space)",
      "SKU rationalization and margin improvement",
      "Adjacent category M&A (brand portfolio buildout)",
      "Supply chain localization and cost efficiency",
    ],
    risks: [
      "Consumer cyclicality and macro sensitivity",
      "Retail channel disruption (Amazon / DTC competition)",
      "Input cost inflation (commodity, freight)",
      "Brand erosion from ESG / social media backlash",
    ],
    notableDeals: [
      { name: "Petco", year: 2021, ev: "$6.7B", multiple: "10x EBITDA" },
      {
        name: "Dun & Bradstreet",
        year: 2018,
        ev: "$6.9B",
        multiple: "13x EBITDA",
      },
      {
        name: "Sephora (failed LVMH carve-out)",
        year: 2020,
        ev: "N/A",
        multiple: "N/A",
      },
    ],
  },
  {
    id: "industrial",
    name: "Industrials & Manufacturing",
    color: "#6EE7B7",
    evEbitda: { min: 6, median: 9, max: 13 },
    leverage: { min: 4, median: 5.5, max: 7.5 },
    ebitdaGrowth: { min: 2, median: 6, max: 12 },
    marginPct: { min: 10, median: 17, max: 28 },
    holdPeriod: { min: 4, median: 6, max: 8 },
    irr: { low: 12, mid: 19, top: 27 },
    valueDrivers: [
      "Operational improvement: lean manufacturing, yield optimization",
      "Pricing power in niche / specialty segments",
      "Electrification and energy transition tailwinds",
      "Reshoring / nearshoring of supply chains",
      "Service/aftermarket revenue attachment (high margin)",
      "Bolt-on consolidation of fragmented markets",
    ],
    risks: [
      "Cyclicality: exposure to construction, auto, capex cycles",
      "Raw material cost pass-through risk",
      "Environmental liability (legacy sites)",
      "Pension obligations in legacy manufacturers",
    ],
    notableDeals: [
      {
        name: "Roper Technologies",
        year: 2018,
        ev: "$3.8B",
        multiple: "8x EBITDA",
      },
      {
        name: "Filtration Group",
        year: 2021,
        ev: "$3.0B",
        multiple: "11x EBITDA",
      },
      { name: "Vertiv", year: 2020, ev: "$5.0B", multiple: "9x EBITDA" },
    ],
  },
  {
    id: "financial",
    name: "Financial Services",
    color: "#60A5FA",
    evEbitda: { min: 8, median: 12, max: 18 },
    leverage: { min: 2, median: 3.5, max: 5 },
    ebitdaGrowth: { min: 5, median: 10, max: 22 },
    marginPct: { min: 20, median: 30, max: 50 },
    holdPeriod: { min: 3, median: 5, max: 7 },
    irr: { low: 14, mid: 20, top: 30 },
    valueDrivers: [
      "Net interest margin expansion in rising rate environment",
      "Fee income growth: asset management, insurance premiums",
      "Cross-sell of financial products to existing client base",
      "Technology modernization reducing operating cost ratio",
      "Organic growth + M&A in fragmented insurance markets",
      "Regulatory capital optimization",
    ],
    risks: [
      "Credit cycle exposure (loan losses in downturn)",
      "Interest rate sensitivity (NIM compression in cuts)",
      "Regulatory capital requirements constraining leverage",
      "Fintech disruption of traditional distribution channels",
    ],
    notableDeals: [
      {
        name: "Aon / WTW merger attempt",
        year: 2020,
        ev: "$30B",
        multiple: "15x EBITDA",
      },
      {
        name: "Asurion (insurance)",
        year: 2020,
        ev: "$12B",
        multiple: "14x EBITDA",
      },
      {
        name: "WEX Inc. (fleet payments)",
        year: 2019,
        ev: "$5.5B",
        multiple: "17x EBITDA",
      },
    ],
  },
  {
    id: "energy",
    name: "Energy & Infrastructure",
    color: "#FCA5A5",
    evEbitda: { min: 5, median: 8, max: 12 },
    leverage: { min: 5, median: 6.5, max: 8 },
    ebitdaGrowth: { min: 1, median: 5, max: 12 },
    marginPct: { min: 30, median: 45, max: 65 },
    holdPeriod: { min: 5, median: 7, max: 12 },
    irr: { low: 10, mid: 16, top: 22 },
    valueDrivers: [
      "Long-term contracted cash flows (10–25 year PPAs)",
      "Energy transition investment: solar, wind, storage",
      "Midstream infrastructure scarcity value",
      "Inflation-linked revenue escalators",
      "Utilization rate optimization",
      "Government incentives (IRA, CHIPS Act subsidies)",
    ],
    risks: [
      "Commodity price exposure (oil, gas, power prices)",
      "Regulatory / permitting risk for new infrastructure",
      "ESG mandate exclusions from some LP mandates",
      "Technology disruption of fossil fuel assets",
    ],
    notableDeals: [
      {
        name: "Calpine (power generation)",
        year: 2018,
        ev: "$17B",
        multiple: "7x EBITDA",
      },
      {
        name: "Pattern Energy (renewables)",
        year: 2020,
        ev: "$6.1B",
        multiple: "9x EBITDA",
      },
      {
        name: "Limetree Bay (refining)",
        year: 2020,
        ev: "$1.5B",
        multiple: "5x EBITDA",
      },
    ],
  },
];

function RangeBar({
  min,
  median,
  max,
  color,
  unit = "x",
}: {
  min: number;
  median: number;
  max: number;
  color: string;
  unit?: string;
}) {
  const total = max - min;
  const medianPct = total > 0 ? ((median - min) / total) * 100 : 50;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-8 text-right" style={{ color: "#6B7280" }}>
        {min}
        {unit}
      </span>
      <div
        className="flex-1 relative h-2 rounded-full"
        style={{ background: "#1F2937" }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `${color}25`, width: "100%" }}
        />
        <div
          className="absolute h-full rounded-full"
          style={{
            background: color,
            left: 0,
            width: `${medianPct}%`,
            opacity: 0.7,
          }}
        />
        <div
          className="absolute w-2.5 h-2.5 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{
            background: color,
            left: `${medianPct}%`,
            border: "2px solid #0A0F1C",
          }}
        />
      </div>
      <span className="text-xs w-8" style={{ color: "#6B7280" }}>
        {max}
        {unit}
      </span>
    </div>
  );
}

export function SectorBenchmarksTab() {
  const [activeSector, setActiveSector] = useState("tech");
  const sector = SECTORS.find((s) => s.id === activeSector)!;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Explainer */}
      <div
        className="flex gap-3 p-4 rounded-xl"
        style={{
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        <Info
          size={16}
          className="flex-shrink-0 mt-0.5"
          style={{ color: "#818CF8" }}
        />
        <div className="text-sm text-[#9CA3AF] leading-relaxed">
          <strong style={{ color: "#818CF8" }}>Sector Benchmarks</strong> — PE
          firms specialize in sectors because valuation multiples, leverage
          capacity, and value creation levers vary dramatically. A{" "}
          <Tooltip
            term="Sector Specialist"
            definition="PE firms like Vista (tech), HGGC (tech), Surgery Partners (healthcare), or American Securities (industrial) that focus on one vertical to build operational expertise and proprietary deal flow."
          >
            sector specialist
          </Tooltip>{" "}
          can pay a premium knowing exactly how to drive EBITDA growth.
          Understanding these benchmarks is critical for{" "}
          <Tooltip
            term="Entry Multiple Discipline"
            definition="The GP's ability to avoid overpaying by holding to a target EV/EBITDA range. The best PE firms generate returns through operational improvement rather than multiple expansion."
          >
            entry multiple discipline
          </Tooltip>{" "}
          and exit timing.
        </div>
      </div>

      {/* Sector Selector */}
      <div className="flex flex-wrap gap-2">
        {SECTORS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSector(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeSector === s.id ? s.color + "20" : "#111827",
              color: activeSector === s.id ? s.color : "#6B7280",
              border: `1px solid ${activeSector === s.id ? s.color + "50" : "#374151"}`,
              cursor: "pointer",
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Sector Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multiples */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "#111827",
            border: `1px solid ${sector.color}30`,
          }}
        >
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: sector.color }}
          >
            {sector.name}
          </h3>
          <div className="space-y-4">
            {[
              { label: "EV / EBITDA Multiple", ...sector.evEbitda, unit: "x" },
              { label: "Total Leverage", ...sector.leverage, unit: "x" },
              {
                label: "EBITDA Growth / yr",
                ...sector.ebitdaGrowth,
                unit: "%",
              },
              { label: "EBITDA Margin", ...sector.marginPct, unit: "%" },
              { label: "Hold Period", ...sector.holdPeriod, unit: " yr" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: "#9CA3AF" }}>{item.label}</span>
                  <span style={{ color: sector.color, fontWeight: 600 }}>
                    {item.median}
                    {item.unit} median
                  </span>
                </div>
                <RangeBar
                  min={item.min}
                  median={item.median}
                  max={item.max}
                  color={sector.color}
                  unit={item.unit}
                />
              </div>
            ))}

            {/* IRR Targets */}
            <div className="pt-3 border-t border-[#374151]">
              <div
                className="text-xs font-semibold mb-2"
                style={{ color: "#9CA3AF" }}
              >
                Target IRR Ranges
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Low", value: sector.irr.low, color: "#F87171" },
                  { label: "Mid", value: sector.irr.mid, color: sector.color },
                  {
                    label: "Top-Quartile",
                    value: sector.irr.top,
                    color: "#34D399",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="text-center p-2 rounded-lg"
                    style={{
                      background: "#0A0F1C",
                      border: `1px solid ${item.color}20`,
                    }}
                  >
                    <div
                      className="text-base font-bold"
                      style={{ color: item.color }}
                    >
                      {item.value}%
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "#4B5563" }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Value Drivers + Risks */}
        <div className="space-y-4">
          <div
            className="rounded-xl p-5"
            style={{ background: "#111827", border: "1px solid #374151" }}
          >
            <h3 className="text-sm font-semibold text-[#F9FAFB] mb-3">
              Value Creation Levers
            </h3>
            <div className="space-y-2">
              {sector.valueDrivers.map((d) => (
                <div key={d} className="flex items-start gap-2 text-xs">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: sector.color }}
                  />
                  <span style={{ color: "#D1D5DB" }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
          <div
            className="rounded-xl p-5"
            style={{
              background: "#111827",
              border: "1px solid rgba(248,113,113,0.2)",
            }}
          >
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: "#F87171" }}
            >
              Key Risks
            </h3>
            <div className="space-y-2">
              {sector.risks.map((r) => (
                <div key={r} className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-red-400" />
                  <span style={{ color: "#9CA3AF" }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notable Deals */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#111827", border: "1px solid #374151" }}
        >
          <h3 className="text-sm font-semibold text-[#F9FAFB] mb-3">
            Notable Deals
          </h3>
          <div className="space-y-3">
            {sector.notableDeals.map((d) => (
              <div
                key={d.name}
                className="p-3 rounded-lg"
                style={{ background: "#0A0F1C", border: "1px solid #1F2937" }}
              >
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#F9FAFB" }}
                >
                  {d.name}
                </div>
                <div
                  className="flex gap-3 mt-1 text-xs"
                  style={{ color: "#6B7280" }}
                >
                  <span>{d.year}</span>
                  <span>{d.ev}</span>
                  <span style={{ color: sector.color }}>{d.multiple}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick comparison all sectors */}
          <div className="mt-5">
            <h3
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: "#4B5563" }}
            >
              EV/EBITDA by Sector — Median
            </h3>
            <div className="space-y-2">
              {SECTORS.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className="text-xs w-32 truncate"
                    style={{
                      color: activeSector === s.id ? s.color : "#6B7280",
                    }}
                  >
                    {s.name.split(" ")[0]}
                  </div>
                  <div
                    className="flex-1 h-2 rounded-full"
                    style={{ background: "#1F2937" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(s.evEbitda.median / 30) * 100}%`,
                        background: s.color,
                        opacity: activeSector === s.id ? 0.9 : 0.3,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs w-8"
                    style={{
                      color: activeSector === s.id ? s.color : "#4B5563",
                    }}
                  >
                    {s.evEbitda.median}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cross-sector comparison table */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#111827", border: "1px solid #374151" }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-1">
          Full Sector Comparison Matrix
        </h3>
        <p className="text-xs text-[#6B7280] mb-4">
          Median benchmarks across all six sectors
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid #374151" }}>
                {[
                  "Sector",
                  "EV/EBITDA",
                  "Max Leverage",
                  "EBITDA Growth",
                  "Margin",
                  "Hold Period",
                  "Mid IRR",
                ].map((h) => (
                  <th
                    key={h}
                    className="pb-2 text-right first:text-left"
                    style={{
                      color: "#6B7280",
                      fontWeight: 600,
                      paddingRight: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECTORS.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setActiveSector(s.id)}
                  style={{
                    borderBottom: "1px solid #1F2937",
                    background:
                      activeSector === s.id ? `${s.color}08` : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <td
                    className="py-2 text-left font-semibold"
                    style={{ color: s.color, paddingRight: 12 }}
                  >
                    {s.name}
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{ color: "#D1D5DB", paddingRight: 12 }}
                  >
                    {s.evEbitda.median}x
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{
                      color: s.leverage.max >= 7 ? "#34D399" : "#9CA3AF",
                      paddingRight: 12,
                    }}
                  >
                    {s.leverage.max}x
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{
                      color:
                        s.ebitdaGrowth.median >= 15 ? "#34D399" : "#9CA3AF",
                      paddingRight: 12,
                    }}
                  >
                    {s.ebitdaGrowth.median}%
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{ color: "#9CA3AF", paddingRight: 12 }}
                  >
                    {s.marginPct.median}%
                  </td>
                  <td
                    className="py-2 text-right"
                    style={{ color: "#9CA3AF", paddingRight: 12 }}
                  >
                    {s.holdPeriod.median} yr
                  </td>
                  <td
                    className="py-2 text-right font-bold"
                    style={{
                      color: s.irr.mid >= 22 ? "#34D399" : "#818CF8",
                      paddingRight: 12,
                    }}
                  >
                    {s.irr.mid}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
