# Young People / Education Startup Ideas — for a Solo Young Faceless Builder

*Research date: 2026-05-31. All claims grounded in 2025–2026 sources, cited inline. Author lens: a minor solo founder who ships polished interactive web tools + AI, distributes faceless/organic (SEO, X, Reddit, TikTok-no-face, PH, HN, embeds), is the target user, previously built FundSim (real organic traffic, failed to monetize).*

---

## 0. The brutal frame (read this first)

Edtech is a graveyard. Two things kill student tools:

1. **Low willingness-to-pay.** Freemium edtech converts ~2–5% of free users (top performers 6–8%); hard paywalls convert better (~12% median) but throttle the viral top-of-funnel that a FundSim-style tool needs. Crucially, research finds removing ads/branding "creates resentment, not willingness to pay," and tiers priced for institutions but sold to individuals fail regardless of features. ([winsomemarketing](https://winsomemarketing.com/edtech-marketing/freemium-models-in-edtech-when-free-users-actually-convert-to-paid), [RevenueCat State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/))
2. **"ChatGPT already does this."** OpenAI shipped **Study Mode** (Socratic tutor) Jul 29 2025; Anthropic shipped **Claude Learning Mode**; Google shipped **Guided Learning for Gemini** and made Gemini Pro free for students. ([WebProNews](https://www.webpronews.com/openai-launches-chatgpt-study-mode-as-socratic-tutor/), [VentureBeat](https://venturebeat.com/ai/chatgpt-just-got-smarter-openais-study-mode-helps-students-learn-step-by-step)) Any "AI tutor that explains things" is now a free platform feature.

**The survival test for every idea below:** Does *money already move* in this niche (parents, admissions, credentials, employers)? And does it survive "why won't ChatGPT do this for free?" — usually by owning **proprietary structured data, a verifiable artifact/credential, a workflow with stakes, or a network**, not just "LLM wrapper that talks."

**The FundSim lesson applied:** FundSim won attention but had no money on the other side and no reason to convert. Every pick here is scored hardest on *who pays and why now*.

---

## 1. The pain landscape (cited)

**Learning loss / the integrity crisis is real and accelerating.**
- ~1 in 4 US teens use ChatGPT for homework; students using AI for schoolwork rose from **48% → 62% (May→Dec 2025)**. ([nchstats](https://nchstats.com/teens-use-chatgpt-for-homework/), [eSchoolNews Mar 2026](https://www.eschoolnews.com/digital-learning/2026/03/25/student-use-of-ai-for-homework-rises/))
- **67% of students** themselves say using AI for schoolwork harmed their critical thinking (up from 54%). Teachers see polished writing masking comprehension voids. ([eSchoolNews](https://www.eschoolnews.com/digital-learning/2026/03/25/student-use-of-ai-for-homework-rises/), [The Week](https://theweek.com/tech/ai-cheating-school-education-chatgpt-teachers))
- **44% of teachers** encounter suspected AI homework weekly; <15% act because proof is weak. ([nchstats](https://nchstats.com/teens-use-chatgpt-for-homework/))

**Assessment is snapping back to "prove it live."**
- **Blue books / handwritten in-class exams / oral exams are surging** in 2025–26 as professors fight AI. ([Fox](https://www.foxnews.com/tech/schools-turn-handwritten-exams-ai-cheating-surges), [CSMonitor](https://www.csmonitor.com/USA/Education/2025/0523/college-ai-blue-book-finals), [GovTech](https://www.govtech.com/education/higher-ed/ai-nudges-syracuse-professors-back-toward-blue-books-in-class-work)) → Implication: the *skill that now matters* is performing **without** AI in the room (recall, in-person explanation, timed handwritten work). The tools students bought (summarizers) don't train that.

**False-accusation panic is a new, acute, personal pain with money/stakes attached.**
- Turnitin admits up to **4% false positives** → ~88,000 students/yr wrongly flagged; independent estimates 5–20%. Detectors disproportionately flag **non-native English speakers**. ([hastewire](https://hastewire.com/blog/turnitin-false-positives-causes-and-fixes-for-2025), [Rolling Stone](https://www.rollingstone.com/culture/culture-features/student-accused-ai-cheating-turnitin-1234747351/))
- Students already cobble together "proof I wrote this" via Google Docs version history + the **Draftback** extension; threads about it go viral. But these are clunky, gameable, and not built for the accused student's workflow. ([Threads viral post](https://www.threads.com/@jleathboiler/post/DDPc_2sxZko?hl=en), [Pangram evidence guide](https://www.pangram.com/blog/how-to-create-evidence-for-an-ai-detection-case))

**Parents pay, heavily, and the stakes rose.**
- Private tutoring market **$133.8B (2025)**; US online tutoring **$4.32B (2024) → $8.08B (2030)**, 11.1% CAGR; **test prep is the fastest segment at 12.5% CAGR**. SAT tutors average **$62/hr**, up to **$300/hr**. ([imarc](https://www.imarcgroup.com/private-tutoring-market), [GrandView](https://www.grandviewresearch.com/industry-analysis/us-online-private-tutoring-market-report), [Wiingy/GlobeNewswire](https://www.globenewswire.com/news-release/2025/09/30/3158961/0/en/SAT-Prep-Tutoring-Costs-63-More-Than-Language-Learning-Wiingy-Study-Finds.html))
- College admissions AI is being funded/validated: **ESAI got Mark Cuban on Shark Tank (May 2025)**; Kaplan's tool is **$199/yr**; **U.S. News acquired Sups**. ([Aralia](https://www.aralia.com/helpful-information/7-best-ai-tools-to-help-with-college-applications/), [ESAI](https://www.esai.ai/))
- **~$100M scholarships + ~$2B grants + $3.6B Pell** go unclaimed yearly — an *information/effort gap*, not eligibility. ([Fastweb](https://www.fastweb.com/financial-aid/articles/are-you-getting-your-share-of-120-billion-in-financial-aid-dollars), [phillygoes2college](https://phillygoes2college.org/2025/08/05/100m-in-scholarships-go-unclaimed-each-year-not-anymore/))

**The career floor collapsed for young people.**
- Stanford: **16% employment drop for ages 22–25** in AI-exposed jobs; entry-level postings down ~29pts since Jan 2024. ([WEF](https://www.weforum.org/stories/2025/11/gen-z-labour-market-ai-economy/), [Stack Overflow](https://stackoverflow.blog/2025/12/26/ai-vs-gen-z/))
- Interview-prep already monetizes: **Final Round AI (10M+ users, $99/mo)**, Interview Coder (lifetime plans). ([Final Round](https://www.finalroundai.com/), [Interview Coder](https://www.interviewcoder.co/))

**Who's already funded (saturation map — avoid head-on):**
- General AI study tools: **Mindgrasp (5M+ users), StudyFetch, Voovo** — crowded, viral on StudyTok, low moat. ([Mindgrasp](https://www.mindgrasp.ai/))
- YC is ~12% edtech/batch, half AI-first: **Frizzle** (grades handwritten math), **Shepherd**, **Risely** (university retention — B2B, not for us). ([YC Education](https://www.ycombinator.com/companies/industry/education), [edtechconnect](https://www.edtechconnect.com/post/from-spark-to-surge-how-ai-dominates-y-combinator-and-why-higher-ed-should-pay-attention))
- Admissions: ESAI, Kolly, Kaplan, Sups/U.S. News. Essay-help is getting crowded; the *data/strategy* layer is less so.

---

## 2. The product ideas

Difficulty = build effort for a solo builder (1 easy … 5 hard). Each scored 1–5 on the 6 rubric axes (higher = better, incl. risk where higher = lower risk).

### Idea A — "Proof-of-Work" authentic-writing recorder + verifiable credential ("I actually wrote this")
**What it is:** A polished web editor (and Google Docs/browser companion) students write in. It records the *process* — keystroke cadence, pauses, edits, research tabs, voice "explain-as-you-go" checkpoints — and produces a clean, shareable **"Authenticity Replay" + signed certificate** the student can attach when accused, or proactively submit with assignments. Think Draftback, but beautiful, tamper-evident, student-owned, and framed as *your* defense, not the school's surveillance.
**Who pays:** Students/parents (anxiety purchase: a wrongful-cheating accusation threatens grades, scholarships, visas). Freemium: free recording, pay to export the certified replay / get priority "dispute kit." Non-native-English students (heavily over-flagged) are a high-intent wedge.
**Why winnable vs ChatGPT/incumbents:** ChatGPT can't vouch for *you*; this is an artifact + trust layer, not a chat answer. Turnitin/Pangram sell *detection to schools* (the accuser side); nobody owns the *accused student's* defense side well. The viral Draftback threads prove latent demand and that current tools are ugly/gameable. Tamper-evidence (capturing paste/transcription patterns) is the technical moat.
**Distribution:** This is a FundSim-grade viral object: "replay your essay being written" is inherently shareable; Reddit (r/college, r/Professors ironically), TikTok screen-recordings, X build-in-public, SEO on "falsely accused of AI / how to prove I wrote my essay." Teachers may *recommend* it (organic B2C2-teacher pull, no contract needed).
**Difficulty:** 3
**Scores:** Pain **5** · Monetization **4** · Founder-fit **5** · YC-fundability **4** · Clicks-like-FundSim **5** · Risk **3** (risk: detector arms race; schools could adopt official process-capture; gameable-history tools exist).

### Idea B — Active-recall / "exam-without-AI" trainer that simulates blue-book & oral exams
**What it is:** Upload your notes/slides/PDF → the tool builds an adaptive **timed handwritten-style and spoken-answer practice** regime: it asks you to *explain out loud* (speech-in, AI grades your verbal explanation for gaps), do timed closed-book recall, and tracks a "will-you-survive-the-in-class-exam" readiness score. Explicitly trains the thing AI took away.
**Who pays:** Students (and parents) facing the blue-book/oral-exam resurgence. Subscription or per-exam-cram pass. Could attach to high-stakes courses (orgo, calc, law).
**Why winnable:** Reframes the category away from "AI does it for you" (commoditized, ChatGPT) toward "AI makes sure *you* can do it without it" — directly riding the 2025–26 blue-book/oral-exam trend. Speech-graded oral-exam rehearsal is a genuinely differentiated, sticky workflow vs. Mindgrasp-style summarizers.
**Distribution:** StudyTok ("blue books are back, here's how I trained"), SEO on course names + "oral exam practice," Reddit study subs. Faceless screen + voice demos work great.
**Difficulty:** 3
**Scores:** Pain **4** · Monetization **3** · Founder-fit **5** · YC-fundability **4** · Clicks **4** · Risk **3** (risk: OpenAI Study Mode drift toward this; retention/seasonality like FundSim).

### Idea C — Scholarship auto-matcher + AI application co-pilot (money-back framing)
**What it is:** Student builds a profile once; tool **matches + ranks** scholarships by true effort-to-payout odds, auto-drafts/tailors essays from a reusable "story bank," and tracks deadlines. Killer hook: surfaces *small, niche, low-applicant* scholarships (where unclaimed money actually sits).
**Who pays:** Parents/students; success-aligned pricing (cheap base + "apply to 20 in a weekend" pass). Real ROI story: ~$100M+ unclaimed because applying "feels like a part-time job."
**Why winnable vs ChatGPT:** The moat is the **structured, fresh scholarship database + dedup + odds model + deadline ops**, not the essay text. ChatGPT can't see the live scholarship corpus or manage your pipeline. Strong "interactive tool → money found" virality.
**Distribution:** SEO goldmine ("scholarships for X major / left-handed / [state]"), TikTok "I found $4k in an afternoon," Reddit r/scholarships, r/ApplyingToCollege.
**Difficulty:** 4 (data acquisition/freshness is the real work)
**Scores:** Pain **4** · Monetization **4** · Founder-fit **3** (data-ops heavy, less pure-frontend) · YC-fundability **4** · Clicks **5** · Risk **3** (risk: scammy-scholarship-site reputation; Fastweb/Going Merry incumbents; data freshness burden).

### Idea D — Admissions "strategy & odds" simulator (the FundSim of college apps)
**What it is:** An interactive **admissions simulator**: input grades/scores/activities/major/target schools → visualize realistic admit-odds, "spike" vs "well-rounded" profile analysis, and *what-if* sliders (raise SAT 40pts, add a research project → odds shift). Plus AI feedback on activity list / essay *strategy* (not ghostwriting).
**Who pays:** Parents (this is where the $300/hr counselor money is). Premium report, multi-school compare, essay-strategy add-on.
**Why winnable:** Directly the FundSim mechanic (sliders + instant visual feedback) applied to a market where parents spend thousands. Avoids the crowded *essay-writing* lane (ESAI/Kolly) by owning *strategy/odds visualization*. Survives ChatGPT because credible odds need a proprietary outcomes dataset and a calibrated model, not vibes.
**Distribution:** Insanely shareable ("my admit chances" screenshots), r/ApplyingToCollege (huge), SEO "[school] acceptance calculator," X.
**Difficulty:** 4 (credible odds data is the moat *and* the hard part; thin data = another inaccurate "chance-me" toy)
**Scores:** Pain **4** · Monetization **5** · Founder-fit **4** · YC-fundability **4** · Clicks **5** · Risk **2** (risk: data credibility/liability, test-optional noise, established chance-me tools, fairness optics).

### Idea E — Internship/first-job application & mock-interview gym for students (non-technical too)
**What it is:** Faceless AI **mock-interview + application gym** aimed at *students/early-career* (internships, first jobs), incl. behavioral/case interviews, not just coding. Records you, scores delivery/content, runs reps, builds a tracked "interview fitness" score; resume tailoring to JD.
**Who pays:** Students/new grads (proven: Final Round $99/mo, 10M+ users). Cheaper student tier.
**Why winnable / honest:** Pain is real (entry-level collapse) and money is proven — *but this lane is the most crowded/funded here* (Final Round, Interview Coder, LockedIn, Remasto). Differentiation must be the *student/internship* niche + practice-rep gamification, not "interview copilot."
**Distribution:** TikTok rep clips, SEO "[company] interview questions," Reddit r/csMajors, r/internships.
**Difficulty:** 3
**Scores:** Pain **5** · Monetization **4** · Founder-fit **4** · YC-fundability **2** (saturated) · Clicks **3** · Risk **2** (incumbents well-funded; cheating-copilot reputational/ethical risk).

### Idea F — "AI-literacy / prompt-craft" certification & interactive curriculum for teens
**What it is:** Interactive, gamified lessons + challenges teaching teens to *use AI well and verify it* (the skill employers now want), ending in a shareable **portfolio/badge**.
**Who pays:** Parents (skill-building), maybe creators/affiliates. Weak direct WTP for "courses."
**Why winnable / honest:** Rides "AI literacy is the new core skill" — but courses have notoriously low completion + WTP, and the badge has no employer recognition yet. ChatGPT can teach this for free. Thin moat.
**Distribution:** TikTok/SEO fine; "certification" lends shareability.
**Difficulty:** 2
**Scores:** Pain **3** · Monetization **2** · Founder-fit **4** · YC-fundability **2** · Clicks **3** · Risk **3**.

### Idea G — Parent-facing "is my kid actually learning?" insight dashboard
**What it is:** A tool parents install that ingests a kid's study artifacts (with consent) and produces a calm dashboard: mastery gaps, recall-readiness, "studied vs. AI-shortcut" signals, and concrete drill recommendations.
**Who pays:** Parents (highest WTP cohort, anxiety-driven).
**Why winnable / honest:** Parent money is the strongest in this report. But: requires kid buy-in (teens hate surveillance), heavy **COPPA/minor-data** exposure, and a faceless minor founder marketing a *parental monitoring* product to adults is an awkward trust/distribution fit. High latent value, hard execution for *this* founder.
**Distribution:** Parent FB groups, SEO "is my child learning with AI"; not naturally viral with the student audience the founder can reach.
**Difficulty:** 4
**Scores:** Pain **4** · Monetization **5** · Founder-fit **2** · YC-fundability **3** · Clicks **2** · Risk **2** (COPPA/minor data, surveillance backlash).

---

## 3. Ranked table

| Rank | Idea | Pain | Monetization | Founder-fit | YC-fundability | Clicks | Risk | **Total /30** | Difficulty |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **A. Proof-of-Work authenticity recorder** | 5 | 4 | 5 | 4 | 5 | 3 | **26** | 3 |
| 2 | **D. Admissions odds/strategy simulator** | 4 | 5 | 4 | 4 | 5 | 2 | **24** | 4 |
| 3 | **B. Active-recall / blue-book & oral-exam trainer** | 4 | 3 | 5 | 4 | 4 | 3 | **23** | 3 |
| 4 | **C. Scholarship matcher + co-pilot** | 4 | 4 | 3 | 4 | 5 | 3 | **23** | 4 |
| 5 | **E. Internship/interview gym** | 5 | 4 | 4 | 2 | 3 | 2 | **20** | 3 |
| 6 | **G. Parent "is my kid learning" dashboard** | 4 | 5 | 2 | 3 | 2 | 2 | **18** | 4 |
| 7 | **F. AI-literacy certification for teens** | 3 | 2 | 4 | 2 | 3 | 3 | **17** | 2 |

*(C and B tie at 23; B ranked higher for better founder-fit/lower data burden.)*

---

## 4. Sharpest single pick

### → **Idea A: the "Proof-of-Work" authentic-writing recorder + verifiable credential.**

**Why this one, specifically:**

1. **It passes the ChatGPT test cold.** It is not an answer-generator; it is a **trust/artifact layer about a specific human's specific work**. OpenAI/Google/Anthropic have zero incentive to certify "this student didn't use AI" — that *cannibalizes their own product*. That structural misalignment is the durable moat a solo founder needs.
2. **The pain is acute, personal, and money/stakes-backed** — not "nice to have." A false accusation threatens a grade, a scholarship, a visa. ~88k students/yr wrongly flagged; non-native speakers systematically over-flagged is a concentrated, reachable, high-intent wedge. People pay to defend themselves.
3. **It is the most FundSim-shaped object here.** "Watch my essay get written, keystroke by keystroke" is intrinsically a shareable, screenshottable, faceless-demo-able artifact — and viral Draftback threads already prove organic pull, while showing the incumbents are ugly and gameable.
4. **It fits the founder perfectly:** polished interactive web tool + AI pattern-analysis, solo-buildable, age-invisible (a student building a student-defense tool is *credible*, not a liability), faceless distribution native (screen recordings, Reddit, SEO).
5. **Venture story:** start as the accused student's defense → become the *neutral authorship-provenance standard* students attach to every submission (and teachers come to trust/request). That's a credentialing network with expansion into authenticity-as-a-service — a real venture arc, not a feature.

**The hard parts to respect (de-risk early):** (a) the **anti-spoofing arms race** — auto-typers fake history, so the product's credibility *is* its tamper-evidence (detecting transcription/paste cadence) — invest there from day one; (b) **don't get trapped as a school-sold product** (that's the disqualified enterprise motion) — keep it student-owned/B2C with teacher pull, not district sales; (c) avoid becoming "just a detector" — the wedge is *defense + provenance*, a side nobody serves well.

**Fast first-dollar path:** free recording (viral top-of-funnel, FundSim-style), pay for the certified export / dispute kit / non-native-speaker "appeal pack." Anxiety + stakes = far better conversion than generic study-app freemium.

---

## 5. Honest risks (with sources)

- **Platform steamroll:** Less likely for Idea A (mis-incentivized for foundation models) than for B/E/F, which **Study Mode / Claude Learning Mode / Gemini Guided Learning** can absorb for free. ([WebProNews](https://www.webpronews.com/openai-launches-chatgpt-study-mode-as-socratic-tutor/), [VentureBeat](https://venturebeat.com/ai/chatgpt-just-got-smarter-openais-study-mode-helps-students-learn-step-by-step))
- **Detector arms race / spoofing:** Fake-revision-history tools already exist; authenticity claims are only as good as anti-tamper tech. ([bypassengine](https://bypassengine.com/draftback-chrome-extension/), [Pangram](https://www.pangram.com/blog/how-to-create-evidence-for-an-ai-detection-case))
- **Incumbent adoption:** Schools may mandate official process-capture (Google Docs history, lockdown editors), commoditizing the basic feature — so own *student-side UX + provenance standard*, not the raw capture.
- **Minor founder / COPPA & payments:** Collecting student data (esp. <13) triggers COPPA; founder must route payments through a family member's account and avoid enterprise/district contracts (disqualifying). Idea G is worst on this; A/B/D/C are manageable B2C.
- **Low-WTP gravity (the FundSim trap):** Pure study tools (B/F) and free-money tools (C) face conversion drag; A/D/G ride **anxiety + high-stakes parent money**, the strongest WTP in the report. ([winsomemarketing](https://winsomemarketing.com/edtech-marketing/freemium-models-in-edtech-when-free-users-actually-convert-to-paid))
- **Saturation:** Interview prep (E) and general study tools are crowded and funded (Final Round 10M+ users; Mindgrasp 5M+). Admissions essay-writing (D-adjacent) is filling (ESAI/Kolly/Sups) — which is why D targets *odds/strategy*, not ghostwriting. ([Final Round](https://www.finalroundai.com/), [Mindgrasp](https://www.mindgrasp.ai/), [ESAI](https://www.esai.ai/))
- **Credibility/liability (Idea D):** "Admit chance" claims invite accuracy disputes and fairness optics; needs real outcomes data or it's another toy.

---

### Sources
- Teen AI homework use & integrity: [nchstats](https://nchstats.com/teens-use-chatgpt-for-homework/) · [eSchoolNews](https://www.eschoolnews.com/digital-learning/2026/03/25/student-use-of-ai-for-homework-rises/) · [The Week](https://theweek.com/tech/ai-cheating-school-education-chatgpt-teachers)
- Blue books / oral exams: [Fox](https://www.foxnews.com/tech/schools-turn-handwritten-exams-ai-cheating-surges) · [CSMonitor](https://www.csmonitor.com/USA/Education/2025/0523/college-ai-blue-book-finals) · [GovTech](https://www.govtech.com/education/higher-ed/ai-nudges-syracuse-professors-back-toward-blue-books-in-class-work) · [InsideHigherEd](https://www.insidehighered.com/news/faculty-issues/learning-assessment/2025/12/16/you-cant-ai-proof-classroom-experts-say-get)
- False accusations / detectors: [hastewire](https://hastewire.com/blog/turnitin-false-positives-causes-and-fixes-for-2025) · [Rolling Stone](https://www.rollingstone.com/culture/culture-features/student-accused-ai-cheating-turnitin-1234747351/) · [Pangram](https://www.pangram.com/blog/how-to-create-evidence-for-an-ai-detection-case)
- Proof-of-work / Draftback: [Threads](https://www.threads.com/@jleathboiler/post/DDPc_2sxZko?hl=en) · [bypassengine](https://bypassengine.com/draftback-chrome-extension/)
- Tutoring/test-prep market: [imarc](https://www.imarcgroup.com/private-tutoring-market) · [GrandView](https://www.grandviewresearch.com/industry-analysis/us-online-private-tutoring-market-report) · [Wiingy](https://www.globenewswire.com/news-release/2025/09/30/3158961/0/en/SAT-Prep-Tutoring-Costs-63-More-Than-Language-Learning-Wiingy-Study-Finds.html)
- Admissions AI: [Aralia](https://www.aralia.com/helpful-information/7-best-ai-tools-to-help-with-college-applications/) · [ESAI](https://www.esai.ai/)
- Scholarships unclaimed: [Fastweb](https://www.fastweb.com/financial-aid/articles/are-you-getting-your-share-of-120-billion-in-financial-aid-dollars) · [phillygoes2college](https://phillygoes2college.org/2025/08/05/100m-in-scholarships-go-unclaimed-each-year-not-anymore/)
- Gen Z jobs/AI: [WEF](https://www.weforum.org/stories/2025/11/gen-z-labour-market-ai-economy/) · [Stack Overflow](https://stackoverflow.blog/2025/12/26/ai-vs-gen-z/)
- Interview prep tools: [Final Round](https://www.finalroundai.com/) · [Interview Coder](https://www.interviewcoder.co/)
- Socratic AI platform moves: [WebProNews](https://www.webpronews.com/openai-launches-chatgpt-study-mode-as-socratic-tutor/) · [VentureBeat](https://venturebeat.com/ai/chatgpt-just-got-smarter-openais-study-mode-helps-students-learn-step-by-step)
- Freemium/WTP reality: [winsomemarketing](https://winsomemarketing.com/edtech-marketing/freemium-models-in-edtech-when-free-users-actually-convert-to-paid) · [RevenueCat](https://www.revenuecat.com/state-of-subscription-apps-2025/)
- YC edtech landscape: [YC Education](https://www.ycombinator.com/companies/industry/education) · [edtechconnect](https://www.edtechconnect.com/post/from-spark-to-surge-how-ai-dominates-y-combinator-and-why-higher-ed-should-pay-attention)
