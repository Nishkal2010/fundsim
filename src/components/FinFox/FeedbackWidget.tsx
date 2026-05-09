import React, { useState } from "react";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const subject = encodeURIComponent(
      `FundSim Feedback — ${stars} (${rating}/5 stars)`,
    );
    const body = encodeURIComponent(
      `Rating: ${rating}/5\n\nFeedback:\n${text}\n\n---\nSent from fundsimulate.com`,
    );
    window.open(
      `mailto:nishkal.dachepelly@gmail.com?subject=${subject}&body=${body}`,
    );
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setRating(0);
      setText("");
    }, 2500);
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background: "linear-gradient(135deg, #6366F1, #4F46E5)",
          color: "#F9FAFB",
          border: "none",
          borderRadius: 12,
          padding: "10px 16px",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
        title="Share your feedback"
      >
        <span style={{ fontSize: 14 }}>💬</span>
        Feedback
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: 24,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            style={{
              background: "#111827",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 16,
              padding: 24,
              width: 340,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {submitted ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <div
                  style={{
                    color: "#F9FAFB",
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  Thanks for the feedback!
                </div>
                <div style={{ color: "#9CA3AF", fontSize: 13 }}>
                  Your mail app should open now.
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#F9FAFB",
                        fontSize: 15,
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      How did we do?
                    </div>
                    <div style={{ color: "#9CA3AF", fontSize: 12 }}>
                      Did these scenarios match your real PE/VC experience?
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6B7280",
                      cursor: "pointer",
                      fontSize: 18,
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Star rating */}
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 28,
                        color:
                          star <= (hover || rating) ? "#F59E0B" : "#374151",
                        transition: "color 0.1s",
                        padding: "2px 4px",
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>

                {/* Text area */}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What worked well? What didn't match real interviews? Any scenarios you'd like to see?"
                  style={{
                    width: "100%",
                    background: "#0D1220",
                    border: "1px solid #374151",
                    borderRadius: 8,
                    color: "#E5E7EB",
                    fontSize: 12,
                    lineHeight: 1.6,
                    padding: "10px 12px",
                    resize: "vertical",
                    minHeight: 90,
                    fontFamily: "inherit",
                    marginBottom: 12,
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />

                <button
                  onClick={handleSubmit}
                  disabled={rating === 0}
                  style={{
                    width: "100%",
                    background:
                      rating === 0
                        ? "#1F2937"
                        : "linear-gradient(135deg, #6366F1, #4F46E5)",
                    color: rating === 0 ? "#6B7280" : "#F9FAFB",
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 0",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: rating === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Send Feedback
                </button>

                <div
                  style={{
                    color: "#4B5563",
                    fontSize: 11,
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  Opens your email client
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
