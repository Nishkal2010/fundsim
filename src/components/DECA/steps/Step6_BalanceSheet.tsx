import React from "react";
import { motion } from "framer-motion";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency } from "../utils/decaUtils";

const monoStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: 13,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#9ca3af",
  padding: "5px 0",
};

const boldLabelStyle: React.CSSProperties = {
  ...labelStyle,
  color: "#f9fafb",
  fontWeight: 700,
};

const totalLabelStyle: React.CSSProperties = {
  ...boldLabelStyle,
  fontSize: 15,
  color: "#60a5fa",
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#60a5fa",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "12px 0 4px",
};

function BSRow({
  label,
  value,
  bold,
  totalRow,
  indent,
  editable,
  onEdit,
}: {
  label: string;
  value: number;
  bold?: boolean;
  totalRow?: boolean;
  indent?: boolean;
  editable?: boolean;
  onEdit?: (val: number) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [raw, setRaw] = React.useState(String(value));

  const labelSt: React.CSSProperties = totalRow
    ? totalLabelStyle
    : bold
      ? boldLabelStyle
      : { ...labelStyle, paddingLeft: indent ? 16 : 0 };

  const valueSt: React.CSSProperties = {
    ...monoStyle,
    textAlign: "right",
    color: totalRow ? "#60a5fa" : bold ? "#f9fafb" : "#9ca3af",
    fontWeight: totalRow || bold ? 700 : 400,
    fontSize: totalRow ? 15 : 13,
  };

  const handleBlur = () => {
    setEditing(false);
    const parsed = parseFloat(raw);
    if (!isNaN(parsed) && onEdit) onEdit(parsed);
    else setRaw(String(value));
  };

  return (
    <tr
      style={{
        borderBottom:
          bold || totalRow ? "1px solid #374151" : "1px solid #1f2937",
        background: totalRow ? "rgba(37,99,235,0.06)" : "transparent",
      }}
    >
      <td style={labelSt}>{label}</td>
      <td style={valueSt}>
        {editable && editing ? (
          <input
            autoFocus
            type="number"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onBlur={handleBlur}
            style={{
              background: "#1f2937",
              border: "1px solid #2563eb",
              borderRadius: 4,
              color: "#f9fafb",
              fontFamily: "monospace",
              fontSize: 13,
              padding: "2px 6px",
              width: 120,
              textAlign: "right",
            }}
          />
        ) : (
          <span
            style={{ cursor: editable ? "pointer" : "default" }}
            onClick={() => {
              if (editable) {
                setRaw(String(value));
                setEditing(true);
              }
            }}
            title={editable ? "Click to edit" : undefined}
          >
            {formatCurrency(value)}
            {editable && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 10,
                  color: "#2563eb",
                  opacity: 0.7,
                }}
              >
                ✎
              </span>
            )}
          </span>
        )}
      </td>
    </tr>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={2} style={sectionHeaderStyle}>
        {label}
      </td>
    </tr>
  );
}

function Spacer() {
  return (
    <tr>
      <td colSpan={2} style={{ padding: 6 }} />
    </tr>
  );
}

