// Qualitative Scoring Engine for FunSim
// Implements Payne Scorecard, Berkus Method, and Founder DNA Score

// ─── Payne Scorecard ──────────────────────────────────────────────────────────

export interface PayneDimension {
  key: string;
  label: string;
  weight: number; // weights sum to 1.0
  score: number; // 0-2 scale: 0=weak, 1=average, 2=strong
  description: string;
  tooltip: string;
}

export interface PayneResult {
  dimensions: PayneDimension[];
  weightedScore: number; // 0–2
  valuation: number; // in millions, relative to $2.5M median pre-money
  interpretation: string;
}

export const DEFAULT_PAYNE_DIMENSIONS: PayneDimension[] = [
  {
    key: "management",
    label: "Management Team",
    weight: 0.3,
    score: 1,
    description: "Experienced founders with domain expertise and prior exits",
    tooltip:
      "The single most weighted factor. Investors bet on the jockey, not the horse. " +
      "Score 2 for a team with domain expertise, complementary skills, and prior exits.",
  },
  {
    key: "market",
    label: "Market Size / Opportunity",
    weight: 0.25,
    score: 1,
    description: "TAM >$1B with strong growth tailwinds",
    tooltip:
      "Large, growing markets forgive many execution mistakes. " +
      "Score 2 if TAM exceeds $1B and the market is expanding rapidly.",
  },
  {
    key: "product",
    label: "Product / Technology",
    weight: 0.15,
    score: 1,
    description: "Differentiated, defensible, clear IP or network effects",
    tooltip:
      "How hard is it for incumbents or new entrants to copy you? " +
      "Score 2 for strong IP, network effects, or 18+ month technical lead.",
  },
  {
    key: "sales",
    label: "Sales / Distribution",
    weight: 0.1,
    score: 1,
    description: "Proven GTM, early traction or strategic partnerships",
    tooltip:
      "Ideas are worthless without distribution. Score 2 for a proven GTM motion, " +
      "meaningful revenue, or enterprise partnerships already signed.",
  },
  {
    key: "funding",
    label: "Need for Funding",
    weight: 0.05,
    score: 1,
    description: "Capital efficiency and clear use of proceeds",
    tooltip:
      "A crisp, capital-efficient plan earns respect. Score 2 if the company " +
      "can articulate exactly how this round gets them to the next milestone.",
  },
  {
    key: "competition",
    label: "Competitive Environment",
    weight: 0.1,
    score: 1,
    description: "Fragmented market or clear moat vs incumbents",
    tooltip:
      "Too much competition destroys margins; too little may signal a non-existent market. " +
      "Score 2 if the company has a clear, defensible moat.",
  },
  {
    key: "other",
    label: "Other Factors",
    weight: 0.05,
    score: 1,
    description: "Exit opportunities, strategic timing, board quality",
    tooltip:
      "Includes timing, board composition, strategic acquirers, and macro tailwinds. " +
      "Score 2 if multiple credible exit paths exist at strong multiples.",
  },
];

function payneInterpretation(weightedScore: number, valuation: number): string {
  if (weightedScore >= 1.6)
    return `Exceptional — this company scores in the top decile of angel deals. Estimated pre-money of $${valuation.toFixed(1)}M reflects strong fundamentals across every dimension.`;
  if (weightedScore >= 1.2)
    return `Above average — solid team and market with some execution risk. Pre-money of $${valuation.toFixed(1)}M is defensible to most seed investors.`;
  if (weightedScore >= 0.8)
    return `Average — competitive with typical early-stage deals. Pre-money of $${valuation.toFixed(1)}M requires continued de-risking before Series A.`;
  if (weightedScore >= 0.4)
    return `Below average — meaningful gaps in team, market, or traction. Pre-money of $${valuation.toFixed(1)}M may be aggressive without mitigation.`;
  return `Early-stage risk — multiple critical gaps. Pre-money of $${valuation.toFixed(1)}M assumes significant upside that has not yet been demonstrated.`;
}

/**
 * Pure calculation function for the Payne Scorecard.
 * @param scores - array of { key, score } overrides; any key not supplied uses the default.
 */
