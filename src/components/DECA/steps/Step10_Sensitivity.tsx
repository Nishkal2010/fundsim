import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency, formatPercentRaw } from "../utils/decaUtils";
import {
  computeAllIncomeMonths,
  buildAmortizationSchedule,
  annualTotals,
  computeThreeYearPlan,
} from "../utils/decaUtils";

// ─── Styles ──────────────────────────────────────────────────────────────────

const PANEL = {
  background: "#111827",
  borderRadius: 12,
  border: "1px solid #1f2937",
  padding: "24px",
  marginBottom: 24,
};

const LABEL: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 4,
};

const VALUE: React.CSSProperties = {
  color: "#f9fafb",
  fontFamily: "'Courier New', monospace",
  fontSize: 15,
  fontWeight: 700,
};

const TH: React.CSSProperties = {
  background: "#1f2937",
  color: "#9ca3af",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  padding: "10px 14px",
  textAlign: "left",
  borderBottom: "1px solid #374151",
};

const TD: React.CSSProperties = {
  padding: "10px 14px",
  borderBottom: "1px solid #1f2937",
  color: "#f9fafb",
  fontFamily: "'Courier New', monospace",
  fontSize: 13,
};

// ─── Scenario Computation ────────────────────────────────────────────────────

interface ScenarioResult {
  label: string;
  revenueGrowthRate: number;
  cogsPct: number;
  customerGrowth: number;
  year1Revenue: number;
  year1NetIncome: number;
  breakEvenMonth: number;
  threeYearCumNetIncome: number;
}

function computeScenario(
  baseAssumptions: ReturnType<typeof Object.assign>,
  revenueGrowthMultiplier: number,
  cogsPtsDelta: number,
  customerGrowthMultiplier: number,
  startupCosts: {
    items: {
      id: string;
      category: string;
      item: string;
      cost: number;
      notes: string;
    }[];
  },
  label: string,
  threeYearPlan: ReturnType<typeof Object.assign>,
): ScenarioResult {
  const modifiedAssumptions = {
    ...baseAssumptions,
    momGrowthRate: baseAssumptions.momGrowthRate * revenueGrowthMultiplier,
    cogsPercent: Math.max(
      0,
      Math.min(100, baseAssumptions.cogsPercent + cogsPtsDelta),
    ),
    customerGrowthRate:
      baseAssumptions.customerGrowthRate * customerGrowthMultiplier,
  };

  const amortRows = buildAmortizationSchedule(
    modifiedAssumptions.debtPortion,
    modifiedAssumptions.loanInterestRate,
    modifiedAssumptions.loanTermMonths,
  );

  const incomeMonths = computeAllIncomeMonths(
    modifiedAssumptions,
    {},
    amortRows,
    startupCosts,
  );

  const annual = annualTotals(incomeMonths);

  // Break-even month: first month cumulative net income turns non-negative
  let cumulative = 0;
  let breakEvenMonth = 0;
  for (let m = 0; m < incomeMonths.length; m++) {
    cumulative += incomeMonths[m].netIncome;
    if (cumulative >= 0 && breakEvenMonth === 0) {
      breakEvenMonth = m + 1;
    }
  }
  if (breakEvenMonth === 0) breakEvenMonth = 13; // not achieved in year 1

  // 3-year cumulative: use actual plan growth rates via computeThreeYearPlan
  const threeYearData = computeThreeYearPlan(
    annual,
    threeYearPlan,
    modifiedAssumptions,
  );
  const threeYearCumNetIncome = threeYearData.reduce(
    (sum, yr) => sum + yr.netIncome,
    0,
  );

  return {
    label,
    revenueGrowthRate: modifiedAssumptions.momGrowthRate,
    cogsPct: modifiedAssumptions.cogsPercent,
    customerGrowth: modifiedAssumptions.customerGrowthRate,
    year1Revenue: annual.totalRevenue,
    year1NetIncome: annual.netIncome,
    breakEvenMonth,
    threeYearCumNetIncome,
  };
}

// ─── Tornado Chart Data ───────────────────────────────────────────────────────

interface TornadoEntry {
  variable: string;
  positiveImpact: number;
  negativeImpact: number;
}

