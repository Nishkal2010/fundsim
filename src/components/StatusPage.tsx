import React from "react";

// Injected at build time by Vite — falls back to runtime date if undefined
const BUILD_DATE: string =
  typeof __BUILD_DATE__ !== "undefined"
    ? __BUILD_DATE__
    : new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

// Static incident log — update manually when incidents occur
const INCIDENTS: {
  date: string;
  title: string;
  status: "resolved" | "ongoing";
}[] = [
  { date: "2026-06-06", title: "No incidents recorded", status: "resolved" },
];

// Test count is manually updated — run `npm test` to verify
// Last verified: 237 tests passing across 14 test files
const TEST_COUNT = 237;
const TEST_FILES = 14;

const services = [
  { name: "App", description: "React SPA on Vercel" },
  { name: "FinFox AI Tutor", description: "Anthropic-backed chat endpoint" },
  { name: "Auth (Supabase)", description: "User authentication & sessions" },
  { name: "Saved Models", description: "Fund model persistence (Supabase DB)" },
];

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0A0F1C",
    color: "#F9FAFB",
    fontFamily: "inherit",
  } as React.CSSProperties,
  nav: {
    padding: "16px 24px",
    borderBottom: "1px solid #1F2937",
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
  backLink: {
    color: "#818CF8",
    textDecoration: "none",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  } as React.CSSProperties,
  container: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "48px 24px",
  } as React.CSSProperties,
  banner: {
    background: "#111827",
    border: "1px solid #1F2937",
    borderRadius: "12px",
    padding: "28px 32px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "40px",
  } as React.CSSProperties,
  bigDot: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#34D399",
    flexShrink: 0,
    boxShadow: "0 0 10px #34D39966",
  } as React.CSSProperties,
  bannerTitle: {
    fontSize: "22px",
    fontWeight: 600,
    color: "#34D399",
    margin: 0,
  } as React.CSSProperties,
  bannerSub: {
    fontSize: "13px",
    color: "#6B7280",
    marginTop: "4px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#9CA3AF",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "12px",
  } as React.CSSProperties,
  card: {
    background: "#111827",
    border: "1px solid #1F2937",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "32px",
  } as React.CSSProperties,
  serviceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #1F2937",
  } as React.CSSProperties,
  serviceRowLast: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
  } as React.CSSProperties,
  serviceLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  } as React.CSSProperties,
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#34D399",
    flexShrink: 0,
  } as React.CSSProperties,
  serviceName: {
    fontSize: "14px",
    color: "#F9FAFB",
    fontWeight: 500,
  } as React.CSSProperties,
  serviceDesc: {
    fontSize: "12px",
    color: "#6B7280",
    marginTop: "1px",
  } as React.CSSProperties,
  statusBadge: {
    fontSize: "12px",
    color: "#34D399",
    fontWeight: 500,
  } as React.CSSProperties,
  mathRow: {
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#111827",
    border: "1px solid #1F2937",
    borderRadius: "10px",
    marginBottom: "32px",
  } as React.CSSProperties,
  mathLabel: {
    fontSize: "14px",
    color: "#F9FAFB",
    fontWeight: 500,
  } as React.CSSProperties,
  mathValue: {
    fontSize: "13px",
    color: "#818CF8",
  } as React.CSSProperties,
  incidentCard: {
    background: "#111827",
    border: "1px solid #1F2937",
    borderRadius: "10px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  } as React.CSSProperties,
  incidentDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#34D399",
    flexShrink: 0,
    marginTop: "5px",
  } as React.CSSProperties,
  incidentTitle: {
    fontSize: "14px",
    color: "#9CA3AF",
  } as React.CSSProperties,
  incidentDate: {
    fontSize: "12px",
    color: "#4B5563",
    marginTop: "2px",
  } as React.CSSProperties,
  maintainerCard: {
    background: "#111827",
    border: "1px solid #F59E0B44",
    borderRadius: "10px",
    padding: "20px 24px",
    marginBottom: "32px",
  } as React.CSSProperties,
  maintainerTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#F59E0B",
    marginBottom: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  } as React.CSSProperties,
  maintainerName: {
    fontSize: "15px",
    color: "#F9FAFB",
    fontWeight: 500,
    marginBottom: "4px",
  } as React.CSSProperties,
  maintainerRole: {
    fontSize: "12px",
    color: "#6B7280",
    marginBottom: "12px",
  } as React.CSSProperties,
  maintainerLink: {
    fontSize: "13px",
    color: "#818CF8",
    textDecoration: "none",
  } as React.CSSProperties,
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "16px",
    borderTop: "1px solid #1F2937",
    marginTop: "8px",
  } as React.CSSProperties,
  footerText: {
    fontSize: "12px",
    color: "#4B5563",
  } as React.CSSProperties,
  footerLink: {
    fontSize: "12px",
    color: "#818CF8",
    textDecoration: "none",
  } as React.CSSProperties,
};

