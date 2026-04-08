import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDECA } from "./DECAFinanceSuite";
import {
  getVisibleSteps,
  STEP_LABELS,
  EVENT_CONFIG,
} from "./config/eventConfig";

import { Step0_EventSelector } from "./steps/Step0_EventSelector";
import { Step1_BusinessOverview } from "./steps/Step1_BusinessOverview";
import { Step2_Assumptions } from "./steps/Step2_Assumptions";
import { Step3_StartupCosts } from "./steps/Step3_StartupCosts";
import { Step4_IncomeStatement } from "./steps/Step4_IncomeStatement";
import { Step5_CashFlow } from "./steps/Step5_CashFlow";
import { Step6_BalanceSheet } from "./steps/Step6_BalanceSheet";
import { Step7_ThreeYearPlan } from "./steps/Step7_ThreeYearPlan";
import { Step8_CapitalNeeds } from "./steps/Step8_CapitalNeeds";
import { Step9_BreakEven } from "./steps/Step9_BreakEven";
import { Step10_Sensitivity } from "./steps/Step10_Sensitivity";
import { Step11_ImplementationBudget } from "./steps/Step11_ImplementationBudget";
import { Step12_InternationalFinance } from "./steps/Step12_InternationalFinance";
import { Step13_CurrentFinancials } from "./steps/Step13_CurrentFinancials";
import { Step14_Review } from "./steps/Step14_Review";

interface Props {
  onBackToLanding: () => void;
}

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  0: Step0_EventSelector,
  1: Step1_BusinessOverview,
  2: Step2_Assumptions,
  3: Step3_StartupCosts,
  4: Step4_IncomeStatement,
  5: Step5_CashFlow,
  6: Step6_BalanceSheet,
  7: Step7_ThreeYearPlan,
  8: Step8_CapitalNeeds,
  9: Step9_BreakEven,
  10: Step10_Sensitivity,
  11: Step11_ImplementationBudget,
  12: Step12_InternationalFinance,
  13: Step13_CurrentFinancials,
  14: Step14_Review,
};

