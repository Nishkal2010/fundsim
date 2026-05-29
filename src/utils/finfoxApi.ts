import { safeStorageGet, safeStorageSet } from "../lib/storage";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Mirror of api/chat.ts ALLOWED_SCREENS — keep in sync. Narrowing the client
// type here surfaces drift at compile time instead of as a 400 at runtime.
export type FinFoxScreen =
  | ""
  | "home"
  | "captable"
  | "termsheet"
  | "safe"
  | "lifecycle"
  | "lbo"
  | "gplp"
  | "jcurve"
  | "waterfall"
  | "performance"
  | "portfolio"
  | "debt"
  | "sector"
  | "main"
  | "compare"
  | "valuation"
  | "score"
  | "qualitative"
  | "marketsizing"
  | "dealmemo"
  | "portfolioconstruction";

export const FINFOX_ALLOWED_SCREENS: ReadonlySet<FinFoxScreen> =
  new Set<FinFoxScreen>([
    "",
    "home",
    "captable",
    "termsheet",
    "safe",
    "lifecycle",
    "lbo",
    "gplp",
    "jcurve",
    "waterfall",
    "performance",
    "portfolio",
    "debt",
    "sector",
    "main",
    "compare",
    "valuation",
    "score",
    "qualitative",
    "marketsizing",
    "dealmemo",
    "portfolioconstruction",
  ]);

export function coerceScreen(s: string | null | undefined): FinFoxScreen {
  if (typeof s !== "string") return "";
  return FINFOX_ALLOWED_SCREENS.has(s as FinFoxScreen)
    ? (s as FinFoxScreen)
    : "";
}

export interface FinFoxApiOptions {
  mode: "tutor" | "founder" | "pe_seller" | "ib_client" | "breakdown";
  messages: ChatMessage[];
  // sim/screen are only used by tutor mode; roleplay/breakdown can omit them.
  sim?: string | null;
  screen?: FinFoxScreen;
  // Optional scenario-specific system prompt for non-tutor roleplay modes
  // (founder, pe_seller, ib_client). Server REJECTS this field for tutor mode
  // to preserve the prompt-injection guardrail on the high-traffic chatbot.
  systemPrompt?: string;
}

const CACHE_KEY = "finfox_cache";
const RATE_KEY_PREFIX = "finfox_queries_";

function getTodayKey(): string {
  return RATE_KEY_PREFIX + new Date().toISOString().slice(0, 10);
}

