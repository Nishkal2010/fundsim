import React, { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { motion, AnimatePresence } from "framer-motion";
import { FundModelContext, useFundModelState } from "./hooks/useFundModel";
import { Header } from "./components/Header";
import { GlobalInputs } from "./components/GlobalInputs";
import { TabBar } from "./components/TabBar";
import type { PETabId, VCTabId } from "./components/TabBar";
import { Glossary } from "./components/Glossary";
import { Footer } from "./components/Footer";
import { LoginPage } from "./components/LoginPage";
import { SimulatorSelector } from "./components/SimulatorSelector";
import type { SimulatorId } from "./components/SimulatorSelector";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
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
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [hash, setHash] = useState(() => window.location.hash.replace("#", ""));

  useEffect(() => {
    const onHash = () => setHash(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const peTabOrder: PETabId[] = [
    "lifecycle",
    "jcurve",
    "waterfall",
    "performance",
  ];

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

  void peTabOrder;

  const lazyFallback = (
    <div
      className="flex-1 flex items-center justify-center"
      style={{ background: "#0D1220", minHeight: "60vh" }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          border: "2px solid #374151",
          borderTopColor: "#6366F1",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );

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
  };

  const vcTabContent: Record<VCTabId, React.ReactNode> = {
    captable: <VCTab />,
    safe: <SAFENotesTab />,
    portfolioconstruction: <PortfolioConstructionTab />,
    termsheet: <TermSheetTab />,
    qualitative: <QualitativeTab />,
    marketsizing: <MarketSizingTab />,
    dealmemo: <DealMemoTab />,
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0A0F1C" }}
    >
      <Header
        onGlossaryOpen={() => setGlossaryOpen(true)}
        userName={user.name}
        userPicture={user.picture}
        onLogout={onLogout}
      />

      <React.Suspense fallback={lazyFallback}>
        <AnimatePresence mode="wait">
          {activeSimulator === null && (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="flex-1"
            >
              <SimulatorSelector onSelect={setActiveSimulator} />
            </motion.div>
          )}

          {activeSimulator === "ib" && (
            <motion.div
              key="ib"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="flex-1 flex flex-col"
            >
              {/* IB back bar */}
              <div
                className="px-6 py-2 flex items-center gap-3"
                style={{
                  background: "#111827",
                  borderBottom: "1px solid #374151",
                }}
              >
                <button
                  onClick={() => setActiveSimulator(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
                  style={{
                    background: "transparent",
                    border: "1px solid #374151",
                    color: "#6B7280",
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    color: "#F59E0B",
                    border: "1px solid rgba(245,158,11,0.3)",
                    fontFamily: "monospace",
                  }}
                >
                  IB
                </span>
                <span className="text-xs" style={{ color: "#6B7280" }}>
                  Investment Banking · M&A Deal Simulator
                </span>
              </div>
              <IBSimulator />
            </motion.div>
          )}

          {activeSimulator === "pe" && (
            <motion.div
              key="pe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col flex-1"
            >
              <GlobalInputs />
              <TabBar
                simulator="pe"
                active={activePETab}
                onChange={(t) => setActivePETab(t as PETabId)}
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
                    {peTabContent[activePETab]}
                  </motion.div>
                </AnimatePresence>
              </div>
              <Footer />
            </motion.div>
          )}

          {activeSimulator === "vc" && (
            <motion.div
              key="vc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col flex-1"
            >
              <TabBar
                simulator="vc"
                active={activeVCTab}
                onChange={(t) => setActiveVCTab(t as VCTabId)}
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
                    {vcTabContent[activeVCTab]}
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
    </div>
  );
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // onAuthStateChange fires immediately with the current session on mount,
    // so it serves as a single source of truth — no separate getSession() needed.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        localStorage.removeItem("fundsim_auth");
      } else {
        // No Supabase session — check for a demo user in localStorage
        const stored = localStorage.getItem("fundsim_auth");
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
              localStorage.removeItem("fundsim_auth");
              setUser(null);
            }
          } catch {
            localStorage.removeItem("fundsim_auth");
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
    localStorage.removeItem("fundsim_auth");
    setUser(null);
  }

  function handleDemoLogin(u: AuthUser) {
    localStorage.setItem("fundsim_auth", JSON.stringify(u));
    setUser(u);
  }

  // Pass the Supabase user id so useFundModelState can load/save — demo users have no id
  const model = useFundModelState(user?.id ?? null);

  if (!authChecked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0A0F1C" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          style={{
            width: 32,
            height: 32,
            border: "2px solid #374151",
            borderTopColor: "#6366F1",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onDemoLogin={handleDemoLogin} />;
  }

  return (
    <FundModelContext.Provider value={model}>
      <AppContent user={user} onLogout={handleLogout} />
      <Analytics />
    </FundModelContext.Provider>
  );
}

export default App;
