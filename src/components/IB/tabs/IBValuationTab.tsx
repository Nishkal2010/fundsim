import React from "react";
import { motion } from "framer-motion";
import { A } from "../shared/theme";
import {
  Card,
  SectionHeader,
  Sub,
  Stat,
  SliderRow,
} from "../shared/primitives";
import { fmtM, fmtN, fmtPct } from "../shared/format";

// ─── Props ────────────────────────────────────────────────────────────────────
interface ValuationC {
  projections: {
    yr: number;
    rev: number;
    ebitda: number;
    ebit: number;
    fcff: number;
    pv: number;
  }[];
  pvFCFFs: number;
  pvTV: number;
  tvPct: number;
  dcfEV: number;
  dcfImpliedPrice: number;
  compsMultiple: number;
  compsEVLow: number;
  compsEVHigh: number;
  precMultiple: number;
  precEVLow: number;
  precEVHigh: number;
  lboDebt: number;
  lboEquity: number;
  moic: number;
  irr: number;
  footballField: { label: string; low: number; high: number; color: string }[];
  ffMin: number;
  ffMax: number;
}

interface ValuationInputs {
  tgtName: string;
  tgtPrice: number;
  revenueGrowth: number;
  ebitdaMarginPct: number;
  wacc: number;
  terminalGrowth: number;
  capexPct: number;
  dealType: string;
}

interface IBValuationTabProps {
  C: ValuationC;
  inputs: ValuationInputs;
  setIn: <K extends string>(key: K, val: number) => void;
}

