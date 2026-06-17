// Compact metric tile for the Quant tabs. Deliberately quieter and smaller
// than the shared MetricCard (which is text-3xl gold with a hover-lift): a
// modest value size, no gold, no animation — so the dense quant dashboards
// read clean rather than loud.

interface QuantStatProps {
  label: string;
  value: string;
  subtitle?: string;
  status?: "positive" | "negative" | "neutral";
}

const VALUE_COLOR: Record<NonNullable<QuantStatProps["status"]>, string> = {
  positive: "#4bcb98",
  negative: "#e0524f",
  neutral: "#ece9e2",
};

export function QuantStat({
  label,
  value,
  subtitle,
  status = "neutral",
}: QuantStatProps) {
  return (
    <div
      className="rounded-lg px-3 py-2.5"
      style={{ background: "#141519", border: "1px solid #2b2d34" }}
    >
      <div
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: "#7d808a", letterSpacing: "0.08em" }}
      >
        {label}
      </div>
      <div
        className="text-lg font-semibold tabular-nums leading-tight mt-0.5"
        style={{ color: VALUE_COLOR[status] }}
      >
        {value}
      </div>
      {subtitle && (
        <div className="text-[11px] mt-0.5" style={{ color: "#7d808a" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
