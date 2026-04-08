import React from "react";
import { motion } from "framer-motion";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency } from "../utils/decaUtils";
import type { FinancialAssumptions } from "../types/decaTypes";

const inputBase: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #374151",
  borderRadius: "0.45rem",
  color: "#f9fafb",
  fontSize: "0.875rem",
  padding: "0.5rem 0.75rem",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.18s, box-shadow 0.18s",
};

const labelSm: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 600,
  color: "#9ca3af",
  marginBottom: "0.3rem",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const panelStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: "0.75rem",
  padding: "1.5rem",
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#60a5fa",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "1rem",
  paddingBottom: "0.5rem",
  borderBottom: "1px solid #1f2937",
};

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  note?: string;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  focusKey: string;
  focused: string | null;
  setFocused: (k: string | null) => void;
}

function NumberField({
  label,
  value,
  onChange,
  note,
  prefix,
  suffix,
  step = 1,
  min = 0,
  focusKey,
  focused,
  setFocused,
}: NumberFieldProps) {
  return (
    <div>
      <label style={labelSm}>{label}</label>
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        {prefix && (
          <span
            style={{
              position: "absolute",
              left: "0.625rem",
              color: "#6b7280",
              fontSize: "0.85rem",
              pointerEvents: "none",
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          onFocus={() => setFocused(focusKey)}
          onBlur={() => setFocused(null)}
          style={{
            ...inputBase,
            paddingLeft: prefix ? "1.5rem" : (inputBase.padding as string),
            paddingRight: suffix ? "2.5rem" : (inputBase.padding as string),
            borderColor: focused === focusKey ? "#2563eb" : "#374151",
            boxShadow:
              focused === focusKey ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
          }}
        />
        {suffix && (
          <span
            style={{
              position: "absolute",
              right: "0.625rem",
              color: "#6b7280",
              fontSize: "0.8rem",
              pointerEvents: "none",
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      {note && (
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "0.7rem",
            color: "#6b7280",
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  focusKey: string;
  focused: string | null;
  setFocused: (k: string | null) => void;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  focusKey,
  focused,
  setFocused,
}: SelectFieldProps) {
  return (
    <div>
      <label style={labelSm}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(focusKey)}
        onBlur={() => setFocused(null)}
        style={{
          ...inputBase,
          borderColor: focused === focusKey ? "#2563eb" : "#374151",
          boxShadow:
            focused === focusKey ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  focusKey: string;
  focused: string | null;
  setFocused: (k: string | null) => void;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  focusKey,
  focused,
  setFocused,
}: TextFieldProps) {
  return (
    <div>
      <label style={labelSm}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(focusKey)}
        onBlur={() => setFocused(null)}
        placeholder={placeholder}
        style={{
          ...inputBase,
          borderColor: focused === focusKey ? "#2563eb" : "#374151",
          boxShadow:
            focused === focusKey ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
        }}
      />
    </div>
  );
}

// Assumption Tracker helpers
type AssumptionStatus = "sourced" | "estimated" | "unsourced";

function getStatus(value: number | string, source?: string): AssumptionStatus {
  if (typeof value === "number" && value === 0) return "unsourced";
  if (source && source !== "Conservative estimate") return "sourced";
  return "estimated";
}

interface TrackerRow {
  label: string;
  status: AssumptionStatus;
}

const STATUS_ICON: Record<AssumptionStatus, string> = {
  sourced: "✅",
  estimated: "⚠️",
  unsourced: "❌",
};

const STATUS_COLOR: Record<AssumptionStatus, string> = {
  sourced: "#34d399",
  estimated: "#fbbf24",
  unsourced: "#f87171",
};

export function Step2_Assumptions() {
  const { state, dispatch } = useDECA();
  const a = state.assumptions;
  const [focused, setFocused] = React.useState<string | null>(null);

  const update = (patch: Partial<FinancialAssumptions>) => {
    dispatch({ type: "SET_ASSUMPTIONS", payload: patch });
  };

  // Auto-calc equity
  const equityPortion = Math.max(0, a.totalStartupCapital - a.debtPortion);

  const handleDebtChange = (v: number) => {
    update({
      debtPortion: v,
      equityPortion: Math.max(0, a.totalStartupCapital - v),
    });
  };

  const handleCapitalChange = (v: number) => {
    update({
      totalStartupCapital: v,
      equityPortion: Math.max(0, v - a.debtPortion),
    });
  };

  // Month 1 preview
  const m1Revenue = a.startingMonthlyRevenue;
  const m1Cogs = m1Revenue * (a.cogsPercent / 100);
  const m1GrossProfit = m1Revenue - m1Cogs;

  // Tracker rows
  const trackerRows: TrackerRow[] = [
    {
      label: "Revenue Growth Rate",
      status: getStatus(a.momGrowthRate, a.momGrowthSource),
    },
    { label: "COGS %", status: getStatus(a.cogsPercent, a.cogsSource) },
    { label: "Starting Revenue", status: getStatus(a.startingMonthlyRevenue) },
    { label: "Monthly Rent", status: getStatus(a.monthlyRent) },
    { label: "Avg Monthly Salary", status: getStatus(a.avgMonthlySalary) },
    { label: "Startup Capital", status: getStatus(a.totalStartupCapital) },
    { label: "Loan Interest Rate", status: getStatus(a.loanInterestRate) },
  ];

  const growthSources = [
    "Industry average from IBISWorld",
    "Pilot program data",
    "Competitor benchmarking",
    "Conservative estimate",
    "Custom",
  ];

  const pricingStrategies = [
    "Fixed price",
    "Tiered",
    "Subscription",
    "Per-unit",
    "Custom",
  ];
  const cogsSources = [
    "Industry average",
    "Supplier quote",
    "Competitor benchmarking",
    "Conservative estimate",
    "Custom",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ paddingBottom: "2rem" }}
    >
      {/* Heading */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#f9fafb",
            margin: "0 0 0.375rem",
          }}
        >
          Financial Assumptions
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
          All projections derive from these assumptions. Cite your sources —
          judges score sourcing quality.
        </p>
      </div>

      {/* Main layout: left panels + right sidebar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {/* Revenue Assumptions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            style={panelStyle}
          >
            <div style={sectionHeadingStyle}>Revenue Assumptions</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <NumberField
                label="Starting Monthly Revenue ($)"
                value={a.startingMonthlyRevenue}
                onChange={(v) => update({ startingMonthlyRevenue: v })}
                prefix="$"
                focusKey="startRev"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Month-over-Month Growth Rate (%)"
                value={a.momGrowthRate}
                onChange={(v) => update({ momGrowthRate: v })}
                suffix="%"
                focusKey="momGrowth"
                focused={focused}
                setFocused={setFocused}
              />
              <div style={{ gridColumn: "1 / -1" }}>
                <SelectField
                  label="Growth Rate Source"
                  value={a.momGrowthSource}
                  onChange={(v) => update({ momGrowthSource: v })}
                  options={growthSources}
                  focusKey="growthSrc"
                  focused={focused}
                  setFocused={setFocused}
                />
              </div>
              <NumberField
                label="Avg Transaction Value ($)"
                value={a.avgTransactionValue}
                onChange={(v) => update({ avgTransactionValue: v })}
                prefix="$"
                focusKey="avgTxn"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Customers Month 1"
                value={a.customersMonth1}
                onChange={(v) => update({ customersMonth1: v })}
                focusKey="custM1"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Customer Growth Rate (%)"
                value={a.customerGrowthRate}
                onChange={(v) => update({ customerGrowthRate: v })}
                suffix="%"
                focusKey="custGrowth"
                focused={focused}
                setFocused={setFocused}
              />
              <SelectField
                label="Pricing Strategy"
                value={a.pricingStrategy}
                onChange={(v) => update({ pricingStrategy: v })}
                options={pricingStrategies}
                focusKey="pricingStrat"
                focused={focused}
                setFocused={setFocused}
              />
            </div>
          </motion.div>

          {/* Cost Assumptions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            style={panelStyle}
          >
            <div style={sectionHeadingStyle}>Cost Assumptions</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <NumberField
                label="COGS as % of Revenue"
                value={a.cogsPercent}
                onChange={(v) => update({ cogsPercent: v })}
                suffix="%"
                focusKey="cogsPct"
                focused={focused}
                setFocused={setFocused}
              />
              <SelectField
                label="COGS Source"
                value={a.cogsSource}
                onChange={(v) => update({ cogsSource: v })}
                options={cogsSources}
                focusKey="cogsSource"
                focused={focused}
                setFocused={setFocused}
              />
              <div style={{ gridColumn: "1 / -1" }}>
                <TextField
                  label="Primary Supplier / Vendor Name"
                  value={a.primarySupplier}
                  onChange={(v) => update({ primarySupplier: v })}
                  placeholder="e.g. Alibaba, local distributor…"
                  focusKey="supplier"
                  focused={focused}
                  setFocused={setFocused}
                />
              </div>
              <NumberField
                label="Monthly Rent ($)"
                value={a.monthlyRent}
                onChange={(v) => update({ monthlyRent: v })}
                prefix="$"
                focusKey="rent"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Employees Year 1"
                value={a.employeeCountYear1}
                onChange={(v) => update({ employeeCountYear1: v })}
                min={0}
                focusKey="empCount"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Avg Monthly Salary ($)"
                value={a.avgMonthlySalary}
                onChange={(v) => update({ avgMonthlySalary: v })}
                prefix="$"
                note="BLS data: median ~$4,600/month"
                focusKey="salary"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Payroll Tax Rate (%)"
                value={a.payrollTaxRate}
                onChange={(v) => update({ payrollTaxRate: v })}
                suffix="%"
                note="FICA rate: 15.3% standard"
                focusKey="payrollTax"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Monthly Marketing ($)"
                value={a.monthlyMarketing}
                onChange={(v) => update({ monthlyMarketing: v })}
                prefix="$"
                focusKey="mktg"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Monthly Technology ($)"
                value={a.monthlyTechnology}
                onChange={(v) => update({ monthlyTechnology: v })}
                prefix="$"
                focusKey="tech"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Monthly Insurance ($)"
                value={a.monthlyInsurance}
                onChange={(v) => update({ monthlyInsurance: v })}
                prefix="$"
                focusKey="ins"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Monthly Professional Services ($)"
                value={a.monthlyProfessionalServices}
                onChange={(v) => update({ monthlyProfessionalServices: v })}
                prefix="$"
                focusKey="profSvc"
                focused={focused}
                setFocused={setFocused}
              />
            </div>
          </motion.div>

          {/* Financing Assumptions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={panelStyle}
          >
            <div style={sectionHeadingStyle}>Financing Assumptions</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <NumberField
                label="Total Startup Capital ($)"
                value={a.totalStartupCapital}
                onChange={handleCapitalChange}
                prefix="$"
                focusKey="capital"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Debt Portion ($)"
                value={a.debtPortion}
                onChange={handleDebtChange}
                prefix="$"
                focusKey="debt"
                focused={focused}
                setFocused={setFocused}
              />
              {/* Equity auto-calc */}
              <div>
                <label style={labelSm}>Equity Portion ($)</label>
                <div
                  style={{
                    background: "#0a0f1e",
                    border: "1px solid #1f2937",
                    borderRadius: "0.45rem",
                    padding: "0.5rem 0.75rem",
                    fontFamily: "monospace",
                    color: "#60a5fa",
                    fontSize: "0.875rem",
                  }}
                >
                  {formatCurrency(equityPortion)}
                </div>
                <p
                  style={{
                    margin: "0.25rem 0 0",
                    fontSize: "0.7rem",
                    color: "#6b7280",
                  }}
                >
                  = Total Capital − Debt Portion
                </p>
              </div>
              <NumberField
                label="Loan Interest Rate (%)"
                value={a.loanInterestRate * 100}
                onChange={(v) => update({ loanInterestRate: v / 100 })}
                suffix="%"
                step={0.1}
                note="Current prime rate ~8.5%"
                focusKey="loanRate"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Loan Term (months)"
                value={a.loanTermMonths}
                onChange={(v) => update({ loanTermMonths: v })}
                focusKey="loanTerm"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Founder Personal Investment ($)"
                value={a.founderPersonalInvestment}
                onChange={(v) => update({ founderPersonalInvestment: v })}
                prefix="$"
                focusKey="founderInv"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Tax Rate (%)"
                value={a.taxRate}
                onChange={(v) => update({ taxRate: v })}
                suffix="%"
                note="Federal corporate rate: 21%"
                focusKey="taxRate"
                focused={focused}
                setFocused={setFocused}
              />
              <NumberField
                label="Equipment Useful Life (years)"
                value={a.equipmentUsefulLifeYears}
                onChange={(v) => update({ equipmentUsefulLifeYears: v })}
                min={1}
                focusKey="equipLife"
                focused={focused}
                setFocused={setFocused}
              />
            </div>
          </motion.div>
        </div>

        {/* Right sidebar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            position: "sticky",
            top: "1rem",
          }}
        >
          {/* Assumption Tracker */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22 }}
            style={panelStyle}
          >
            <div style={sectionHeadingStyle}>Assumption Tracker</div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
              }}
            >
              {trackerRows.map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.625rem",
                    background: "#0a0f1e",
                    borderRadius: "0.4rem",
                    border: "1px solid #1f2937",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: STATUS_COLOR[row.status],
                    }}
                  >
                    {STATUS_ICON[row.status]}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "0.875rem",
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              {(
                ["sourced", "estimated", "unsourced"] as AssumptionStatus[]
              ).map((s) => (
                <div
                  key={s}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <span style={{ fontSize: "0.72rem" }}>{STATUS_ICON[s]}</span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: STATUS_COLOR[s],
                      textTransform: "capitalize",
                    }}
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Month 1 Live Preview */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              ...panelStyle,
              border: "1px solid rgba(37,99,235,0.3)",
            }}
          >
            <div style={{ ...sectionHeadingStyle, color: "#93c5fd" }}>
              Month 1 Preview
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.82rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#9ca3af",
                }}
              >
                <span>Revenue</span>
                <span style={{ color: "#f9fafb" }}>
                  {formatCurrency(m1Revenue)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#9ca3af",
                }}
              >
                <span>− COGS ({a.cogsPercent}%)</span>
                <span style={{ color: "#f87171" }}>
                  ({formatCurrency(m1Cogs)})
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #1f2937",
                  paddingTop: "0.5rem",
                  fontWeight: 700,
                  color: m1GrossProfit >= 0 ? "#34d399" : "#f87171",
                }}
              >
                <span>Gross Profit</span>
                <span>{formatCurrency(m1GrossProfit)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#6b7280",
                  fontSize: "0.75rem",
                }}
              >
                <span>Gross Margin</span>
                <span>
                  {m1Revenue > 0
                    ? ((m1GrossProfit / m1Revenue) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
