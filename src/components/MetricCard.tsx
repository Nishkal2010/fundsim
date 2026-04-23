import React, { useState } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  description?: string;
  status?: "positive" | "negative" | "neutral";
  subtitle?: string;
}

const statusColors = {
  positive: {
    value: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    bgHover: "rgba(16,185,129,0.13)",
    border: "rgba(16,185,129,0.2)",
    borderHover: "rgba(16,185,129,0.4)",
  },
  negative: {
    value: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    bgHover: "rgba(239,68,68,0.13)",
    border: "rgba(239,68,68,0.2)",
    borderHover: "rgba(239,68,68,0.4)",
  },
  neutral: {
    value: "#818CF8",
    bg: "rgba(99,102,241,0.08)",
    bgHover: "rgba(99,102,241,0.13)",
    border: "rgba(99,102,241,0.2)",
    borderHover: "rgba(99,102,241,0.4)",
  },
};

export function MetricCard({
  label,
  value,
  description,
  status = "neutral",
  subtitle,
}: MetricCardProps) {
  const [hovered, setHovered] = useState(false);
  const c = statusColors[status];

  return (
    <div
      role="region"
      aria-label={label}
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{
        background: hovered ? c.bgHover : c.bg,
        border: `1px solid ${hovered ? c.borderHover : c.border}`,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? `0 8px 24px ${c.bg}` : "none",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
        {label}
      </div>
      <div
        className="text-3xl font-bold tabular-nums leading-none"
        style={{ color: c.value, transition: "color 0.2s" }}
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </div>
      {subtitle && <div className="text-xs text-[#6B7280]">{subtitle}</div>}
      {description && (
        <div className="text-xs text-[#9CA3AF] mt-1">{description}</div>
      )}
    </div>
  );
}
