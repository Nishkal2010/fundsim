import React, { useRef, useState } from "react";
import {
  BookOpen,
  Columns2,
  ExternalLink,
  LogOut,
  User,
  GraduationCap,
  Trophy,
  ChevronDown,
  Eye,
  EyeOff,
  Bot,
  RotateCcw,
} from "lucide-react";
import { useFinFox } from "../hooks/useFinFox";

interface HeaderProps {
  onGlossaryOpen: () => void;
  userName?: string;
  userPicture?: string;
  onLogout?: () => void;
}

const btnBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  border: "1px solid #374151",
  background: "#1F2937",
  color: "rgba(255,255,255,0.6)",
  transition: "color 0.15s ease",
};

export function Header({
  onGlossaryOpen,
  userName,
  userPicture,
  onLogout,
}: HeaderProps) {
  const [finfoxMenuOpen, setFinfoxMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { disabled, toggleDisabled, resetOnboarding, resetTour, startTour } =
    useFinFox();

  // Close menu when clicking outside
  React.useEffect(() => {
    if (!finfoxMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setFinfoxMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [finfoxMenuOpen]);

  return (
    <header
      className="w-full px-6 py-4 flex items-center justify-between"
      style={{
        background: "#111827",
        borderBottom: "1px solid #1F2937",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Logo mark */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0 }}
        >
          <rect width="32" height="32" rx="7" fill="#0D1220" />
          <rect x="7" y="19" width="4" height="7" rx="1" fill="#6366F1" />
          <rect x="14" y="13" width="4" height="13" rx="1" fill="#818CF8" />
          <rect x="21" y="7" width="4" height="19" rx="1" fill="#A5B4FC" />
        </svg>
        <div className="flex flex-col">
          <span
            className="font-serif leading-none tracking-tight"
            style={{ fontSize: "22px", color: "#F9FAFB" }}
          >
            FundSim
          </span>
          <span
            className="text-xs mt-0.5"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            PE · VC · IB Simulator
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* DECA */}
        <button
          onClick={() => {
            window.location.hash = "deca";
          }}
          style={{
            ...btnBase,
            fontSize: "12px",
            padding: "5px 10px",
          }}
        >
          <GraduationCap size={13} />
          DECA
        </button>

        {/* YIS */}
        <button
          onClick={() => {
            window.location.hash = "yis";
          }}
          style={{
            ...btnBase,
            fontSize: "12px",
            padding: "5px 10px",
          }}
        >
          <Trophy size={13} />
          YIS
        </button>

        {/* FinFox dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setFinfoxMenuOpen((v) => !v)}
            style={{
              ...btnBase,
              fontSize: "12px",
              padding: "5px 10px",
              color: disabled ? "rgba(255,255,255,0.35)" : "#10B981",
              borderColor: disabled ? "#374151" : "#374151",
            }}
          >
            {disabled ? <EyeOff size={13} /> : <Eye size={13} />}
            FinFox
            <ChevronDown
              size={11}
              style={{
                opacity: 0.5,
                transform: finfoxMenuOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.15s ease",
              }}
            />
          </button>

          {finfoxMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "#111827",
                border: "1px solid #1F2937",
                borderRadius: 8,
                minWidth: 160,
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => {
                  toggleDisabled();
                  setFinfoxMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "9px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  textAlign: "left",
                }}
              >
                {disabled ? <Eye size={13} /> : <EyeOff size={13} />}
                {disabled ? "Show FinFox" : "Hide FinFox"}
              </button>
              <div style={{ height: 1, background: "#1F2937" }} />
              <button
                onClick={() => {
                  resetOnboarding();
                  setFinfoxMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "9px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  textAlign: "left",
                }}
              >
                <Bot size={13} />
                Replay intro
              </button>
              <div style={{ height: 1, background: "#1F2937" }} />
              <button
                onClick={() => {
                  resetTour();
                  startTour();
                  setFinfoxMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "9px 14px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  textAlign: "left",
                }}
              >
                <RotateCcw size={13} />
                Replay VC tour
              </button>
            </div>
          )}
        </div>

        {/* Glossary */}
        <button onClick={onGlossaryOpen} style={btnBase}>
          <BookOpen size={14} />
          Glossary
        </button>

        {/* Compare */}
        <button
          onClick={() => {
            window.location.hash = "#compare";
          }}
          style={btnBase}
        >
          <Columns2 size={14} />
          Compare
        </button>

        {/* GitHub */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          style={{
            ...btnBase,
            textDecoration: "none",
          }}
        >
          <ExternalLink size={14} />
          GitHub
        </a>

        {/* User section */}
        {userName && (
          <div
            className="flex items-center gap-2 pl-3"
            style={{ borderLeft: "1px solid #1F2937" }}
          >
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: "#1F2937",
                border: "1px solid #374151",
              }}
            >
              {userPicture ? (
                <img
                  src={userPicture}
                  alt={userName}
                  className="w-6 h-6 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "#374151" }}
                >
                  <User size={12} color="rgba(255,255,255,0.5)" />
                </div>
              )}
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.6)",
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Sign out"
              style={{
                background: "none",
                border: "none",
                borderRadius: "8px",
                padding: "6px",
                cursor: "pointer",
                color: "rgba(255,255,255,0.35)",
                transition: "color 0.15s ease",
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
