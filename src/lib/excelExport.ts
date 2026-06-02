import XLSX from "xlsx-js-style";

// IB color palette: blue=inputs, black=formulas, yellow=outputs (IB convention)
const INPUT_BG = "DCE6F1"; // light blue — user inputs
const OUTPUT_BG = "FFEB9C"; // yellow — key outputs
const HEADER_BG = "1F4E79"; // dark navy — section headers
const HEADER_FG = "FFFFFF";
const SUBHEADER_BG = "BDD7EE"; // light blue — subheaders
const RED_BG = "FFC7CE"; // negative / warning
const CHECK_OK_BG = "C6EFCE"; // green — balance check pass
const INPUT_FONT = "0070C0"; // blue text for inputs (IB convention)
const FORMULA_FONT = "000000"; // black for formulas
const OUTPUT_FONT = "000000"; // bold black on yellow

const MODEL_VERSION = "1.0";

interface DealInputs {
  acqName: string;
  acqRevenue: number;
  acqEBITDA: number;
  acqNI: number;
  acqShares: number;
  acqPrice: number;
  acqNetDebt: number;
  tgtName: string;
  tgtRevenue: number;
  tgtEBITDA: number;
  tgtNI: number;
  tgtShares: number;
  tgtPrice: number;
  tgtNetDebt: number;
  tgtFCF: number;
  sector: string;
  dealType: string;
  offerPremium: number;
  cashPct: number;
  debtRate: number;
  transactionFees: number;
  earnoutAmount: number;
  breakupFee: number;
  managementRollover: number;
  minorityStakePct: number;
  seniorLeverage: number;
  mezzLeverage: number;
  seniorRate: number;
  mezzRate: number;
  revolver: number;
  holdPeriod: number;
  exitMultipleOverride: number;
  noBalance: number;
  costSynergies: number;
  revSynergies: number;
  wacc: number;
  revenueGrowth: number;
  terminalGrowth: number;
  ebitdaMarginPct: number;
  capexPct: number;
  taxRate: number;
}

type C = Record<string, unknown>;

// Sector-derived rates used in DCF (mirrors IBSimulator.tsx ~L1096) — exposed as inputs in Excel.
// Keep in sync with IBSimulator's local consts.
const DA_RATES: Record<string, number> = {
  tech: 0.05,
  healthcare: 0.07,
  industrial: 0.1,
  consumer: 0.06,
  energy: 0.12,
};
const NWC_RATES: Record<string, number> = {
  tech: 0.01,
  healthcare: 0.03,
  industrial: 0.04,
  consumer: 0.05,
  energy: 0.02,
};

// ─── Style helpers ───────────────────────────────────────────────────────────

type Style = NonNullable<XLSX.CellObject["s"]>;

function styleFor(opts: {
  bg?: string;
  font?: string;
  bold?: boolean;
  numFmt?: string;
  border?: boolean;
  align?: "left" | "right" | "center";
}): Style {
  const s: Style = { alignment: { vertical: "center" } };
  if (opts.bg) s.fill = { fgColor: { rgb: opts.bg }, patternType: "solid" };
  if (opts.bold || opts.bg === HEADER_BG || opts.bg === OUTPUT_BG) {
    s.font = {
      bold: true,
      color: {
        rgb: opts.font ?? (opts.bg === HEADER_BG ? HEADER_FG : "000000"),
      },
    };
  } else if (opts.font) {
    s.font = { color: { rgb: opts.font } };
  }
  if (opts.numFmt) s.numFmt = opts.numFmt;
  if (opts.align) s.alignment = { ...s.alignment, horizontal: opts.align };
  if (opts.border) {
    const b = { style: "thin", color: { rgb: "BFBFBF" } };
    s.border = { top: b, bottom: b, left: b, right: b };
  }
  return s;
}

// Cell builders. `inp` = blue input (user-editable). `f` = black formula. `out` = yellow output.
function lbl(text: string, bold = false): XLSX.CellObject {
  return { t: "s", v: text, s: styleFor({ bold }) };
}
function hdr(text: string): XLSX.CellObject {
  return { t: "s", v: text, s: styleFor({ bg: HEADER_BG, bold: true }) };
}
function subhdr(text: string): XLSX.CellObject {
  return { t: "s", v: text, s: styleFor({ bg: SUBHEADER_BG, bold: true }) };
}
function inp(value: number, numFmt = "#,##0.0"): XLSX.CellObject {
  return {
    t: "n",
    v: value,
    s: styleFor({ bg: INPUT_BG, font: INPUT_FONT, numFmt }),
  };
}
function inpPct(valuePct: number): XLSX.CellObject {
  // Stored as fraction so formulas can multiply directly
  return {
    t: "n",
    v: valuePct / 100,
    s: styleFor({ bg: INPUT_BG, font: INPUT_FONT, numFmt: "0.00%" }),
  };
}
function inpStr(text: string): XLSX.CellObject {
  return { t: "s", v: text, s: styleFor({ bg: INPUT_BG, font: INPUT_FONT }) };
}
function fcell(
  formula: string,
  fallback: number,
  numFmt = "#,##0.0",
): XLSX.CellObject {
  return {
    t: "n",
    f: formula,
    v: fallback,
    s: styleFor({ font: FORMULA_FONT, numFmt }),
  };
}
function fout(
  formula: string,
  fallback: number,
  numFmt = "#,##0.0",
): XLSX.CellObject {
  return {
    t: "n",
    f: formula,
    v: fallback,
    s: styleFor({ bg: OUTPUT_BG, font: OUTPUT_FONT, bold: true, numFmt }),
  };
}
function num(value: number, numFmt = "#,##0.0"): XLSX.CellObject {
  return { t: "n", v: value, s: styleFor({ numFmt }) };
}
function dollar(value: number): XLSX.CellObject {
  return { t: "n", v: value, s: styleFor({ numFmt: '"$"#,##0.0"M"' }) };
}

