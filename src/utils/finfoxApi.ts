export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface FinFoxApiOptions {
  mode: "tutor" | "founder" | "pe_seller" | "ib_client" | "breakdown";
  messages: ChatMessage[];
  systemPrompt: string;
}

const CACHE_KEY = "finfox_cache";
const RATE_KEY_PREFIX = "finfox_queries_";

function getTodayKey(): string {
  return RATE_KEY_PREFIX + new Date().toISOString().slice(0, 10);
}

function getCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function setCache(cache: Record<string, string>) {
  // Keep only the latest 50 entries
  const entries = Object.entries(cache);
  const trimmed = Object.fromEntries(entries.slice(-50));
  localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
}

export function normalizeCacheKey(question: string): string {
  return question
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

export function getCachedAnswer(question: string): string | null {
  const cache = getCache();
  return cache[normalizeCacheKey(question)] ?? null;
}

export function setCachedAnswer(question: string, answer: string) {
  const cache = getCache();
  cache[normalizeCacheKey(question)] = answer;
  setCache(cache);
}

export function getRemainingQueries(): number {
  const key = getTodayKey();
  const used = parseInt(localStorage.getItem(key) ?? "0", 10);
  return Math.max(0, 30 - used);
}

export function incrementQueryCount() {
  const key = getTodayKey();
  const used = parseInt(localStorage.getItem(key) ?? "0", 10);
  localStorage.setItem(key, String(used + 1));
}

export async function callFinFox(opts: FinFoxApiOptions): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(opts),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content ?? "";
}

// Pre-loaded common finance Q&As seeded into cache at startup
const SEED_QA: Array<[string, string]> = [
  [
    "whats premoney",
    "Pre-money valuation is what investors agree the company is worth before they invest. If a startup is pre-money $8M and raises $2M, the post-money is $10M and investors own 20%.",
  ],
  [
    "what is premoney valuation",
    "Pre-money valuation is what investors agree the company is worth before they invest. If a startup is pre-money $8M and raises $2M, the post-money is $10M and investors own 20%.",
  ],
  [
    "explain dilution",
    "Dilution reduces your ownership percentage when new shares are issued. If you own 50% and a new round issues 20% new shares, your stake drops to roughly 40%. Dilution is normal — a smaller slice of a larger pie is usually worth more.",
  ],
  [
    "what is a hurdle rate",
    "The hurdle rate is the minimum annual return (usually 8%) that LPs must earn before the GP takes any carried interest. It protects investors by ensuring the fund manager only profits after delivering real returns.",
  ],
  [
    "explain carry",
    "Carried interest is the fund manager's profit share — typically 20% of gains above the hurdle. On a $500M fund that returns $1B, the GP might earn $100M in carry after LPs get their capital and hurdle back.",
  ],
  [
    "whats a jcurve",
    "The J-curve is the pattern where PE and VC funds show negative early returns (fees + early losses) before turning positive as investments mature and are exited. Most funds don't show gains until years 5-7.",
  ],
  [
    "what is a good debt ratio",
    "For LBOs, 5-6x Debt/EBITDA is standard; above 6.5x is aggressive and increases default risk. Lenders set covenants to catch deterioration early. The right leverage depends on FCF stability and business quality.",
  ],
  [
    "explain lbo",
    "An LBO uses mostly debt (60-70% of purchase price) to buy a company, then uses the company's own cash flows to repay that debt over 5 years. Leverage amplifies equity returns — a 2x EBITDA growth becomes a 3-4x equity return.",
  ],
  [
    "what is ebitda",
    "EBITDA is earnings before interest, taxes, depreciation, and amortization — a proxy for operating cash flow. PE firms value companies as multiples of EBITDA, typically 8-12x for mid-market businesses.",
  ],
  [
    "ma vs ipo",
    "M&A means selling to a strategic buyer or PE firm, usually faster and more certain. An IPO means going public on a stock exchange, which can achieve higher valuations but takes 6-12 months and exposes you to market volatility.",
  ],
  [
    "what are comps",
    "Comparable companies (comps) are publicly traded peers used to benchmark valuation. You apply their EV/EBITDA or P/E multiples to your company's financials. Bankers use comps alongside DCF to build a valuation range.",
  ],
  [
    "explain accretiondilution",
    "An accretive deal increases the buyer's earnings per share (EPS) after closing. A dilutive deal decreases EPS. Deals where the target has a higher P/E than the acquirer tend to be dilutive unless synergies offset the difference.",
  ],
];

export function seedCache() {
  const cache = getCache();
  let changed = false;
  for (const [key, answer] of SEED_QA) {
    if (!cache[key]) {
      cache[key] = answer;
      changed = true;
    }
  }
  if (changed) setCache(cache);
}
