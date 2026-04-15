import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency } from "../utils/decaUtils";
import type { StartupCostItem } from "../types/decaTypes";
import {
  blank,
  colHeaders,
  downloadCSV,
  fmtUSD,
  grandTotal as grandTotalRow,
  item,
  meta,
  note,
  rule,
  section,
  type CsvRow,
} from "../../../utils/csvExport";

const CATEGORIES = [
  "Legal & Licensing",
  "Technology",
  "Equipment",
  "Inventory",
  "Marketing",
  "Real Estate",
  "Contingency Reserve",
  "Working Capital",
  "Other",
];

const cellInputStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#f9fafb",
  fontSize: "0.82rem",
  width: "100%",
  padding: "0.375rem 0.5rem",
  borderRadius: "0.3rem",
  transition: "border 0.15s, box-shadow 0.15s",
};

const thStyle: React.CSSProperties = {
  padding: "0.625rem 0.75rem",
  textAlign: "left",
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  borderBottom: "1px solid #1f2937",
  whiteSpace: "nowrap",
};

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function Step3_StartupCosts() {
  const { state, dispatch } = useDECA();
  const items = state.startupCosts.items;
  const assumptions = state.assumptions;

  const [focusedCell, setFocusedCell] = React.useState<string | null>(null);

  const setItems = (newItems: StartupCostItem[]) => {
    dispatch({ type: "SET_STARTUP_COSTS", payload: { items: newItems } });
  };

  const updateItem = (id: string, patch: Partial<StartupCostItem>) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const addRow = () => {
    const newItem: StartupCostItem = {
      id: generateId(),
      category: "Other",
      item: "",
      cost: 0,
      notes: "",
    };
    setItems([...items, newItem]);
  };

  const exportCSV = () => {
    const bizName = state.businessOverview.businessName || "My Business";
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const startupTotal = items.reduce((s, i) => s + (i.cost || 0), 0);

    // Group items by category
    const grouped: Record<string, typeof items> = {};
    for (const cat of CATEGORIES) {
      const catItems = items.filter((i) => i.category === cat);
      if (catItems.length > 0) grouped[cat] = catItems;
    }

    const rows: CsvRow[] = [
      meta("Business Name", bizName),
      meta("Report", "Startup Costs Budget"),
      meta("Phase", "Pre-Launch — One-Time Expenditures"),
      meta("Currency", "USD"),
      meta("Prepared", today),
      blank(),
      colHeaders("Category / Item", "Cost (USD)", "Notes"),
      blank(),
      section("STARTUP COSTS BY CATEGORY"),
      blank(),
    ];

    for (const [cat, catItems] of Object.entries(grouped)) {
      const catTotal = catItems.reduce((s, i) => s + (i.cost || 0), 0);
      rows.push(section(cat));
      for (const it of catItems) {
        rows.push(item(it.item || "(unnamed)", fmtUSD(it.cost), it.notes));
      }
      rows.push(blank());
      rows.push(item("Total " + cat, fmtUSD(catTotal)));
      rows.push(blank());
      rows.push(blank());
    }

    rows.push(rule());
    rows.push(grandTotalRow("TOTAL STARTUP COSTS", fmtUSD(startupTotal)));
    rows.push(blank());
    rows.push(blank());
    rows.push(rule());
    rows.push(section("NOTES"));
    rows.push(note("All figures are one-time pre-launch expenditures in USD."));
    rows.push(
      note(
        "Startup costs should be fully covered by the initial capital raise before revenue begins.",
      ),
    );
    rows.push(
      note("Source: DECA Business Finance Suite — Startup Costs module."),
    );

    downloadCSV("startup_costs.csv", rows);
  };

  // Calculations
  const subtotal = items.reduce((s, i) => s + (i.cost || 0), 0);
  const monthlyOpEx =
    assumptions.monthlyRent +
    assumptions.employeeCountYear1 * assumptions.avgMonthlySalary +
    assumptions.monthlyMarketing +
    assumptions.monthlyTechnology +
    assumptions.monthlyInsurance +
    assumptions.monthlyProfessionalServices;
  const workingCapitalReserve = monthlyOpEx * 3;
  const grandTotal = subtotal + workingCapitalReserve;
  const totalCapital = assumptions.totalStartupCapital;
  const isOverBudget = grandTotal > totalCapital;
  const isFullyFunded = grandTotal <= totalCapital && totalCapital > 0;

  const getCellStyle = (key: string): React.CSSProperties => ({
    ...cellInputStyle,
    border: focusedCell === key ? "1px solid #2563eb" : "1px solid transparent",
    boxShadow: focusedCell === key ? "0 0 0 2px rgba(37,99,235,0.15)" : "none",
  });

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
            Startup Costs
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
            Itemize every pre-launch expense. Judges verify totals match your
            capital plan.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={exportCSV}
            style={{
              background: "transparent",
              border: "1px solid #374151",
              borderRadius: "0.45rem",
              color: "#9ca3af",
              fontSize: "0.8rem",
              padding: "0.5rem 0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#6b7280";
              (e.currentTarget as HTMLButtonElement).style.color = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#374151";
              (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={addRow}
            style={{
              background: "#2563eb",
              border: "none",
              borderRadius: "0.45rem",
              color: "#fff",
              fontSize: "0.82rem",
              fontWeight: 600,
              padding: "0.5rem 1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#2563eb";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Row
          </button>
        </div>
      </div>

      {/* Budget status banner */}
      <AnimatePresence>
        {isOverBudget && (
          <motion.div
            key="over"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: "0.5rem",
              padding: "0.625rem 1rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.82rem",
              color: "#fca5a5",
            }}
          >
            <span>⚠️</span>
            <span>
              Startup costs exceed your capital plan by{" "}
              <strong style={{ fontFamily: "monospace" }}>
                {formatCurrency(grandTotal - totalCapital)}
              </strong>
              . Increase your capital or reduce costs.
            </span>
          </motion.div>
        )}
        {isFullyFunded && !isOverBudget && (
          <motion.div
            key="funded"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.25)",
              borderRadius: "0.5rem",
              padding: "0.625rem 1rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.82rem",
              color: "#6ee7b7",
            }}
          >
            <span>✓</span>
            <span>
              Fully funded — capital surplus of{" "}
              <strong style={{ fontFamily: "monospace" }}>
                {formatCurrency(totalCapital - grandTotal)}
              </strong>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: "0.75rem",
          border: "1px solid #1f2937",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "monospace",
            fontSize: "0.82rem",
          }}
        >
          <thead>
            <tr style={{ background: "#0a0f1e" }}>
              <th style={{ ...thStyle, width: "18%" }}>Category</th>
              <th style={{ ...thStyle, width: "28%" }}>Item</th>
              <th style={{ ...thStyle, width: "14%", textAlign: "right" }}>
                Cost ($)
              </th>
              <th style={{ ...thStyle, width: "32%" }}>Notes</th>
              <th style={{ ...thStyle, width: "8%", textAlign: "center" }}>
                Del
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {items.map((item, idx) => {
                const rowBg = idx % 2 === 0 ? "#111827" : "#0f1629";
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ background: rowBg }}
                  >
                    {/* Category */}
                    <td
                      style={{
                        padding: "0.25rem 0.375rem",
                        borderBottom: "1px solid #1f2937",
                      }}
                    >
                      <select
                        value={item.category}
                        onChange={(e) =>
                          updateItem(item.id, { category: e.target.value })
                        }
                        onFocus={() => setFocusedCell(`${item.id}-cat`)}
                        onBlur={() => setFocusedCell(null)}
                        style={{
                          ...getCellStyle(`${item.id}-cat`),
                          background: rowBg,
                          cursor: "pointer",
                        }}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Item */}
                    <td
                      style={{
                        padding: "0.25rem 0.375rem",
                        borderBottom: "1px solid #1f2937",
                      }}
                    >
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) =>
                          updateItem(item.id, { item: e.target.value })
                        }
                        onFocus={() => setFocusedCell(`${item.id}-item`)}
                        onBlur={() => setFocusedCell(null)}
                        placeholder="Description…"
                        style={getCellStyle(`${item.id}-item`)}
                      />
                    </td>
                    {/* Cost */}
                    <td
                      style={{
                        padding: "0.25rem 0.375rem",
                        borderBottom: "1px solid #1f2937",
                      }}
                    >
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={item.cost}
                        onChange={(e) =>
                          updateItem(item.id, {
                            cost: parseFloat(e.target.value) || 0,
                          })
                        }
                        onFocus={() => setFocusedCell(`${item.id}-cost`)}
                        onBlur={() => setFocusedCell(null)}
                        style={{
                          ...getCellStyle(`${item.id}-cost`),
                          textAlign: "right",
                        }}
                      />
                    </td>
                    {/* Notes */}
                    <td
                      style={{
                        padding: "0.25rem 0.375rem",
                        borderBottom: "1px solid #1f2937",
                      }}
                    >
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) =>
                          updateItem(item.id, { notes: e.target.value })
                        }
                        onFocus={() => setFocusedCell(`${item.id}-notes`)}
                        onBlur={() => setFocusedCell(null)}
                        placeholder="Source or note…"
                        style={getCellStyle(`${item.id}-notes`)}
                      />
                    </td>
                    {/* Delete */}
                    <td
                      style={{
                        padding: "0.25rem 0.375rem",
                        borderBottom: "1px solid #1f2937",
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={() => deleteItem(item.id)}
                        title="Delete row"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#6b7280",
                          padding: "0.25rem",
                          borderRadius: "0.3rem",
                          display: "inline-flex",
                          alignItems: "center",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "#f87171";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "#6b7280";
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "0.82rem",
                  }}
                >
                  No items yet — click "Add Row" to begin.
                </td>
              </tr>
            )}
          </tbody>

          {/* Totals footer */}
          <tfoot>
            <tr
              style={{ background: "#0a0f1e", borderTop: "2px solid #374151" }}
            >
              <td
                colSpan={2}
                style={{
                  padding: "0.625rem 0.75rem",
                  color: "#9ca3af",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                SUBTOTAL (line items)
              </td>
              <td
                style={{
                  padding: "0.625rem 0.75rem",
                  textAlign: "right",
                  color: "#f9fafb",
                  fontWeight: 700,
                }}
              >
                {formatCurrency(subtotal)}
              </td>
              <td colSpan={2} />
            </tr>
            <tr style={{ background: "#0a0f1e" }}>
              <td
                colSpan={2}
                style={{
                  padding: "0.625rem 0.75rem",
                  color: "#9ca3af",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                WORKING CAPITAL RESERVE{" "}
                <span
                  style={{
                    color: "#6b7280",
                    fontWeight: 400,
                    fontSize: "0.7rem",
                  }}
                >
                  (3× monthly OpEx = {formatCurrency(monthlyOpEx)}/mo)
                </span>
              </td>
              <td
                style={{
                  padding: "0.625rem 0.75rem",
                  textAlign: "right",
                  color: "#60a5fa",
                  fontWeight: 700,
                }}
              >
                {formatCurrency(workingCapitalReserve)}
              </td>
              <td colSpan={2} />
            </tr>
            <tr
              style={{
                background: "#0a0f1e",
                borderTop: "1px solid #374151",
              }}
            >
              <td
                colSpan={2}
                style={{
                  padding: "0.75rem 0.75rem",
                  color: "#f9fafb",
                  fontSize: "0.88rem",
                  fontWeight: 800,
                  letterSpacing: "0.03em",
                }}
              >
                GRAND TOTAL
              </td>
              <td
                style={{
                  padding: "0.75rem 0.75rem",
                  textAlign: "right",
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: isOverBudget ? "#f87171" : "#34d399",
                }}
              >
                {formatCurrency(grandTotal)}
              </td>
              <td colSpan={2}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#6b7280",
                    paddingLeft: "0.5rem",
                  }}
                >
                  vs. {formatCurrency(totalCapital)} planned
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Category breakdown */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
              marginBottom: "0.875rem",
            }}
          >
            By Category
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {CATEGORIES.map((cat) => {
              const catTotal = items
                .filter((i) => i.category === cat)
                .reduce((s, i) => s + (i.cost || 0), 0);
              if (catTotal === 0) return null;
              const pct =
                subtotal > 0 ? ((catTotal / subtotal) * 100).toFixed(0) : "0";
              return (
                <div
                  key={cat}
                  style={{
                    background: "#0a0f1e",
                    border: "1px solid #1f2937",
                    borderRadius: "0.4rem",
                    padding: "0.375rem 0.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.15rem",
                    minWidth: "130px",
                  }}
                >
                  <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>
                    {cat}
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#f9fafb",
                    }}
                  >
                    {formatCurrency(catTotal)}
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "#9ca3af" }}>
                    {pct}% of items
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
