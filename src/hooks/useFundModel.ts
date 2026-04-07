import { useState, useMemo, createContext, useContext } from 'react';
import type { FundInputs, FundModel } from '../types/fund';
import { calculateLifecycle } from '../utils/fundLifecycle';
import { calculateJCurve } from '../utils/jCurve';
import { calculateWaterfall } from '../utils/waterfall';
import { calculatePerformance } from '../utils/performance';

const defaultInputs: FundInputs = {
  fundSize: 100,
  fundLife: 10,
  investmentPeriod: 5,
  managementFee: 0.02,
  carryPercentage: 0.20,
  hurdleRate: 0.08,
  gpCommitment: 0.02,
  avgHoldPeriod: 5,
  lossRatio: 0.30,
  avgExitMultiple: 3.0,
  exitDistribution: 'bell',
  totalProceeds: 200,
  waterfallType: 'european',
  catchUpRate: 1.0,
  clawback: true,
  dealMultiples: [0.5, 1.0, 2.0, 3.5, 8.0],
  spReturn: 0.10,
};

export const FundModelContext = createContext<FundModel | null>(null);

export function useFundModelState(): FundModel {
  const [inputs, setInputs] = useState<FundInputs>(defaultInputs);

  const setInput = <K extends keyof FundInputs>(key: K, value: FundInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const lifecycle = useMemo(() => calculateLifecycle(inputs), [inputs]);
  const jCurve = useMemo(() => calculateJCurve(inputs), [inputs]);
  const waterfall = useMemo(() => calculateWaterfall(inputs), [inputs]);
  const performance = useMemo(() => calculatePerformance(inputs), [inputs]);

  return { inputs, setInput, lifecycle, jCurve, waterfall, performance };
}

export function useFundModel(): FundModel {
  const ctx = useContext(FundModelContext);
  if (!ctx) throw new Error('useFundModel must be used within FundModelContext');
  return ctx;
}
