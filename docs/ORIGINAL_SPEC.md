# LifeOS — Original Product Research Spec

> Preserved verbatim from the initial planning conversation (2026-09-04) so future work always
> has the full market research and rationale available, not just the condensed summaries in
> `docs/ROADMAP.md` and `docs/modules/*.md`.

# Building "LifeOS": A Comprehensive Product Spec & Build Prompts for a Glassmorphic Lifestyle-Tracker PWA

## TL;DR
- Build a **single, offline-first React PWA** (Vite + vite-plugin-pwa/Workbox + Dexie.js/IndexedDB) that unifies nine trackers behind one glassmorphic, Apple-inspired UI — this beats juggling separate apps and is the modern 2025-2026 stack, but you must design around one hard constraint: **PWAs cannot guarantee precisely-timed reminders, especially on iOS**, so medication reminders should be server-push-driven or wrapped natively via Capacitor.
- The winning design pattern across best-in-class apps (Streaks, Finch, Whoop, MacroFactor) is **radical friction reduction plus shame-free gamification**: one-tap logging, home-screen widgets, streaks with a "streak freeze" grace mechanic, and data-as-coaching — not more data entry.
- Use a **calm-but-vibrant color system** (deep indigo/near-black base, healing green + serene blue functional accents, warm coral for energy), Framer Motion spring physics for micro-interactions, and glassmorphism used *strategically* (nav bars, modals, cards) with mandatory `prefers-reduced-transparency` and `prefers-reduced-motion` fallbacks.

## Key Findings

**1. The market rewards focus and low friction, not feature bloat.** MacroFactor beats MyFitnessPal specifically because logging a food via search takes 10 actions vs 15 — MyFitnessPal requires roughly 1.5x more discrete actions on average. Streaks (the classic Apple Design Award-winning Crunchy Bagel app) keeps daily tracking radically simple — habits are "displayed as a big button—just tap and hold to mark it done." Bearable's biggest recurring criticism is that tracking *too much* becomes overwhelming. Lesson: your all-in-one app must fight its own tendency toward complexity with smart defaults, progressive disclosure, and per-module opt-in.

**2. Gamification works when it's gentle.** Finch (self-care pet) succeeds because it is "non-judgmental" and never punishes missed days — the emotional pull of caring for a bird drives real habits. Duolingo's streak mechanics are the gold standard: at Pocket Gamer Connects London in January 2026, Space Ape co-founder Simon Hade revealed that "more than 10 million Duolingo users have a 365-day consecutive streak engaging with the app," out of roughly 50M daily active users (~20% daily). The key humane mechanic is the **streak freeze** — importantly, the Lally habit-formation research found that "missing one opportunity to perform the behaviour did not materially affect the habit formation process," which scientifically justifies grace days.

**3. Data-as-coaching is the premium differentiator.** Whoop's design lesson is that "the coaching IS the data" — your recovery score is itself the recommendation, with zero context-switching between insight and action. It compresses complexity into three layers: one headline score, trend charts, then deep detail. Replicate this: each tracker should surface one glanceable status, then progressively reveal detail.

**4. Glassmorphism is now mainstream, driven by Apple's Liquid Glass.** Apple unveiled Liquid Glass at the WWDC 2025 keynote on June 9, 2025 (iOS 26, macOS "Tahoe"). Apple's human-interface design VP Alan Dye called it "our broadest software design update ever," describing how it "combines the optical qualities of glass with a fluidity only Apple can achieve, as it transforms depending on your content or context." But it carries real accessibility and performance costs. Best practice: blur values 8-15px, `-webkit-backdrop-filter` prefix for Safari, `@supports` fallbacks, hardware acceleration via `transform: translateZ(0)`, and never over-apply to large areas.

**5. PWA is the right choice for cost, reach, and instant updates — with notification caveats.** iOS 16.4+ supports Web Push but only when the PWA is installed to the Home Screen, requires an explicit user gesture, and offers no reliable on-device scheduled/local notifications and no Background Sync.

## Details

### Feature-by-feature specification

