import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency } from "../utils/decaUtils";

const MONTHS = [
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

const cellStyle: React.CSSProperties = {
  padding: "6px 10px",
  textAlign: "right",
  fontFamily: "monospace",
  fontSize: "12px",
  color: "#9ca3af",
  borderRight: "1px solid #1f2937",
  whiteSpace: "nowrap",
};

const boldCellStyle: React.CSSProperties = {
  ...cellStyle,
  color: "#f9fafb",
  fontWeight: 700,
};

const labelCellStyle: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: "12px",
  color: "#9ca3af",
  borderRight: "1px solid #1f2937",
  whiteSpace: "nowrap",
  minWidth: 220,
  position: "sticky",
  left: 0,
  background: "#111827",
  zIndex: 1,
};

const boldLabelStyle: React.CSSProperties = {
  ...labelCellStyle,
  color: "#f9fafb",
  fontWeight: 700,
};

const sectionHeaderStyle: React.CSSProperties = {
  ...labelCellStyle,
  color: "#60a5fa",
  fontWeight: 700,
  fontSize: "11px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  background: "#0d1526",
};

function DataRow({
  label,
  values,
  bold,
  sectionHeader,
  isEndingBalance,
}: {
  label: string;
  values: number[];
  bold?: boolean;
  sectionHeader?: boolean;
  isEndingBalance?: boolean;
}) {
  return (
    <tr style={{ borderBottom: "1px solid #1f2937" }}>
      <td
        style={
          sectionHeader
            ? sectionHeaderStyle
            : bold
              ? boldLabelStyle
              : labelCellStyle
        }
      >
        {label}
      </td>
      {values.map((val, i) => {
        const isNegative = val < 0;
        let bg = "transparent";
        if (isEndingBalance && isNegative) bg = "rgba(239, 68, 68, 0.15)";

        const style: React.CSSProperties = {
          ...(bold ? boldCellStyle : cellStyle),
          background: bg,
          color: isEndingBalance
            ? isNegative
              ? "#ef4444"
              : "#10b981"
            : bold
              ? "#f9fafb"
              : "#9ca3af",
          position: "relative",
        };

        return (
          <td
            key={i}
            style={style}
            title={
              isEndingBalance && isNegative
                ? "⚠️ CASH CRISIS — Negative ending balance"
                : undefined
            }
          >
            {formatCurrency(val)}
            {isEndingBalance && isNegative && (
              <span style={{ marginLeft: 4, fontSize: 10 }}>⚠️</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <tr style={{ background: "#0d1526" }}>
      <td
        colSpan={13}
        style={{
          padding: "6px 12px",
          color: "#60a5fa",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </td>
    </tr>
  );
}

export function Step5_CashFlow() {
  const { computed } = useDECA();
  const { cashFlowMonths } = computed;
  const [tooltip, setTooltip] = useState<{
    idx: number;
    x: number;
    y: number;
  } | null>(null);

  const lowestBalance = cashFlowMonths.reduce(
    (acc, m, i) =>
      m.endingBalance < acc.value
        ? { value: m.endingBalance, month: i + 1 }
        : acc,
    { value: Infinity, month: 1 },
  );
  const month12Ending =
    cashFlowMonths.length >= 12 ? cashFlowMonths[11].endingBalance : 0;

  const chartData = cashFlowMonths.map((m, i) => ({
    name: MONTHS[i],
    balance: m.endingBalance,
  }));

  const exportCSV = useCallback(() => {
    const header = ["Row", ...MONTHS].join(",");
    const rows = [
      ["Beginning Balance", ...cashFlowMonths.map((m) => m.beginningBalance)],
      [
        "Collections from Sales",
        ...cashFlowMonths.map((m) => m.salesCollections),
      ],
      ["Loan Proceeds", ...cashFlowMonths.map((m) => m.loanProceeds)],
      ["Equity Investment", ...cashFlowMonths.map((m) => m.equityInvestment)],
      ["Other Inflows", ...cashFlowMonths.map((m) => m.otherInflows)],
      ["Total Inflows", ...cashFlowMonths.map((m) => m.totalInflows)],
      ["COGS Payments", ...cashFlowMonths.map((m) => m.cogsPayments)],
      ["Rent", ...cashFlowMonths.map((m) => m.rent)],
      ["Utilities", ...cashFlowMonths.map((m) => m.utilities)],
      ["Salaries", ...cashFlowMonths.map((m) => m.salaries)],
      ["Payroll Taxes", ...cashFlowMonths.map((m) => m.payrollTaxes)],
      ["Marketing", ...cashFlowMonths.map((m) => m.marketing)],
      ["Insurance", ...cashFlowMonths.map((m) => m.insurance)],
      ["Technology", ...cashFlowMonths.map((m) => m.technology)],
      [
        "Professional Services",
        ...cashFlowMonths.map((m) => m.professionalServices),
      ],
      ["Misc OpEx", ...cashFlowMonths.map((m) => m.miscOpEx)],
      ["Startup Costs", ...cashFlowMonths.map((m) => m.startupCostsPayment)],
      ["Loan Principal", ...cashFlowMonths.map((m) => m.loanPrincipal)],
      ["Interest Payment", ...cashFlowMonths.map((m) => m.interestPayment)],
      ["Tax Payments", ...cashFlowMonths.map((m) => m.taxPayments)],
      ["Other Outflows", ...cashFlowMonths.map((m) => m.otherOutflows)],
      ["Total Outflows", ...cashFlowMonths.map((m) => m.totalOutflows)],
      ["Net Cash Flow", ...cashFlowMonths.map((m) => m.netCashFlow)],
      ["Ending Balance", ...cashFlowMonths.map((m) => m.endingBalance)],
    ];
    const csv = [header, ...rows.map((r) => r.map(String).join(","))].join(
      "\n",
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cash_flow_statement.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [cashFlowMonths]);

  const vals = (fn: (m: (typeof cashFlowMonths)[0]) => number) =>
    cashFlowMonths.map(fn);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "24px 0", color: "#f9fafb" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{ fontSize: 22, fontWeight: 700, color: "#f9fafb", margin: 0 }}
        >
          Cash Flow Statement
        </h2>
        <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
          12-Month Projected Cash Flow — Display Only
        </p>
      </div>

      {/* Summary Badges */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
      >
        <div
          style={{
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: 8,
            padding: "10px 18px",
          }}
        >
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>
            Lowest Balance
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 16,
              fontWeight: 700,
              color: lowestBalance.value < 0 ? "#ef4444" : "#10b981",
            }}
          >
            {formatCurrency(
              lowestBalance.value === Infinity ? 0 : lowestBalance.value,
            )}
          </div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>
            Month {lowestBalance.month}
          </div>
        </div>

        <div
          style={{
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: 8,
            padding: "10px 18px",
          }}
        >
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>
            Month 12 Ending Balance
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 16,
              fontWeight: 700,
              color: month12Ending < 0 ? "#ef4444" : "#10b981",
            }}
          >
            {formatCurrency(month12Ending)}
          </div>
        </div>

        <button
          onClick={exportCSV}
          style={{
            marginLeft: "auto",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            alignSelf: "center",
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: 10,
          overflowX: "auto",
          marginBottom: 28,
        }}
      >
        <table
          style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}
        >
          <thead>
            <tr
              style={{
                background: "#0d1526",
                borderBottom: "2px solid #2563eb",
              }}
            >
              <th
                style={{
                  ...labelCellStyle,
                  color: "#60a5fa",
                  fontWeight: 700,
                  fontSize: 12,
                  textAlign: "left",
                  background: "#0d1526",
                }}
              >
                Item
              </th>
              {MONTHS.map((m) => (
                <th
                  key={m}
                  style={{
                    ...cellStyle,
                    color: "#60a5fa",
                    fontWeight: 700,
                    fontSize: 12,
                    textAlign: "right",
                  }}
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <DataRow
              label="BEGINNING BALANCE"
              values={vals((m) => m.beginningBalance)}
              bold
            />

            <SectionDivider label="Cash Inflows" />
            <DataRow
              label="Collections from Sales"
              values={vals((m) => m.salesCollections)}
            />
            <DataRow
              label="Loan Proceeds"
              values={vals((m) => m.loanProceeds)}
            />
            <DataRow
              label="Equity Investment"
              values={vals((m) => m.equityInvestment)}
            />
            <DataRow
              label="Other Inflows"
              values={vals((m) => m.otherInflows)}
            />
            <DataRow
              label="Total Inflows"
              values={vals((m) => m.totalInflows)}
              bold
            />

            <SectionDivider label="Cash Outflows" />
            <DataRow
              label="COGS Payments"
              values={vals((m) => m.cogsPayments)}
            />
            <DataRow label="Rent" values={vals((m) => m.rent)} />
            <DataRow label="Utilities" values={vals((m) => m.utilities)} />
            <DataRow label="Salaries" values={vals((m) => m.salaries)} />
            <DataRow
              label="Payroll Taxes"
              values={vals((m) => m.payrollTaxes)}
            />
            <DataRow label="Marketing" values={vals((m) => m.marketing)} />
            <DataRow label="Insurance" values={vals((m) => m.insurance)} />
            <DataRow label="Technology" values={vals((m) => m.technology)} />
            <DataRow
              label="Professional Services"
              values={vals((m) => m.professionalServices)}
            />
            <DataRow label="Misc OpEx" values={vals((m) => m.miscOpEx)} />
            <DataRow
              label="Startup Costs (Month 1)"
              values={vals((m) => m.startupCostsPayment)}
            />
            <DataRow
              label="Loan Principal Payment"
              values={vals((m) => m.loanPrincipal)}
            />
            <DataRow
              label="Interest Payment"
              values={vals((m) => m.interestPayment)}
            />
            <DataRow
              label="Tax Payments (Quarterly)"
              values={vals((m) => m.taxPayments)}
            />
            <DataRow
              label="Other Outflows"
              values={vals((m) => m.otherOutflows)}
            />
            <DataRow
              label="Total Outflows"
              values={vals((m) => m.totalOutflows)}
              bold
            />

            <tr
              style={{ background: "#0a0f1e", borderTop: "2px solid #374151" }}
            >
              <td style={{ ...boldLabelStyle, background: "#0a0f1e" }}>
                NET CASH FLOW
              </td>
              {cashFlowMonths.map((m, i) => (
                <td
                  key={i}
                  style={{
                    ...boldCellStyle,
                    color: m.netCashFlow >= 0 ? "#10b981" : "#ef4444",
                    background: "#0a0f1e",
                  }}
                >
                  {formatCurrency(m.netCashFlow)}
                </td>
              ))}
            </tr>

            <tr
              style={{ background: "#0a0f1e", borderTop: "1px solid #374151" }}
            >
              <td
                style={{
                  ...boldLabelStyle,
                  background: "#0a0f1e",
                  fontSize: 13,
                }}
              >
                ENDING BALANCE
              </td>
              {cashFlowMonths.map((m, i) => (
                <td
                  key={i}
                  style={{
                    ...boldCellStyle,
                    color: m.endingBalance >= 0 ? "#10b981" : "#ef4444",
                    background:
                      m.endingBalance < 0 ? "rgba(239,68,68,0.12)" : "#0a0f1e",
                    fontSize: 13,
                  }}
                  title={
                    m.endingBalance < 0
                      ? "⚠️ CASH CRISIS — Negative ending balance"
                      : undefined
                  }
                  onMouseEnter={() => setTooltip({ idx: i, x: 0, y: 0 })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {formatCurrency(m.endingBalance)}
                  {m.endingBalance < 0 && (
                    <span style={{ marginLeft: 4 }}>⚠️</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        {tooltip && cashFlowMonths[tooltip.idx]?.endingBalance < 0 && (
          <div
            style={{
              background: "#1f2937",
              border: "1px solid #ef4444",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              color: "#ef4444",
              margin: 8,
            }}
          >
            ⚠️ CASH CRISIS — Month {tooltip.idx + 1} ending balance is negative:{" "}
            {formatCurrency(cashFlowMonths[tooltip.idx].endingBalance)}
          </div>
        )}
      </div>

      {/* Area Chart */}
      <div
        style={{
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: 10,
          padding: "20px 16px 8px",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#f9fafb",
            marginBottom: 16,
          }}
        >
          Ending Cash Balance by Month
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: 6,
              }}
              labelStyle={{ color: "#9ca3af", fontSize: 12 }}
              formatter={(val: unknown) => [
                formatCurrency(Number(val)),
                "Ending Balance",
              ]}
            />
            <ReferenceLine
              y={0}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#balanceGrad)"
              dot={(props) => {
                const { cx, cy, payload } = props as {
                  cx: number;
                  cy: number;
                  payload: { balance: number };
                };
                return (
                  <circle
                    key={`dot-${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill={payload.balance < 0 ? "#ef4444" : "#2563eb"}
                    stroke="none"
                  />
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