function computeTornadoData(
  assumptions: ReturnType<typeof Object.assign>,
  startupCosts: {
    items: {
      id: string;
      category: string;
      item: string;
      cost: number;
      notes: string;
    }[];
  },
): TornadoEntry[] {
  const baseAmort = buildAmortizationSchedule(
    assumptions.debtPortion,
    assumptions.loanInterestRate,
    assumptions.loanTermMonths,
  );
  const baseMonths = computeAllIncomeMonths(
    assumptions,
    {},
    baseAmort,
    startupCosts,
  );
  const baseNetIncome = annualTotals(baseMonths).netIncome;

  const vary = (overrides: Partial<typeof assumptions>): number => {
    const mod = { ...assumptions, ...overrides };
    const amort = buildAmortizationSchedule(
      mod.debtPortion,
      mod.loanInterestRate,
      mod.loanTermMonths,
    );
    const months = computeAllIncomeMonths(mod, {}, amort, startupCosts);
    return annualTotals(months).netIncome - baseNetIncome;
  };

  const factor = 0.2;

  return [
    {
      variable: "Revenue Growth",
      positiveImpact: vary({
        momGrowthRate: assumptions.momGrowthRate * (1 + factor),
      }),
      negativeImpact: vary({
        momGrowthRate: assumptions.momGrowthRate * (1 - factor),
      }),
    },
    {
      variable: "COGS %",
      positiveImpact: vary({
        cogsPercent: Math.max(0, assumptions.cogsPercent * (1 - factor)),
      }),
      negativeImpact: vary({
        cogsPercent: Math.min(100, assumptions.cogsPercent * (1 + factor)),
      }),
    },
    {
      variable: "Customer Count",
      positiveImpact: vary({
        customersMonth1: assumptions.customersMonth1 * (1 + factor),
      }),
      negativeImpact: vary({
        customersMonth1: assumptions.customersMonth1 * (1 - factor),
      }),
    },
    {
      variable: "Rent",
      positiveImpact: vary({
        monthlyRent: assumptions.monthlyRent * (1 - factor),
      }),
      negativeImpact: vary({
        monthlyRent: assumptions.monthlyRent * (1 + factor),
      }),
    },
    {
      variable: "Marketing Spend",
      positiveImpact: vary({
        monthlyMarketing: assumptions.monthlyMarketing * (1 - factor),
      }),
      negativeImpact: vary({
        monthlyMarketing: assumptions.monthlyMarketing * (1 + factor),
      }),
    },
  ];
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}

function TornadoTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: "#1f2937",
        border: "1px solid #374151",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "'Courier New', monospace",
        fontSize: 12,
      }}
    >
      <div style={{ color: "#9ca3af", marginBottom: 6, fontWeight: 700 }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.value >= 0 ? "#10b981" : "#ef4444" }}>
          {p.name}: {formatCurrency(p.value)}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Step10_Sensitivity() {
  const { state, dispatch } = useDECA();
  const { assumptions, startupCosts, sensitivity, threeYearPlan } = state;

  const scenarios: ScenarioResult[] = useMemo(() => {
    return [
      computeScenario(
        assumptions,
        0.5,
        5,
        0.7,
        startupCosts,
        "Worst Case",
        threeYearPlan,
      ),
      computeScenario(
        assumptions,
        1.0,
        0,
        1.0,
        startupCosts,
        "Expected Case",
        threeYearPlan,
      ),
      computeScenario(
        assumptions,
        1.5,
        -5,
        1.3,
        startupCosts,
        "Best Case",
        threeYearPlan,
      ),
    ];
  }, [assumptions, startupCosts, threeYearPlan]);

  const tornadoData = useMemo(
    () => computeTornadoData(assumptions, startupCosts),
    [assumptions, startupCosts],
  );

  const colColors = ["#ef4444", "#60a5fa", "#10b981"];

  return (
    <div style={{ color: "#f9fafb" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 8,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: "#f9fafb",
            }}
          >
            Sensitivity Analysis
          </h2>
          <span
            style={{
              background: "linear-gradient(135deg, #92700a 0%, #d4af37 100%)",
              color: "#0a0f1e",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.1em",
              padding: "3px 10px",
              borderRadius: 20,
              textTransform: "uppercase",
            }}
          >
            ICDC Level
          </span>
        </div>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
          Three-scenario financial sensitivity analysis. Test how your
          projections hold under different conditions.
        </p>
      </div>

      {/* Scenario Assumptions Summary */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 16 }}>Scenario Parameters</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 0,
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              gridColumn: "1 / -1",
            }}
          >
            <thead>
              <tr>
                <th style={TH}>Variable</th>
                <th style={{ ...TH, color: "#ef4444" }}>Worst Case</th>
                <th style={{ ...TH, color: "#60a5fa" }}>Expected Case</th>
                <th style={{ ...TH, color: "#10b981" }}>Best Case</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...TD, color: "#9ca3af" }}>
                  Revenue Growth Rate (MoM)
                </td>
                <td style={{ ...TD, color: "#ef4444" }}>
                  {formatPercentRaw(assumptions.momGrowthRate * 0.5)}
                  <span
                    style={{ color: "#6b7280", fontSize: 11, marginLeft: 4 }}
                  >
                    (-50% of base)
                  </span>
                </td>
                <td style={{ ...TD, color: "#60a5fa" }}>
                  {formatPercentRaw(assumptions.momGrowthRate)}
                  <span
                    style={{ color: "#6b7280", fontSize: 11, marginLeft: 4 }}
                  >
                    (base)
                  </span>
                </td>
                <td style={{ ...TD, color: "#10b981" }}>
                  {formatPercentRaw(assumptions.momGrowthRate * 1.5)}
                  <span
                    style={{ color: "#6b7280", fontSize: 11, marginLeft: 4 }}
                  >
                    (+50% of base)
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ ...TD, color: "#9ca3af" }}>COGS %</td>
                <td style={{ ...TD, color: "#ef4444" }}>
                  {formatPercentRaw(Math.min(100, assumptions.cogsPercent + 5))}
                  <span
                    style={{ color: "#6b7280", fontSize: 11, marginLeft: 4 }}
                  >
                    (+5 pts)
                  </span>
                </td>
                <td style={{ ...TD, color: "#60a5fa" }}>
                  {formatPercentRaw(assumptions.cogsPercent)}
                  <span
                    style={{ color: "#6b7280", fontSize: 11, marginLeft: 4 }}
                  >
                    (base)
                  </span>
                </td>
                <td style={{ ...TD, color: "#10b981" }}>
                  {formatPercentRaw(Math.max(0, assumptions.cogsPercent - 5))}
                  <span
                    style={{ color: "#6b7280", fontSize: 11, marginLeft: 4 }}
                  >
                    (-5 pts)
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ ...TD, color: "#9ca3af", borderBottom: "none" }}>
                  Customer Growth Rate (MoM)
                </td>
                <td style={{ ...TD, color: "#ef4444", borderBottom: "none" }}>
                  {formatPercentRaw(assumptions.customerGrowthRate * 0.7)}
                  <span
                    style={{ color: "#6b7280", fontSize: 11, marginLeft: 4 }}
                  >
                    (-30%)
                  </span>
                </td>
                <td style={{ ...TD, color: "#60a5fa", borderBottom: "none" }}>
                  {formatPercentRaw(assumptions.customerGrowthRate)}
                  <span
                    style={{ color: "#6b7280", fontSize: 11, marginLeft: 4 }}
                  >
                    (base)
                  </span>
                </td>
                <td style={{ ...TD, color: "#10b981", borderBottom: "none" }}>
                  {formatPercentRaw(assumptions.customerGrowthRate * 1.3)}
                  <span
                    style={{ color: "#6b7280", fontSize: 11, marginLeft: 4 }}
                  >
                    (+30%)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenario Results Table */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 16 }}>
          Scenario Financial Outcomes
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}
          >
            <thead>
              <tr>
                <th style={TH}>Metric</th>
                {scenarios.map((s, i) => (
                  <th key={s.label} style={{ ...TH, color: colColors[i] }}>
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "Year 1 Total Revenue",
                  values: scenarios.map((s) => formatCurrency(s.year1Revenue)),
                  colors: ["#ef4444", "#60a5fa", "#10b981"],
                },
                {
                  label: "Year 1 Net Income",
                  values: scenarios.map((s) =>
                    formatCurrency(s.year1NetIncome),
                  ),
                  colors: scenarios.map((s) =>
                    s.year1NetIncome >= 0 ? "#10b981" : "#ef4444",
                  ),
                },
                {
                  label: "Break-Even Month",
                  values: scenarios.map((s) =>
                    s.breakEvenMonth > 12
                      ? "Not in Year 1"
                      : `Month ${s.breakEvenMonth}`,
                  ),
                  colors: scenarios.map((s) =>
                    s.breakEvenMonth > 12
                      ? "#ef4444"
                      : s.breakEvenMonth <= 6
                        ? "#10b981"
                        : "#f59e0b",
                  ),
                },
                {
                  label: "3-Year Cumulative Net Income",
                  values: scenarios.map((s) =>
                    formatCurrency(s.threeYearCumNetIncome),
                  ),
                  colors: scenarios.map((s) =>
                    s.threeYearCumNetIncome >= 0 ? "#10b981" : "#ef4444",
                  ),
                },
              ].map((row, rowIdx, arr) => (
                <tr key={row.label}>
                  <td
                    style={{
                      ...TD,
                      color: "#9ca3af",
                      borderBottom:
                        rowIdx === arr.length - 1
                          ? "none"
                          : "1px solid #1f2937",
                    }}
                  >
                    {row.label}
                  </td>
                  {row.values.map((val, i) => (
                    <td
                      key={i}
                      style={{
                        ...TD,
                        color: Array.isArray(row.colors)
                          ? row.colors[i]
                          : colColors[i],
                        borderBottom:
                          rowIdx === arr.length - 1
                            ? "none"
                            : "1px solid #1f2937",
                        fontWeight: 700,
                      }}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tornado Chart */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 4 }}>
          Tornado Chart — Year 1 Net Income Impact (±20% Variable Change)
        </div>
        <p
          style={{
            color: "#6b7280",
            fontSize: 12,
            marginBottom: 20,
            marginTop: 0,
          }}
        >
          Shows how each variable affects Year 1 Net Income when varied ±20%
          from base. Green bars = positive impact. Red bars = negative impact.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            layout="vertical"
            data={tornadoData}
            margin={{ top: 8, right: 40, left: 100, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1f2937"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickFormatter={(v: number) => formatCurrency(v)}
              tick={{
                fill: "#6b7280",
                fontSize: 11,
                fontFamily: "'Courier New', monospace",
              }}
              axisLine={{ stroke: "#374151" }}
              tickLine={{ stroke: "#374151" }}
            />
            <YAxis
              type="category"
              dataKey="variable"
              width={100}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<TornadoTooltip />} />
            <ReferenceLine x={0} stroke="#374151" strokeWidth={2} />
            <Bar
              dataKey="positiveImpact"
              name="Positive Impact"
              radius={[0, 4, 4, 0]}
            >
              {tornadoData.map((_, index) => (
                <Cell key={`pos-${index}`} fill="#10b981" fillOpacity={0.85} />
              ))}
            </Bar>
            <Bar
              dataKey="negativeImpact"
              name="Negative Impact"
              radius={[0, 4, 4, 0]}
            >
              {tornadoData.map((_, index) => (
                <Cell key={`neg-${index}`} fill="#ef4444" fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 12,
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: "#10b981",
              }}
            />
            <span style={{ color: "#9ca3af", fontSize: 12 }}>
              Positive Impact
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: "#ef4444",
              }}
            />
            <span style={{ color: "#9ca3af", fontSize: 12 }}>
              Negative Impact
            </span>
          </div>
        </div>
      </div>

      {/* Worst-Case Response */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 8 }}>
          Worst-Case Contingency Response
        </div>
        <p
          style={{
            color: "#6b7280",
            fontSize: 13,
            marginBottom: 12,
            marginTop: 0,
          }}
        >
          Describe how you would respond if worst-case projections materialize.
          Judges want to see proactive risk management.
        </p>
        <textarea
          value={sensitivity.worstCaseResponse}
          onChange={(e) =>
            dispatch({
              type: "SET_SENSITIVITY",
              payload: { worstCaseResponse: e.target.value },
            })
          }
          placeholder="Example: If revenue growth falls 50% below projections, we would immediately reduce marketing spend by 40%, defer the planned Q3 headcount addition, renegotiate supplier terms to improve COGS by 3 percentage points, and activate our contingency reserve of $X. We would pivot to direct sales channels to reduce customer acquisition cost and focus on our highest-margin product lines..."
          rows={6}
          style={{
            width: "100%",
            background: "#0a0f1e",
            border: "1px solid #374151",
            borderRadius: 8,
            color: "#f9fafb",
            fontSize: 14,
            padding: "12px 14px",
            resize: "vertical",
            boxSizing: "border-box",
            fontFamily: "inherit",
            lineHeight: 1.6,
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")}
        />
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}
        >
          <span style={{ color: "#6b7280", fontSize: 11 }}>
            {sensitivity.worstCaseResponse.length} characters
          </span>
        </div>
      </div>

      {/* Key Insight */}
      <div
        style={{
          background: "#0d1a30",
          border: "1px solid #1d4ed8",
          borderRadius: 10,
          padding: "16px 20px",
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>💡</span>
        <div>
          <div
            style={{
              color: "#60a5fa",
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            ICDC Judge Tip
          </div>
          <div style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6 }}>
            Sensitivity analysis separates state competitors from ICDC
            finalists. Judges expect you to know your numbers' breaking points.
            Show that you've stress-tested your model and have a credible
            response plan — not just optimistic projections.
          </div>
        </div>
      </div>
    </div>
  );
}