export default function IBValuationTab({
  C,
  inputs,
  setIn,
}: IBValuationTabProps) {
  return (
    <div>
      <SectionHeader>Valuation Analysis</SectionHeader>
      <Sub>
        Four methods to value {inputs.tgtName || "the target"}. Compare them in
        the football field chart.
      </Sub>

      {/* DCF Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card style={{ gridColumn: "span 1" }}>
          <div
            className="text-xs font-bold mb-4 tracking-widest"
            style={{ color: "#6366F1", fontFamily: "monospace" }}
          >
            DCF ASSUMPTIONS
          </div>
          <SliderRow
            label="Revenue Growth (Yr 1–5)"
            value={inputs.revenueGrowth}
            min={0}
            max={40}
            step={1}
            unit="%"
            onChange={(v) => setIn("revenueGrowth", v)}
          />
          <SliderRow
            label="EBITDA Margin"
            value={inputs.ebitdaMarginPct}
            min={5}
            max={50}
            step={1}
            unit="%"
            onChange={(v) => setIn("ebitdaMarginPct", v)}
          />
          <SliderRow
            label="WACC"
            value={inputs.wacc}
            min={5}
            max={20}
            step={0.5}
            unit="%"
            onChange={(v) => setIn("wacc", v)}
          />
          <SliderRow
            label="Terminal Growth Rate"
            value={inputs.terminalGrowth}
            min={0}
            max={5}
            step={0.5}
            unit="%"
            onChange={(v) => setIn("terminalGrowth", v)}
          />
          <SliderRow
            label="Capex (% Revenue)"
            value={inputs.capexPct}
            min={1}
            max={20}
            step={1}
            unit="%"
            onChange={(v) => setIn("capexPct", v)}
          />
        </Card>

        {/* DCF Results */}
        <Card style={{ gridColumn: "span 2" }}>
          <div
            className="text-xs font-bold mb-4 tracking-widest"
            style={{ color: "#6366F1", fontFamily: "monospace" }}
          >
            5-YEAR DCF PROJECTION
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: "#4B5563" }}>
                  <td className="pb-2 pr-3">Metric ($M)</td>
                  {C.projections.map((p) => (
                    <td key={p.yr} className="pb-2 pr-3 text-right">
                      Yr {p.yr}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Revenue",
                    vals: C.projections.map((p) => p.rev),
                    color: "#9CA3AF",
                  },
                  {
                    label: "EBITDA",
                    vals: C.projections.map((p) => p.ebitda),
                    color: "#9CA3AF",
                  },
                  {
                    label: "EBIT",
                    vals: C.projections.map((p) => p.ebit),
                    color: "#9CA3AF",
                  },
                  {
                    label: "FCFF",
                    vals: C.projections.map((p) => p.fcff),
                    color: "#6366F1",
                  },
                  {
                    label: "PV of FCFF",
                    vals: C.projections.map((p) => p.pv),
                    color: "#6366F1",
                  },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="py-1.5 pr-3" style={{ color: "#6B7280" }}>
                      {row.label}
                    </td>
                    {row.vals.map((v, i) => (
                      <td
                        key={i}
                        className="py-1.5 pr-3 text-right font-mono"
                        style={{ color: row.color }}
                      >
                        {fmtM(v, 0)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="mt-4 grid grid-cols-4 gap-3 pt-4"
            style={{ borderTop: "1px solid #1F2937" }}
          >
            <Stat label="PV of FCFFs" value={fmtM(C.pvFCFFs)} color="#6366F1" />
            <Stat
              label="PV of Terminal Value"
              value={fmtM(C.pvTV)}
              sub={`${fmtN(C.tvPct, 0)}% of DCF EV`}
              color="#6366F1"
            />
            <Stat
              label="DCF Enterprise Value"
              value={fmtM(C.dcfEV)}
              color="#6366F1"
            />
            <Stat
              label="Implied Share Price"
              value={`$${fmtN(C.dcfImpliedPrice, 2)}`}
              sub={`vs $${inputs.tgtPrice} current`}
              color="#6366F1"
            />
          </div>
        </Card>
      </div>

      {/* Comps + Precedents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <div
            className="text-xs font-bold mb-3 tracking-widest"
            style={{ color: "#10B981", fontFamily: "monospace" }}
          >
            COMPARABLE COMPANIES
          </div>
          <div className="flex justify-between mb-4">
            <div>
              <div className="text-xs mb-0.5" style={{ color: "#6B7280" }}>
                Sector Benchmark Multiple
              </div>
              <div
                className="text-2xl font-bold font-serif"
                style={{ color: "#10B981" }}
              >
                {fmtN(C.compsMultiple, 1)}x EV/EBITDA
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs mb-0.5" style={{ color: "#6B7280" }}>
                Implied EV Range
              </div>
              <div className="font-bold" style={{ color: "#10B981" }}>
                {fmtM(C.compsEVLow)} – {fmtM(C.compsEVHigh)}
              </div>
            </div>
          </div>
          <div
            className="text-xs p-3 rounded-lg"
            style={{ background: "#0D1420", color: "#6B7280" }}
          >
            Sector EV/EBITDA benchmarks: Tech 15–21x · Healthcare 13–19x ·
            Industrial 8–12x · Consumer 10–14x · Energy 6–10x
          </div>
        </Card>

        <Card>
          <div
            className="text-xs font-bold mb-3 tracking-widest"
            style={{ color: A.light, fontFamily: "monospace" }}
          >
            PRECEDENT TRANSACTIONS
          </div>
          <div className="flex justify-between mb-4">
            <div>
              <div className="text-xs mb-0.5" style={{ color: "#6B7280" }}>
                Transaction Multiple (incl. premium)
              </div>
              <div
                className="text-2xl font-bold font-serif"
                style={{ color: A.light }}
              >
                {fmtN(C.precMultiple, 1)}x EV/EBITDA
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs mb-0.5" style={{ color: "#6B7280" }}>
                Implied EV Range
              </div>
              <div className="font-bold" style={{ color: A.light }}>
                {fmtM(C.precEVLow)} – {fmtM(C.precEVHigh)}
              </div>
            </div>
          </div>
          <div
            className="text-xs p-3 rounded-lg"
            style={{ background: "#0D1420", color: "#6B7280" }}
          >
            Precedent transactions include a{" "}
            {inputs.dealType === "strategic" ? "30–40%" : "15–25%"} control
            premium over public comps. Strategic buyers pay more than financial
            buyers.
          </div>
        </Card>
      </div>

      {/* LBO */}
      {inputs.dealType === "financial" && (
        <Card style={{ marginBottom: "1.5rem" }}>
          <div
            className="text-xs font-bold mb-4 tracking-widest"
            style={{ color: "#EC4899", fontFamily: "monospace" }}
          >
            LBO ANALYSIS
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat
              label="Acquisition Debt"
              value={fmtM(C.lboDebt)}
              sub="~65% of deal EV"
              color="#EC4899"
            />
            <Stat
              label="Sponsor Equity"
              value={fmtM(C.lboEquity)}
              sub="~35% of deal EV"
              color="#EC4899"
            />
            <Stat
              label="MOIC (5-yr hold)"
              value={`${fmtN(C.moic, 2)}x`}
              sub="Target: 2.5–3.5x"
              color={C.moic >= 2 ? "#22C55E" : "#EF4444"}
            />
            <Stat
              label="Implied IRR"
              value={fmtPct(C.irr)}
              sub="Target: 20–30%"
              color={C.irr >= 20 ? "#22C55E" : "#EF4444"}
            />
          </div>
        </Card>
      )}

      {/* Football Field */}
      <Card>
        <div
          className="text-xs font-bold mb-4 tracking-widest"
          style={{ color: "#9CA3AF", fontFamily: "monospace" }}
        >
          FOOTBALL FIELD — ENTERPRISE VALUE RANGES
        </div>
        <div className="space-y-4">
          {C.footballField.map((row) => {
            const range = C.ffMax - C.ffMin;
            if (range <= 0) return null;
            const leftPct = ((row.low - C.ffMin) / range) * 100;
            const widthPct = ((row.high - row.low) / range) * 100;
            return (
              <div key={row.label}>
                <div
                  className="flex justify-between text-xs mb-1"
                  style={{ color: "#9CA3AF" }}
                >
                  <span>{row.label}</span>
                  <span style={{ color: row.color }}>
                    {fmtM(row.low)} – {fmtM(row.high)}
                  </span>
                </div>
                <div
                  className="relative h-7 rounded"
                  style={{ background: "#0D1420" }}
                >
                  <motion.div
                    className="absolute top-1 bottom-1 rounded"
                    initial={{ left: "50%", width: 0 }}
                    animate={{
                      left: `${Math.max(0, leftPct)}%`,
                      width: `${Math.min(widthPct, 100 - Math.max(0, leftPct))}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ background: row.color, opacity: 0.8 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="flex justify-between text-xs mt-3"
          style={{ color: "#374151" }}
        >
          <span>{fmtM(C.ffMin)}</span>
          <span>{fmtM((C.ffMin + C.ffMax) / 2)}</span>
          <span>{fmtM(C.ffMax)}</span>
        </div>
      </Card>
    </div>
  );
}
