import React, { useState, useEffect } from "react";
import { Analytics, track } from "@vercel/analytics/react";
import { motion, AnimatePresence } from "framer-motion";
import { FundModelContext, useFundModelState } from "./hooks/useFundModel";
import { Header } from "./components/Header";
import { GlobalInputs } from "./components/GlobalInputs";
import { TabBar } from "./components/TabBar";
import type { PETabId, VCTabId, QuantTabId } from "./components/TabBar";
import { QuantModelContext, useQuantModelState } from "./hooks/useQuantModel";
import { Glossary } from "./components/Glossary";
import { Footer } from "./components/Footer";
import { LoginPage } from "./components/LoginPage";
import { SimulatorSelector } from "./components/SimulatorSelector";
import type { SimulatorId } from "./components/SimulatorSelector";
import { Hero } from "./components/Hero";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import {
  safeStorageGet,
  safeStorageSet,
  safeStorageRemove,
} from "./lib/storage";
import { SharedScenarioBanner } from "./components/SharedScenarioBanner";
import { FinFoxProvider } from "./components/FinFox/FinFoxProvider";
import { FinFoxMascot } from "./components/FinFox/FinFoxMascot";
import { ChatPanel } from "./components/FinFox/ChatPanel";
import { useFinFox } from "./hooks/useFinFox";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { ShareView } from "./components/ShareView";
const OnboardingTour = React.lazy(() =>
  import("./components/OnboardingTour").then((m) => ({
    default: m.OnboardingTour,
  })),
);
const FundLifecycleTab = React.lazy(() =>
  import("./components/FundLifecycle/FundLifecycleTab").then((m) => ({
    default: m.FundLifecycleTab,
  })),
);
const JCurveTab = React.lazy(() =>
  import("./components/JCurve/JCurveTab").then((m) => ({
    default: m.JCurveTab,
  })),
);
const WaterfallTab = React.lazy(() =>
  import("./components/Waterfall/WaterfallTab").then((m) => ({
    default: m.WaterfallTab,
  })),
);
const PerformanceTab = React.lazy(() =>
  import("./components/Performance/PerformanceTab").then((m) => ({
    default: m.PerformanceTab,
  })),
);
const PortfolioTab = React.lazy(() =>
  import("./components/Portfolio/PortfolioTab").then((m) => ({
    default: m.PortfolioTab,
  })),
);
const LBOTab = React.lazy(() =>
  import("./components/LBO/LBOTab").then((m) => ({ default: m.LBOTab })),
);
const GPLPEconomicsTab = React.lazy(() =>
  import("./components/PE/GPLPEconomicsTab").then((m) => ({
    default: m.GPLPEconomicsTab,
  })),
);
const DebtStructureTab = React.lazy(() =>
  import("./components/PE/DebtStructureTab").then((m) => ({
    default: m.DebtStructureTab,
  })),
);
const SectorBenchmarksTab = React.lazy(() =>
  import("./components/PE/SectorBenchmarksTab").then((m) => ({
    default: m.SectorBenchmarksTab,
  })),
);
const VCTab = React.lazy(() =>
  import("./components/VC/VCTab").then((m) => ({ default: m.VCTab })),
);
const SAFENotesTab = React.lazy(() =>
  import("./components/VC/SAFENotesTab").then((m) => ({
    default: m.SAFENotesTab,
  })),
);
const PortfolioConstructionTab = React.lazy(() =>
  import("./components/VC/PortfolioConstructionTab").then((m) => ({
    default: m.PortfolioConstructionTab,
  })),
);
const TermSheetTab = React.lazy(() =>
  import("./components/VC/TermSheetTab").then((m) => ({
    default: m.TermSheetTab,
  })),
);
const QualitativeTab = React.lazy(() =>
  import("./components/VC/QualitativeTab").then((m) => ({
    default: m.QualitativeTab,
  })),
);
const MarketSizingTab = React.lazy(() =>
  import("./components/VC/MarketSizingTab").then((m) => ({
    default: m.MarketSizingTab,
  })),
);
const DealMemoTab = React.lazy(() =>
  import("./components/VC/DealMemoTab").then((m) => ({
    default: m.DealMemoTab,
  })),
);
const IBSimulator = React.lazy(() =>
  import("./components/IB/IBSimulator").then((m) => ({
    default: m.IBSimulator,
  })),
);
const IBCompare = React.lazy(() =>
  import("./components/IB/IBCompare").then((m) => ({
    default: m.IBCompare,
  })),
);
const VCRoleplayTab = React.lazy(() =>
  import("./components/VC/VCRoleplayTab").then((m) => ({
    default: m.VCRoleplayTab,
  })),
);
const PERoleplayTab = React.lazy(() =>
  import("./components/PE/PERoleplayTab").then((m) => ({
    default: m.PERoleplayTab,
  })),
);
const IBRoleplayTab = React.lazy(() =>
  import("./components/IB/IBRoleplayTab").then((m) => ({
    default: m.IBRoleplayTab,
  })),
);
const DECAFinanceSuite = React.lazy(() =>
  import("./components/DECA/DECAFinanceSuite").then((m) => ({
    default: m.DECAFinanceSuite,
  })),
);
const YISFinanceSuite = React.lazy(() =>
  import("./components/YIS/YISFinanceSuite").then((m) => ({
    default: m.YISFinanceSuite,
  })),
);
const ComparePage = React.lazy(() =>
  import("./components/ComparePage").then((m) => ({ default: m.ComparePage })),
);
const ScenarioCompare = React.lazy(() =>
  import("./components/Scenarios/ScenarioCompare").then((m) => ({
    default: m.ScenarioCompare,
  })),
);
const StatusPage = React.lazy(() =>
  import("./components/StatusPage").then((m) => ({ default: m.StatusPage })),
);
const PathFlowMap = React.lazy(
  () => import("./components/PathFlow/PathFlowMap"),
);
const LeaderboardPanel = React.lazy(() =>
  import("./components/Leaderboard/LeaderboardPanel").then((m) => ({
    default: m.LeaderboardPanel,
  })),
);
const DealChallengeModal = React.lazy(() =>
  import("./components/DealChallenge/DealChallengeModal").then((m) => ({
    default: m.DealChallengeModal,
  })),
);
const AssignmentBuilder = React.lazy(() =>
  import("./components/Assignment/AssignmentBuilder").then((m) => ({
    default: m.AssignmentBuilder,
  })),
);
const StartHereMode = React.lazy(() =>
  import("./components/StartHere/StartHereMode").then((m) => ({
    default: m.StartHereMode,
  })),
);
const PricePathsTab = React.lazy(() =>
  import("./components/Quant/PricePathsTab").then((m) => ({
    default: m.PricePathsTab,
  })),
);
const MonteCarloTab = React.lazy(() =>
  import("./components/Quant/MonteCarloTab").then((m) => ({
    default: m.MonteCarloTab,
  })),
);
const OptionsLabTab = React.lazy(() =>
  import("./components/Quant/OptionsLabTab").then((m) => ({
    default: m.OptionsLabTab,
  })),
);
const GreeksTab = React.lazy(() =>
  import("./components/Quant/GreeksTab").then((m) => ({
    default: m.GreeksTab,
  })),
);
const ImpliedVolTab = React.lazy(() =>
  import("./components/Quant/ImpliedVolTab").then((m) => ({
    default: m.ImpliedVolTab,
  })),
);
const EfficientFrontierTab = React.lazy(() =>
  import("./components/Quant/EfficientFrontierTab").then((m) => ({
    default: m.EfficientFrontierTab,
  })),
);
const RiskTab = React.lazy(() =>
  import("./components/Quant/RiskTab").then((m) => ({ default: m.RiskTab })),
);
const FixedIncomeTab = React.lazy(() =>
  import("./components/Quant/FixedIncomeTab").then((m) => ({
    default: m.FixedIncomeTab,
  })),
);
const BacktestTab = React.lazy(() =>
  import("./components/Quant/BacktestTab").then((m) => ({
    default: m.BacktestTab,
  })),
);
const DrillsTab = React.lazy(() =>
  import("./components/Quant/DrillsTab").then((m) => ({
    default: m.DrillsTab,
  })),
);
const QuantRoleplayTab = React.lazy(() =>
  import("./components/Quant/QuantRoleplayTab").then((m) => ({
    default: m.QuantRoleplayTab,
  })),
);
import { usePathProgress } from "./hooks/usePathProgress";
import { captureEvent, identifyUser, resetUser } from "./lib/posthog";
import { isFlagEnabled } from "./lib/flags";
import { supabase } from "./lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthUser {
  id?: string; // undefined for demo/localStorage users
  name: string;
  email: string;
  picture?: string;
}

