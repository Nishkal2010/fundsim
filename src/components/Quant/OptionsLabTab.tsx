import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useQuantModel } from "../../hooks/useQuantModel";
import { bsm, binomialTree } from "../../utils/quant/blackScholes";
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

export function OptionsLabTab() {
  const { inputs, setInput } = useQuantModel();
  const { spot, strike, rate, vol, maturity, dividendYield, optionType } =
    inputs;

  const res = useMemo(
    () => bsm(optionType, spot, strike, rate, vol, maturity, dividendYield),
    [optionType, spot, strike, rate, vol, maturity, dividendYield],
  );
  const american = useMemo(
    () =>
      binomialTree(
        optionType,
        true,
        spot,
        strike,
        rate,
        vol,
        maturity,
        400,
        dividendYield,
      ),
    [optionType, spot, strike, rate, vol, maturity, dividendYield],
  );

  // Price-vs-spot curve and the intrinsic payoff at expiry.
  const curve = useMemo(() => {
    const lo = strike * 0.4;
    const hi = strike * 1.6;
    const rows = [];
    for (let i = 0; i <= 60; i++) {
      const S = lo + ((hi - lo) * i) / 60;
      const value = bsm(
        optionType,
        S,
        strike,
        rate,
        vol,
        maturity,
        dividendYield,
      ).price;
      const intrinsic =
        optionType === "call"
          ? Math.max(0, S - strike)
          : Math.max(0, strike - S);
      rows.push({ S: parseFloat(S.toFixed(2)), value, intrinsic });
    }
    return rows;
  }, [optionType, strike, rate, vol, maturity, dividendYield]);

  const moneyness =
    spot >= strike
      ? optionType === "call"
        ? "ITM"
        : "OTM"
      : optionType === "call"
        ? "OTM"
        : "ITM";

  return (
    <QuantLayout
      title="Options Lab"
      subtitle="Black-Scholes-Merton pricing for European options, with the American (early-exercise) value alongside."
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
            step={0.25}
            min={0.02}
            onChange={(v) => setInput("maturity", v)}
          />
          <NumberField
            label="Dividend q"
            suffix="ann."
            value={dividendYield}
            step={0.005}
            min={0}
            onChange={(v) => setInput("dividendYield", v)}
          />
          <FormulaNote formula="C = S·e^(−qT)·Φ(d₁) − K·e^(−rT)·Φ(d₂)">
            d₁ = [ln(S/K) + (r−q+σ²/2)T] / (σ√T), d₂ = d₁−σ√T. Φ is the normal
            CDF.
          </FormulaNote>
        </>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuantStat
          label={`European ${optionType}`}
          value={fmtUSD(res.price)}
          subtitle={moneyness}
          status="neutral"
        />
        <QuantStat
          label="American value"
          value={fmtUSD(american)}
          subtitle={
            american > res.price + 1e-4
              ? "early-exercise premium"
              : "= European"
          }
        />
        <QuantStat
          label="d₁ / d₂"
          value={`${fmtNum(res.d1, 3)} / ${fmtNum(res.d2, 3)}`}
        />
        <QuantStat
          label="Delta"
          value={fmtNum(res.greeks.delta, 4)}
          subtitle="∂Price/∂Spot"
        />
      </div>

      <Panel title="Option value vs. spot (today) and payoff (at expiry)">
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={curve}>
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
              formatter={(v) => fmtUSD(Number(v))}
              labelFormatter={(v) => `S = ${fmtUSD(Number(v))}`}
            />
            <ReferenceLine
              x={strike}
              stroke="#7d808a"
              strokeDasharray="4 4"
              label={{ value: "K", fill: "#7d808a", fontSize: 11 }}
            />
            <ReferenceLine
              x={spot}
              stroke={QUANT_ACCENT}
              strokeDasharray="2 3"
              label={{ value: "S₀", fill: QUANT_ACCENT, fontSize: 11 }}
            />
            <Line
              dataKey="intrinsic"
              stroke="#7d808a"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              name="Payoff at expiry"
            />
            <Line
              dataKey="value"
              stroke={QUANT_ACCENT}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Value today"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: "#7d808a" }}>
          The gap between today's value (blue) and the kinked expiry payoff
          (grey) is time value — it decays to zero as T → 0.
        </p>
      </Panel>
    </QuantLayout>
  );
}
