import React from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency } from "../utils/decaUtils";
import type { CapitalSource } from "../types/decaTypes";

const inputStyle: React.CSSProperties = {
  background: "#1f2937",
  border: "1px solid #374151",
  borderRadius: 6,
  color: "#f9fafb",
  fontFamily: "monospace",
  fontSize: 13,
  padding: "6px 10px",
  outline: "none",
};

const PIE_COLORS = [
  "#2563eb",
  "#d4af37",
  "#10b981",
  "#f59e0b",
  "#60a5fa",
  "#a78bfa",
  "#9ca3af",
];

const USE_FIELDS: {
  key: keyof NonNullable<
    ReturnType<typeof useDECA>["state"]["capitalNeeds"]["useOfFunds"]
  >;
  label: string;
}[] = [
  { key: "equipment", label: "Equipment" },
  { key: "inventory", label: "Inventory" },
  { key: "marketing", label: "Marketing" },
  { key: "workingCapital", label: "Working Capital" },
  { key: "technology", label: "Technology" },
  { key: "contingency", label: "Contingency" },
  { key: "other", label: "Other" },
];

type SourceType = CapitalSource["type"];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#f9fafb",
        marginBottom: 14,
        paddingBottom: 8,
        borderBottom: "1px solid #1f2937",
      }}
    >
      {children}
    </div>
  );
}

