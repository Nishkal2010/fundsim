import * as XLSX from "xlsx";

// IB color palette: blue=inputs, black=formulas, yellow=outputs
const BLUE = "C6EFCE"; // input cells — light green in Excel convention; using light blue for inputs
const YELLOW = "FFEB9C"; // output / highlight
const HEADER = "1F4E79"; // dark navy header
const HEADER_FONT = "FFFFFF";
const SUBHEADER = "BDD7EE"; // light blue sub-header
const RED = "FFC7CE"; // negative / warning

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

function cell(
  value: string | number,
  bgColor?: string,
  bold?: boolean,
  numFmt?: string,
): XLSX.CellObject {
  const c: XLSX.CellObject = {
    v: value,
    t: typeof value === "number" ? "n" : "s",
  };
  if (numFmt || bgColor || bold) {
    c.s = {
      ...(bgColor
        ? { fill: { fgColor: { rgb: bgColor }, patternType: "solid" } }
        : {}),
      ...(bold || bgColor === HEADER
        ? {
            font: {
              bold: true,
              color: { rgb: bgColor === HEADER ? HEADER_FONT : "000000" },
            },
          }
        : {}),
      ...(numFmt ? { numFmt } : {}),
      alignment: { vertical: "center" },
    };
  }
  return c;
}

