import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Target, Heart } from "lucide-react";
import { captureEvent } from "../../lib/posthog";
import { buildChallengeUrl } from "../../lib/dealShare";
import { WEEKLY_SCENARIO } from "./weeklyScenario";

type Phase = "intro" | "playing" | "eliminated" | "complete";

const TOTAL_SECONDS = 600; // 10:00
const MAX_STRIKES = 3;

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function InputsTable({ inputs }: { inputs: Record<string, number> }) {
  const labels: Record<string, string> = {
    ebitdaM: "EBITDA",
    entryMultiple: "Entry Multiple",
    debtMultiple: "Debt Multiple",
    exitMultiple: "Exit Multiple",
    holdYears: "Hold Period",
    ebitdaGrowthPct: "EBITDA Growth",
    interestRatePct: "Interest Rate",
    taxRatePct: "Tax Rate",
    capexPctEbitda: "Capex % EBITDA",
  };
  const units: Record<string, string> = {
    ebitdaM: "$M",
    entryMultiple: "x",
    debtMultiple: "x",
    exitMultiple: "x",
    holdYears: "yrs",
    ebitdaGrowthPct: "%",
    interestRatePct: "%",
    taxRatePct: "%",
    capexPctEbitda: "%",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2px",
        background: "#1E293B",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #1E293B",
      }}
    >
      {Object.entries(inputs).map(([key, val]) => (
        <div
          key={key}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "7px 12px",
            background: "#0F172A",
            margin: "1px",
            borderRadius: 4,
          }}
        >
          <span style={{ color: "#9CA3AF", fontSize: 12 }}>
            {labels[key] ?? key}
          </span>
          <span
            style={{
              color: "#E2E8F0",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "monospace",
            }}
          >
            {val}
            {units[key] ? ` ${units[key]}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DealChallengeModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [answer, setAnswer] = useState("");
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const eliminate = useCallback(
    (reason: "strikes" | "timeout") => {
      stopTimer();
      setPhase("eliminated");
      captureEvent("challenge_eliminated", {
        score,
        reason,
      });
    },
    [score, stopTimer],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          eliminate("timeout");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function startChallenge() {
    setPhase("playing");
    captureEvent("challenge_started");
  }

  function submitAnswer() {
    const userNum = parseFloat(answer.replace(/[^0-9.\-]/g, ""));
    if (isNaN(userNum)) return;

    const q = WEEKLY_SCENARIO.questions[qIndex];
    const isCorrect =
      Math.abs(userNum - q.answer) / Math.abs(q.answer) <= q.tolerance;

    if (isCorrect) {
      setFlash("correct");
      const newScore = score + 1;
      setScore(newScore);
      setTimeout(() => {
        setFlash(null);
        setHintVisible(false);
        setAnswer("");
        const nextIndex = qIndex + 1;
        if (nextIndex >= WEEKLY_SCENARIO.questions.length) {
          stopTimer();
          setPhase("complete");
          captureEvent("challenge_completed", {
            score: newScore,
            timeRemainingS: timeLeft,
          });
        } else {
          setQIndex(nextIndex);
        }
      }, 600);
    } else {
      setFlash("wrong");
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setTimeout(() => {
        setFlash(null);
        if (newStrikes >= MAX_STRIKES) {
          eliminate("strikes");
        }
      }, 600);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submitAnswer();
  }

  const question = WEEKLY_SCENARIO.questions[qIndex];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#0F172A",
          border: "1px solid #1E293B",
          borderRadius: 12,
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #1E293B",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Target size={18} color="#6366F1" />
            <span style={{ color: "#F9FAFB", fontWeight: 600, fontSize: 16 }}>
              Deal Challenge
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 4,
                background: "rgba(99,102,241,0.15)",
                color: "#818CF8",
                border: "1px solid rgba(99,102,241,0.3)",
                fontFamily: "monospace",
              }}
            >
              {WEEKLY_SCENARIO.weekId}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B7280",
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* INTRO */}
          {phase === "intro" && (
            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div>
                <h2
                  style={{
                    color: "#F9FAFB",
                    fontWeight: 700,
                    fontSize: 20,
                    margin: 0,
                  }}
                >
                  {WEEKLY_SCENARIO.title}
                </h2>
                <p
                  style={{
                    color: "#94A3B8",
                    fontSize: 14,
                    marginTop: 8,
                    lineHeight: 1.6,
                  }}
                >
                  {WEEKLY_SCENARIO.description}
                </p>
              </div>

              <InputsTable inputs={WEEKLY_SCENARIO.inputs} />

              <div
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  color: "#94A3B8",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: "#818CF8" }}>Rules:</strong> 5
                questions, 10 minutes, 3 strikes. Wrong answers cost a heart.
                Run out of hearts or time and you're eliminated. Get all 5 right
                to win.
              </div>

              <button
                onClick={startChallenge}
                style={{
                  padding: "12px 24px",
                  borderRadius: 8,
                  background: "rgba(99,102,241,0.8)",
                  border: "1px solid rgba(99,102,241,0.5)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Start Challenge
              </button>
            </div>
          )}

          {/* PLAYING */}
          {phase === "playing" && question && (
            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Top bar: timer + strikes */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 22,
                    fontWeight: 700,
                    color: timeLeft < 120 ? "#EF4444" : "#F9FAFB",
                  }}
                >
                  {formatTime(timeLeft)}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  {Array.from({ length: MAX_STRIKES }).map((_, i) => (
                    <Heart
                      key={i}
                      size={20}
                      color={i < MAX_STRIKES - strikes ? "#EF4444" : "#374151"}
                      fill={i < MAX_STRIKES - strikes ? "#EF4444" : "none"}
                    />
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div style={{ display: "flex", gap: 4 }}>
                {WEEKLY_SCENARIO.questions.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      background:
                        i < score
                          ? "#10B981"
                          : i === qIndex
                            ? "#6366F1"
                            : "#1E293B",
                    }}
                  />
                ))}
              </div>

              {/* Question */}
              <div
                style={{
                  background:
                    flash === "correct"
                      ? "rgba(16,185,129,0.12)"
                      : flash === "wrong"
                        ? "rgba(239,68,68,0.12)"
                        : "#1E293B",
                  border: `1px solid ${
                    flash === "correct"
                      ? "rgba(16,185,129,0.4)"
                      : flash === "wrong"
                        ? "rgba(239,68,68,0.4)"
                        : "#334155"
                  }`,
                  borderRadius: 10,
                  padding: "20px",
                  transition: "background 0.2s, border-color 0.2s",
                }}
              >
                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: 11,
                    fontWeight: 600,
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Question {qIndex + 1} of {WEEKLY_SCENARIO.questions.length}
                </div>
                <p
                  style={{
                    color: "#F1F5F9",
                    fontSize: 16,
                    fontWeight: 500,
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {question.question}
                </p>
                {hintVisible && (
                  <p
                    style={{
                      color: "#818CF8",
                      fontSize: 13,
                      marginTop: 10,
                      marginBottom: 0,
                      fontStyle: "italic",
                    }}
                  >
                    Hint: {question.hint}
                  </p>
                )}
              </div>

              {/* Answer input */}
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Your answer (${question.unit})`}
                    disabled={flash !== null}
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#F1F5F9",
                      fontSize: 15,
                      fontFamily: "monospace",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <button
                  onClick={submitAnswer}
                  disabled={flash !== null || !answer}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    background: "rgba(99,102,241,0.8)",
                    border: "1px solid rgba(99,102,241,0.5)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: flash !== null || !answer ? 0.5 : 1,
                  }}
                >
                  Submit
                </button>
              </div>

              {!hintVisible && (
                <button
                  onClick={() => setHintVisible(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6366F1",
                    fontSize: 13,
                    cursor: "pointer",
                    textAlign: "left",
                    padding: 0,
                  }}
                >
                  Show hint
                </button>
              )}
            </div>
          )}

          {/* ELIMINATED */}
          {phase === "eliminated" && (
            <div
              style={{
                padding: 32,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48 }}>💀</div>
              <h2
                style={{
                  color: "#EF4444",
                  fontWeight: 700,
                  fontSize: 22,
                  margin: 0,
                }}
              >
                Eliminated
              </h2>
              <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>
                You answered{" "}
                <strong style={{ color: "#F9FAFB" }}>{score}</strong> of{" "}
                {WEEKLY_SCENARIO.questions.length} correctly with{" "}
                <strong style={{ color: "#F9FAFB" }}>{strikes}</strong> strike
                {strikes !== 1 ? "s" : ""}.
              </p>
              <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>
                Try again next week when a new scenario drops.
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: 8,
                  padding: "10px 24px",
                  borderRadius: 8,
                  background: "#1E293B",
                  border: "1px solid #334155",
                  color: "#94A3B8",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          )}

          {/* COMPLETE */}
          {phase === "complete" && (
            <div
              style={{
                padding: 32,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 18,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 52 }}>🎉</div>
              <h2
                style={{
                  color: "#10B981",
                  fontWeight: 700,
                  fontSize: 22,
                  margin: 0,
                }}
              >
                Challenge Complete!
              </h2>
              <div style={{ display: "flex", gap: 24 }}>
                <div>
                  <div
                    style={{
                      color: "#F9FAFB",
                      fontWeight: 700,
                      fontSize: 28,
                      fontFamily: "monospace",
                    }}
                  >
                    {score}/{WEEKLY_SCENARIO.questions.length}
                  </div>
                  <div style={{ color: "#6B7280", fontSize: 12 }}>Score</div>
                </div>
                <div>
                  <div
                    style={{
                      color: "#10B981",
                      fontWeight: 700,
                      fontSize: 28,
                      fontFamily: "monospace",
                    }}
                  >
                    {formatTime(timeLeft)}
                  </div>
                  <div style={{ color: "#6B7280", fontSize: 12 }}>
                    Time Left
                  </div>
                </div>
              </div>

              <div style={{ width: "100%", textAlign: "left" }}>
                <label
                  style={{
                    color: "#94A3B8",
                    fontSize: 12,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Share your result
                </label>
                <textarea
                  readOnly
                  rows={3}
                  value={`I just crushed the FundSim Deal Challenge (${WEEKLY_SCENARIO.weekId})!\n${score}/${WEEKLY_SCENARIO.questions.length} correct with ${formatTime(timeLeft)} left on the clock.\n\nTest your LBO skills: fundsimulate.com`}
                  style={{
                    width: "100%",
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    color: "#E2E8F0",
                    fontSize: 13,
                    padding: "10px 12px",
                    resize: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ width: "100%", textAlign: "left" }}>
                <label
                  style={{
                    color: "#94A3B8",
                    fontSize: 12,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Challenge a friend
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    readOnly
                    value={buildChallengeUrl()}
                    style={{
                      flex: 1,
                      background: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#E2E8F0",
                      fontSize: 13,
                      padding: "10px 12px",
                      fontFamily: "monospace",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(buildChallengeUrl());
                      captureEvent("challenge_invite_shared", {});
                    }}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 8,
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.35)",
                      color: "#818CF8",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Copy link
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    onClose();
                    window.location.hash = "leaderboard";
                  }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    background: "rgba(245,158,11,0.15)",
                    border: "1px solid rgba(245,158,11,0.35)",
                    color: "#F59E0B",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  View Leaderboard
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    background: "#1E293B",
                    border: "1px solid #334155",
                    color: "#94A3B8",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
