import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Target, Heart, Copy, Check } from "lucide-react";

function IconX() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
import { captureEvent } from "../../lib/posthog";
import {
  buildChallengeUrl,
  buildShareUrl,
  saveDealShare,
} from "../../lib/dealShare";
import { getActiveScenario, type ChallengeQuestion } from "./weeklyScenario";

type Phase = "onboarding" | "intro" | "playing" | "eliminated" | "complete";

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

/** One-time onboarding screen: explains the LBO chain with a concrete labeled example. */
function OnboardingScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6366F1",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 6,
          }}
        >
          START HERE — 1 min read
        </div>
        <h2
          style={{
            color: "#F9FAFB",
            fontWeight: 700,
            fontSize: 18,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          What is an LBO and what are you about to calculate?
        </h2>
      </div>

      <p
        style={{ color: "#94A3B8", fontSize: 13, margin: 0, lineHeight: 1.65 }}
      >
        An <strong style={{ color: "#E2E8F0" }}>LBO (Leveraged Buyout)</strong>{" "}
        is how a PE firm buys a company: they use mostly borrowed money (debt)
        and a smaller equity check, then grow the business and sell it later —
        aiming to get back far more than they put in.
      </p>

      {/* Walkthrough of the chain */}
      <div
        style={{
          background: "#0F172A",
          border: "1px solid #1E293B",
          borderRadius: 10,
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            color: "#818CF8",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          The 4-step chain you&apos;ll trace in this challenge
        </div>

        {[
          {
            step: "1",
            label: "Entry Price (Enterprise Value)",
            formula: "EBITDA × entry multiple",
            example: "e.g. $45M × 8x = $360M",
            color: "#818CF8",
            note: "EBITDA = annual profit before interest, taxes, and non-cash charges. The multiple is what the market pays per dollar of that profit.",
          },
          {
            step: "2",
            label: "Equity Check",
            formula: "Entry EV − debt borrowed",
            example: "e.g. $360M − $247.5M = $112.5M",
            color: "#34D399",
            note: "The PE firm only writes a check for the part that isn't covered by debt. Smaller equity check = bigger potential return.",
          },
          {
            step: "3",
            label: "Exit Value",
            formula: "Exit EBITDA × exit multiple",
            example: "e.g. $66M × 7.5x = $495M",
            color: "#F59E0B",
            note: "EBITDA grows during the hold. Multiply that larger number by the exit multiple to get what you sell the company for.",
          },
          {
            step: "4",
            label: "MOIC (Return)",
            formula: "(Exit EV − remaining debt) ÷ equity check",
            example: "e.g. ($495M − $247M) ÷ $112M ≈ 2.2x",
            color: "#F87171",
            note: "MOIC = Multiple on Invested Capital. 2x means you doubled your money. 3x+ is a strong return.",
          },
        ].map((item) => (
          <div
            key={item.step}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                minWidth: 22,
                height: 22,
                borderRadius: "50%",
                background: `${item.color}22`,
                border: `1px solid ${item.color}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: item.color,
                fontFamily: "monospace",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {item.step}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#F1F5F9", fontSize: 13, fontWeight: 600 }}>
                {item.label}
              </div>
              <div
                style={{
                  color: item.color,
                  fontSize: 12,
                  fontFamily: "monospace",
                  marginTop: 2,
                }}
              >
                {item.formula}
              </div>
              <div style={{ color: "#6B7280", fontSize: 11, marginTop: 1 }}>
                {item.example}
              </div>
              <div
                style={{
                  color: "#94A3B8",
                  fontSize: 11,
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {item.note}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "rgba(99,102,241,0.07)",
          border: "1px solid rgba(99,102,241,0.18)",
          borderRadius: 8,
          padding: "10px 14px",
          color: "#94A3B8",
          fontSize: 12,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "#818CF8" }}>
          What to watch when you drag a number:
        </strong>{" "}
        higher debt multiple = smaller equity check = bigger MOIC if it works
        out (but more risk). Higher exit multiple = bigger exit EV = better
        return.
      </div>

      <button
        onClick={onContinue}
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
        Got it — show me the deal
      </button>
    </div>
  );
}

function EliminatedAnswerReveal({
  question,
  questionNumber,
}: {
  question: ChallengeQuestion;
  questionNumber: number;
}) {
  return (
    <div
      style={{
        width: "100%",
        background: "rgba(239,68,68,0.07)",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: 10,
        padding: "16px 18px",
        textAlign: "left",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#EF4444",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 6,
        }}
      >
        Question {questionNumber} — where you got stuck
      </div>
      <p
        style={{
          color: "#F1F5F9",
          fontSize: 13,
          margin: "0 0 8px",
          fontWeight: 500,
        }}
      >
        {question.question}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span style={{ color: "#6B7280", fontSize: 12 }}>Correct answer:</span>
        <span
          style={{
            color: "#34D399",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "monospace",
          }}
        >
          {question.answer} {question.unit}
        </span>
      </div>
      <p
        style={{
          color: "#94A3B8",
          fontSize: 12,
          margin: "0 0 4px",
          lineHeight: 1.55,
        }}
      >
        {question.explanation}
      </p>
      <p
        style={{
          color: "#818CF8",
          fontSize: 12,
          margin: 0,
          fontStyle: "italic",
        }}
      >
        Formula: {question.hint}
      </p>
    </div>
  );
}

export function DealChallengeModal({
  onClose,
  onViewLeaderboard,
}: {
  onClose: () => void;
  onViewLeaderboard?: () => void;
}) {
  // Use the active scenario (admin-pinnable via localStorage).
  const scenario = getActiveScenario();

  const [phase, setPhase] = useState<Phase>(() => {
    // Skip onboarding if the user has seen it before.
    const seen = localStorage.getItem("fundsim_challenge_onboarding_seen");
    return seen ? "intro" : "onboarding";
  });
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [answer, setAnswer] = useState("");
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  // Track which question index caused elimination so we can show the answer.
  const [eliminatedAtIndex, setEliminatedAtIndex] = useState<number | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eliminatedRef = useRef(false);
  const shareIdRef = useRef<string | null>(null);
  const scoreRef = useRef(0);
  const inviteInputRef = useRef<HTMLInputElement>(null);

  // Read club tag from URL on mount — members arrive via /?challenge=1&club=UTAFC.
  // Store it so ensureShareId can attach it to the submission.
  const _rawClub = new URLSearchParams(window.location.search).get("club");
  const _initialClubTag: string | undefined = _rawClub
    ? _rawClub.slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, "") || undefined
    : undefined;
  const clubTagRef = useRef<string | undefined>(_initialClubTag);

  // Strip the deep-link trigger from the URL on mount so a refresh or a
  // friend who opened a /?challenge=1 invite doesn't get the modal wedged
  // open forever.
  useEffect(() => {
    const url = new URL(window.location.href);
    const hadParam = url.searchParams.has("challenge");
    const hadHash = url.hash === "#challenge";
    if (hadParam || hadHash) {
      url.searchParams.delete("challenge");
      url.searchParams.delete("club");
      if (hadHash) url.hash = "";
      window.history.replaceState(
        null,
        "",
        url.pathname + url.search + url.hash,
      );
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const ensureShareId = useCallback(
    async (
      finalScore: number,
      finalTimeLeft: number,
    ): Promise<string | null> => {
      if (shareIdRef.current) return shareIdRef.current;
      setShareLoading(true);
      try {
        const id = await saveDealShare({
          simulator: "pe",
          tab: "challenge",
          clubTag: clubTagRef.current,
          inputs: {
            weekId: scenario.weekId,
            score: finalScore,
            totalQ: scenario.questions.length,
            timeLeftS: finalTimeLeft,
          },
          summary: {
            title: scenario.title,
            subtitle: `Deal Challenge ${scenario.weekId}`,
            metrics: [
              {
                label: "Score",
                value: `${finalScore}/${scenario.questions.length}`,
                highlight: true,
              },
              { label: "Time Left", value: formatTime(finalTimeLeft) },
            ],
          },
        });
        shareIdRef.current = id;
        return id;
      } catch {
        return null;
      } finally {
        setShareLoading(false);
      }
    },
    [scenario],
  );

  const eliminate = useCallback(
    (reason: "strikes" | "timeout", atIndex: number) => {
      if (eliminatedRef.current) return;
      eliminatedRef.current = true;
      stopTimer();
      setEliminatedAtIndex(atIndex);
      setPhase("eliminated");
      captureEvent("challenge_eliminated", {
        score: scoreRef.current,
        reason,
      });
    },
    [stopTimer],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          eliminate("timeout", qIndex);
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
    const userNum = parseFloat(answer.replace(/[^0-9.-]/g, ""));
    if (isNaN(userNum)) return;

    const q = scenario.questions[qIndex];
    const isCorrect =
      q.answer === 0
        ? Math.abs(userNum) <= q.tolerance
        : Math.abs(userNum - q.answer) / Math.abs(q.answer) <= q.tolerance;

    if (isCorrect) {
      setFlash("correct");
      const newScore = score + 1;
      scoreRef.current = newScore;
      setScore(newScore);
      const isFinal = qIndex + 1 >= scenario.questions.length;
      // Stop the clock synchronously on the winning answer so the timer can't
      // fire eliminate("timeout") during the 600ms flash and race the
      // complete transition.
      if (isFinal) stopTimer();
      setTimeout(() => {
        setFlash(null);
        setHintVisible(false);
        setAnswer("");
        const nextIndex = qIndex + 1;
        if (nextIndex >= scenario.questions.length) {
          if (eliminatedRef.current) return;
          setPhase("complete");
          captureEvent("challenge_completed", {
            score: newScore,
            timeRemainingS: timeLeft,
          });
          // Persist the result immediately so the leaderboard reflects this
          // run even if the player never clicks a Share button.
          void ensureShareId(newScore, timeLeft);
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
          eliminate("strikes", qIndex);
        }
      }, 600);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submitAnswer();
  }

  // Guard the exit only while actively playing.
  function requestClose() {
    if (phase === "playing") {
      if (
        !window.confirm(
          "Quit the challenge? Your progress this run will be lost.",
        )
      )
        return;
      stopTimer();
    }
    onClose();
  }

  const question = scenario.questions[qIndex];

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
        if (e.target === e.currentTarget) requestClose();
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
              {scenario.weekId}
            </span>
            {clubTagRef.current && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "rgba(52,211,153,0.12)",
                  color: "#34D399",
                  border: "1px solid rgba(52,211,153,0.25)",
                  fontFamily: "monospace",
                }}
              >
                {clubTagRef.current}
              </span>
            )}
          </div>
          <button
            onClick={requestClose}
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
          {/* ONBOARDING — first-time only */}
          {phase === "onboarding" && (
            <OnboardingScreen
              onContinue={() => {
                localStorage.setItem("fundsim_challenge_onboarding_seen", "1");
                setPhase("intro");
              }}
            />
          )}

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
                  {scenario.title}
                </h2>
                <p
                  style={{
                    color: "#94A3B8",
                    fontSize: 14,
                    marginTop: 8,
                    lineHeight: 1.6,
                  }}
                >
                  {scenario.description}
                </p>
                {scenario.teachingPoint && (
                  <p
                    style={{
                      color: "#818CF8",
                      fontSize: 13,
                      marginTop: 6,
                      fontStyle: "italic",
                    }}
                  >
                    Focus: {scenario.teachingPoint}
                  </p>
                )}
              </div>

              <InputsTable inputs={scenario.inputs} />

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
                Run out of hearts or time and you&apos;re eliminated. Get all 5
                right to win.
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
                {scenario.questions.map((_, i) => (
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

              {/* Question — includes plain-English explanation */}
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
                  Question {qIndex + 1} of {scenario.questions.length}
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
                {/* Plain-English explanation — always visible, not gated on hint */}
                {question.explanation && (
                  <p
                    style={{
                      color: "#64748B",
                      fontSize: 12,
                      marginTop: 10,
                      marginBottom: 0,
                      lineHeight: 1.55,
                    }}
                  >
                    {question.explanation}
                  </p>
                )}
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
                  Show formula hint
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
                {scenario.questions.length} correctly.
              </p>

              {/* Show the correct answer for the question that ended the run */}
              {eliminatedAtIndex !== null &&
                eliminatedAtIndex < scenario.questions.length && (
                  <EliminatedAnswerReveal
                    question={scenario.questions[eliminatedAtIndex]}
                    questionNumber={eliminatedAtIndex + 1}
                  />
                )}

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
                    {score}/{scenario.questions.length}
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
                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: 12,
                    marginBottom: 10,
                  }}
                >
                  Share your result
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={async () => {
                      const id = await ensureShareId(score, timeLeft);
                      const url = id ? buildShareUrl(id) : buildChallengeUrl();
                      const text = `Scored ${score}/${scenario.questions.length} on FundSim's LBO Deal Challenge with ${formatTime(timeLeft)} on the clock. Try to beat me:`;
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + " " + url)}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                      captureEvent("challenge_share_twitter", { score });
                    }}
                    disabled={shareLoading}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "rgba(29,161,242,0.12)",
                      border: "1px solid rgba(29,161,242,0.3)",
                      color: "#38BDF8",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: shareLoading ? "wait" : "pointer",
                    }}
                  >
                    <IconX />
                    Post on X
                  </button>
                  <button
                    onClick={async () => {
                      const id = await ensureShareId(score, timeLeft);
                      const url = id ? buildShareUrl(id) : buildChallengeUrl();
                      window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                      captureEvent("challenge_share_linkedin", { score });
                    }}
                    disabled={shareLoading}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "rgba(10,102,194,0.12)",
                      border: "1px solid rgba(10,102,194,0.3)",
                      color: "#60A5FA",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: shareLoading ? "wait" : "pointer",
                    }}
                  >
                    <IconLinkedin />
                    LinkedIn
                  </button>
                  <button
                    onClick={async () => {
                      const id = await ensureShareId(score, timeLeft);
                      const url = id ? buildShareUrl(id) : buildChallengeUrl();
                      const text = `Scored ${score}/${scenario.questions.length} on FundSim's LBO Deal Challenge with ${formatTime(timeLeft)} on the clock. Try to beat me: ${url}`;
                      try {
                        await navigator.clipboard.writeText(text);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                        captureEvent("challenge_share_copy", { score });
                      } catch {
                        // Clipboard can reject (no focus / denied permission).
                        setCopyFailed(true);
                        setTimeout(() => setCopyFailed(false), 2500);
                      }
                    }}
                    disabled={shareLoading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: copied
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(99,102,241,0.12)",
                      border: copied
                        ? "1px solid rgba(16,185,129,0.3)"
                        : "1px solid rgba(99,102,241,0.3)",
                      color: copied ? "#10B981" : "#818CF8",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: shareLoading ? "wait" : "pointer",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied
                      ? "Copied!"
                      : copyFailed
                        ? "Press ⌘/Ctrl+C"
                        : "Copy"}
                  </button>
                </div>
              </div>

              <div style={{ width: "100%", textAlign: "left" }}>
                <div
                  style={{
                    color: "#94A3B8",
                    fontSize: 12,
                    marginBottom: 10,
                  }}
                >
                  Challenge a friend
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    ref={inviteInputRef}
                    readOnly
                    value={buildChallengeUrl(clubTagRef.current)}
                    onFocus={(e) => e.currentTarget.select()}
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
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          buildChallengeUrl(clubTagRef.current),
                        );
                        setInviteCopied(true);
                        setTimeout(() => setInviteCopied(false), 2000);
                        captureEvent("challenge_invite_shared", {});
                      } catch {
                        // Let the user copy manually if the clipboard is denied.
                        inviteInputRef.current?.select();
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px 16px",
                      borderRadius: 8,
                      background: inviteCopied
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(99,102,241,0.15)",
                      border: inviteCopied
                        ? "1px solid rgba(16,185,129,0.35)"
                        : "1px solid rgba(99,102,241,0.35)",
                      color: inviteCopied ? "#10B981" : "#818CF8",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {inviteCopied ? <Check size={15} /> : <Copy size={15} />}
                    {inviteCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    onClose();
                    if (onViewLeaderboard) onViewLeaderboard();
                    else window.location.hash = "leaderboard";
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
