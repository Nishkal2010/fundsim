import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { QuantInputs } from "../utils/quant/types";
import { safeStorageGet, safeStorageSet } from "../lib/storage";

// Lightweight, localStorage-only model for the Quant track. Deliberately NOT
// the Supabase-backed FundModelContext — quant inputs are ephemeral scratch
// state, not a saved fund.

const STORAGE_KEY = "fundsim_quant_model";

export const defaultQuantInputs: QuantInputs = {
  spot: 100,
  strike: 100,
  rate: 0.05,
  vol: 0.2,
  maturity: 1,
  dividendYield: 0,
  optionType: "call",
  mcPaths: 10000,
  steps: 100,
  drift: 0.08,
  seed: 42,
  assets: [
    { name: "Equities", expReturn: 0.1, vol: 0.18 },
    { name: "Bonds", expReturn: 0.04, vol: 0.06 },
    { name: "Commodities", expReturn: 0.07, vol: 0.24 },
  ],
  correlations: [
    [1, -0.2, 0.3],
    [-0.2, 1, 0.1],
    [0.3, 0.1, 1],
  ],
};

export interface QuantModel {
  inputs: QuantInputs;
  setInput: <K extends keyof QuantInputs>(
    key: K,
    value: QuantInputs[K],
  ) => void;
  setInputs: (patch: Partial<QuantInputs>) => void;
  reset: () => void;
}

export const QuantModelContext = createContext<QuantModel | null>(null);

function loadInputs(): QuantInputs {
  const raw = safeStorageGet(STORAGE_KEY);
  if (!raw) return defaultQuantInputs;
  try {
    const parsed = JSON.parse(raw) as Partial<QuantInputs>;
    // Shallow-merge over defaults so new fields added later are populated.
    return { ...defaultQuantInputs, ...parsed };
  } catch {
    return defaultQuantInputs;
  }
}

export function useQuantModelState(): QuantModel {
  const [inputs, setInputsState] = useState<QuantInputs>(loadInputs);

  useEffect(() => {
    safeStorageSet(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  const setInput = useCallback(
    <K extends keyof QuantInputs>(key: K, value: QuantInputs[K]) => {
      setInputsState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setInputs = useCallback((patch: Partial<QuantInputs>) => {
    setInputsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => setInputsState(defaultQuantInputs), []);

  return { inputs, setInput, setInputs, reset };
}

export function useQuantModel(): QuantModel {
  const ctx = useContext(QuantModelContext);
  if (!ctx)
    throw new Error("useQuantModel must be used within a QuantModelContext");
  return ctx;
}
