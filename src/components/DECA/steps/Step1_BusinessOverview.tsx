import React from "react";
import { motion } from "framer-motion";
import { useDECA } from "../DECAFinanceSuite";
import type { BusinessOverview } from "../types/decaTypes";

const inputStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #374151",
  borderRadius: "0.5rem",
  color: "#f9fafb",
  fontSize: "0.9rem",
  padding: "0.625rem 0.875rem",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#9ca3af",
  marginBottom: "0.375rem",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export function Step1_BusinessOverview() {
  const { state, dispatch } = useDECA();
  const ov = state.businessOverview;

  const update = (patch: Partial<BusinessOverview>) => {
    dispatch({ type: "SET_BUSINESS_OVERVIEW", payload: patch });
  };

  const [focusedField, setFocusedField] = React.useState<string | null>(null);

  const getInputStyle = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedField === field ? "#2563eb" : "#374151",
    boxShadow:
      focusedField === field ? "0 0 0 3px rgba(37,99,235,0.15)" : "none",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ paddingBottom: "2rem" }}
    >
      {/* Section heading */}
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#f9fafb",
            margin: "0 0 0.375rem",
          }}
        >
          Business Overview
        </h2>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
          Describe your business concept. This information anchors all financial
          projections.
        </p>
      </div>

      {/* Business Name — full width, large */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        style={{
          marginBottom: "1.5rem",
          background: "#111827",
          border:
            focusedField === "businessName"
              ? "1px solid #2563eb"
              : "1px solid #1f2937",
          borderRadius: "0.75rem",
          padding: "1.25rem 1.5rem",
          boxShadow:
            focusedField === "businessName"
              ? "0 0 0 3px rgba(37,99,235,0.15)"
              : "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "#60a5fa",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "0.5rem",
          }}
        >
          Business Name
        </label>
        <input
          type="text"
          value={ov.businessName}
          onChange={(e) => update({ businessName: e.target.value })}
          onFocus={() => setFocusedField("businessName")}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g. Apex Analytics LLC"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#f9fafb",
            fontSize: "1.5rem",
            fontWeight: 700,
            width: "100%",
            letterSpacing: "-0.01em",
          }}
        />
      </motion.div>

      {/* Two-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        {/* Industry */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Field label="Industry">
            <select
              value={ov.industry}
              onChange={(e) => update({ industry: e.target.value })}
              onFocus={() => setFocusedField("industry")}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle("industry")}
            >
              <option value="">Select industry…</option>
              {[
                "Retail",
                "Food & Beverage",
                "Technology/SaaS",
                "Healthcare",
                "Services",
                "Manufacturing",
                "E-commerce",
                "Hospitality",
                "Other",
              ].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
        </motion.div>

        {/* Business Type */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.13 }}
        >
          <Field label="Business Type">
            <select
              value={ov.businessType}
              onChange={(e) => update({ businessType: e.target.value })}
              onFocus={() => setFocusedField("businessType")}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle("businessType")}
            >
              <option value="">Select type…</option>
              {[
                "B2C Product",
                "B2C Service",
                "B2B Product",
                "B2B Service",
                "Marketplace",
                "Subscription",
                "Franchise",
              ].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
        </motion.div>

        {/* Business Stage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16 }}
        >
          <Field label="Business Stage">
            <select
              value={ov.businessStage}
              onChange={(e) => update({ businessStage: e.target.value })}
              onFocus={() => setFocusedField("businessStage")}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle("businessStage")}
            >
              <option value="">Select stage…</option>
              {["Pre-revenue concept", "Early revenue", "Established"].map(
                (v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ),
              )}
            </select>
          </Field>
        </motion.div>

        {/* City/State */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.19 }}
        >
          <Field label="City / State of Operation">
            <input
              type="text"
              value={ov.cityState}
              onChange={(e) => update({ cityState: e.target.value })}
              onFocus={() => setFocusedField("cityState")}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Austin, TX"
              style={getInputStyle("cityState")}
            />
          </Field>
        </motion.div>

        {/* Co-founders */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
        >
          <Field label="Number of Co-founders / Team Members">
            <input
              type="number"
              min={1}
              max={20}
              value={ov.coFounderCount}
              onChange={(e) =>
                update({ coFounderCount: parseInt(e.target.value, 10) || 1 })
              }
              onFocus={() => setFocusedField("coFounderCount")}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle("coFounderCount")}
            />
          </Field>
        </motion.div>
      </div>

      {/* Full-width textareas */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Field label="Primary Revenue Stream Description">
            <textarea
              rows={2}
              value={ov.primaryRevenueStream}
              onChange={(e) => update({ primaryRevenueStream: e.target.value })}
              onFocus={() => setFocusedField("primaryRevenueStream")}
              onBlur={() => setFocusedField(null)}
              placeholder="Describe how your business primarily generates revenue…"
              style={{
                ...getInputStyle("primaryRevenueStream"),
                resize: "vertical",
                lineHeight: 1.6,
                minHeight: "4.5rem",
              }}
            />
          </Field>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <Field label="Target Market Description">
            <textarea
              rows={2}
              value={ov.targetMarket}
              onChange={(e) => update({ targetMarket: e.target.value })}
              onFocus={() => setFocusedField("targetMarket")}
              onBlur={() => setFocusedField(null)}
              placeholder="Who are your customers? Demographics, psychographics, size of addressable market…"
              style={{
                ...getInputStyle("targetMarket"),
                resize: "vertical",
                lineHeight: 1.6,
                minHeight: "4.5rem",
              }}
            />
          </Field>
        </motion.div>
      </div>

      {/* Completion hint */}
      {ov.businessName && ov.industry && ov.businessType && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            marginTop: "1.75rem",
            background: "rgba(37,99,235,0.08)",
            border: "1px solid rgba(37,99,235,0.25)",
            borderRadius: "0.625rem",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
          }}
        >
          <span style={{ color: "#34d399", fontSize: "1rem" }}>✓</span>
          <span style={{ color: "#93c5fd", fontSize: "0.82rem" }}>
            Core overview complete —{" "}
            <strong style={{ color: "#f9fafb" }}>{ov.businessName}</strong> (
            {ov.industry} · {ov.businessType})
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