function setWs(
  ws: XLSX.WorkSheet,
  rows: (XLSX.CellObject | null)[][],
  colWidths: number[],
): void {
  rows.forEach((row, r) => {
    row.forEach((c, col) => {
      if (c === null) return;
      const addr = XLSX.utils.encode_cell({ r, c: col });
      ws[addr] = c;
    });
  });
  ws["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: rows.length - 1, c: Math.max(...rows.map((r) => r.length)) - 1 },
  });
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));
}

// ─── Sheet 1: Cover ──────────────────────────────────────────────────────────
function buildCoverSheet(inputs: DealInputs): XLSX.WorkSheet {
  const today = new Date().toISOString().slice(0, 10);
  const rows: (XLSX.CellObject | null)[][] = [
    [hdr("FundSim — IB Deal Model"), null, null],
    [lbl(""), null, null],
    [lbl("Acquirer", true), lbl(inputs.acqName), null],
    [lbl("Target", true), lbl(inputs.tgtName), null],
    [lbl("Sector", true), lbl(inputs.sector), null],
    [lbl("Deal Type", true), lbl(inputs.dealType), null],
    [lbl(""), null, null],
    [lbl("Model Version", true), lbl(MODEL_VERSION), null],
    [lbl("Generated", true), lbl(today), null],
    [lbl("Source", true), lbl("https://fundsimulate.com"), null],
    [lbl(""), null, null],
    [subhdr("CONTENTS"), null, null],
    [lbl("Tab", true), lbl("Description", true), null],
    [
      lbl("Assumptions"),
      lbl("All inputs (blue) — editing here flows through every other tab"),
      null,
    ],
    [
      lbl("Deal Overview"),
      lbl("Headline outputs: deal value, EV, accretion, IRR, score"),
      null,
    ],
    [
      lbl("DCF Projections"),
      lbl("5-year FCFF roll-forward, terminal value, DCF EV"),
      null,
    ],
    [
      lbl("LBO Analysis"),
      lbl("Capital structure, debt paydown schedule, exit returns"),
      null,
    ],
    [
      lbl("IRR Sensitivity"),
      lbl("Hold period × exit multiple matrix (precomputed)"),
      null,
    ],
    [lbl(""), null, null],
    [subhdr("COLOR LEGEND"), null, null],
    [
      {
        t: "s",
        v: "Input (editable)",
        s: styleFor({ bg: INPUT_BG, font: INPUT_FONT }),
      },
      lbl("User-editable assumption"),
      null,
    ],
    [
      { t: "s", v: "Formula", s: styleFor({ font: FORMULA_FONT }) },
      lbl("Computed from inputs — do not overwrite"),
      null,
    ],
    [
      { t: "s", v: "Output", s: styleFor({ bg: OUTPUT_BG, bold: true }) },
      lbl("Key result"),
      null,
    ],
  ];
  const ws: XLSX.WorkSheet = {};
  setWs(ws, rows, [22, 60, 4]);
  return ws;
}

