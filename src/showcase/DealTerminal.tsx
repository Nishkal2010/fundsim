import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

// A J-curve: cumulative net cash flow to LPs over a fund's life. Negative
// while capital is called and fees drag, then recovers past breakeven to a
// positive multiple as portfolio companies exit. Real shape, illustrative #s.
const J_CURVE = [
  { yr: "Yr 1", v: -22 },
  { yr: "Yr 2", v: -41 },
  { yr: "Yr 3", v: -52 },
  { yr: "Yr 4", v: -48 },
  { yr: "Yr 5", v: -30 },
  { yr: "Yr 6", v: -4 },
  { yr: "Yr 7", v: 38 },
  { yr: "Yr 8", v: 86 },
  { yr: "Yr 9", v: 128 },
  { yr: "Yr 10", v: 161 },
];

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[10px] uppercase tracking-widest"
        style={{ color: "#6B7280" }}
      >
        {label}
      </span>
      <span
        className="text-lg font-semibold tabular-nums"
        style={{ color: accent, fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {value}
      </span>
    </div>
  );
}

export function DealTerminal() {
  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: "rgba(13,18,32,0.72)",
        border: "1px solid rgba(99,102,241,0.22)",
        boxShadow:
          "0 40px 120px -40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.02) inset",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(31,41,55,0.8)" }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "#EF4444" }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "#F59E0B" }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "#10B981" }}
        />
        <span
          className="ml-3 text-xs"
          style={{ color: "#9CA3AF", fontFamily: "'IBM Plex Mono', monospace" }}
        >
          fund_model · buyout · vintage 2026
        </span>
        <span
          className="ml-auto text-[10px] px-2 py-0.5 rounded"
          style={{
            color: "#34D399",
            background: "rgba(16,185,129,0.10)",
            border: "1px solid rgba(16,185,129,0.25)",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          ● LIVE
        </span>
      </div>

      {/* Metric strip */}
      <div
        className="grid grid-cols-4 gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid rgba(31,41,55,0.6)" }}
      >
        <Metric label="Net IRR" value="21.4%" accent="#818CF8" />
        <Metric label="TVPI" value="2.6x" accent="#F9FAFB" />
        <Metric label="DPI" value="1.6x" accent="#34D399" />
        <Metric label="Hurdle" value="8.0%" accent="#9CA3AF" />
      </div>

      {/* J-curve */}
      <div className="px-2 pt-4 pb-2" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={J_CURVE}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="jc-pos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
            <XAxis
              dataKey="yr"
              tick={{
                fill: "#6B7280",
                fontSize: 11,
                fontFamily: "IBM Plex Mono",
              }}
              axisLine={{ stroke: "rgba(148,163,184,0.15)" }}
              tickLine={false}
            />
            <YAxis
              tick={{
                fill: "#6B7280",
                fontSize: 11,
                fontFamily: "IBM Plex Mono",
              }}
              axisLine={false}
              tickLine={false}
              width={36}
              tickFormatter={(v: number) => `${v}`}
            />
            <ReferenceLine
              y={0}
              stroke="rgba(148,163,184,0.35)"
              strokeDasharray="3 3"
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#818CF8"
              strokeWidth={2.4}
              fill="url(#jc-pos)"
              dot={{ r: 2.5, fill: "#818CF8", strokeWidth: 0 }}
              activeDot={{ r: 4 }}
              isAnimationActive
              animationDuration={1600}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="px-5 pb-4">
        <span className="text-[11px]" style={{ color: "#6B7280" }}>
          Cumulative net cash flow to LPs ($M) — the classic J-curve, computed
          live as you move the inputs.
        </span>
      </div>
    </div>
  );
}
