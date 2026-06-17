import { useMemo } from "react";
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
import { greeks } from "../../utils/quant/blackScholes";
import {
  QuantLayout,
  Panel,
  FormulaNote,
  NumberField,
  SegmentedControl,
  fmtNum,
  QUANT_ACCENT,
} from "./QuantLayout";
import { QuantStat } from "./QuantStat";

const GRID = "#222530";

export function GreeksTab() {
  const { inputs, setInput } = useQuantModel();
  const { spot, strike, rate, vol, maturity, dividendYield, optionType } =
    inputs;

  const g = useMemo(
    () => greeks(optionType, spot, strike, rate, vol, maturity, dividendYield),
    [optionType, spot, strike, rate, vol, maturity, dividendYield],
  );

  // Greek curves swept across spot.
  const curve = useMemo(() => {
    const lo = strike * 0.5;
    const hi = strike * 1.5;
    const rows = [];
    for (let i = 0; i <= 60; i++) {
      const S = lo + ((hi - lo) * i) / 60;
      const gg = greeks(
        optionType,
        S,
        strike,
        rate,
        vol,
        maturity,
        dividendYield,
      );
      rows.push({
        S: parseFloat(S.toFixed(2)),
        delta: gg.delta,
        gamma: gg.gamma,
        vega: gg.vega / 100, // per 1% vol
        theta: gg.theta / 365, // per calendar day
      });
    }
    return rows;
  }, [optionType, strike, rate, vol, maturity, dividendYield]);

  return (
    <QuantLayout
      title="The Greeks"
      subtitle="Sensitivities of the option price — the risk dimensions a trader hedges."
      controls={
        <>
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
            step={0.1}
            min={0.02}
            onChange={(v) => setInput("maturity", v)}
          />
          <FormulaNote formula="Δ=∂V/∂S · Γ=∂²V/∂S² · ν=∂V/∂σ · Θ=∂V/∂t">
            Delta is directional exposure; gamma how fast delta moves; vega vol
            exposure; theta time decay (negative for long options).
          </FormulaNote>
        </>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <QuantStat label="Delta" value={fmtNum(g.delta, 4)} />
        <QuantStat label="Gamma" value={fmtNum(g.gamma, 4)} />
        <QuantStat
          label="Vega"
          value={fmtNum(g.vega / 100, 4)}
          subtitle="per 1% σ"
        />
        <QuantStat
          label="Theta"
          value={fmtNum(g.theta / 365, 4)}
          subtitle="per day"
          status={g.theta < 0 ? "negative" : "positive"}
        />
        <QuantStat
          label="Rho"
          value={fmtNum(g.rho / 100, 4)}
          subtitle="per 1% r"
        />
      </div>

      <Panel title="Delta & Gamma vs. spot">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={curve}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="S" stroke="#7d808a" tick={{ fontSize: 11 }} />
            <YAxis stroke="#7d808a" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#141519",
                border: `1px solid ${GRID}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => fmtNum(Number(v), 4)}
            />
            <ReferenceLine x={strike} stroke="#7d808a" strokeDasharray="4 4" />
            <Line
              dataKey="delta"
              stroke={QUANT_ACCENT}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Delta"
            />
            <Line
              dataKey="gamma"
              stroke="#9ec1ff"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Gamma"
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: "#7d808a" }}>
          Delta runs 0→1 (call) through the strike; gamma peaks at-the-money,
          where delta changes fastest.
        </p>
      </Panel>

      <Panel title="Vega (per 1% vol) & Theta (per day) vs. spot">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={curve}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="S" stroke="#7d808a" tick={{ fontSize: 11 }} />
            <YAxis stroke="#7d808a" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#141519",
                border: `1px solid ${GRID}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => fmtNum(Number(v), 4)}
            />
            <ReferenceLine x={strike} stroke="#7d808a" strokeDasharray="4 4" />
            <ReferenceLine y={0} stroke="#4a4d57" />
            <Line
              dataKey="vega"
              stroke={QUANT_ACCENT}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Vega"
            />
            <Line
              dataKey="theta"
              stroke="#e0524f"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Theta"
            />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
    </QuantLayout>
  );
}
