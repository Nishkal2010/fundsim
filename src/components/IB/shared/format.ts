export function fmtM(n: number, d = 0): string {
  if (!isFinite(n)) return "N/A";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}B`;
  return `${sign}$${abs.toFixed(d)}M`;
}

export function fmtN(n: number, d = 1): string {
  if (!isFinite(n)) return "N/A";
  return n.toFixed(d);
}

export function fmtPct(n: number, d = 1): string {
  if (!isFinite(n)) return "N/A";
  return `${n.toFixed(d)}%`;
}
