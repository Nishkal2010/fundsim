import React from "react";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency } from "../utils/decaUtils";
import type { ImplementationBudgetRow } from "../types/decaTypes";
import {
  blank,
  colHeaders,
  downloadCSV,
  fmtPct,
  fmtUSD,
  grandTotal,
  item,
  meta,
  note,
  rule,
  section,
  subtotal,
  type CsvRow,
} from "../../../utils/csvExport";

// ─── Styles ──────────────────────────────────────────────────────────────────

const PANEL: React.CSSProperties = {
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

const TH: React.CSSProperties = {
  background: "#1f2937",
  color: "#9ca3af",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  padding: "10px 10px",
  textAlign: "left",
  borderBottom: "1px solid #374151",
  whiteSpace: "nowrap",
};

const TD: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #1f2937",
  verticalAlign: "middle",
};

const INPUT: React.CSSProperties = {
  background: "#0a0f1e",
  border: "1px solid #374151",
  borderRadius: 6,
  color: "#f9fafb",
  fontSize: 13,
  padding: "6px 10px",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "'Courier New', monospace",
  outline: "none",
};

const SELECT: React.CSSProperties = {
  ...INPUT,
  cursor: "pointer",
  fontFamily: "inherit",
};

const CATEGORIES = [
  "Marketing",
  "Technology",
  "Personnel",
  "Training",
  "Transportation",
  "Other",
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function rowYear1Total(row: ImplementationBudgetRow): number {
  return row.oneTimeCost + row.monthlyCost * 12;
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportToCSV(
  rows: ImplementationBudgetRow[],
  expectedBenefit: number,
  bizName: string,
): void {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalOneTime = rows.reduce((s, r) => s + r.oneTimeCost, 0);
  const totalMonthly = rows.reduce((s, r) => s + r.monthlyCost, 0);
  const totalYear1 = rows.reduce((s, r) => s + rowYear1Total(r), 0);
  const roi =
    totalYear1 > 0 ? ((expectedBenefit - totalYear1) / totalYear1) * 100 : 0;
  const monthlyBenefit = expectedBenefit / 12;
  const paybackMonths =
    monthlyBenefit > 0 ? Math.ceil(totalYear1 / monthlyBenefit) : null;

  // Group by category
  const CATEGORY_ORDER = [
    "Marketing",
    "Operations",
    "Technology",
    "Human Resources",
    "Customer Experience",
    "Product Development",
    "Training",
    "Compliance & Legal",
    "Other",
  ];
  const grouped: Record<string, ImplementationBudgetRow[]> = {};
  for (const r of rows) {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  }
  const sortedCats = CATEGORY_ORDER.filter((c) => grouped[c]?.length).concat(
    Object.keys(grouped).filter(
      (c) => !CATEGORY_ORDER.includes(c) && grouped[c]?.length,
    ),
  );

  const csvRows: CsvRow[] = [
    // ── Metadata ─────────────────────────────────────
    meta("Business Name", bizName),
    meta("Report", "Implementation Budget — Strategic Plan"),
    meta("Period", "Year 1"),
    meta("Currency", "USD"),
    meta("Prepared", today),
    blank(),
    colHeaders(
      "Strategic Activity",
      "Category",
      "One-Time Cost (USD)",
      "Monthly Cost (USD)",
      "Year 1 Total (USD)",
      "Notes",
    ),
    blank(),
    section("IMPLEMENTATION ACTIVITIES BY CATEGORY"),
    blank(),
  ];

  for (const cat of sortedCats) {
    const catRows = grouped[cat];
    const catOneTime = catRows.reduce((s, r) => s + r.oneTimeCost, 0);
    const catMonthly = catRows.reduce((s, r) => s + r.monthlyCost, 0);
    const catYear1 = catRows.reduce((s, r) => s + rowYear1Total(r), 0);

    csvRows.push(section(cat));
    for (const r of catRows) {
      csvRows.push(
        item(
          r.activity || "(unnamed)",
          r.category,
          fmtUSD(r.oneTimeCost),
          fmtUSD(r.monthlyCost),
          fmtUSD(rowYear1Total(r)),
          r.notes,
        ),
      );
    }
    csvRows.push(blank());
    csvRows.push(
      subtotal(
        "  Total " + cat,
        "",
        fmtUSD(catOneTime),
        fmtUSD(catMonthly),
        fmtUSD(catYear1),
        "",
      ),
    );
    csvRows.push(blank());
    csvRows.push(blank());
  }

  csvRows.push(rule());
  csvRows.push(
    grandTotal(
      "TOTALS",
      "",
      fmtUSD(totalOneTime),
      fmtUSD(totalMonthly),
      fmtUSD(totalYear1),
      "",
    ),
  );
  csvRows.push(blank());
  csvRows.push(blank());

  // ── ROI Analysis ───────────────────────────────────
  csvRows.push(rule());
  csvRows.push(section("ROI ANALYSIS"));
  csvRows.push(item("Year 1 Total Implementation Cost", fmtUSD(totalYear1)));
  csvRows.push(item("Expected Annual Benefit", fmtUSD(expectedBenefit)));
  csvRows.push(
    item("Net Benefit (Benefit − Cost)", fmtUSD(expectedBenefit - totalYear1)),
  );
  csvRows.push(item("Return on Investment (ROI)", fmtPct(roi)));
  csvRows.push(item("Monthly Benefit", fmtUSD(monthlyBenefit)));
  csvRows.push(
    item(
      "Estimated Payback Period",
      paybackMonths != null ? `${paybackMonths} months` : "N/A",
    ),
  );
  csvRows.push(blank());
  csvRows.push(blank());

  // ── Notes ──────────────────────────────────────────
  csvRows.push(rule());
  csvRows.push(section("NOTES"));
  csvRows.push(note("Year 1 Total = One-Time Cost + (Monthly Cost × 12)."));
  csvRows.push(
    note("ROI = (Expected Benefit − Year 1 Cost) / Year 1 Cost × 100%."),
  );
  csvRows.push(
    note(
      "Payback period assumes monthly benefit is received evenly throughout the year.",
    ),
  );
  csvRows.push(
    note("Source: DECA Business Finance Suite — Implementation Budget module."),
  );

  downloadCSV("implementation_budget.csv", csvRows);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Step11_ImplementationBudget() {
  const { state, dispatch } = useDECA();
  const { implementationBudget } = state;
  const { rows, expectedBenefit, roiNarrative } = implementationBudget;

  const totalOneTime = rows.reduce((s, r) => s + r.oneTimeCost, 0);
  const totalMonthly = rows.reduce((s, r) => s + r.monthlyCost, 0);
  const totalYear1 = rows.reduce((s, r) => s + rowYear1Total(r), 0);

  const roi =
    totalYear1 > 0 ? ((expectedBenefit - totalYear1) / totalYear1) * 100 : 0;
  const monthlyBenefit = expectedBenefit / 12;
  const paybackMonths =
    monthlyBenefit > 0 ? totalYear1 / monthlyBenefit : Infinity;

  const roiColor = roi > 100 ? "#10b981" : roi >= 0 ? "#f59e0b" : "#ef4444";

  // ── Row mutators ────────────────────────────────────────────────────────────

  function updateRow(id: string, patch: Partial<ImplementationBudgetRow>) {
    dispatch({
      type: "SET_IMPL_BUDGET",
      payload: {
        rows: rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      },
    });
  }

  function addRow() {
    const newRow: ImplementationBudgetRow = {
      id: genId(),
      activity: "",
      category: "Marketing",
      oneTimeCost: 0,
      monthlyCost: 0,
      notes: "",
    };
    dispatch({ type: "SET_IMPL_BUDGET", payload: { rows: [...rows, newRow] } });
  }

  function deleteRow(id: string) {
    dispatch({
      type: "SET_IMPL_BUDGET",
      payload: { rows: rows.filter((r) => r.id !== id) },
    });
  }

  return (
    <div style={{ color: "#f9fafb" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            color: "#f9fafb",
            marginBottom: 8,
          }}
        >
          Implementation Budget
        </h2>
        <div
          style={{
            background: "#1c1a08",
            border: "1px solid #854d0e",
            borderRadius: 8,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ color: "#f59e0b", fontSize: 16 }}>⚠</span>
          <span style={{ color: "#fcd34d", fontSize: 13 }}>
            This section is specific to <strong>BOR/FOR</strong> events.
            Business Operations Research and Finance Operations Research require
            an itemized implementation budget with ROI analysis.
          </span>
        </div>
      </div>

      {/* Budget Table */}
      <div style={PANEL}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={LABEL}>Strategic Activity Budget</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() =>
                exportToCSV(
                  rows,
                  expectedBenefit,
                  state.businessOverview.businessName || "My Business",
                )
              }
              style={{
                background: "transparent",
                border: "1px solid #374151",
                borderRadius: 7,
                color: "#9ca3af",
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.color = "#60a5fa";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#374151";
                e.currentTarget.style.color = "#9ca3af";
              }}
            >
              ↓ Export CSV
            </button>
            <button
              onClick={addRow}
              style={{
                background: "#2563eb",
                border: "none",
                borderRadius: 7,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 14px",
                cursor: "pointer",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#1d4ed8")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
            >
              + Add Row
            </button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}
          >
            <thead>
              <tr>
                <th style={{ ...TH, width: "22%" }}>Strategic Activity</th>
                <th style={{ ...TH, width: "13%" }}>Category</th>
                <th style={{ ...TH, width: "12%", textAlign: "right" }}>
                  One-Time Cost
                </th>
                <th style={{ ...TH, width: "12%", textAlign: "right" }}>
                  Monthly Cost
                </th>
                <th style={{ ...TH, width: "13%", textAlign: "right" }}>
                  Year 1 Total
                </th>
                <th style={{ ...TH, width: "20%" }}>Notes</th>
                <th style={{ ...TH, width: "4%", textAlign: "center" }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={TD}>
                    <input
                      style={INPUT}
                      value={row.activity}
                      placeholder="Activity name..."
                      onChange={(e) =>
                        updateRow(row.id, { activity: e.target.value })
                      }
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "#2563eb")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = "#374151")
                      }
                    />
                  </td>
                  <td style={TD}>
                    <select
                      style={SELECT}
                      value={row.category}
                      onChange={(e) =>
                        updateRow(row.id, { category: e.target.value })
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={TD}>
                    <input
                      style={{ ...INPUT, textAlign: "right" }}
                      type="number"
                      min={0}
                      value={row.oneTimeCost || ""}
                      placeholder="0"
                      onChange={(e) =>
                        updateRow(row.id, {
                          oneTimeCost: parseFloat(e.target.value) || 0,
                        })
                      }
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "#2563eb")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = "#374151")
                      }
                    />
                  </td>
                  <td style={TD}>
                    <input
                      style={{ ...INPUT, textAlign: "right" }}
                      type="number"
                      min={0}
                      value={row.monthlyCost || ""}
                      placeholder="0"
                      onChange={(e) =>
                        updateRow(row.id, {
                          monthlyCost: parseFloat(e.target.value) || 0,
                        })
                      }
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "#2563eb")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = "#374151")
                      }
                    />
                  </td>
                  <td style={{ ...TD, textAlign: "right" }}>
                    <span
                      style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: 13,
                        color: "#f9fafb",
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(rowYear1Total(row))}
                    </span>
                  </td>
                  <td style={TD}>
                    <input
                      style={INPUT}
                      value={row.notes}
                      placeholder="Notes..."
                      onChange={(e) =>
                        updateRow(row.id, { notes: e.target.value })
                      }
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "#2563eb")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = "#374151")
                      }
                    />
                  </td>
                  <td style={{ ...TD, textAlign: "center" }}>
                    <button
                      onClick={() => deleteRow(row.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#6b7280",
                        cursor: "pointer",
                        fontSize: 16,
                        padding: "2px 6px",
                        borderRadius: 4,
                        lineHeight: 1,
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#ef4444")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#6b7280")
                      }
                      title="Delete row"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      ...TD,
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "24px",
                      borderBottom: "none",
                    }}
                  >
                    No budget rows yet. Click "+ Add Row" to get started.
                  </td>
                </tr>
              )}
              {/* Totals row */}
              {rows.length > 0 && (
                <tr style={{ background: "#1f2937" }}>
                  <td
                    colSpan={2}
                    style={{
                      ...TD,
                      borderTop: "2px solid #374151",
                      borderBottom: "none",
                      color: "#f9fafb",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    TOTALS
                  </td>
                  <td
                    style={{
                      ...TD,
                      borderTop: "2px solid #374151",
                      borderBottom: "none",
                      textAlign: "right",
                      fontFamily: "'Courier New', monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#f9fafb",
                    }}
                  >
                    {formatCurrency(totalOneTime)}
                  </td>
                  <td
                    style={{
                      ...TD,
                      borderTop: "2px solid #374151",
                      borderBottom: "none",
                      textAlign: "right",
                      fontFamily: "'Courier New', monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#f9fafb",
                    }}
                  >
                    {formatCurrency(totalMonthly)}
                  </td>
                  <td
                    style={{
                      ...TD,
                      borderTop: "2px solid #374151",
                      borderBottom: "none",
                      textAlign: "right",
                      fontFamily: "'Courier New', monospace",
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#60a5fa",
                    }}
                  >
                    {formatCurrency(totalYear1)}
                  </td>
                  <td
                    colSpan={2}
                    style={{
                      ...TD,
                      borderTop: "2px solid #374151",
                      borderBottom: "none",
                    }}
                  />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROI Calculator */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 20 }}>ROI Calculator</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: 24,
          }}
        >
          {/* Left: inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ ...LABEL, display: "block", marginBottom: 6 }}>
                Expected Revenue / Cost Savings ($)
              </label>
              <input
                type="number"
                min={0}
                value={expectedBenefit || ""}
                placeholder="0"
                onChange={(e) =>
                  dispatch({
                    type: "SET_IMPL_BUDGET",
                    payload: {
                      expectedBenefit: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                style={{ ...INPUT, fontSize: 15 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")}
              />
              <div style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>
                Annual benefit expected from this initiative
              </div>
            </div>
            <div>
              <label style={{ ...LABEL, display: "block", marginBottom: 6 }}>
                Total Implementation Cost (auto)
              </label>
              <div
                style={{
                  ...INPUT,
                  color: "#60a5fa",
                  background: "#1f2937",
                  border: "1px solid #374151",
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {formatCurrency(totalYear1)}
              </div>
              <div style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>
                Calculated from budget table above
              </div>
            </div>
          </div>

          {/* Right: ROI badge + payback */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#0a0f1e",
                border: `2px solid ${roiColor}`,
                borderRadius: 12,
                padding: "20px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Return on Investment
              </div>
              <div
                style={{
                  color: roiColor,
                  fontFamily: "'Courier New', monospace",
                  fontSize: 38,
                  fontWeight: 800,
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {isFinite(roi)
                  ? `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`
                  : "N/A"}
              </div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>
                {roi > 100
                  ? "Excellent return — exceeds 100%"
                  : roi >= 0
                    ? "Positive return — 0–100%"
                    : "Negative return — cost exceeds benefit"}
              </div>
            </div>

            <div
              style={{
                background: "#1f2937",
                borderRadius: 10,
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Payback Period
                </div>
                <div
                  style={{
                    color: "#f9fafb",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 18,
                    fontWeight: 700,
                    marginTop: 2,
                  }}
                >
                  {isFinite(paybackMonths) && paybackMonths > 0
                    ? `${paybackMonths.toFixed(1)} months`
                    : monthlyBenefit <= 0
                      ? "No monthly benefit"
                      : "N/A"}
                </div>
              </div>
              <div style={{ fontSize: 28 }}>📅</div>
            </div>
          </div>
        </div>

        {/* ROI Narrative */}
        <div>
          <label style={{ ...LABEL, display: "block", marginBottom: 8 }}>
            ROI Narrative
          </label>
          <textarea
            value={roiNarrative}
            onChange={(e) =>
              dispatch({
                type: "SET_IMPL_BUDGET",
                payload: { roiNarrative: e.target.value },
              })
            }
            placeholder="Describe how this implementation budget will generate the expected return. Explain your methodology, timeline, and key assumptions behind the projected benefit..."
            rows={5}
            style={{
              ...INPUT,
              fontFamily: "inherit",
              lineHeight: 1.6,
              resize: "vertical",
              fontSize: 14,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")}
          />
        </div>
      </div>

      {/* ROI Color Key */}
      <div
        style={{
          background: "#111827",
          border: "1px solid #1f2937",
          borderRadius: 10,
          padding: "14px 20px",
        }}
      >
        <div style={{ ...LABEL, marginBottom: 10 }}>
          ROI Benchmark Reference
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            {
              label: "ROI > 100%",
              desc: "Exceptional — strong justification for initiative",
              color: "#10b981",
            },
            {
              label: "ROI 0–100%",
              desc: "Acceptable — positive but modest return",
              color: "#f59e0b",
            },
            {
              label: "ROI < 0%",
              desc: "Negative — costs exceed projected benefit",
              color: "#ef4444",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: item.color,
                  flexShrink: 0,
                }}
              />
              <div>
                <span
                  style={{ color: item.color, fontSize: 13, fontWeight: 700 }}
                >
                  {item.label}
                </span>
                <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 6 }}>
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
