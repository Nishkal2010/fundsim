export function getScoreColor(total: number): string {
  return total >= 80
    ? "#22C55E"
    : total >= 60
      ? "#F59E0B"
      : total >= 40
        ? "#F97316"
        : "#EF4444";
}

export function getScoreLabel(total: number): string {
  return total >= 80
    ? "Strong Deal"
    : total >= 60
      ? "Solid Deal"
      : total >= 40
        ? "Weak Deal"
        : "Poor Deal";
}