function hdr(label: string): XLSX.CellObject {
  return cell(label, HEADER, true);
}
function subhdr(label: string): XLSX.CellObject {
  return cell(label, SUBHEADER, true);
}
function inp(value: number, fmt = "#,##0.0"): XLSX.CellObject {
  return cell(value, "DCE6F1", false, fmt); // light blue = input
}
function out(value: number, fmt = "#,##0.0"): XLSX.CellObject {
  return cell(value, YELLOW, true, fmt); // yellow = output
}
function neg(value: number, fmt = "#,##0.0"): XLSX.CellObject {
  return cell(value, RED, false, fmt);
}
function lbl(label: string): XLSX.CellObject {
  return cell(label);
}
function num(value: number, fmt = "#,##0.0"): XLSX.CellObject {
  return cell(value, undefined, false, fmt);
}
function pct(value: number): XLSX.CellObject {
  return cell(value / 100, undefined, false, "0.0%");
}
function dollar(value: number): XLSX.CellObject {
  return cell(value, undefined, false, '"$"#,##0.0"M"');
}
function outDollar(value: number): XLSX.CellObject {
  return cell(value, YELLOW, true, '"$"#,##0.0"M"');
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

// ─── Sheet 1: Deal Overview ───────────────────────────────────────────────────
function buildOverviewSheet(inputs: DealInputs, C: C): XLSX.WorkSheet {
  const {
    acqName,
    tgtName,
    sector,
    dealType,
    offerPremium,
    cashPct,
    wacc,
    revenueGrowth,
    terminalGrowth,
    ebitdaMarginPct,
    seniorLeverage,
    mezzLeverage,
    holdPeriod,
  } = inputs;

  const rows: (XLSX.CellObject | null)[][] = [
    [hdr("FundSim — IB Deal Summary"), null, hdr(""), null, null],
    [lbl(`${acqName} / ${tgtName} Deal`), null, lbl(""), null, null],
    [lbl(""), null, lbl(""), null, null],

    // Acquirer
    [subhdr("ACQUIRER"), subhdr(""), null, null, null],
    [lbl("Company"), lbl(acqName), null, null, null],
    [lbl("Revenue ($M)"), inp(inputs.acqRevenue), null, null, null],
    [lbl("EBITDA ($M)"), inp(inputs.acqEBITDA), null, null, null],
    [lbl("Net Income ($M)"), inp(inputs.acqNI), null, null, null],
    [lbl("Shares Out (M)"), inp(inputs.acqShares), null, null, null],
    [
      lbl("Share Price ($)"),
      inp(inputs.acqPrice, '"$"#,##0.00'),
      null,
      null,
      null,
    ],
    [lbl("Net Debt ($M)"), inp(inputs.acqNetDebt), null, null, null],
    [lbl(""), null, null, null, null],

    // Target
    [subhdr("TARGET"), subhdr(""), null, null, null],
    [lbl("Company"), lbl(tgtName), null, null, null],
    [lbl("Revenue ($M)"), inp(inputs.tgtRevenue), null, null, null],
    [lbl("EBITDA ($M)"), inp(inputs.tgtEBITDA), null, null, null],
    [lbl("Net Income ($M)"), inp(inputs.tgtNI), null, null, null],
    [lbl("Shares Out (M)"), inp(inputs.tgtShares), null, null, null],
    [
      lbl("Share Price ($)"),
      inp(inputs.tgtPrice, '"$"#,##0.00'),
      null,
      null,
      null,
    ],
    [lbl("Net Debt ($M)"), inp(inputs.tgtNetDebt), null, null, null],
    [lbl("FCF ($M)"), inp(inputs.tgtFCF), null, null, null],
    [lbl(""), null, null, null, null],

    // Deal Terms
    [subhdr("DEAL TERMS"), subhdr(""), null, null, null],
    [lbl("Sector"), lbl(sector), null, null, null],
    [lbl("Deal Type"), lbl(dealType), null, null, null],
    [lbl("Offer Premium (%)"), inp(offerPremium, "0.0%"), null, null, null],
    [lbl("Cash / Stock Mix (% Cash)"), inp(cashPct, "0.0%"), null, null, null],
    [
      lbl("Transaction Fees (% of deal)"),
      inp(inputs.transactionFees, "0.0%"),
      null,
      null,
      null,
    ],
    [lbl(""), null, null, null, null],

    // Key Outputs
    [subhdr("KEY OUTPUTS"), null, null, subhdr(""), subhdr("")],
    [lbl(""), lbl("Value ($M)"), null, lbl("Multiple"), lbl("")],
    [
      lbl("Offer Price ($/sh)"),
      outDollar(C.offerPrice as number),
      null,
      null,
      null,
    ],
    [
      lbl("Deal Value (Equity)"),
      outDollar(C.dealValue as number),
      null,
      null,
      null,
    ],
    [lbl("Offer EV"), outDollar(C.offerEV as number), null, null, null],
    [lbl("DCF EV"), outDollar(C.dcfEV as number), null, null, null],
    [
      lbl("Comps EV (mid)"),
      outDollar(C.compsEV as number),
      null,
      lbl(`${(C.compsMultiple as number).toFixed(1)}x EBITDA`),
      null,
    ],
    [
      lbl("Prec. Transactions EV (mid)"),
      outDollar(C.precEV as number),
      null,
      lbl(`${(C.precMultiple as number).toFixed(1)}x EBITDA`),
      null,
    ],
    [lbl(""), null, null, null, null],

    // Accretion / Dilution
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
      (C.isAccretive ? num : neg)(C.epsChange as number, '"$"#,##0.000'),
      null,
      null,
      null,
    ],
    [
      lbl("EPS Change (%)"),
      (C.isAccretive ? num : neg)((C.epsChangePct as number) / 100, "0.0%"),
      null,
      null,
      null,
    ],
    [
      lbl("Accretive?"),
      out(C.isAccretive ? 1 : 0, '"""Accretive""";"";"""Dilutive"""'),
      null,
      null,
      null,
    ],
    [lbl(""), null, null, null, null],

    // LBO Summary
    [subhdr("LBO SUMMARY"), null, null, null, null],
    [lbl("Senior Leverage"), inp(seniorLeverage, "0.0x"), null, null, null],
    [lbl("Mezz Leverage"), inp(mezzLeverage, "0.0x"), null, null, null],
    [lbl("Hold Period (yrs)"), inp(holdPeriod, "0"), null, null, null],
    [lbl("WACC (%)"), inp(wacc, "0.0%"), null, null, null],
    [lbl("Revenue Growth (%)"), inp(revenueGrowth, "0.0%"), null, null, null],
    [lbl("Terminal Growth (%)"), inp(terminalGrowth, "0.0%"), null, null, null],
    [lbl("EBITDA Margin (%)"), inp(ebitdaMarginPct, "0.0%"), null, null, null],
    [
      lbl("LBO IRR"),
      out((C.irrTranche as number) / 100, "0.0%"),
      null,
      null,
      null,
    ],
    [lbl("LBO MOIC"), out(C.moicTranche as number, "0.0x"), null, null, null],
    [
      lbl("DSCR"),
      (C.dscr as number) >= 1.2
        ? num(C.dscr as number, "0.00x")
        : neg(C.dscr as number, "0.00x"),
      null,
      null,
      null,
    ],
    [lbl("Deal Score"), out(C.totalScore as number, "0"), null, null, null],
  ];

  const ws: XLSX.WorkSheet = {};
  setWs(ws, rows, [28, 18, 4, 18, 14]);
  return ws;
}

