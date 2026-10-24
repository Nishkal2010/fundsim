# AI-Native Service Companies — Landscape Briefing

*Research date: 2026-05-31. Thesis source: YC Requests for Startups (Summer 2026), "AI-native service companies" — Gustaf Alströmer.*

## The thesis in one paragraph

YC wants companies that **do the work**, not companies that sell software to help people do the work. Instead of selling an insurance brokerage a tool, you *become the broker*. The argument rests on two structural facts: (1) spend on **services** is many multiples larger than spend on **software**, and (2) most of these services are already outsourced, so replacing an outsourced provider is structurally easier than ripping out installed software. The kicker is margin arbitrage: traditional service firms trade at ~1–2x revenue while software trades at ~8–12x; if you can run an accounting firm with one accountant and ten AI agents, you've built a software-margin business inside a service wrapper. The progression YC sketches: services → SaaS → AI copilots → **AI-native services** (the customer buys the *result*, not seats). Named flagship verticals: insurance brokerage, accounting/tax/audit, compliance, healthcare administration, and legal (YC cites Crosby/"Lexi"-style AI law firms).
Sources: [VC Cafe — AI-Native Services playbook](https://www.vccafe.com/2026/05/06/ai-native-services-the-new-startup-playbook/), [YC RFS](https://www.ycombinator.com/rfs), [VC Corner RFS breakdown](https://www.thevccorner.com/p/yc-summer-2026-requests-for-startups-ideas).

---

## 1. Flagship regulated verticals

### Insurance brokerage
- **Services spend:** US commercial P&C brokerage commissions are tens of billions/yr; the SMB commercial segment Harper targets is highly fragmented across thousands of independent agencies.
- **Who's already funded:**
  - **Harper** (YC W25) — "almost fully autonomous licensed commercial insurance agency." Raised **$47M combined seed + Series A** (Feb 2026), led by **Emergence Capital** (w/ YC, Peak XV, Antler, 10X Founders, Fellows Fund, Outset). 5,000+ businesses served in 13 months, 160+ carrier appointments, quote turnaround cut from 5–7 days to 1–2. [TechCrunch](https://techcrunch.com/2026/02/25/ai-insurance-brokerage-harper-raises-45m-series-a-and-seed/), [Harper](https://www.harperinsure.com/news/series-a-announcement), [Emergence](https://www.emcap.com/thoughts/harper-building-the-ai-native-insurance-brokerage-every-business-deserves)
  - **Panta** (YC 2025, Vincent Chen & Frank Wang) — AI-native commercial insurance brokerage. [YC](https://www.ycombinator.com/companies/panta)
- **Regulation/license — HIGH:** Must hold a state **insurance producer/broker license** in every state of operation (per-state exams, appointments with each carrier), often a **surety bond** (CA $10k, NC $15k, IL up to $50k), and **E&O insurance** is required by virtually every carrier appointment agreement. Licenses can be held by an individual producer who is the "designated responsible licensed person" for the entity. [Coverage Criteria](https://coveragecriteria.com/articles/insurance-agent-license-requirements), [BOSS Bonds](https://blog.bossbonds.com/boss-bonds-blog/insurance-broker-bonds-what-they-are-and-which-states-require-them)
- **White space:** Verticalized commercial lines beyond Harper's GL/WC/professional liability — surety/bonds, marine, cyber, captive/program business, employee benefits brokerage, and reinsurance placement. Also personal lines (auto/home) AI agencies.

### Accounting / tax / audit
- **Services spend:** Global accounting/bookkeeping/tax services is a multi-hundred-billion-dollar market; US outsourced bookkeeping + tax prep alone is tens of billions.
- **Who's already funded:**
  - **Basis** — AI accounting agents; raised **$100M at $1.15B valuation** (Accel, GV), reportedly powering ~30% of top US accounting firms. (Note: sells agents *to* firms — copilot, not full AI-native firm.) [TechFundingNews](https://techfundingnews.com/basis-ai-accounting-100m-1-15b-unicorn/), [AI Business](https://aibusiness.com/agentic-ai/ai-accounting-startup-now-valued-at-1-15-billion)
  - **Accrual** — launched with **$75M**, AI-native automation for bookkeeping/month-end close. [CPA Practice Advisor](https://www.cpapracticeadvisor.com/2026/02/05/startup-accrual-officially-launches-with-75m-in-funding-to-bring-ai-native-automation-to-accounting/177600/)
  - **Juno** — CPA-founded AI tax-return startup, **$12M seed** (Bonfire Ventures). [Crunchbase News](https://news.crunchbase.com/fintech/cpa-founded-ai-tax-return-startup-juno-seed-funding/)
  - **Minerva** (YC) — "AI native accounting firm"; **Afternoon.co** (YC) — managed AI bookkeeping + tax. [YC](https://www.ycombinator.com/companies/minerva)
  - Incumbent-adjacent: **Pilot** ($160M+ raised), **Digits** ($97M+, GV/Benchmark).
- **Regulation:** Bookkeeping = **LOW** (no license to keep books). Tax prep = **LOW–MED** (PTIN; minimal). **Audit/attest = HIGH:** must be a **licensed CPA firm**, ≥51% CPA-owned and CPA-controlled in law and fact, a licensed CPA must sign the audit opinion, and the firm must pass **AICPA peer review every 3 years** (statutory in 55 jurisdictions). [NASBA UAA](https://nasba.org/app/uploads/2018/02/UAA1.29.20183.12p.m.FINALFINAL.pdf), [AICPA peer review](https://www.aicpa-cima.com/news/article/peer-review-a-vital-component-in-audit-quality)
- **White space:** A genuinely AI-native *full-service firm of record* (signs returns, carries E&O, owns the client relationship) vs. the dominant pattern of selling agents to existing firms. Audit is wide open but the CPA-ownership + peer-review structure is the hard part. SMB/SMB-roll-up bookkeeping is crowded but fragmented.

### Compliance (regulatory, KYC/AML, SOC 2)
- **Services spend:** Compliance consulting + RegTech + outsourced AML review is tens of billions; financial institutions are replacing human compliance analysts with agents that automate ~80% of manual review.
- **Who's already funded:**
  - **Norm Ai** — turns regulations into compliance AI agents; **$48M** round (Coatue, Craft, Vanguard, Blackstone, Bain Capital, NY Life, Citi Ventures, TIAA, Benioff), **~$87M+ total**. [Norm Ai](https://www.norm.ai/post/norm-ai-secures-48-million-to-transform-regulations-into-compliance-ai-agents)
  - **Delve** (YC) — agentic SOC 2 / HIPAA / ISO 27001 / GDPR; **$32M Series A at ~$300M valuation** (Insight Partners, July 2025). *Caution:* March 2026 reporting alleged it manufactured audit artifacts — a cautionary tale on the accountability layer. [TechCrunch](https://techcrunch.com/2025/07/22/21-year-old-mit-dropouts-raise-32m-at-300m-valuation-led-by-insight/), [Haverin analysis](https://haverin.substack.com/p/strategic-insight-delve-and-the-compliance)
  - **Steward** — AI compliance ($100bn assets), **$5M** (Motive Partners). [Fintech Global](https://fintech.global/2026/03/18/ai-compliance-platform-steward-secures-5m-funding/)
- **Regulation — MED–HIGH:** AML programs are mandated (BSA), but the *compliance vendor* itself usually isn't licensed; liability sits with the regulated client. SOC 2 *attestation* must be issued by a licensed CPA firm (the Delve episode shows why the auditor-of-record boundary matters). KYC/AML monitoring is governed but outsourceable.
- **White space:** Becoming the **outsourced compliance function of record** (MLRO-as-a-service, BSA officer-as-a-service) rather than tooling — heavy accountability but a real moat.

### Healthcare administration
- **Services spend:** US healthcare administrative spend is ~$1T+; prior auth, claims, utilization management, and RCM are the biggest outsourced buckets.
- **Who's already funded:**
  - **Cohere Health** — AI prior auth for payers; **$90M Series C** (Temasek, May 2025), ~$200M total; auto-approves up to 90% of requests, 12M+ PAs/yr, acquired ZignaAI (payment integrity). [IntuitionLabs](https://intuitionlabs.ai/articles/cohere-health-ai-prior-authorization)
  - **Anterior** — payer back-office (PA, payment integrity, risk adjustment); **$40M** round on top of a **$20M Series A** (June 2024); deployed at Geisinger. [Fierce Healthcare](https://www.fiercehealthcare.com/ai-and-machine-learning/payer-ai-company-anterior-banks-40m-funding-round)
  - **EliseAI** — scheduling + PA (also property mgmt); raised a **$250M** round. [Modern Healthcare](https://www.modernhealthcare.com/health-tech/mh-top-funding-eliseai-twin-health-medallion/)
  - Market: PA-to-payer AI is a **$50M+ market growing 5x YoY** (Distyl, Anterior, Autonomize). [Modern Healthcare](https://www.modernhealthcare.com/health-tech/ai/mh-prior-authorization-companies-cohere-health-eliseai/)
- **Regulation — HIGH:** **HIPAA** + signed **BAAs** mandatory; PA/claims AI is now regulated at state and federal level (CMS-0057-F PA timeliness rule effective Jan 1, 2026; multiple states restrict AI-only denials). [KFF](https://www.kff.org/patient-consumer-protections/regulation-of-ai-in-prior-authorization-and-claims-review-a-look-at-federal-and-state-consumer-protections/)
- **White space:** Provider-side (not payer-side) administrative agents; appeals-as-a-service against denials; payer/TPA-of-record models.

### Legal services
- **Services spend:** US legal services market is ~$400B+; corporate contract/transactional work is a huge outsourced/ALSP bucket.
- **Who's already funded:**
  - **Crosby** — vertically integrated "AI law firm" (not a tool vendor); takes responsibility for the work. **$5.8M seed → $20M Series A → $60M Series B at ~$400M valuation** (Lux + Index co-lead the B; Sequoia, BCV, Cooley, Elad Gil, Patrick Collison across rounds). Reviewed 13,000 contracts, 400% revenue growth since Oct 2025, $1B+ in contracts negotiated. [UpStarts](https://www.upstartsmedia.com/p/crosby-ai-law-firm-raises-20-million), [Artificial Lawyer](https://www.artificiallawyer.com/2025/10/08/hybrid-ai-law-firm-crosby-raises-20m-cooley-invests/), [Sacra](https://sacra.com/c/crosby/)
- **Regulation — HIGH (and structurally unusual):** US legal practice requires bar admission and—critically—**non-lawyer ownership of law firms is prohibited** in nearly every state (Rule 5.4), with narrow exceptions (Arizona ABS, Utah sandbox). This is *the* regulatory wall: a VC-owned "law firm" generally can't directly practice law except via these sandboxes or by structuring as a tech-co serving a captive licensed firm. [IBA](https://www.ibanet.org/AI-native-law-firm-regulatory-innovation-and-fundamental-restructuring-of-legal-service-delivery)
- **White space:** Contract review/negotiation (Crosby), but also immigration, IP filing, debt/collections litigation, leasing, and high-volume consumer legal — all structured around the ownership constraint (AZ ABS or captive-firm model).

---

## 2. Other high-value AI-native-services verticals (funded 2025–26)

| Vertical | Leading companies & 2025–26 funding |
|---|---|
| **RCM / medical billing** | Sector raised ~$67.5M across 10 rounds in 2025 (down from $104M in 2024), 254 active cos. **AKASA** (gen-AI RCM), **Enter.health** (prior auth in seconds), **Procode AI** (RCM roll-up via acquisition of billing cos). [Tracxn](https://tracxn.com/d/trending-business-models/startups-in-revenue-cycle-management/__w--cTzQyx4V4-FsqCzlyZhn_HJR31XGX2TcFZURqhcs), [Fierce Healthcare](https://www.fiercehealthcare.com/ai-and-machine-learning/armed-funding-and-acquisition-procode-ai-launches-ai-powered-rcm-medical) |
| **Prior auth / claims** | Cohere ($90M C), Anterior ($40M+), EliseAI; PA-to-payer market $50M+ growing 5x YoY. |
| **Clinical documentation (scribes)** | **Abridge** — $300M Series E at **$5.3B** (a16z, June 2025), $800M+ total raised, ~$100M ARR (May 2025), 250+ health systems; **Ambience** — $243M at **$1.25B**. Ambient scribes announced ~$975M in 2025. [STAT](https://www.statnews.com/2025/06/24/ai-clinical-documentation-ambient-scribe-abridge-raises-300-million/), [TechCrunch](https://techcrunch.com/2025/06/24/in-just-4-months-ai-medical-scribe-abridge-doubles-valuation-to-5-3b/) |
| **Customer support / BPO replacement** | **Sierra** — $950M Series E at **$15.8B** (May 2026); **Decagon** — $250M Series D at **$4.5B**, ~$35M ARR (Oct 2025, 3x+ YoY); **Crescendo** — per-outcome pricing. All use outcome/per-resolution pricing. [Sacra/Sierra](https://sacra.com/c/sierra/), [Sacra/Decagon](https://sacra.com/c/decagon/) |
| **Debt collection** | **AgentCollect** (YC) — replaces offshore BPO/agencies, ~49% recovery in 20 days vs 20% in 4–6 mo; **Skit.ai** — 53,000+ creditors, $1B+ resolved. [YC](https://www.ycombinator.com/companies/agentcollect) |
| **Recruiting / staffing** | **Juicebox** ($30M Series A), **Jack & Jill** ($20M seed), **Alex** ($20M, Peak XV), **Dex** ($5.3M seed, Notion Capital; ~$1.8M ARR), **Contrario** ($6M+ ARR, 150+ placements). Recruiting startups raised ~$208M in 2025. [Fortune/Dex](https://fortune.com/2026/04/28/exclusive-dex-ai-powered-recruiting-startup-raises-seed-round-notion-capital/) |
| **Property mgmt / mortgage / title / escrow** | **Propy** — $100M credit facility to **roll up title/escrow firms** into an AI closing platform (AI escrow officer), $25B fragmented industry; **Dono.AI** — $6.5M seed (property records). Proptech VC hit $16.7B in 2025 (+68% YoY). [PRNewswire/Propy](https://www.prnewswire.com/news-releases/propy-raises-100-million-to-reimagine-real-estate-transactions-with-ai-302674035.html), [SiliconANGLE/Dono](https://siliconangle.com/2026/02/10/dono-raises-6-5m-seed-round-modernize-property-records-ai/) |
| **Paralegal / contract** | Crosby (above); broader ALSP/contract-lifecycle work being attacked by AI-native firms. |

**Stage read:** Customer support and clinical docs are the most mature (mega-rounds, $B+ valuations, real ARR). Insurance brokerage, AI law firm, and accounting are mid-stage (seed–Series B, $40–100M rounds). RCM, debt collection, and recruiting are earlier/seed-heavy and more fragmented.

---

## 3. The economics

- **Multiples:** Services firms trade ~**1–2x revenue**; software ~**8–12x** (YC's framing). In 2026 venture rounds, AI-native cos command a **median ~21x EV/Revenue** (Aventis: ~29.7x across AI rounds) vs ~5.5–6x for legacy SaaS; AI-native private M&A ~**11.5x** vs 3.8x for SaaS. The arbitrage thesis: capture services-sized revenue, get valued partway toward software multiples. [SaaSRise](https://www.saasrise.com/blog/the-ai-software-valuation-report-2026), [Aventis](https://aventis-advisors.com/saas-valuation-multiples/), [Qubit](https://qubit.capital/blog/ai-startup-valuation-multiples)
- **Gross margins:** Traditional BPO ~**25–30%**; AI-powered services with AI handling ~70% of interactions reach blended **~60–64%**; vertical SaaS sits at ~78–82% (dropping to 63–68% once inference costs are loaded). So AI-native services land *between* BPO and SaaS — meaningfully above services, below pure software. [AnyReach 64% margin](https://blog.anyreach.ai/64pct-margin/), [SFAI Labs](https://sfailabs.com/guides/the-ai-project-margin-model-for-vertical-saas)
- **TAM logic:** Investing in AI-enabled services underwrites to the **labor market** (far larger than software TAM). The bear case (Better Tomorrow Ventures): as multiple VC-backed firms enter a category, services **re-commoditize on price** and clients demand the labor savings be passed through — so the automation itself is not the moat. [Better Tomorrow Ventures](https://better-tomorrow-ventures.ghost.io/services-wont-become-software/), [Ziperski](https://andrewziperski.substack.com/p/are-ai-labor-replacements-a-tam-expansion)
- **Traction at raise (benchmarks):** Decagon ~$35M ARR → $4.5B; Abridge ~$100M ARR → $5.3B; Crosby 400% growth / $1B contracts negotiated → $400M; Harper 5,000 customers in 13 mo → $47M; Dex ~$1.8M ARR → $5.3M seed. Pattern: outcome volume + velocity metrics (turnaround time, % auto-resolved) matter as much as raw ARR at seed/A.

---

## 4. What the actual moat is

Per Better Tomorrow Ventures and the funded-company evidence, automation is **not** the durable moat — competitors get the same models. The moat lives in:

1. **The liability/accountability layer (strongest).** The firm that signs the return / opinion / contract and carries E&O is structurally defensible: clients pay a premium for someone to be *responsible*. Illustrated: a 60%-margin tax-automation shop vs a 45%-margin firm employing CPAs who sign and insure returns — the second has a trust moat AI can't replicate. This is exactly where regulatory licenses become a *feature*, not just a cost.
2. **Regulatory license as barrier (favors first-movers who do the hard work).** Insurance producer licenses across 50 states, CPA-firm ownership + peer review, bar admission/ABS structures, BAAs — slow and unglamorous, which is why incumbents and disciplined new entrants both have it and pure-software entrants don't.
3. **Proprietary workflow data + integrations** (carrier appointments, payer connections, court/county systems, ledger access) — accumulates with volume; favors whoever scales operations first.
4. **Trust/brand** in regulated outcomes (e.g., Abridge's Best-in-KLAS, auditor relationships) — slow-building, incumbent-leaning.

**New entrant CAN build:** the accountability layer + licenses + proprietary workflow data (these reward founders willing to do the regulatory/operational grind YC's founder is signaling). **Favors incumbents:** brand/trust at enterprise scale and deep payer/carrier integration breadth — though AI-native speed (Harper's 1–2 day quotes) is the wedge against them.

---

## 5. Regulatory / accountability map

| Vertical | What you legally need | Burden |
|---|---|---|
| Insurance brokerage | State producer/broker license per state; carrier appointments; surety bond (some states); E&O insurance | **HIGH** |
| Bookkeeping | None (no license) | **LOW** |
| Tax prep | PTIN; minimal | **LOW–MED** |
| Audit / attest / SOC 2 | Licensed CPA firm, ≥51% CPA-owned & controlled, CPA signs opinion, AICPA peer review every 3 yrs | **HIGH** |
| Compliance (AML/KYC) | Usually unlicensed vendor; liability on client; SOC 2 attestation needs CPA firm; BSA program rules | **MED–HIGH** |
| Healthcare admin / RCM / PA | HIPAA + signed BAAs; CMS PA rules (CMS-0057-F); state anti–AI-denial laws; SOC 2 expected | **HIGH** |
| Clinical documentation | HIPAA/BAA; SOC 2; clinical accuracy/liability | **MED–HIGH** |
| Legal services | Bar admission; **Rule 5.4 bans non-lawyer firm ownership** (AZ ABS / Utah sandbox exceptions) | **HIGH** |
| Customer support / BPO | SOC 2; data-handling/PCI if payments; otherwise light | **LOW–MED** |
| Debt collection | FDCPA + state debt-collector licenses/bonds (many states); CFPB oversight | **MED–HIGH** |
| Recruiting / staffing | Employment law (EEOC, NYC Local Law 144 AI bias audits); staffing agency registration in some states | **LOW–MED** |
| Mortgage / title / escrow | NMLS mortgage-originator license; state title/escrow licenses + bonding; RESPA | **HIGH** |
| Property management | State property-manager/real-estate broker license in many states; trust-account rules | **MED** |

---

## Master table

| Vertical | Services spend | Who's already funded | Regulation (L/M/H) | Moat type | White-space verdict |
|---|---|---|---|---|---|
| Insurance brokerage | $10s of B commissions, fragmented SMB | Harper ($47M), Panta (YC) | **HIGH** (producer license/state, bond, E&O) | License + carrier integrations + accountability | Open in non-GL/WC lines, personal lines, benefits |
| Accounting/bookkeeping | $100s of B | Basis ($100M/$1.15B), Accrual ($75M), Juno ($12M), Minerva/Afternoon (YC), Pilot, Digits | **LOW** (books) → **HIGH** (audit) | Accountability (signs returns) + workflow data | Open for full firm-of-record; audit wide-open but hard |
| Tax / audit | $10s of B | (above) | **MED**(tax) / **HIGH**(audit) | CPA license + peer review + liability | Audit largely greenfield (ownership wall) |
| Compliance (AML/KYC/SOC2) | $10s of B | Norm Ai ($87M+), Delve ($32M/$300M), Steward ($5M) | **MED–HIGH** | Outsourced-function-of-record + trust (Delve cautionary) | Open for MLRO/BSA-officer-as-a-service |
| Healthcare admin / PA / claims | ~$1T admin; PA-AI $50M+ 5x YoY | Cohere ($90M C), Anterior ($40M+), EliseAI ($250M) | **HIGH** (HIPAA/BAA/CMS) | Payer integrations + regulatory + data | Provider-side & appeals-as-a-service open |
| RCM / medical billing | $10s of B | AKASA, Enter, Procode (roll-up) | **HIGH** | Payer connections + roll-up scale | Fragmented; roll-up + AI is live thesis |
| Clinical documentation | Large physician-time spend | Abridge ($5.3B), Ambience ($1.25B) | **MED–HIGH** | Trust/brand + health-system distribution | Crowded at top; specialty niches open |
| Legal services | ~$400B | Crosby ($60M B/$400M), Norm Ai (adjacent) | **HIGH** (Rule 5.4 ownership wall) | Bar/ABS structure + accountability + data | Open beyond contracts; ownership is the gate |
| Customer support / BPO | BPO is $300B+ | Sierra ($15.8B), Decagon ($4.5B), Crescendo | **LOW–MED** | Outcome pricing + integrations; weak reg moat | Crowded/late; verticalized niches only |
| Debt collection | $10s of B recovered | AgentCollect (YC), Skit.ai | **MED–HIGH** (FDCPA/state) | Compliance + recovery data | Open, especially B2B and aged debt |
| Recruiting / staffing | Staffing ~$200B+ US | Juicebox ($30M), Jack&Jill ($20M), Alex ($20M), Dex ($5.3M), Contrario | **LOW–MED** | Candidate data + placement network | Open but commoditizing fast |
| Mortgage / title / escrow | Title/escrow ~$25B | Propy ($100M facility, roll-up), Dono ($6.5M) | **HIGH** (NMLS/title license/RESPA) | Licenses + county data + roll-up scale | Open via roll-up + AI back office |
| Property management | Large fragmented | EliseAI (adjacent) | **MED** (RE broker license) | License + local ops density | Open, fragmented |

---

## Bottom line

The biggest venture prizes (ignoring founder constraints) cluster where the **services spend is gigantic, the work is already outsourced, and a regulatory license doubles as the moat**: insurance brokerage, accounting/audit firm-of-record, healthcare administration (PA/RCM), and the AI law firm. Customer support and clinical scribes are huge but already late and richly funded. The defensible play is consistently the one that *takes responsibility* — signs the return, holds the license, carries the E&O — which is precisely the founder posture YC is selecting for.
