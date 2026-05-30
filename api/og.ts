/* eslint-disable @typescript-eslint/no-explicit-any */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// OG image generation on the Vercel Node runtime via satori (JSX->SVG, pure JS)
// + @resvg/resvg-js (SVG->PNG, native binary). This replaces @vercel/og, which
// fails to BUILD on the edge runtime ("referencing unsupported modules") and
// 500s on Node (its bundled font/WASM aren't available in the lambda). satori
// needs an explicit font, so we ship IBM Plex Sans in api/_assets and bundle it
// via the functions.includeFiles config in vercel.json — nothing is fetched at
// request time. The default homepage/learn card is the static public/og-image.png;
// this endpoint powers the personalized /s/:id deal-share cards.

const FONT_DIR = join(process.cwd(), "api", "_assets");
const fonts = [
  {
    name: "IBM Plex Sans",
    weight: 400 as const,
    style: "normal" as const,
    data: readFileSync(join(FONT_DIR, "IBMPlexSans-Regular.ttf")),
  },
  {
    name: "IBM Plex Sans",
    weight: 600 as const,
    style: "normal" as const,
    data: readFileSync(join(FONT_DIR, "IBMPlexSans-SemiBold.ttf")),
  },
  {
    name: "IBM Plex Sans",
    weight: 700 as const,
    style: "normal" as const,
    data: readFileSync(join(FONT_DIR, "IBMPlexSans-Bold.ttf")),
  },
];

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

// satori requires display:flex on any node with >1 child — apply it automatically.
type El = {
  type: string;
  props: { style: Record<string, unknown>; children?: unknown };
};
const el = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
): El => {
  const multi = Array.isArray(children) && children.length > 1;
  const s = multi && !style.display ? { ...style, display: "flex" } : style;
  return {
    type,
    props: children === undefined ? { style: s } : { style: s, children },
  };
};

// Classic Node (req, res) handler — returning a Web Response from this runtime
// leaves the request hanging (Vercel never flushes it), so we write via res.end.
export default async function handler(req: any, res: any): Promise<void> {
  // req.url is a relative path ("/api/og?id=..."); base is required for new URL.
  const { searchParams } = new URL(req.url, "http://localhost");
  const id = searchParams.get("id") ?? "";

  let title = "FundSim — Free Finance Simulator";
  let subtitle = "LBO · DCF · M&A · PE Waterfall · VC Cap Table — no Excel";
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
          { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } },
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

  const children: El[] = [
    el("div", {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: accent,
    }),
    el("div", {
      position: "absolute",
      top: "-200px",
      right: "-200px",
      width: "600px",
      height: "600px",
      borderRadius: "50%",
      background: accent,
      opacity: 0.05,
    }),
    el(
      "div",
      {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "40px",
      },
      [
        el(
          "span",
          {
            fontSize: "26px",
            fontWeight: 700,
            color: "#F9FAFB",
            letterSpacing: "-0.5px",
          },
          "FundSim",
        ),
        el(
          "div",
          {
            fontSize: "13px",
            color: accent,
            background: "rgba(99,102,241,0.1)",
            padding: "4px 12px",
            borderRadius: "6px",
            border: `1px solid ${accent}44`,
            fontWeight: 600,
            letterSpacing: "0.05em",
          },
          simLabel.toUpperCase(),
        ),
      ],
    ),
    el(
      "div",
      {
        fontSize: title.length > 40 ? "42px" : "52px",
        fontWeight: 700,
        color: "#F9FAFB",
        lineHeight: 1.15,
        marginBottom: "10px",
        maxWidth: "1000px",
      },
      title,
    ),
    el(
      "div",
      {
        fontSize: "22px",
        color: "rgba(255,255,255,0.5)",
        marginBottom: "44px",
        maxWidth: "1000px",
      },
      subtitle,
    ),
  ];

  if (displayMetrics.length > 0) {
    children.push(
      el(
        "div",
        { display: "flex", gap: "16px" },
        displayMetrics.map((m) =>
          el(
            "div",
            {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: "8px",
              background: "#111827",
              border: `1px solid ${m.highlight ? accent : "#374151"}`,
              borderRadius: "12px",
              padding: "20px 24px",
            },
            [
              el(
                "div",
                {
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                },
                m.label,
              ),
              el(
                "div",
                {
                  fontSize: "36px",
                  fontWeight: 700,
                  color: m.highlight ? accent : "#F9FAFB",
                  lineHeight: 1,
                },
                m.value,
              ),
            ],
          ),
        ),
      ),
    );
  }

  if (percentileBand !== null && percentileBand >= 60) {
    children.push(
      el(
        "div",
        {
          position: "absolute",
          bottom: "36px",
          left: "60px",
          fontSize: "14px",
          color: accent,
          background: `${accent}18`,
          border: `1px solid ${accent}44`,
          borderRadius: "999px",
          padding: "5px 16px",
          fontWeight: 600,
          letterSpacing: "0.04em",
        },
        `Top ${100 - percentileBand}% of ${simLabel} deals this week`,
      ),
    );
  }

  children.push(
    el(
      "div",
      {
        position: "absolute",
        bottom: "36px",
        right: "60px",
        fontSize: "16px",
        color: "rgba(255,255,255,0.3)",
        fontWeight: 500,
        letterSpacing: "0.03em",
      },
      "fundsimulate.com",
    ),
  );

  const tree = el(
    "div",
    {
      width: "1200px",
      height: "630px",
      display: "flex",
      flexDirection: "column",
      background: "#0A0F1C",
      fontFamily: "IBM Plex Sans",
      padding: "60px",
      position: "relative",
      overflow: "hidden",
    },
    children,
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts,
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng();

  res.statusCode = 200;
  res.setHeader("Content-Type", "image/png");
  res.setHeader(
    "Cache-Control",
    "public, immutable, no-transform, max-age=86400",
  );
  res.end(png);
}
