import { useState, useMemo } from "react";
import { Copy, CheckCircle, Download, FileText } from "lucide-react";

const SECTORS = [
  "FinTech",
  "HealthTech",
  "SaaS",
  "Marketplace",
  "Deep Tech",
  "Consumer",
  "Climate",
  "Other",
];
const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C"];

interface FormData {
  companyName: string;
  sector: string;
  stage: string;
  hqLocation: string;
  foundedYear: number;
  oneLinePitch: string;
  problemStatement: string;
  solution: string;
  keyInsight: string;
  tam: string;
  sam: string;
  marketGrowthRate: string;
  arr: string;
  growthRate: string;
  keyCustomers: string;
  ceoBackground: string;
  ctoBackground: string;
  teamSize: string;
  valuation: string;
  raiseAmount: string;
  leadInvestor: string;
}

const defaultForm: FormData = {
  companyName: "",
  sector: "SaaS",
  stage: "Seed",
  hqLocation: "",
  foundedYear: 2024,
  oneLinePitch: "",
  problemStatement: "",
  solution: "",
  keyInsight: "",
  tam: "",
  sam: "",
  marketGrowthRate: "",
  arr: "",
  growthRate: "",
  keyCustomers: "",
  ceoBackground: "",
  ctoBackground: "",
  teamSize: "",
  valuation: "",
  raiseAmount: "",
  leadInvestor: "",
};

function getSectorRisk(sector: string): string {
  const risks: Record<string, string> = {
    FinTech:
      "Regulatory changes and compliance requirements may slow growth; mitigated by proactive licensing strategy.",
    HealthTech:
      "FDA approval timelines and HIPAA compliance add complexity; mitigated by experienced regulatory advisors.",
    SaaS: "Category commoditization and incumbent entrenchment; mitigated by deep workflow integrations and switching costs.",
    Marketplace:
      "Chicken-and-egg liquidity challenges; mitigated by supply-side seeding strategy and geographic focus.",
    "Deep Tech":
      "Long development cycles and capital intensity; mitigated by strong IP portfolio and academic partnerships.",
    Consumer:
      "High CAC and brand-building costs; mitigated by viral loops and community-led growth.",
    Climate:
      "Policy dependency and long payback periods; mitigated by technology-agnostic approach and blended finance.",
    Other:
      "Market timing and category creation risk; mitigated by strong customer validation and pilot programs.",
  };
  return risks[sector] || risks["Other"];
}

function getStageRisk(stage: string): string {
  const risks: Record<string, string> = {
    "Pre-Seed":
      "Product-market fit unproven at this stage; mitigated by tight iteration loops and founder domain expertise.",
    Seed: "Go-to-market motion not yet repeatable; mitigated by focused ICP and tight sales playbook development.",
    "Series A":
      "Scaling team and processes in parallel is challenging; mitigated by experienced VP hires and documented playbooks.",
    "Series B":
      "International expansion and multi-product complexity; mitigated by phased market entry and platform architecture.",
    "Series C":
      "Path to profitability and unit economics pressure; mitigated by mature operational cadence and pricing power.",
  };
  return (
    risks[stage] ||
    "Execution risk consistent with company stage; mitigated by experienced management team."
  );
}

function getCompetitiveRisk(sector: string): string {
  const risks: Record<string, string> = {
    FinTech:
      "Well-funded incumbents (Stripe, Square) and new entrants may compress margins; differentiated by vertical focus.",
    HealthTech:
      "Epic and Cerner may expand into adjacent markets; differentiated by interoperability and modern UX.",
    SaaS: "Large platforms (Salesforce, Microsoft) may bundle competing features; differentiated by best-in-class depth.",
    Marketplace:
      "Aggregator platforms may disintermediate; differentiated by community trust and quality curation.",
    "Deep Tech":
      "Well-capitalized R&D labs at FAANG may replicate; differentiated by proprietary data and deployment speed.",
    Consumer:
      "Low switching costs and copycat risk; differentiated by network effects and brand loyalty.",
    Climate:
      "Commoditization of hardware; differentiated by software layer and long-term offtake agreements.",
    Other:
      "Competitive dynamics evolving; differentiated by execution velocity and customer relationships.",
  };
  return (
    risks[sector] ||
    "Competitive landscape is evolving; differentiated by unique technology and customer focus."
  );
}

