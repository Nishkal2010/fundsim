import { ImageResponse } from "@vercel/og";

// Runs on the Node.js runtime. The Edge runtime build fails here — Vercel
// bundles api/og into an edge namespace and rejects @vercel/og's WASM as an
// "unsupported module" ("The Edge Function api/og is referencing unsupported
// modules: @vercel/og"), which broke every production deploy. @vercel/og ships
// a Node build (index.node.js) that renders the same ImageResponse and works
// with this Web-standard (Request) => Response handler. The default homepage /
// learn social card is a static public/og-image.png, so SEO/sharing does not
// depend on this function — it only powers personalized /s/:id deal cards.

const ACCENT: Record<string, string> = {
  pe: "#6366F1",
  vc: "#10B981",
  ib: "#F59E0B",
};

const SIM_LABEL: Record<string, string> = {
  pe: "Private Equity",
  vc: "Venture Capital",
  ib: "Investment Banking",
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? "";

  // No id → this is the default brand card served at /og-image.png (see
  // vercel.json rewrite). Keep the copy keyword-rich and brand-correct.
  let title = "FundSim — Free Finance Simulator";
  let subtitle =
    "LBO · DCF · M&A · PE Waterfall · VC Cap Table — no Excel, no signup";
  let metrics: Array<{ label: string; value: string; highlight?: boolean }> =
    [];
  let simulator = "pe";
  let percentileBand: number | null = null;

  if (id) {
    try {
      const supabaseUrl =
        (process.env.SUPABASE_URL as string | undefined) ??
        (process.env.VITE_SUPABASE_URL as string | undefined);
      const anonKey = process.env.VITE_SUPABASE_ANON_KEY as string | undefined;

      if (supabaseUrl && anonKey) {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/deal_shares?id=eq.${encodeURIComponent(id)}&select=summary,simulator&limit=1`,
          {
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${anonKey}`,
            },
          },
        );
        if (res.ok) {
          const rows = (await res.json()) as Array<{
            summary?: {
              title?: string;
              subtitle?: string;
              metrics?: Array<{
                label: string;
                value: string;
                highlight?: boolean;
              }>;
            };
            simulator?: string;
            percentile_band?: number;
          }>;
          const row = rows[0];
          if (row?.summary) {
            title = row.summary.title ?? title;
            subtitle = row.summary.subtitle ?? subtitle;
            metrics = Array.isArray(row.summary.metrics)
              ? row.summary.metrics
              : [];
            simulator = row.simulator ?? "pe";
            percentileBand =
              typeof row.percentile_band === "number"
                ? row.percentile_band
                : null;
          }
        }
      }
    } catch {
      // fall through to defaults
    }
  }

  const accent = ACCENT[simulator] ?? ACCENT.pe;
  const simLabel = SIM_LABEL[simulator] ?? "Simulator";
  const displayMetrics = [
    ...metrics.filter((m) => m.highlight),
    ...metrics.filter((m) => !m.highlight),
  ].slice(0, 3);

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        background: "#0A0F1C",
        fontFamily: "sans-serif",
        padding: "60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: accent,
        }}
      />

      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          right: "-200px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: accent,
          opacity: 0.04,
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "40px",
        }}
      >
        <span
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: "#F9FAFB",
            letterSpacing: "-0.5px",
          }}
        >
          FundSim
        </span>
        <div
          style={{
            fontSize: "12px",
            color: accent,
            background: `rgba(99,102,241,0.1)`,
            padding: "4px 10px",
            borderRadius: "6px",
            border: `1px solid ${accent}44`,
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          {simLabel.toUpperCase()}
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: title.length > 40 ? "42px" : "52px",
          fontWeight: 700,
          color: "#F9FAFB",
          lineHeight: 1.15,
          marginBottom: "10px",
          maxWidth: "900px",
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: "20px",
          color: "rgba(255,255,255,0.45)",
          marginBottom: "44px",
        }}
      >
        {subtitle}
      </div>

      {/* Metrics */}
      {displayMetrics.length > 0 && (
        <div style={{ display: "flex", gap: "16px" }}>
          {displayMetrics.map((m, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: "#111827",
                border: `1px solid ${m.highlight ? accent : "#374151"}`,
                borderRadius: "12px",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                }}
              >
                {m.label}
              </span>
              <span
                style={{
                  fontSize: "34px",
                  fontWeight: 700,
                  color: m.highlight ? accent : "#F9FAFB",
                  lineHeight: 1,
                }}
              >
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Percentile badge */}
      {percentileBand !== null && percentileBand >= 60 && (
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            left: "60px",
            fontSize: "13px",
            color: accent,
            background: `${accent}18`,
            border: `1px solid ${accent}44`,
            borderRadius: "999px",
            padding: "4px 14px",
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          Top {100 - percentileBand}% of {SIM_LABEL[simulator] ?? "deals"} this
          week
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "36px",
          right: "60px",
          fontSize: "14px",
          color: "rgba(255,255,255,0.25)",
          fontWeight: 500,
          letterSpacing: "0.03em",
        }}
      >
        fundsimulate.com
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, immutable, max-age=86400",
      },
    },
  );
}
