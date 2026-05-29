import React from "react";
import {
  BookOpen,
  Columns2,
  LogOut,
  User,
  GraduationCap,
  Trophy,
  Target,
  Layers,
} from "lucide-react";
import { FundSimLogo } from "./FundSimLogo";
import { captureEvent } from "../lib/posthog";

interface HeaderProps {
  onGlossaryOpen: () => void;
  onLeaderboard?: () => void;
  onChallenge?: () => void;
  userName?: string;
  userPicture?: string;
  onLogout?: () => void;
}

export function Header({
  onGlossaryOpen,
  onLeaderboard,
  onChallenge,
  userName,
  userPicture,
  onLogout,
}: HeaderProps) {
  return (
    <header
      className="w-full px-6 py-4 flex items-center justify-between"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--bg-tertiary)",
        position: "sticky",
        top: 0,
        zIndex: "var(--z-header)" as React.CSSProperties["zIndex"],
      }}
    >
      <div className="flex items-center gap-3">
        <FundSimLogo size={28} />
        <div className="flex flex-col">
          <span
            className="font-serif leading-none tracking-tight"
            style={{ fontSize: "22px", color: "var(--text-primary)" }}
          >
            FundSim
          </span>
          <span
            className="text-xs mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            PE · VC · IB Simulator
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* DECA */}
        <button
          className="btn-nav"
          onClick={() => {
            window.location.hash = "deca";
          }}
        >
          <GraduationCap size={14} aria-hidden="true" />
          DECA
        </button>

        {/* YIS */}
        <button
          className="btn-nav"
          onClick={() => {
            window.location.hash = "yis";
          }}
        >
          <Trophy size={14} aria-hidden="true" />
          YIS
        </button>

        {/* Leaderboard */}
        {onLeaderboard && (
          <button
            className="btn-nav"
            onClick={() => {
              captureEvent("leaderboard_nav_clicked");
              onLeaderboard();
            }}
            style={{
              color: "var(--accent-amber)",
              borderColor: "rgba(245,158,11,0.3)",
            }}
            title="Weekly Leaderboard"
          >
            <Trophy size={14} aria-hidden="true" />
            Leaderboard
          </button>
        )}

        {/* Deal Challenge */}
        {onChallenge && (
          <button
            className="btn-nav"
            onClick={() => {
              captureEvent("challenge_nav_clicked");
              onChallenge();
            }}
            style={{
              color: "var(--accent-indigo-light)",
              borderColor: "rgba(99,102,241,0.3)",
            }}
            title="Weekly Deal Challenge"
          >
            <Target size={14} aria-hidden="true" />
            Challenge
          </button>
        )}

        {/* Glossary */}
        <button className="btn-nav" onClick={onGlossaryOpen}>
          <BookOpen size={14} />
          Glossary
        </button>

        {/* Compare */}
        <button
          className="btn-nav"
          onClick={() => {
            window.location.hash = "compare";
          }}
        >
          <Columns2 size={14} />
          Compare
        </button>

        {/* Scenarios — Bull / Base / Bear */}
        <button
          className="btn-nav"
          onClick={() => {
            window.location.hash = "scenarios";
          }}
          title="Run Bull / Base / Bear scenarios on a single base case"
        >
          <Layers size={14} />
          Scenarios
        </button>

        {/* User section */}
        {userName && (
          <div
            className="flex items-center gap-2 pl-3"
            style={{ borderLeft: "1px solid var(--bg-tertiary)" }}
          >
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
              }}
            >
              {userPicture && userPicture.startsWith("https://") ? (
                <img
                  src={userPicture}
                  alt={userName}
                  className="w-6 h-6 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "var(--border)" }}
                >
                  <User size={12} color="rgba(255,255,255,0.5)" />
                </div>
              )}
              <span
                title={userName}
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
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
              aria-label="Sign out"
              title="Sign out"
              className="btn-nav"
              style={{ padding: "6px", background: "none", border: "none" }}
            >
              <LogOut size={15} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
