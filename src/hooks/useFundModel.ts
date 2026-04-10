import {
  useState,
  useMemo,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import type { FundInputs, FundModel } from "../types/fund";
import { calculateLifecycle } from "../utils/fundLifecycle";
import { calculateJCurve } from "../utils/jCurve";
import { calculateWaterfall } from "../utils/waterfall";
import { calculatePerformance } from "../utils/performance";
import { supabase } from "../lib/supabase";

const defaultInputs: FundInputs = {
  fundSize: 100,
  fundLife: 10,
  investmentPeriod: 5,
  managementFee: 0.02,
  carryPercentage: 0.2,
  hurdleRate: 0.08,
  gpCommitment: 0.02,
  avgHoldPeriod: 5,
  lossRatio: 0.3,
  avgExitMultiple: 3.0,
  exitDistribution: "bell",
  totalProceeds: 200,
  waterfallType: "european",
  catchUpRate: 1.0,
  clawback: true,
  dealMultiples: [0.5, 1.0, 2.0, 3.5, 8.0],
  spReturn: 0.1,
};

export const FundModelContext = createContext<FundModel | null>(null);

export function useFundModelState(
  userId: string | null | undefined,
): FundModel {
  const [inputs, setInputs] = useState<FundInputs>(defaultInputs);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  // Load saved inputs when user logs in; reset to defaults when logged out
  useEffect(() => {
    if (!userId) {
      loaded.current = false;
      setInputs(defaultInputs);
      return;
    }
    loaded.current = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("fund_models")
          .select("inputs")
          .eq("user_id", userId)
          .maybeSingle();
        if (data?.inputs) {
          setInputs(data.inputs as FundInputs);
        }
      } catch {
        // ignore load errors, use defaults
      } finally {
        loaded.current = true;
      }
    })();
  }, [userId]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const setInput = <K extends keyof FundInputs>(
    key: K,
    value: FundInputs[K],
  ) => {
    setInputs((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-save for authenticated (non-demo) users, debounced 1.5s
      if (userId && loaded.current) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          supabase
            .from("fund_models")
            .upsert(
              { user_id: userId, inputs: next },
              { onConflict: "user_id" },
            );
        }, 1500);
      }
      return next;
    });
  };

  const lifecycle = useMemo(() => calculateLifecycle(inputs), [inputs]);
  const jCurve = useMemo(() => calculateJCurve(inputs), [inputs]);
  const waterfall = useMemo(() => calculateWaterfall(inputs), [inputs]);
  const performance = useMemo(() => calculatePerformance(inputs), [inputs]);

  return { inputs, setInput, lifecycle, jCurve, waterfall, performance };
}

export function useFundModel(): FundModel {
  const ctx = useContext(FundModelContext);
  if (!ctx)
    throw new Error("useFundModel must be used within FundModelContext");
  return ctx;
}