export function DECAWizard({ onBackToLanding }: Props) {
  const { state, dispatch, computed } = useDECA();
  const { currentStep, eventCode } = state;
  const { validations } = computed;

  const visibleSteps = getVisibleSteps(eventCode);
  const currentIndex = visibleSteps.indexOf(currentStep);
  const totalSteps = visibleSteps.length;
  const progressPct =
    totalSteps > 1 ? (currentIndex / (totalSteps - 1)) * 100 : 0;

  const errorCount = validations.filter(
    (v) => !v.passed && v.severity === "error",
  ).length;
  const warningCount = validations.filter(
    (v) => !v.passed && v.severity === "warning",
  ).length;
  const passedCount = validations.filter((v) => v.passed).length;

  const canGoBack = currentIndex > 0;
  const canGoNext = currentIndex < totalSteps - 1;

  function goNext() {
    if (canGoNext) {
      dispatch({ type: "SET_STEP", payload: visibleSteps[currentIndex + 1] });
    }
  }

  function goBack() {
    if (canGoBack) {
      dispatch({ type: "SET_STEP", payload: visibleSteps[currentIndex - 1] });
    }
  }

  const StepComponent = STEP_COMPONENTS[currentStep] ?? Step0_EventSelector;
  const eventCfg = eventCode ? EVENT_CONFIG[eventCode] : null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0A0F1C" }}
    >
      {/* ── Top bar — matches main site Header style ── */}
      <div
        className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between gap-4"
        style={{
          background: "#111827",
          borderBottom: "1px solid #374151",
        }}
      >
        {/* Left: brand breadcrumb */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="font-serif leading-none tracking-tight"
            style={{ fontSize: "18px", color: "#F9FAFB" }}
          >
            FundSim
          </span>
          <span style={{ color: "#4B5563", fontSize: "14px" }}>/</span>
          <span
            className="text-xs font-bold tracking-widest px-2 py-1 rounded"
            style={{
              background: "rgba(99,102,241,0.15)",
              color: "#818CF8",
              border: "1px solid rgba(99,102,241,0.3)",
              fontFamily: "monospace",
            }}
          >
            DECA SUITE
          </span>
          {eventCode && (
            <span
              className="text-xs px-2 py-1 rounded font-bold"
              style={{
                background: "rgba(212,175,55,0.1)",
                color: "#d4af37",
                border: "1px solid rgba(212,175,55,0.25)",
                fontFamily: "monospace",
              }}
            >
              {eventCode}
            </span>
          )}
        </div>

        {/* Center: progress bar */}
        <div className="flex-1 max-w-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "#6B7280" }}>
              Step {currentIndex + 1} of {totalSteps}
            </span>
            <span className="text-xs" style={{ color: "#6B7280" }}>
              {Math.round(progressPct)}% complete
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "#1F2937" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #6366F1, #818CF8)",
              }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Right: validation status + exit */}
        <div className="flex items-center gap-2 shrink-0">
          {errorCount > 0 && (
            <span
              className="text-xs px-2 py-1 rounded font-bold"
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "#EF4444",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              {errorCount} error{errorCount > 1 ? "s" : ""}
            </span>
          )}
          {warningCount > 0 && (
            <span
              className="text-xs px-2 py-1 rounded font-bold"
              style={{
                background: "rgba(245,158,11,0.1)",
                color: "#F59E0B",
                border: "1px solid rgba(245,158,11,0.25)",
              }}
            >
              {warningCount} warning{warningCount > 1 ? "s" : ""}
            </span>
          )}
          {errorCount === 0 && warningCount === 0 && passedCount > 0 && (
            <span
              className="text-xs px-2 py-1 rounded font-bold"
              style={{
                background: "rgba(16,185,129,0.1)",
                color: "#10B981",
                border: "1px solid rgba(16,185,129,0.25)",
              }}
            >
              ✓ {passedCount} checks passed
            </span>
          )}
          <button
            onClick={onBackToLanding}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(55,65,81,0.5)",
              color: "#9CA3AF",
              border: "1px solid #374151",
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#F9FAFB";
              (e.currentTarget as HTMLButtonElement).style.background =
                "#374151";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(55,65,81,0.5)";
            }}
          >
            ← Exit
          </button>
        </div>
      </div>

      {/* ── Step pill nav (horizontal scroll) — matches TabBar style ── */}
      <div
        className="px-6 py-2 overflow-x-auto flex items-center gap-1"
        style={{
          borderBottom: "1px solid #374151",
          background: "#111827",
        }}
      >
        {visibleSteps.map((stepNum, idx) => {
          const isActive = stepNum === currentStep;
          const isDone = idx < currentIndex;
          return (
            <button
              key={stepNum}
              onClick={() => dispatch({ type: "SET_STEP", payload: stepNum })}
              className="relative shrink-0 px-3 py-2 rounded text-xs font-medium transition-all"
              style={{
                background: isActive
                  ? "rgba(99,102,241,0.1)"
                  : isDone
                    ? "rgba(16,185,129,0.08)"
                    : "transparent",
                color: isActive ? "#818CF8" : isDone ? "#10B981" : "#6B7280",
                border: isActive
                  ? "1px solid rgba(99,102,241,0.3)"
                  : isDone
                    ? "1px solid rgba(16,185,129,0.2)"
                    : "1px solid transparent",
                cursor: "pointer",
              }}
            >
              {isDone ? "✓ " : ""}
              {STEP_LABELS[stepNum] ?? `Step ${stepNum}`}
              {isActive && (
                <motion.div
                  layoutId="deca-step-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #6366F1, #818CF8)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Rubric callout (if event selected) ── */}
      {eventCfg && currentStep > 0 && (
        <div
          className="mx-6 mt-4 px-4 py-3 rounded-lg text-xs"
          style={{
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#A5B4FC",
          }}
        >
          <span className="font-bold" style={{ color: "#818CF8" }}>
            {eventCfg.code} Rubric:{" "}
          </span>
          {eventCfg.rubricNotes}
        </div>
      )}

      {/* ── Step content ── */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto px-6 py-6"
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom nav ── */}
      <div
        className="sticky bottom-0 px-6 py-4 flex items-center justify-between"
        style={{
          background: "#111827",
          borderTop: "1px solid #374151",
        }}
      >
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="px-6 py-2.5 rounded-lg text-sm font-medium"
          style={{
            background: canGoBack ? "rgba(55,65,81,0.6)" : "rgba(31,41,55,0.3)",
            color: canGoBack ? "#D1D5DB" : "#4B5563",
            border: `1px solid ${canGoBack ? "#374151" : "#1F2937"}`,
            cursor: canGoBack ? "pointer" : "not-allowed",
            transition: "all 0.18s ease",
          }}
        >
          ← Back
        </button>

        <span className="text-xs" style={{ color: "#4B5563" }}>
          {STEP_LABELS[currentStep] ?? `Step ${currentStep}`}
        </span>

        {currentStep === 14 ? (
          <button
            onClick={() => {
              window.print();
            }}
            className="px-6 py-2.5 rounded-lg text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #6366F1, #818CF8)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
              transition: "all 0.18s ease",
            }}
          >
            Print Financial Section
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className="px-6 py-2.5 rounded-lg text-sm font-bold"
            style={{
              background: canGoNext
                ? "linear-gradient(135deg, #6366F1, #818CF8)"
                : "rgba(31,41,55,0.3)",
              color: canGoNext ? "#fff" : "#4B5563",
              border: "none",
              cursor: canGoNext ? "pointer" : "not-allowed",
              boxShadow: canGoNext ? "0 0 20px rgba(99,102,241,0.3)" : "none",
              transition: "all 0.18s ease",
            }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
