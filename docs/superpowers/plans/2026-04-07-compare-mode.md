# Compare Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a side-by-side Compare Mode page where two fully independent fund models run in parallel with all 4 analysis tabs synced.

**Architecture:** Hash-based routing in `main.tsx` renders `<ComparePage />` when `window.location.hash === '#compare'`. ComparePage calls `useFundModelState()` twice and wraps each panel in its own `FundModelContext.Provider`. All existing simulation components (GlobalInputs, tab components, charts) read from whichever context wraps them — zero changes needed to those files.

**Tech Stack:** React 19, TypeScript, framer-motion (already installed), lucide-react (already installed), Tailwind CSS

---

## File Map

| File                              | Action     | Responsibility                                                                                            |
| --------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| `src/components/ComparePage.tsx`  | **Create** | Owns two FundModel instances, shared activeTab state, top-level layout                                    |
| `src/components/ComparePanel.tsx` | **Create** | Single panel: FundModelContext.Provider wrapper, panel header, collapsible settings, tab bar, tab content |
| `src/main.tsx`                    | **Edit**   | Add hash router — renders `<App />` or `<ComparePage />` based on `window.location.hash`                  |
| `src/components/Header.tsx`       | **Edit**   | Add Compare button (Columns2 icon) that sets `window.location.hash = '#compare'`                          |

Everything else: **untouched**.

---

### Task 1: Create `ComparePanel.tsx`

**Files:**

- Create: `src/components/ComparePanel.tsx`

- [ ] **Step 1: Create the file with all imports and the component**

```tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import { FundModelContext } from "../hooks/useFundModel";
import type { FundModel } from "../types/fund";
import { GlobalInputs } from "./GlobalInputs";
import { TabBar } from "./TabBar";
import type { TabId } from "./TabBar";
import { FundLifecycleTab } from "./FundLifecycle/FundLifecycleTab";
import { JCurveTab } from "./JCurve/JCurveTab";
import { WaterfallTab } from "./Waterfall/WaterfallTab";
import { PerformanceTab } from "./Performance/PerformanceTab";

interface ComparePanelProps {
  model: FundModel;
  label: "Fund A" | "Fund B";
  accentColor: string; // e.g. '#6366F1' for A, '#10B981' for B
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function ComparePanel({
  model,
  label,
  accentColor,
  activeTab,
  onTabChange,
}: ComparePanelProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const tabContent: Record<TabId, React.ReactNode> = {
    lifecycle: <FundLifecycleTab />,
    jcurve: <JCurveTab />,
    waterfall: <WaterfallTab />,
    performance: <PerformanceTab />,
  };

  return (
    <FundModelContext.Provider value={model}>
      <div
        className="flex flex-col min-h-0"
        style={{
          background: "#111827",
          border: "1px solid #1F2937",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{
            borderBottom: `2px solid ${accentColor}`,
            background: "#0A0F1C",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: accentColor,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "#F9FAFB", fontWeight: 600, fontSize: "15px" }}>
            {label}
          </span>
        </div>

        {/* Collapsible settings */}
        <div style={{ borderBottom: "1px solid #1F2937" }}>
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className="flex items-center gap-2 w-full px-4 py-2 text-left"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <Settings size={13} />
            Fund Settings
            {settingsOpen ? (
              <ChevronUp size={13} style={{ marginLeft: "auto" }} />
            ) : (
              <ChevronDown size={13} style={{ marginLeft: "auto" }} />
            )}
          </button>

          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <GlobalInputs />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab bar */}
        <TabBar active={activeTab} onChange={onTabChange} />

        {/* Tab content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </FundModelContext.Provider>
  );
}
```

- [ ] **Step 2: Verify the file was created**

```bash
ls src/components/ComparePanel.tsx
```

Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add src/components/ComparePanel.tsx
git commit -m "feat: add ComparePanel component for compare mode"
```

---

### Task 2: Create `ComparePage.tsx`

**Files:**

- Create: `src/components/ComparePage.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useFundModelState } from "../hooks/useFundModel";
import type { TabId } from "./TabBar";
import { ComparePanel } from "./ComparePanel";

// Fund B defaults — meaningfully different from Fund A so comparison is interesting on load
const FUND_B_OVERRIDES = {
  carryPercentage: 0.25,
  avgExitMultiple: 2.5,
  lossRatio: 0.35,
  managementFee: 0.025,
  waterfallType: "american" as const,
};

