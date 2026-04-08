import React from "react";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency, formatPercentRaw } from "../utils/decaUtils";

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

const INPUT: React.CSSProperties = {
  background: "#0a0f1e",
  border: "1px solid #374151",
  borderRadius: 6,
  color: "#f9fafb",
  fontSize: 13,
  padding: "8px 12px",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "'Courier New', monospace",
  outline: "none",
};

const TEXTAREA: React.CSSProperties = {
  ...INPUT,
  fontFamily: "inherit",
  lineHeight: 1.6,
  resize: "vertical",
  fontSize: 14,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  min?: number;
}

function NumberField({
  label,
  value,
  onChange,
  prefix = "$",
  suffix,
  hint,
  min = 0,
}: NumberFieldProps) {
  return (
    <div>
      <label style={{ ...LABEL, display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6b7280",
              fontSize: 13,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={min}
          value={value || ""}
          placeholder="0"
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={{
            ...INPUT,
            paddingLeft: prefix ? 22 : 12,
            paddingRight: suffix ? 40 : 12,
            textAlign: "right",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")}
        />
        {suffix && (
          <span
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6b7280",
              fontSize: 12,
              pointerEvents: "none",
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <div style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  labelYes?: string;
  labelNo?: string;
}

function Toggle({
  value,
  onChange,
  labelYes = "Yes",
  labelNo = "No",
}: ToggleProps) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[false, true].map((opt) => {
        const isSelected = value === opt;
        const color = opt ? "#10b981" : "#ef4444";
        return (
          <button
            key={String(opt)}
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              padding: "8px 14px",
              borderRadius: 7,
              border: `2px solid ${isSelected ? color : "#374151"}`,
              background: isSelected ? `${color}18` : "transparent",
              color: isSelected ? color : "#6b7280",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {opt ? labelYes : labelNo}
          </button>
        );
      })}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon?: string;
}

function KpiCard({ label, value, sub, color = "#60a5fa", icon }: KpiCardProps) {
  return (
    <div
      style={{
        background: "#0a0f1e",
        border: `1px solid ${color}33`,
        borderRadius: 10,
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            color: "#6b7280",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      </div>
      <div
        style={{
          color,
          fontFamily: "'Courier New', monospace",
          fontSize: 22,
          fontWeight: 800,
          marginTop: 8,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ color: "#6b7280", fontSize: 11, marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Step13_CurrentFinancials() {
  const { state, dispatch } = useDECA();
  const { currentFinancials } = state;

  const cf = currentFinancials;

  function set<K extends keyof typeof cf>(key: K, value: (typeof cf)[K]) {
    dispatch({ type: "SET_CURRENT_FINANCIALS", payload: { [key]: value } });
  }

  // Derived calculations
  const currentMonthlyNetIncome =
    cf.currentMonthlyRevenue - cf.currentMonthlyExpenses;
  const profitMarginPct =
    cf.currentMonthlyRevenue > 0
      ? (currentMonthlyNetIncome / cf.currentMonthlyRevenue) * 100
      : 0;

  const totalFixedOverhead =
    cf.fixedOverheadRent +
    cf.fixedOverheadUtilities +
    cf.fixedOverheadInsurance +
    cf.fixedOverheadSubscriptions +
    cf.fixedOverheadOther;

  const monthlyBurnRate = cf.currentMonthlyExpenses;
  const runwayMonths =
    monthlyBurnRate > 0 && cf.currentMonthlyRevenue < cf.currentMonthlyExpenses
      ? cf.currentCashOnHand / (monthlyBurnRate - cf.currentMonthlyRevenue)
      : cf.currentMonthlyRevenue >= cf.currentMonthlyExpenses
        ? Infinity
        : 0;

  const expansionTotalNewSalaries = cf.expansionRequiresHiring
    ? cf.expansionHiringCount * cf.expansionSalaries
    : 0;

  const netIncomeColor =
    currentMonthlyNetIncome > 0
      ? "#10b981"
      : currentMonthlyNetIncome < 0
        ? "#ef4444"
        : "#9ca3af";

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
          Current Financials
        </h2>
        <div
          style={{
            background: "#1c0e08",
            border: "1px solid #9a3412",
            borderRadius: 8,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ color: "#f97316", fontSize: 16 }}>📊</span>
          <span style={{ color: "#fdba74", fontSize: 13 }}>
            <strong>EBG requires REAL financial data</strong> from your existing
            student-owned business. Do not use projected figures in this section
            — enter your actual current financial data.
          </span>
        </div>
      </div>

      {/* Current Financial Status */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 20 }}>
          Current Financial Status
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            marginBottom: 20,
          }}
        >
          <NumberField
            label="Current Monthly Revenue (Actual)"
            value={cf.currentMonthlyRevenue}
            onChange={(v) => set("currentMonthlyRevenue", v)}
            hint="Your actual average monthly revenue"
          />
          <NumberField
            label="Current Monthly Expenses (Actual)"
            value={cf.currentMonthlyExpenses}
            onChange={(v) => set("currentMonthlyExpenses", v)}
            hint="Your actual average monthly expenses"
          />
        </div>

        {/* Net Income display */}
        <div
          style={{
            background: "#0a0f1e",
            border: `2px solid ${netIncomeColor}`,
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                color: "#9ca3af",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Current Monthly Net Income
            </div>
            <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
              Auto-calculated: Revenue − Expenses
            </div>
          </div>
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 28,
              fontWeight: 800,
              color: netIncomeColor,
            }}
          >
            {currentMonthlyNetIncome >= 0 ? "" : "-"}
            {formatCurrency(Math.abs(currentMonthlyNetIncome))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            marginBottom: 20,
          }}
        >
          <NumberField
            label="Months in Operation"
            value={cf.monthsOperating}
            onChange={(v) => set("monthsOperating", v)}
            prefix=""
            suffix="mos"
            hint="How long has the business been running?"
          />
          <NumberField
            label="Total Revenue to Date"
            value={cf.totalRevenueToDate}
            onChange={(v) => set("totalRevenueToDate", v)}
            hint="Cumulative revenue since founding"
          />
          <NumberField
            label="Current Cash on Hand"
            value={cf.currentCashOnHand}
            onChange={(v) => set("currentCashOnHand", v)}
            hint="Available cash / bank balance right now"
          />
          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 6 }}>
              Has Existing Debt?
            </label>
            <Toggle
              value={cf.hasExistingDebt}
              onChange={(v) => set("hasExistingDebt", v)}
            />
          </div>
        </div>

        {cf.hasExistingDebt && (
          <NumberField
            label="Existing Debt Amount"
            value={cf.existingDebtAmount}
            onChange={(v) => set("existingDebtAmount", v)}
            hint="Total outstanding debt balance"
          />
        )}
      </div>

      {/* Fixed Overhead Table */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 6 }}>
          Fixed Overhead (Monthly)
        </div>
        <p
          style={{
            color: "#6b7280",
            fontSize: 13,
            marginBottom: 20,
            marginTop: 0,
          }}
        >
          Enter your actual monthly fixed costs. These are costs that remain
          constant regardless of revenue.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {(
            [
              { key: "fixedOverheadRent", label: "Rent / Lease" },
              { key: "fixedOverheadUtilities", label: "Utilities" },
              { key: "fixedOverheadInsurance", label: "Insurance" },
              { key: "fixedOverheadSubscriptions", label: "Subscriptions" },
              { key: "fixedOverheadOther", label: "Other Fixed" },
            ] as const
          ).map(({ key, label }, idx, arr) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 0",
                borderBottom:
                  idx < arr.length - 1 ? "1px solid #1f2937" : "none",
                gap: 20,
              }}
            >
              <div style={{ color: "#d1d5db", fontSize: 14, minWidth: 180 }}>
                {label}
              </div>
              <div style={{ width: 200, flexShrink: 0 }}>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6b7280",
                      fontSize: 13,
                      pointerEvents: "none",
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={cf[key] || ""}
                    placeholder="0"
                    onChange={(e) => set(key, parseFloat(e.target.value) || 0)}
                    style={{ ...INPUT, paddingLeft: 22, textAlign: "right" }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#2563eb")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#374151")
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0 4px",
              borderTop: "2px solid #374151",
              marginTop: 4,
            }}
          >
            <div style={{ color: "#f9fafb", fontSize: 14, fontWeight: 800 }}>
              Total Fixed Overhead
            </div>
            <div
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 20,
                fontWeight: 800,
                color: "#f59e0b",
              }}
            >
              {formatCurrency(totalFixedOverhead)}
              <span
                style={{
                  color: "#6b7280",
                  fontSize: 12,
                  fontWeight: 400,
                  marginLeft: 6,
                }}
              >
                /mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expansion Capital Request */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 6 }}>
          Expansion Capital Request
        </div>
        <p
          style={{
            color: "#6b7280",
            fontSize: 13,
            marginBottom: 20,
            marginTop: 0,
          }}
        >
          Describe what expansion capital you need and how it will grow your
          business. This is the core of EBG's financial section.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 6 }}>
              Expansion Description
            </label>
            <textarea
              value={cf.expansionDescription}
              onChange={(e) => set("expansionDescription", e.target.value)}
              placeholder="Describe what you plan to expand: new products, additional locations, increased capacity, new markets, equipment upgrades, etc."
              rows={4}
              style={TEXTAREA}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")}
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}
          >
            <NumberField
              label="Capital Needed for Expansion ($)"
              value={cf.capitalNeededForExpansion}
              onChange={(v) => set("capitalNeededForExpansion", v)}
              hint="Total funding requested for expansion"
            />
            <div>
              <label style={{ ...LABEL, display: "block", marginBottom: 6 }}>
                Timeline to Profitability (months)
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="range"
                  min={1}
                  max={36}
                  value={cf.timelineToExpansionProfitability}
                  onChange={(e) =>
                    set(
                      "timelineToExpansionProfitability",
                      parseInt(e.target.value),
                    )
                  }
                  style={{ flex: 1, accentColor: "#2563eb", cursor: "pointer" }}
                />
                <div
                  style={{
                    background: "#0a0f1e",
                    border: "1px solid #374151",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontFamily: "'Courier New', monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#60a5fa",
                    minWidth: 60,
                    textAlign: "center",
                  }}
                >
                  {cf.timelineToExpansionProfitability}
                </div>
              </div>
              <div style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>
                Months until expansion reaches profitability
              </div>
            </div>
          </div>

          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 6 }}>
              Expansion Requires Hiring?
            </label>
            <Toggle
              value={cf.expansionRequiresHiring}
              onChange={(v) => set("expansionRequiresHiring", v)}
            />
          </div>

          {cf.expansionRequiresHiring && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18,
              }}
            >
              <NumberField
                label="How Many New Hires?"
                value={cf.expansionHiringCount}
                onChange={(v) => set("expansionHiringCount", v)}
                prefix=""
                suffix="people"
              />
              <NumberField
                label="Average Monthly Salary per Hire"
                value={cf.expansionSalaries}
                onChange={(v) => set("expansionSalaries", v)}
              />
            </div>
          )}

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}
          >
            <NumberField
              label="Expected Revenue Increase ($)"
              value={cf.expectedRevenueIncrease}
              onChange={(v) => set("expectedRevenueIncrease", v)}
              hint="Annual additional revenue from expansion"
            />
            <NumberField
              label="Expected Cost Increase ($)"
              value={cf.expectedCostIncrease}
              onChange={(v) => set("expectedCostIncrease", v)}
              hint="Annual additional operating costs from expansion"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ ...PANEL, marginBottom: 0 }}>
        <div style={{ ...LABEL, marginBottom: 16 }}>
          Business Health Summary
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
          }}
        >
          <KpiCard
            label="Current Profit Margin"
            value={`${profitMarginPct >= 0 ? "" : ""}${formatPercentRaw(profitMarginPct)}`}
            sub="Monthly net income / revenue"
            color={
              profitMarginPct >= 15
                ? "#10b981"
                : profitMarginPct >= 0
                  ? "#f59e0b"
                  : "#ef4444"
            }
            icon={profitMarginPct >= 0 ? "📈" : "📉"}
          />
          <KpiCard
            label="Monthly Burn Rate"
            value={formatCurrency(monthlyBurnRate)}
            sub="Total monthly expense outflow"
            color="#f59e0b"
            icon="🔥"
          />
          <KpiCard
            label="Cash Runway"
            value={
              runwayMonths === Infinity
                ? "Profitable"
                : runwayMonths > 0
                  ? `${runwayMonths.toFixed(1)} months`
                  : "N/A"
            }
            sub={
              runwayMonths === Infinity
                ? "Revenue covers expenses"
                : "Months of cash remaining at current burn"
            }
            color={
              runwayMonths === Infinity
                ? "#10b981"
                : runwayMonths >= 6
                  ? "#60a5fa"
                  : "#ef4444"
            }
            icon="⏱"
          />
          <KpiCard
            label="Revenue Growth Potential"
            value={formatCurrency(cf.expectedRevenueIncrease)}
            sub={
              cf.expansionRequiresHiring
                ? `Requires ${cf.expansionHiringCount} hire${cf.expansionHiringCount !== 1 ? "s" : ""} @ ${formatCurrency(expansionTotalNewSalaries)}/yr`
                : "No additional headcount required"
            }
            color="#60a5fa"
            icon="🚀"
          />
        </div>
      </div>
    </div>
  );
}