// ─── Sheet 2: DCF Projections ─────────────────────────────────────────────────
function buildDCFSheet(inputs: DealInputs, C: C): XLSX.WorkSheet {
  const projections = C.projections as Array<{
    yr: number;
    rev: number;
    ebitda: number;
    ebit: number;
    fcff: number;
    pv: number;
  }>;

  const rows: (XLSX.CellObject | null)[][] = [
    [hdr("DCF — 5-Year Projections"), null, null, null, null, null, null],
    [lbl(`Target: ${inputs.tgtName}`), null, null, null, null, null, null],
    [lbl(""), null, null, null, null, null, null],
    [subhdr("Assumptions"), null, null, null, null, null, null],
    [
      lbl("Revenue Growth (%)"),
      inp(inputs.revenueGrowth, "0.0%"),
      null,
      null,
      null,
      null,
      null,
    ],
    [
      lbl("EBITDA Margin (%)"),
      inp(inputs.ebitdaMarginPct, "0.0%"),
      null,
      null,
      null,
      null,
      null,
    ],
    [lbl("WACC (%)"), inp(inputs.wacc, "0.0%"), null, null, null, null, null],
    [
      lbl("Terminal Growth (%)"),
      inp(inputs.terminalGrowth, "0.0%"),
      null,
      null,
      null,
      null,
      null,
    ],
    [
      lbl("Tax Rate (%)"),
      inp(inputs.taxRate, "0.0%"),
      null,
      null,
      null,
      null,
      null,
    ],
    [
      lbl("Capex (% of Rev)"),
      inp(inputs.capexPct, "0.0%"),
      null,
      null,
      null,
      null,
      null,
    ],
    [lbl(""), null, null, null, null, null, null],
    [
      subhdr("PROJECTIONS ($M)"),
      subhdr("Year 1"),
      subhdr("Year 2"),
      subhdr("Year 3"),
      subhdr("Year 4"),
      subhdr("Year 5"),
      null,
    ],
    [lbl("Revenue"), ...projections.map((p) => dollar(p.rev)), null],
    [lbl("EBITDA"), ...projections.map((p) => dollar(p.ebitda)), null],
    [lbl("EBIT"), ...projections.map((p) => dollar(p.ebit)), null],
    [lbl("FCFF"), ...projections.map((p) => dollar(p.fcff)), null],
    [lbl("PV of FCFF"), ...projections.map((p) => dollar(p.pv)), null],
    [lbl(""), null, null, null, null, null, null],
    [subhdr("VALUATION BRIDGE"), null, null, null, null, null, null],
    [
      lbl("PV of FCFFs"),
      outDollar(C.pvFCFFs as number),
      null,
      null,
      null,
      null,
      null,
    ],
    [
      lbl("Terminal Value"),
      dollar(C.tv as number),
      null,
      null,
      null,
      null,
      null,
    ],
    [
      lbl("PV of Terminal Value"),
      outDollar(C.pvTV as number),
      null,
      null,
      null,
      null,
      null,
    ],
    [
      lbl("TV as % of EV"),
      num((C.tvPct as number) / 100, "0.0%"),
      null,
      null,
      null,
      null,
      null,
    ],
    [lbl(""), null, null, null, null, null, null],
    [
      lbl("DCF Enterprise Value"),
      outDollar(C.dcfEV as number),
      null,
      null,
      null,
      null,
      null,
    ],
    [
      lbl("Less: Net Debt"),
      dollar(inputs.tgtNetDebt),
      null,
      null,
      null,
      null,
      null,
    ],
    [
      lbl("DCF Equity Value"),
      outDollar(C.dcfEquity as number),
      null,
      null,
      null,
      null,
      null,
    ],
    [
      lbl("DCF Implied Share Price"),
      out(C.dcfImpliedPrice as number, '"$"#,##0.00'),
      null,
      null,
      null,
      null,
      null,
    ],
  ];

  const ws: XLSX.WorkSheet = {};
  setWs(ws, rows, [26, 14, 14, 14, 14, 14, 4]);
  return ws;
}

