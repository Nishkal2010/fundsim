import React from "react";
import { useDECA } from "../DECAFinanceSuite";
import { formatCurrency } from "../utils/decaUtils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TRADING_PARTNERS: { country: string; currency: string; code: string }[] =
  [
    { country: "China", currency: "Yuan", code: "CNY" },
    { country: "Canada", currency: "Dollar", code: "CAD" },
    { country: "Mexico", currency: "Peso", code: "MXN" },
    { country: "Japan", currency: "Yen", code: "JPY" },
    { country: "Germany", currency: "Euro", code: "EUR" },
    { country: "United Kingdom", currency: "Pound", code: "GBP" },
    { country: "South Korea", currency: "Won", code: "KRW" },
    { country: "India", currency: "Rupee", code: "INR" },
    { country: "France", currency: "Euro", code: "EUR" },
    { country: "Taiwan", currency: "Dollar", code: "TWD" },
    { country: "Brazil", currency: "Real", code: "BRL" },
    { country: "Australia", currency: "Dollar", code: "AUD" },
    { country: "Italy", currency: "Euro", code: "EUR" },
    { country: "Switzerland", currency: "Franc", code: "CHF" },
    { country: "Netherlands", currency: "Euro", code: "EUR" },
    { country: "Spain", currency: "Euro", code: "EUR" },
    { country: "Belgium", currency: "Euro", code: "EUR" },
    { country: "Singapore", currency: "Dollar", code: "SGD" },
    { country: "Vietnam", currency: "Dong", code: "VND" },
    { country: "Ireland", currency: "Euro", code: "EUR" },
    { country: "Israel", currency: "Shekel", code: "ILS" },
    { country: "Malaysia", currency: "Ringgit", code: "MYR" },
    { country: "Thailand", currency: "Baht", code: "THB" },
    { country: "Saudi Arabia", currency: "Riyal", code: "SAR" },
    { country: "UAE", currency: "Dirham", code: "AED" },
    { country: "Hong Kong", currency: "Dollar", code: "HKD" },
    { country: "Indonesia", currency: "Rupiah", code: "IDR" },
    { country: "Sweden", currency: "Krona", code: "SEK" },
    { country: "Austria", currency: "Euro", code: "EUR" },
    { country: "Poland", currency: "Zloty", code: "PLN" },
  ];

const TRADE_DOCS = [
  "Commercial Invoice",
  "Bill of Lading",
  "Certificate of Origin",
  "Letter of Credit",
  "Customs Declaration",
  "Import/Export Licenses",
] as const;

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

