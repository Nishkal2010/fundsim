import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency } from "../utils/decaUtils";
import { baseMonthIncome } from "../utils/decaUtils";
import type { IncomeStatementMonthData } from "../types/decaTypes";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ─── Inline editable cell ──────────────────────────────────────────────────

interface EditableCellProps {
  value: number;
  onCommit: (v: number) => void;
  highlight?: boolean;
  bold?: boolean;
  color?: string;
}

function EditableCell({
  value,
  onCommit,
  highlight,
  bold,
  color,
}: EditableCellProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(String(value));
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing && inputRef.current) inputRef.current.select();
  }, [editing]);

  const commit = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) onCommit(parsed);
    setEditing(false);
  };

  if (editing) {
    return (
      <td
        style={{
          padding: "0.3rem 0.5rem",
          background: highlight ? "rgba(212,175,55,0.12)" : undefined,
          minWidth: 90,
        }}
      >
        <input
          ref={inputRef}
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(String(value));
              setEditing(false);
            }
          }}
          style={{
            background: "transparent",
            border: "1px solid #2563eb",
            borderRadius: "0.25rem",
            color: "#f9fafb",
            fontFamily: "monospace",
            fontSize: "0.78rem",
            width: "100%",
            padding: "0.2rem 0.3rem",
            outline: "none",
            boxShadow: "0 0 0 2px rgba(37,99,235,0.2)",
          }}
        />
      </td>
    );
  }

  return (
    <td
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      title="Click to edit"
      style={{
        padding: "0.3rem 0.5rem",
        textAlign: "right",
        fontFamily: "monospace",
        fontSize: "0.78rem",
        fontWeight: bold ? 700 : 400,
        color: color ?? "#f9fafb",
        cursor: "text",
        background: highlight ? "rgba(212,175,55,0.12)" : undefined,
        minWidth: 90,
        userSelect: "none",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => {
        if (!highlight)
          (e.currentTarget as HTMLTableCellElement).style.background =
            "rgba(37,99,235,0.06)";
      }}
      onMouseLeave={(e) => {
        if (!highlight)
          (e.currentTarget as HTMLTableCellElement).style.background =
            "transparent";
      }}
    >
      {formatCurrency(value)}
    </td>
  );
}

// ─── Read-only cell ────────────────────────────────────────────────────────

interface ReadonlyCellProps {
  value: number | string;
  highlight?: boolean;
  bold?: boolean;
  color?: string;
  isPercent?: boolean;
}

function ReadonlyCell({
  value,
  highlight,
  bold,
  color,
  isPercent,
}: ReadonlyCellProps) {
  const display =
    typeof value === "string"
      ? value
      : isPercent
        ? `${(value as number).toFixed(1)}%`
        : formatCurrency(value as number);

  return (
    <td
      style={{
        padding: "0.3rem 0.5rem",
        textAlign: "right",
        fontFamily: "monospace",
        fontSize: "0.78rem",
        fontWeight: bold ? 700 : 400,
        color: color ?? "#9ca3af",
        background: highlight ? "rgba(212,175,55,0.12)" : undefined,
        minWidth: 90,
        whiteSpace: "nowrap",
      }}
    >
      {display}
    </td>
  );
}

// ─── Row label cell ────────────────────────────────────────────────────────

interface RowLabelProps {
  label: string;
  indent?: boolean;
  bold?: boolean;
  section?: boolean;
  color?: string;
}

function RowLabel({ label, indent, bold, section, color }: RowLabelProps) {
  return (
    <td
      style={{
        padding: section ? "0.875rem 0.75rem 0.375rem" : "0.3rem 0.75rem",
        fontSize: section ? "0.68rem" : "0.8rem",
        fontWeight: section ? 700 : bold ? 700 : 400,
        color: section ? "#6b7280" : (color ?? "#9ca3af"),
        textTransform: section ? "uppercase" : "none",
        letterSpacing: section ? "0.07em" : "normal",
        paddingLeft: indent ? "1.5rem" : "0.75rem",
        whiteSpace: "nowrap",
        position: "sticky",
        left: 0,
        background: "#111827",
        zIndex: 2,
        borderRight: "1px solid #1f2937",
      }}
    >
      {label}
    </td>
  );
}