function getCache(): Record<string, string> {
  try {
    return JSON.parse(safeStorageGet(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function setCache(cache: Record<string, string>) {
  // Keep only the latest 50 entries
  const entries = Object.entries(cache);
  const trimmed = Object.fromEntries(entries.slice(-50));
  safeStorageSet(CACHE_KEY, JSON.stringify(trimmed));
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
  const used = parseInt(safeStorageGet(key) ?? "0", 10);
  return Math.max(0, 30 - used);
}

export function incrementQueryCount() {
  const key = getTodayKey();
  const used = parseInt(safeStorageGet(key) ?? "0", 10);
  safeStorageSet(key, String(used + 1));
}

export async function callFinFox(
  opts: FinFoxApiOptions,
  onToken?: (token: string) => void,
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(opts),
    signal: AbortSignal.timeout(35000),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let fullText = "";

  try {
    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") break outer;
        try {
          const evt = JSON.parse(raw);
          if (evt.t) {
            fullText += evt.t;
            onToken?.(evt.t);
          }
        } catch {
          /* skip malformed events */
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
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
  // --- expanded PE/VC/IB terms ---
  [
    "what is moic",
    "MOIC (Multiple on Invested Capital) measures total return as a simple multiple of the amount invested, ignoring time. If a PE fund puts in $10M and exits for $30M, the MOIC is 3.0x — a common target range is 2.5-4x over a 5-year hold.",
  ],
  [
    "what is dpi",
    "DPI (Distributions to Paid-In) measures how much cash a fund has actually returned to LPs relative to their investment. A DPI of 1.0x means LPs have gotten all their capital back; 2.0x means they've received twice what they put in.",
  ],
  [
    "what is tvpi",
    "TVPI (Total Value to Paid-In) is DPI plus the current estimated value of unrealized holdings, divided by capital invested. A fund with $500M invested, $400M distributed, and $300M in remaining NAV has a TVPI of 1.4x.",
  ],
  [
    "what is pme",
    "PME (Public Market Equivalent) compares a PE fund's returns to what you'd have earned investing the same cash flows into a public index like the S&P 500. A PME above 1.0x means the PE fund outperformed the public market benchmark.",
  ],
  [
    "what is nav",
    "NAV (Net Asset Value) is the current estimated value of a fund's portfolio after subtracting liabilities. For a PE fund mid-life, NAV reflects unrealized investment values marked to fair value — it rises as portfolio companies grow and falls if they struggle.",
  ],
  [
    "what is gp commit",
    "The GP commit is the amount the fund manager invests alongside LPs in its own fund, typically 1-3% of total fund size. On a $500M fund that's $5-15M of the GP's own capital, which aligns their incentives with investors.",
  ],
  [
    "what is a catchup clause",
    "A catch-up clause lets the GP receive 100% of distributions (after LPs hit their hurdle) until the GP has received their full 20% carried interest share. It means LPs don't keep earning past the hurdle before the GP gets any carry.",
  ],
  [
    "what is a ratchet",
    "A ratchet is a mechanism that increases management's equity stake if the company hits performance targets — often tied to EBITDA or IRR thresholds at exit. For example, management might start at 10% ownership but ratchet up to 15% if the fund achieves a 3x return.",
  ],
  [
    "what are dragalong rights",
    "Drag-along rights allow majority shareholders to force minority shareholders to join a sale of the company on the same terms. This prevents a small minority from blocking an acquisition that the majority has agreed to.",
  ],
  [
    "what are tagalong rights",
    "Tag-along rights let minority shareholders sell their shares alongside the majority if the majority sells. If a founder sells their 60% stake to a buyer at $10/share, tag-along rights let the 10% minority investor sell at the same price.",
  ],
  [
    "safe vs equity",
    "A SAFE (Simple Agreement for Future Equity) is a contract that converts to equity at a future funding round — no interest, no maturity date, simpler than a convertible note. Equity grants actual shares immediately at a set price, while a SAFE delays that until a priced round.",
  ],
  [
    "series a vs seed round",
    "A seed round is the first institutional raise, typically $500K-$3M, to prove product-market fit with little or no revenue. A Series A is the next stage, usually $5-20M, where investors expect early traction and a clear path to scale.",
  ],
  [
    "what is comparable company analysis",
    "Comparable company analysis (comps) values a business by applying trading multiples from similar public companies to its own financials. If software peers trade at 15x EBITDA and your target has $20M EBITDA, comps suggest a $300M value — though private companies often trade at a discount.",
  ],
  [
    "what isevevebitda",
    "EV/EBITDA is the most common PE valuation multiple — enterprise value divided by EBITDA. Mid-market industrial businesses trade at 7-10x; software and high-growth businesses at 15-25x. A higher multiple means the market expects stronger growth or better margins.",
  ],
  [
    "what are precedent transactions",
    "Precedent transactions value a company by looking at prices paid in past M&A deals for similar businesses. Unlike comps (public market prices), precedents include a control premium — buyers typically pay 20-30% more than the public market price to acquire control.",
  ],
  [
    "what is syndication",
    "Syndication is when a lead investor brings in co-investors to share a deal, spreading risk and filling out the round. In PE, a sponsor might put up 60% of equity and syndicate the remaining 40% to co-investors; in VC, a lead VC syndicates with other funds to complete a Series A.",
  ],
  [
    "what is coinvestment",
    "Co-investment lets LPs invest directly alongside the fund in specific deals, usually with reduced or zero fees. A fund might take a $100M stake in a buyout and offer LPs the chance to co-invest an additional $50M directly — LPs like it because it avoids double fee layers.",
  ],
  [
    "what is the secondaries market",
    "The secondaries market is where investors buy and sell existing LP interests in PE/VC funds before the fund terminates. A pension fund that needs liquidity can sell its $50M stake to a secondary buyer (often at a 10-20% discount to NAV) rather than waiting for the fund to wind down.",
  ],
  [
    "what is a fund of funds",
    "A fund of funds (FoF) is a vehicle that invests in other PE or VC funds rather than directly in companies. An endowment might use a FoF to get diversified PE exposure across 20 managers — the tradeoff is an extra layer of fees (typically 1% management + 5-10% carry) on top of the underlying funds.",
  ],
  [
    "what is carried interest clawback",
    "A clawback requires a GP to return carry already paid if later losses in the fund mean total distributions fell short of the promised return. If a GP received $20M in carry on early exits but the full fund ultimately underperforms the hurdle, LPs can claw back some or all of that $20M.",
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
