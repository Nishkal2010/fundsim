export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const glossaryEntries: GlossaryEntry[] = [
  { term: 'Fund Size', definition: 'Total capital committed by all investors (LPs + GP)' },
  { term: 'LP (Limited Partner)', definition: "The investors who put up most of the capital but don't manage the fund" },
  { term: 'GP (General Partner)', definition: 'The fund manager who makes investment decisions and charges fees' },
  { term: 'Management Fee', definition: 'Annual fee (usually 2%) charged by the GP to cover operating costs' },
  { term: 'Carried Interest (Carry)', definition: "The GP's share of profits (usually 20%), earned only after returning LP capital + hurdle" },
  { term: 'Hurdle Rate / Preferred Return', definition: 'Minimum annual return LPs must earn before GP gets carry' },
  { term: 'Capital Call / Drawdown', definition: 'When the GP asks LPs to wire in a portion of their commitment' },
  { term: 'J-Curve', definition: 'The pattern of negative early returns followed by positive later returns in PE/VC funds' },
  { term: 'Distribution Waterfall', definition: 'The rules governing how profits are split between LPs and GPs' },
  { term: 'Catch-Up', definition: 'Period where GP receives outsized share of distributions to reach their carry target' },
  { term: 'Clawback', definition: 'Provision requiring GP to return excess carry if later investments underperform' },
  { term: 'DPI', definition: 'Distributions to Paid-In — cash actually returned to LPs divided by cash called' },
  { term: 'TVPI', definition: 'Total Value to Paid-In — total value (cash + unrealized) divided by cash called' },
  { term: 'RVPI', definition: 'Residual Value to Paid-In — unrealized investment value divided by cash called' },
  { term: 'IRR', definition: 'Internal Rate of Return — annualized return accounting for timing of cash flows' },
  { term: 'MOIC', definition: 'Multiple on Invested Capital — total value divided by capital invested' },
  { term: 'Vintage Year', definition: 'The year a fund makes its first investment' },
  { term: 'Investment Period', definition: 'Years during which the fund makes new investments (typically 3–5 years)' },
  { term: 'Harvest Period', definition: 'Years after the investment period when the fund exits investments' },
  { term: 'European Waterfall', definition: "Carry calculated on the entire fund's performance" },
  { term: 'American Waterfall', definition: 'Carry calculated deal-by-deal' },
  { term: 'GP Commitment', definition: "The GP's own money invested in the fund (typically 1–5%)" },
];