// ─── Sheet 3: LBO Analysis ───────────────────────────────────────────────────
function buildLBOSheet(inputs: DealInputs, C: C): XLSX.WorkSheet {
  const debtSchedule = C.debtSchedule as Array<{
    yr: number;
    fcfYr: number;
    openDebt: number;
    repayment: number;
    closeDebt: number;
  }>;

  const scheduleRows: (XLSX.CellObject | null)[][] = debtSchedule.map((d) => [
    lbl(`Year ${d.yr}`),
    dollar(d.openDebt),
    dollar(d.fcfYr),
    dollar(d.repayment),
    dollar(d.closeDebt),
  ]);

  const rows: (XLSX.CellObject | null)[][] = [
    [hdr("LBO Analysis"), null, null, null, null],
    [lbl(`Target: ${inputs.tgtName}`), null, null, null, null],
    [lbl(""), null, null, null, null],

    [subhdr("CAPITAL STRUCTURE"), null, null, null, null],
    [lbl("Offer EV (Entry)"), outDollar(C.offerEV as number), null, null, null],
    [lbl("Senior Debt"), dollar(C.seniorDebt as number), null, null, null],
    [
      lbl("  Senior Leverage"),
      inp(inputs.seniorLeverage, "0.0x"),
      null,
      null,
      null,
    ],
    [
      lbl("  Senior Rate (%)"),
      inp(inputs.seniorRate, "0.0%"),
      null,
      null,
      null,
    ],
    [
      lbl("  Annual Senior Interest"),
      dollar(C.seniorInterest as number),
      null,
      null,
      null,
    ],
    [lbl("Mezz Debt"), dollar(C.mezzDebt as number), null, null, null],
    [
      lbl("  Mezz Leverage"),
      inp(inputs.mezzLeverage, "0.0x"),
      null,
      null,
      null,
    ],
    [lbl("  Mezz Rate (%)"), inp(inputs.mezzRate, "0.0%"), null, null, null],
    [
      lbl("  Annual Mezz Interest"),
      dollar(C.mezzInterest as number),
      null,
      null,
      null,
    ],
    [
      lbl("Total Debt"),
      outDollar(C.totalTranchedDebt as number),
      null,
      null,
      null,
    ],
    [
      lbl("Equity (Sponsor)"),
      outDollar(C.lboEquityTranche as number),
      null,
      null,
      null,
    ],
    [
      lbl("Debt / EBITDA"),
      out(C.debtToEBITDA as number, "0.0x"),
      null,
      null,
      null,
    ],
    [
      lbl("Interest Coverage"),
      num(C.interestCovTranche as number, "0.0x"),
      null,
      null,
      null,
    ],
    [
      lbl("DSCR"),
      (C.dscr as number) >= 1.2
        ? num(C.dscr as number, "0.00x")
        : neg(C.dscr as number, "0.00x"),
      null,
      null,
      null,
    ],
    [
      lbl("FCF Yield"),
      num((C.fcfYield as number) / 100, "0.0%"),
      null,
      null,
      null,
    ],
    [lbl("NOL Shield"), dollar(C.nolShield as number), null, null, null],
    [lbl(""), null, null, null, null],

    [subhdr("EXIT SCENARIO"), null, null, null, null],
    [lbl("Hold Period (yrs)"), inp(inputs.holdPeriod, "0"), null, null, null],
    [
      lbl("Exit EBITDA ($M)"),
      dollar(C.exitEBITDAHold as number),
      null,
      null,
      null,
    ],
    [
      lbl("Exit Multiple"),
      inp(C.exitMultipleFinal as number, "0.0x"),
      null,
      null,
      null,
    ],
    [lbl("Exit EV"), outDollar(C.exitEVHold as number), null, null, null],
    [lbl("Debt at Exit"), dollar(C.debtAtExit as number), null, null, null],
    [
      lbl("Exit Equity"),
      outDollar(C.exitEquityHold as number),
      null,
      null,
      null,
    ],
    [lbl("MOIC"), out(C.moicTranche as number, "0.0x"), null, null, null],
    [lbl("IRR"), out((C.irrTranche as number) / 100, "0.0%"), null, null, null],
    [lbl(""), null, null, null, null],

    [
      subhdr("DEBT PAYDOWN SCHEDULE"),
      subhdr("Open Debt"),
      subhdr("FCF"),
      subhdr("Repayment"),
      subhdr("Close Debt"),
    ],
    ...scheduleRows,
  ];

  const ws: XLSX.WorkSheet = {};
  setWs(ws, rows, [28, 16, 14, 14, 14]);
  return ws;
}

