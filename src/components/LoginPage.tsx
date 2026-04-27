import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface LoginPageProps {
  onDemoLogin: (user: {
    name: string;
    email: string;
    picture?: string;
  }) => void;
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginPage({ onDemoLogin }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (mode === "signup" && !name) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess(
          "Account created! Check your email to confirm, then sign in.",
        );
        setMode("login");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
      }
      // On success, onAuthStateChange in App.tsx handles setting the user
    }

    setLoading(false);
  }

  function handleDemo() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onDemoLogin({ name: "Demo User", email: "demo@fundsim.io" });
    }, 400);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0A0F1C" }}>
      {/* Left branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between w-1/2 p-12"
        style={{
          background:
            "linear-gradient(135deg, #111827 0%, #0A0F1C 60%, #0f1729 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <svg
            width="36"
            height="36"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="7" fill="#0D1220" />
            <rect x="7" y="19" width="4" height="7" rx="1" fill="#6366F1" />
            <rect x="14" y="13" width="4" height="13" rx="1" fill="#818CF8" />
            <rect x="21" y="7" width="4" height="19" rx="1" fill="#A5B4FC" />
          </svg>
          <span className="font-serif text-2xl" style={{ color: "#F9FAFB" }}>
            FundSim
          </span>
        </div>

        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-serif mb-6 leading-tight"
            style={{ fontSize: "42px", color: "#F9FAFB" }}
          >
            Model the entire lifecycle of a PE/VC fund.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            style={{ fontSize: "16px", color: "#9CA3AF", lineHeight: "1.7" }}
          >
            From capital calls to carried interest — simulate waterfall
            distributions, visualize the J-curve, and calculate real fund
            performance metrics. Free. No Excel required.
          </motion.p>
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 space-y-3"
          >
            {[
              "Interactive J-curve visualizer",
              "European & American waterfall calculator",
              "DPI / TVPI / IRR performance dashboard",
              "Sensitivity analysis heatmap",
              "Progress saved automatically",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(99,102,241,0.2)",
                    border: "1px solid #6366F1",
                  }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="#6366F1"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span style={{ fontSize: "14px", color: "#9CA3AF" }}>{f}</span>
              </li>
            ))}
          </motion.ul>
        </div>

        <div
          className="p-6 rounded-xl"
          style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: "#9CA3AF",
              fontStyle: "italic",
              lineHeight: "1.6",
            }}
          >
            "Understanding fund economics is the single most important skill for
            anyone entering private equity."
          </p>
          <p
            className="mt-3"
            style={{
              fontSize: "12px",
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            — Common PE/VC wisdom
          </p>
        </div>
      </motion.div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="7" fill="#0D1220" />
              <rect x="7" y="19" width="4" height="7" rx="1" fill="#6366F1" />
              <rect x="14" y="13" width="4" height="13" rx="1" fill="#818CF8" />
              <rect x="21" y="7" width="4" height="19" rx="1" fill="#A5B4FC" />
            </svg>
            <span className="font-serif text-xl" style={{ color: "#F9FAFB" }}>
              FundSim
            </span>
          </div>

          <div className="mb-8">
            <h2
              className="font-serif mb-2"
              style={{ fontSize: "32px", color: "#F9FAFB" }}
            >
              {mode === "login" ? "Welcome back." : "Create your account."}
            </h2>
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
              {mode === "login"
                ? "Sign in to restore your saved progress."
                : "Start modeling PE/VC fund economics for free."}
            </p>
          </div>

          {/* Google Sign-In button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-all mb-4"
            style={{
              background: "#ffffff",
              color: "#1F2937",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f3f4")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "#374151" }} />
            <span style={{ fontSize: "12px", color: "#6B7280" }}>
              or continue with email
            </span>
            <div className="flex-1 h-px" style={{ background: "#374151" }} />
          </div>

          {/* Success message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-5 p-3 rounded-lg"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
              }}
            >
              <CheckCircle size={15} color="#22C55E" />
              <span style={{ fontSize: "13px", color: "#22C55E" }}>
                {success}
              </span>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-5 p-3 rounded-lg"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <AlertCircle size={15} color="#EF4444" />
              <span style={{ fontSize: "13px", color: "#EF4444" }}>
                {error}
              </span>
            </motion.div>
          )}

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label
                  className="block mb-1.5"
                  style={{
                    fontSize: "12px",
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 500,
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    background: "#1F2937",
                    border: "1px solid #374151",
                    color: "#F9FAFB",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                  onBlur={(e) => (e.target.style.borderColor = "#374151")}
                />
              </div>
            )}

            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontSize: "12px",
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 500,
                }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  color="#6B7280"
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    background: "#1F2937",
                    border: "1px solid #374151",
                    color: "#F9FAFB",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                  onBlur={(e) => (e.target.style.borderColor = "#374151")}
                />
              </div>
            </div>

            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontSize: "12px",
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 500,
                }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  color="#6B7280"
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === "signup" ? "At least 6 characters" : "••••••••"
                  }
                  className="w-full pl-10 pr-10 py-3 rounded-xl outline-none transition-all"
                  style={{
                    background: "#1F2937",
                    border: "1px solid #374151",
                    color: "#F9FAFB",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                  onBlur={(e) => (e.target.style.borderColor = "#374151")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={15} color="#6B7280" />
                  ) : (
                    <Eye size={15} color="#6B7280" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all"
              style={{
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "white",
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                border: "none",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Demo access */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "#374151" }} />
            <span style={{ fontSize: "12px", color: "#6B7280" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "#374151" }} />
          </div>

          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium transition-all"
            style={{
              background: "transparent",
              border: "1px solid #374151",
              color: "#9CA3AF",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#6366F1";
              (e.currentTarget as HTMLButtonElement).style.color = "#F9FAFB";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#374151";
              (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
            }}
          >
            Continue with demo access
          </button>

          <p
            className="text-center mt-5"
            style={{ fontSize: "14px", color: "#6B7280" }}
          >
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setSuccess("");
              }}
              style={{
                color: "#818CF8",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontSize: "14px",
              }}
            >
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>

          <p
            className="text-center mt-8"
            style={{ fontSize: "11px", color: "#4B5563", lineHeight: "1.5" }}
          >
            This tool is for educational purposes only.
            <br />
            Nothing here constitutes financial or investment advice.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