export function ComparePage() {
  const modelA = useFundModelState();
  const modelB = useFundModelState();
  const [activeTab, setActiveTab] = useState<TabId>("lifecycle");

  // Apply Fund B overrides once on mount
  useEffect(() => {
    modelB.setInput("carryPercentage", FUND_B_OVERRIDES.carryPercentage);
    modelB.setInput("avgExitMultiple", FUND_B_OVERRIDES.avgExitMultiple);
    modelB.setInput("lossRatio", FUND_B_OVERRIDES.lossRatio);
    modelB.setInput("managementFee", FUND_B_OVERRIDES.managementFee);
    modelB.setInput("waterfallType", FUND_B_OVERRIDES.waterfallType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0A0F1C" }}
    >
      {/* Page header */}
      <div
        className="flex items-center gap-4 px-6 py-4"
        style={{
          background: "#111827",
          borderBottom: "1px solid #374151",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <button
          onClick={() => {
            window.location.hash = "";
          }}
          className="flex items-center gap-2"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#9CA3AF",
            fontSize: "14px",
            padding: "6px 10px",
            borderRadius: "8px",
            transition: "color 0.18s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#F9FAFB";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
          }}
        >
          <ArrowLeft size={16} />
          Back to Simulator
        </button>

        <span style={{ color: "#6B7280", fontSize: "14px" }}>|</span>

        <span style={{ color: "#F9FAFB", fontWeight: 600, fontSize: "16px" }}>
          Compare Mode
        </span>
      </div>

      {/* Two-panel grid */}
      <div
        className="flex-1 p-4 grid gap-4"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
        }}
      >
        <ComparePanel
          model={modelA}
          label="Fund A"
          accentColor="#6366F1"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <ComparePanel
          model={modelB}
          label="Fund B"
          accentColor="#10B981"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file was created**

```bash
ls src/components/ComparePage.tsx
```

Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add src/components/ComparePage.tsx
git commit -m "feat: add ComparePage with dual independent fund models"
```

---

### Task 3: Edit `main.tsx` — add hash router

**Files:**

- Modify: `src/main.tsx`

- [ ] **Step 1: Replace the contents of `src/main.tsx` with the hash router**

Current file (`src/main.tsx`):

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Replace with:

```tsx
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ComparePage } from "./components/ComparePage.tsx";

function Root() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return hash === "#compare" ? <ComparePage /> : <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
```

- [ ] **Step 2: Commit**

```bash
git add src/main.tsx
git commit -m "feat: add hash router to render ComparePage at #compare"
```

---

### Task 4: Edit `Header.tsx` — add Compare button

**Files:**

- Modify: `src/components/Header.tsx`

- [ ] **Step 1: Add the compare hover state and the Compare button**

Add `compareHover` state. Add the `Columns2` import. Add the button between Glossary and GitHub.

Change the import line from:

```tsx
import { BookOpen, ExternalLink, LogOut, User } from "lucide-react";
```

To:

```tsx
import { BookOpen, Columns2, ExternalLink, LogOut, User } from "lucide-react";
```

Add hover state — change:

```tsx
const [glossHover, setGlossHover] = useState(false);
const [ghHover, setGhHover] = useState(false);
const [logoutHover, setLogoutHover] = useState(false);
```

To:

```tsx
const [glossHover, setGlossHover] = useState(false);
const [compareHover, setCompareHover] = useState(false);
const [ghHover, setGhHover] = useState(false);
const [logoutHover, setLogoutHover] = useState(false);
```

Add button — insert after the closing `</button>` of the Glossary button and before the `{/* GitHub */}` comment:

```tsx
{
  /* Compare */
}
<button
  onClick={() => {
    window.location.hash = "#compare";
  }}
  onMouseEnter={() => setCompareHover(true)}
  onMouseLeave={() => setCompareHover(false)}
  style={{
    ...btnBase,
    background: compareHover ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.1)",
    color: compareHover ? "#A5B4FC" : "#818CF8",
    border: `1px solid ${compareHover ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.3)"}`,
    transform: compareHover ? "translateY(-1px)" : "none",
    boxShadow: compareHover ? "0 4px 12px rgba(99,102,241,0.2)" : "none",
  }}
>
  <Columns2 size={14} />
  Compare
</button>;
```

- [ ] **Step 2: Verify the TypeScript build compiles cleanly**

```bash
cd /Users/nishkaldachepelly/fundsim && npx tsc --noEmit
```

Expected: no errors (exit code 0).

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: add Compare button to Header nav"
```

---

### Task 5: Build verification and push

**Files:** none (verification only)

- [ ] **Step 1: Run the full TypeScript check**

```bash
cd /Users/nishkaldachepelly/fundsim && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run the Vite build**

```bash
cd /Users/nishkaldachepelly/fundsim && npm run build
```

Expected: build succeeds, `dist/` directory updated.

- [ ] **Step 3: Push to GitHub**

```bash
cd /Users/nishkaldachepelly/fundsim && git push origin main
```

Expected: push succeeds.

- [ ] **Step 4: Deploy to Vercel**

```bash
cd /Users/nishkaldachepelly/fundsim && npx vercel --prod
```

Expected: deployment URL printed, no errors.

---

## Spec Coverage Check

| Spec requirement                                       | Task                                           |
| ------------------------------------------------------ | ---------------------------------------------- |
| Hash router: `#compare` → ComparePage, else App        | Task 3                                         |
| Two independent `useFundModelState()` calls            | Task 2                                         |
| Each panel wrapped in `FundModelContext.Provider`      | Task 1                                         |
| `activeTab` shared/synced across both panels           | Task 2                                         |
| ComparePanel renders GlobalInputs, TabBar, tab content | Task 1                                         |
| GlobalInputs collapsible, collapsed by default         | Task 1                                         |
| "← Back to Simulator" navigates to `#`                 | Task 2                                         |
| Header Compare button with Columns2 icon               | Task 4                                         |
| Fund A accent: indigo `#6366F1`                        | Task 2                                         |
| Fund B accent: emerald `#10B981`                       | Task 2                                         |
| Fund B different defaults (carry 25%, exit 2.5x, etc.) | Task 2                                         |
| Desktop 50/50 grid, mobile stacked                     | Task 2 (CSS grid `auto-fit`)                   |
| Zero changes to simulation logic                       | All tasks — only 2 new files + 2 minimal edits |
