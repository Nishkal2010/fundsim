import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { YISLanding } from "./YISLanding";

// ─── Colors ─────────────────────────────────────────────────────────────────
const G = {
  primary: "#22C55E",
  light: "#4ADE80",
  dim: "rgba(34,197,94,0.15)",
  border: "rgba(34,197,94,0.25)",
  glow: "rgba(34,197,94,0.3)",
};

// ─── Tab definitions ─────────────────────────────────────────────────────────
type TabId =
  | "overview"
  | "rubric"
  | "report"
  | "valuation"
  | "checklist"
  | "qa";
const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "rubric", label: "Rubric" },
  { id: "report", label: "Report Guide" },
  { id: "valuation", label: "DCF Calculator" },
  { id: "checklist", label: "Checklist" },
  { id: "qa", label: "Q&A Prep" },
];

// ─── Shared Components ───────────────────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif mb-1"
      style={{ fontSize: "22px", color: "#F9FAFB" }}
    >
      {children}
    </h2>
  );
}
function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
      {children}
    </p>
  );
}
function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="p-5 rounded-xl"
      style={{ background: "#111827", border: "1px solid #1F2937", ...style }}
    >
      {children}
    </div>
  );
}
function GreenBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded"
      style={{
        background: G.dim,
        color: G.light,
        border: `1px solid ${G.border}`,
        fontFamily: "monospace",
      }}
    >
      {children}
    </span>
  );
}
function PointBar({
  label,
  pts,
  max,
  color,
}: {
  label: string;
  pts: number;
  max: number;
  color?: string;
}) {
  const pct = (pts / max) * 100;
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm" style={{ color: "#D1D5DB" }}>
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color: color ?? G.light }}>
          {pts} pts
        </span>
      </div>
      <div
        className="w-full rounded-full h-2"
        style={{ background: "#1F2937" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-2 rounded-full"
          style={{ background: color ?? G.primary }}
        />
      </div>
    </div>
  );
}