export function calculatePayne(
  scores: { key: string; score: number }[] = [],
): PayneResult {
  const medianPreMoney = 2.5; // $2.5M

  const overrideMap = new Map(scores.map((s) => [s.key, s.score]));
  const dimensions: PayneDimension[] = DEFAULT_PAYNE_DIMENSIONS.map((d) => ({
    ...d,
    score: overrideMap.has(d.key) ? overrideMap.get(d.key)! : d.score,
  }));

  const weightedScore = dimensions.reduce(
    (acc, d) => acc + d.weight * d.score,
    0,
  );

  // valuation = medianPreMoney * (weightedScore / 1.0)
  const valuation = medianPreMoney * weightedScore;

  return {
    dimensions,
    weightedScore,
    valuation,
    interpretation: payneInterpretation(weightedScore, valuation),
  };
}

// ─── Berkus Method ────────────────────────────────────────────────────────────

export interface BerkusFactor {
  key: string;
  label: string;
  maxValue: number; // in millions
  value: number; // 0 to maxValue
  description: string;
}

export interface BerkusResult {
  factors: BerkusFactor[];
  totalValuation: number; // sum of values, max $2.5M
  adjustedValuation: number; // with stage multiplier (always 1.0 here — pre-revenue)
  interpretation: string;
}

export const DEFAULT_BERKUS_FACTORS: BerkusFactor[] = [
  {
    key: "idea",
    label: "Sound Idea",
    maxValue: 0.5,
    value: 0.25,
    description:
      "Reduces execution risk — is the core concept viable and differentiated?",
  },
  {
    key: "prototype",
    label: "Working Prototype",
    maxValue: 0.5,
    value: 0.25,
    description:
      "Reduces technology risk — has the team proven the product can be built?",
  },
  {
    key: "team",
    label: "Quality Management Team",
    maxValue: 0.5,
    value: 0.25,
    description:
      "Reduces execution risk — do the founders have the skills to deliver?",
  },
  {
    key: "relationships",
    label: "Strategic Relationships",
    maxValue: 0.5,
    value: 0.25,
    description:
      "Reduces market risk — does the company have distribution advantages?",
  },
  {
    key: "rollout",
    label: "Product Rollout / Sales",
    maxValue: 0.5,
    value: 0.25,
    description:
      "Reduces financial risk — is there early revenue or a clear path to it?",
  },
];

function berkusInterpretation(total: number): string {
  if (total >= 2.0)
    return `Strong pre-revenue story — a $${total.toFixed(2)}M valuation is well-supported and competitive with top-tier angel rounds.`;
  if (total >= 1.25)
    return `Moderate — $${total.toFixed(2)}M reflects solid early-stage fundamentals with some remaining de-risking required.`;
  if (total >= 0.6)
    return `Early — $${total.toFixed(2)}M is a conservative but reasonable anchor for a very early company. Focus on closing the prototype and team gaps.`;
  return `Very early — $${total.toFixed(2)}M signals a concept-stage company. Investors will want to see rapid progress before committing meaningful capital.`;
}

/**
 * Pure calculation function for the Berkus Method.
 * @param values - array of { key, value } overrides in millions.
 */
export function calculateBerkus(
  values: { key: string; value: number }[] = [],
): BerkusResult {
  const overrideMap = new Map(values.map((v) => [v.key, v.value]));
  const factors: BerkusFactor[] = DEFAULT_BERKUS_FACTORS.map((f) => ({
    ...f,
    value: overrideMap.has(f.key)
      ? Math.min(overrideMap.get(f.key)!, f.maxValue)
      : f.value,
  }));

  const totalValuation = factors.reduce((acc, f) => acc + f.value, 0);
  const adjustedValuation = totalValuation; // stage multiplier = 1.0 (pre-revenue)

  return {
    factors,
    totalValuation,
    adjustedValuation,
    interpretation: berkusInterpretation(totalValuation),
  };
}

// ─── Founder DNA Score ────────────────────────────────────────────────────────

export interface FounderDNADimension {
  key: string;
  label: string;
  score: number; // 0–10
  weight: number; // weights sum to 1.0
  icon: string; // emoji
}

export interface FounderDNAResult {
  dimensions: FounderDNADimension[];
  totalScore: number; // 0–100
  archetype: string; // "Visionary" | "Operator" | "Hustler" | "Technical" | "Domain Expert"
  vcAppeal: "High" | "Medium" | "Low";
  narrative: string;
}