// ─── Sheet 2: Assumptions ────────────────────────────────────────────────────
// All inputs centralized here. Named ranges are defined against these cells so
// every other sheet's formula can reference assumptions by name.
//
// Named ranges (declared in workbook):
//   Acq_Revenue, Acq_EBITDA, Acq_NI, Acq_Shares, Acq_Price, Acq_NetDebt
//   Tgt_Revenue, Tgt_EBITDA, Tgt_NI, Tgt_Shares, Tgt_Price, Tgt_NetDebt, Tgt_FCF
//   Offer_Premium, Cash_Pct, Tx_Fees, Debt_Rate
//   Rev_Growth, EBITDA_Margin, Terminal_Growth, WACC, Tax_Rate, Capex_Pct, DA_Rate, NWC_Rate
//   Senior_Lev, Mezz_Lev, Senior_Rate, Mezz_Rate, Hold_Period, Exit_Mult, FCF_Sweep
function buildAssumptionsSheet(
  inputs: DealInputs,
  C: C,
): { ws: XLSX.WorkSheet; names: { Name: string; Ref: string }[] } {
  const compsMultiple = (C.compsMultiple as number) ?? 0;
  const exitMultiple =
    inputs.exitMultipleOverride > 0
      ? inputs.exitMultipleOverride
      : compsMultiple;
  const daRate = DA_RATES[inputs.sector] ?? 0.08;
  const nwcRate = NWC_RATES[inputs.sector] ?? 0.02;

  // Build rows; track positions for named-range refs
  const rows: (XLSX.CellObject | null)[][] = [];
  const names: { Name: string; Ref: string }[] = [];

  function pushNamed(label: string, name: string, cell: XLSX.CellObject) {
    rows.push([lbl(label), cell, null]);
    const ref = `Assumptions!$B$${rows.length}`; // 1-based row index
    names.push({ Name: name, Ref: ref });
  }
  function push(label: string, cell: XLSX.CellObject | null) {
    rows.push([lbl(label), cell, null]);
  }
  function blank() {
    rows.push([lbl(""), null, null]);
  }
  function section(title: string) {
    rows.push([subhdr(title), subhdr(""), null]);
  }

  rows.push([hdr("Assumptions"), hdr(""), null]);
  blank();

  section("ACQUIRER");
  push("Company", inpStr(inputs.acqName));
  pushNamed("Revenue ($M)", "Acq_Revenue", inp(inputs.acqRevenue));
  pushNamed("EBITDA ($M)", "Acq_EBITDA", inp(inputs.acqEBITDA));
  pushNamed("Net Income ($M)", "Acq_NI", inp(inputs.acqNI));
  pushNamed("Shares Out (M)", "Acq_Shares", inp(inputs.acqShares));
  pushNamed(
    "Share Price ($)",
    "Acq_Price",
    inp(inputs.acqPrice, '"$"#,##0.00'),
  );
  pushNamed("Net Debt ($M)", "Acq_NetDebt", inp(inputs.acqNetDebt));
  blank();

  section("TARGET");
  push("Company", inpStr(inputs.tgtName));
  pushNamed("Revenue ($M)", "Tgt_Revenue", inp(inputs.tgtRevenue));
  pushNamed("EBITDA ($M)", "Tgt_EBITDA", inp(inputs.tgtEBITDA));
  pushNamed("Net Income ($M)", "Tgt_NI", inp(inputs.tgtNI));
  pushNamed("Shares Out (M)", "Tgt_Shares", inp(inputs.tgtShares));
  pushNamed(
    "Share Price ($)",
    "Tgt_Price",
    inp(inputs.tgtPrice, '"$"#,##0.00'),
  );
  pushNamed("Net Debt ($M)", "Tgt_NetDebt", inp(inputs.tgtNetDebt));
  pushNamed("Free Cash Flow ($M)", "Tgt_FCF", inp(inputs.tgtFCF));
  blank();

  section("DEAL TERMS");
  pushNamed("Offer Premium", "Offer_Premium", inpPct(inputs.offerPremium));
  pushNamed("Cash % (of consideration)", "Cash_Pct", inpPct(inputs.cashPct));
  pushNamed("Transaction Fees", "Tx_Fees", inpPct(inputs.transactionFees));
  pushNamed("Acquirer Debt Rate", "Debt_Rate", inpPct(inputs.debtRate));
  blank();

  section("DCF DRIVERS");
  pushNamed("Revenue Growth", "Rev_Growth", inpPct(inputs.revenueGrowth));
  pushNamed("EBITDA Margin", "EBITDA_Margin", inpPct(inputs.ebitdaMarginPct));
  pushNamed(
    "Terminal Growth",
    "Terminal_Growth",
    inpPct(inputs.terminalGrowth),
  );
  pushNamed("WACC", "WACC", inpPct(inputs.wacc));
  pushNamed("Tax Rate", "Tax_Rate", inpPct(inputs.taxRate));
  pushNamed("Capex % of Revenue", "Capex_Pct", inpPct(inputs.capexPct));
  pushNamed("D&A % of Revenue (sector default)", "DA_Rate", {
    t: "n",
    v: daRate,
    s: styleFor({ bg: INPUT_BG, font: INPUT_FONT, numFmt: "0.00%" }),
  });
  pushNamed("NWC % of ΔRevenue (sector default)", "NWC_Rate", {
    t: "n",
    v: nwcRate,
    s: styleFor({ bg: INPUT_BG, font: INPUT_FONT, numFmt: "0.00%" }),
  });
  blank();

  section("LBO STRUCTURE");
  pushNamed(
    "Senior Leverage (× EBITDA)",
    "Senior_Lev",
    inp(inputs.seniorLeverage, "0.00"),
  );
  pushNamed(
    "Mezz Leverage (× EBITDA)",
    "Mezz_Lev",
    inp(inputs.mezzLeverage, "0.00"),
  );
  pushNamed("Senior Rate", "Senior_Rate", inpPct(inputs.seniorRate));
  pushNamed("Mezz Rate", "Mezz_Rate", inpPct(inputs.mezzRate));
  pushNamed(
    "Hold Period (yrs)",
    "Hold_Period",
    inp(Math.max(1, inputs.holdPeriod), "0"),
  );
  pushNamed("Exit Multiple (× EBITDA)", "Exit_Mult", inp(exitMultiple, "0.00"));
  pushNamed("FCF Sweep % to Debt Paydown", "FCF_Sweep", {
    t: "n",
    v: 0.7,
    s: styleFor({ bg: INPUT_BG, font: INPUT_FONT, numFmt: "0.00%" }),
  });
  blank();

  const ws: XLSX.WorkSheet = {};
  setWs(ws, rows, [40, 18, 4]);
  return { ws, names };
}

