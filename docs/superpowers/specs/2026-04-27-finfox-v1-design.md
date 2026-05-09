# FinFox v1 — Design Specification

Date: 2026-04-27
Project: FundSim (fundsimulate.com)

---

## Overview

FinFox is an AI-powered tutor and role-play counterparty embedded inside FundSim. It replaces the need for the founder to hand-hold new users through the simulators. v1 ships 5 phases in order: onboarding modal, click-to-ask chat, hover tooltips, VC guided tour, and counterparty role-play for all 3 sims (VC, PE, IB).

**Model:** `claude-haiku-4-5-20251001` for ALL FinFox API calls (cost efficiency).
**Backend:** Vercel serverless function at `/api/chat.ts`.
**API key:** `ANTHROPIC_API_KEY` in `.env` (already added, never committed).

---

## Architecture

### New files

```
/api/chat.ts                          # Vercel serverless — Anthropic proxy
                                      # POST body: { mode, messages, context }
                                      # mode: "tutor" | "founder" | "pe_seller" | "ib_client" | "breakdown"

src/components/FinFox/
  FinFoxProvider.tsx                  # React context + all state
  FinFoxMascot.tsx                    # Persistent corner fox + idle animation (CSS keyframes)
  OnboardingModal.tsx                 # Phase 1: mission card → choice gate → sim picker
  ChatPanel.tsx                       # Phase 2: slide-up ask panel + quick chips
  GuidedTour.tsx                      # Phase 4: 8-step VC tour overlay + highlight
  NegotiationPanel.tsx                # Phase 5: role-play chat + post-negotiation breakdown

src/data/finfoxGlossary.ts           # 30-term glossary (exactly as spec'd in prompt)
src/hooks/useFinFox.ts               # Convenience hook: useContext(FinFoxContext)
```

### Modified files

```
src/components/Tooltip.tsx            # Add click → opens FinFox chat pre-loaded with term
src/data/glossary.ts                  # Merge finfoxGlossary terms (keep existing PE terms)
src/components/TabBar.tsx             # Add "roleplay" tab to BOTH vc and pe tab lists; IB gets its own roleplay section
src/App.tsx                           # Wrap AppContent with <FinFoxProvider>, render <FinFoxMascot>
src/.env.example                      # ANTHROPIC_API_KEY already added
```

---

## Phase 1: Onboarding Modal

**Trigger:** First visit only. Check `localStorage.getItem('finfox_seen')`.

**Sequence (same modal, content swaps, no reload):**

1. Mission card: 3-line copy, "Continue" button
2. Choice gate: "Walk me through it" (primary) / "I'll explore on my own" (secondary)
3. If walk-through: Sim picker (VC / PE / IB) with VC tagged "Recommended for beginners"
4. If explore: Modal fades, fox shrinks to corner, bubble for 3s then fades

**localStorage written:** `finfox_seen: "true"` after choice gate.

**Settings replay:** `finfox_seen` deleted → flow restarts.

---

## Phase 2: Click-to-Ask FinFox

**Always-visible fox** in bottom-right (100×100px max), dismissible via settings (`finfox_disabled`).

**Click → chat panel slides up** (360px wide × 480px tall, ease-in-out 400ms).

**Quick chips** (3 contextual suggestions), change by `sim + screen`:

- VC captable: "What's pre-money?" / "How much equity should I take?" / "Explain dilution"
- PE lifecycle: "What's a hurdle rate?" / "Explain carry" / "What's a J-curve?"
- PE lbo: "What's a good debt ratio?" / "Explain LBO" / "What's EBITDA?"
- IB: "M&A vs IPO?" / "What are comps?" / "Explain accretion/dilution"

**System prompt (tutor mode):**

```
You are FinFox, a finance tutor for users learning on FundSim.
Current context: Sim: {sim}, Screen: {screen}, User inputs: {state_json}
Rules: Max 3 sentences. Plain English. Zero finance background assumed.
Define terms + give one concrete example using user's current numbers when possible.
If off-topic: redirect to 3 contextual finance topics.
Never say "as an AI". You are FinFox. No emojis. Ever.
```

**Model:** `claude-haiku-4-5-20251001`, max_tokens: 200.

**Caching:** `finfox_cache` in localStorage. Key = normalized question (lowercase, trimmed, punctuation stripped). Cache the top 30 common finance Q&As (listed in spec) at cold start.

**Rate limit:** 30 queries/day. Counter in `finfox_queries_YYYY-MM-DD` localStorage key.

---

## Phase 3: Jargon Hover-Tooltips

**Enhanced Tooltip component:**

- Hover (300ms delay) → one-sentence tooltip (existing behavior, dotted underline)
- Click → opens FinFox ChatPanel pre-loaded with term's longer explanation

**Glossary source:** `src/data/finfoxGlossary.ts` — 30 terms exactly as specified in the build prompt, stored as `Record<string, { short: string; long: string }>`.