const SELECT: React.CSSProperties = {
  ...INPUT,
  cursor: "pointer",
  fontFamily: "inherit",
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
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function Step12_InternationalFinance() {
  const { state, dispatch } = useDECA();
  const { internationalFinance } = state;
  const {
    targetCountry,
    exchangeRate,
    exchangeRateRisk,
    importExportDuties,
    shippingLogistics,
    customsBrokerage,
    translationLocalization,
    legalInternational,
    bankingFees,
    countryLicensing,
  } = internationalFinance;

  const selectedPartner = TRADING_PARTNERS.find(
    (p) => p.country === targetCountry,
  );
  const currencyCode = selectedPartner?.code ?? "CURR";
  const currencyName = selectedPartner
    ? `${selectedPartner.currency} (${selectedPartner.code})`
    : "Foreign Currency";

  const totalIntlCosts =
    importExportDuties +
    shippingLogistics +
    customsBrokerage +
    translationLocalization +
    legalInternational +
    bankingFees +
    countryLicensing;

  const conversionAmounts = [1000, 10000, 100000];

  function setField<K extends keyof typeof internationalFinance>(
    key: K,
    value: (typeof internationalFinance)[K],
  ) {
    dispatch({ type: "SET_INTL_FINANCE", payload: { [key]: value } });
  }

  const [checkedDocs, setCheckedDocs] = React.useState<Record<string, boolean>>(
    {},
  );

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
          International Finance
        </h2>
        <div
          style={{
            background: "#0d1a30",
            border: "1px solid #1d4ed8",
            borderRadius: 8,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ color: "#60a5fa", fontSize: 16 }}>🌐</span>
          <span style={{ color: "#93c5fd", fontSize: 13 }}>
            This section is required for{" "}
            <strong>International Business Plan (IBP)</strong>. Include currency
            conversion, tariff modeling, and all international trade costs.
          </span>
        </div>
      </div>

      {/* Currency & Exchange Rate */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 20 }}>
          Currency & Exchange Rate
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 6 }}>
              Target Country
            </label>
            <select
              style={SELECT}
              value={targetCountry}
              onChange={(e) => setField("targetCountry", e.target.value)}
            >
              <option value="">-- Select Country --</option>
              {TRADING_PARTNERS.map((p) => (
                <option key={p.country} value={p.country}>
                  {p.country} ({p.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ ...LABEL, display: "block", marginBottom: 6 }}>
              Exchange Rate (1 USD = ? {currencyCode})
            </label>
            <input
              type="number"
              min={0}
              step={0.0001}
              value={exchangeRate || ""}
              placeholder="e.g. 7.25"
              onChange={(e) =>
                setField("exchangeRate", parseFloat(e.target.value) || 0)
              }
              style={INPUT}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")}
            />
            <div style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>
              Enter how many units of foreign currency equal 1 USD
            </div>
          </div>
        </div>

        {/* Conversion mini-table */}
        {exchangeRate > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ ...LABEL, marginBottom: 10 }}>
              Currency Conversion Reference
            </div>
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                maxWidth: 420,
              }}
            >
              <thead>
                <tr>
                  <th style={TH}>USD Amount</th>
                  <th style={TH}>{currencyName}</th>
                </tr>
              </thead>
              <tbody>
                {conversionAmounts.map((usd, i) => (
                  <tr key={usd}>
                    <td
                      style={{
                        ...TD,
                        borderBottom:
                          i === conversionAmounts.length - 1
                            ? "none"
                            : "1px solid #1f2937",
                        color: "#9ca3af",
                      }}
                    >
                      {formatCurrency(usd)}
                    </td>
                    <td
                      style={{
                        ...TD,
                        borderBottom:
                          i === conversionAmounts.length - 1
                            ? "none"
                            : "1px solid #1f2937",
                        fontFamily: "'Courier New', monospace",
                        fontWeight: 700,
                        color: "#60a5fa",
                      }}
                    >
                      {(usd * exchangeRate).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {currencyCode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Exchange Rate Risk */}
        <div>
          <div style={{ ...LABEL, marginBottom: 10 }}>
            Exchange Rate Risk Assessment
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {(["favorable", "neutral", "unfavorable"] as const).map((risk) => {
              const isSelected = exchangeRateRisk === risk;
              const riskColor =
                risk === "favorable"
                  ? "#10b981"
                  : risk === "neutral"
                    ? "#60a5fa"
                    : "#ef4444";
              return (
                <button
                  key={risk}
                  onClick={() => setField("exchangeRateRisk", risk)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: `2px solid ${isSelected ? riskColor : "#374151"}`,
                    background: isSelected ? `${riskColor}18` : "transparent",
                    color: isSelected ? riskColor : "#6b7280",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.15s ease",
                  }}
                >
                  {risk === "favorable"
                    ? "✓ "
                    : risk === "neutral"
                      ? "~ "
                      : "✕ "}
                  {risk.charAt(0).toUpperCase() + risk.slice(1)}
                </button>
              );
            })}
          </div>
          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 8 }}>
            {exchangeRateRisk === "favorable"
              ? "The foreign currency is expected to strengthen vs. USD — your revenues or cost savings in USD terms increase."
              : exchangeRateRisk === "unfavorable"
                ? "The foreign currency is expected to weaken vs. USD — your revenues or cost savings in USD terms decrease."
                : "Exchange rate is expected to remain stable — minimal FX impact on projections."}
          </div>
        </div>
      </div>

      {/* International Cost Additions */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 6 }}>
          International Cost Additions
        </div>
        <p
          style={{
            color: "#6b7280",
            fontSize: 13,
            marginBottom: 20,
            marginTop: 0,
          }}
        >
          Enter annual costs associated with international operations. These
          represent additional expenses beyond your standard operating costs.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {(
            [
              { key: "importExportDuties", label: "Import / Export Duties" },
              { key: "shippingLogistics", label: "Shipping & Logistics" },
              { key: "customsBrokerage", label: "Customs Brokerage" },
              {
                key: "translationLocalization",
                label: "Translation / Localization",
              },
              { key: "legalInternational", label: "Legal (International)" },
              { key: "bankingFees", label: "Banking Fees" },
              { key: "countryLicensing", label: "Country-Specific Licensing" },
            ] as const
          ).map(({ key, label }, idx, arr) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom:
                  idx < arr.length - 1 ? "1px solid #1f2937" : "none",
                gap: 20,
              }}
            >
              <div style={{ color: "#d1d5db", fontSize: 14, minWidth: 220 }}>
                {label}
              </div>
              <div style={{ width: 180, flexShrink: 0 }}>
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
                    value={internationalFinance[key] || ""}
                    placeholder="0"
                    onChange={(e) =>
                      setField(key, parseFloat(e.target.value) || 0)
                    }
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

          {/* Total row */}
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
              Total International Costs
            </div>
            <div
              style={{
                width: 180,
                flexShrink: 0,
                textAlign: "right",
                fontFamily: "'Courier New', monospace",
                fontSize: 18,
                fontWeight: 800,
                color: "#f59e0b",
              }}
            >
              {formatCurrency(totalIntlCosts)}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            background: "#0a1628",
            border: "1px solid #1d4ed8",
            borderRadius: 8,
            padding: "10px 14px",
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <span
            style={{
              color: "#60a5fa",
              fontSize: 14,
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            ℹ
          </span>
          <span style={{ color: "#93c5fd", fontSize: 12, lineHeight: 1.5 }}>
            These costs have been included in your operating expenses. Ensure
            they are also reflected in your income statement and cash flow
            projections.
          </span>
        </div>
      </div>

      {/* Trade Document Checklist */}
      <div style={PANEL}>
        <div style={{ ...LABEL, marginBottom: 6 }}>
          Trade Document Awareness Checklist
        </div>
        <p
          style={{
            color: "#6b7280",
            fontSize: 13,
            marginBottom: 20,
            marginTop: 0,
          }}
        >
          Mark documents you have researched or plan to include in your
          international business plan. This is for planning awareness — judges
          may ask about these documents.
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {TRADE_DOCS.map((doc) => {
            const isChecked = !!checkedDocs[doc];
            return (
              <label
                key={doc}
                style={{
                  display: "flex",
                  alignItems: "center",
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
                    setCheckedDocs((prev) => ({
                      ...prev,
                      [doc]: e.target.checked,
                    }))
                  }
                  style={{ display: "none" }}
                />
                <span
                  style={{
                    color: isChecked ? "#d1fae5" : "#d1d5db",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {doc}
                </span>
              </label>
            );
          })}
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: 11,
            marginTop: 14,
            textAlign: "center",
          }}
        >
          {Object.values(checkedDocs).filter(Boolean).length} of{" "}
          {TRADE_DOCS.length} documents reviewed
        </div>
      </div>

      {/* IBP Tip */}
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
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>📋</span>
        <div>
          <div
            style={{
              color: "#60a5fa",
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 4,
            }}
          >
            IBP Judge Expectation
          </div>
          <div style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6 }}>
            IBP judges expect currency conversion in all financial projections,
            tariff/duty analysis specific to your target market, and awareness
            of trade barriers. Your financial section should show all figures in
            both USD and the target currency where relevant.
          </div>
        </div>
      </div>
    </div>
  );
}
