import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { SCENARIO_PRESETS } from "../data/scenarios";
import type { FundInputs } from "../types/fund";

interface ScenarioPresetsProps {
  onLoad: (inputs: Partial<FundInputs>) => void;
}

export function ScenarioPresets({ onLoad }: ScenarioPresetsProps) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState<string | null>(null);

  function handleSelect(preset: (typeof SCENARIO_PRESETS)[0]) {
    onLoad(preset.inputs);
    setLoaded(preset.id);
    setOpen(false);
    setTimeout(() => setLoaded(null), 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg text-zinc-300 hover:text-white transition-all duration-150"
      >
        <Sparkles size={14} className="text-blue-400" />
        <span>Load Scenario</span>
        <ChevronDown
          size={14}
          className={`text-zinc-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="listbox"
            aria-label="Scenario presets"
            className="absolute right-0 top-full mt-2 z-20 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-zinc-800">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                Industry Scenarios
              </p>
            </div>
            {SCENARIO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                role="option"
                aria-selected={loaded === preset.id}
                onClick={() => handleSelect(preset)}
                className="w-full text-left px-3 py-2.5 hover:bg-zinc-800 transition-colors duration-100 group"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className="text-lg leading-none mt-0.5"
                    aria-hidden="true"
                  >
                    {preset.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-white">
                      {preset.name}
                      {loaded === preset.id && (
                        <span className="ml-2 text-xs text-green-400">
                          ✓ Loaded
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
