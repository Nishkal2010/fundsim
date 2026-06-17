import { useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuantModel } from "../../hooks/useQuantModel";
import { gbmPath } from "../../utils/quant/stochastic";
import { makeNormalSampler, seededRand } from "../../utils/quant/stats";
import {
  backtest,
  buyAndHoldPositions,
  momentumPositions,
  meanReversionPositions,
} from "../../utils/quant/backtest";
import { underwaterCurve } from "../../utils/quant/risk";
import {
  QuantLayout,
  Panel,
  FormulaNote,
  NumberField,
  SegmentedControl,
  fmtPct,
  fmtNum,
  QUANT_ACCENT,
} from "./QuantLayout";
import { QuantStat } from "./QuantStat";

const GRID = "#222530";
type Strategy = "momentum" | "meanrev" | "hold";

export function BacktestTab() {
  const { inputs, setInput } = useQuantModel();
  const [strategy, setStrategy] = useState<Strategy>("momentum");
  const [window, setWindow] = useState(20);
  const [cost, setCost] = useState(0.001);

  // Generate a deterministic synthetic price series (GBM) to trade on.
  const prices = useMemo(() => {
    const sample = makeNormalSampler(seededRand(inputs.seed));
    return gbmPath(100, inputs.drift, inputs.vol, 2, 500, sample);
  }, [inputs.seed, inputs.drift, inputs.vol]);

  const result = useMemo(() => {
    const pos =
      strategy === "hold"
        ? buyAndHoldPositions(prices)
        : strategy === "momentum"
          ? momentumPositions(prices, window)
          : meanReversionPositions(prices, window, 1);
    return backtest(prices, pos, cost);
  }, [prices, strategy, window, cost]);

  const chartData = useMemo(
    () =>
      result.equityCurve.map((eq, i) => ({
        t: i,
        equity: eq,
        benchmark: result.benchmark[i],
      })),
    [result],
  );

  const uw = useMemo(() => {
    const u = underwaterCurve(result.equityCurve);
    return u.map((v, i) => ({ t: i, dd: v }));
  }, [result]);

  const benchReturn = result.benchmark[result.benchmark.length - 1] - 1;

  return (
    <QuantLayout
      title="Strategy Backtester"
      subtitle="Run systematic strategies on simulated price paths and measure risk-adjusted performance."
      controls={
        <>
          <SegmentedControl
            label="Strategy"
            value={strategy}
            onChange={(v) => setStrategy(v as Strategy)}
            options={[
              { value: "momentum", label: "Momentum" },
              { value: "meanrev", label: "Mean Rev" },
              { value: "hold", label: "Hold" },
            ]}
          />
          {strategy !== "hold" && (
            <NumberField
              label="Lookback window"
              value={window}
              step={5}
              min={2}
              onChange={(v) => setWindow(Math.round(v))}
            />
          )}
          <NumberField
            label="Txn cost"
            suffix="per trade"
            value={cost}
            step={0.001}
            min={0}
            onChange={setCost}
          />
          <NumberField
            label="Drift μ"
            suffix="ann."
            value={inputs.drift}
            step={0.01}
            onChange={(v) => setInput("drift", v)}
          />
          <NumberField
            label="Vol σ"
            suffix="ann."
            value={inputs.vol}
            step={0.01}
            min={0.01}
            onChange={(v) => setInput("vol", v)}
          />
          <NumberField
            label="Seed"
            value={inputs.seed}
            step={1}
            onChange={(v) => setInput("seed", Math.round(v))}
          />
          <FormulaNote formula="positions decided at bar t, returns earned at t+1">
            One-bar execution lag prevents look-ahead bias. Sharpe is
            annualized; costs are charged on turnover.
          </FormulaNote>
        </>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuantStat
          label="Total return"
          value={fmtPct(result.totalReturn)}
          status={result.totalReturn >= 0 ? "positive" : "negative"}
        />
        <QuantStat
          label="Buy & hold"
          value={fmtPct(benchReturn)}
          subtitle="benchmark"
        />
        <QuantStat
          label="Sharpe (ann.)"
          value={fmtNum(result.sharpe, 2)}
          status={result.sharpe >= 1 ? "positive" : "neutral"}
        />
        <QuantStat
          label="Max drawdown"
          value={fmtPct(result.maxDrawdown)}
          status="negative"
          subtitle={`${result.trades} trades`}
        />
      </div>

      <Panel title="Equity curve vs. buy-and-hold benchmark">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="t" stroke="#7d808a" tick={{ fontSize: 11 }} />
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
              formatter={(v) => `${Number(v).toFixed(3)}×`}
            />
            <Line
              dataKey="benchmark"
              stroke="#7d808a"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              name="Buy & hold"
            />
            <Line
              dataKey="equity"
              stroke={QUANT_ACCENT}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Strategy"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Underwater (drawdown) curve">
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={uw}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="t" stroke="#7d808a" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#7d808a"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                background: "#141519",
                border: `1px solid ${GRID}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => fmtPct(Number(v))}
            />
            <Area
              dataKey="dd"
              stroke="#e0524f"
              fill="#e0524f"
              fillOpacity={0.25}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: "#7d808a" }}>
          Past simulated performance is not indicative of anything — this is a
          teaching sandbox on synthetic data, not investment advice.
        </p>
      </Panel>
    </QuantLayout>
  );
}
