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
import { impliedVol, bsmPrice } from "../../utils/quant/blackScholes";
import {
  QuantLayout,
  Panel,
  FormulaNote,
  NumberField,
  SegmentedControl,
  fmtNum,
  fmtPct,
  fmtUSD,
  QUANT_ACCENT,
} from "./QuantLayout";
import { QuantStat } from "./QuantStat";

const GRID = "#222530";

export function ImpliedVolTab() {
  const { inputs, setInput } = useQuantModel();
  const { spot, strike, rate, maturity, optionType } = inputs;
  // The user dials a "true" σ; we price the option at it, then invert the
  // pricer to recover σ — demonstrating the implied-vol solve end to end.
  const trueVol = inputs.vol;
  const price = useMemo(
    () => bsmPrice(optionType, spot, strike, rate, trueVol, maturity),
    [optionType, spot, strike, rate, trueVol, maturity],
  );
  const iv = useMemo(
    () => impliedVol(price, optionType, spot, strike, rate, maturity),
    [price, optionType, spot, strike, rate, maturity],
  );

  // Build a simple skew: IV as a function of strike for fixed market prices
  // generated from a vol that smiles (higher IV in the wings) — illustrative.
  const smile = useMemo(() => {
    const rows = [];
    for (let i = 0; i <= 40; i++) {
      const K = spot * (0.7 + (0.6 * i) / 40);
      const m = Math.log(K / spot);
      // Illustrative smile: base vol + curvature in moneyness.
      const smileVol = trueVol + 0.5 * m * m - 0.1 * m;
      const px = bsmPrice(
        "call",
        spot,
        K,
        rate,
        Math.max(0.02, smileVol),
        maturity,
      );
      const recovered = impliedVol(px, "call", spot, K, rate, maturity);
      rows.push({
        K: parseFloat(K.toFixed(1)),
        iv: recovered ?? NaN,
      });
    }
    return rows;
  }, [spot, rate, maturity, trueVol]);

  return (
    <QuantLayout
      title="Implied Volatility"
      subtitle="Invert Black-Scholes to back out the volatility the market is pricing in."
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
            label="True σ"
            suffix="ann."
            value={trueVol}
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
          <FormulaNote formula="solve  BSM(σ) = market price  for σ">
            No closed form — we use Newton-Raphson on vega with a bisection
            fallback (the same solver discipline as the IRR engine).
          </FormulaNote>
        </>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <QuantStat
          label="Market price"
          value={fmtUSD(price)}
          subtitle={`priced at σ=${fmtPct(trueVol)}`}
        />
        <QuantStat
          label="Recovered IV"
          value={iv === null ? "—" : fmtPct(iv)}
          status="positive"
          subtitle="solver output"
        />
        <QuantStat
          label="Round-trip error"
          value={iv === null ? "n/a" : fmtNum(Math.abs(iv - trueVol), 8)}
        />
      </div>

      <Panel title="Volatility smile (illustrative IV vs. strike)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={smile}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="K"
              stroke="#7d808a"
              tick={{ fontSize: 11 }}
              label={{
                value: "strike",
                position: "insideBottom",
                offset: -2,
                fill: "#7d808a",
                fontSize: 11,
              }}
            />
            <YAxis
              stroke="#7d808a"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "#141519",
                border: `1px solid ${GRID}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v) => fmtPct(Number(v))}
              labelFormatter={(v) => `K = ${fmtUSD(Number(v))}`}
            />
            <ReferenceLine
              x={spot}
              stroke={QUANT_ACCENT}
              strokeDasharray="2 3"
              label={{ value: "ATM", fill: QUANT_ACCENT, fontSize: 11 }}
            />
            <Line
              dataKey="iv"
              stroke={QUANT_ACCENT}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: "#7d808a" }}>
          Real markets show this smile/skew — out-of-the-money options trade at
          higher implied vols than flat Black-Scholes predicts, evidence the
          lognormal assumption underprices tail risk.
        </p>
      </Panel>
    </QuantLayout>
  );
}