// ─── Sheet 4: IRR Sensitivity Matrix ────────────────────────────────────────
function buildSensitivitySheet(C: C): XLSX.WorkSheet {
  const sensitivityMatrix = C.sensitivityMatrix as Array<{
    holdPeriod: number;
    irrs: number[];
  }>;
  const exitMultiplesRange = C.exitMultiplesRange as number[];

  const headerRow: (XLSX.CellObject | null)[] = [
    hdr("IRR Sensitivity: Hold Period × Exit Multiple"),
    ...exitMultiplesRange.map((em) => subhdr(`${em.toFixed(1)}x`)),
  ];

  const dataRows = sensitivityMatrix.map(({ holdPeriod: hp, irrs }) => [
    subhdr(`${hp}yr`),
    ...irrs.map((irr) => {
      const irrFrac = irr / 100;
      if (irr >= 25) return out(irrFrac, "0.0%");
      if (irr >= 20) return num(irrFrac, "0.0%");
      if (irr <= 10) return neg(irrFrac, "0.0%");
      return num(irrFrac, "0.0%");
    }),
  ]);

  const rows: (XLSX.CellObject | null)[][] = [
    [hdr("LBO Returns Sensitivity"), null, null, null, null, null],
    [lbl(""), null, null, null, null, null],
    [lbl("Exit Multiple →"), null, null, null, null, null],
    headerRow,
    ...dataRows,
    [lbl(""), null, null, null, null, null],
    [
      lbl("Green = IRR ≥ 25%  |  Red = IRR ≤ 10%"),
      null,
      null,
      null,
      null,
      null,
    ],
  ];

  const ws: XLSX.WorkSheet = {};
  setWs(ws, rows, [24, 12, 12, 12, 12, 12]);
  return ws;
}

// ─── Main export function ─────────────────────────────────────────────────────
export function exportIBModelToExcel(inputs: DealInputs, C: C): void {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    buildOverviewSheet(inputs, C),
    "Deal Overview",
  );
  XLSX.utils.book_append_sheet(wb, buildDCFSheet(inputs, C), "DCF Projections");
  XLSX.utils.book_append_sheet(wb, buildLBOSheet(inputs, C), "LBO Analysis");
  XLSX.utils.book_append_sheet(wb, buildSensitivitySheet(C), "IRR Sensitivity");

  const date = new Date().toISOString().slice(0, 10);
  const tgtName = (inputs.tgtName || "Target").replace(/[^a-zA-Z0-9]/g, "_");
  const acqName = (inputs.acqName || "Acquirer").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `FundSim_IB_${acqName}_${tgtName}_${date}.xlsx`;

  XLSX.writeFile(wb, filename);
}
