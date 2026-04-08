import React, { useState, useEffect, useRef } from "react";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency, formatPercentRaw } from "../utils/decaUtils";
import type { ValidationResult } from "../types/decaTypes";

// ─── Styles ───────────────────────────────────────────────────────────────────

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

// ─── Common Mistakes Checklist Items ─────────────────────────────────────────

const CHECKLIST_ITEMS = [
  "Cash flow statement included",
  "All numbers reconcile across statements",
  "Market capture < 5% without justification",
  "Month 1 profit justified or showing loss",
  "Every key assumption has a stated source",
  "Hidden costs included (taxes, insurance, processing, legal)",
  "Year 1 income shows monthly breakdown",
  "Capital needs plan includes repayment schedule",
  "Dollar amounts use consistent formatting",
  "Pages numbered; follows DECA outline order",
] as const;

// ─── Score Estimator ──────────────────────────────────────────────────────────

function estimateScore(
  validations: ValidationResult[],
  eventCode: string | null,
): { low: number; high: number; label: string } {
  const errors = validations.filter(
    (v) => !v.passed && v.severity === "error",
  ).length;
  const warnings = validations.filter(
    (v) => !v.passed && v.severity === "warning",
  ).length;
  const total = validations.length;

  if (total === 0) return { low: 5, high: 7, label: "5–7 / 10" };

  if (errors === 0 && warnings === 0)
    return { low: 9, high: 10, label: "9–10 / 10" };
  if (errors === 0 && warnings <= 2)
    return { low: 8, high: 9, label: "8–9 / 10" };
  if (errors <= 1 && warnings <= 3)
    return { low: 7, high: 8, label: "7–8 / 10" };
  if (errors <= 2) return { low: 6, high: 7, label: "6–7 / 10" };
  if (errors <= 4) return { low: 4, high: 6, label: "4–6 / 10" };
  return { low: 2, high: 4, label: "2–4 / 10" };
}

interface CheckStatus {
  label: string;
  done: boolean;
  note?: string;
  isICDC?: boolean;
}

function buildScoreChecks(
  validations: ValidationResult[],
  eventCode: string | null,
): CheckStatus[] {
  const hasPassedId = (id: string) =>
    validations.find((v) => v.id === id)?.passed ?? false;
  const sourcedCount = validations.filter(
    (v) => v.id.includes("source") && v.passed,
  ).length;
  const totalSourceChecks = validations.filter((v) =>
    v.id.includes("source"),
  ).length;

  return [
    { label: "Monthly Income Statement", done: true },
    { label: "Monthly Cash Flow Statement", done: true },
    {
      label: "Balance Sheet (End Yr 1)",
      done: hasPassedId("balance_sheet_balanced"),
    },
    { label: "Three-Year Projection", done: true },
    { label: "Capital Needs Plan", done: true },
    {
      label: "Financial Assumptions Sourced",
      done: totalSourceChecks > 0 && sourcedCount === totalSourceChecks,
      note:
        totalSourceChecks > 0
          ? `${sourcedCount} of ${totalSourceChecks} sourced`
          : undefined,
    },
    { label: "Break-Even Analysis", done: true, isICDC: true },
    {
      label: "Sensitivity Analysis",
      done: true,
      isICDC: true,
    },
    {
      label: "Internal Consistency Check",
      done:
        hasPassedId("balance_sheet_balanced") &&
        !validations.some((v) => !v.passed && v.severity === "error"),
    },
  ];
}

// ─── Validation Group ─────────────────────────────────────────────────────────

interface ValidationGroupProps {
  title: string;
  color: string;
  icon: string;
  items: ValidationResult[];
  defaultOpen?: boolean;
}