export const DEFAULT_FOUNDER_DNA_DIMENSIONS: FounderDNADimension[] = [
  {
    key: "domain",
    label: "Domain Expertise",
    score: 5,
    weight: 0.2,
    icon: "🎯",
  },
  {
    key: "experience",
    label: "Prior Startup Experience",
    score: 5,
    weight: 0.15,
    icon: "🚀",
  },
  {
    key: "technical",
    label: "Technical Depth",
    score: 5,
    weight: 0.15,
    icon: "🛠️",
  },
  {
    key: "sales",
    label: "Sales / BD Ability",
    score: 5,
    weight: 0.15,
    icon: "💼",
  },
  {
    key: "resilience",
    label: "Resilience",
    score: 5,
    weight: 0.1,
    icon: "💪",
  },
  {
    key: "network",
    label: "Network Quality",
    score: 5,
    weight: 0.1,
    icon: "🌐",
  },
  {
    key: "vision",
    label: "Vision Clarity",
    score: 5,
    weight: 0.1,
    icon: "🔭",
  },
  {
    key: "coachability",
    label: "Coachability",
    score: 5,
    weight: 0.05,
    icon: "🤝",
  },
];

const ARCHETYPE_MAP: Record<string, string> = {
  domain_vision: "Visionary",
  domain_experience: "Domain Expert",
  domain_sales: "Domain Expert",
  domain_technical: "Domain Expert",
  domain_network: "Domain Expert",
  domain_resilience: "Domain Expert",
  experience_sales: "Operator",
  experience_network: "Operator",
  experience_resilience: "Operator",
  experience_technical: "Technical",
  experience_vision: "Operator",
  technical_sales: "Technical",
  technical_vision: "Technical",
  technical_network: "Technical",
  technical_resilience: "Technical",
  sales_network: "Hustler",
  sales_vision: "Hustler",
  sales_resilience: "Hustler",
  network_vision: "Visionary",
  network_resilience: "Hustler",
  vision_resilience: "Visionary",
  vision_coachability: "Visionary",
  resilience_coachability: "Operator",
};

function deriveArchetype(dimensions: FounderDNADimension[]): string {
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const top1 = sorted[0]?.key ?? "domain";
  const top2 = sorted[1]?.key ?? "vision";

  const combo = [top1, top2].sort().join("_");
  return ARCHETYPE_MAP[combo] ?? "Operator";
}

function deriveVcAppeal(totalScore: number): "High" | "Medium" | "Low" {
  if (totalScore >= 72) return "High";
  if (totalScore >= 45) return "Medium";
  return "Low";
}

function deriveNarrative(
  archetype: string,
  vcAppeal: "High" | "Medium" | "Low",
  topDimension: string,
): string {
  const appealPhrases: Record<string, string> = {
    High: "This founder profile is highly compelling to institutional VCs",
    Medium:
      "This founder has a credible profile that will resonate with some investors",
    Low: "This founder is at an early stage of building investor-ready credentials",
  };

  const archetypeDescriptions: Record<string, string> = {
    Visionary:
      "combining long-range strategic clarity with strong market instincts",
    Operator:
      "demonstrating the operational rigor needed to scale a team and product",
    Hustler:
      "showing the relentless commercial drive that unlocks early distribution",
    Technical: "backed by deep technical credibility that reduces build-risk",
    "Domain Expert":
      "anchored in hard-won sector knowledge competitors cannot easily replicate",
  };

  const topLabel =
    DEFAULT_FOUNDER_DNA_DIMENSIONS.find((d) => d.key === topDimension)?.label ??
    topDimension;

  return (
    `${appealPhrases[vcAppeal]}, ${archetypeDescriptions[archetype]}. ` +
    `${topLabel} is the standout strength — lean into it in every pitch.`
  );
}

/**
 * Pure calculation function for the Founder DNA Score.
 * @param scores - array of { key, score } overrides (0–10).
 */
export function calculateFounderDNA(
  scores: { key: string; score: number }[] = [],
): FounderDNAResult {
  const overrideMap = new Map(scores.map((s) => [s.key, s.score]));
  const dimensions: FounderDNADimension[] = DEFAULT_FOUNDER_DNA_DIMENSIONS.map(
    (d) => ({
      ...d,
      score: overrideMap.has(d.key)
        ? Math.min(10, Math.max(0, overrideMap.get(d.key)!))
        : d.score,
    }),
  );

  // Weighted score 0–10, then scale to 0–100
  const weightedRaw = dimensions.reduce(
    (acc, d) => acc + d.weight * d.score,
    0,
  );
  const totalScore = Math.round(weightedRaw * 10);

  const archetype = deriveArchetype(dimensions);
  const vcAppeal = deriveVcAppeal(totalScore);

  const topDimension =
    [...dimensions].sort((a, b) => b.score - a.score)[0]?.key ?? "domain";

  return {
    dimensions,
    totalScore,
    archetype,
    vcAppeal,
    narrative: deriveNarrative(archetype, vcAppeal, topDimension),
  };
}
