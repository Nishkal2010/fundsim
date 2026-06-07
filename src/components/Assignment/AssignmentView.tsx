import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Lock, ExternalLink } from "lucide-react";
import type { DealShare } from "../../lib/dealShare";
import { saveDealShare, buildShareUrl } from "../../lib/dealShare";
import { encodeScenario } from "../../lib/shareUrl";
import type { FundInputs } from "../../types/fund";
import { DefenseGate } from "./DefenseGate";
import { captureEvent } from "../../lib/posthog";

// Human-readable labels for lockable field keys across simulators
const FIELD_LABELS: Record<string, string> = {
  // PE
  carryPercentage: "Carry %",
  avgExitMultiple: "Avg Exit Multiple",
  hurdleRate: "Hurdle Rate",
  fundSize: "Fund Size",
  managementFeeRate: "Mgmt Fee Rate",
  investmentPeriod: "Investment Period",
  // VC
  targetOwnership: "Target Ownership",
  valuationCap: "Valuation Cap",
  proRataRights: "Pro-Rata Rights",
  // IB
  synergies: "Synergies",
  premiumPaid: "Premium Paid",
  debtFinancing: "Debt Financing %",
};

function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

interface AssignmentViewProps {
  deal: DealShare;
}

type SubmitStatus = "idle" | "confirming" | "saving" | "done" | "error";

export function AssignmentView({ deal }: AssignmentViewProps) {
  const assignment = deal.assignment!;
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submissionUrl, setSubmissionUrl] = useState<string | null>(null);

  // Build the "load into simulator" URL.
  // Uses the existing ?model= param that useFundModel.ts already reads via
  // getSharedScenario(). The ?locked= param rides alongside so the simulator
  // can disable those inputs. Both sides must use the same encoding.
  function buildSimulatorUrl(): string {
    const params = new URLSearchParams();

    // Only PE inputs are typed as FundInputs; VC/IB inputs are freeform.
    // encodeScenario uses btoa(unescape(encodeURIComponent(JSON.stringify(x))))
    // which handles all Unicode safely. Clamp the raw JSON to 8 KB before
    // encoding so we never embed an oversized blob in a URL.
    const MAX_INPUT_JSON = 8192;
    const inputsJson = JSON.stringify(deal.inputs ?? {});
    if (inputsJson.length <= MAX_INPUT_JSON) {
      try {
        const encoded = encodeScenario(deal.inputs as unknown as FundInputs);
        params.set("model", encoded);
      } catch {
        // inputs not encodable — navigate without pre-fill
      }
    }

    if (assignment.locked.length > 0) {
      // Encode locked keys safely — btoa throws for non-Latin1.
      // Use encodeURIComponent first so all chars are ASCII-safe.
      try {
        const safe = assignment.locked
          .filter((k) => /^[a-zA-Z0-9_]+$/.test(k))
          .join(",");
        params.set("locked", btoa(safe));
      } catch {
        // skip locked param if encoding fails
      }
    }

    const hash = deal.simulator;
    return `${window.location.origin}/?${params.toString()}#${hash}`;
  }

  function handleSubmitClick() {
    setSubmitStatus("confirming");
  }

  async function handleDefenseSubmit(defense: string) {
    setSubmitStatus("saving");
    try {
      const payload = {
        simulator: deal.simulator,
        tab: deal.tab,
        inputs: deal.inputs,
        summary: deal.summary,
        assignment: {
          ...assignment,
          defense,
          sourceId: deal.id,
        },
      };
      const id = await saveDealShare(payload);
      const url = buildShareUrl(id);
      setSubmissionUrl(url);
      await navigator.clipboard.writeText(url).catch(() => {});
      captureEvent("assignment_submitted", {
        simulator: deal.simulator,
        sourceId: deal.id,
      });
      setSubmitStatus("done");
    } catch {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 2000);
    }
  }

  // Submitted defense view (this is a submission row, shown to graders).
  // Show student reasoning AND a "Load student's model" link so the grader
  // can verify the numbers — buildSimulatorUrl() pre-fills deal.inputs which
  // are the student's actual submitted inputs, not blank defaults.
  if (assignment.defense) {
    return (
      <div
        style={{
          background: "#111827",
          border: "1px solid #1F2937",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <p
          style={{
            color: "#9CA3AF",
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          Student reasoning
        </p>
        <p
          style={{
            color: "#D1D5DB",
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          {assignment.defense}
        </p>
        <a
          href={buildSimulatorUrl()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            background: "#1F2937",
            border: "1px solid #374151",
            color: "#9CA3AF",
            fontWeight: 600,
            fontSize: 12,
            textDecoration: "none",
          }}
        >
          Load student's model
          <ExternalLink size={12} />
        </a>
      </div>
    );
  }

  return (
    <>
      {submitStatus === "confirming" &&
        ReactDOM.createPortal(
          <DefenseGate
            prompt={assignment.prompt}
            onSubmit={handleDefenseSubmit}
            onDismiss={() => setSubmitStatus("idle")}
          />,
          document.body,
        )}

      {/* Assignment banner */}
      <div
        style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <p
          style={{
            color: "#F59E0B",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          Assignment from your instructor
        </p>
        <p
          style={{
            color: "#D1D5DB",
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          {assignment.prompt}
        </p>

        {assignment.locked.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                color: "#9CA3AF",
                fontSize: 12,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Lock size={12} />
              Locked inputs (you cannot change these):
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {assignment.locked.map((key) => (
                <span
                  key={key}
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 6,
                    padding: "2px 10px",
                    fontSize: 12,
                    color: "#F59E0B",
                  }}
                >
                  {fieldLabel(key)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={buildSimulatorUrl()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Load into simulator
            <ExternalLink size={12} />
          </a>

          {submitStatus === "done" && submissionUrl ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#34D399", fontSize: 13, fontWeight: 600 }}>
                Submission link copied!
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(submissionUrl)}
                style={{
                  background: "none",
                  border: "1px solid #374151",
                  borderRadius: 6,
                  color: "#9CA3AF",
                  fontSize: 12,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                Copy again
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmitClick}
              disabled={submitStatus === "saving"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                background: "#1F2937",
                border: "1px solid #374151",
                color: "#D1D5DB",
                fontWeight: 600,
                fontSize: 13,
                cursor: submitStatus === "saving" ? "not-allowed" : "pointer",
                opacity: submitStatus === "saving" ? 0.6 : 1,
              }}
            >
              {submitStatus === "saving"
                ? "Saving…"
                : submitStatus === "error"
                  ? "Error — retry"
                  : "Submit your work"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
