import { useMemo, useState } from "react";
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
import {
  analyzeBond,
  bondPrice,
  priceChangeEstimate,
} from "../../utils/quant/fixedIncome";
import {
  QuantLayout,
  Panel,
  FormulaNote,
  NumberField,
  fmtUSD,
  fmtNum,
  fmtPct,
  QUANT_ACCENT,
} from "./QuantLayout";
import { QuantStat } from "./QuantStat";

const GRID = "#222530";

export function FixedIncomeTab() {
  // Bond inputs are local to this tab (not part of the option/portfolio model).
  const [face, setFace] = useState(1000);
  const [couponRate, setCouponRate] = useState(0.05);
  const [ytm, setYtm] = useState(0.05);
  const [years, setYears] = useState(10);
  const freq = 2;

  const res = useMemo(
    () => analyzeBond(face, couponRate, ytm, years, freq),
    [face, couponRate, ytm, years],
  );

  // Price-yield curve + the duration/convexity tangent approximation.
  const curve = useMemo(() => {
    const rows = [];
    for (let i = 0; i <= 40; i++) {
      const y = 0.005 + (0.12 * i) / 40;
      const exact = bondPrice(face, couponRate, y, years, freq);
      const dy = y - ytm;
      const approx =
        res.price *
        (1 + priceChangeEstimate(res.modifiedDuration, res.convexity, dy));
      rows.push({ y, exact, approx });
    }
    return rows;
  }, [face, couponRate, years, ytm, res]);

  return (
    <QuantLayout
      title="Fixed Income"
      subtitle="Bond pricing, duration, and convexity — the curvature of the price-yield relationship."
      controls={
        <>
          <NumberField
            label="Face value"
            value={face}
            step={100}
            min={100}
            onChange={setFace}
          />
          <NumberField
            label="Coupon"
            suffix="ann."
            value={couponRate}
            step={0.005}
            min={0}
            onChange={setCouponRate}
          />
          <NumberField
            label="Yield (YTM)"
            suffix="ann."
            value={ytm}
            step={0.005}
            onChange={setYtm}
          />
          <NumberField
            label="Maturity"
            suffix="yrs"
            value={years}
            step={1}
            min={1}
            onChange={(v) => setYears(Math.round(v))}
          />
          <FormulaNote formula="P = Σ C/(1+y)ᵗ + F/(1+y)ⁿ">
            Modified duration is the first-order price sensitivity to yield;
            convexity the second-order correction. Semiannual coupons.
          </FormulaNote>
        </>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuantStat
          label="Price"
          value={fmtUSD(res.price)}
          status="neutral"
          subtitle={
            res.price >= face
              ? "premium"
              : res.price <= face
                ? "discount"
                : "par"
          }
        />
        <QuantStat
          label="Macaulay duration"
          value={`${fmtNum(res.macaulayDuration, 2)} yr`}
        />
        <QuantStat
          label="Modified duration"
          value={fmtNum(res.modifiedDuration, 3)}
          subtitle="ΔP/P per Δy"
        />
        <QuantStat label="Convexity" value={fmtNum(res.convexity, 2)} />
      </div>

      <Panel title="Price-yield curve: exact vs. duration+convexity approximation">
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={curve}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="y"
              stroke="#7d808a"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              label={{
                value: "yield",
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
              formatter={(v) => fmtUSD(Number(v))}
              labelFormatter={(v) => `y = ${fmtPct(Number(v))}`}
            />
            <ReferenceLine
              x={ytm}
              stroke={QUANT_ACCENT}
              strokeDasharray="2 3"
              label={{ value: "current y", fill: QUANT_ACCENT, fontSize: 11 }}
            />
            <Line
              dataKey="exact"
              stroke={QUANT_ACCENT}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Exact price"
            />
            <Line
              dataKey="approx"
              stroke="#9ec1ff"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              name="Duration+convexity"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: "#7d808a" }}>
          The exact curve is convex (bows upward); the dashed line is the
          duration+convexity estimate. They agree near today's yield and diverge
          for large moves — that gap is why traders carry a convexity
          adjustment.
        </p>
      </Panel>
    </QuantLayout>
  );
}
