import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
} from "recharts";
import { useQuantModel } from "../../hooks/useQuantModel";
import {
  covFromCorr,
  efficientFrontier,
  maxSharpePoint,
  minVariancePortfolio,
  portfolioStats,
} from "../../utils/quant/portfolioTheory";
import {
  QuantLayout,
  Panel,
  FormulaNote,
  NumberField,
  fmtPct,
  fmtNum,
  QUANT_ACCENT,
} from "./QuantLayout";
import { QuantStat } from "./QuantStat";

const GRID = "#222530";
const rf = 0.03;

export function EfficientFrontierTab() {
  const { inputs, setInput } = useQuantModel();
  const { assets, correlations } = inputs;

  const cov = useMemo(
    () =>
      covFromCorr(
        assets.map((a) => a.vol),
        correlations,
      ),
    [assets, correlations],
  );
  const expReturns = assets.map((a) => a.expReturn);

  const frontier = useMemo(
    () => efficientFrontier(expReturns, cov, rf, 6000),
    [expReturns, cov],
  );
  const tangency = useMemo(() => maxSharpePoint(frontier), [frontier]);
  const minVar = useMemo(() => {
    const w = minVariancePortfolio(cov);
    return { w, stats: portfolioStats(w, expReturns, cov, rf) };
  }, [cov, expReturns]);

  // Individual assets plotted in (vol, return) space.
  const assetPoints = assets.map((a) => ({
    vol: a.vol,
    ret: a.expReturn,
    name: a.name,
  }));
  const frontierPoints = frontier.map((p) => ({ vol: p.vol, ret: p.ret }));

  const setAsset = (i: number, key: "expReturn" | "vol", v: number) => {
    const next = assets.map((a, idx) => (idx === i ? { ...a, [key]: v } : a));
    setInput("assets", next);
  };

  return (
    <QuantLayout
      title="Portfolio Optimizer"
      subtitle="Markowitz mean-variance optimization — trace the efficient frontier and find the max-Sharpe portfolio."
      controls={
        <>
          {assets.map((a, i) => (
            <div
              key={a.name}
              className="flex flex-col gap-1.5 pb-2"
              style={{ borderBottom: "1px solid #222530" }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: QUANT_ACCENT }}
              >
                {a.name}
              </span>
              <NumberField
                label="Exp return"
                suffix="ann."
                value={a.expReturn}
                step={0.01}
                onChange={(v) => setAsset(i, "expReturn", v)}
              />
              <NumberField
                label="Volatility"
                suffix="ann."
                value={a.vol}
                step={0.01}
                min={0.01}
                onChange={(v) => setAsset(i, "vol", v)}
              />
            </div>
          ))}
          <FormulaNote formula="max  (wᵀμ − r_f) / √(wᵀΣw)">
            The tangency portfolio maximizes the Sharpe ratio. Min-variance uses
            w = Σ⁻¹𝟙 / 𝟙ᵀΣ⁻¹𝟙. r_f = {fmtPct(rf)}.
          </FormulaNote>
        </>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuantStat
          label="Max Sharpe"
          value={fmtNum(tangency.sharpe, 3)}
          status="positive"
          subtitle="tangency"
        />
        <QuantStat label="Tangency return" value={fmtPct(tangency.ret)} />
        <QuantStat label="Tangency vol" value={fmtPct(tangency.vol)} />
        <QuantStat
          label="Min-var vol"
          value={fmtPct(minVar.stats.vol)}
          subtitle={`Sharpe ${fmtNum(minVar.stats.sharpe, 2)}`}
        />
      </div>

      <Panel title="Efficient frontier (return vs. volatility)">
        <ResponsiveContainer width="100%" height={360}>
          <ScatterChart margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="vol"
              name="Vol"
              stroke="#7d808a"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              domain={["auto", "auto"]}
              label={{
                value: "volatility",
                position: "insideBottom",
                offset: -2,
                fill: "#7d808a",
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="ret"
              name="Return"
              stroke="#7d808a"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              domain={["auto", "auto"]}
            />
            <ZAxis range={[40, 40]} />
            <Tooltip
              contentStyle={{
                background: "#141519",
                border: `1px solid ${GRID}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => fmtPct(Number(v))}
            />
            <Scatter
              name="Frontier"
              data={frontierPoints}
              fill={QUANT_ACCENT}
              line={{ stroke: QUANT_ACCENT, strokeWidth: 2 }}
              shape="circle"
              isAnimationActive={false}
            />
            <Scatter
              name="Tangency"
              data={[{ vol: tangency.vol, ret: tangency.ret }]}
              fill="#9ec1ff"
              shape="star"
              isAnimationActive={false}
            />
            <Scatter name="Assets" data={assetPoints} isAnimationActive={false}>
              {assetPoints.map((_, i) => (
                <Cell key={i} fill="#e0524f" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: "#7d808a" }}>
          The blue curve is the set of portfolios with the best return per unit
          of risk; the light-blue star is the tangency (max-Sharpe) portfolio. Red
          dots are the individual assets — every one sits inside the frontier,
          the quantified value of diversification.
        </p>
      </Panel>

      <Panel title="Tangency portfolio weights">
        <div className="flex flex-wrap gap-2">
          {tangency.weights.map((w, i) => (
            <div
              key={i}
              className="px-3 py-1.5 rounded-md text-xs"
              style={{
                background: "rgba(91,157,255,0.08)",
                border: "1px solid rgba(91,157,255,0.25)",
                color: "#cfd1d6",
              }}
            >
              {assets[i]?.name}:{" "}
              <strong style={{ color: QUANT_ACCENT }}>{fmtPct(w)}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </QuantLayout>
  );
}
