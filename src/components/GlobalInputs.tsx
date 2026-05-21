import React, { useState } from "react";
import { Link2 } from "lucide-react";
import { Slider } from "./Slider";
import { useFundModel } from "../hooks/useFundModel";
import { ScenarioPresets } from "./ScenarioPresets";
import { buildShareUrl } from "../lib/shareUrl";
import type { FundInputs } from "../types/fund";

export function GlobalInputs() {
  const { inputs, setInput } = useFundModel();
  const [copied, setCopied] = useState(false);

  function handleLoadScenario(preset: Partial<FundInputs>) {
    (Object.keys(preset) as Array<keyof FundInputs>).forEach((key) => {
      const value = preset[key];
      if (value !== undefined) {
        (
          setInput as (
            k: keyof FundInputs,
            v: FundInputs[keyof FundInputs],
          ) => void
        )(key, value);
      }
    });
  }

  async function handleShare() {
    const url = buildShareUrl(inputs);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for browsers that block clipboard without user gesture
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="w-full px-6 py-4"
      style={{
        background: "#111827",
        borderBottom: "1px solid #374151",
        position: "sticky",
        top: "65px",
        zIndex: 90,
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] text-[#6B7280] uppercase tracking-widest font-semibold">
            Global Fund Parameters
          </div>
          <div className="flex items-center gap-2">
            <ScenarioPresets onLoad={handleLoadScenario} />
            <button
              onClick={handleShare}
              title="Copy shareable link to this model"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-all duration-150"
              style={{
                background: copied ? "rgba(16,185,129,0.1)" : "#18202F",
                borderColor: copied ? "#10B981" : "#374151",
                color: copied ? "#10B981" : "rgba(255,255,255,0.45)",
              }}
            >
              <Link2 size={12} />
              {copied ? "Copied!" : "Share"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-4">
          <Slider
            label="Fund Size"
            value={inputs.fundSize}
            min={10}
            max={1000}
            step={10}
            format={(v) =>
              v >= 1000 ? `$${(v / 1000).toFixed(1)}B` : `$${v}M`
            }
            onChange={(v) => setInput("fundSize", v)}
          />
          <Slider
            label="Fund Life"
            value={inputs.fundLife}
            min={5}
            max={15}
            step={1}
            format={(v) => `${v}yr`}
            onChange={(v) => setInput("fundLife", v)}
          />
          <Slider
            label="Inv. Period"
            value={inputs.investmentPeriod}
            min={2}
            max={7}
            step={1}
            format={(v) => `${v}yr`}
            onChange={(v) =>
              setInput("investmentPeriod", Math.min(v, inputs.fundLife - 1))
            }
          />
          <Slider
            label="Mgmt Fee"
            value={inputs.managementFee * 100}
            min={0}
            max={3}
            step={0.1}
            format={(v) => `${v.toFixed(1)}%`}
            onChange={(v) => setInput("managementFee", v / 100)}
          />
          <Slider
            label="Carry"
            value={inputs.carryPercentage * 100}
            min={0}
            max={30}
            step={1}
            format={(v) => `${v.toFixed(0)}%`}
            onChange={(v) => setInput("carryPercentage", v / 100)}
          />
          <Slider
            label="Hurdle Rate"
            value={inputs.hurdleRate * 100}
            min={0}
            max={15}
            step={0.5}
            format={(v) => `${v.toFixed(1)}%`}
            onChange={(v) => setInput("hurdleRate", v / 100)}
          />
          <Slider
            label="GP Commit"
            value={inputs.gpCommitment * 100}
            min={0}
            max={10}
            step={0.5}
            format={(v) => `${v.toFixed(1)}%`}
            onChange={(v) => setInput("gpCommitment", v / 100)}
          />
        </div>
      </div>
    </div>
  );
}
