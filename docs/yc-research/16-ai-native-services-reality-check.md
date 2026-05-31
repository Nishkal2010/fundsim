# AI-Native Services for a Solo, Faceless, Minor Founder: A Brutal Reality Check

> Question: Is YC's "AI-Native Services" thesis (sell the *outcome/service*, AI does the work — NOT software) winnable by a SOLO founder who is a minor, faceless, has no capital, no team, and no industry network — whose only real edge is shipping polished interactive web tools + AI pipelines fast? Or is it structurally a trap?
>
> Date: 2026-05-31. All claims grounded in 2025–2026 evidence with citations. This is a skeptical assessment, not a pitch. Read the VERDICT and the CHECKLIST at the end.

---

## TL;DR — The hard truth

**Verdict: NO for the thesis as YC actually means it. ONLY-IF for a narrow, de-risked sliver — and that sliver is barely "services" anymore; it's a productized self-serve tool wearing a "done-for-you" label.**

The AI-native-services (AINS) thesis is real and well-capitalized, but every signal points the same way: the version YC is funding is a *firm* — licensed professionals, ops headcount, enterprise trust, and venture capital — not a faceless solo minor. The thesis explicitly trades software's #1 advantage (no liability for the customer's outcome, infinite self-serve scale) for services' #1 disadvantage (you own the outcome, you're liable, and trust is the gate). Those are precisely the two areas where a faceless solo minor is *weakest*. You'd be running *toward* your disadvantages.

The three reasons, up front:

1. **The poster children are firms with teams and $20M+ raises, not solos.** YC's own flagship AINS company, Crosby ("AI law firm"), has raised ~$25.8M–$80M and is a *staffed law firm with licensed lawyers*; HappyRobot (a16z/YC AINS logistics) has ~114 employees and $62M raised. None are solo. ([TechCrunch](https://techcrunch.com/2025/06/17/sequoia-backed-crosby-launches-a-new-kind-of-ai-powered-law-firm/); [Inforcapital — Crosby $60M B](https://inforcapital.com/news/crosby-raises-60m-series-b-to-scale-ai-powered-law-firm/); [EU-Startups — HappyRobot](https://www.eu-startups.com/2025/09/spains-happyrobot-raises-e37-7-million-to-build-a-digital-workforce-for-the-real-economy/))
2. **When you sell the outcome you sell the liability — and the insurance market is actively walling AI off.** As of **Jan 1, 2026**, Verisk's standardized AI exclusion endorsements (CG 40 47 / CG 40 48) let E&O/D&O carriers exclude generative-AI losses; Philadelphia Insurance and Hamilton Select exclude AI from E&O *entirely*; carve-backs require a documented governance program with "licensed professional sign-off." A faceless minor cannot sign, cannot be licensed, and cannot underwrite a refund/lawsuit. ([Gridex on CG 40 47](https://gridex.dev/blog/verisk-ai-exclusions/); [FinancialContent](https://markets.financialcontent.com/stocks/article/marketersmedia-2026-5-7-e-and-o-coverage-and-ai-design-work-what-firms-need-to-know-in-2026); [Risk & Insurance](https://riskandinsurance.com/traditional-insurance-leaves-enterprises-exposed-as-ai-liability-claims-surge/))
3. **YC's own AINS verticals are regulated and trust-gated.** YC names insurance brokerage, accounting/tax/audit, compliance, and healthcare administration — every one requires a licensed human in the loop and relationship-based enterprise sales. YC's own thesis author says you need "real domain expertise (or a co-founder who has it)" and to "handle compliance, licensing, and customer trust in regulated workflows." That is a team-and-credentials business by definition. ([YC RFS](https://www.ycombinator.com/rfs); [ai-native-agency.com on Epstein](https://ai-native-agency.com/blog/yc-ai-native-agency))

The honest alternative for this founder — a **productized self-serve software tool with a paid layer** — is strictly better on every axis that matters to a faceless solo minor: no outcome liability, no licensing, infinite scale, no human sales, and (per indie-SaaS data) *higher* margins (90–95% vs ~70% for an AI-native agency). The services framing romanticizes a harder business. ([SoloSoft/Fluxio margin table](https://www.solosoft.dev/trends/solo-company-ai-trend-2026/); [Freemius State of Micro-SaaS 2025](https://freemius.com/blog/state-of-micro-saas-2025/))

---

## 1. What real AI-native-services companies actually look like under the hood

**They are firms, not solo projects. They hire humans-in-the-loop. They raise real money.**

The defining feature of an AINS company is that **human-in-the-loop labor is part of the product** — it sits in COGS, not opex, because *service delivery is the core product*. Emergence Capital's AINS playbook is explicit: "inference costs, model API spend, and human-in-the-loop labor all belong [in COGS]... since this is a service, they are absolutely COGS." The red flag they flag is "gross margin flat or declining as revenue grows." Best-case AINS runs at "50%+ gross margins" — i.e. *below* SaaS, not at SaaS levels. ([Emergence — AI-Native Services Playbook](https://www.emcap.com/thoughts/the-ai-native-services-playbook); [Emergence — Why AI-Native Services](https://www.emcap.com/thoughts/why-ai-native-services-and-why-now))

Concrete 2024–2026 examples (the ones YC/top VCs actually cite as the category):

| Company | What it sells | Funding | Headcount | Solo? |
|---|---|---|---|---|
| **Crosby** ("AI law firm", Cursor/etc. clients) | Contract review *as a service*, ~$400/contract fixed fee | Seed $5.8M (Sequoia) → Series A $20M (Index) → Series B $60M (Lux/Index); ~$25.8M–$80M total | Staffed **law firm with licensed lawyers** | No |
| **HappyRobot** (YC/a16z, logistics AI workforce) | AI "workers" running carrier ops for DHL, Ryder, Schneider, Werner | ~$62M over 3 rounds; €37.7M Series B (Base10) | **~114 employees** | No (founder *trio*) |

([Crosby pricing/model — Upstarts](https://www.upstartsmedia.com/p/crosby-ai-law-firm-raises-20-million); [Sacra — Crosby](https://sacra.com/c/crosby/); [HappyRobot — Tracxn](https://tracxn.com/d/companies/happyrobot/__tpvjXC1ztQVCcmwI5nABkYY6mAzlVf0z6lPp3kO-tjk/funding-and-investors); [YC LinkedIn — HappyRobot 10x revenue](https://www.linkedin.com/posts/y-combinator_happyrobot-is-building-the-digital-workforce-activity-7369504550937878531-bwWu))

Even the "lean AI-native" benchmarks confirm a *team*, not a solo: AI-native startups reportedly hit ~$10M ARR with **8–12 people** and ~$50M ARR with **25–30**, and AI-first companies at Series A/B run a **median ~73 employees** (34% leaner than peers, but not one person). ([Advertising Week](https://advertisingweek.com/the-ai-native-startup-why-your-next-10m-round-wont-triple-your-headcount/); [Ravio](https://ravio.com/blog/ai-native-startup-hiring))

**Are any actually SOLO?** The genuinely solo AI success stories that surface (Dana Snyder / Positive Equation ~$1.5M in a month; "Connor" ~$2M ARR; Chris Lee $6K/mo) are **software subscriptions or freelance automation — NOT outcome-sold services with owned liability.** The model that worked for them is "the product sells itself... customers buy without the founder in the loop" — which is the *software* model, not the services model. The one-person AINS firm is not in the evidence. ([Fortune — solo founders' limits](https://fortune.com/2026/05/18/solo-founders-ai-automation-entire-teams-entrepreneurs/); search-surfaced solo cases via [orbilontech](https://orbilontech.com/ai-automation-1b-one-person-company/))

**Takeaway:** Under the hood, AINS = a small team that *includes* the human reviewers/ops who catch the AI's mistakes, plus capital to fund payroll-in-COGS and the sales motion. The architecture itself assumes more than one human.

---

## 2. The "services trap" — how much does AI actually remove vs. just shift?

**It shifts the work; it does not delete it.** The historical services curse (low margin, linear scaling, ops drag, relationship sales) is *softened* by AI but the residue lands exactly where a solo has no slack.

What practitioners running AI agencies/services in 2025–26 report breaking:

- **Fulfillment, not sales, is the bottleneck.** "Agencies' number one pain point isn't lead generation — it's the fulfillment bottleneck, where they can win clients but can't scale the work to serve them." AI moves the constraint but doesn't remove it. ([Fountain City](https://fountaincity.tech/resources/blog/future-of-digital-agencies-agentic-ai/); [Kilo](https://kilo.ai/articles/scale-agency-ai-agents))
- **Reliability is still beta.** "Even the best offerings from OpenAI and Anthropic carry 'beta' labels... startups integrating agents often find they need significant hand-holding and fail-safes." Fewer than **1 in 4** orgs have scaled agents to production; only **1 in 5** has a mature governance model. Someone has to be that fail-safe — and for a solo, that someone is you, 24/7. ([AI2 Incubator](https://www.ai2incubator.com/articles/insights-15-the-state-of-ai-agents-in-2025-balancing-optimism-with-reality); [IBM](https://www.ibm.com/think/insights/ai-agents-2025-expectations-vs-reality))
- **The hallucination floor is high where it matters.** Stanford research puts general-purpose tool hallucination at **58–88%**, and even "legal-grade" tools at **20–33%** error rates. If you *sold the outcome*, every one of those is your refund/lawsuit, not the customer's problem. ([via Stanford-cited search summary](https://riskandinsurance.com/traditional-insurance-leaves-enterprises-exposed-as-ai-liability-claims-surge/))
- **The margin doesn't actually expand.** The honest practitioner consensus: "revenue goes up while margin stays flat... growth feels good until you look at the bank account." AI-wrapper businesses cluster at **25–35% margins** vs 70–85% for real SaaS, and **~90% of AI-wrapper startups are projected to fail by 2026** with 60–70% making zero revenue. ([margin trap — AIfire summary](https://www.aifire.co/p/the-ai-agent-business-model-is-a-trap-here-s-what-works); [Freemius](https://freemius.com/blog/state-of-micro-saas-2025/))
- **Token/inference cost erodes the unit economics at scale** — the more volume you take, the worse it can get if pricing is fixed-per-outcome. ([Kong](https://konghq.com/blog/enterprise/ai-cost-management-stopping-margin-erosion); [SaaS CFO](https://www.thesaascfo.com/your-ai-feature-is-quietly-destroying-your-gross-margin/))

**Net:** AI removes ~30–60% of the *rote production* in a service, but it *amplifies* the QA/edge-case/angry-customer load and keeps scaling sub-linear-to-headcount unless you have people to manage exceptions. For a solo, "managing the AI + QA + edge cases + angry customers" *is the whole job* once you have more than a handful of clients — and it does not compress into nights and weekends.

---

## 3. Accountability & liability — the dealbreaker for a faceless minor

This is where the thesis structurally collides with this specific founder.

**Selling the outcome = owning the liability.** When you sell a *tool*, the customer applies judgment and owns the result. When you sell the *outcome* ("we'll do your contracts / your books / your filings"), you are the professional on the hook. And the 2025–2026 insurance market is *retreating* from exactly this risk:

- **Verisk's standardized generative-AI exclusions (CG 40 47 / CG 40 48) took effect Jan 1, 2026**, giving carriers turnkey language to exclude GenAI losses from D&O, **E&O**, and fiduciary policies — explicitly naming ChatGPT, Bard, Midjourney, DALL-E. ([Gridex](https://gridex.dev/blog/verisk-ai-exclusions/); [IndependentAgent.com](https://www.independentagent.com/vu_resource/verisk-to-roll-out-new-general-liability-exclusions-for-generative-ai-exposures/))
- **Carriers are excluding AI from E&O entirely** (Philadelphia Insurance, Hamilton Select) or filing to (AIG, Great American, W.R. Berkley). ([FinancialContent](https://markets.financialcontent.com/stocks/article/marketersmedia-2026-5-7-e-and-o-coverage-and-ai-design-work-what-firms-need-to-know-in-2026))
- **1 in 5 commercial insurers reported an AI loss in 2025; only ~half were fully covered.** US GenAI lawsuits passed **700 by early 2025**, up ~978% since 2021. ([Risk & Insurance](https://riskandinsurance.com/traditional-insurance-leaves-enterprises-exposed-as-ai-liability-claims-surge/); [Sequoia](https://www.sequoia.com/2026/02/ai-risk-business-liability-insurance/))
- **The only carve-back path requires what a minor cannot supply:** carriers negotiate coverage back only "for supervised AI use... documenting an internal AI governance program covering tool approval, verification steps, client disclosure, and **licensed professional sign-off**." ([FinancialContent](https://markets.financialcontent.com/stocks/article/marketersmedia-2026-5-7-e-and-o-coverage-and-ai-design-work-what-firms-need-to-know-in-2026); E&O-for-AI products require ongoing model-quality assessments — [Relm](https://relminsurance.com/tech-eo-for-ai-products-what-it-covers-hallucinations-model-errors-bad-advice-ip-and-training-data-and-contractual-liability/))

**Practically, for a faceless solo minor:**
- **Can't get standard E&O** for AI-driven professional outcomes without a governance program and licensed sign-off, both of which require credentialed humans.
- **Refund/chargeback exposure is personal.** No corporate insurance backstop means a single bad batch of outputs to a paying client is your money and your reputation.
- **A minor can't personally sign contracts/indemnities** that aren't voidable; you'd need an adult signer/guardian on every customer agreement (the same structure the cross-cutting research flags for incorporation). That's friction on *every deal* in a business where the whole point is doing the client's work for them.
- **"Faceless" is fatal for an outcome business.** Outcome buyers are buying *accountability*. An anonymous provider with no name behind the work is the exact opposite of what a customer paying you to be liable wants. Faceless works for a *self-serve tool* (nobody needs to trust "you" to try a $20/mo app); it does not work when "I" am the one promising your books are right.

---

## 4. Distribution reality — can AINS be sold faceless/self-serve?

**Mostly no, in the verticals YC names.** The higher the stakes of the outcome, the more human trust the sale requires.

- **Trust is the gate, and trust is human.** "No matter how sophisticated AI becomes, it can't replace the moment of belief — the point where someone decides to trust you... buyers still want to speak with individuals who understand their business challenges." Complex, budget-and-reputation-risk B2B deals "reliably close" only through human-to-human relationships. ([MarTech](https://martech.org/ai-can-scale-sales-but-it-cant-build-trust/); [Crunchbase News](https://news.crunchbase.com/ai/b2b-sales-human-interaction-landsman-sharebite/))
- **The poster children sell relationally.** Crosby works *with named startups* (Cursor, etc.), Slack-native, with lawyers in the loop — i.e. high-touch, credentialed, relationship-led. HappyRobot lands DHL/Ryder/Schneider — enterprise logos won by a sales org, not a self-serve funnel. ([LTC Foundry — Crosby](https://www.ltcfoundry.com/post/crosby-building-an-ai-first-law-firm))
- **The YC thesis itself bakes in trust.** Epstein: the winners "combine the trust and relationships of an established player with the delivery efficiency of an AI-native challenger." A faceless solo minor has zero of the first half. ([ai-native-agency.com](https://ai-native-agency.com/blog/yc-ai-native-agency))

**Where faceless/self-serve *can* work:** only for **low-stakes, low-trust-required, productized outputs** where the buyer self-qualifies and the "outcome" is cheap enough that a bad result is an annoyance, not a lawsuit (e.g., a $9 "generate my X" that the user reviews before using). At that point you have essentially rebuilt a self-serve software product with a "done-for-you" wrapper — which loops back to Section 6.

---

## 5. The honest conditions for a solo win

There *is* a narrow lane. It is real but small, and it requires deliberately stripping out everything that makes "services" hard. A solo technical founder can win in AINS-flavored businesses **only if ALL of the following hold simultaneously:**

1. **Low-stakes output.** A wrong result costs the customer minutes/dollars, not their job, money, health, or legal standing. (Kills: legal, tax, accounting, compliance, healthcare, insurance — i.e. *every vertical YC named*.)
2. **No regulated/licensed work.** No deliverable that legally requires a licensed professional's sign-off (no filing, no advice, no audit). ([Thomson Reuters — expert-in-the-loop is the guardrail](https://tax.thomsonreuters.com/blog/how-to-develop-an-ai-tax-compliance-strategy/))
3. **Async, self-serve delivery.** Customer submits → pipeline runs → output returns, with no live human SLA. No real-time on-call, no "the AI broke at 2am and the client is furious."
4. **The customer reviews before relying.** They are the human-in-the-loop, so the liability stays with them — you provide a *draft/asset*, not a *certified outcome*. (This is the legal line between "tool" and "service.")
5. **Narrow, productized scope.** One repeatable job, one output format, fixed price. No bespoke scoping, no account management. Edge cases are *refused*, not absorbed.
6. **A proprietary workflow/data moat**, not a raw model wrapper — otherwise you're in the 90%-fail, 25–35%-margin wrapper bucket. ([Freemius](https://freemius.com/blog/state-of-micro-saas-2025/))
7. **An adult signer/guardian structure** already in place for contracts, Stripe, and any indemnity, because a minor's signature is voidable. (Consistent with doc 13's incorporation guidance.)
8. **B2B prosumer / SMB self-serve**, not enterprise — because enterprise = human sales + procurement + security review that a faceless solo can't staff.

If even one of these fails, it becomes a team-and-capital slog. Note the brutal implication: the lane that survives all eight filters is **a self-serve productized tool that happens to deliver a finished artifact** — which is software with a services *label*, not the YC AINS thesis as written.

---

## 6. Honest comparison: AINS vs. a productized self-serve SOFTWARE tool

For *this* founder (solo, faceless, minor, no capital/team/network, edge = shipping polished web tools + AI pipelines fast), the software path dominates on every load-bearing axis:

| Axis | AINS (sell the outcome) | Productized self-serve software + paid layer |
|---|---|---|
| **Outcome liability** | Yours. E&O exclusions hitting Jan 2026; carve-back needs licensed sign-off you can't give. | Customer's. They apply judgment to your tool. |
| **Licensing** | Required in YC's named verticals. | None. |
| **Trust to sell** | High; human/relationship-led; faceless is fatal. | Low; a good free tool earns trial without trusting "you." |
| **Distribution** | Sales motion, often enterprise. | Organic / self-serve — *this founder's proven strength (FundSim traffic).* |
| **Scaling** | Sub-linear without ops headcount; you are the fail-safe 24/7. | Near-zero marginal cost per user. |
| **Gross margin** | ~70% (AI-native agency) to "50%+" best case. | 90–95% (SaaS / AI software). ([SoloSoft](https://www.solosoft.dev/trends/solo-company-ai-trend-2026/)) |
| **Minor-specific friction** | Adult signer on *every* client contract + indemnity. | Adult only on the entity/Stripe account once. |
| **Evidence of solo wins** | Effectively none (all examples are teams + capital). | Many (≈45–50% of indie SaaS is solo-founded). ([Freemius](https://freemius.com/blog/state-of-micro-saas-2025/)) |

The one *legitimate* edge of services — "you can charge 100x by selling the finished product instead of the tool" (Epstein) — is exactly the edge that detonates the liability and trust problems for a faceless minor. The pragmatic move that the margin data itself endorses is the reverse of the romantic one: **"start with services/consulting (70–80%) to learn real needs, then productize repeatable workflows into SaaS to push margin toward 95%."** A solo minor should skip straight to the productized software endpoint and use *services-style positioning* ("it does the work for you") only as marketing copy on a self-serve tool — capturing the framing's appeal without taking on its liabilities. ([ai-native-agency.com](https://ai-native-agency.com/blog/yc-ai-native-agency); [SoloSoft margin path](https://www.solosoft.dev/trends/solo-company-ai-trend-2026/))

---

## VERDICT

**Winnable solo by a faceless minor as YC means it (regulated, outcome-owned, trust-sold services)? NO.** The economics assume a team (humans-in-the-loop in COGS), the verticals require licensing, the sale requires human trust, and the 2026 insurance market makes owning AI outcomes uninsurable without credentialed sign-off you cannot provide. Every poster child is a funded firm, not a solo. You would be deliberately running into your three biggest weaknesses (no trust, no team, can't be liable).

**ONLY-IF a narrow, de-risked sliver:** low-stakes, unregulated, async, self-serve, customer-reviews-before-relying, narrow productized scope, proprietary workflow, adult-signer structure, SMB/prosumer. But that sliver is functionally **a self-serve software tool with a "done-for-you" label** — at which point you've left the thesis and arrived at the better business.

**Recommendation:** Build the **productized self-serve software tool** (your actual strength and FundSim-validated distribution), monetize a paid layer, and *position* it with outcome language. Do not take on outcome liability, licensing, or human enterprise sales as a faceless solo minor. The services framing romanticizes a strictly harder business for this founder.

---

## CHECKLIST — a vertical/idea is solo-viable ONLY IF it passes ALL of these

- [ ] **Low-stakes output** — a wrong result is an annoyance, not a lawsuit/job loss/health/legal harm.
- [ ] **No license required** — no deliverable that legally needs a credentialed professional's sign-off.
- [ ] **Async & self-serve** — no live SLA, no 2am on-call, no account management.
- [ ] **Customer is the human-in-the-loop** — they review/apply judgment before relying; you ship a draft/asset, not a certified outcome (keeps liability with them).
- [ ] **Narrow, fixed, productized scope** — one job, one output, one price; edge cases refused, not absorbed.
- [ ] **Proprietary workflow/data moat** — not a thin model wrapper (avoid the 90%-fail / 25–35%-margin trap).
- [ ] **Faceless-compatible trust** — buyer will try it from the artifact quality alone, without needing to trust a named person.
- [ ] **SMB / prosumer self-serve GTM** — not enterprise procurement/security review.
- [ ] **Adult signer/guardian structure** in place for entity, Stripe, and any contract/indemnity (minor signatures are voidable).
- [ ] **Inference cost < price at volume** — unit economics survive scale (no fixed-price-per-outcome margin erosion).

**If it fails even one box, it is a team-and-capital business — not a solo-faceless-minor business. Pass on it.**

---

### Sources
- [Emergence Capital — The AI-Native Services Playbook](https://www.emcap.com/thoughts/the-ai-native-services-playbook) · [Why AI-Native Services, and Why Now](https://www.emcap.com/thoughts/why-ai-native-services-and-why-now)
- [YC Requests for Startups](https://www.ycombinator.com/rfs) · [ai-native-agency.com — Epstein / YC thesis](https://ai-native-agency.com/blog/yc-ai-native-agency) · [The VC Corner — S26 RFS](https://www.thevccorner.com/p/yc-summer-2026-requests-for-startups-ideas)
- [TechCrunch — Crosby launch](https://techcrunch.com/2025/06/17/sequoia-backed-crosby-launches-a-new-kind-of-ai-powered-law-firm/) · [Upstarts — Crosby $20M A](https://www.upstartsmedia.com/p/crosby-ai-law-firm-raises-20-million) · [Inforcapital — Crosby $60M B](https://inforcapital.com/news/crosby-raises-60m-series-b-to-scale-ai-powered-law-firm/) · [Sacra — Crosby](https://sacra.com/c/crosby/)
- [EU-Startups — HappyRobot €37.7M](https://www.eu-startups.com/2025/09/spains-happyrobot-raises-e37-7-million-to-build-a-digital-workforce-for-the-real-economy/) · [Tracxn — HappyRobot](https://tracxn.com/d/companies/happyrobot/__tpvjXC1ztQVCcmwI5nABkYY6mAzlVf0z6lPp3kO-tjk/funding-and-investors) · [YC — HappyRobot 10x](https://www.linkedin.com/posts/y-combinator_happyrobot-is-building-the-digital-workforce-activity-7369504550937878531-bwWu)
- [Advertising Week — AI-native headcount](https://advertisingweek.com/the-ai-native-startup-why-your-next-10m-round-wont-triple-your-headcount/) · [Ravio — AI-native hiring](https://ravio.com/blog/ai-native-startup-hiring)
- [Fortune — solo founders' limits](https://fortune.com/2026/05/18/solo-founders-ai-automation-entire-teams-entrepreneurs/)
- [Fountain City — agentic agency fulfillment bottleneck](https://fountaincity.tech/resources/blog/future-of-digital-agencies-agentic-ai/) · [Kilo — scaling agency with agents](https://kilo.ai/articles/scale-agency-ai-agents) · [AIfire — "AI agent business model is a trap"](https://www.aifire.co/p/the-ai-agent-business-model-is-a-trap-here-s-what-works)
- [AI2 Incubator — state of AI agents 2025](https://www.ai2incubator.com/articles/insights-15-the-state-of-ai-agents-in-2025-balancing-optimism-with-reality) · [IBM — agents expectations vs reality](https://www.ibm.com/think/insights/ai-agents-2025-expectations-vs-reality)
- [Kong — agentic AI cost/margin erosion](https://konghq.com/blog/enterprise/ai-cost-management-stopping-margin-erosion) · [SaaS CFO — AI feature gross margin](https://www.thesaascfo.com/your-ai-feature-is-quietly-destroying-your-gross-margin/)
- [Gridex — Verisk CG 40 47 AI exclusions](https://gridex.dev/blog/verisk-ai-exclusions/) · [IndependentAgent.com — Verisk GenAI exclusions](https://www.independentagent.com/vu_resource/verisk-to-roll-out-new-general-liability-exclusions-for-generative-ai-exposures/) · [FinancialContent — E&O & AI 2026](https://markets.financialcontent.com/stocks/article/marketersmedia-2026-5-7-e-and-o-coverage-and-ai-design-work-what-firms-need-to-know-in-2026)
- [Risk & Insurance — AI liability claims surge](https://riskandinsurance.com/traditional-insurance-leaves-enterprises-exposed-as-ai-liability-claims-surge/) · [Sequoia — AI risk & business liability](https://www.sequoia.com/2026/02/ai-risk-business-liability-insurance/) · [Relm — Tech E&O for AI products](https://relminsurance.com/tech-eo-for-ai-products-what-it-covers-hallucinations-model-errors-bad-advice-ip-and-training-data-and-contractual-liability/)
- [MarTech — AI can scale sales but not trust](https://martech.org/ai-can-scale-sales-but-it-cant-build-trust/) · [Crunchbase News — B2B trust](https://news.crunchbase.com/ai/b2b-sales-human-interaction-landsman-sharebite/)
- [Thomson Reuters — AI tax compliance / expert-in-the-loop](https://tax.thomsonreuters.com/blog/how-to-develop-an-ai-tax-compliance-strategy/)
- [Freemius — State of Micro-SaaS 2025](https://freemius.com/blog/state-of-micro-saas-2025/) · [SoloSoft — solo company AI trend 2026 (margin table)](https://www.solosoft.dev/trends/solo-company-ai-trend-2026/)
