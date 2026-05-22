import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { captureEvent } from "../../lib/posthog";

const STORAGE_KEY = "fundsim_captured_email";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Modal ─────────────────────────────────────────────────────────────────────

interface EmailCaptureModalProps {
  onClose: () => void;
  trigger: "excel_export" | "deal_memo";
}

export function EmailCaptureModal({
  onClose,
  trigger,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already captured, close immediately
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      onClose();
    }
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);

    localStorage.setItem(STORAGE_KEY, email);

    // Fire-and-forget upsert — errors are intentionally swallowed
    supabase
      .from("profiles")
      .upsert(
        { email, source: trigger, captured_at: new Date().toISOString() },
        { onConflict: "email", ignoreDuplicates: true },
      )
      .then(
        () => {},
        () => {},
      );

    captureEvent("email_captured", { trigger, method: "modal" });

    setLoading(false);
    setSaved(true);
    setTimeout(() => onClose(), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6"
        style={{
          background: "#111827",
          border: "1px solid #374151",
        }}
      >
        {saved ? (
          <div className="text-center py-4">
            <p className="text-green-400 font-semibold text-lg">Saved!</p>
            <p className="text-gray-400 text-sm mt-1">
              We'll send you a link to resume this model.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-white font-semibold text-lg mb-2">
              Your export is ready — want to save your progress?
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Drop your email and we'll send you a link to resume this model
              anytime. No spam, one click to unsubscribe.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white mb-1 focus:outline-none"
                style={{
                  background: "#1F2937",
                  border: "1px solid #374151",
                }}
                autoFocus
              />
              {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 rounded-lg py-2.5 text-sm font-semibold text-white"
                style={{
                  background: loading ? "#1D4ED8" : "#2563EB",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Saving…" : "Save my progress"}
              </button>
            </form>

            <div className="text-center mt-4">
              <button
                onClick={onClose}
                className="text-xs text-gray-500 hover:text-gray-300"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                No thanks, just the export
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