function getRecommendation(form: FormData): { label: string; color: string } {
  const filledFields = Object.values(form).filter(
    (v) => v !== "" && v !== 0,
  ).length;
  const total = Object.keys(form).length;
  const pct = filledFields / total;

  if (pct >= 0.85) return { label: "INVEST", color: "#34D399" };
  if (pct >= 0.5) return { label: "FURTHER DILIGENCE", color: "#F59E0B" };
  return { label: "PASS", color: "#F87171" };
}

function buildMemoText(form: FormData): string {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const rec = getRecommendation(form);
  const name = form.companyName || "[Company Name]";
  const stage = form.stage || "[Stage]";
  const sector = form.sector || "[Sector]";

  return `CONFIDENTIAL — INVESTMENT MEMO
${name} — ${stage} Investment
Prepared: ${today}
${"━".repeat(40)}

EXECUTIVE SUMMARY
${name} is a ${sector} company that ${form.oneLinePitch || "[one-line pitch]"}.
We recommend a $${form.raiseAmount || "[X]"}M investment at $${form.valuation || "[X]"}M pre-money.

INVESTMENT THESIS
${form.problemStatement || "[Problem statement]"} — this represents a significant gap in the market.
${form.solution || "[Solution]"} positions the company to capture meaningful share of the $${form.tam || "[X]"}B TAM.

THE OPPORTUNITY
• Market: $${form.tam || "[X]"}B TAM, $${form.sam || "[X]"}B SAM, growing at ${form.marketGrowthRate || "[X]"}% annually
• Why Now: ${form.keyInsight || "[Key insight / why now]"}
• Stage: ${stage} with ${form.arr || "[ARR / Revenue]"}

THE TEAM
• CEO: ${form.ceoBackground || "[CEO background]"}
• CTO: ${form.ctoBackground || "[CTO background]"}
• Team: ${form.teamSize || "[X]"} people

TRACTION
• Revenue: ${form.arr || "[ARR / Revenue]"}
• Growth: ${form.growthRate || "[X]"}% YoY
• Key customers: ${form.keyCustomers || "[Key customers]"}

DEAL TERMS
• Valuation: $${form.valuation || "[X]"}M pre-money
• Round: $${form.raiseAmount || "[X]"}M ${stage}
• Lead: ${form.leadInvestor || "[Lead investor]"}
• HQ: ${form.hqLocation || "[Location]"} | Founded: ${form.foundedYear}

RISKS & MITIGANTS
• Market Risk: ${getSectorRisk(sector)}
• Execution Risk: ${getStageRisk(stage)}
• Competitive Risk: ${getCompetitiveRisk(sector)}

${"━".repeat(40)}
RECOMMENDATION: ${rec.label}
${"━".repeat(40)}`;
}

const inputClass =
  "w-full bg-[#1F2937] border border-[#374151] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#34D399] transition-colors placeholder-[#4B5563]";
const labelClass =
  "block text-xs font-medium text-[#9CA3AF] mb-1 uppercase tracking-wide";
