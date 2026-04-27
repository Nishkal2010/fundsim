export interface FinFoxTerm {
  short: string;
  long: string;
}

export const finfoxGlossary: Record<string, FinFoxTerm> = {
  "Pre-Money Valuation": {
    short: "Company value before new investment comes in",
    long: "Pre-money valuation is what investors agree the company is worth before they wire any money. If a startup has a $8M pre-money valuation and raises $2M, the post-money valuation is $10M, and investors own 20%.",
  },
  "Post-Money Valuation": {
    short: "Company value after new investment is added",
    long: "Post-money valuation equals pre-money plus the new investment. It is the basis for calculating ownership percentages — if you invest $2M at a $10M post-money, you own 20% immediately after the round closes.",
  },
  Dilution: {
    short: "Reduction in existing ownership % when new shares are issued",
    long: "Dilution happens every time a company issues new shares — in a funding round, for an ESOP, or via convertible notes. If you own 50% and the company raises a new round that issues 20% new shares, your stake gets diluted down to about 40%.",
  },
  "Liquidation Preference": {
    short: "Investors get paid first before founders in an exit",
    long: "A 1x liquidation preference means investors get their money back before anyone else in a sale. A 2x preference means they get double their investment first. Participating preferred means they also share in the remaining proceeds after getting their preference.",
  },
  "Anti-Dilution": {
    short: "Protection clause if future rounds price below your entry",
    long: "Anti-dilution provisions protect investors if the company raises a down round at a lower price per share. Full ratchet is the harshest form — it reprices the investor's shares to the new lower price. Broad-based weighted average is more founder-friendly.",
  },
  "Pro Rata Rights": {
    short: "Right to invest in future rounds to maintain your ownership %",
    long: "Pro rata rights let existing investors participate in future funding rounds proportionally to their current stake. This prevents dilution and lets top-tier investors maintain ownership in a winning company through Series B, C, and beyond.",
  },
  "Cap Table": {
    short: "Spreadsheet showing who owns what % of the company",
    long: "The capitalization table lists all shareholders and their ownership stakes, including founders, investors, and the option pool. It updates every time equity is issued. VCs scrutinize the cap table to understand dilution history and future obligations.",
  },
  SAFE: {
    short:
      "Simple Agreement for Future Equity — converts to shares at the next priced round",
    long: "A SAFE is not a loan — it is a contract that converts into equity when the company raises a priced round. The key terms are the valuation cap (maximum conversion price) and the discount (% below the round price the SAFE converts at).",
  },
  "Convertible Note": {
    short: "Short-term debt that converts to equity at the next round",
    long: "Unlike a SAFE, a convertible note is technically debt with an interest rate and maturity date. It converts into equity at the next priced round, usually at a discount or capped valuation. If no round happens before maturity, the company must repay the debt.",
  },
  "Term Sheet": {
    short:
      "Non-binding summary of the key deal terms before the final legal docs",
    long: "A term sheet outlines valuation, round size, governance rights, liquidation preferences, and other key terms. It is non-binding except for exclusivity and confidentiality clauses. Once signed, lawyers draft the final binding investment documents.",
  },
  "Board Seat": {
    short:
      "Position giving an investor voting power on major company decisions",
    long: "Board seats give investors formal governance rights — they vote on major decisions like hiring/firing the CEO, acquisitions, and follow-on funding. A typical seed round might give an investor a board observer seat (no vote) rather than a full seat.",
  },
  MOIC: {
    short:
      "Multiple on Invested Capital — total value divided by amount invested",
    long: "MOIC tells you how many times you got your money back. A 3x MOIC means every $1 invested returned $3. Unlike IRR, MOIC ignores time — a 3x in 2 years is far better than a 3x in 10 years. PE firms target 2–3x gross MOIC over a 5-year hold.",
  },
  IRR: {
    short: "Internal Rate of Return — annualized return accounting for timing",
    long: "IRR is the annualized percentage return that makes all your cash flows net to zero. A 25% IRR means you compounded your money at 25% per year. IRR rewards fast returns — getting your money back in year 2 beats year 7 even if the MOIC is identical.",
  },
  "Hurdle Rate": {
    short: "Minimum return LPs must receive before the GP earns carry",
    long: "The hurdle rate (typically 8% per year) is a threshold return for LPs. Until LPs earn at least the hurdle on their invested capital, the GP gets no carried interest. It aligns manager incentives — they only profit after delivering real returns first.",
  },
  Carry: {
    short: "The GP's profit share — typically 20% of gains above the hurdle",
    long: "Carried interest is how fund managers get paid for performance. After returning LP capital plus the hurdle return, the GP keeps 20% of all profits. On a $1B fund returning $2B, that is roughly $200M in carry — the primary wealth creation mechanism for fund managers.",
  },
  EBITDA: {
    short: "Earnings before interest, taxes, depreciation, and amortization",
    long: "EBITDA is a proxy for operating cash flow. It strips out capital structure (interest), tax jurisdiction, and non-cash charges to give a cleaner picture of business profitability. PE firms value companies as multiples of EBITDA — typically 8–12x for middle-market businesses.",
  },
  LBO: {
    short:
      "Leveraged Buyout — using debt to acquire a company and amplify equity returns",
    long: "In an LBO, a PE firm buys a company using mostly debt (60–70% of the purchase price) and a small equity check. The acquired company's own cash flows repay the debt over 5 years. Leverage amplifies returns — the same business profit becomes a much larger equity gain.",
  },
  "Debt/EBITDA": {
    short:
      "Leverage ratio showing how many years of earnings needed to repay debt",
    long: "A Debt/EBITDA of 5x means the company owes five years worth of EBITDA in debt. Lenders typically cap LBOs at 5–7x EBITDA depending on the business quality. Higher leverage means higher returns but also higher default risk if earnings decline.",
  },
  "FCF Conversion": {
    short: "Percentage of EBITDA that actually becomes free cash flow",
    long: "Free cash flow conversion measures how much of EBITDA turns into actual cash after capex and working capital. A 70% FCF conversion on $50M EBITDA generates $35M cash per year to repay LBO debt. Asset-heavy businesses have lower conversion than software firms.",
  },
  "Management Fee": {
    short: "Annual fee paid to the GP for managing the fund — typically 2%",
    long: "The management fee covers the GP's operating costs — salaries, office, due diligence. It is charged on committed capital during the investment period and often on invested capital after that. On a $500M fund, a 2% fee is $10M per year regardless of fund performance.",
  },
  "J-Curve": {
    short:
      "The pattern of early negative returns before PE/VC returns turn positive",
    long: "PE funds look like bad investments for the first 3–4 years because the GP is paying fees and investing at cost while unrealized portfolio companies are still developing. The curve dips negative then rises sharply as exits create realized gains in years 5–10.",
  },
  Waterfall: {
    short:
      "The order in which fund proceeds are distributed between LPs and the GP",
    long: "The distribution waterfall defines who gets paid what and when. Typically: (1) return LP capital, (2) pay the hurdle return to LPs, (3) GP catch-up, (4) 80/20 profit split thereafter. European-style calculates carry on the whole fund; American-style deal-by-deal.",
  },
  "M&A": {
    short: "Mergers and Acquisitions — combining or buying companies",
    long: "In M&A, a buyer acquires a target to gain market share, technology, or talent. Investment bankers advise on strategy, run the sale process, negotiate terms, and manage the financing. A sell-side mandate means the banker represents the company being sold.",
  },
  IPO: {
    short:
      "Initial Public Offering — company lists shares on a stock exchange for the first time",
    long: "An IPO is how private companies go public by selling shares to institutional and retail investors on an exchange. Banks underwrite the offering, set the IPO price, and market the shares to investors. The process typically takes 6–12 months and costs 5–7% of proceeds in fees.",
  },
  "Comparable Companies": {
    short: "Valuing a company by comparing it to similar publicly traded peers",
    long: "Comps (comparable company analysis) value a business by looking at what similar companies trade for in the market. You apply peer multiples (EV/Revenue, EV/EBITDA, P/E) to your target's financials to estimate fair value. Bankers use comps alongside DCF and precedent transactions.",
  },
  DCF: {
    short:
      "Discounted Cash Flow — intrinsic valuation based on future cash flow projections",
    long: "A DCF values a company by projecting future free cash flows and discounting them back to today at the weighted average cost of capital (WACC). It is theoretically the most rigorous valuation method but extremely sensitive to assumptions about growth and discount rates.",
  },
  "Accretion/Dilution": {
    short:
      "Whether an acquisition increases or decreases the acquirer's earnings per share",
    long: "An accretive deal increases the acquirer's EPS after closing — typically when the target earns more per dollar than the acquirer paid. A dilutive deal decreases EPS. Bankers run accretion/dilution analysis to justify whether a deal is financially rational for acquirer shareholders.",
  },
  Retainer: {
    short: "Upfront fee paid to a bank to secure its advisory services",
    long: "A retainer is a monthly fee (typically $50K–$250K/month) paid to the investment bank during the deal process. It signals commitment and covers the bank's initial work. The retainer is usually credited against the final success fee at closing.",
  },
  "Success Fee": {
    short:
      "Fee the bank earns only if the deal closes — usually a % of deal value",
    long: "The success fee (or transaction fee) is the main way banks get paid in M&A — typically 1–2% of deal value for mid-market deals, lower for larger transactions (Lehman formula). It is only paid at closing, incentivizing the bank to maximize deal value and get deals done.",
  },
  Exclusivity: {
    short: "Period where the target agrees to negotiate only with one buyer",
    long: "Exclusivity (or no-shop) means the company stops talking to other potential buyers while completing due diligence and negotiating final documents with the chosen party. Typically 30–60 days. Exclusivity is valuable leverage for buyers and a major concession for sellers.",
  },
};
