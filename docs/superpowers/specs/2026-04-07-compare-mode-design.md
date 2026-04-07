# FundSim Compare Mode — Design Spec

> Created: 2026-04-07

## Overview

Add a side-by-side Compare Mode to FundSim. Users navigate to a dedicated compare page where two fully independent fund models run in parallel — each with its own sliders and all 4 analysis tabs. Tabs are synced across both panels. Zero changes to any simulation logic.

---

## Goals

- Let analysts, students, and curious users compare two fund configurations live
- Keep the existing single-fund experience completely unchanged
- Reuse all existing components with no modifications

---

## Architecture

### Routing

Hash-based, no library required:

- `window.location.hash === ''` → render existing `<App />` (unchanged)
- `window.location.hash === '#compare'` → render `<ComparePage />`

`main.tsx` is the only existing file that changes — it wraps the render in a 3-line hash router component.

### State

Two independent `FundModel` instances created by calling `useFundModelState()` twice inside `ComparePage`. Each is scoped to its panel via `FundModelContext.Provider`. All existing components (`GlobalInputs`, tab components, charts) read from whichever context wraps them — no changes needed.

```
ComparePage
├── modelA = useFundModelState()
├── modelB = useFundModelState()
├── activeTab (shared state, synced across panels)
│
├── FundModelContext.Provider value={modelA}  →  ComparePanel (Fund A)
└── FundModelContext.Provider value={modelB}  →  ComparePanel (Fund B)
```

---

## New Files

### `src/components/ComparePage.tsx`

- Calls `useFundModelState()` twice
- Holds `activeTab` state (default: `'lifecycle'`)
- Renders page header ("← Back", "Compare Mode" title)
- Renders two `<ComparePanel>` side by side (CSS grid, `grid-cols-2` on desktop, `grid-cols-1` on mobile)
- Passes `activeTab` and `onTabChange` to both panels

### `src/components/ComparePanel.tsx`

Props: `model: FundModel`, `label: 'Fund A' | 'Fund B'`, `color: string`, `activeTab: TabId`, `onTabChange: (tab: TabId) => void`

- Wraps children in `<FundModelContext.Provider value={model}>`
- Renders a colored panel header with label
- Renders `<GlobalInputs />` inside a collapsible section (collapsed by default, toggled by "⚙ Settings" button)
- Renders `<TabBar active={activeTab} onChange={onTabChange} />`
- Renders the active tab component (`<FundLifecycleTab />`, `<JCurveTab />`, `<WaterfallTab />`, or `<PerformanceTab />`)

---

## Existing File Changes

### `main.tsx` — minimal routing wrapper

```tsx
// Before:  createRoot(...).render(<App />)
// After:   createRoot(...).render(<Root />)
//
// Root checks window.location.hash and listens for hashchange events.
// Renders <App /> or <ComparePage /> accordingly.
```

Only the root render call changes. `App` itself is untouched.

### `Header.tsx` — add Compare button

One button added to the right side of the nav (next to the Glossary button):

- Icon: `Columns2` from lucide-react
- Label: "Compare"
- Action: `window.location.hash = '#compare'`
- Styled identically to the existing Glossary button

---

## UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Simulator                Compare Mode            │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────┬────────────────────────────────────┐
│  ■ Fund A (indigo)       │  ■ Fund B (emerald)               │
├─────────────────────────┼────────────────────────────────────┤
│  ⚙ Settings ▼           │  ⚙ Settings ▼                     │
│  [GlobalInputs hidden]  │  [GlobalInputs hidden]            │
├─────────────────────────┼────────────────────────────────────┤
│  Lifecycle J-Curve      │  Lifecycle J-Curve                 │
│  Waterfall  Performance │  Waterfall  Performance            │
│  ← synced →             │  ← synced →                        │
├─────────────────────────┼────────────────────────────────────┤
│  [Chart/Table content]  │  [Chart/Table content]            │
└─────────────────────────┴────────────────────────────────────┘
```

- Desktop (≥1024px): 50/50 grid with a 1px divider
- Mobile (<1024px): stacked vertically, Fund A on top
- Panel background matches existing dark theme (`#111827` / `#0A0F1C`)
- Fund A accent: indigo (`#6366F1`) — matches existing app palette
- Fund B accent: emerald (`#10B981`) — distinct, already used in quartile scale

---

## Default Inputs

Fund A starts with the existing `defaultInputs` so users recognise the familiar baseline.

Fund B starts with meaningfully different defaults to make the comparison immediately interesting:

| Parameter       | Fund A (default) | Fund B   |
| --------------- | ---------------- | -------- |
| carryPercentage | 20%              | 25%      |
| avgExitMultiple | 3.0x             | 2.5x     |
| lossRatio       | 30%              | 35%      |
| managementFee   | 2%               | 2.5%     |
| waterfallType   | european         | american |

---

## Collapsible Settings

`GlobalInputs` is wrapped in a disclosure pattern inside `ComparePanel`:

- Default state: **collapsed** (maximises chart space)
- Toggle button: `⚙ Fund Settings  ▼` / `⚙ Fund Settings  ▲`
- Animated open/close using existing framer-motion (already a dependency)
- When collapsed, only the panel header and tabs are visible

---

## Navigation Flow

```
Existing App
    │
    ├── User clicks "Compare" button in Header
    │       window.location.hash = '#compare'
    │
    ▼
Compare Page
    │
    ├── User clicks "← Back to Simulator"
    │       window.location.hash = ''
    │
    ▼
Existing App (state preserved — App never unmounts fully)
```

---

## Out of Scope

- Saving / naming scenarios
- Exporting comparison to PDF
- More than 2 panels
- Sharing a comparison via URL (fund settings not encoded in URL)
- Any changes to server, auth, or calculation logic

---

## Files Summary

| File                              | Action                               |
| --------------------------------- | ------------------------------------ |
| `src/components/ComparePage.tsx`  | **New**                              |
| `src/components/ComparePanel.tsx` | **New**                              |
| `src/main.tsx`                    | Edit — hash router (3 lines)         |
| `src/components/Header.tsx`       | Edit — add Compare button (1 button) |
| Everything else                   | **Untouched**                        |
