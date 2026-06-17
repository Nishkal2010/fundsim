import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useQuantModel } from "../../hooks/useQuantModel";
import { simulateGbmStats } from "../../utils/quant/stochastic";
import { mean, std, percentile } from "../../utils/quant/stats";
import {
  QuantLayout,
  Panel,
  FormulaNote,
  NumberField,
  fmtNum,
  fmtUSD,
  QUANT_ACCENT,
} from "./QuantLayout";
import { QuantStat } from "./QuantStat";

const GRID = "#222530";

export function PricePathsTab() {
  const { inputs, setInput } = useQuantModel();
  const { spot, drift, vol, maturity, steps, seed } = inputs;
  // Cap path count for in-browser responsiveness.
  const nPaths = Math.min(4000, Math.max(200, inputs.mcPaths));

  const stats = useMemo(
    () => simulateGbmStats(spot, drift, vol, maturity, steps, nPaths, seed, 8),
    [spot, drift, vol, maturity, steps, nPaths, seed],
  );

  // Fan-chart series: bands as stacked areas + median line + sample paths.
  const fanData = useMemo(
    () =>
      stats.times.map((t, i) => {
        const row: Record<string, number> = {
          t: parseFloat(t.toFixed(3)),
          p5: stats.bands.p5[i],
          band5_25: stats.bands.p25[i] - stats.bands.p5[i],
          band25_75: stats.bands.p75[i] - stats.bands.p25[i],
          band75_95: stats.bands.p95[i] - stats.bands.p75[i],
          p50: stats.bands.p50[i],
        };
        stats.paths.forEach((p, k) => (row[`path${k}`] = p[i]));
        return row;
      }),
    [stats],
  );

  const histData = useMemo(() => {
    const term = stats.terminal;
    const lo = Math.min(...term);
    const hi = Math.max(...term);
    const bins = 40;
    const width = (hi - lo) / bins || 1;
    const counts = new Array(bins).fill(0);
    term.forEach((x) => {
      const idx = Math.min(bins - 1, Math.floor((x - lo) / width));
      counts[idx]++;
    });
    return counts.map((c, i) => ({
      price: lo + (i + 0.5) * width,
      count: c,
    }));
  }, [stats]);

  const termMean = mean(stats.terminal);
  const termStd = std(stats.terminal);
  const analyticMean = spot * Math.exp(drift * maturity);

  return (
    <QuantLayout
      title="Random Walks"
      subtitle="Simulate Geometric Brownian Motion — the workhorse model for asset prices."
      controls={
        <>
          <NumberField
            label="Spot S₀"
            value={spot}
            step={5}
            min={1}
            onChange={(v) => setInput("spot", v)}
          />
          <NumberField
            label="Drift μ"
            suffix="ann."
            value={drift}
            step={0.01}
            onChange={(v) => setInput("drift", v)}
          />
          <NumberField
            label="Volatility σ"
            suffix="ann."
            value={vol}
            step={0.01}
            min={0}
            onChange={(v) => setInput("vol", v)}
          />
          <NumberField
            label="Horizon T"
            suffix="yrs"
            value={maturity}
            step={0.25}
            min={0.05}
            onChange={(v) => setInput("maturity", v)}
          />
          <NumberField
            label="Steps"
            value={steps}
            step={10}
            min={5}
            onChange={(v) => setInput("steps", Math.round(v))}
          />
          <NumberField
            label="Paths"
            value={nPaths}
            step={500}
            min={200}
            max={4000}
            onChange={(v) => setInput("mcPaths", Math.round(v))}
          />
          <NumberField
            label="Seed"
            value={seed}
            step={1}
            onChange={(v) => setInput("seed", Math.round(v))}
          />
          <FormulaNote formula="dS = μS·dt + σS·dW">
            Each step compounds a drift term and a random shock scaled by σ√dt.
            Lognormal by construction, so prices never go negative.
          </FormulaNote>
        </>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuantStat
          label="Median S(T)"
          value={fmtUSD(stats.bands.p50[steps])}
        />
        <QuantStat
          label="Mean S(T)"
          value={fmtUSD(termMean)}
          subtitle={`σ ${fmtUSD(termStd)}`}
        />
        <QuantStat
          label="E[S(T)] analytic"
          value={fmtUSD(analyticMean)}
          subtitle="S₀·e^(μT)"
          status="neutral"
        />
        <QuantStat
          label="5–95% range"
          value={`${fmtUSD(stats.bands.p5[steps])} – ${fmtUSD(stats.bands.p95[steps])}`}
        />
      </div>

      <Panel title="Simulated price paths & percentile fan">
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={fanData}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              stroke="#7d808a"
              tick={{ fontSize: 11 }}
              label={{
                value: "years",
                position: "insideBottom",
                offset: -2,
                fill: "#7d808a",
                fontSize: 11,
              }}
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
            />
            <Area
              dataKey="p5"
              stackId="band"
              stroke="none"
              fill="transparent"
            />
            <Area
              dataKey="band5_25"
              stackId="band"
              stroke="none"
              fill={QUANT_ACCENT}
              fillOpacity={0.1}
            />
            <Area
              dataKey="band25_75"
              stackId="band"
              stroke="none"
              fill={QUANT_ACCENT}
              fillOpacity={0.22}
            />
            <Area
              dataKey="band75_95"
              stackId="band"
              stroke="none"
              fill={QUANT_ACCENT}
              fillOpacity={0.1}
            />
            {stats.paths.map((_, k) => (
              <Line
                key={k}
                dataKey={`path${k}`}
                stroke="#cfd1d6"
                strokeWidth={0.7}
                strokeOpacity={0.4}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            <Line
              dataKey="p50"
              stroke={QUANT_ACCENT}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Terminal price distribution (lognormal)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={histData}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="price"
              stroke="#7d808a"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => fmtNum(v, 0)}
            />
            <YAxis stroke="#7d808a" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#141519",
                border: `1px solid ${GRID}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              labelFormatter={(v) => fmtUSD(Number(v))}
            />
            <Bar dataKey="count" fill={QUANT_ACCENT} fillOpacity={0.55} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: "#7d808a" }}>
          Right-skewed because returns compound multiplicatively. Median &lt;
          mean — the gap widens with σ. Median S(T) ≈{" "}
          {fmtUSD(percentile(stats.terminal, 50))}.
        </p>
      </Panel>
    </QuantLayout>
  );
}
