import React, { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { motion, AnimatePresence } from "framer-motion";
import { FundModelContext, useFundModelState } from "./hooks/useFundModel";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { GlobalInputs } from "./components/GlobalInputs";
import { TabBar } from "./components/TabBar";
import type { TabId } from "./components/TabBar";
import { Glossary } from "./components/Glossary";
import { Footer } from "./components/Footer";
import { LoginPage } from "./components/LoginPage";
import { FundLifecycleTab } from "./components/FundLifecycle/FundLifecycleTab";
import { JCurveTab } from "./components/JCurve/JCurveTab";
import { WaterfallTab } from "./components/Waterfall/WaterfallTab";
import { PerformanceTab } from "./components/Performance/PerformanceTab";
import { DECAFinanceSuite } from "./components/DECA/DECAFinanceSuite";
import { YISFinanceSuite } from "./components/YIS/YISFinanceSuite";
import { IBSimulator } from "./components/IB/IBSimulator";
import { ComparePage } from "./components/ComparePage";
import { PortfolioTab } from "./components/Portfolio/PortfolioTab";
import { LBOTab } from "./components/LBO/LBOTab";
import { VCTab } from "./components/VC/VCTab";
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
  const [showHero, setShowHero] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("lifecycle");
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [hash, setHash] = useState(() => window.location.hash.replace("#", ""));

  useEffect(() => {
    const onHash = () => setHash(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (hash === "compare") {
    return <ComparePage />;
  }

  if (hash === "deca") {
    return <DECAFinanceSuite />;
  }

  if (hash === "yis") {
    return <YISFinanceSuite />;
  }

  if (hash === "ib") {
    return <IBSimulator />;
  }

  const tabContent: Record<TabId, React.ReactNode> = {
    lifecycle: <FundLifecycleTab />,
    jcurve: <JCurveTab />,
    waterfall: <WaterfallTab />,
    performance: <PerformanceTab />,
    portfolio: <PortfolioTab />,
    lbo: <LBOTab />,
    vc: <VCTab />,
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

      {/* Suite buttons */}
      <div className="px-6 pt-3 flex justify-end gap-2">
        <button
          onClick={() => {
            window.location.hash = "ib";
          }}
          style={{
            background:
              "linear-gradient(135deg, rgba(180,83,9,0.15), rgba(245,158,11,0.1))",
            border: "1px solid rgba(245,158,11,0.4)",
            color: "#F59E0B",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.05em",
            fontFamily: "monospace",
          }}
        >
          ◆ IB Sim
        </button>
        <button
          onClick={() => {
            window.location.hash = "yis";
          }}
          style={{
            background:
              "linear-gradient(135deg, rgba(22,163,74,0.15), rgba(34,197,94,0.1))",
            border: "1px solid rgba(34,197,94,0.4)",
            color: "#4ADE80",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.05em",
            fontFamily: "monospace",
          }}
        >
          ◆ YIS Suite
        </button>
        <button
          onClick={() => {
            window.location.hash = "deca";
          }}
          style={{
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(212,175,55,0.1))",
            border: "1px solid rgba(37,99,235,0.4)",
            color: "#60a5fa",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.05em",
            fontFamily: "monospace",
          }}
        >
          ◆ DECA Finance Suite
        </button>
      </div>

      <AnimatePresence>
        {showHero && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Hero onStart={() => setShowHero(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {!showHero && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col flex-1"
        >
          <GlobalInputs />
          <TabBar active={activeTab} onChange={setActiveTab} />
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
          <Footer />
        </motion.div>
      )}

      <Glossary open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
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
