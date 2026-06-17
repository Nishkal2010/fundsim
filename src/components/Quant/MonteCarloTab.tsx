import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useQuantModel } from "../../hooks/useQuantModel";
import { monteCarlo } from "../../utils/quant/montecarlo";
import { gbmPath } from "../../utils/quant/stochastic";
import { bsmPrice } from "../../utils/quant/blackScholes";
import { makeNormalSampler } from "../../utils/quant/stats";
import {
  QuantLayout,
  Panel,
  FormulaNote,
  NumberField,
  SegmentedControl,
  fmtNum,
  fmtUSD,
  QUANT_ACCENT,
} from "./QuantLayout";
import { QuantStat } from "./QuantStat";

const GRID = "#222530";

export function MonteCarloTab() {
  const { inputs, setInput } = useQuantModel();
  const { spot, strike, rate, vol, maturity, optionType, seed } = inputs;
  const n = Math.min(200000, Math.max(1000, inputs.mcPaths * 10));
  const [antithetic, setAntithetic] = useState(true);

  // Monte-Carlo price a European option and watch it converge to Black-Scholes.
  const result = useMemo(() => {
    const df = Math.exp(-rate * maturity);
    return monteCarlo(
      (rng) => {
        // A normal sampler bound to THIS uniform stream, so antithetic
        // reflection on the uniforms flows through into the normals.
        const sample = makeNormalSampler(rng);
        const path = gbmPath(spot, rate, vol, maturity, 1, sample);
        const payoff =
          optionType === "call"
            ? Math.max(0, path[1] - strike)
            : Math.max(0, strike - path[1]);
        return df * payoff;
      },
      n,
      { seed, antithetic },
    );
  }, [spot, strike, rate, vol, maturity, optionType, seed, n, antithetic]);

  const closedForm = bsmPrice(optionType, spot, strike, rate, vol, maturity);

  const convData = useMemo(
    () =>
      result.convergence.map((c) => ({
        n: c.n,
        estimate: c.estimate,
        upper: c.estimate + 1.96 * c.stdError,
        lower: c.estimate - 1.96 * c.stdError,
      })),
    [result],
  );

  return (
    <QuantLayout
      title="Monte Carlo Engine"
      subtitle="Estimate an option price by simulation and watch it converge to the analytic value."
      controls={
        <>
          <NumberField
            label="Spot S"
            value={spot}
            step={5}
            onChange={(v) => setInput("spot", v)}
          />
          <NumberField
            label="Strike K"
            value={strike}
            step={5}
            onChange={(v) => setInput("strike", v)}
          />
          <NumberField
            label="Rate r"
            suffix="ann."
            value={rate}
            step={0.005}
            onChange={(v) => setInput("rate", v)}
          />
          <NumberField
            label="Vol σ"
            suffix="ann."
            value={vol}
            step={0.01}
            min={0.01}
            onChange={(v) => setInput("vol", v)}
          />
          <NumberField
            label="Maturity T"
            suffix="yrs"
            value={maturity}
            step={0.25}
            min={0.05}
            onChange={(v) => setInput("maturity", v)}
          />
          <SegmentedControl
            label="Option"
            value={optionType}
            onChange={(v) => setInput("optionType", v)}
            options={[
              { value: "call", label: "Call" },
              { value: "put", label: "Put" },
            ]}
          />
          <NumberField
            label="Draws"
            value={n}
            step={10000}
            min={1000}
            max={200000}
            onChange={(v) => setInput("mcPaths", Math.round(v / 10))}
          />
          <SegmentedControl
            label="Variance reduction"
            value={antithetic ? "on" : "off"}
            onChange={(v) => setAntithetic(v === "on")}
            options={[
              { value: "off", label: "Plain" },
              { value: "on", label: "Antithetic" },
            ]}
          />
          <FormulaNote formula="Ĉ = e^(−rT)·(1/N)·Σ max(Sᵢ−K, 0)">
            Average the discounted payoff over N risk-neutral price draws. Error
            shrinks like 1/√N — antithetic pairing (u, 1−u) cuts it further.
          </FormulaNote>
        </>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuantStat
          label="MC estimate"
          value={fmtUSD(result.mean)}
          subtitle={`±${fmtNum(1.96 * result.stdError, 3)} (95%)`}
        />
        <QuantStat
          label="Black-Scholes"
          value={fmtUSD(closedForm)}
          subtitle="exact"
          status="neutral"
        />
        <QuantStat
          label="Abs error"
          value={fmtNum(Math.abs(result.mean - closedForm), 4)}
          status={
            Math.abs(result.mean - closedForm) < 2 * result.stdError
              ? "positive"
              : "negative"
          }
        />
        <QuantStat
          label="Std error"
          value={fmtNum(result.stdError, 4)}
          subtitle={`N = ${result.n.toLocaleString()}`}
        />
      </div>

      <Panel title="Convergence to the analytic price">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={convData}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="n"
              scale="log"
              domain={["auto", "auto"]}
              stroke="#7d808a"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
            />
            <YAxis
              stroke="#7d808a"
              tick={{ fontSize: 11 }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "#141519",
                border: `1px solid ${GRID}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => fmtUSD(Number(v))}
            />
            <ReferenceLine
              y={closedForm}
              stroke="#9ec1ff"
              strokeDasharray="5 4"
              label={{
                value: "Black-Scholes",
                fill: "#9ec1ff",
                fontSize: 11,
                position: "insideTopRight",
              }}
            />
            <Line
              dataKey="upper"
              stroke={QUANT_ACCENT}
              strokeWidth={1}
              strokeOpacity={0.4}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="lower"
              stroke={QUANT_ACCENT}
              strokeWidth={1}
              strokeOpacity={0.4}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="estimate"
              stroke={QUANT_ACCENT}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: "#7d808a" }}>
          The estimate (solid) settles onto the dashed Black-Scholes line as N
          grows; the thin envelope is the 95% confidence band, narrowing like
          1/√N.
        </p>
      </Panel>
    </QuantLayout>
  );
}