export function Step8_CapitalNeeds() {
  const { state, dispatch, computed } = useDECA();
  const { capitalNeeds } = state;
  const { amortRows, totalStartupCost } = computed;

  const totalRaised = capitalNeeds.sources.reduce((s, r) => s + r.amount, 0);
  const totalUseOfFunds = Object.values(capitalNeeds.useOfFunds).reduce(
    (s, v) => s + v,
    0,
  );
  const gap = totalStartupCost - totalRaised;
  const hasDebt = capitalNeeds.sources.some((s) => s.type === "debt");

  // Repayment month
  const repaymentMonth = amortRows.findIndex((r) => r.endingBalance <= 0.01);
  const fullRepayMonth =
    repaymentMonth >= 0 ? repaymentMonth + 1 : amortRows.length;

  const addSource = () => {
    const newSrc: CapitalSource = {
      id: Date.now().toString(),
      source: "New Source",
      type: "equity",
      amount: 0,
    };
    dispatch({
      type: "SET_CAPITAL_NEEDS",
      payload: { sources: [...capitalNeeds.sources, newSrc] },
    });
  };

  const updateSource = (
    id: string,
    field: keyof CapitalSource,
    value: string | number,
  ) => {
    dispatch({
      type: "SET_CAPITAL_NEEDS",
      payload: {
        sources: capitalNeeds.sources.map((s) =>
          s.id === id ? { ...s, [field]: value } : s,
        ),
      },
    });
  };

  const deleteSource = (id: string) => {
    dispatch({
      type: "SET_CAPITAL_NEEDS",
      payload: { sources: capitalNeeds.sources.filter((s) => s.id !== id) },
    });
  };

  const updateUseOfFunds = (
    key: keyof typeof capitalNeeds.useOfFunds,
    val: number,
  ) => {
    dispatch({
      type: "SET_CAPITAL_NEEDS",
      payload: { useOfFunds: { ...capitalNeeds.useOfFunds, [key]: val } },
    });
  };

  const pieData = USE_FIELDS.map((f) => ({
    name: f.label,
    value: capitalNeeds.useOfFunds[f.key],
  })).filter((d) => d.value > 0);

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
          Capital Needs Plan
        </h2>
        <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
          Define funding sources, use of funds, and repayment strategy
        </p>
      </div>

      {/* Section 1: Funding Sources */}
      <div
        style={{
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: 10,
          padding: "20px 22px",
          marginBottom: 20,
        }}
      >
        <SectionTitle>Section 1: Funding Sources</SectionTitle>

        {/* Validation badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background:
              Math.abs(gap) < 1
                ? "rgba(16,185,129,0.12)"
                : "rgba(239,68,68,0.12)",
            border: `1px solid ${Math.abs(gap) < 1 ? "#10b981" : "#ef4444"}`,
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 16,
            color: Math.abs(gap) < 1 ? "#10b981" : "#ef4444",
          }}
        >
          {Math.abs(gap) < 1 ? (
            <>✓ Matches capital plan — {formatCurrency(totalRaised)} raised</>
          ) : (
            <>
              ⚠ Funding gap: {formatCurrency(Math.abs(gap))} —{" "}
              {gap > 0 ? "under-funded" : "over-funded"} vs. startup costs of{" "}
              {formatCurrency(totalStartupCost)}
            </>
          )}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #374151" }}>
                {["Source", "Type", "Amount", "% of Total", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "6px 10px",
                      textAlign:
                        h === "Amount" || h === "% of Total" ? "right" : "left",
                      fontSize: 11,
                      color: "#6b7280",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {capitalNeeds.sources.map((src) => (
                <tr key={src.id} style={{ borderBottom: "1px solid #1f2937" }}>
                  <td style={{ padding: "6px 10px" }}>
                    <input
                      value={src.source}
                      onChange={(e) =>
                        updateSource(src.id, "source", e.target.value)
                      }
                      style={{ ...inputStyle, width: 160 }}
                    />
                  </td>
                  <td style={{ padding: "6px 10px" }}>
                    <select
                      value={src.type}
                      onChange={(e) =>
                        updateSource(
                          src.id,
                          "type",
                          e.target.value as SourceType,
                        )
                      }
                      style={{ ...inputStyle, width: 130, cursor: "pointer" }}
                    >
                      <option value="equity">Equity</option>
                      <option value="debt">Debt</option>
                      <option value="nondilutive">Non-Dilutive</option>
                    </select>
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    <input
                      type="number"
                      value={src.amount}
                      onChange={(e) =>
                        updateSource(
                          src.id,
                          "amount",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      style={{ ...inputStyle, width: 120, textAlign: "right" }}
                    />
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontSize: 13,
                      color: "#9ca3af",
                    }}
                  >
                    {totalRaised > 0
                      ? ((src.amount / totalRaised) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </td>
                  <td style={{ padding: "6px 10px" }}>
                    <button
                      onClick={() => deleteSource(src.id)}
                      style={{
                        background: "rgba(239,68,68,0.12)",
                        border: "1px solid #ef4444",
                        borderRadius: 4,
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: 12,
                        padding: "3px 10px",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr
                style={{
                  background: "#0d1526",
                  borderTop: "2px solid #374151",
                }}
              >
                <td
                  colSpan={2}
                  style={{
                    padding: "8px 10px",
                    fontWeight: 700,
                    color: "#f9fafb",
                    fontSize: 13,
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "#f9fafb",
                    fontSize: 13,
                  }}
                >
                  {formatCurrency(totalRaised)}
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    textAlign: "right",
                    fontFamily: "monospace",
                    color: "#9ca3af",
                    fontSize: 13,
                  }}
                >
                  100%
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
        <button
          onClick={addSource}
          style={{
            marginTop: 12,
            background: "transparent",
            border: "1px dashed #2563eb",
            borderRadius: 6,
            color: "#60a5fa",
            cursor: "pointer",
            fontSize: 13,
            padding: "6px 16px",
          }}
        >
          + Add Row
        </button>
      </div>

      {/* Section 2: Use of Funds */}
      <div
        style={{
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: 10,
          padding: "20px 22px",
          marginBottom: 20,
        }}
      >
        <SectionTitle>Section 2: Use of Funds</SectionTitle>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        >
          {/* Inputs */}
          <div>
            {USE_FIELDS.map((f, i) => (
              <div
                key={f.key}
                style={{
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: PIE_COLORS[i % PIE_COLORS.length],
                    flexShrink: 0,
                  }}
                />
                <label
                  style={{
                    fontSize: 13,
                    color: "#9ca3af",
                    width: 140,
                    flexShrink: 0,
                  }}
                >
                  {f.label}
                </label>
                <input
                  type="number"
                  value={capitalNeeds.useOfFunds[f.key]}
                  onChange={(e) =>
                    updateUseOfFunds(f.key, parseFloat(e.target.value) || 0)
                  }
                  style={{ ...inputStyle, flex: 1 }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "#6b7280",
                    width: 50,
                    textAlign: "right",
                  }}
                >
                  {totalUseOfFunds > 0
                    ? (
                        (capitalNeeds.useOfFunds[f.key] / totalUseOfFunds) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            ))}
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: "1px solid #374151",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <span style={{ color: "#9ca3af" }}>Total</span>
              <span style={{ fontFamily: "monospace", color: "#f9fafb" }}>
                {formatCurrency(totalUseOfFunds)}
              </span>
            </div>
          </div>

          {/* Pie Chart */}
          <div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({
                      name,
                      percent,
                    }: {
                      name?: string;
                      percent?: number;
                    }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid #374151",
                      borderRadius: 6,
                    }}
                    formatter={(val: unknown) => [formatCurrency(Number(val))]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: 240,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  fontSize: 13,
                }}
              >
                Enter use of funds amounts to see chart
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Loan Amortization */}
      {hasDebt && amortRows.length > 0 && (
        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: 10,
            padding: "20px 22px",
            marginBottom: 20,
          }}
        >
          <SectionTitle>Section 3: Loan Amortization Schedule</SectionTitle>
          <div
            style={{
              fontSize: 12,
              color: "#10b981",
              fontFamily: "monospace",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Estimated full repayment: Month {fullRepayMonth}
          </div>
          <div
            style={{
              maxHeight: 300,
              overflowY: "auto",
              borderRadius: 6,
              border: "1px solid #1f2937",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  background: "#0d1526",
                  zIndex: 1,
                }}
              >
                <tr style={{ borderBottom: "1px solid #374151" }}>
                  {[
                    "Month",
                    "Beginning Balance",
                    "Principal",
                    "Interest",
                    "Ending Balance",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "7px 12px",
                        textAlign: h === "Month" ? "center" : "right",
                        fontSize: 11,
                        color: "#6b7280",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {amortRows.map((row) => (
                  <tr
                    key={row.month}
                    style={{ borderBottom: "1px solid #1f2937" }}
                  >
                    <td
                      style={{
                        padding: "6px 12px",
                        textAlign: "center",
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: "#6b7280",
                      }}
                    >
                      {row.month}
                    </td>
                    {[
                      row.beginningBalance,
                      row.principal,
                      row.interest,
                      row.endingBalance,
                    ].map((v, i) => (
                      <td
                        key={i}
                        style={{
                          padding: "6px 12px",
                          textAlign: "right",
                          fontFamily: "monospace",
                          fontSize: 13,
                          color:
                            i === 3 && row.endingBalance <= 0.01
                              ? "#10b981"
                              : "#9ca3af",
                        }}
                      >
                        {formatCurrency(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 4: Repayment Narrative */}
      <div
        style={{
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: 10,
          padding: "20px 22px",
        }}
      >
        <SectionTitle>Section 4: Repayment & Return Strategy</SectionTitle>
        <label
          style={{
            fontSize: 12,
            color: "#9ca3af",
            marginBottom: 6,
            display: "block",
          }}
        >
          Describe your plan to repay borrowed funds or provide return to equity
          investors.
        </label>
        <textarea
          value={capitalNeeds.repaymentNarrative}
          onChange={(e) =>
            dispatch({
              type: "SET_CAPITAL_NEEDS",
              payload: { repaymentNarrative: e.target.value },
            })
          }
          placeholder="e.g. Bank loan will be repaid from operating cash flows over 5 years. Equity investors will receive dividends once the business reaches consistent profitability..."
          rows={4}
          style={{
            ...inputStyle,
            width: "100%",
            resize: "vertical",
            fontFamily: "inherit",
            lineHeight: 1.6,
            boxSizing: "border-box",
          }}
        />
      </div>
    </motion.div>
  );
}