export function Step6_BalanceSheet() {
  const { computed, dispatch } = useDECA();
  const bs = computed.balanceSheet;

  const patchOverride = (
    field:
      | "accountsReceivable"
      | "inventory"
      | "prepaidExpenses"
      | "otherLongTermAssets"
      | "accountsPayable"
      | "accruedExpenses",
    val: number,
  ) => dispatch({ type: "SET_BS_OVERRIDES", payload: { [field]: val } });

  const exportBalanceSheetCSV = () => {
    const rows: [string, string][] = [
      ["Field", "Value"],
      ["ASSETS", ""],
      ["Cash", String(bs.cash)],
      ["Accounts Receivable", String(bs.accountsReceivable)],
      ["Inventory", String(bs.inventory)],
      ["Prepaid Expenses", String(bs.prepaidExpenses)],
      ["Total Current Assets", String(bs.totalCurrentAssets)],
      ["Equipment (Gross)", String(bs.equipmentGross)],
      ["Accumulated Depreciation", String(bs.accumulatedDepreciation)],
      ["Net Equipment", String(bs.netEquipment)],
      ["Other Long-Term Assets", String(bs.otherLongTermAssets)],
      ["Total Long-Term Assets", String(bs.totalLongTermAssets)],
      ["TOTAL ASSETS", String(bs.totalAssets)],
      ["", ""],
      ["LIABILITIES", ""],
      ["Accounts Payable", String(bs.accountsPayable)],
      ["Short-Term Loan Portion", String(bs.shortTermLoanPortion)],
      ["Accrued Expenses", String(bs.accruedExpenses)],
      ["Total Current Liabilities", String(bs.totalCurrentLiabilities)],
      ["Long-Term Debt", String(bs.longTermDebt)],
      ["Total Long-Term Liabilities", String(bs.totalLongTermLiabilities)],
      ["Total Liabilities", String(bs.totalLiabilities)],
      ["", ""],
      ["EQUITY", ""],
      ["Initial Investment", String(bs.initialInvestment)],
      ["Retained Earnings", String(bs.retainedEarnings)],
      ["Total Owner Equity", String(bs.totalOwnerEquity)],
      ["TOTAL LIABILITIES + EQUITY", String(bs.totalLiabilitiesAndEquity)],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "balance_sheet.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "24px 0", color: "#f9fafb" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#f9fafb",
              margin: 0,
            }}
          >
            Balance Sheet
          </h2>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
            As of End of Year 1 — Editable fields marked with ✎
          </p>
        </div>
        <button
          onClick={exportBalanceSheetCSV}
          style={{
            background: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "0.45rem",
            padding: "0.4rem 0.875rem",
            fontSize: "0.78rem",
            color: "#9ca3af",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ↓ Export CSV
        </button>
      </div>

      {/* Balance Check Banner */}
      <div
        style={{
          background: bs.isBalanced
            ? "rgba(16,185,129,0.1)"
            : "rgba(239,68,68,0.1)",
          border: `1px solid ${bs.isBalanced ? "#10b981" : "#ef4444"}`,
          borderRadius: 8,
          padding: "12px 20px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 20 }}>{bs.isBalanced ? "✅" : "❌"}</span>
        <div>
          {bs.isBalanced ? (
            <span style={{ color: "#10b981", fontWeight: 600 }}>
              Balance Sheet Balanced. Assets = Liabilities + Equity ={" "}
              <span style={{ fontFamily: "monospace" }}>
                {formatCurrency(bs.totalAssets)}
              </span>
            </span>
          ) : (
            <span style={{ color: "#ef4444", fontWeight: 600 }}>
              BALANCE SHEET DOES NOT BALANCE. Difference:{" "}
              <span style={{ fontFamily: "monospace" }}>
                {formatCurrency(Math.abs(bs.difference))}
              </span>
              . Check retained earnings and loan balances.
            </span>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* ASSETS */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: 10,
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#f9fafb",
              marginBottom: 8,
              borderBottom: "2px solid #2563eb",
              paddingBottom: 8,
            }}
          >
            ASSETS
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <SectionHeader label="Current Assets" />
              <BSRow label="Cash" value={bs.cash} indent />
              <BSRow
                label="Accounts Receivable"
                value={bs.accountsReceivable}
                indent
                editable
                onEdit={(v) => patchOverride("accountsReceivable", v)}
              />
              <BSRow
                label="Inventory"
                value={bs.inventory}
                indent
                editable
                onEdit={(v) => patchOverride("inventory", v)}
              />
              <BSRow
                label="Prepaid Expenses"
                value={bs.prepaidExpenses}
                indent
                editable
                onEdit={(v) => patchOverride("prepaidExpenses", v)}
              />
              <BSRow
                label="Total Current Assets"
                value={bs.totalCurrentAssets}
                bold
              />

              <Spacer />
              <SectionHeader label="Long-Term Assets" />
              <BSRow
                label="Equipment (Gross)"
                value={bs.equipmentGross}
                indent
              />
              <BSRow
                label="Less: Accumulated Depreciation"
                value={-bs.accumulatedDepreciation}
                indent
              />
              <BSRow
                label="Net Equipment"
                value={bs.netEquipment}
                indent
                bold
              />
              <BSRow
                label="Other Long-Term Assets"
                value={bs.otherLongTermAssets}
                indent
                editable
                onEdit={(v) => patchOverride("otherLongTermAssets", v)}
              />
              <BSRow
                label="Total Long-Term Assets"
                value={bs.totalLongTermAssets}
                bold
              />

              <Spacer />
              <BSRow label="TOTAL ASSETS" value={bs.totalAssets} totalRow />
            </tbody>
          </table>
        </div>

        {/* LIABILITIES + EQUITY */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: 10,
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#f9fafb",
              marginBottom: 8,
              borderBottom: "2px solid #d4af37",
              paddingBottom: 8,
            }}
          >
            LIABILITIES + EQUITY
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <SectionHeader label="Current Liabilities" />
              <BSRow
                label="Accounts Payable"
                value={bs.accountsPayable}
                indent
                editable
                onEdit={(v) => patchOverride("accountsPayable", v)}
              />
              <BSRow
                label="Short-Term Loan Portion"
                value={bs.shortTermLoanPortion}
                indent
              />
              <BSRow
                label="Accrued Expenses"
                value={bs.accruedExpenses}
                indent
                editable
                onEdit={(v) => patchOverride("accruedExpenses", v)}
              />
              <BSRow
                label="Total Current Liabilities"
                value={bs.totalCurrentLiabilities}
                bold
              />

              <Spacer />
              <SectionHeader label="Long-Term Liabilities" />
              <BSRow label="Long-Term Debt" value={bs.longTermDebt} indent />
              <BSRow
                label="Total Long-Term Liabilities"
                value={bs.totalLongTermLiabilities}
                bold
              />

              <Spacer />
              <BSRow
                label="TOTAL LIABILITIES"
                value={bs.totalLiabilities}
                bold
              />

              <Spacer />
              <SectionHeader label="Owner's Equity" />
              <BSRow
                label="Initial Investment"
                value={bs.initialInvestment}
                indent
              />
              <BSRow
                label="Retained Earnings (Net Income)"
                value={bs.retainedEarnings}
                indent
              />
              <BSRow
                label="Total Owner's Equity"
                value={bs.totalOwnerEquity}
                bold
              />

              <Spacer />
              <BSRow
                label="TOTAL LIABILITIES + EQUITY"
                value={bs.totalLiabilitiesAndEquity}
                totalRow
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit hint */}
      <p
        style={{
          marginTop: 16,
          color: "#6b7280",
          fontSize: 12,
          textAlign: "center",
        }}
      >
        Click any ✎ value to override. Cash and loan figures are auto-computed
        from prior steps.
      </p>
    </motion.div>
  );
}
