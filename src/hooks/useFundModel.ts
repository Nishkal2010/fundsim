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
import { calculatePortfolio } from "../utils/portfolio";
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
  // Portfolio construction defaults
  numDeals: 20,
  followOnReservePercent: 0.2,
  fundStrategy: "buyout",
  vintageYear: 2020,
};

export const FundModelContext = createContext<FundModel | null>(null);

export function useFundModelState(
  userId: string | null | undefined,
): FundModel {
  const [inputs, setInputs] = useState<FundInputs>(defaultInputs);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

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
          // Merge with defaults to handle new fields added after a user's data was saved
          setInputs({ ...defaultInputs, ...(data.inputs as FundInputs) });
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
      if (userId && loaded.current) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        const capturedUserId = userId;
        saveTimer.current = setTimeout(async () => {
          if (capturedUserId !== userIdRef.current) return;
          try {
            const { error } = await supabase
              .from("fund_models")
              .upsert(
                { user_id: capturedUserId, inputs: next },
                { onConflict: "user_id" },
              );
            if (error) {
              console.error("useFundModel: failed to save inputs", error);
            }
          } catch (err) {
            console.error("useFundModel: unexpected error saving inputs", err);
          }
        }, 1500);
      }
      return next;
    });
  };

  const lifecycle = useMemo(() => calculateLifecycle(inputs), [inputs]);
  const jCurve = useMemo(() => calculateJCurve(inputs), [inputs]);
  const waterfall = useMemo(() => calculateWaterfall(inputs), [inputs]);
  const performance = useMemo(() => calculatePerformance(inputs), [inputs]);
  const portfolio = useMemo(() => calculatePortfolio(inputs), [inputs]);

  return {
    inputs,
    setInput,
    lifecycle,
    jCurve,
    waterfall,
    performance,
    portfolio,
  };
}

export function useFundModel(): FundModel {
  const ctx = useContext(FundModelContext);
  if (!ctx)
    throw new Error("useFundModel must be used within FundModelContext");
  return ctx;
}
