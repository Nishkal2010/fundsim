import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { useQuantModel } from "../../hooks/useQuantModel";
import {
  parametricVaR,
  historicalVaR,
  monteCarloVaR,
} from "../../utils/quant/risk";
import { makeNormalSampler, seededRand } from "../../utils/quant/stats";
import {
  QuantLayout,
  Panel,
  FormulaNote,
  NumberField,
  SegmentedControl,
  fmtUSD,
  fmtPct,
  QUANT_ACCENT,
} from "./QuantLayout";
import { QuantStat } from "./QuantStat";

const GRID = "#222530";
const PORTFOLIO_VALUE = 1_000_000;
const HORIZON = 1 / 252; // 1 trading day

export function RiskTab() {
  const { inputs, setInput } = useQuantModel();
  const mu = inputs.drift;
  const sigma = inputs.vol;
  const [confidence, setConfidence] = useState(0.95);

  const param = useMemo(
    () =>
      parametricVaR(PORTFOLIO_VALUE, mu * HORIZON, sigma, HORIZON, confidence),
    [mu, sigma, confidence],
  );
  const mc = useMemo(
    () =>
      monteCarloVaR(
        PORTFOLIO_VALUE,
        mu * HORIZON,
        sigma,
        HORIZON,
        confidence,
        50000,
        inputs.seed,
      ),
    [mu, sigma, confidence, inputs.seed],
  );

  // Simulate a daily P&L distribution for the histogram + VaR/CVaR cutlines.
  const { histData, hist } = useMemo(() => {
    const sample = makeNormalSampler(seededRand(inputs.seed));
    const driftH = mu * HORIZON;
    const volH = sigma * Math.sqrt(HORIZON);
    const pnl: number[] = [];
    for (let i = 0; i < 50000; i++) {
      pnl.push(PORTFOLIO_VALUE * (driftH + volH * sample()));
    }
    const lo = Math.min(...pnl);
    const hi = Math.max(...pnl);
    const bins = 50;
    const width = (hi - lo) / bins || 1;
    const counts = new Array(bins).fill(0);
    pnl.forEach((x) => {
      const idx = Math.min(bins - 1, Math.floor((x - lo) / width));
      counts[idx]++;
    });
    const data = counts.map((c, i) => ({
      pnl: lo + (i + 0.5) * width,
      count: c,
    }));
    const histResult = historicalVaR(
      PORTFOLIO_VALUE,
      pnl.map((x) => x / PORTFOLIO_VALUE),
      confidence,
    );
    return { histData: data, hist: histResult };
  }, [mu, sigma, confidence, inputs.seed]);

  return (
    <QuantLayout
      title="Risk Desk"
      subtitle="Value-at-Risk and Expected Shortfall — how much a portfolio can lose, and how badly in the tail."
      controls={
        <>
          <NumberField
            label="Daily drift μ"
            suffix="ann."
            value={mu}
            step={0.01}
            onChange={(v) => setInput("drift", v)}
          />
          <NumberField
            label="Volatility σ"
            suffix="ann."
            value={sigma}
            step={0.01}
            min={0.01}
            onChange={(v) => setInput("vol", v)}
          />
          <SegmentedControl
            label="Confidence"
            value={String(confidence)}
            onChange={(v) => setConfidence(parseFloat(v))}
            options={[
              { value: "0.9", label: "90%" },
              { value: "0.95", label: "95%" },
              { value: "0.99", label: "99%" },
            ]}
          />
          <NumberField
            label="Seed"
            value={inputs.seed}
            step={1}
            onChange={(v) => setInput("seed", Math.round(v))}
          />
          <FormulaNote formula="VaR = V·(σ√h·z_c − μh)   ·   CVaR = V·σ√h·φ(z)/(1−c)">
            VaR is the loss you won't exceed with probability c (1-day horizon
            on a $1M book). CVaR (Expected Shortfall) is the average loss when
            you do.
          </FormulaNote>
        </>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuantStat
          label={`Parametric VaR ${fmtPct(confidence)}`}
          value={fmtUSD(param.var)}
          status="negative"
        />
        <QuantStat
          label="Parametric CVaR"
          value={fmtUSD(param.cvar)}
          status="negative"
          subtitle="expected shortfall"
        />
        <QuantStat
          label="Monte Carlo VaR"
          value={fmtUSD(mc.var)}
          subtitle="50k sims"
        />
        <QuantStat
          label="Historical VaR"
          value={fmtUSD(hist.var)}
          subtitle="empirical tail"
        />
      </div>

      <Panel title="1-day P&L distribution with VaR / CVaR cutlines">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={histData}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="pnl"
              stroke="#7d808a"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <YAxis stroke="#7d808a" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#141519",
                border: `1px solid ${GRID}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              labelFormatter={(v) => `P&L ${fmtUSD(Number(v))}`}
            />
            <ReferenceLine
              x={-param.var}
              stroke="#e0524f"
              strokeWidth={2}
              label={{
                value: "VaR",
                fill: "#e0524f",
                fontSize: 11,
                position: "top",
              }}
            />
            <ReferenceLine
              x={-param.cvar}
              stroke="#b91c1c"
              strokeDasharray="4 3"
              label={{
                value: "CVaR",
                fill: "#b91c1c",
                fontSize: 11,
                position: "insideTopLeft",
              }}
            />
            <Bar dataKey="count" isAnimationActive={false}>
              {histData.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.pnl <= -param.var ? "#e0524f" : QUANT_ACCENT}
                  fillOpacity={d.pnl <= -param.var ? 0.7 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: "#7d808a" }}>
          The red left tail beyond the VaR line is the {fmtPct(1 - confidence)}{" "}
          of days you'd expect to lose more than VaR. CVaR is the average loss
          across exactly that shaded region — always deeper than VaR.
        </p>
      </Panel>
    </QuantLayout>
  );
}