function ValidationGroup({
  title,
  color,
  icon,
  items,
  defaultOpen = true,
}: ValidationGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          background: `${color}12`,
          border: `1px solid ${color}40`,
          borderRadius: open ? "8px 8px 0 0" : 8,
          padding: "10px 14px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ color, fontSize: 13, fontWeight: 700, flex: 1 }}>
          {title} ({items.length})
        </span>
        <span style={{ color, fontSize: 12 }}>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div
          style={{
            background: "#0a0f1e",
            border: `1px solid ${color}30`,
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            padding: "4px 0",
          }}
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              style={{
                padding: "8px 14px 8px 36px",
                borderBottom:
                  idx < items.length - 1 ? "1px solid #1f2937" : "none",
                color: "#d1d5db",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {item.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Print Style Injector (no dangerouslySetInnerHTML) ────────────────────────

function PrintStyleInjector() {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.setAttribute("data-deca-print", "true");
    const css = [
      "@media print {",
      "  body > *:not(#deca-print-root) { display: none !important; }",
      "  #deca-print-preview {",
      "    display: block !important;",
      "    font-family: 'Times New Roman', serif;",
      "    font-size: 12pt;",
      "    color: #000;",
      "    background: #fff;",
      "    margin: 1in;",
      "    line-height: 1.5;",
      "  }",
      "  #deca-print-preview table {",
      "    border-collapse: collapse;",
      "    width: 100%;",
      "    margin-bottom: 20pt;",
      "  }",
      "  #deca-print-preview th, #deca-print-preview td {",
      "    border: 1px solid #000;",
      "    padding: 5pt 8pt;",
      "    text-align: left;",
      "  }",
      "  #deca-print-preview th { background: #f0f0f0; font-weight: bold; }",
      "  #deca-print-preview .p-num { text-align: right; font-family: 'Courier New', monospace; }",
      "  #deca-print-preview .p-sec {",
      "    font-size: 14pt; font-weight: bold;",
      "    margin: 20pt 0 8pt; border-bottom: 2pt solid #000; padding-bottom: 4pt;",
      "  }",
      "  #deca-print-preview .p-total td { font-weight: bold; border-top: 2pt solid #000; }",
      "  #deca-print-preview .p-hdr { text-align: center; margin-bottom: 24pt; }",
      "  #deca-print-preview .p-hdr h1 { font-size: 18pt; margin: 0 0 4pt; }",
      "  #deca-print-preview .p-hdr p { margin: 2pt 0; font-size: 11pt; }",
      "}",
    ].join("\n");
    el.textContent = css;
    document.head.appendChild(el);
    styleRef.current = el;
    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, []);

  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Step14_Review() {
  const { state, computed } = useDECA();
  const { eventCode, businessOverview } = state;
  const {
    validations,
    annual,
    balanceSheet,
    incomeMonths,
    cashFlowMonths,
    threeYearProjections,
  } = computed;

  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [passedOpen, setPassedOpen] = useState(false);

  const scoreChecks = buildScoreChecks(validations, eventCode);
  const scoreEstimate = estimateScore(validations, eventCode);

  const errors = validations.filter((v) => !v.passed && v.severity === "error");
  const warnings = validations.filter(
    (v) => !v.passed && v.severity === "warning",
  );
  const passed = validations.filter((v) => v.passed);

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  const scoreColor =
    scoreEstimate.low >= 8
      ? "#10b981"
      : scoreEstimate.low >= 6
        ? "#f59e0b"
        : "#ef4444";

  const monthNames = [
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

  return (
    <div style={{ color: "#f9fafb" }}>
      <PrintStyleInjector />

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
          Final Review & Score Estimator
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
          Validate your financial section, review completeness, and generate
          your printable financial report.
        </p>
      </div>

      {/* DECA Score Estimator Panel */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 16 }}>DECA Score Estimator</div>

        {/* Terminal-style report card */}
        <div
          style={{
            background: "#0a0f1e",
            border: "1px solid #374151",
            borderRadius: 10,
            padding: "20px 24px",
            fontFamily: "'Courier New', monospace",
            fontSize: 13,
            lineHeight: 1.9,
            overflowX: "auto",
          }}
        >
          <div style={{ color: "#60a5fa", marginBottom: 12, fontWeight: 700 }}>
            [{eventCode ?? "DECA"}] Financial Section Score Estimate
          </div>
          <div style={{ color: "#374151", marginBottom: 12 }}>
            {"━".repeat(48)}
          </div>

          {scoreChecks.map((check) => (
            <div
              key={check.label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 4,
                marginBottom: 2,
              }}
            >
              <span
                style={{
                  color: "#9ca3af",
                  whiteSpace: "nowrap",
                  minWidth: 240,
                }}
              >
                {check.label}
              </span>
              <span style={{ color: "#374151", flex: 1 }}>
                {"..........................................................".slice(
                  0,
                  Math.max(4, 48 - check.label.length),
                )}
              </span>
              <span
                style={{
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{check.done ? "✅" : "❌"}</span>
                {check.isICDC && (
                  <span style={{ color: "#d4af37", fontSize: 11 }}>
                    (ICDC Level)
                  </span>
                )}
                {check.note && !check.done && (
                  <span style={{ color: "#f59e0b", fontSize: 11 }}>
                    {check.note}
                  </span>
                )}
              </span>
            </div>
          ))}

          <div style={{ color: "#374151", margin: "12px 0" }}>
            {"━".repeat(48)}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#9ca3af" }}>Estimated Written Score:</span>
            <span
              style={{
                color: scoreColor,
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              {scoreEstimate.label}
            </span>
          </div>

          <div style={{ color: "#374151", marginTop: 12 }}>
            {"━".repeat(48)}
          </div>
          <div style={{ color: "#4b5563", fontSize: 11, marginTop: 8 }}>
            * Estimate based on completion & validation checks. Actual judge
            scoring may vary.
          </div>
        </div>

        {/* Score summary badges */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 14,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: `${scoreColor}18`,
              border: `2px solid ${scoreColor}`,
              borderRadius: 12,
              padding: "12px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#6b7280",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Estimated Score
            </div>
            <div
              style={{
                color: scoreColor,
                fontFamily: "'Courier New', monospace",
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {scoreEstimate.label}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 8 }}>
              {errors.length === 0 && warnings.length === 0
                ? "No critical issues found. Your financials look strong!"
                : errors.length > 0
                  ? `${errors.length} error${errors.length > 1 ? "s" : ""} found — fix before submitting.`
                  : `${warnings.length} warning${warnings.length > 1 ? "s" : ""} — review before submitting.`}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {errors.length > 0 && (
                <span
                  style={{
                    background: "#ef444420",
                    border: "1px solid #ef4444",
                    borderRadius: 6,
                    padding: "3px 10px",
                    color: "#ef4444",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {errors.length} Error{errors.length > 1 ? "s" : ""}
                </span>
              )}
              {warnings.length > 0 && (
                <span
                  style={{
                    background: "#f59e0b20",
                    border: "1px solid #f59e0b",
                    borderRadius: 6,
                    padding: "3px 10px",
                    color: "#f59e0b",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {warnings.length} Warning{warnings.length > 1 ? "s" : ""}
                </span>
              )}
              {passed.length > 0 && (
                <span
                  style={{
                    background: "#10b98120",
                    border: "1px solid #10b981",
                    borderRadius: 6,
                    padding: "3px 10px",
                    color: "#10b981",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {passed.length} Passed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Report */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 16 }}>Validation Report</div>

        {validations.length === 0 ? (
          <div
            style={{
              color: "#6b7280",
              fontSize: 14,
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            No validations available. Complete earlier steps to see your
            validation report.
          </div>
        ) : (
          <>
            <ValidationGroup
              title="Errors — Must Fix"
              color="#ef4444"
              icon="❌"
              items={errors}
              defaultOpen={true}
            />
            <ValidationGroup
              title="Warnings — Review Recommended"
              color="#f59e0b"
              icon="⚠️"
              items={warnings}
              defaultOpen={true}
            />

            {/* Passed section — collapsed by default */}
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => setPassedOpen((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  background: "#10b98112",
                  border: "1px solid #10b98140",
                  borderRadius: passedOpen ? "8px 8px 0 0" : 8,
                  padding: "10px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 16 }}>✅</span>
                <span
                  style={{
                    color: "#10b981",
                    fontSize: 13,
                    fontWeight: 700,
                    flex: 1,
                  }}
                >
                  Passed Checks ({passed.length})
                </span>
                <span style={{ color: "#10b981", fontSize: 12 }}>
                  {passedOpen ? "▾" : "▸"}
                </span>
              </button>
              {passedOpen && (
                <div
                  style={{
                    background: "#0a0f1e",
                    border: "1px solid #10b98130",
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    padding: "4px 0",
                  }}
                >
                  {passed.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "8px 14px 8px 36px",
                        borderBottom:
                          idx < passed.length - 1
                            ? "1px solid #1f2937"
                            : "none",
                        color: "#6b7280",
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Common Mistakes Self-Verification Checklist */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 6 }}>
          Common Mistakes Self-Verification Checklist
        </div>
        <p
          style={{
            color: "#6b7280",
            fontSize: 13,
            marginBottom: 20,
            marginTop: 0,
          }}
        >
          Check each item you have verified in your financial section. Judges
          frequently penalize these common errors.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CHECKLIST_ITEMS.map((item, idx) => {
            const isChecked = !!checkedItems[idx];
            return (
              <label
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 16px",
                  background: isChecked ? "#0d2b14" : "#0a0f1e",
                  border: `1px solid ${isChecked ? "#10b981" : "#374151"}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: `2px solid ${isChecked ? "#10b981" : "#4b5563"}`,
                    background: isChecked ? "#10b981" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {isChecked && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    setCheckedItems((prev) => ({
                      ...prev,
                      [idx]: e.target.checked,
                    }))
                  }
                  style={{ display: "none" }}
                />
                <div>
                  <span
                    style={{
                      color: "#9ca3af",
                      fontSize: 12,
                      marginRight: 6,
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    {idx + 1}.
                  </span>
                  <span
                    style={{
                      color: isChecked ? "#d1fae5" : "#d1d5db",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {item}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            background: "#1f2937",
            borderRadius: 8,
          }}
        >
          <span style={{ color: "#9ca3af", fontSize: 13 }}>
            Self-verification progress
          </span>
          <span
            style={{
              fontFamily: "'Courier New', monospace",
              fontWeight: 700,
              fontSize: 14,
              color:
                checkedCount === CHECKLIST_ITEMS.length ? "#10b981" : "#60a5fa",
            }}
          >
            {checkedCount} / {CHECKLIST_ITEMS.length}
          </span>
        </div>
      </div>

      {/* Generate Financial Section */}
      <div style={{ ...PANEL, textAlign: "center" }}>
        <div
          style={{
            ...LABEL,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Print Financial Section
        </div>
        <p
          style={{
            color: "#6b7280",
            fontSize: 13,
            marginBottom: 20,
            marginTop: 0,
          }}
        >
          Generate a print-ready version of your financial statements formatted
          for DECA submission. All statements are formatted with white
          backgrounds, 12pt font, and standard 1-inch margins.
        </p>
        <button
          onClick={() => window.print()}
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            padding: "14px 36px",
            cursor: "pointer",
            letterSpacing: "0.04em",
            boxShadow: "0 4px 20px #2563eb40",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)")
          }
        >
          Generate Financial Section
        </button>
        <div style={{ color: "#6b7280", fontSize: 11, marginTop: 12 }}>
          Opens print dialog. Select "Save as PDF" to export a digital copy.
        </div>
      </div>

      {/* ── PRINT PREVIEW (hidden on screen, visible only when printing) ── */}
      <div id="deca-print-preview" style={{ display: "none" }}>
        {/* Header */}
        <div className="p-hdr">
          <h1>{businessOverview.businessName || "Business Name"}</h1>
          <p>DECA {eventCode ?? ""} — Written Entry</p>
          <p>Section IX: Detailed Financials</p>
          <p style={{ fontSize: "10pt", marginTop: 6 }}>
            {businessOverview.cityState}&nbsp;|&nbsp;
            {businessOverview.industry}
          </p>
        </div>

        {/* Income Statement — Annual Summary */}
        <div className="p-sec">Annual Income Statement Summary — Year 1</div>
        <table>
          <thead>
            <tr>
              <th>Line Item</th>
              {monthNames.map((m) => (
                <th key={m} style={{ textAlign: "right" }}>
                  {m}
                </th>
              ))}
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                {
                  label: "Total Revenue",
                  key: "totalRevenue" as const,
                  bold: false,
                },
                { label: "COGS", key: "cogs" as const, bold: false },
                {
                  label: "Gross Profit",
                  key: "grossProfit" as const,
                  bold: true,
                },
                {
                  label: "Total Op. Expenses",
                  key: "totalOpEx" as const,
                  bold: false,
                },
                {
                  label: "Operating Income",
                  key: "operatingIncome" as const,
                  bold: true,
                },
                {
                  label: "Net Income",
                  key: "netIncome" as const,
                  bold: true,
                },
              ] as const
            ).map((row) => (
              <tr key={row.label} className={row.bold ? "p-total" : ""}>
                <td style={{ fontWeight: row.bold ? "bold" : "normal" }}>
                  {row.label}
                </td>
                {incomeMonths.map((m, i) => (
                  <td
                    key={i}
                    className="p-num"
                    style={{ fontWeight: row.bold ? "bold" : "normal" }}
                  >
                    {formatCurrency(m[row.key])}
                  </td>
                ))}
                <td className="p-num" style={{ fontWeight: "bold" }}>
                  {formatCurrency(annual[row.key])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Cash Flow Summary */}
        <div className="p-sec">Annual Cash Flow Summary — Year 1</div>
        <table>
          <thead>
            <tr>
              <th>Line Item</th>
              {monthNames.map((m) => (
                <th key={m} style={{ textAlign: "right" }}>
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(
              [
                {
                  label: "Beginning Balance",
                  key: "beginningBalance" as const,
                  bold: false,
                },
                {
                  label: "Total Inflows",
                  key: "totalInflows" as const,
                  bold: false,
                },
                {
                  label: "Total Outflows",
                  key: "totalOutflows" as const,
                  bold: false,
                },
                {
                  label: "Net Cash Flow",
                  key: "netCashFlow" as const,
                  bold: true,
                },
                {
                  label: "Ending Balance",
                  key: "endingBalance" as const,
                  bold: true,
                },
              ] as const
            ).map((row) => (
              <tr key={row.label} className={row.bold ? "p-total" : ""}>
                <td style={{ fontWeight: row.bold ? "bold" : "normal" }}>
                  {row.label}
                </td>
                {cashFlowMonths.map((m, i) => (
                  <td
                    key={i}
                    className="p-num"
                    style={{ fontWeight: row.bold ? "bold" : "normal" }}
                  >
                    {formatCurrency(m[row.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Balance Sheet */}
        <div className="p-sec">Balance Sheet — End of Year 1</div>
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={2}>
                <strong>ASSETS</strong>
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 20 }}>Cash</td>
              <td className="p-num">{formatCurrency(balanceSheet.cash)}</td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 20 }}>Accounts Receivable</td>
              <td className="p-num">
                {formatCurrency(balanceSheet.accountsReceivable)}
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 20 }}>Inventory</td>
              <td className="p-num">
                {formatCurrency(balanceSheet.inventory)}
              </td>
            </tr>
            <tr className="p-total">
              <td>Total Current Assets</td>
              <td className="p-num">
                {formatCurrency(balanceSheet.totalCurrentAssets)}
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 20 }}>Net Equipment</td>
              <td className="p-num">
                {formatCurrency(balanceSheet.netEquipment)}
              </td>
            </tr>
            <tr className="p-total">
              <td>
                <strong>TOTAL ASSETS</strong>
              </td>
              <td className="p-num">
                <strong>{formatCurrency(balanceSheet.totalAssets)}</strong>
              </td>
            </tr>

            <tr>
              <td colSpan={2}>
                <strong>LIABILITIES</strong>
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 20 }}>Accounts Payable</td>
              <td className="p-num">
                {formatCurrency(balanceSheet.accountsPayable)}
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 20 }}>Short-Term Loan</td>
              <td className="p-num">
                {formatCurrency(balanceSheet.shortTermLoanPortion)}
              </td>
            </tr>
            <tr className="p-total">
              <td>Total Current Liabilities</td>
              <td className="p-num">
                {formatCurrency(balanceSheet.totalCurrentLiabilities)}
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 20 }}>Long-Term Debt</td>
              <td className="p-num">
                {formatCurrency(balanceSheet.longTermDebt)}
              </td>
            </tr>
            <tr className="p-total">
              <td>
                <strong>TOTAL LIABILITIES</strong>
              </td>
              <td className="p-num">
                <strong>{formatCurrency(balanceSheet.totalLiabilities)}</strong>
              </td>
            </tr>

            <tr>
              <td colSpan={2}>
                <strong>OWNER'S EQUITY</strong>
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 20 }}>Initial Investment</td>
              <td className="p-num">
                {formatCurrency(balanceSheet.initialInvestment)}
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 20 }}>Retained Earnings</td>
              <td className="p-num">
                {formatCurrency(balanceSheet.retainedEarnings)}
              </td>
            </tr>
            <tr className="p-total">
              <td>
                <strong>TOTAL LIABILITIES &amp; EQUITY</strong>
              </td>
              <td className="p-num">
                <strong>
                  {formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}
                </strong>
              </td>
            </tr>

            <tr>
              <td
                colSpan={2}
                style={{
                  fontSize: "10pt",
                  color: balanceSheet.isBalanced ? "#006400" : "#cc0000",
                  border: "none",
                  paddingTop: 8,
                }}
              >
                {balanceSheet.isBalanced
                  ? "Balance sheet is balanced."
                  : `Difference: ${formatCurrency(Math.abs(balanceSheet.difference))}`}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Three-Year Summary */}
        <div className="p-sec">Three-Year Financial Summary</div>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th style={{ textAlign: "right" }}>Year 1</th>
              <th style={{ textAlign: "right" }}>Year 2</th>
              <th style={{ textAlign: "right" }}>Year 3</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                { label: "Revenue", key: "revenue" as const },
                { label: "Gross Profit", key: "grossProfit" as const },
                { label: "Net Income", key: "netIncome" as const },
              ] as const
            ).map((row) => (
              <tr
                key={row.label}
                className={row.label === "Net Income" ? "p-total" : ""}
              >
                <td>{row.label}</td>
                {threeYearProjections.map((yr, i) => (
                  <td key={i} className="p-num">
                    {formatCurrency(yr[row.key])}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td>Gross Margin %</td>
              {threeYearProjections.map((yr, i) => (
                <td key={i} className="p-num">
                  {formatPercentRaw(yr.grossMarginPct)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Net Margin %</td>
              {threeYearProjections.map((yr, i) => (
                <td key={i} className="p-num">
                  {formatPercentRaw(yr.netMarginPct)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div
          style={{
            textAlign: "center",
            fontSize: "10pt",
            marginTop: 24,
            borderTop: "1pt solid #000",
            paddingTop: 8,
          }}
        >
          Generated by DECA Finance Suite&nbsp;|&nbsp;All projections are
          estimates based on stated assumptions.
        </div>
      </div>
    </div>
  );
}
