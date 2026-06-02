import { motion, useReducedMotion } from "framer-motion";
import { Background } from "./Background";
import { DealTerminal } from "./DealTerminal";
import { CountUp, Eyebrow, Logo, Reveal } from "./primitives";
import { stagger, staggerItem } from "./anim";
import { APP_URL, METRICS, SIMS, type Sim } from "./data";

// ── Nav ──────────────────────────────────────────────────────────
function Nav() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(7,9,15,0.55)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(31,41,55,0.6)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Logo size={24} />
        <nav
          className="hidden md:flex items-center gap-8 text-sm"
          style={{ color: "#9CA3AF" }}
        >
          <a href="#simulators" className="hover:text-white transition-colors">
            Simulators
          </a>
          <a href="#why" className="hover:text-white transition-colors">
            Why FundSim
          </a>
          <a href="#start" className="hover:text-white transition-colors">
            Get started
          </a>
        </nav>
        <a
          href={APP_URL}
          className="text-sm font-semibold px-4 py-2 rounded-lg transition-transform hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
            color: "#fff",
            boxShadow: "0 8px 24px -8px rgba(99,102,241,0.6)",
          }}
        >
          Launch the app →
        </a>
      </div>
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────
function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
        {/* Copy */}
        <div>
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Eyebrow>Free · No signup · PE · VC · IB</Eyebrow>
          </motion.div>

          <motion.h1
            className="font-serif mt-6 leading-[1.02] text-[#F9FAFB]"
            style={{ fontSize: "clamp(2.6rem, 6vw, 4.6rem)" }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Run the deal.{" "}
            <span style={{ fontStyle: "italic", color: "#818CF8" }}>
              Not the slideshow.
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg leading-relaxed max-w-xl"
            style={{ color: "#9CA3AF" }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
          >
            Build an LBO, a venture cap table, or an M&amp;A deal in your
            browser — every output recomputes live as you move the inputs. The
            institutional models, made playable. No Excel, no install, no
            account.
          </motion.p>

          {/* CTA row — one button per desk */}
          <motion.div
            className="mt-9 flex flex-wrap gap-3"
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            {SIMS.map((s) => (
              <motion.a
                key={s.id}
                href={APP_URL}
                variants={staggerItem}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-transform hover:-translate-y-0.5"
                style={{
                  background: s.dim,
                  color: s.glow,
                  border: `1px solid ${s.border}`,
                }}
              >
                Run {s.badge === "IB" ? "an" : "a"} {s.badge} deal
                <span
                  style={{ transition: "transform .2s" }}
                  className="group-hover:translate-x-0.5"
                >
                  →
                </span>
              </motion.a>
            ))}
          </motion.div>

          <motion.p
            className="mt-6 text-xs"
            style={{ color: "#6B7280" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Live in a deal ~10 seconds after you land · Used by finance students
            worldwide
          </motion.p>
        </div>

        {/* Terminal */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <DealTerminal />
        </motion.div>
      </div>
    </section>
  );
}

// ── Stat band ────────────────────────────────────────────────────
function StatBand() {
  return (
    <section
      className="relative border-y"
      style={{
        borderColor: "rgba(31,41,55,0.7)",
        background: "rgba(13,18,32,0.4)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {METRICS.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.08} className="text-center">
            <div
              className="font-serif"
              style={{ fontSize: "2.6rem", color: m.accent, lineHeight: 1 }}
            >
              <CountUp to={m.value} prefix={m.prefix} suffix={m.suffix} />
            </div>
            <div className="mt-2 text-xs" style={{ color: "#9CA3AF" }}>
              {m.label}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Simulator cards ──────────────────────────────────────────────
function SimCard({ s }: { s: Sim }) {
  return (
    <motion.a
      href={APP_URL}
      variants={staggerItem}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="group flex flex-col rounded-2xl p-6 h-full"
      style={{
        background: "rgba(13,18,32,0.7)",
        border: `1px solid ${s.border}`,
        boxShadow: "0 30px 80px -50px rgba(0,0,0,0.9)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <span className="font-serif text-2xl" style={{ color: "#F9FAFB" }}>
          {s.label}
        </span>
        <span
          className="text-xs font-bold px-2 py-1 rounded"
          style={{
            background: s.dim,
            color: s.glow,
            border: `1px solid ${s.border}`,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {s.badge}
        </span>
      </div>
      <div
        className="text-[11px] font-bold uppercase mb-3"
        style={{ color: s.glow, letterSpacing: "0.08em" }}
      >
        {s.sublabel}
      </div>
      <p className="text-sm leading-relaxed mb-5" style={{ color: "#9CA3AF" }}>
        {s.description}
      </p>

      <ul className="flex-1 space-y-0 mb-5">
        {s.features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-2.5 py-1.5"
            style={{ borderBottom: "1px solid rgba(31,41,55,0.7)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: s.accent, opacity: 0.8 }}
            />
            <span className="text-xs" style={{ color: "#D1D5DB" }}>
              {f}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {s.stats.map((st) => (
          <span
            key={st}
            className="text-[11px] px-2 py-0.5 rounded"
            style={{
              background: s.dim,
              color: s.glow,
              border: `1px solid ${s.border}`,
            }}
          >
            {st}
          </span>
        ))}
      </div>

      <div className="text-[11px] mb-4" style={{ color: "#4B5563" }}>
        Modeled on {s.modeledOn}
      </div>

      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-lg"
        style={{ background: s.dim, border: `1px solid ${s.border}` }}
      >
        <span className="text-sm font-semibold" style={{ color: s.glow }}>
          Enter {s.badge} Simulator
        </span>
        <span
          style={{ color: s.glow }}
          className="group-hover:translate-x-1 transition-transform"
        >
          →
        </span>
      </div>
    </motion.a>
  );
}

function Simulators() {
  return (
    <section id="simulators" className="relative mx-auto max-w-6xl px-6 py-24">
      <Reveal className="max-w-2xl mb-12">
        <Eyebrow accent="#34D399">The three desks</Eyebrow>
        <h2
          className="font-serif mt-5 text-[#F9FAFB]"
          style={{ fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 1.05 }}
        >
          Three careers.{" "}
          <span style={{ fontStyle: "italic", color: "#818CF8" }}>
            One platform.
          </span>
        </h2>
        <p className="mt-4 text-base" style={{ color: "#9CA3AF" }}>
          Each track is a complete workflow — the same models the analysts and
          associates at these firms run, rebuilt so you can actually touch them.
        </p>
      </Reveal>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
      >
        {SIMS.map((s) => (
          <SimCard key={s.id} s={s} />
        ))}
      </motion.div>
    </section>
  );
}

// ── Why different ────────────────────────────────────────────────
const VALUES = [
  {
    t: "Live, not static",
    d: "Every number recomputes the instant you change an assumption. No formulas to wire, no #REF! errors — just the model responding.",
    a: "#818CF8",
  },
  {
    t: "Practice, not watch",
    d: "Courses sell you videos. FundSim hands you the deal. Unlimited reps, before anyone's grading you.",
    a: "#34D399",
  },
  {
    t: "Qualitative + quantitative",
    d: "The only simulator that scores judgment as well as math — Payne/Berkus for ventures, a 100-point rubric for M&A.",
    a: "#FBBF24",
  },
  {
    t: "Free. No signup.",
    d: "No paywall on the core sims, no account to explore. Open a tab and you're modeling — that's the whole onboarding.",
    a: "#F472B6",
  },
];

function WhyDifferent() {
  return (
    <section
      id="why"
      className="relative border-y"
      style={{
        borderColor: "rgba(31,41,55,0.7)",
        background: "rgba(10,15,28,0.5)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="max-w-2xl mb-14">
          <Eyebrow accent="#FBBF24">Why it's different</Eyebrow>
          <h2
            className="font-serif mt-5 text-[#F9FAFB]"
            style={{ fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 1.05 }}
          >
            You've watched the videos.{" "}
            <span style={{ fontStyle: "italic", color: "#818CF8" }}>
              Now run the deal.
            </span>
          </h2>
        </Reveal>

        <motion.div
          className="grid sm:grid-cols-2 gap-px rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(31,41,55,0.7)",
            background: "rgba(31,41,55,0.7)",
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          {VALUES.map((v) => (
            <motion.div
              key={v.t}
              variants={staggerItem}
              className="p-8"
              style={{ background: "#0A0F1C" }}
            >
              <div
                className="w-9 h-9 rounded-lg mb-4 flex items-center justify-center"
                style={{ background: `${v.a}1A`, border: `1px solid ${v.a}40` }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: v.a }}
                />
              </div>
              <h3 className="font-serif text-xl text-[#F9FAFB] mb-2">{v.t}</h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#9CA3AF" }}
              >
                {v.d}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <Reveal delay={0.1}>
          <div
            className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl px-6 py-5"
            style={{
              background: "rgba(99,102,241,0.07)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <span className="text-sm" style={{ color: "#D1D5DB" }}>
              Wall Street Prep, BIWS and CFI charge{" "}
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: "#F87171",
                }}
              >
                $497–$1,497
              </span>{" "}
              for video courses. FundSim is{" "}
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: "#34D399",
                }}
              >
                $0
              </span>
              , and you build the model yourself.
            </span>
            <a
              href={APP_URL}
              className="whitespace-nowrap text-sm font-semibold px-4 py-2 rounded-lg"
              style={{
                background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                color: "#fff",
              }}
            >
              See for yourself →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── Final CTA ────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section
      id="start"
      className="relative mx-auto max-w-6xl px-6 py-28 text-center"
    >
      <Reveal>
        <Eyebrow accent="#34D399">Open a live deal</Eyebrow>
        <h2
          className="font-serif mt-6 text-[#F9FAFB] mx-auto max-w-3xl"
          style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", lineHeight: 1.04 }}
        >
          Pick a desk. Move the inputs.{" "}
          <span style={{ fontStyle: "italic", color: "#818CF8" }}>
            Watch the model answer.
          </span>
        </h2>
        <p
          className="mt-6 text-lg max-w-xl mx-auto"
          style={{ color: "#9CA3AF" }}
        >
          Free forever. No account needed. Runs in your browser — you're
          modeling your first deal in about ten seconds.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href={APP_URL}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-transform hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              color: "#fff",
              boxShadow: "0 16px 50px -16px rgba(99,102,241,0.7)",
            }}
          >
            Start a deal — free →
          </a>
        </div>
      </Reveal>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(31,41,55,0.7)" }}>
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo size={22} />
          <span className="text-xs" style={{ color: "#6B7280" }}>
            The institutional models, made playable.
          </span>
        </div>
        <div
          className="flex items-center gap-7 text-sm"
          style={{ color: "#9CA3AF" }}
        >
          <a href="#simulators" className="hover:text-white transition-colors">
            Simulators
          </a>
          <a href="#why" className="hover:text-white transition-colors">
            Why FundSim
          </a>
          <a href={APP_URL} className="hover:text-white transition-colors">
            Launch app
          </a>
        </div>
        <span className="text-xs" style={{ color: "#4B5563" }}>
          © 2026 FundSim · fundsimulate.com
        </span>
      </div>
    </footer>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export function Landing() {
  return (
    <div
      style={{ position: "relative", minHeight: "100vh", isolation: "isolate" }}
    >
      <Background />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Nav />
        <main>
          <Hero />
          <StatBand />
          <Simulators />
          <WhyDifferent />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