// ─── Section divider row ───────────────────────────────────────────────────

function SectionRow({ label, colCount }: { label: string; colCount: number }) {
  return (
    <tr>
      <td
        colSpan={colCount + 1}
        style={{
          padding: "0.875rem 0.75rem 0.25rem",
          fontSize: "0.68rem",
          fontWeight: 700,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          background: "#0a0f1e",
          position: "sticky",
          left: 0,
        }}
      >
        {label}
      </td>
    </tr>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────

interface TooltipPayload {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #374151",
        borderRadius: "0.5rem",
        padding: "0.5rem 0.875rem",
        fontFamily: "monospace",
        fontSize: "0.78rem",
      }}
    >
      <div style={{ color: "#9ca3af", marginBottom: "0.2rem" }}>{label}</div>
      <div style={{ color: val >= 0 ? "#34d399" : "#f87171", fontWeight: 700 }}>
        {formatCurrency(val)}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function Step4_IncomeStatement() {
  const { state, dispatch, computed } = useDECA();
  const { incomeMonths, annual } = computed;
  const assumptions = state.assumptions;
  const overrides = state.incomeOverrides;

  // Find break-even month (first month cumulative net income >= 0)
  const breakEvenMonth = React.useMemo(() => {
    let cumulative = 0;
    for (let i = 0; i < incomeMonths.length; i++) {
      cumulative += incomeMonths[i].netIncome;
      if (cumulative >= 0) return i + 1;
    }
    return null;
  }, [incomeMonths]);

  // Growth badge
  const m1NetIncome = incomeMonths[0]?.netIncome ?? 0;
  const m12NetIncome = incomeMonths[11]?.netIncome ?? 0;
  const growthPct =
    m1NetIncome !== 0
      ? ((m12NetIncome - m1NetIncome) / Math.abs(m1NetIncome)) * 100
      : 0;

  // Dispatch helper for income overrides
  const setOverride = (
    month: number,
    data: Partial<IncomeStatementMonthData>,
  ) => {
    dispatch({ type: "SET_INCOME_OVERRIDE", payload: { month, data } });
  };

  // Get editable base value for a month/field combo
  const getBase = (monthIdx: number): IncomeStatementMonthData => {
    const base = baseMonthIncome(monthIdx + 1, assumptions);
    return { ...base, ...(overrides[monthIdx + 1] || {}) };
  };

  const totalCols = 13; // 12 months + annual

  // Annual sums for each revenue stream (computed from base + overrides)
  const annualRevenue1 = Array.from(
    { length: 12 },
    (_, i) => getBase(i).revenue1,
  ).reduce((s, v) => s + v, 0);
  const annualRevenue2 = Array.from(
    { length: 12 },
    (_, i) => getBase(i).revenue2,
  ).reduce((s, v) => s + v, 0);
  const annualRevenue3 = Array.from(
    { length: 12 },
    (_, i) => getBase(i).revenue3,
  ).reduce((s, v) => s + v, 0);

  // Bar chart data
  const chartData = incomeMonths.map((m, i) => ({
    name: MONTH_LABELS[i],
    netIncome: m.netIncome,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ paddingBottom: "2rem" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#f9fafb",
              margin: "0 0 0.375rem",
            }}
          >
            Income Statement
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
            12-month pro forma. Click any revenue or expense cell to override.
            Gold = break-even month.
          </p>
        </div>

        {/* Growth badge */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {breakEvenMonth && (
            <div
              style={{
                background: "rgba(212,175,55,0.10)",
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: "0.45rem",
                padding: "0.4rem 0.875rem",
                fontSize: "0.78rem",
                color: "#d4af37",
                fontWeight: 600,
              }}
            >
              Break-even: Month {breakEvenMonth}
            </div>
          )}
          <div
            style={{
              background:
                growthPct >= 0
                  ? "rgba(52,211,153,0.08)"
                  : "rgba(248,113,113,0.08)",
              border: `1px solid ${growthPct >= 0 ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
              borderRadius: "0.45rem",
              padding: "0.4rem 0.875rem",
              fontSize: "0.78rem",
              color: growthPct >= 0 ? "#34d399" : "#f87171",
              fontWeight: 600,
              fontFamily: "monospace",
            }}
          >
            M12 vs M1: {growthPct >= 0 ? "+" : ""}
            {growthPct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Month 1 profit warning */}
      {m1NetIncome > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.25)",
            borderRadius: "0.5rem",
            padding: "0.625rem 1rem",
            marginBottom: "1rem",
            fontSize: "0.82rem",
            color: "#fcd34d",
          }}
        >
          ⚠️ Month 1 shows positive net income ({formatCurrency(m1NetIncome)}).
          Verify this is realistic — judges expect early-stage losses.
        </motion.div>
      )}

      {/* Table */}
      <div
        style={{
          overflowX: "auto",
          border: "1px solid #1f2937",
          borderRadius: "0.75rem",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            minWidth: 1200,
          }}
        >
          {/* Column widths */}
          <colgroup>
            <col style={{ width: 190 }} />
            {MONTH_LABELS.map((m) => (
              <col key={m} style={{ width: 90 }} />
            ))}
            <col style={{ width: 100 }} />
          </colgroup>

          {/* Month headers */}
          <thead>
            <tr
              style={{
                background: "#0a0f1e",
                borderBottom: "1px solid #1f2937",
              }}
            >
              <th
                style={{
                  position: "sticky",
                  left: 0,
                  background: "#0a0f1e",
                  zIndex: 3,
                  padding: "0.625rem 0.75rem",
                  textAlign: "left",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  borderRight: "1px solid #1f2937",
                }}
              >
                Line Item
              </th>
              {MONTH_LABELS.map((m, i) => (
                <th
                  key={m}
                  style={{
                    padding: "0.625rem 0.5rem",
                    textAlign: "right",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: breakEvenMonth === i + 1 ? "#d4af37" : "#6b7280",
                    background:
                      breakEvenMonth === i + 1
                        ? "rgba(212,175,55,0.08)"
                        : undefined,
                    letterSpacing: "0.04em",
                  }}
                >
                  {m}
                </th>
              ))}
              <th
                style={{
                  padding: "0.625rem 0.5rem",
                  textAlign: "right",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#60a5fa",
                  letterSpacing: "0.04em",
                }}
              >
                Annual
              </th>
            </tr>
          </thead>

          <tbody>
            {/* ── REVENUE ── */}
            <SectionRow label="Revenue" colCount={totalCols} />

            {/* Revenue Stream 1 */}
            <tr style={{ background: "#111827" }}>
              <RowLabel label="Revenue Stream 1" indent />
              {incomeMonths.map((m, i) => {
                const base = getBase(i);
                return (
                  <EditableCell
                    key={i}
                    value={base.revenue1}
                    highlight={breakEvenMonth === i + 1}
                    onCommit={(v) => setOverride(i + 1, { revenue1: v })}
                  />
                );
              })}
              <ReadonlyCell value={annualRevenue1} bold color="#f9fafb" />
            </tr>

            {/* Revenue Stream 2 */}
            <tr style={{ background: "#0f1629" }}>
              <RowLabel label="Revenue Stream 2" indent />
              {incomeMonths.map((m, i) => {
                const base = getBase(i);
                return (
                  <EditableCell
                    key={i}
                    value={base.revenue2}
                    highlight={breakEvenMonth === i + 1}
                    onCommit={(v) => setOverride(i + 1, { revenue2: v })}
                  />
                );
              })}
              <ReadonlyCell value={annualRevenue2} color="#6b7280" />
            </tr>

            {/* Revenue Stream 3 */}
            <tr style={{ background: "#111827" }}>
              <RowLabel label="Revenue Stream 3" indent />
              {incomeMonths.map((m, i) => {
                const base = getBase(i);
                return (
                  <EditableCell
                    key={i}
                    value={base.revenue3}
                    highlight={breakEvenMonth === i + 1}
                    onCommit={(v) => setOverride(i + 1, { revenue3: v })}
                  />
                );
              })}
              <ReadonlyCell value={annualRevenue3} color="#6b7280" />
            </tr>

            {/* Total Revenue */}
            <tr
              style={{ background: "#0a0f1e", borderTop: "1px solid #374151" }}
            >
              <RowLabel label="Total Revenue" bold color="#f9fafb" />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.totalRevenue}
                  bold
                  color="#f9fafb"
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell value={annual.totalRevenue} bold color="#60a5fa" />
            </tr>

            {/* ── COGS ── */}
            <SectionRow label="Cost of Goods Sold" colCount={totalCols} />

            <tr style={{ background: "#111827" }}>
              <RowLabel label="COGS" indent />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.cogs}
                  color="#f87171"
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell value={annual.cogs} color="#f87171" />
            </tr>

            <tr
              style={{ background: "#0a0f1e", borderTop: "1px solid #374151" }}
            >
              <RowLabel label="Gross Profit" bold color="#f9fafb" />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.grossProfit}
                  bold
                  color={m.grossProfit >= 0 ? "#34d399" : "#f87171"}
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell
                value={annual.grossProfit}
                bold
                color={annual.grossProfit >= 0 ? "#34d399" : "#f87171"}
              />
            </tr>

            <tr style={{ background: "#111827" }}>
              <RowLabel label="Gross Margin %" indent color="#6b7280" />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.grossMarginPct}
                  isPercent
                  color="#9ca3af"
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell
                value={annual.grossMarginPct}
                isPercent
                color="#9ca3af"
              />
            </tr>

            {/* ── OPERATING EXPENSES ── */}
            <SectionRow label="Operating Expenses" colCount={totalCols} />

            {/* Editable opex rows */}
            {[
              { key: "rent" as const, label: "Rent / Lease" },
              { key: "utilities" as const, label: "Utilities" },
              { key: "salaries" as const, label: "Salaries & Wages" },
              { key: "marketing" as const, label: "Marketing" },
              { key: "insurance" as const, label: "Insurance" },
              { key: "technology" as const, label: "Technology" },
              {
                key: "professionalServices" as const,
                label: "Professional Services",
              },
            ].map(({ key, label }, rowIdx) => (
              <tr
                key={key}
                style={{ background: rowIdx % 2 === 0 ? "#111827" : "#0f1629" }}
              >
                <RowLabel label={label} indent />
                {incomeMonths.map((m, i) => {
                  const base = getBase(i);
                  return (
                    <EditableCell
                      key={i}
                      value={base[key] as number}
                      highlight={breakEvenMonth === i + 1}
                      onCommit={(v) => setOverride(i + 1, { [key]: v })}
                    />
                  );
                })}
                <ReadonlyCell value={annual[key]} />
              </tr>
            ))}

            {/* Computed opex rows */}
            <tr style={{ background: "#111827" }}>
              <RowLabel
                label="Payroll Taxes & Benefits"
                indent
                color="#6b7280"
              />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.payrollTaxes}
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell value={annual.payrollTaxes} />
            </tr>

            <tr style={{ background: "#0f1629" }}>
              <RowLabel label="Depreciation" indent color="#6b7280" />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.depreciation}
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell value={annual.depreciation} />
            </tr>

            <tr style={{ background: "#111827" }}>
              <RowLabel label="Misc (5% of OpEx)" indent color="#6b7280" />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.miscOpEx}
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell value={annual.miscOpEx} />
            </tr>

            {/* Total OpEx */}
            <tr
              style={{ background: "#0a0f1e", borderTop: "1px solid #374151" }}
            >
              <RowLabel label="Total Operating Expenses" bold color="#f9fafb" />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.totalOpEx}
                  bold
                  color="#fbbf24"
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell value={annual.totalOpEx} bold color="#fbbf24" />
            </tr>

            {/* ── INCOME ── */}
            <SectionRow label="Income" colCount={totalCols} />

            <tr style={{ background: "#111827" }}>
              <RowLabel label="Operating Income" bold color="#f9fafb" />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.operatingIncome}
                  bold
                  color={m.operatingIncome >= 0 ? "#34d399" : "#f87171"}
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell
                value={annual.operatingIncome}
                bold
                color={annual.operatingIncome >= 0 ? "#34d399" : "#f87171"}
              />
            </tr>

            <tr style={{ background: "#0f1629" }}>
              <RowLabel label="Interest Expense" indent color="#6b7280" />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.interestExpense}
                  color="#9ca3af"
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell value={annual.interestExpense} color="#9ca3af" />
            </tr>

            <tr style={{ background: "#111827" }}>
              <RowLabel label="Pre-Tax Income" bold color="#f9fafb" />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.preTaxIncome}
                  bold
                  color={m.preTaxIncome >= 0 ? "#f9fafb" : "#f87171"}
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell
                value={annual.preTaxIncome}
                bold
                color={annual.preTaxIncome >= 0 ? "#f9fafb" : "#f87171"}
              />
            </tr>

            <tr style={{ background: "#0f1629" }}>
              <RowLabel label="Income Tax" indent color="#6b7280" />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.taxes}
                  color="#9ca3af"
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell value={annual.taxes} color="#9ca3af" />
            </tr>

            {/* Net Income */}
            <tr
              style={{ background: "#0a0f1e", borderTop: "2px solid #374151" }}
            >
              <RowLabel label="NET INCOME" bold color="#f9fafb" />
              {incomeMonths.map((m, i) => (
                <ReadonlyCell
                  key={i}
                  value={m.netIncome}
                  bold
                  color={m.netIncome >= 0 ? "#34d399" : "#f87171"}
                  highlight={breakEvenMonth === i + 1}
                />
              ))}
              <ReadonlyCell
                value={annual.netIncome}
                bold
                color={annual.netIncome >= 0 ? "#34d399" : "#f87171"}
              />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Annual Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "0.875rem",
          marginTop: "1.5rem",
        }}
      >
        {[
          {
            label: "Annual Revenue",
            value: annual.totalRevenue,
            color: "#60a5fa",
          },
          {
            label: "Gross Profit",
            value: annual.grossProfit,
            color: annual.grossProfit >= 0 ? "#34d399" : "#f87171",
          },
          {
            label: "Gross Margin",
            value: annual.grossMarginPct,
            color: "#9ca3af",
            isPercent: true,
          },
          { label: "Total OpEx", value: annual.totalOpEx, color: "#fbbf24" },
          {
            label: "Net Income",
            value: annual.netIncome,
            color: annual.netIncome >= 0 ? "#34d399" : "#f87171",
          },
          {
            label: "Net Margin",
            value:
              annual.totalRevenue > 0
                ? (annual.netIncome / annual.totalRevenue) * 100
                : 0,
            color: "#9ca3af",
            isPercent: true,
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "0.625rem",
              padding: "0.875rem 1rem",
            }}
          >
            <div
              style={{
                fontSize: "0.68rem",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: "0.35rem",
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "1rem",
                fontWeight: 700,
                color: card.color,
              }}
            >
              {card.isPercent
                ? `${(card.value as number).toFixed(1)}%`
                : formatCurrency(card.value as number)}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        style={{
          marginTop: "1.5rem",
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: "0.75rem",
          padding: "1.25rem",
        }}
      >
        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: "1rem",
          }}
        >
          Monthly Net Income
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={{ stroke: "#374151" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <ReferenceLine y={0} stroke="#374151" strokeDasharray="3 3" />
            <Bar dataKey="netIncome" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.netIncome >= 0 ? "#059669" : "#dc2626"}
                  opacity={breakEvenMonth === index + 1 ? 1 : 0.75}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
