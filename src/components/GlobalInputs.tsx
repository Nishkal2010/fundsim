import React from "react"; // kept
import { Slider } from "./Slider";
import { useFundModel } from "../hooks/useFundModel";
import { ScenarioPresets } from "./ScenarioPresets";
import type { FundInputs } from "../types/fund";

export function GlobalInputs() {
  const { inputs, setInput } = useFundModel();

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
          <ScenarioPresets onLoad={handleLoadScenario} />
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