// ─── Sheet 3: Deal Overview ──────────────────────────────────────────────────
// Mostly formulas pulling from Assumptions + DCF + LBO sheets via named ranges
// and direct cross-sheet refs.
function buildOverviewSheet(inputs: DealInputs, C: C): XLSX.WorkSheet {
  const compsMultiple = C.compsMultiple as number;
  const precMultiple = C.precMultiple as number;
  const compsEV = C.compsEV as number;
  const precEV = C.precEV as number;

  const rows: (XLSX.CellObject | null)[][] = [
    [hdr("Deal Overview"), hdr(""), hdr(""), null, null],
    [lbl(""), null, null, null, null],
    [
      lbl("Headline:", true),
      {
        t: "s",
        v: `${inputs.acqName} acquires ${inputs.tgtName}`,
        s: styleFor({ bold: true }),
      },
      null,
      null,
      null,
    ],
    [lbl(""), null, null, null, null],

    [subhdr("DEAL VALUE"), subhdr(""), null, null, null],
    [
      lbl("Offer Price per Share"),
      fout(
        "=Tgt_Price*(1+Offer_Premium)",
        inputs.tgtPrice * (1 + inputs.offerPremium / 100),
        '"$"#,##0.00',
      ),
      null,
      null,
      null,
    ],
    [
      lbl("Equity Deal Value ($M)"),
      fout(
        "=Tgt_Price*(1+Offer_Premium)*Tgt_Shares",
        inputs.tgtPrice * (1 + inputs.offerPremium / 100) * inputs.tgtShares,
        '"$"#,##0.0"M"',
      ),
      null,
      null,
      null,
    ],
    [
      lbl("Offer Enterprise Value ($M)"),
      fout(
        "=Tgt_Price*(1+Offer_Premium)*Tgt_Shares+Tgt_NetDebt",
        inputs.tgtPrice * (1 + inputs.offerPremium / 100) * inputs.tgtShares +
          inputs.tgtNetDebt,
        '"$"#,##0.0"M"',
      ),
      null,
      null,
      null,
    ],
    [
      lbl("Implied EV / EBITDA Multiple"),
      fcell(
        "=(Tgt_Price*(1+Offer_Premium)*Tgt_Shares+Tgt_NetDebt)/Tgt_EBITDA",
        (inputs.tgtPrice * (1 + inputs.offerPremium / 100) * inputs.tgtShares +
          inputs.tgtNetDebt) /
          Math.max(0.01, inputs.tgtEBITDA),
        '0.00"x"',
      ),
      null,
      null,
      null,
    ],
    [lbl(""), null, null, null, null],

    [
      subhdr("VALUATION RANGE"),
      subhdr("EV ($M)"),
      null,
      subhdr("Multiple"),
      null,
    ],
    [
      lbl("DCF EV"),
      fout("='DCF Projections'!B22", C.dcfEV as number, '"$"#,##0.0"M"'),
      null,
      lbl(""),
      null,
    ],
    [
      lbl("Comparable Companies (mid)"),
      dollar(compsEV),
      null,
      lbl(`${compsMultiple.toFixed(2)}x`),
      null,
    ],
    [
      lbl("Precedent Transactions (mid)"),
      dollar(precEV),
      null,
      lbl(`${precMultiple.toFixed(2)}x`),
      null,
    ],
    [lbl(""), null, null, null, null],

    [subhdr("ACCRETION / DILUTION"), null, null, null, null],
    [
      lbl("Standalone EPS ($)"),
      num(C.standaloneEPS as number, '"$"#,##0.000'),
      null,
      null,
      null,
    ],
    [
      lbl("Pro Forma EPS ($)"),
      num(C.proFormaEPS as number, '"$"#,##0.000'),
      null,
      null,
      null,
    ],
    [
      lbl("EPS Change ($)"),
      {
        t: "n",
        v: C.epsChange as number,
        s: styleFor({
          bg: (C.isAccretive as boolean) ? CHECK_OK_BG : RED_BG,
          numFmt: '"$"#,##0.000',
        }),
      },
      null,
      null,
      null,
    ],
    [
      lbl("EPS Change (%)"),
      {
        t: "n",
        v: (C.epsChangePct as number) / 100,
        s: styleFor({
          bg: (C.isAccretive as boolean) ? CHECK_OK_BG : RED_BG,
          numFmt: "0.0%",
        }),
      },
      null,
      null,
      null,
    ],
    [
      lbl("Verdict"),
      {
        t: "s",
        v: (C.isAccretive as boolean) ? "Accretive" : "Dilutive",
        s: styleFor({ bg: OUTPUT_BG, bold: true }),
      },
      null,
      null,
      null,
    ],
    [lbl(""), null, null, null, null],

    [subhdr("LBO RETURNS"), null, null, null, null],
    [
      lbl("Sponsor Equity ($M)"),
      fout(
        "='LBO Analysis'!B11",
        C.lboEquityTranche as number,
        '"$"#,##0.0"M"',
      ),
      null,
      null,
      null,
    ],
    [
      lbl("Exit Equity ($M)"),
      fout("='LBO Analysis'!B25", C.exitEquityHold as number, '"$"#,##0.0"M"'),
      null,
      null,
      null,
    ],
    [
      lbl("MOIC"),
      fout("='LBO Analysis'!B26", C.moicTranche as number, '0.00"x"'),
      null,
      null,
      null,
    ],
    [
      lbl("IRR"),
      fout("='LBO Analysis'!B27", (C.irrTranche as number) / 100, "0.0%"),
      null,
      null,
      null,
    ],
    [lbl(""), null, null, null, null],

    [subhdr("DEAL SCORE"), null, null, null, null],
    [
      lbl("Total Score (0–100)"),
      out0to100(C.totalScore as number),
      null,
      null,
      null,
    ],
  ];

  const ws: XLSX.WorkSheet = {};
  setWs(ws, rows, [32, 18, 4, 18, 4]);
  return ws;
}

function out0to100(score: number): XLSX.CellObject {
  return {
    t: "n",
    v: score,
    s: styleFor({ bg: OUTPUT_BG, bold: true, numFmt: "0" }),
  };
}

