import React from "react"; // kept
import type { WaterfallData, FundInputs } from "../../types/fund";
import {
  formatMillions,
  formatMultiple,
  formatIRR,
  formatPercent,
} from "../../utils/formatting";

interface DistributionTableProps {
  data: WaterfallData;
  inputs: FundInputs;
}

export function DistributionTable({ data, inputs }: DistributionTableProps) {
  const lpCapital = inputs.fundSize * (1 - inputs.gpCommitment);
  const gpCapital = inputs.fundSize * inputs.gpCommitment;
  const lpProfit = data.totalLP - lpCapital;
  const gpProfit = data.totalGP - gpCapital;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid #374151" }}
    >
      <div
        className="px-5 py-3"
        style={{ background: "#1F2937", borderBottom: "1px solid #374151" }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB]">
          LP vs GP Summary
        </h3>
      </div>
      <div style={{ background: "#111827" }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: "1px solid #374151" }}>
              <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-semibold text-[#6B7280]">
                Metric
              </th>
              <th
                className="px-5 py-3 text-right text-[10px] uppercase tracking-wider font-semibold"
                style={{ color: "#10B981" }}
              >
                Limited Partners
              </th>
              <th
                className="px-5 py-3 text-right text-[10px] uppercase tracking-wider font-semibold"
                style={{ color: "#818CF8" }}
              >
                General Partner
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                label: "Capital Contributed",
                lp: formatMillions(lpCapital),
                gp: formatMillions(gpCapital),
              },
              {
                label: "Total Distributions",
                lp: formatMillions(data.totalLP),
                gp: formatMillions(data.totalGP),
              },
              {
                label: "Profit",
                lp: formatMillions(lpProfit),
                gp: formatMillions(gpProfit),
              },
              {
                label: "Net Multiple",
                lp: formatMultiple(data.lpNetMultiple),
                gp: formatMultiple(data.gpNetMultiple),
              },
              {
                label: "Approx. IRR",
                lp: formatIRR(data.lpIRR),
                gp: "N/A",
              },
              {
                label: "% of Total Proceeds",
                lp:
                  data.totalLP + data.totalGP > 0
                    ? formatPercent(
                        data.totalLP / (data.totalLP + data.totalGP),
                        1,
                      )
                    : "—",
                gp:
                  data.totalLP + data.totalGP > 0
                    ? formatPercent(
                        data.totalGP / (data.totalLP + data.totalGP),
                        1,
                      )
                    : "—",
              },
              {
                label: "Carry Received",
                lp: "—",
                gp: formatMillions(data.gpCarry),
              },
              {
                label: "Effective Carry %",
                lp: "—",
                gp: formatPercent(data.effectiveCarryPct, 1),
              },
            ].map((row, i) => (
              <tr
                key={row.label}
                style={{
                  background: i % 2 === 0 ? "#111827" : "#0D1420",
                  borderBottom: "1px solid #1F2937",
                }}
              >
                <td className="px-5 py-2.5 text-[#9CA3AF]">{row.label}</td>
                <td
                  className="px-5 py-2.5 text-right tabular-nums"
                  style={{ color: "#10B981" }}
                >
                  {row.lp}
                </td>
                <td
                  className="px-5 py-2.5 text-right tabular-nums"
                  style={{ color: "#818CF8" }}
                >
                  {row.gp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
