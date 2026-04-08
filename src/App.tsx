import React, { useState, useEffect } from "react";
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

interface AuthUser {
  name: string;
  email: string;
  picture?: string;
}

function AppContent() {
  const [showHero, setShowHero] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("lifecycle");
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [hash, setHash] = useState(() => window.location.hash.replace("#", ""));

  useEffect(() => {
    const onHash = () => setHash(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // On load: check if already logged in via JWT cookie (Google OAuth) or fallback to localStorage (demo mode)
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser({
            name: data.user.name,
            email: data.user.email,
            picture: data.user.picture,
          });
        } else {
          // Fallback: check localStorage for demo/email users
          const stored = localStorage.getItem("fundsim_auth");
          if (stored) {
            try {
              setUser(JSON.parse(stored));
            } catch {
              localStorage.removeItem("fundsim_auth");
            }
          }
        }
      })
      .catch(() => {
        // Server not running — check localStorage
        const stored = localStorage.getItem("fundsim_auth");
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            localStorage.removeItem("fundsim_auth");
          }
        }
      })
      .finally(() => setAuthChecked(true));
  }, []);

  function handleLogin(u: AuthUser) {
    localStorage.setItem("fundsim_auth", JSON.stringify(u));
    setUser(u);
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Server not reachable, that's ok
    }
    localStorage.removeItem("fundsim_auth");
    setUser(null);
  }

  // Spinner while checking auth
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
    return <LoginPage onLogin={handleLogin} />;
  }

  // DECA route
  if (hash === "deca") {
    return <DECAFinanceSuite />;
  }

  const tabContent: Record<TabId, React.ReactNode> = {
    lifecycle: <FundLifecycleTab />,
    jcurve: <JCurveTab />,
    waterfall: <WaterfallTab />,
    performance: <PerformanceTab />,
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
        onLogout={handleLogout}
      />

      {/* DECA Finance Suite button */}
      <div className="px-6 pt-3 flex justify-end">
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
  const model = useFundModelState();
  return (
    <FundModelContext.Provider value={model}>
      <AppContent />
    </FundModelContext.Provider>
  );
}

export default App;