// ─── Sheet 4: DCF Projections ───────────────────────────────────────────────
// Live formula chain. Year columns: B (Y1) through F (Y5).
// Row layout (1-indexed):
//   1 header / 2 blank / 3 subheader / 4 col headers
//   5 Revenue / 6 EBITDA / 7 D&A / 8 EBIT / 9 NOPAT
//   10 Capex / 11 ΔNWC / 12 FCFF / 13 PV of FCFF
//   14 blank / 15 Valuation Bridge subhdr
//   16 PV of FCFFs / 17 Terminal Value / 18 PV of TV / 19 TV % of EV / 20 blank
//   21 (blank) / 22 DCF EV / 23 Less: Net Debt / 24 DCF Equity / 25 Implied Price
function buildDCFSheet(inputs: DealInputs, C: C): XLSX.WorkSheet {
  const projections = C.projections as Array<{
    yr: number;
    rev: number;
    ebitda: number;
    ebit: number;
    fcff: number;
    pv: number;
  }>;
  // Use stored projections as fallback values; formulas drive the actual cells

  // Compute fallbacks for D&A, NOPAT, Capex, ΔNWC, FCFF (the DCF in IBSimulator uses these)
  const taxFrac = inputs.taxRate / 100;
  const capexFrac = inputs.capexPct / 100;
  const daRate = DA_RATES[inputs.sector] ?? 0.08;
  const nwcRate = NWC_RATES[inputs.sector] ?? 0.02;

  // Year columns are B..F (cols 1..5)
  const yrCol = (yr: number) => String.fromCharCode(65 + yr); // 1→B, 2→C, ...

  function rowHeader(label: string, isYearRow = false): XLSX.CellObject[] {
    return [isYearRow ? subhdr(label) : lbl(label, true)];
  }

  // Row 5: Revenue. Y1 = Tgt_Revenue * (1 + Rev_Growth). Subsequent years roll forward.
  const revCells = [1, 2, 3, 4, 5].map((yr) => {
    const v = inputs.tgtRevenue * Math.pow(1 + inputs.revenueGrowth / 100, yr);
    if (yr === 1)
      return fcell("=Tgt_Revenue*(1+Rev_Growth)", v, '"$"#,##0.0"M"');
    const prev = `${yrCol(yr - 1)}5`;
    return fcell(`=${prev}*(1+Rev_Growth)`, v, '"$"#,##0.0"M"');
  });

  // Row 6: EBITDA = Revenue * EBITDA_Margin
  const ebitdaCells = [1, 2, 3, 4, 5].map((yr) => {
    const ref = `${yrCol(yr)}5`;
    const v =
      inputs.tgtRevenue *
      Math.pow(1 + inputs.revenueGrowth / 100, yr) *
      (inputs.ebitdaMarginPct / 100);
    return fcell(`=${ref}*EBITDA_Margin`, v, '"$"#,##0.0"M"');
  });

  // Row 7: D&A = Revenue * DA_Rate
  const daCells = [1, 2, 3, 4, 5].map((yr) => {
    const ref = `${yrCol(yr)}5`;
    const v =
      inputs.tgtRevenue * Math.pow(1 + inputs.revenueGrowth / 100, yr) * daRate;
    return fcell(`=${ref}*DA_Rate`, v, '"$"#,##0.0"M"');
  });

  // Row 8: EBIT = EBITDA - D&A
  const ebitCells = [1, 2, 3, 4, 5].map((yr) => {
    const ebitdaRef = `${yrCol(yr)}6`;
    const daRef = `${yrCol(yr)}7`;
    const v = projections[yr - 1].ebit;
    return fcell(`=${ebitdaRef}-${daRef}`, v, '"$"#,##0.0"M"');
  });

  // Row 9: NOPAT = EBIT * (1 - Tax_Rate)
  const nopatCells = [1, 2, 3, 4, 5].map((yr) => {
    const ebitRef = `${yrCol(yr)}8`;
    const v = projections[yr - 1].ebit * (1 - taxFrac);
    return fcell(`=${ebitRef}*(1-Tax_Rate)`, v, '"$"#,##0.0"M"');
  });

  // Row 10: Capex = Revenue * Capex_Pct
  const capexCells = [1, 2, 3, 4, 5].map((yr) => {
    const revRef = `${yrCol(yr)}5`;
    const v =
      inputs.tgtRevenue *
      Math.pow(1 + inputs.revenueGrowth / 100, yr) *
      capexFrac;
    return fcell(`=${revRef}*Capex_Pct`, v, '"$"#,##0.0"M"');
  });

  // Row 11: ΔNWC = (Rev - PrevRev) * NWC_Rate. Year 1 prev = Tgt_Revenue.
  const nwcCells = [1, 2, 3, 4, 5].map((yr) => {
    const curRef = `${yrCol(yr)}5`;
    const prevRev = yr === 1 ? "Tgt_Revenue" : `${yrCol(yr - 1)}5`;
    const v =
      (inputs.tgtRevenue * Math.pow(1 + inputs.revenueGrowth / 100, yr) -
        (yr === 1
          ? inputs.tgtRevenue
          : inputs.tgtRevenue *
            Math.pow(1 + inputs.revenueGrowth / 100, yr - 1))) *
      nwcRate;
    return fcell(`=(${curRef}-${prevRev})*NWC_Rate`, v, '"$"#,##0.0"M"');
  });

  // Row 12: FCFF = NOPAT + D&A - Capex - ΔNWC
  const fcffCells = [1, 2, 3, 4, 5].map((yr) => {
    const nopatRef = `${yrCol(yr)}9`;
    const daRef = `${yrCol(yr)}7`;
    const capexRef = `${yrCol(yr)}10`;
    const nwcRef = `${yrCol(yr)}11`;
    const v = projections[yr - 1].fcff;
    return fcell(
      `=${nopatRef}+${daRef}-${capexRef}-${nwcRef}`,
      v,
      '"$"#,##0.0"M"',
    );
  });

  // Row 13: PV of FCFF = FCFF / (1 + WACC)^yr
  const pvCells = [1, 2, 3, 4, 5].map((yr) => {
    const fcffRef = `${yrCol(yr)}12`;
    const v = projections[yr - 1].pv;
    return fcell(`=${fcffRef}/((1+WACC)^${yr})`, v, '"$"#,##0.0"M"');
  });

  // Year header row (col B..F)
  const yearHdrRow: (XLSX.CellObject | null)[] = [
    subhdr("PROJECTIONS ($M)"),
    subhdr("Year 1"),
    subhdr("Year 2"),
    subhdr("Year 3"),
    subhdr("Year 4"),
    subhdr("Year 5"),
  ];

  const rows: (XLSX.CellObject | null)[][] = [
    [hdr("DCF Projections"), null, null, null, null, null], // row 1
    [lbl(""), null, null, null, null, null], // row 2
    [subhdr("5-YEAR FCFF MODEL"), null, null, null, null, null], // row 3
    yearHdrRow, // row 4
    [...rowHeader("Revenue"), ...revCells], // row 5
    [...rowHeader("EBITDA"), ...ebitdaCells], // row 6
    [...rowHeader("(–) D&A"), ...daCells], // row 7
    [...rowHeader("EBIT"), ...ebitCells], // row 8
    [...rowHeader("(–) Tax → NOPAT"), ...nopatCells], // row 9
    [...rowHeader("(–) Capex"), ...capexCells], // row 10
    [...rowHeader("(–) Δ NWC"), ...nwcCells], // row 11
    [...rowHeader("FCFF"), ...fcffCells], // row 12
    [...rowHeader("PV of FCFF (@ WACC)"), ...pvCells], // row 13
    [lbl(""), null, null, null, null, null], // row 14

    [subhdr("VALUATION BRIDGE"), null, null, null, null, null], // row 15

    // Row 16: Sum of PV(FCFF) — SUM(B13:F13)
    [
      lbl("PV of FCFFs (Y1–Y5)", true),
      fout("=SUM(B13:F13)", C.pvFCFFs as number, '"$"#,##0.0"M"'),
      null,
      null,
      null,
      null,
    ],
    // Row 17: Terminal Value = FCFF_Y5 * (1+g) / (WACC - g)
    [
      lbl("Terminal Value (Gordon)"),
      fcell(
        "=F12*(1+Terminal_Growth)/(WACC-Terminal_Growth)",
        C.tv as number,
        '"$"#,##0.0"M"',
      ),
      null,
      null,
      null,
      null,
    ],
    // Row 18: PV of TV = TV / (1+WACC)^5
    [
      lbl("PV of Terminal Value", true),
      fout("=B17/((1+WACC)^5)", C.pvTV as number, '"$"#,##0.0"M"'),
      null,
      null,
      null,
      null,
    ],
    // Row 19: TV % of EV
    [
      lbl("TV as % of EV"),
      fcell("=B18/B22", (C.tvPct as number) / 100, "0.0%"),
      null,
      null,
      null,
      null,
    ],
    [lbl(""), null, null, null, null, null], // row 20
    [lbl(""), null, null, null, null, null], // row 21
    // Row 22: DCF EV = PV FCFFs + PV TV
    [
      lbl("DCF Enterprise Value", true),
      fout("=B16+B18", C.dcfEV as number, '"$"#,##0.0"M"'),
      null,
      null,
      null,
      null,
    ],
    // Row 23: Less Net Debt
    [
      lbl("(–) Net Debt"),
      fcell("=Tgt_NetDebt", inputs.tgtNetDebt, '"$"#,##0.0"M"'),
      null,
      null,
      null,
      null,
    ],
    // Row 24: DCF Equity = EV - NetDebt
    [
      lbl("DCF Equity Value", true),
      fout("=B22-B23", C.dcfEquity as number, '"$"#,##0.0"M"'),
      null,
      null,
      null,
      null,
    ],
    // Row 25: Implied Price = Equity / Shares
    [
      lbl("DCF Implied Share Price", true),
      fout("=B24/Tgt_Shares", C.dcfImpliedPrice as number, '"$"#,##0.00'),
      null,
      null,
      null,
      null,
    ],
  ];

  const ws: XLSX.WorkSheet = {};
  setWs(ws, rows, [28, 14, 14, 14, 14, 14]);
  return ws;
}

