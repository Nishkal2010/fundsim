/**
 * Professional CSV export utilities.
 * Applies investment-banking / CPA formatting conventions:
 *   - UTF-8 BOM so Excel opens correctly without an import wizard
 *   - Metadata block at top (company, title, period, units, date)
 *   - Section headers in ALL CAPS, no indent
 *   - Line items indented 2 spaces, sub-items 4 spaces
 *   - Subtotals labeled "Total [Section]"; grand totals ALL CAPS
 *   - Blank rows between sections
 *   - Footer block with notes
 */

/** Quote a single cell, escaping internal double-quotes. */
function q(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

/** Format a whole-dollar amount: 1,234,567 */
export function fmtUSD(v: number): string {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/** Format a percentage to 1 decimal: 23.4% */
export function fmtPct(v: number): string {
  return v.toFixed(1) + "%";
}

/** Format a multiple to 2 decimals: 2.35x */
export function fmtMultiple(v: number): string {
  return v.toFixed(2) + "x";
}

export type CsvRow = string[];

/** Empty row — separates sections */
export const blank = (): CsvRow => [];

/** Horizontal rule row */
export const rule = (): CsvRow => [
  q("──────────────────────────────────────────────"),
];

/** Metadata key-value pair (rows 1-5 of every export) */
export const meta = (key: string, value: string | number): CsvRow => [
  q(key),
  q(value),
];

/** Column header row */
export const colHeaders = (...cols: string[]): CsvRow => cols.map(q);

/** ALL CAPS section header — no indent, no value columns */
export const section = (title: string): CsvRow => [q(title.toUpperCase())];

/** Indented line item (2 spaces) */
export const item = (label: string, ...values: (string | number)[]): CsvRow => [
  q("  " + label),
  ...values.map(q),
];

/** Sub-indented line item (4 spaces) */
export const subitem = (
  label: string,
  ...values: (string | number)[]
): CsvRow => [q("    " + label), ...values.map(q)];

/** Subtotal — plain label, same indent level as section */
export const subtotal = (
  label: string,
  ...values: (string | number)[]
): CsvRow => [q(label), ...values.map(q)];

/** Grand total — ALL CAPS */
export const grandTotal = (
  label: string,
  ...values: (string | number)[]
): CsvRow => [q(label.toUpperCase()), ...values.map(q)];

/** Footer note line */
export const note = (text: string): CsvRow => [q("  * " + text)];

/**
 * Trigger a browser download of the given rows as a .csv file.
 * Prepends UTF-8 BOM (\uFEFF) so Excel opens it correctly.
 */
export function downloadCSV(filename: string, rows: CsvRow[]): void {
  const csv = "\uFEFF" + rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