**Merged into `src/data/glossary.ts`** so the existing Glossary modal also shows FinFox terms.

**Term matching in UI:** Existing `<Tooltip>` components already wrap terms throughout VCTab, GPLPEconomicsTab, DebtStructureTab, etc. Their `definition` prop becomes the `short` field. The `long` field (from finfoxGlossary) opens in FinFox chat on click.

---

## Phase 4: Guided Tour — VC Only

**Activate:** User chose "Walk me through it" → "VC" in onboarding.
**State:** `vc_tour_completed` in localStorage. "Replay tour" in settings.

**Tour UI:**

- Step counter "3 of 8"
- Continue / Back / Skip tour buttons always visible
- Fox sits in opposite corner from highlighted element
- Highlighted element: soft glow border 2px brand color (~#6366F1 for VC)
- Everything else: 20% dark overlay

**8 steps:** Exactly as specified in the build prompt (sim overview → pitch panel → valuation → check size → cap table → terms → negotiation → outcome).

**Fox corner logic:**

- Steps 1, 3, 7: top-right
- Steps 2, 4: bottom-right
- Steps 5: top-left
- Steps 6: bottom-left
- Step 8: bottom-right

**Step targeting:** Add `data-finfox="[step-name]"` attributes to elements in VCTab and TermSheetTab so the tour can `querySelector` them.

---

## Phase 5: Counterparty Role-Play — All 3 Sims

A new **"Role-Play" tab** added to each simulator. Tab ID: `roleplay` for VC and PE, `roleplay` section inside IB.

### Architecture

All 3 role-plays share `NegotiationPanel.tsx`. It receives:

```typescript
interface NegotiationConfig {
  sim: "vc" | "pe" | "ib";
  character: {
    name: string; // e.g. "Sarah Chen"
    title: string; // e.g. "CFO, Meridian Software"
    avatar: string; // emoji/letter avatar, no external images
  };
  scenario: Record<string, unknown>; // sim-specific context passed to API
  mode: "founder" | "pe_seller" | "ib_client";
}
```

Max 8 exchanges. History visible. After close/deal: FinFox steps out of character → 4-part breakdown → outcome simulation result.

---

### VC Role-Play

**FinFox plays:** Startup founder/CEO
**User plays:** Seed-stage VC investor
**Context pulled from:** TermSheetTab inputs (post-money valuation, round size, liq pref, board seats, anti-dilution, pro rata)

**API mode:** `founder`

**System prompt template:**

```
You are {founder_name}, founder/CEO of {company_name}, raising a {stage} round.
Company: ${arr} ARR, {growth}% MoM growth, ${burn}/mo burn, {runway} months runway.
You've spoken to 12 investors. You have leverage but need to close.
The user has offered: pre-money ${valuation}M, check ${check}M, {liq_pref}x {participating} liq pref,
board seat: {board}, pro rata: {pro_rata}.
Accept: 1x non-participating, single board seat at Series A+, standard pro rata.
Push back: >1x liq pref, participating preferred, multiple board seats.
Walk away: >50% dilution at seed, >2x liq pref, removal of founder vesting acceleration.
Max 2 sentences per turn. No emojis. Stay in character.
```

**Negotiation rules:** Accept/push back/walk as defined in original spec.

---

### PE Role-Play

**FinFox plays:** Target company CFO
**User plays:** PE firm partner making LBO offer
**Context pulled from:** LBOTab inputs (EBITDA, entry multiple, debt %, FCF conversion, hold period, IRR target)

**API mode:** `pe_seller`

**Scenario setup (pre-loaded):**

```
Company: {company_name}, ${ebitda}M EBITDA, {growth}% YoY growth, {sector} sector
Seller's ask: {ask_multiple}x EV/EBITDA (= ${ask_ev}M EV)
Buyer's current offer: {offer_multiple}x (= ${offer_ev}M)
Management rollover offered: {rollover}%
Earnout: {earnout}
```

**Negotiation rules:**

- Accept: Offer within 0.5x of ask multiple, management rollover ≥15%, no punitive earnout
- Push back: Offer >1x below ask, rollover <10%, leverage >6.5x EBITDA
- Walk away: Offer >2x below ask, leverage >7.5x EBITDA, no rollover

**System prompt template:**

```
You are {name}, CFO of {company_name}. A PE firm is bidding to acquire the company.
Your company has ${ebitda}M EBITDA, growing {growth}% YoY.
The board expects at least {ask_multiple}x EV/EBITDA.
The buyer has offered {offer_multiple}x.
You've had interest from 2 other sponsors.
Stay professional. Reference specific numbers. Max 2 sentences per turn. No emojis.
```

---

### IB Role-Play

**FinFox plays:** Client CFO considering hiring the user's bank for an M&A mandate
**User plays:** Investment banker pitching for the advisory mandate
**Context pulled from:** IB deal inputs (deal type, deal size, timeline, fee expectations)

**API mode:** `ib_client`

**Scenario setup (pre-loaded):**

```
Client: {company_name}, ${revenue}M revenue, looking to {sell/acquire/IPO}
Deal size estimate: ~${deal_size}M
CFO has spoken to 3 banks already
```

**Negotiation rules:**

- Accept: Retainer ≥$500K, success fee 1–2.5% (deal-size appropriate), exclusivity 6–12 months
- Push back: Success fee <0.75%, retainer <$250K, exclusivity <3 months
- Walk away: No retainer offered, success fee <0.5%, no clear process timeline

**System prompt template:**

```
You are {name}, CFO of {company_name}. You're evaluating hiring a bank to advise on {deal_type}.
Deal size is approximately ${deal_size}M.
You've already spoken to Goldman and Morgan Stanley. Your board wants a decision in 2 weeks.
You want: fair retainer, competitive success fee, experienced team, clear timeline.
The banker (user) has pitched: retainer ${retainer}, success fee {fee}%, exclusivity {months} months.
Max 2 sentences per turn. Professional but direct. No emojis.
```

---

### Post-Negotiation Breakdown (All Sims)

After deal closes or fails, FinFox breaks character:

> "Okay, stepping out of character. Here's what just happened in that negotiation:"

**4-part breakdown (separate API call, mode: `breakdown`):**

1. What you did well
2. What you missed
3. What a real [VC/PE partner/banker] would have done differently
4. What to try next

**Then:** Outcome simulation result (MOIC/IRR for VC and PE, deal score for IB) with 1-line FinFox commentary.

---

## FinFox Mascot — Visual Design

**Flat 2D SVG fox**, CSS-drawn inline:

- Simple geometric shapes (triangle ears, circular face, tail)
- Color: warm amber (#F59E0B) body, white (#F9FAFB) muzzle, dark eyes
- Matches existing site palette (no new brand colors introduced)
- 3 expression states: neutral (default), thinking (during API call), approving (after good move)
- **Idle animation:** CSS `@keyframes` — blink every 8-10s when user hasn't interacted in 30s
- **Movement:** `transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1)` for corner hops

**Size:** 64px × 64px rendered (max 100px container per spec).

---

## localStorage Keys

| Key                         | Value       | Purpose                  |
| --------------------------- | ----------- | ------------------------ |
| `finfox_seen`               | `"true"`    | Onboarding shown         |
| `finfox_disabled`           | `"true"`    | Fox hidden globally      |
| `vc_tour_completed`         | `"true"`    | VC tour done             |
| `finfox_queries_YYYY-MM-DD` | `"23"`      | Daily rate limit counter |
| `finfox_cache`              | JSON object | Cached Q&A responses     |

---

## API Endpoint — `/api/chat.ts`

```typescript
// POST /api/chat
// Body: { mode: string, messages: Message[], context: Record<string, unknown> }
// Returns: { content: string }
// Uses: claude-haiku-4-5-20251001, max_tokens varies by mode
// Auth: ANTHROPIC_API_KEY env var (never exposed client-side)
```

**Max tokens by mode:**

- `tutor`: 200
- `founder` / `pe_seller` / `ib_client`: 150 (short negotiation turns)
- `breakdown`: 600 (4-part analysis)

---

## Settings Panel Additions

- "Hide FinFox" toggle → sets `finfox_disabled`, fox disappears
- "Replay intro" → deletes `finfox_seen`, reloads modal
- "Replay VC tour" → deletes `vc_tour_completed`

---

## Testing Checklist

- [ ] Fresh-incognito visitor sees mission card on first load
- [ ] Returning visitor skips mission card
- [ ] "Replay intro" re-triggers flow
- [ ] Click-to-ask responds < 3s for cached, < 8s for API questions
- [ ] Hover tooltips on all 30 glossary terms
- [ ] Click on term opens FinFox with longer explanation
- [ ] VC guided tour: all 8 steps, fox corner-hops correctly
- [ ] "Skip tour" works at every step
- [ ] VC role-play: founder pushes back on >25% dilution at seed
- [ ] VC role-play: founder accepts 1x non-participating liq pref
- [ ] PE role-play: CFO pushes back when offer is >1x below ask multiple
- [ ] IB role-play: CFO walks when no retainer is offered
- [ ] Post-negotiation breakdown references specific transcript moments
- [ ] Settings: "Hide FinFox" removes fox completely
- [ ] Rate limit kicks in at 30 queries/day
- [ ] No emojis anywhere in FinFox output
- [ ] FinFox never says "as an AI" during role-play
- [ ] All non-breakdown responses ≤ 3 sentences
- [ ] Haiku model used for all API calls (verify in network tab)