function mapSupabaseUser(u: User): AuthUser {
  return {
    id: u.id,
    name:
      u.user_metadata?.full_name ??
      u.user_metadata?.name ??
      u.email?.split("@")[0] ??
      "User",
    email: u.email ?? "",
    picture: u.user_metadata?.avatar_url ?? u.user_metadata?.picture,
  };
}

interface AppContentProps {
  user: AuthUser;
  onLogout: () => void;
}

function AppContent({ user, onLogout }: AppContentProps) {
  const [activeSimulator, setActiveSimulator] = useState<SimulatorId | null>(
    null,
  );
  const [activePETab, setActivePETab] = useState<PETabId>("lifecycle");
  const [activeVCTab, setActiveVCTab] = useState<VCTabId>("captable");
  const [activeQuantTab, setActiveQuantTab] =
    useState<QuantTabId>("pricepaths");
  const [ibView, setIbView] = useState<"simulator" | "roleplay" | "compare">(
    "simulator",
  );
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showChallenge, setShowChallenge] = useState(() => {
    if (!isFlagEnabled("clubChallenge")) return false;
    const hasChallengeParam =
      new URLSearchParams(window.location.search).get("challenge") === "1";
    return hasChallengeParam || window.location.hash === "#challenge";
  });
  const [showAssignmentBuilder, setShowAssignmentBuilder] = useState(
    () =>
      isFlagEnabled("assignmentMode") &&
      window.location.hash === "#assignment-builder",
  );
  const [hash, setHash] = useState(() => window.location.hash.replace("#", ""));
  const [showStartHere, setShowStartHere] = useState(
    () => isFlagEnabled("startHere") && !localStorage.getItem("startHere_seen"),
  );
  // Holds a pending FinFox message to fire after React commits the new
  // activeSimulator state — avoids the 400ms magic-number race in StartHereMode.
  const pendingFinfoxMsg = React.useRef<string | null>(null);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace("#", "");
      setHash(h);
      if (h === "pe" || h === "vc" || h === "ib") {
        captureEvent("sim_opened", { sim: h });
      } else if (h === "compare") {
        captureEvent("compare_opened");
      } else if (h === "scenarios") {
        captureEvent("scenarios_opened");
      } else if (h === "leaderboard") {
        setShowLeaderboard(true);
        window.history.replaceState(null, "", window.location.pathname);
        setHash("");
      } else if (
        h === "assignment-builder" &&
        isFlagEnabled("assignmentMode")
      ) {
        setShowAssignmentBuilder(true);
        window.history.replaceState(null, "", window.location.pathname);
        setHash("");
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Sync simulator + active tab into FinFox so the chatbot's quick chips
  // and system prompt reflect exactly what the user is looking at.
  const { setActiveSim, setActiveScreen, openChat } = useFinFox();
  useEffect(() => {
    setActiveSim(activeSimulator);
    if (activeSimulator === null) {
      setActiveScreen("home");
    } else {
      track("simulator_entered", { simulator: activeSimulator });
    }
  }, [activeSimulator, setActiveSim, setActiveScreen]);

  useEffect(() => {
    if (activeSimulator === "pe") setActiveScreen(activePETab);
  }, [activeSimulator, activePETab, setActiveScreen]);

  useEffect(() => {
    if (activeSimulator === "vc") setActiveScreen(activeVCTab);
  }, [activeSimulator, activeVCTab, setActiveScreen]);

  useEffect(() => {
    if (activeSimulator === "quant") setActiveScreen(activeQuantTab);
  }, [activeSimulator, activeQuantTab, setActiveScreen]);

  // Fire the FinFox greeting that StartHere queued AFTER React has committed
  // the new activeSimulator + tab state — this is the proper handshake that
  // replaces the fragile 400ms setTimeout that lived inside StartHereMode.
  useEffect(() => {
    const msg = pendingFinfoxMsg.current;
    if (msg && activeSimulator !== null) {
      pendingFinfoxMsg.current = null;
      openChat(msg);
    }
  }, [activeSimulator, openChat]);

  // Scroll to top whenever a simulator is entered or tab changes within a sim.
  // Without this, entering a simulator can land the user mid-page.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeSimulator, activePETab, activeVCTab, activeQuantTab, ibView]);

  useKeyboardShortcuts([
    {
      key: "1",
      description: "Fund Lifecycle",
      action: () => {
        setActiveSimulator("pe");
        setActivePETab("lifecycle");
      },
    },
    {
      key: "2",
      description: "J-Curve",
      action: () => {
        setActiveSimulator("pe");
        setActivePETab("jcurve");
      },
    },
    {
      key: "3",
      description: "Waterfall",
      action: () => {
        setActiveSimulator("pe");
        setActivePETab("waterfall");
      },
    },
    {
      key: "4",
      description: "Performance",
      action: () => {
        setActiveSimulator("pe");
        setActivePETab("performance");
      },
    },
    {
      key: "?",
      description: "Show shortcuts",
      action: () => setShortcutsOpen((v) => !v),
    },
    {
      key: "g",
      description: "Toggle glossary",
      action: () => setGlossaryOpen((v) => !v),
    },
    {
      key: "Escape",
      description: "Close modals",
      action: () => {
        setShortcutsOpen(false);
        setGlossaryOpen(false);
      },
    },
  ]);

  const lazyFallback = <LoadingSkeleton />;

  if (hash === "compare")
    return (
      <React.Suspense fallback={lazyFallback}>
        <ComparePage />
      </React.Suspense>
    );
  if (hash === "deca")
    return (
      <React.Suspense fallback={lazyFallback}>
        <DECAFinanceSuite />
      </React.Suspense>
    );
  if (hash === "yis")
    return (
      <React.Suspense fallback={lazyFallback}>
        <YISFinanceSuite />
      </React.Suspense>
    );
  if (hash === "scenarios")
    return (
      <React.Suspense fallback={lazyFallback}>
        <ScenarioCompare />
      </React.Suspense>
    );
  if (hash === "status")
    return (
      <React.Suspense fallback={lazyFallback}>
        <StatusPage />
      </React.Suspense>
    );

  const peTabContent: Record<PETabId, React.ReactNode> = {
    lifecycle: <FundLifecycleTab />,
    jcurve: <JCurveTab />,
    waterfall: <WaterfallTab />,
    performance: <PerformanceTab />,
    portfolio: <PortfolioTab />,
    lbo: <LBOTab />,
    gplp: <GPLPEconomicsTab />,
    debt: <DebtStructureTab />,
    sector: <SectorBenchmarksTab />,
    roleplay: <PERoleplayTab />,
  };

  const vcTabContent: Record<VCTabId, React.ReactNode> = {
    captable: <VCTab />,
    safe: <SAFENotesTab />,
    portfolioconstruction: <PortfolioConstructionTab />,
    termsheet: <TermSheetTab />,
    qualitative: <QualitativeTab />,
    marketsizing: <MarketSizingTab />,
    dealmemo: <DealMemoTab />,
    roleplay: <VCRoleplayTab />,
  };

  const quantTabContent: Record<QuantTabId, React.ReactNode> = {
    pricepaths: <PricePathsTab />,
    montecarlo: <MonteCarloTab />,
    options: <OptionsLabTab />,
    greeks: <GreeksTab />,
    impliedvol: <ImpliedVolTab />,
    frontier: <EfficientFrontierTab />,
    risk: <RiskTab />,
    fixedincome: <FixedIncomeTab />,
    backtest: <BacktestTab />,
    drills: <DrillsTab />,
    roleplay: <QuantRoleplayTab />,
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0c0d10" }}
    >
      <Header
        onGlossaryOpen={() => setGlossaryOpen(true)}
        onLeaderboard={() => setShowLeaderboard(true)}
        onChallenge={
          isFlagEnabled("clubChallenge")
            ? () => setShowChallenge(true)
            : undefined
        }
        onAssignment={
          isFlagEnabled("assignmentMode")
            ? () => setShowAssignmentBuilder(true)
            : undefined
        }
        userName={user.name}
        userPicture={user.picture}
        onLogout={onLogout}
      />

      <React.Suspense fallback={lazyFallback}>
        <AnimatePresence mode="wait">
          {activeSimulator === null && (
            <motion.div
              key="selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <Hero
                onStart={() => {
                  document
                    .getElementById("simulator-selector")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              />
              {isFlagEnabled("startHere") && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "0 1.5rem 1.25rem",
                  }}
                >
                  <button
                    onClick={() => setShowStartHere(true)}
                    style={{
                      background: "rgba(217, 190, 122,0.08)",
                      border: "1px solid rgba(217, 190, 122,0.3)",
                      borderRadius: 10,
                      color: "#d9be7a",
                      fontSize: 14,
                      fontWeight: 600,
                      padding: "10px 22px",
                      cursor: "pointer",
                    }}
                  >
                    New here? Start here →
                  </button>
                </div>
              )}
              <div id="simulator-selector">
                <SimulatorSelector onSelect={setActiveSimulator} />
              </div>
              <React.Suspense fallback={null}>
                <PathFlowMap
                  onSelectSimulator={setActiveSimulator}
                  onSelectPETab={(t) => setActivePETab(t as PETabId)}
                  onSelectVCTab={(t) => setActiveVCTab(t as VCTabId)}
                  onSelectIBView={(v) =>
                    setIbView(v as "simulator" | "compare" | "roleplay")
                  }
                />
              </React.Suspense>
            </motion.div>
          )}

          {activeSimulator === "ib" && (
            <motion.div
              key="ib"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {/* IB back bar */}
              <div
                className="px-6 py-2 flex items-center gap-3"
                style={{
                  background: "#141519",
                  borderBottom: "1px solid #2b2d34",
                }}
              >
                <button
                  onClick={() => setActiveSimulator(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
                  style={{
                    background: "transparent",
                    border: "1px solid #2b2d34",
                    color: "#7d808a",
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    color: "#e8913a",
                    border: "1px solid rgba(245,158,11,0.3)",
                    fontFamily: "monospace",
                  }}
                >
                  IB
                </span>
                <span className="text-xs" style={{ color: "#7d808a" }}>
                  Investment Banking · M&A Deal Simulator
                </span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  {(["simulator", "compare", "roleplay"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setIbView(v)}
                      style={{
                        background:
                          ibView === v
                            ? "rgba(245,158,11,0.15)"
                            : "transparent",
                        border: `1px solid ${ibView === v ? "rgba(245,158,11,0.4)" : "#2b2d34"}`,
                        borderRadius: 6,
                        padding: "3px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: ibView === v ? "#e8913a" : "#7d808a",
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {v === "roleplay"
                        ? "FinFox Role-Play"
                        : v === "compare"
                          ? "Compare Deals"
                          : "Simulator"}
                    </button>
                  ))}
                </div>
              </div>
              {ibView === "simulator" ? (
                <IBSimulator />
              ) : ibView === "compare" ? (
                <IBCompare />
              ) : (
                <IBRoleplayTab />
              )}
            </motion.div>
          )}

          {activeSimulator === "pe" && (
            <motion.div
              key="pe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1"
            >
              <GlobalInputs />
              <TabBar
                simulator="pe"
                active={activePETab}
                onChange={(t) => {
                  setActivePETab(t as PETabId);
                  captureEvent("pe_tab_changed", { tab: t as string });
                }}
                onBack={() => setActiveSimulator(null)}
              />
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePETab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <React.Suspense fallback={lazyFallback}>
                      {peTabContent[activePETab]}
                    </React.Suspense>
                  </motion.div>
                </AnimatePresence>
              </div>
              <Footer />
            </motion.div>
          )}

          {activeSimulator === "vc" && (
            <motion.div
              key="vc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1"
            >
              <TabBar
                simulator="vc"
                active={activeVCTab}
                onChange={(t) => {
                  setActiveVCTab(t as VCTabId);
                  captureEvent("vc_tab_changed", { tab: t as string });
                }}
                onBack={() => setActiveSimulator(null)}
              />
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeVCTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <React.Suspense fallback={lazyFallback}>
                      {vcTabContent[activeVCTab]}
                    </React.Suspense>
                  </motion.div>
                </AnimatePresence>
              </div>
              <Footer />
            </motion.div>
          )}

          {activeSimulator === "quant" && (
            <motion.div
              key="quant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1"
            >
              <TabBar
                simulator="quant"
                active={activeQuantTab}
                onChange={(t) => {
                  setActiveQuantTab(t as QuantTabId);
                  captureEvent("quant_tab_changed", { tab: t as string });
                }}
                onBack={() => setActiveSimulator(null)}
              />
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeQuantTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <React.Suspense fallback={lazyFallback}>
                      {quantTabContent[activeQuantTab]}
                    </React.Suspense>
                  </motion.div>
                </AnimatePresence>
              </div>
              <Footer />
            </motion.div>
          )}
        </AnimatePresence>
      </React.Suspense>

      <Glossary open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
      {shortcutsOpen && (
        <KeyboardShortcutsModal onClose={() => setShortcutsOpen(false)} />
      )}
      {showLeaderboard && (
        <React.Suspense fallback={null}>
          <LeaderboardPanel onClose={() => setShowLeaderboard(false)} />
        </React.Suspense>
      )}
      {isFlagEnabled("clubChallenge") && showChallenge && (
        <React.Suspense fallback={null}>
          <DealChallengeModal
            onClose={() => setShowChallenge(false)}
            onViewLeaderboard={() => setShowLeaderboard(true)}
          />
        </React.Suspense>
      )}
      {isFlagEnabled("assignmentMode") && showAssignmentBuilder && (
        <React.Suspense fallback={null}>
          <AssignmentBuilder onClose={() => setShowAssignmentBuilder(false)} />
        </React.Suspense>
      )}
      {showStartHere && (
        <React.Suspense fallback={null}>
          <StartHereMode
            onClose={() => {
              localStorage.setItem("startHere_seen", "1");
              setShowStartHere(false);
            }}
            onComplete={(sim, peTab, vcTab, ib, finfoxMsg) => {
              localStorage.setItem("startHere_seen", "1");
              setShowStartHere(false);
              // Queue finfox message before setting simulator so the useEffect
              // can pick it up on the same render cycle that commits the new tab.
              if (finfoxMsg) pendingFinfoxMsg.current = finfoxMsg;
              setActiveSimulator(sim);
              if (peTab) setActivePETab(peTab);
              if (vcTab) setActiveVCTab(vcTab);
              if (ib) setIbView(ib);
            }}
          />
        </React.Suspense>
      )}

      {/* FinFox chatbot */}
      <ChatPanel />
      <FinFoxMascot />

      {/* Onboarding tour — lazy-loaded, fires once per browser on the home screen */}
      {activeSimulator === null && !hash && (
        <React.Suspense fallback={null}>
          <OnboardingTour />
        </React.Suspense>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sharedLoaded, setSharedLoaded] = useState(() =>
    new URLSearchParams(window.location.search).has("model"),
  );
  const { resetProgress } = usePathProgress();

  useEffect(() => {
    const timeout = setTimeout(() => setAuthChecked(true), 5000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // onAuthStateChange fires immediately with the current session on mount,
    // so it serves as a single source of truth — no separate getSession() needed.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const mapped = mapSupabaseUser(session.user);
        setUser(mapped);
        identifyUser(mapped.id!, { name: mapped.name, email: mapped.email });
        safeStorageRemove("fundsim_auth");
      } else {
        // No Supabase session — check for a demo user in localStorage
        const stored = safeStorageGet("fundsim_auth");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (
              parsed &&
              typeof parsed.name === "string" &&
              typeof parsed.email === "string"
            ) {
              setUser(parsed);
            } else {
              // Malformed entry — discard it
              safeStorageRemove("fundsim_auth");
              setUser(null);
            }
          } catch {
            safeStorageRemove("fundsim_auth");
            setUser(null);
          }
        } else {
          // Only clear a Supabase-backed user; leave demo users untouched
          setUser((prev) => (prev?.id ? null : prev));
        }
      }
      // Mark auth check complete after the first event fires
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    if (user?.id) {
      await supabase.auth.signOut();
    }
    safeStorageRemove("fundsim_auth");
    setUser(null);
    resetUser();
    resetProgress();
  }

  function handleDemoLogin(u: AuthUser) {
    safeStorageSet("fundsim_auth", JSON.stringify(u));
    setUser(u);
  }

  // Pass the Supabase user id so useFundModelState can load/save — demo users have no id
  const model = useFundModelState(user?.id ?? null);
  const quantModel = useQuantModelState();

  if (!authChecked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0c0d10" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          style={{
            width: 32,
            height: 32,
            border: "2px solid #2b2d34",
            borderTopColor: "#c6a14b",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  // Status page is public — no login required so advisors and students can verify uptime
  if (window.location.hash.replace(/^#/, "") === "status") {
    return (
      <React.Suspense fallback={null}>
        <StatusPage />
      </React.Suspense>
    );
  }

  // Share/assignment view is public — students and instructors shouldn't need to log in
  // to view a shared deal or an assignment link.
  const shareId = new URLSearchParams(window.location.search).get("share");
  if (shareId) {
    return <ShareView id={shareId} />;
  }

  if (!user) {
    return <LoginPage onDemoLogin={handleDemoLogin} />;
  }

  return (
    <FinFoxProvider>
      <FundModelContext.Provider value={model}>
        <QuantModelContext.Provider value={quantModel}>
          <AppContent user={user} onLogout={handleLogout} />
          <Analytics />
        </QuantModelContext.Provider>
      </FundModelContext.Provider>
      <SharedScenarioBanner
        visible={sharedLoaded}
        onDismiss={() => setSharedLoaded(false)}
      />
    </FinFoxProvider>
  );
}

export default App;