**1. Pill & Medication Tracker.** Best-in-class pattern (from MedTracker/CareClinic case studies and DoseMed): card-based dashboard with a centered pop-up reminder, "supportive companion not clinical tool" tone, progress ring confirming each logged dose, pill inventory/refill counting (users literally count pills in bottles today), and adherence history. Include: customizable per-med schedules (sound/vibration/voice), a built-in medicine identity library (shape/color), multiple profiles for caregivers, and local-first privacy (DoseMed's differentiator is local storage). Streak/adherence percentage should be visible but shame-free.

**2. Supplement Tracker (creatine, protein, vitamins).** The dedicated creatine apps (iCreatine, Creatine Today, My Creatine, CreaTrack) converge on: one-tap dose logging, progress ring + streak/flame widget, a **live saturation percentage** based on consistency, personalized dose by bodyweight, optional loading-phase planner (100% in 7 days vs 28), cycling/break planner, and "stop reminders once goal reached." For general supplements (SuppTrack, FitReelix, CareClinic): per-product schedules attached to stacks, weekday/weekend/training-day/rest-day repeat rules, cycle planners with mandatory off-cycles (e.g., ashwagandha), inventory + "running low" reminders, and AI label-scan to auto-extract product/dose. Research note to surface in-app: creatine timing doesn't matter, consistency does.

**3. Food & Nutrition Tracker.** The single most important metric is **actions-per-log**. Offer tiered input: (a) quick-add calories/macros, (b) barcode scan, (c) saved meals/recipes for one-tap re-log, (d) AI photo/voice logging (the emerging default; MyFitnessPal added Meal Scan and Voice Log). MyFitnessPal moved barcode scanning to Premium effective October 1, pricing it at "$19.99 a month or $79.99 a year" (existing users kept free access until September 30), which triggered a mass migration to free alternatives — so keep core logging free. Show a per-day/meal/week nutritional breakdown. Given your bachelor audience, default to a simple macro + calorie view with detail on demand rather than micronutrient overload.

**4. Water Intake Tracker.** Pattern (WaterMinder, Waterllama, Hydro Coach): quick one-tap cup logging from app/widget/watch; personalized daily goal by weight/activity/climate; customizable quick-access beverages with hydration ratios; smart reminders that stop once goal is met; streak of consecutive goal-days; and delight (Waterllama's animal characters + confetti on goal). Key UX lesson from the Dropkick case study: strip the setup screen and extraneous profile elements — reminders that "did the job but weren't annoying or too easy to dismiss." Allow typed amounts, not just a slider.

**5. Gym & Workout Timing.** Hevy is the reference — its official site states "The #1 workout tracker. Loved by 16+ million athletes": fast set-by-set logging (reps/weight/RPE), built-in **configurable rest timer** with notification, plate calculator, reusable templates/routines, previous-performance review for progressive overload, PR tracking, and haptic feedback. Strong prioritizes precise timer control; add session/gym-schedule reminders. Works offline is table stakes (Hevy, Strong, FitNotes all do). Consider light social/streak accountability without making it a social network.

**6. Micro-Finance / Expense Tracking.** For young adults/bachelors, simplicity wins: research shows complex budgeting apps have high abandonment and the average user tries 3-4 apps before one sticks. Pocket Clear's "two buttons: Money In, Money Out" and Cashew's aesthetic-first approach are the models. Provide: fast manual expense entry with categories, envelope-style or simple category budgets (Goodbudget model), a monthly spend overview that builds *awareness* (seeing "$400 on delivery" changes behavior), and optional recurring bills. Skip bank-sync complexity for MVP. The goal is awareness, not a perfect zero-based budget.

**7. Shopping Cart / Wishlist.** Pattern (Listful, Wishupon, and the Notion "Shopping Wishlist" template): bullet-list items with price, a **running total/estimated wishlist value** (a requested, under-served feature — great for "want vs need" discipline), **want-vs-need level assessment** per item, category/store/brand grouping with per-category subtotals, drag-drop sort, quantity × price calculation, and a "move out-of-stock to a bin" flow. Framing goal: reduce impulse purchases and be intentional.

**8. Notes App.** Two distinct jobs (per Google Keep vs Apple Notes analysis): **quick capture** (sub-second launch, widget, share-sheet, Siri/shortcut, voice) vs **structured notebook** (folders, tags, rich text, tables). For this app, prioritize frictionless quick capture with an "inbox," then lightweight tags/color-coding (Keep model) and optional reminders on notes. Auto-save always.

**9. Task Management & Reminders.** Recurring tasks with flexible repeat rules, one-time reminders, priority levels, and a today/upcoming view. Learn from Notion's block flexibility but avoid its trap — users "waste hours rearranging digital furniture." Opinionated structure beats infinite flexibility for a consumer habit app.

### Cross-cutting design system

**Glassmorphism / Liquid Glass.** On web, translate SwiftUI's `.glassEffect()` to: layered translucent gradient + `backdrop-filter: blur(~30px) saturate(180%)` + a masked gradient rim (using `mask`/`mask-composite` for gradient borders on rounded corners) + subtle border and shadow. Compose glass as three conceptual layers (highlight, shadow, illumination). For true refraction (beyond blur), use SVG `feDisplacementMap` + `feSpecularLighting` — but this only works reliably in Chromium and can hurt INP; isolate filtered nodes with `contain: strict`, `isolation: isolate`, and `will-change: transform`. **Accessibility is mandatory:** test text contrast against the mid-tone of the backdrop (4.5:1 per WCAG 1.4.3), add a subtle dark tint `rgba(0,0,0,0.15)` over busy backgrounds, and ship a `prefers-reduced-transparency` opaque fallback (supported Chrome 118+, Safari 17+; iOS Settings > Accessibility > Display & Text Size > Reduce Transparency).

**Color palette.** Health/wellness color psychology: blue = calm/trust, green = health/growth/balance, coral/orange = energy/friendliness, and consistent color-coding (e.g., green for health metrics, a warm accent for action buttons). Recommended "fun but mature" system for a young-adult audience: a deep indigo/near-black dark-mode base (premium, modern, easy on glass), with functional accent hues per module — serene blue (#A4D8E1-family) for water/calm, vibrant fern/healing green (#6BBF73-family) for nutrition/streaks, warm sunset coral (#FF6F61-family) for energy/gym/action, gentle lavender (#E6D4E0-family) for notes/mind, warm sand (#D8C4A7-family) neutral for finance. Keep the palette limited; avoid overloading with too many colors.

**Animation patterns.** Framer Motion (now "Motion") is the React standard: declarative `motion` components with `initial`/`animate`/`exit`, `whileHover`/`whileTap`/`drag` gestures, `variants` + staggered transitions, `layoutId` for shared-element transitions, and **spring-based transitions for natural motion**. Best practices: animate only `transform`/`opacity`; avoid inline style objects (they recreate on every render); virtualize long lists; use `layout` prop judiciously. Smooth animations are associated by users with trust and quality, and a staggered-animation onboarding reportedly lifted completion by 31%. Always honor `prefers-reduced-motion` and confirm keyboard nav. Use Lottie for richer celebratory moments (confetti on goal completion, like Waterllama). Signature micro-interactions: progress-ring fills, streak flame pulse, spring scale on button press, card scale-from-tap-point for modals.

**PWA vs Native — the verdict.** Build a **PWA** for: single codebase across iOS/Android/desktop, no app-store gatekeeping or 15-30% commission, instant updates without review, SEO/shareability, and dramatically lower cost. Accept the trade-offs: (1) **iOS reminders are the real risk** — Web Push works only after Home-Screen install (iOS 16.4+), needs a user gesture, has lower delivery rates, and there is no reliable on-device scheduling or Background Sync. For a medication tracker where on-time alerts are safety-relevant, drive reminders from a server via Web Push (VAPID keys + the `web-push` library, or FCM), and/or wrap the app with **Capacitor** for guaranteed native local notifications. Design a fallback strategy (in-app unread badges, email for critical events). (2) Manual "Add to Home Screen" install (no auto-prompt on iOS). (3) Limited device APIs (Bluetooth/NFC restricted).

### Recommended technical stack (2025-2026)
- **Frontend:** React SPA + **Vite** (cleaner offline-first fit than Next.js when SEO isn't needed; Next.js struggles with true offline-first chunk caching).
- **PWA/service worker:** **vite-plugin-pwa** (uses Workbox v7; `generateSW` for app-shell precache, or `injectManifest` for custom logic; supports Workbox `backgroundSync` queues — noting iOS lacks Background Sync).
- **Local storage / offline-first:** **Dexie.js** over IndexedDB (used across 100,000+ sites/apps; live queries via `dexie-react-hooks`; ~29KB gzipped). Consider RxDB only if you need reactive sync/CRDTs.
- **Sync (optional, add later):** **Dexie Cloud** (tightest Dexie integration), **Supabase** (Postgres + Row-Level-Security + realtime; from $25/mo; acquired local-first engine Triplit in 2025), or **PocketBase** (single Go binary + SQLite + SSE realtime; cheapest, ideal for local-first MVP). Avoid CRDT complexity for a single-user app.
- **Notifications:** Web Push (VAPID / `web-push` npm, or FCM); server-scheduled for reliability; Capacitor wrapper if native-grade reminders are required.
- **Animation:** Framer Motion + Lottie. **Styling:** Tailwind CSS with a glass utility layer.

### Streak & habit psychology to bake in
- **"Don't break the chain" (Seinfeld method):** visual growing chain of completed days.
- **Streak freeze / grace days:** protect long streaks (a user who loses a 200-day streak may never return); set a *low* bar to extend a streak and separate "streak" from "daily goal" (Duolingo's most impactful change). Store timestamps in UTC, compute in local time using IANA timezone IDs.
- **Loss aversion** (Kahneman & Tversky, "Prospect Theory," *Econometrica*, 1979 — "losses loom larger than gains"; loss-aversion coefficient λ≈2.25 estimated in their 1992 follow-up) is why streaks retain — a streak is experienced as "days I could lose."
- **Habit timing:** Lally, van Jaarsveld, Potts & Wardle (2010, UCL, *European Journal of Social Psychology*) found, per the paper's abstract, that "the time it took participants to reach 95% of their asymptote of automaticity ranged from 18 to 254 days" (median 66) — not the "21-day myth" (which came from Maxwell Maltz's 1960 *Psycho-Cybernetics*). Crucially, "missing one opportunity to perform the behaviour did not materially affect the habit formation process" — justifying your grace-day design.

## Recommendations

**Stage 1 — MVP (weeks 1-6): Prove the core loop.** Ship 3 modules that share one engine: **Water, Supplements/Pills, and Tasks/Reminders** — the highest-frequency, lowest-friction trackers. Build the offline-first spine (React + Vite + vite-plugin-pwa + Dexie), the glassmorphic design system with accessibility fallbacks, one-tap logging, progress rings, and the streak engine with freeze/grace days. Reminders: in-app + Web Push (accept the iOS install requirement). *Benchmark to advance:* if Day-7 retention of test users clears ~30-40% and users log ≥1 module daily, proceed.

**Stage 2 — Expand trackers (weeks 7-14):** Add **Food/Nutrition (with AI photo/voice logging), Gym (rest timer + templates), Expenses (Money In/Out simplicity), Notes (quick capture), Wishlist (running total + want/need).** Add home-screen widgets and Lottie celebrations. *Benchmark:* if users adopt ≥3 modules and actions-per-log stays low (aim ≤10 for food), you have product-market-fit signals.

**Stage 3 — Retention & polish (weeks 15+):** Add cloud sync (Dexie Cloud/Supabase), correlations/insights (Bearable-style "what improves my mood/energy"), Whoop-style data-as-coaching summaries, and optional gentle gamification (a companion/avatar à la Finch). *Benchmark:* if Day-30 retention and streak-holders grow, invest in a Capacitor native wrapper to fix iOS reminder reliability and unlock the App Store.

**Thresholds that would change the plan:** If on-time reminders prove unreliable enough to hurt the medication use-case (user complaints, missed-dose reports), **prioritize the Capacitor native wrapper immediately** — do not ship medication reminders as a core promise on a pure PWA. If users find the all-in-one overwhelming (Bearable's failure mode), **cut default-visible modules** and make everything opt-in.

## Caveats
- **Reminder reliability is the central technical risk.** A pure PWA cannot guarantee precisely-timed local notifications, and iOS requires Home-Screen install for any Web Push. For medication — where a missed alert has real consequences — do not treat on-device PWA scheduling as reliable; use server-driven Web Push and/or a Capacitor native wrapper. This is a genuine architectural decision, not a minor detail.
- **Several retention statistics are vendor/agency figures, not independently audited** (e.g., streak-retention multipliers, churn-reduction percentages). The Duolingo "10M+ 365-day streaks" figure (Simon Hade, PocketGamer.biz, Jan 2026) and the Lally 66-day finding are well-sourced; treat marketing-blog percentages as directional.
- **Glassmorphism can fail accessibility** if applied carelessly; the W3C and MDN note `prefers-reduced-transparency` still has limited browser availability (Chrome/Safari yes, Firefox pending), so ship robust opaque fallbacks rather than relying on the media query alone.
- **Some cited review/comparison sites are commercial competitors** of the apps they review (e.g., alternative trackers ranking themselves #1); feature facts were cross-checked against official app-store listings where possible, but pricing and free-tier details change frequently — verify current terms before finalizing your own monetization.
- **Scope risk:** nine modules in one app is ambitious. The Bearable lesson is that breadth can overwhelm; enforce per-module opt-in and progressive disclosure from day one.

---

## What changed since this was written

This document is kept verbatim as the original research. The actual build scope was narrowed
after discussion — see [`docs/ROADMAP.md`](./ROADMAP.md) for the current Stage 1/2/3 plan and
[`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) for the technical decisions actually implemented
(which adapt some recommendations above — e.g. Supabase was chosen as the sync backend from the
start rather than deferred, per the user's explicit preference).