const sectionHeaderClass =
  "text-xs font-semibold text-[#34D399] uppercase tracking-widest mb-3 mt-5 first:mt-0";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export function DealMemoTab() {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [copied, setCopied] = useState(false);

  const memoText = useMemo(() => buildMemoText(form), [form]);
  const rec = useMemo(() => getRecommendation(form), [form]);

  function set(field: keyof FormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCopy() {
    navigator.clipboard.writeText(memoText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    const blob = new Blob([memoText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.companyName || "deal"}-memo.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const isEmpty =
    !form.companyName && !form.oneLinePitch && !form.problemStatement;

  // Split memo into lines for color-coded rendering
  function renderMemoLines() {
    return memoText.split("\n").map((line, i) => {
      const isHeader =
        line.startsWith("EXECUTIVE SUMMARY") ||
        line.startsWith("INVESTMENT THESIS") ||
        line.startsWith("THE OPPORTUNITY") ||
        line.startsWith("THE TEAM") ||
        line.startsWith("TRACTION") ||
        line.startsWith("DEAL TERMS") ||
        line.startsWith("RISKS & MITIGANTS") ||
        line.startsWith("RECOMMENDATION:") ||
        line.startsWith("CONFIDENTIAL");
      const isDivider = line.startsWith("━");
      const isBullet = line.startsWith("•");
      const isTitle = i === 1; // Company — Stage Investment line

      let color = "#D1D5DB";
      if (isHeader || isDivider) color = "#34D399";
      if (isBullet) {
        const colonIdx = line.indexOf(":");
        if (colonIdx !== -1) {
          const label = line.slice(0, colonIdx + 1);
          const value = line.slice(colonIdx + 1);
          return (
            <div key={i} style={{ color: "#D1D5DB", minHeight: "1.4em" }}>
              <span style={{ color: "#9CA3AF" }}>{label}</span>
              <span style={{ color: "#F9FAFB" }}>{value}</span>
            </div>
          );
        }
      }
      if (line.startsWith("RECOMMENDATION:")) {
        return (
          <div key={i} style={{ minHeight: "1.4em" }}>
            <span style={{ color: "#34D399", fontWeight: 700 }}>
              RECOMMENDATION:{" "}
            </span>
            <span style={{ color: rec.color, fontWeight: 700 }}>
              {rec.label}
            </span>
          </div>
        );
      }
      if (isTitle) color = "#F9FAFB";

      return (
        <div
          key={i}
          style={{
            color,
            minHeight: "1.4em",
            fontWeight: isHeader ? 600 : 400,
          }}
        >
          {line || "\u00A0"}
        </div>
      );
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Educational Note */}
      <div
        style={{
          background: "rgba(52,211,153,0.08)",
          border: "1px solid rgba(52,211,153,0.25)",
        }}
        className="rounded-xl px-5 py-4"
      >
        <div className="flex items-start gap-3">
          <FileText size={18} className="text-[#34D399] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#34D399] mb-1">
              About Deal Memos
            </p>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Investment memos are how VCs communicate investment decisions
              internally. Writing one forces you to articulate why a deal is
              compelling — and where the risks are. Fill in the form on the left
              and watch your memo generate in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Input Form */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#111827",
            border: "1px solid #1F2937",
            maxHeight: "75vh",
            overflowY: "auto",
          }}
        >
          <h3 className="text-base font-semibold text-white mb-4">
            Startup Details
          </h3>

          {/* Company Overview */}
          <p className={sectionHeaderClass}>Company Overview</p>

          <Field label="Company Name">
            <input
              className={inputClass}
              placeholder="e.g. Stripe"
              value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sector">
              <select
                className={inputClass}
                value={form.sector}
                onChange={(e) => set("sector", e.target.value)}
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stage">
              <select
                className={inputClass}
                value={form.stage}
                onChange={(e) => set("stage", e.target.value)}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="HQ Location">
              <input
                className={inputClass}
                placeholder="e.g. San Francisco, CA"
                value={form.hqLocation}
                onChange={(e) => set("hqLocation", e.target.value)}
              />
            </Field>
            <Field label="Founded Year">
              <input
                className={inputClass}
                type="number"
                value={form.foundedYear}
                onChange={(e) =>
                  set("foundedYear", parseInt(e.target.value) || 2024)
                }
              />
            </Field>
          </div>

          {/* The Opportunity */}
          <p className={sectionHeaderClass}>The Opportunity</p>

          <Field label="One-Line Pitch">
            <input
              className={inputClass}
              placeholder="e.g. Payments infrastructure for the internet"
              value={form.oneLinePitch}
              onChange={(e) => set("oneLinePitch", e.target.value)}
            />
          </Field>

          <Field label="Problem Statement">
            <textarea
              className={inputClass}
              rows={2}
              placeholder="What problem does this company solve?"
              value={form.problemStatement}
              onChange={(e) => set("problemStatement", e.target.value)}
              style={{ resize: "none" }}
            />
          </Field>

          <Field label="Solution">
            <textarea
              className={inputClass}
              rows={2}
              placeholder="How does the company solve it?"
              value={form.solution}
              onChange={(e) => set("solution", e.target.value)}
              style={{ resize: "none" }}
            />
          </Field>

          <Field label="Key Insight / Why Now">
            <input
              className={inputClass}
              placeholder="e.g. New API infrastructure enables..."
              value={form.keyInsight}
              onChange={(e) => set("keyInsight", e.target.value)}
            />
          </Field>

          {/* Market */}
          <p className={sectionHeaderClass}>Market</p>

          <div className="grid grid-cols-3 gap-3">
            <Field label="TAM ($B)">
              <input
                className={inputClass}
                type="number"
                placeholder="200"
                value={form.tam}
                onChange={(e) => set("tam", e.target.value)}
              />
            </Field>
            <Field label="SAM ($B)">
              <input
                className={inputClass}
                type="number"
                placeholder="40"
                value={form.sam}
                onChange={(e) => set("sam", e.target.value)}
              />
            </Field>
            <Field label="Growth Rate (%)">
              <input
                className={inputClass}
                type="number"
                placeholder="25"
                value={form.marketGrowthRate}
                onChange={(e) => set("marketGrowthRate", e.target.value)}
              />
            </Field>
          </div>

          {/* Traction */}
          <p className={sectionHeaderClass}>Traction</p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="ARR / Revenue">
              <input
                className={inputClass}
                placeholder="e.g. $2M ARR"
                value={form.arr}
                onChange={(e) => set("arr", e.target.value)}
              />
            </Field>
            <Field label="Growth Rate (% YoY)">
              <input
                className={inputClass}
                type="number"
                placeholder="150"
                value={form.growthRate}
                onChange={(e) => set("growthRate", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Key Customers">
            <input
              className={inputClass}
              placeholder="e.g. Shopify, Lyft, Amazon"
              value={form.keyCustomers}
              onChange={(e) => set("keyCustomers", e.target.value)}
            />
          </Field>

          {/* Team */}
          <p className={sectionHeaderClass}>Team</p>

          <Field label="CEO Background">
            <input
              className={inputClass}
              placeholder="e.g. Ex-PayPal PM, Stanford MBA"
              value={form.ceoBackground}
              onChange={(e) => set("ceoBackground", e.target.value)}
            />
          </Field>

          <Field label="CTO Background">
            <input
              className={inputClass}
              placeholder="e.g. Ex-Google Engineer, MIT CS"
              value={form.ctoBackground}
              onChange={(e) => set("ctoBackground", e.target.value)}
            />
          </Field>

          <Field label="Team Size">
            <input
              className={inputClass}
              type="number"
              placeholder="12"
              value={form.teamSize}
              onChange={(e) => set("teamSize", e.target.value)}
            />
          </Field>

          {/* Deal Terms */}
          <p className={sectionHeaderClass}>Deal Terms</p>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Valuation ($M)">
              <input
                className={inputClass}
                type="number"
                placeholder="20"
                value={form.valuation}
                onChange={(e) => set("valuation", e.target.value)}
              />
            </Field>
            <Field label="Raise ($M)">
              <input
                className={inputClass}
                type="number"
                placeholder="5"
                value={form.raiseAmount}
                onChange={(e) => set("raiseAmount", e.target.value)}
              />
            </Field>
            <Field label="Lead Investor">
              <input
                className={inputClass}
                placeholder="e.g. Sequoia"
                value={form.leadInvestor}
                onChange={(e) => set("leadInvestor", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* RIGHT: Memo Preview */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #1F2937",
            maxHeight: "75vh",
            overflowY: "auto",
          }}
          className="rounded-2xl p-5 flex flex-col gap-0"
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">
              Live Memo Preview
            </h3>
            <div className="flex items-center gap-2">
              {/* Recommendation badge */}
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{
                  color: rec.color,
                  background: `${rec.color}22`,
                  border: `1px solid ${rec.color}55`,
                }}
              >
                {rec.label}
              </span>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                style={{
                  background: copied ? "rgba(52,211,153,0.15)" : "#1F2937",
                  color: copied ? "#34D399" : "#9CA3AF",
                  border: "1px solid #374151",
                }}
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                style={{
                  background: "#1F2937",
                  color: "#9CA3AF",
                  border: "1px solid #374151",
                }}
                title="Download as .txt"
              >
                <Download size={13} />
                Export
              </button>
            </div>
          </div>

          {/* Memo content */}
          <div
            className="flex-1 overflow-y-auto rounded-xl p-5"
            style={{
              background: "#0A0F1C",
              fontFamily: "monospace",
              fontSize: "12.5px",
              lineHeight: "1.65",
              border: "1px solid #1F2937",
              opacity: isEmpty ? 0.45 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {renderMemoLines()}
          </div>

          {isEmpty && (
            <p className="text-center text-xs text-[#4B5563] mt-3">
              Start filling in the form to generate your investment memo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