// ─── Sheet 5: LBO Analysis ───────────────────────────────────────────────────
// Capital structure (rows 4-12), Exit (rows 14-19), Returns (rows 21-27),
// Debt schedule (rows 29+ — variable length based on hold period)
function buildLBOSheet(inputs: DealInputs, C: C): XLSX.WorkSheet {
  const debtSchedule = C.debtSchedule as Array<{
    yr: number;
    fcfYr: number;
    openDebt: number;
    repayment: number;
    closeDebt: number;
  }>;
  const hp = Math.max(1, inputs.holdPeriod);

  // Row layout (1-indexed):
  // 1: hdr
  // 2: blank
  // 3: subhdr "CAPITAL STRUCTURE"
  // 4: Offer EV (formula = mirror of Overview)
  // 5: Senior Debt = Tgt_EBITDA * Senior_Lev
  // 6: Mezz Debt = Tgt_EBITDA * Mezz_Lev
  // 7: Total Debt = B5 + B6
  // 8: Sponsor Equity = B4 - B7
  // 9: Senior Interest = B5 * Senior_Rate
  // 10: Mezz Interest = B6 * Mezz_Rate
  // 11: Total Interest = B9 + B10
  // 12: Debt / EBITDA = B7 / Tgt_EBITDA
  // 13: blank
  // 14: subhdr EXIT
  // 15: Exit Revenue = Tgt_Revenue * (1+Rev_Growth)^Hold_Period
  // 16: Exit EBITDA = B15 * EBITDA_Margin
  // 17: Exit EV = B16 * Exit_Mult
  // 18: Debt at Exit = closing debt of last year (formula refs schedule)
  // 19: Exit Equity = B17 - B18
  // 20: blank
  // 21: subhdr RETURNS
  // 22: Hold Period = Hold_Period
  // 23: Sponsor Equity invested = B8
  // 24: Exit Equity = B19
  // 25: Exit Equity (mirror for Overview reference) = B19
  // 26: MOIC = B19 / B8
  // 27: IRR = (MOIC^(1/Hold_Period)) - 1
  // 28: blank
  // 29: subhdr DEBT SCHEDULE (table header on row 29)

  const offerEV =
    inputs.tgtPrice * (1 + inputs.offerPremium / 100) * inputs.tgtShares +
    inputs.tgtNetDebt;

  const rows: (XLSX.CellObject | null)[][] = [];
  rows.push([hdr("LBO Analysis"), hdr(""), hdr(""), hdr(""), hdr("")]); // 1
  rows.push([lbl(""), null, null, null, null]); // 2
  rows.push([subhdr("CAPITAL STRUCTURE"), null, null, null, null]); // 3
  // 4 — Offer EV
  rows.push([
    lbl("Offer EV (Entry)", true),
    fout(
      "=Tgt_Price*(1+Offer_Premium)*Tgt_Shares+Tgt_NetDebt",
      offerEV,
      '"$"#,##0.0"M"',
    ),
    null,
    null,
    null,
  ]);
  // 5 — Senior Debt
  rows.push([
    lbl("Senior Debt"),
    fcell("=Tgt_EBITDA*Senior_Lev", C.seniorDebt as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  // 6 — Mezz Debt
  rows.push([
    lbl("Mezzanine Debt"),
    fcell("=Tgt_EBITDA*Mezz_Lev", C.mezzDebt as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  // 7 — Total Debt
  rows.push([
    lbl("Total Debt", true),
    fcell("=B5+B6", C.totalTranchedDebt as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  // 8 — Sponsor Equity
  rows.push([
    lbl("Sponsor Equity", true),
    fout("=MAX(0,B4-B7)", C.lboEquityTranche as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  // 9 — Senior Interest
  rows.push([
    lbl("Senior Interest (annual)"),
    fcell("=B5*Senior_Rate", C.seniorInterest as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  // 10 — Mezz Interest
  rows.push([
    lbl("Mezz Interest (annual)"),
    fcell("=B6*Mezz_Rate", C.mezzInterest as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  // 11 — Total Interest (also referenced by Overview row 24 — see Returns mirror)
  rows.push([
    lbl("Total Interest", true),
    fcell(
      "=B9+B10",
      (C.seniorInterest as number) + (C.mezzInterest as number),
      '"$"#,##0.0"M"',
    ),
    null,
    null,
    null,
  ]);
  // 12 — Debt / EBITDA
  rows.push([
    lbl("Debt / EBITDA"),
    fcell("=B7/Tgt_EBITDA", C.debtToEBITDA as number, '0.00"x"'),
    null,
    null,
    null,
  ]);
  rows.push([lbl(""), null, null, null, null]); // 13
  rows.push([subhdr("EXIT"), null, null, null, null]); // 14
  // 15 — Exit Revenue
  rows.push([
    lbl("Exit Revenue (Yr Hold)"),
    fcell(
      "=Tgt_Revenue*(1+Rev_Growth)^Hold_Period",
      inputs.tgtRevenue * Math.pow(1 + inputs.revenueGrowth / 100, hp),
      '"$"#,##0.0"M"',
    ),
    null,
    null,
    null,
  ]);
  // 16 — Exit EBITDA
  rows.push([
    lbl("Exit EBITDA"),
    fcell("=B15*EBITDA_Margin", C.exitEBITDAHold as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  // 17 — Exit EV
  rows.push([
    lbl("Exit Enterprise Value", true),
    fout("=B16*Exit_Mult", C.exitEVHold as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  // 18 — Debt at Exit (will reference debt schedule's last close-debt cell, set after schedule built)
  // We fill this AFTER computing the schedule rows to know the address.
  const debtAtExitRowIdx = rows.length; // index of the row we are about to push (0-based)
  rows.push([
    lbl("Debt at Exit"),
    // placeholder — replaced below
    fcell("=B7", C.debtAtExit as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  // 19 — Exit Equity
  rows.push([
    lbl("Exit Equity", true),
    fout("=MAX(0,B17-B18)", C.exitEquityHold as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  rows.push([lbl(""), null, null, null, null]); // 20
  rows.push([subhdr("RETURNS"), null, null, null, null]); // 21
  // 22 — Hold Period
  rows.push([
    lbl("Hold Period (yrs)"),
    fcell("=Hold_Period", hp, "0"),
    null,
    null,
    null,
  ]);
  // 23 — Sponsor Equity Invested (mirror)
  rows.push([
    lbl("Sponsor Equity Invested"),
    fcell("=B8", C.lboEquityTranche as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  // 24 — Exit Equity (mirror)
  rows.push([
    lbl("Exit Equity"),
    fcell("=B19", C.exitEquityHold as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  // 25 — Exit Equity reference (Overview row 25 reads this row's column B)
  rows.push([
    lbl("Total Proceeds to Sponsor", true),
    fout("=B19", C.exitEquityHold as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ]);
  // 26 — MOIC
  rows.push([
    lbl("MOIC", true),
    fout("=IF(B23>0,B25/B23,0)", C.moicTranche as number, '0.00"x"'),
    null,
    null,
    null,
  ]);
  // 27 — IRR
  rows.push([
    lbl("IRR", true),
    fout(
      "=IF(AND(B23>0,B25>0,B22>0),(B25/B23)^(1/B22)-1,0)",
      (C.irrTranche as number) / 100,
      "0.00%",
    ),
    null,
    null,
    null,
  ]);
  rows.push([lbl(""), null, null, null, null]); // 28

  // Debt schedule starts at row 29 (1-indexed)
  rows.push([
    subhdr("DEBT PAYDOWN SCHEDULE"),
    subhdr("Open Debt"),
    subhdr("FCF"),
    subhdr("Repayment"),
    subhdr("Close Debt"),
  ]);

  // Schedule data rows
  // Year 1: open = total debt (B7). FCF = Tgt_FCF * (1+rev_growth/2)^1. Repayment = MIN(open, FCF*FCF_Sweep). Close = open - repayment.
  // Subsequent years: open = prior close.
  const scheduleStartRow = rows.length + 1; // 1-indexed row of first data row
  for (let i = 0; i < hp; i++) {
    const yr = i + 1;
    const dataRow1Indexed = scheduleStartRow + i;
    const openFormula = i === 0 ? "=B7" : `=E${dataRow1Indexed - 1}`;
    const fcfFormula = `=Tgt_FCF*((1+Rev_Growth/2)^${yr})`;
    const repayFormula = `=MIN(B${dataRow1Indexed},C${dataRow1Indexed}*FCF_Sweep)`;
    const closeFormula = `=MAX(0,B${dataRow1Indexed}-D${dataRow1Indexed})`;
    const sched = debtSchedule[i] ?? {
      openDebt: 0,
      fcfYr: 0,
      repayment: 0,
      closeDebt: 0,
    };
    rows.push([
      lbl(`Year ${yr}`),
      fcell(openFormula, sched.openDebt, '"$"#,##0.0"M"'),
      fcell(fcfFormula, sched.fcfYr, '"$"#,##0.0"M"'),
      fcell(repayFormula, sched.repayment, '"$"#,##0.0"M"'),
      fcell(closeFormula, sched.closeDebt, '"$"#,##0.0"M"'),
    ]);
  }

  // Now patch row 18 (Debt at Exit) to reference the last close-debt cell
  const lastScheduleRow = scheduleStartRow + hp - 1;
  rows[debtAtExitRowIdx] = [
    lbl("Debt at Exit"),
    fcell(`=E${lastScheduleRow}`, C.debtAtExit as number, '"$"#,##0.0"M"'),
    null,
    null,
    null,
  ];

  const ws: XLSX.WorkSheet = {};
  setWs(ws, rows, [30, 16, 14, 14, 14]);
  return ws;
}

// ─── Sheet 6: IRR Sensitivity ────────────────────────────────────────────────
// Precomputed values — Excel doesn't support 2-variable data tables via
// SheetJS, and recomputing per-cell would require expanding the LBO model
// inline 25 times. Documented as static snapshot.
function buildSensitivitySheet(C: C): XLSX.WorkSheet {
  const sensitivityMatrix = C.sensitivityMatrix as Array<{
    holdPeriod: number;
    irrs: number[];
  }>;
  const exitMultiplesRange = C.exitMultiplesRange as number[];

  const headerRow: (XLSX.CellObject | null)[] = [
    subhdr("Hold ↓  /  Exit Mult →"),
    ...exitMultiplesRange.map((em) => subhdr(`${em.toFixed(1)}x`)),
  ];

  const dataRows = sensitivityMatrix.map(({ holdPeriod, irrs }) => [
    subhdr(`${holdPeriod}yr`),
    ...irrs.map((irr) => {
      const irrFrac = irr / 100;
      let bg: string | undefined;
      if (irr >= 25) bg = OUTPUT_BG;
      else if (irr <= 10) bg = RED_BG;
      return {
        t: "n",
        v: irrFrac,
        s: styleFor({ bg, numFmt: "0.0%" }),
      } as XLSX.CellObject;
    }),
  ]);

  const rows: (XLSX.CellObject | null)[][] = [
    [hdr("IRR Sensitivity"), ...exitMultiplesRange.map(() => hdr(""))],
    [lbl(""), ...exitMultiplesRange.map(() => null)],
    [
      lbl(
        "Snapshot — recomputed each time you export from FundSim. Edit Hold_Period or Exit_Mult on the Assumptions tab to refresh.",
      ),
      ...exitMultiplesRange.map(() => null),
    ],
    [lbl(""), ...exitMultiplesRange.map(() => null)],
    headerRow,
    ...dataRows,
    [lbl(""), ...exitMultiplesRange.map(() => null)],
    [
      lbl("Yellow ≥ 25% IRR  |  Red ≤ 10% IRR"),
      ...exitMultiplesRange.map(() => null),
    ],
  ];

  const ws: XLSX.WorkSheet = {};
  setWs(ws, rows, [22, ...exitMultiplesRange.map(() => 11)]);
  return ws;
}

// ─── Main export function ─────────────────────────────────────────────────────
export function exportIBModelToExcel(inputs: DealInputs, C: C): void {
  const wb = XLSX.utils.book_new();

  // Build Assumptions first to capture named-range definitions
  const { ws: assumptionsWs, names } = buildAssumptionsSheet(inputs, C);

  XLSX.utils.book_append_sheet(wb, buildCoverSheet(inputs), "Cover");
  XLSX.utils.book_append_sheet(wb, assumptionsWs, "Assumptions");
  XLSX.utils.book_append_sheet(
    wb,
    buildOverviewSheet(inputs, C),
    "Deal Overview",
  );
  XLSX.utils.book_append_sheet(wb, buildDCFSheet(inputs, C), "DCF Projections");
  XLSX.utils.book_append_sheet(wb, buildLBOSheet(inputs, C), "LBO Analysis");
  XLSX.utils.book_append_sheet(wb, buildSensitivitySheet(C), "IRR Sensitivity");

  // Wire in named ranges. Excel requires Workbook + Names structure.
  wb.Workbook = wb.Workbook ?? {};
  wb.Workbook.Names = names;
  // Force Excel to recompute formulas on open. Property exists in the OOXML
  // spec and is honored by xlsx-js-style at write time, but the package's
  // TypeScript types don't expose it on WBProps — cast through.
  (wb.Workbook as Record<string, unknown>).CalcPr = { fullCalcOnLoad: true };

  const date = new Date().toISOString().slice(0, 10);
  const tgtName = (inputs.tgtName || "Target").replace(/[^a-zA-Z0-9]/g, "_");
  const acqName = (inputs.acqName || "Acquirer").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `FundSim_IB_${acqName}_${tgtName}_${date}.xlsx`;

  XLSX.writeFile(wb, filename);
}
