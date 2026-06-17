import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { saveDealShare, buildShareUrl } from "../../lib/dealShare";
import { captureEvent } from "../../lib/posthog";
import { useFundModel } from "../../hooks/useFundModel";
import type { SimulatorId } from "../SimulatorSelector";

// Lockable field keys per simulator with human-readable labels
const LOCKABLE_FIELDS: Record<
  SimulatorId,
  Array<{ key: string; label: string }>
> = {
  pe: [
    { key: "carryPercentage", label: "Carry %" },
    { key: "avgExitMultiple", label: "Avg Exit Multiple" },
    { key: "hurdleRate", label: "Hurdle Rate" },
    { key: "fundSize", label: "Fund Size" },
    { key: "managementFeeRate", label: "Mgmt Fee Rate" },
    { key: "investmentPeriod", label: "Investment Period" },
  ],
  vc: [
    { key: "targetOwnership", label: "Target Ownership" },
    { key: "valuationCap", label: "Valuation Cap" },
    { key: "proRataRights", label: "Pro-Rata Rights" },
  ],
  ib: [
    { key: "synergies", label: "Synergies" },
    { key: "premiumPaid", label: "Premium Paid" },
    { key: "debtFinancing", label: "Debt Financing %" },
  ],
};

interface AssignmentBuilderProps {
  onClose: () => void;
}

type BuildStatus = "idle" | "saving" | "done" | "error";

export function AssignmentBuilder({ onClose }: AssignmentBuilderProps) {
  // Capture the current PE simulator state so the assignment bakes in the
  // instructor's base-case numbers. Students load the simulator pre-filled
  // with these inputs and see the locked fields disabled.
  const { inputs: peInputs } = useFundModel();

  const [simulator, setSimulator] = useState<SimulatorId>("pe");
  const [prompt, setPrompt] = useState("");
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<BuildStatus>("idle");
  const [assignmentUrl, setAssignmentUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const promptLen = prompt.length;
  const canCreate = prompt.trim().length >= 10 && promptLen <= 500;

  function toggleLock(key: string) {
    setLocked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleCreate() {
    if (!canCreate) return;
    setStatus("saving");
    try {
      // For PE assignments, bake in the instructor's current model so students
      // load with the base case pre-filled. VC/IB don't share the FundInputs
      // schema so we leave their inputs empty for now.
      const baseInputs =
        simulator === "pe"
          ? (peInputs as unknown as Record<string, unknown>)
          : {};
      const id = await saveDealShare({
        simulator,
        tab: simulator === "ib" ? "simulator" : "waterfall",
        inputs: baseInputs,
        summary: {
          title: `Assignment: ${prompt.slice(0, 60)}${prompt.length > 60 ? "…" : ""}`,
          subtitle: `${simulator.toUpperCase()} assignment — open in FundSim to complete`,
          metrics: [],
        },
        assignment: {
          locked: Array.from(locked),
          prompt,
        },
      });
      const url = buildShareUrl(id);
      setAssignmentUrl(url);
      captureEvent("assignment_created", {
        simulator,
        lockedCount: locked.size,
      });
      setStatus("done");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  async function handleCopy() {
    if (!assignmentUrl) return;
    await navigator.clipboard.writeText(assignmentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          background: "#111827",
          border: "1px solid #1F2937",
          borderRadius: 16,
          padding: 28,
          maxWidth: 520,
          width: "100%",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          title="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6B7280",
            display: "flex",
            alignItems: "center",
          }}
        >
          <X size={16} />
        </button>

        <p
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 4,
          }}
        >
          Create Assignment
        </p>
        <p
          style={{
            color: "#9CA3AF",
            fontSize: 13,
            marginBottom: 24,
            lineHeight: 1.4,
          }}
        >
          Students will see the locked assumptions and your prompt before
          submitting their work.
        </p>

        {/* Simulator selector */}
        <label
          style={{
            display: "block",
            color: "#D1D5DB",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Simulator
        </label>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["pe", "vc", "ib"] as SimulatorId[]).map((sim) => (
            <button
              key={sim}
              onClick={() => {
                setSimulator(sim);
                setLocked(new Set());
              }}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: `1px solid ${simulator === sim ? "#6366F1" : "#374151"}`,
                background:
                  simulator === sim ? "rgba(99,102,241,0.15)" : "transparent",
                color: simulator === sim ? "#818CF8" : "#9CA3AF",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {sim}
            </button>
          ))}
        </div>

        {/* Prompt */}
        <label
          style={{
            display: "block",
            color: "#D1D5DB",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Prompt / question for students
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Justify your exit multiple assumption given current market comps."
          rows={4}
          maxLength={500}
          style={{
            width: "100%",
            background: "#1F2937",
            border: "1px solid #374151",
            borderRadius: 8,
            color: "#E5E7EB",
            fontSize: 13,
            lineHeight: 1.6,
            padding: "10px 12px",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 4,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: promptLen > 480 ? "#F59E0B" : "#6B7280",
            }}
          >
            {promptLen}/500
          </span>
        </div>

        {/* Locked fields */}
        <label
          style={{
            display: "block",
            color: "#D1D5DB",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Lock inputs (students cannot change these)
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 28,
          }}
        >
          {LOCKABLE_FIELDS[simulator].map(({ key, label }) => {
            const active = locked.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleLock(key)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: `1px solid ${active ? "rgba(245,158,11,0.5)" : "#374151"}`,
                  background: active ? "rgba(245,158,11,0.1)" : "transparent",
                  color: active ? "#F59E0B" : "#9CA3AF",
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.1s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Result URL */}
        {status === "done" && assignmentUrl && (
          <div
            style={{
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.3)",
              borderRadius: 10,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <p
              style={{
                color: "#34D399",
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Assignment link ready — share this with students:
            </p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                readOnly
                value={assignmentUrl}
                style={{
                  flex: 1,
                  background: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: 6,
                  color: "#D1D5DB",
                  fontSize: 12,
                  padding: "6px 10px",
                  outline: "none",
                  minWidth: 0,
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? "#34D399" : "#374151",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  padding: "7px 10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "background 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={!canCreate || status === "saving" || status === "done"}
          style={{
            width: "100%",
            padding: "11px 0",
            borderRadius: 8,
            border: "none",
            background:
              status === "done"
                ? "#34D399"
                : canCreate && status !== "saving"
                  ? "linear-gradient(135deg,#6366F1,#8B5CF6)"
                  : "#374151",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor:
              canCreate && status !== "saving" && status !== "done"
                ? "pointer"
                : "not-allowed",
            opacity: !canCreate || status === "saving" ? 0.6 : 1,
            transition: "background 0.15s, opacity 0.15s",
          }}
        >
          {status === "saving"
            ? "Creating…"
            : status === "done"
              ? "Assignment created"
              : status === "error"
                ? "Error — retry"
                : "Create assignment link"}
        </button>
      </div>
    </div>
  );
}
