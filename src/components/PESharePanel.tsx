import React from "react";
import { useFundModel } from "../hooks/useFundModel";
import { ShareButton } from "./ShareButton";

const fmt = (n: number, decimals = 1) => n.toFixed(decimals);
const pct = (n: number) => `${fmt(n * 100)}%`;
const x = (n: number) => `${fmt(n)}x`;

export function PESharePanel() {
  const { inputs, waterfall } = useFundModel();

  const summary = {
    title: `$${inputs.fundSize}M ${inputs.fundStrategy.charAt(0).toUpperCase() + inputs.fundStrategy.slice(1)} Fund — ${inputs.vintageYear}`,
    subtitle: `${inputs.waterfallType === "european" ? "European" : "American"} waterfall · ${inputs.fundLife}-year fund life`,
    metrics: [
      { label: "LP Net IRR", value: waterfall.lpIRR != null ? `${fmt(waterfall.lpIRR)}%` : "N/A", highlight: true },
      { label: "LP Net MOIC", value: x(waterfall.lpNetMultiple), highlight: true },
      { label: "GP Carry ($M)", value: `$${fmt(waterfall.gpCarry / 1_000_000, 1)}M`, highlight: true },
      { label: "Fund Size", value: `$${inputs.fundSize}M` },
      { label: "Strategy", value: inputs.fundStrategy },
      { label: "Vintage", value: String(inputs.vintageYear) },
      { label: "Management Fee", value: pct(inputs.managementFee) },
      { label: "Carry", value: pct(inputs.carryPercentage) },
      { label: "Hurdle Rate", value: pct(inputs.hurdleRate) },
      { label: "Fund Life", value: `${inputs.fundLife}yr` },
      { label: "Avg Exit Multiple", value: x(inputs.avgExitMultiple) },
      { label: "Waterfall", value: inputs.waterfallType === "european" ? "European" : "American" },
    ],
  };

  const payload = {
    simulator: "pe" as const,
    tab: "waterfall",
    inputs: inputs as unknown as Record<string, unknown>,
    summary,
  };

  return (
    <div className="flex justify-end px-4 py-3 border-t border-gray-800">
      <ShareButton data={payload} label="Share Deal Summary" />
    </div>
  );
}