// ─── Tab: Overview ───────────────────────────────────────────────────────────
function OverviewTab() {
  const rounds = [
    {
      label: "State / International Round",
      detail:
        "Submit report, slides & video by Feb 20, 2026. No live presentation.",
      tag: "Remote",
    },
    {
      label: "Global Youth Investment Summit",
      detail: "Top 100 teams invited to Cornell Tech, NYC — May 28–29, 2026.",
      tag: "NYC",
    },
    {
      label: "Quarterfinals → Top 24",
      detail:
        "Live 20-min pitch: 10-min presentation + 5-min Q&A + 5-min feedback.",
      tag: "Live",
    },
    {
      label: "Semifinals → Top 5",
      detail:
        "Same format. Industry professionals from Bloomberg, GS, JPM, PIMCO judge.",
      tag: "Live",
    },
    {
      label: "Championship Round",
      detail:
        "Global winner announced. Broadcast on YIS YouTube. NASDAQ billboard recognition.",
      tag: "Finals",
    },
  ];

  const prizes = [
    { item: "1st Place Cash", value: "$3,000" },
    { item: "Stockpile Gift Card", value: "$2,000" },
    { item: "Paid Internship", value: "Ethos Investment Mgmt" },
    { item: "NASDAQ Billboard", value: "Times Square" },
    { item: "iPad", value: "Winners" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <SectionHeader>Competition Structure</SectionHeader>
        <Sub>
          4-tier progressive elimination — from state submission to NYC finals
        </Sub>
        <div className="space-y-3">
          {rounds.map((r, i) => (
            <Card key={i}>
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: G.dim,
                    color: G.light,
                    border: `1px solid ${G.border}`,
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "#F9FAFB" }}
                    >
                      {r.label}
                    </span>
                    <GreenBadge>{r.tag}</GreenBadge>
                  </div>
                  <p className="text-xs" style={{ color: "#6B7280" }}>
                    {r.detail}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <SectionHeader>Prizes</SectionHeader>
          <Sub>2024–25 prize structure</Sub>
          <div className="space-y-2">
            {prizes.map((p) => (
              <div
                key={p.item}
                className="flex justify-between items-center px-4 py-2.5 rounded-lg"
                style={{ background: "#111827", border: "1px solid #1F2937" }}
              >
                <span className="text-sm" style={{ color: "#9CA3AF" }}>
                  {p.item}
                </span>
                <span className="text-sm font-bold" style={{ color: G.light }}>
                  {p.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader>Eligibility</SectionHeader>
          <Sub>Who can compete</Sub>
          <Card>
            <ul className="space-y-2 text-sm" style={{ color: "#9CA3AF" }}>
              {[
                "High school students grades 9–12 only",
                "Teams of 1 or 2 students",
                "Team members can be from different schools or states",
                "Both members register individually under same state event",
                "$25 per-person registration fee",
                "Middle school & college students ineligible",
                "Any publicly traded company worldwide",
                "Buy, Sell, or Hold recommendations all permitted",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span style={{ color: G.light, flexShrink: 0 }}>→</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div>
        <SectionHeader>Key Dates</SectionHeader>
        <Sub>2025–26 competition cycle</Sub>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              date: "Feb 20, 2026",
              label: "Submission Deadline",
              detail: "11:59 PM PST · All 3 deliverables in one email",
            },
            {
              date: "May 28–29, 2026",
              label: "Global Finals",
              detail: "Cornell Tech, Roosevelt Island, New York City",
            },
            {
              date: "Year-round",
              label: "Prep Nights",
              detail: "YIS Zoom sessions with past judges & winners",
            },
          ].map((d) => (
            <Card key={d.date}>
              <div
                className="text-sm font-bold mb-1"
                style={{ color: G.light }}
              >
                {d.date}
              </div>
              <div
                className="text-sm font-semibold mb-1"
                style={{ color: "#F9FAFB" }}
              >
                {d.label}
              </div>
              <div className="text-xs" style={{ color: "#6B7280" }}>
                {d.detail}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Rubric ─────────────────────────────────────────────────────────────
function RubricTab() {
  const investmentCriteria = [
    { label: "Logical sense & sound investment principles", pts: 15 },
    { label: "Insight into company and industry", pts: 15 },
    { label: "Sound financial analysis", pts: 10 },
    { label: "ESG and AI considerations", pts: 10 },
  ];
  const presentationCriteria = [
    { label: "Used bullets & elaborated on topics", pts: 10 },
    { label: "Insight into company and industry", pts: 5 },
    { label: "Sound financial analysis", pts: 5 },
    { label: "Good pace", pts: 5 },
  ];
  const videoCriteria = [
    { label: "Clear presentation & under 10 minutes", pts: 10 },
    { label: "Adequate knowledge of the company", pts: 5 },
    { label: "Professional presentation", pts: 5 },
    { label: "Eye contact & presentation skills", pts: 5 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <SectionHeader>100-Point Scoring Rubric</SectionHeader>
        <Sub>
          Understand exactly where every point comes from — and where teams lose
          them
        </Sub>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Investment Idea",
            pts: 50,
            color: G.primary,
            note: "Worth more than slides + video combined",
          },
          {
            label: "PowerPoint Slides",
            pts: 25,
            color: "#6366F1",
            note: "Bullets, visuals, pacing",
          },
          {
            label: "YouTube Video",
            pts: 25,
            color: "#F59E0B",
            note: "Delivery, knowledge, professionalism",
          },
        ].map((s) => (
          <Card key={s.label}>
            <div
              className="text-3xl font-bold font-serif mb-1"
              style={{ color: s.color }}
            >
              {s.pts}
            </div>
            <div
              className="font-semibold text-sm mb-1"
              style={{ color: "#F9FAFB" }}
            >
              {s.label}
            </div>
            <div className="text-xs" style={{ color: "#6B7280" }}>
              {s.note}
            </div>
          </Card>
        ))}
      </div>

      {/* Investment Idea breakdown */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-semibold" style={{ color: "#F9FAFB" }}>
            Investment Idea
          </span>
          <GreenBadge>50 pts</GreenBadge>
        </div>
        {investmentCriteria.map((c) => (
          <PointBar
            key={c.label}
            label={c.label}
            pts={c.pts}
            max={50}
            color={G.primary}
          />
        ))}
        <div
          className="mt-4 p-3 rounded-lg text-xs"
          style={{
            background: "rgba(34,197,94,0.07)",
            border: `1px solid ${G.border}`,
            color: "#9CA3AF",
          }}
        >
          <strong style={{ color: G.light }}>Key insight:</strong> Logical
          reasoning (15pts) + company/industry insight (15pts) = 30 of 50
          points. A compelling thesis with moderate modeling beats a great DCF
          with no narrative.
        </div>
      </Card>

      {/* Presentation breakdown */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-semibold" style={{ color: "#F9FAFB" }}>
            PowerPoint Presentation
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{
              background: "rgba(99,102,241,0.15)",
              color: "#818CF8",
              border: "1px solid rgba(99,102,241,0.3)",
              fontFamily: "monospace",
            }}
          >
            25 pts
          </span>
        </div>
        {presentationCriteria.map((c) => (
          <PointBar
            key={c.label}
            label={c.label}
            pts={c.pts}
            max={25}
            color="#6366F1"
          />
        ))}
      </Card>

      {/* Video breakdown */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-semibold" style={{ color: "#F9FAFB" }}>
            YouTube Video
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{
              background: "rgba(245,158,11,0.15)",
              color: "#FCD34D",
              border: "1px solid rgba(245,158,11,0.3)",
              fontFamily: "monospace",
            }}
          >
            25 pts
          </span>
        </div>
        {videoCriteria.map((c) => (
          <PointBar
            key={c.label}
            label={c.label}
            pts={c.pts}
            max={25}
            color="#F59E0B"
          />
        ))}
      </Card>

      {/* Strategy tip */}
      <Card style={{ border: `1px solid ${G.border}` }}>
        <div className="font-semibold text-sm mb-3" style={{ color: G.light }}>
          Winning Strategy
        </div>
        <div
          className="grid grid-cols-2 gap-3 text-xs"
          style={{ color: "#9CA3AF" }}
        >
          {[
            {
              title: "Prioritize thesis quality",
              body: "15+15 = 30 pts on logic & insight. Spend 60% of your time perfecting the investment argument.",
            },
            {
              title: "Don't skip ESG/AI",
              body: "10 pts that most teams underweight. Genuine integration beats a tagged-on paragraph.",
            },
            {
              title: "Financial analysis adds up",
              body: "10 pts in report + 5 in slides = 15 total. A clean DCF + P/E comps covers this entirely.",
            },
            {
              title: "Video pace matters",
              body: "5 pts for pace. Practice to hit 9:30–10:00 exactly. Speeding up the video disqualifies you.",
            },
          ].map((t) => (
            <div
              key={t.title}
              className="p-3 rounded-lg"
              style={{ background: "#0A0F1C" }}
            >
              <div className="font-semibold mb-1" style={{ color: "#D1D5DB" }}>
                {t.title}
              </div>
              <div>{t.body}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Report Guide ───────────────────────────────────────────────────────
function ReportTab() {
  const [open, setOpen] = useState<number | null>(0);
  const sections = [
    {
      num: "01",
      title: "Business Description",
      what: "Revenue and operating profit by segment with percentages and margins. Geographic revenue split. Key stats: market cap, EV, 52-week range, FCF yield, ROE, dividend yield. Top institutional shareholders.",
      tips: [
        "Break revenue by segment with % of total",
        "Include operating margin per segment",
        "List top 3–5 institutional holders (Vanguard, BlackRock, etc.)",
        "Show geographic revenue split if available",
      ],
      mistake:
        "Describing the company in general terms without specific numbers — judges expect the same depth as a Morningstar or Bloomberg report.",
    },
    {
      num: "02",
      title: "Industry Overview & Competitive Positioning",
      what: "Market size with CAGR, competitor identification, market share analysis (pie charts recommended), and why the company's competitive position is durable using the economic moat framework.",
      tips: [
        "Lead with TAM and CAGR",
        "Use a pie chart for market share",
        "Frame competitive advantage using moat types: brand, cost, switching costs, network effects, intangibles",
        "Explain why the moat is durable, not just that it exists",
      ],
      mistake:
        "Listing competitors without explaining positioning — judges want variant perception, not a Wikipedia overview.",
    },
    {
      num: "03",
      title: "Investment Summary",
      what: "Clear Buy/Sell/Hold recommendation with 2–3 key investment arguments. Must explain why the market is mispricing the stock — the variant perception that creates the opportunity.",
      tips: [
        "Start with one sentence: '[Company] is a Buy because...'",
        "State 2–3 distinct reasons — not just 'great company'",
        "Explain specifically why the market is wrong",
        "Include current price and target price with % upside/downside",
      ],
      mistake:
        "Describing why a company is good without explaining why the stock is mispriced. That's not an investment thesis.",
    },
    {
      num: "04",
      title: "Valuation / Financial Analysis",
      what: "DCF analysis using projected free cash flows discounted at WACC plus terminal value. Relative valuation using comparable company multiples (P/E, EV/EBITDA). Target price derived from and cross-checked between both methods.",
      tips: [
        "Use YIS's Google Sheets DCF tool as a starting point",
        "Show your growth rate assumptions and justify them",
        "Cross-check DCF target price with P/E comps",
        "Present bear/base/bull scenarios if possible",
      ],
      mistake:
        "Using a DCF with unjustified assumptions. Judges ask 'Why 15% growth?' If you can't defend it, change it.",
    },
    {
      num: "05",
      title: "Investment Risks",
      what: "Company-specific and industry-level risks with mitigation strategies. Must be specific to your thesis — generic market risks are insufficient.",
      tips: [
        "Identify 3–5 risks specific to your investment thesis",
        "For each risk: what it is, how likely, what would mitigate it",
        "Include the risk that would make you change your recommendation",
        "Judges will ask about this in Q&A — know your risks cold",
      ],
      mistake:
        "Listing generic risks like 'economic downturn' or 'competition' without connecting them to why they threaten your specific thesis.",
    },
    {
      num: "06",
      title: "ESG Considerations",
      what: "Environmental, Social, and Governance analysis. LEED certifications, GHG targets, DEI data, board composition, governance structure. Integrate into the thesis — not a box-check appendix.",
      tips: [
        "Find specific ESG metrics (GHG reduction %, charitable $ amount, employee hours)",
        "Explain how ESG factors affect the investment thesis",
        "Check the company's latest sustainability report",
        "Note ESG risks as well as positives",
      ],
      mistake:
        "One generic paragraph at the end. ESG + AI = 10 points combined. Treat it like a real section.",
    },
    {
      num: "07",
      title: "AI Impact Analysis",
      what: "How AI specifically creates opportunity or risk for the company. This is a distinct required section — separate from ESG. Analyze both tailwinds (AI adoption, productivity gains) and headwinds (disruption risk, competitive threat).",
      tips: [
        "Be specific: how does AI change this company's competitive position?",
        "Quantify where possible (cost savings, revenue potential)",
        "Consider both opportunity (AI as tailwind) and risk (AI as disruptor)",
        "Link AI impact back to your investment thesis",
      ],
      mistake:
        "Generic 'AI is transforming every industry' statements. Judges want analysis specific to your company's business model.",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <SectionHeader>7 Mandatory Report Sections</SectionHeader>
        <Sub>
          Every section must appear in the report · 10-page limit + unlimited
          appendix
        </Sub>
      </div>
      {sections.map((s, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${open === i ? G.border : "#1F2937"}` }}
        >
          <button
            className="w-full flex items-center gap-4 px-5 py-4 text-left"
            style={{
              background: open === i ? "rgba(34,197,94,0.05)" : "#111827",
              cursor: "pointer",
              border: "none",
            }}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span
              className="text-xs font-bold flex-shrink-0"
              style={{ color: G.light, fontFamily: "monospace" }}
            >
              {s.num}
            </span>
            <span
              className="font-semibold text-sm flex-1"
              style={{ color: "#F9FAFB" }}
            >
              {s.title}
            </span>
            <span style={{ color: "#6B7280", fontSize: "18px", lineHeight: 1 }}>
              {open === i ? "−" : "+"}
            </span>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <div
                  className="px-5 pb-5 space-y-4"
                  style={{ background: "rgba(34,197,94,0.03)" }}
                >
                  <div>
                    <div
                      className="text-xs font-semibold mb-2"
                      style={{
                        color: "#6B7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      What judges expect
                    </div>
                    <p className="text-sm" style={{ color: "#9CA3AF" }}>
                      {s.what}
                    </p>
                  </div>
                  <div>
                    <div
                      className="text-xs font-semibold mb-2"
                      style={{
                        color: "#6B7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Tips
                    </div>
                    <ul className="space-y-1">
                      {s.tips.map((t, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm"
                          style={{ color: "#D1D5DB" }}
                        >
                          <span style={{ color: G.light, flexShrink: 0 }}>
                            ✓
                          </span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div
                    className="p-3 rounded-lg text-xs"
                    style={{
                      background: "rgba(239,68,68,0.07)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "#FCA5A5",
                    }}
                  >
                    <strong style={{ color: "#F87171" }}>
                      Common mistake:{" "}
                    </strong>
                    {s.mistake}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Valuation / DCF Calculator ────────────────────────────────────────
function ValuationTab() {
  const [currentFCF, setCurrentFCF] = useState(1000); // $M
  const [growthRate, setGrowthRate] = useState(12); // %
  const [terminalGrowth, setTerminalGrowth] = useState(3); // %
  const [wacc, setWacc] = useState(10); // %
  const [years, setYears] = useState(5);
  const [sharesOut, setSharesOut] = useState(500); // M shares
  const [currentPrice, setCurrentPrice] = useState(100); // $

  const results = useMemo(() => {
    const r = wacc / 100;
    const g = terminalGrowth / 100;
    const gr = growthRate / 100;
    let pvSum = 0;
    const rows: { year: number; fcf: number; pv: number }[] = [];
    for (let y = 1; y <= years; y++) {
      const fcf = currentFCF * Math.pow(1 + gr, y);
      const pv = fcf / Math.pow(1 + r, y);
      pvSum += pv;
      rows.push({ year: y, fcf: Math.round(fcf), pv: Math.round(pv) });
    }
    const lastFCF = currentFCF * Math.pow(1 + gr, years);
    const terminalValue = (lastFCF * (1 + g)) / (r - g);
    const pvTerminal = r > g ? terminalValue / Math.pow(1 + r, years) : 0;
    const totalValue = pvSum + pvTerminal;
    const intrinsicPerShare =
      sharesOut > 0 ? (totalValue / sharesOut) * 1000 : 0; // FCF in $M, shares in M → $/share * 1000
    // Actually: totalValue is in $M (since currentFCF is in $M), sharesOut is in M
    // intrinsic = totalValue ($M) / sharesOut (M) = $ per share → no scaling needed if both are in $M and M shares
    const intrinsicPerShareFixed = sharesOut > 0 ? totalValue / sharesOut : 0;
    const upside =
      currentPrice > 0
        ? ((intrinsicPerShareFixed - currentPrice) / currentPrice) * 100
        : 0;
    return {
      rows,
      pvSum: Math.round(pvSum),
      pvTerminal: Math.round(pvTerminal),
      totalValue: Math.round(totalValue),
      intrinsicPerShare: Math.round(intrinsicPerShareFixed * 100) / 100,
      upside: Math.round(upside * 10) / 10,
    };
  }, [
    currentFCF,
    growthRate,
    terminalGrowth,
    wacc,
    years,
    sharesOut,
    currentPrice,
  ]);

  const Inp = ({
    label,
    value,
    onChange,
    min,
    max,
    step,
    unit,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    step: number;
    unit?: string;
  }) => (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs" style={{ color: "#6B7280" }}>
          {label}
        </label>
        <span className="text-xs font-bold" style={{ color: G.light }}>
          {value}
          {unit ?? ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none"
        style={{ accentColor: G.primary, background: "#1F2937" }}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <SectionHeader>DCF Calculator</SectionHeader>
        <Sub>
          YIS expects both a DCF and relative valuation (P/E comps) — use this
          to build your target price
        </Sub>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Inputs */}
        <Card>
          <div
            className="text-xs font-semibold mb-4"
            style={{
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Assumptions
          </div>
          <div className="space-y-5">
            <div>
              <label
                className="text-xs block mb-1"
                style={{ color: "#6B7280" }}
              >
                Current Free Cash Flow ($M)
              </label>
              <input
                type="number"
                value={currentFCF}
                onChange={(e) => setCurrentFCF(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "#0A0F1C",
                  border: "1px solid #374151",
                  color: "#F9FAFB",
                }}
              />
            </div>
            <Inp
              label="Revenue / FCF Growth Rate"
              value={growthRate}
              onChange={setGrowthRate}
              min={-20}
              max={50}
              step={0.5}
              unit="%"
            />
            <Inp
              label="Forecast Period (Years)"
              value={years}
              onChange={setYears}
              min={3}
              max={10}
              step={1}
              unit=" yrs"
            />
            <Inp
              label="Discount Rate (WACC)"
              value={wacc}
              onChange={setWacc}
              min={5}
              max={20}
              step={0.5}
              unit="%"
            />
            <Inp
              label="Terminal Growth Rate"
              value={terminalGrowth}
              onChange={setTerminalGrowth}
              min={0}
              max={5}
              step={0.25}
              unit="%"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="text-xs block mb-1"
                  style={{ color: "#6B7280" }}
                >
                  Shares Outstanding (M)
                </label>
                <input
                  type="number"
                  value={sharesOut}
                  onChange={(e) => setSharesOut(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "#0A0F1C",
                    border: "1px solid #374151",
                    color: "#F9FAFB",
                  }}
                />
              </div>
              <div>
                <label
                  className="text-xs block mb-1"
                  style={{ color: "#6B7280" }}
                >
                  Current Price ($)
                </label>
                <input
                  type="number"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: "#0A0F1C",
                    border: "1px solid #374151",
                    color: "#F9FAFB",
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "PV of FCFs",
                value: `$${results.pvSum.toLocaleString()}M`,
              },
              {
                label: "PV of Terminal Value",
                value: `$${results.pvTerminal.toLocaleString()}M`,
              },
              {
                label: "Total Enterprise Value",
                value: `$${results.totalValue.toLocaleString()}M`,
              },
              {
                label: "Intrinsic Value / Share",
                value: `$${results.intrinsicPerShare}`,
              },
            ].map((r) => (
              <Card key={r.label}>
                <div className="text-xs mb-1" style={{ color: "#6B7280" }}>
                  {r.label}
                </div>
                <div
                  className="font-bold text-lg font-serif"
                  style={{ color: G.light }}
                >
                  {r.value}
                </div>
              </Card>
            ))}
          </div>

          {/* Target price result */}
          <Card
            style={{
              border: `1px solid ${results.upside > 0 ? G.border : "rgba(239,68,68,0.3)"}`,
              background:
                results.upside > 0
                  ? "rgba(34,197,94,0.05)"
                  : "rgba(239,68,68,0.05)",
            }}
          >
            <div className="text-center">
              <div className="text-xs mb-2" style={{ color: "#6B7280" }}>
                Target Price vs Current Price
              </div>
              <div
                className="text-4xl font-bold font-serif mb-1"
                style={{ color: results.upside > 0 ? G.light : "#F87171" }}
              >
                {results.upside > 0 ? "+" : ""}
                {results.upside}%
              </div>
              <div className="text-sm" style={{ color: "#9CA3AF" }}>
                DCF Target:{" "}
                <strong style={{ color: "#F9FAFB" }}>
                  ${results.intrinsicPerShare}
                </strong>{" "}
                vs Current:{" "}
                <strong style={{ color: "#F9FAFB" }}>${currentPrice}</strong>
              </div>
              <div className="text-xs mt-2" style={{ color: "#6B7280" }}>
                {results.upside > 15
                  ? "Strong Buy signal"
                  : results.upside > 0
                    ? "Modest upside — check comps"
                    : results.upside > -15
                      ? "Near fair value"
                      : "Overvalued at current price"}
              </div>
            </div>
          </Card>

          {/* FCF projection table */}
          <Card>
            <div
              className="text-xs font-semibold mb-3"
              style={{
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              FCF Projections
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: "#6B7280" }}>
                  <th className="text-left pb-2">Year</th>
                  <th className="text-right pb-2">FCF ($M)</th>
                  <th className="text-right pb-2">PV ($M)</th>
                </tr>
              </thead>
              <tbody>
                {results.rows.map((r) => (
                  <tr key={r.year} style={{ borderTop: "1px solid #1F2937" }}>
                    <td className="py-1.5" style={{ color: "#9CA3AF" }}>
                      Year {r.year}
                    </td>
                    <td
                      className="py-1.5 text-right"
                      style={{ color: "#D1D5DB" }}
                    >
                      {r.fcf.toLocaleString()}
                    </td>
                    <td
                      className="py-1.5 text-right"
                      style={{ color: G.light }}
                    >
                      {r.pv.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: "1px solid #374151" }}>
                  <td className="pt-2" style={{ color: "#9CA3AF" }}>
                    Terminal
                  </td>
                  <td />
                  <td
                    className="pt-2 text-right font-bold"
                    style={{ color: G.light }}
                  >
                    {results.pvTerminal.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      {/* P/E Comps guide */}
      <Card>
        <div
          className="font-semibold text-sm mb-3"
          style={{ color: "#F9FAFB" }}
        >
          Relative Valuation — P/E Comps
        </div>
        <p className="text-sm mb-4" style={{ color: "#9CA3AF" }}>
          YIS positions the P/E ratio as the single most important valuation
          metric. Cross-check your DCF target with peer multiples.
        </p>
        <div className="grid grid-cols-4 gap-3 text-xs">
          {[
            {
              metric: "P/E Ratio",
              use: "Most important per YIS. Compare to peers and 5-year historical average.",
            },
            {
              metric: "EV/EBITDA",
              use: "Better for capital-intensive companies. Accounts for debt levels.",
            },
            {
              metric: "Price/Book",
              use: "Useful for financials. Compare to ROE — high P/B needs high ROE.",
            },
            {
              metric: "FCF Yield",
              use: "FCF/Market Cap. Shows cash generation vs. price. Higher = cheaper.",
            },
          ].map((m) => (
            <div
              key={m.metric}
              className="p-3 rounded-lg"
              style={{ background: "#0A0F1C" }}
            >
              <div className="font-bold mb-1" style={{ color: G.light }}>
                {m.metric}
              </div>
              <div style={{ color: "#6B7280" }}>{m.use}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Checklist ───────────────────────────────────────────────────────────
function ChecklistTab() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setChecked((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const sections = [
    {
      title: "Written Report (PDF)",
      color: G.primary,
      items: [
        {
          id: "r1",
          text: "Cover page: names, school, state, emails, company, ticker, exchange, sector",
        },
        {
          id: "r2",
          text: "Cover page: Buy/Sell/Hold recommendation clearly stated",
        },
        {
          id: "r3",
          text: "Cover page: current stock price with date and target price with % upside/downside",
        },
        {
          id: "r4",
          text: "Section 1: Business Description with revenue by segment (%)",
        },
        {
          id: "r5",
          text: "Section 2: Industry overview with market size, CAGR, market share",
        },
        {
          id: "r6",
          text: "Section 3: Investment Summary with variant perception (why market is wrong)",
        },
        {
          id: "r7",
          text: "Section 4: DCF valuation + relative valuation (P/E comps)",
        },
        {
          id: "r8",
          text: "Section 5: Investment Risks (company-specific, not generic)",
        },
        {
          id: "r9",
          text: "Section 6: ESG Considerations (with specific metrics)",
        },
        {
          id: "r10",
          text: "Section 7: AI Impact Analysis (specific to company's business model)",
        },
        { id: "r11", text: "Under 10 pages (not counting appendix)" },
        { id: "r12", text: "Saved as PDF — not Google Drive link" },
        { id: "r13", text: "No AI-generated content anywhere in the report" },
      ],
    },
    {
      title: "PowerPoint Presentation",
      color: "#6366F1",
      items: [
        { id: "p1", text: "Saved as .ppt or .pdf — NOT Keynote" },
        { id: "p2", text: "Bullet points (not paragraphs) throughout" },
        {
          id: "p3",
          text: "Charts/graphs for financial analysis (pie charts for market share)",
        },
        { id: "p4", text: "Mirrors report sections in the same order" },
        {
          id: "p5",
          text: "Visual aids for valuation (DCF assumptions, target price clearly shown)",
        },
        { id: "p6", text: "ESG and AI sections included as slides" },
      ],
    },
    {
      title: "YouTube Video",
      color: "#EF4444",
      items: [
        { id: "v1", text: "Student(s) are visible on camera" },
        {
          id: "v2",
          text: "PowerPoint is visible on screen during presentation",
        },
        { id: "v3", text: "Under 10 minutes — do NOT speed up the video" },
        {
          id: "v4",
          text: "Video is public or unlisted-but-accessible through May 2026",
        },
        {
          id: "v5",
          text: "No heavy editing — judges want to see the actual presentation",
        },
        { id: "v6", text: "Professional setting and presentation style" },
      ],
    },
    {
      title: "Submission",
      color: "#F59E0B",
      items: [
        {
          id: "s1",
          text: "All 3 deliverables in ONE email to stockpitch2026@yis.org",
        },
        {
          id: "s2",
          text: "All files are attached directly — no Google Drive links",
        },
        { id: "s3", text: "File permissions allow judges to open everything" },
        {
          id: "s4",
          text: "Submitted before February 20, 2026 at 11:59 PM PST",
        },
        {
          id: "s5",
          text: "Both team members registered individually on MyYIS Portal",
        },
        { id: "s6", text: "$25 per-person fee paid" },
      ],
    },
  ];

  const total = sections.flatMap((s) => s.items).length;
  const done = checked.size;

  return (
    <div className="space-y-6">
      <div>
        <SectionHeader>Submission Checklist</SectionHeader>
        <Sub>
          Missing any one deliverable results in disqualification. No exceptions
          for late submissions.
        </Sub>
      </div>

      {/* Progress */}
      <Card>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: "#F9FAFB" }}>
            Overall Progress
          </span>
          <span className="text-sm font-bold" style={{ color: G.light }}>
            {done} / {total}
          </span>
        </div>
        <div
          className="w-full rounded-full h-2"
          style={{ background: "#1F2937" }}
        >
          <motion.div
            animate={{ width: `${(done / total) * 100}%` }}
            className="h-2 rounded-full"
            style={{ background: G.primary }}
          />
        </div>
        {done === total && (
          <div
            className="mt-3 text-center text-sm font-semibold"
            style={{ color: G.light }}
          >
            Ready to submit!
          </div>
        )}
      </Card>

      {sections.map((section) => (
        <Card key={section.title}>
          <div
            className="font-semibold text-sm mb-4 flex items-center gap-2"
            style={{ color: "#F9FAFB" }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: section.color }}
            />
            {section.title}
            <span className="ml-auto text-xs" style={{ color: "#6B7280" }}>
              {section.items.filter((i) => checked.has(i.id)).length}/
              {section.items.length}
            </span>
          </div>
          <div className="space-y-2">
            {section.items.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <div
                  className="flex-shrink-0 w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-all"
                  style={{
                    background: checked.has(item.id)
                      ? section.color
                      : "transparent",
                    border: `1.5px solid ${checked.has(item.id) ? section.color : "#374151"}`,
                  }}
                  onClick={() => toggle(item.id)}
                >
                  {checked.has(item.id) && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path
                        d="M1 3.5L3.5 6L8 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className="text-sm"
                  style={{
                    color: checked.has(item.id) ? "#6B7280" : "#D1D5DB",
                    textDecoration: checked.has(item.id)
                      ? "line-through"
                      : "none",
                  }}
                  onClick={() => toggle(item.id)}
                >
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Tab: Q&A Prep ────────────────────────────────────────────────────────────
function QATab() {
  const [open, setOpen] = useState<number | null>(null);
  const questions = [
    {
      q: "Why is the market wrong about this stock?",
      category: "Thesis",
      difficulty: "Hard",
      answer:
        "This is the core question. You must have a 'variant perception' — a view that differs from consensus. Example frameworks: the market underestimates a growth driver, overweights a temporary headwind, or applies the wrong peer group for valuation. Don't say 'the company is undervalued.' Say specifically WHY the market has mispriced it.",
    },
    {
      q: "Walk me through how you arrived at your target price.",
      category: "Valuation",
      difficulty: "Hard",
      answer:
        "Structure your answer: (1) DCF: 'We projected FCF at X% growth for Y years, discounted at Z% WACC, adding terminal value at W% growth, giving intrinsic value of $X per share.' (2) Comps cross-check: 'This is confirmed by the peer group trading at Xp P/E vs. our target P/E of Y.' (3) Conclude with margin of safety if you have one.",
    },
    {
      q: "What are the key risks and how would you mitigate them?",
      category: "Risks",
      difficulty: "Medium",
      answer:
        "Name 2–3 specific risks. For each: what it is, how likely you assess it, and what would change your view. Judges respect intellectual honesty — don't minimize risks. Frame them as 'risks to our thesis' not generic 'the economy could slow down.' Show you've thought about what could make you wrong.",
    },
    {
      q: "What catalysts would drive the stock to your target?",
      category: "Thesis",
      difficulty: "Medium",
      answer:
        "Catalysts are events that force the market to reprice the stock. Examples: earnings beat, product launch, management change, regulatory approval, spin-off, activist investor, acquisition. Be specific and time-bound. 'In Q3 2026, the company is expected to report [X] which should demonstrate [Y] to the market.'",
    },
    {
      q: "How does this company compare to its closest competitors?",
      category: "Industry",
      difficulty: "Medium",
      answer:
        "Have 3–4 comps ready with their key multiples (P/E, EV/EBITDA, growth rate). Explain why your company deserves a premium or discount. Use the moat framework: if your company has a stronger economic moat, it should trade at a premium. If it's cheaper despite a stronger moat, that's your opportunity.",
    },
    {
      q: "What would make you change your recommendation?",
      category: "Risks",
      difficulty: "Medium",
      answer:
        "This tests intellectual honesty. Identify 1–2 specific developments that would flip your thesis. Be concrete: 'If revenue growth falls below X% for two consecutive quarters' or 'If the company loses its key contract with [customer].' Avoid vague answers — judges respect precision.",
    },
    {
      q: "How does AI specifically impact this company's business model?",
      category: "AI/ESG",
      difficulty: "Medium",
      answer:
        "Answer in two parts: (1) Opportunity — how can this company use AI to reduce costs, improve products, or grow revenue? Be specific. (2) Risk — could AI disrupt this company's competitive moat? Name a specific competitor or technology. Then link it back to your investment thesis: does AI make your Bull/Bear case stronger?",
    },
    {
      q: "What is your variant perspective?",
      category: "Thesis",
      difficulty: "Hard",
      answer:
        "Variant perception = what you believe that the market doesn't. This is different from 'I think the company is good.' Examples: 'Consensus models assume X, but we believe Y because Z.' 'The market is using Tech sector multiples but this company's economics are more like a consumer staple.' If your view is the same as consensus, your stock is already fairly priced.",
    },
    {
      q: "Why did you choose this company?",
      category: "General",
      difficulty: "Easy",
      answer:
        "Have a genuine, concise answer. Judges appreciate intellectual curiosity. Don't say you chose it because it's a big, famous company — that's a red flag. Say you identified a specific opportunity, noticed an inflection in the business, or found a misunderstood risk that the market is overweighting.",
    },
    {
      q: "What are the ESG risks or opportunities specific to this company?",
      category: "AI/ESG",
      difficulty: "Medium",
      answer:
        "Don't recite generic ESG points. Name 1–2 material ESG factors for this specific company. For energy companies: GHG targets and regulatory risk. For tech: data privacy and governance. For consumer: supply chain labor practices. Then connect: does the ESG factor create a tailwind (e.g., green capex → cost savings) or risk (e.g., regulatory exposure)?",
    },
  ];

  const diffColor = (d: string) =>
    d === "Hard" ? "#F87171" : d === "Medium" ? "#FCD34D" : "#4ADE80";
  const catColor = (c: string) =>
    c === "Thesis"
      ? "#818CF8"
      : c === "Valuation"
        ? G.light
        : c === "Risks"
          ? "#F87171"
          : c === "Industry"
            ? "#60A5FA"
            : "#FCD34D";

  return (
    <div className="space-y-4">
      <div>
        <SectionHeader>Q&A Prep</SectionHeader>
        <Sub>
          Standard judge questions from Bloomberg, Goldman Sachs, J.P. Morgan,
          and PIMCO panels at the NYC Summit
        </Sub>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {["Thesis", "Valuation", "Risks", "Industry", "AI/ESG", "General"].map(
          (cat) => (
            <span
              key={cat}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: "#111827",
                border: "1px solid #1F2937",
                color: catColor(cat),
              }}
            >
              {cat}
            </span>
          ),
        )}
      </div>

      {questions.map((q, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${open === i ? G.border : "#1F2937"}` }}
        >
          <button
            className="w-full flex items-start gap-3 px-5 py-4 text-left"
            style={{
              background: open === i ? "rgba(34,197,94,0.05)" : "#111827",
              cursor: "pointer",
              border: "none",
            }}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: "#0A0F1C",
                    color: catColor(q.category),
                    border: "1px solid #1F2937",
                  }}
                >
                  {q.category}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: "#0A0F1C",
                    color: diffColor(q.difficulty),
                    border: "1px solid #1F2937",
                  }}
                >
                  {q.difficulty}
                </span>
              </div>
              <span
                className="font-semibold text-sm"
                style={{ color: "#F9FAFB" }}
              >
                "{q.q}"
              </span>
            </div>
            <span
              style={{
                color: "#6B7280",
                fontSize: "18px",
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {open === i ? "−" : "+"}
            </span>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <div
                  className="px-5 pb-5"
                  style={{ background: "rgba(34,197,94,0.03)" }}
                >
                  <div
                    className="text-xs font-semibold mb-2"
                    style={{
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    How to answer
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#9CA3AF" }}
                  >
                    {q.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <Card style={{ border: `1px solid ${G.border}` }}>
        <div className="font-semibold text-sm mb-2" style={{ color: G.light }}>
          Live Round Format
        </div>
        <div className="text-sm" style={{ color: "#9CA3AF" }}>
          Each team gets{" "}
          <strong style={{ color: "#F9FAFB" }}>20 minutes total</strong>: 10-min
          presentation → 5-min Q&A → 5-min judge feedback. Practice hitting
          exactly 10 minutes on your presentation so you have full Q&A time. The
          Q&A is scored implicitly — how you defend your thesis matters as much
          as what's in the report.
        </div>
      </Card>
    </div>
  );
}

// ─── Main Suite ───────────────────────────────────────────────────────────────
function YISSuite() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabContent: Record<TabId, React.ReactNode> = {
    overview: <OverviewTab />,
    rubric: <RubricTab />,
    report: <ReportTab />,
    valuation: <ValuationTab />,
    checklist: <ChecklistTab />,
    qa: <QATab />,
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0A0F1C" }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          background: "#111827",
          borderBottom: "1px solid #374151",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="font-serif leading-none"
            style={{ fontSize: "18px", color: "#F9FAFB" }}
          >
            FundSim
          </span>
          <span style={{ color: "#4B5563" }}>/</span>
          <span
            className="text-xs font-bold tracking-widest px-2 py-1 rounded"
            style={{
              background: G.dim,
              color: G.light,
              border: `1px solid ${G.border}`,
              fontFamily: "monospace",
            }}
          >
            YIS SUITE
          </span>
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = "";
          }}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{
            color: "#9CA3AF",
            textDecoration: "none",
            background: "rgba(55,65,81,0.5)",
            border: "1px solid #374151",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#F9FAFB";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#9CA3AF";
          }}
        >
          ← Back to FundSim
        </a>
      </div>

      {/* Tab bar */}
      <div
        className="px-6 pt-4 pb-0 flex gap-1 overflow-x-auto"
        style={{ borderBottom: "1px solid #1F2937" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 text-sm font-medium rounded-t-lg flex-shrink-0 transition-all"
            style={{
              background: activeTab === tab.id ? G.dim : "transparent",
              color: activeTab === tab.id ? G.light : "#6B7280",
              borderBottom:
                activeTab === tab.id
                  ? `2px solid ${G.primary}`
                  : "2px solid transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Entry Point ──────────────────────────────────────────────────────────────
export function YISFinanceSuite() {
  const [showSuite, setShowSuite] = useState(false);
  return showSuite ? (
    <YISSuite />
  ) : (
    <YISLanding onStart={() => setShowSuite(true)} />
  );
}