export function StatusPage() {
  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <a
          href="/"
          style={styles.backLink}
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = "";
          }}
        >
          ← Back to FundSim
        </a>
      </nav>

      <div style={styles.container}>
        {/* Overall status banner */}
        <div style={styles.banner}>
          <div style={styles.bigDot} />
          <div>
            <p style={styles.bannerTitle}>All Systems Operational</p>
            <p style={styles.bannerSub}>All services are running normally.</p>
          </div>
        </div>

        {/* Service status grid */}
        <div style={styles.sectionTitle}>Components</div>
        <div style={styles.card}>
          {services.map((svc, i) => (
            <div
              key={svc.name}
              style={
                i < services.length - 1
                  ? styles.serviceRow
                  : styles.serviceRowLast
              }
            >
              <div style={styles.serviceLeft}>
                <div style={styles.dot} />
                <div>
                  <div style={styles.serviceName}>{svc.name}</div>
                  <div style={styles.serviceDesc}>{svc.description}</div>
                </div>
              </div>
              <span style={styles.statusBadge}>Operational</span>
            </div>
          ))}
        </div>

        {/* Math engine — no dot, just a fact row */}
        <div style={styles.sectionTitle}>Math Engine</div>
        <div style={styles.mathRow}>
          <span style={styles.mathLabel}>Unit test suite</span>
          {/* TODO: update TEST_COUNT and TEST_FILES at top of file when tests change */}
          <span style={styles.mathValue}>
            {TEST_COUNT} tests passing · {TEST_FILES} test files
          </span>
        </div>

        {/* Point of Contact */}
        <div style={styles.sectionTitle}>Point of Contact</div>
        <div style={styles.maintainerCard}>
          <div style={styles.maintainerName}>Nishkal Dachepelly</div>
          <div style={styles.maintainerRole}>Founder</div>
          <a
            href="mailto:nishkal.dachepelly@gmail.com"
            style={styles.maintainerLink}
          >
            nishkal.dachepelly@gmail.com
          </a>
          {/* Backup contact — replace with a faculty advisor or co-builder before sharing with professors */}
          <div
            style={{
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid #1F2937",
            }}
          >
            <div style={{ ...styles.maintainerRole, marginBottom: "2px" }}>
              Backup: [Name] · [email@university.edu]
            </div>
            <div style={{ fontSize: "11px", color: "#4B5563" }}>
              Fill in a faculty advisor or co-builder before distributing to
              classes.
            </div>
          </div>
        </div>

        {/* Incident log */}
        <div style={styles.sectionTitle}>Incident Log</div>
        <div style={{ marginBottom: "40px" }}>
          {INCIDENTS.map((inc) => (
            <div key={inc.date + inc.title} style={styles.incidentCard}>
              <div style={styles.incidentDot} />
              <div>
                <div style={styles.incidentTitle}>{inc.title}</div>
                <div style={styles.incidentDate}>{inc.date}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.footerText}>Last updated · {BUILD_DATE}</span>
          <a
            href="mailto:nishkal.dachepelly@gmail.com"
            style={styles.footerLink}
          >
            Report an issue
          </a>
        </div>
      </div>
    </div>
  );
}
