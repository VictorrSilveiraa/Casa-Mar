# Experiência premium — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sunrise loader on every page load, one signature reveal per section, and refined micro-interactions to the Casa Praiamar homepage without new dependencies.

**Architecture:** An inline head script sets `html.js`. A server-rendered `Loader` overlay animates with CSS keyframes from first paint; a tiny client controller decides when it exits (min time + hero image decoded, capped) and then sets `html[data-intro="done"]`. A single global stylesheet (`app/motion.css`) defines reveal primitives keyed on `data-reveal` / `data-visible`; one `MotionController` client component splits headings into lines and runs one `IntersectionObserver`.

**Tech Stack:** Next.js 16 App Router, React 19, CSS Modules + one global CSS file, sharp (brand crops), Playwright (`scripts/validate-site.mjs`), node:test.

**Spec:** `docs/superpowers/specs/2026-11-25-experiencia-premium-design.md`

## Global Constraints

- No new runtime dependencies. Motion JS (Loader controller + MotionController + lib/motion) < 4 KB gzip.
- Animate only `transform`, `opacity`, `clip-path`. Never `transition: all`, `ease-in`, `scale(0)`.
- Tokens: `--ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out-strong: cubic-bezier(0.77, 0, 0.175, 1)`, `--dur-reveal: 900ms`, `--dur-settle: 1400ms`, `--dur-loader-exit: 900ms`, `--reveal-distance: 28px` (18px ≤ 900px), `--z-loader: 80`.
- Loader exit: after max(1900 ms since navigation start, hero image decoded), capped at 2800 ms. Not shown on bfcache restore (`pageshow.persisted`).
- Reveals fire once (`data-visible` set, element unobserved). Observer: `threshold 0.18`, `rootMargin "0px 0px -8% 0px"`. Starts only after intro is done.
- Initial hidden states apply only under `html.js`. `prefers-reduced-motion: reduce` → opacity-only 300 ms, no transforms/clip; loader static symbol + 300 ms fade, min 400 ms.
- Hover motion only inside `@media (hover: hover) and (pointer: fine)`.
- No copy, fact, photo, palette or typography-role changes. Rules from `AGENTS.md` (no parallax / scroll-jacking) stand.

## Review Focus

1. Slow network: hero image never decodes → loader must still leave at 2800 ms and the page must be usable (covered: Task 2 test with blocked hero image).
2. Back/forward cache restore → no loader replay, content visible (Task 2 test via `page.goBack()` after navigating to `/404-test`).
3. Deep link `/#informacoes` → loader runs, then page sits at the anchor, FAQ visible (Task 3 test).
4. Keyboard user tabs into the header while scrolled down → header must not be hidden (Task 4 test).
5. Full-page screenshots and no-JS / reduced-motion runs show every section's content (Task 3 & 5 tests).

---

### Task 1: Motion foundation (tokens, primitives, controller)

**Files:**
- Modify: `app/globals.css` (tokens), `app/layout.tsx` (inline `js` script, import `./motion.css`, mount `<MotionController />`)
- Create: `app/motion.css`, `lib/motion.ts`, `components/MotionController.tsx`
- Modify: `components/SectionHeading.tsx` (h2 gets `data-reveal="lines"`)
- Test: `scripts/validate-site.mjs`

**Interfaces:**
- Produces: `splitLines(el: HTMLElement): void` — wraps words into `<span class="m-line"><span class="m-line-inner">…</span></span>` per visual line, sets `--line-index` on each inner span, marks `el.dataset.split = "true"`; no-op if already split.
- Produces: `startReveals(): () => void` — queries `[data-reveal]:not([data-visible])`, splits `lines` targets, observes, sets `data-visible="true"` once; returns disconnect.
- Produces: `onIntroDone(cb: () => void): void` — runs cb now if `document.documentElement.dataset.intro === "done"`, else on window event `praiamar:intro-done`.
- Produces CSS primitives: `data-reveal="lines" | "fade" | "image" | "image-x" | "window" | "rule" | "slide"`, optional inline `--reveal-delay`.

- [x] **Step 1: Add failing checks** in `validate-site.mjs` (1440 px run): after waiting for `html[data-intro="done"]`, `#a-casa h2[data-reveal="lines"]` exists; before scrolling, `#ambientes [data-reveal="image"]` has no `data-visible`; after `scrollIntoViewIfNeeded` + 1200 ms it has `data-visible="true"`; scroll back up and down → still exactly one `data-visible` (no re-trigger).
- [x] **Step 2: Run** `npm run build && (npm run start -- -H 127.0.0.1 &) && npm run validate:browser` → FAIL (`data-intro` never set / attribute missing).
- [x] **Step 3: Implement** tokens, `app/motion.css`, `lib/motion.ts`, `MotionController` (calls `onIntroDone(startReveals)`; until Task 2 lands, layout sets `data-intro="done"` from the inline script so the test can pass). Lines CSS: `.m-line{display:block;overflow:clip;padding-bottom:.08em;margin-bottom:-.08em}`; inner `translateY(105%)` → 0, delay `calc(var(--reveal-delay,0ms) + var(--line-index) * 100ms)`. Line split recomputes on resize (debounced 150 ms) only while `data-visible` is absent.
- [x] **Step 4: Run** validation → PASS; `npm run lint && npm run typecheck && npm test` PASS.
- [x] **Step 5: Commit** `feat(motion): reveal primitives and controller`.

### Task 2: Sunrise loader

**Files:**
- Modify: `lib/brand.ts` (add `loader` crops), `scripts/optimize-brand-assets.mjs` (emit loader parts at 2× display size)
- Create: `components/Loader.tsx`, `components/Loader.module.css`
- Modify: `app/layout.tsx` (render `<Loader />` first in `<body>`; inline script no longer sets `data-intro` itself)
- Test: `scripts/validate-site.mjs`

**Interfaces:**
- Consumes: `html.js`, tokens from Task 1.
- Produces: sets `document.documentElement.dataset.intro = "done"` and dispatches `window` event `praiamar:intro-done` exactly once.
- Brand crops (from `assets/brand/praiamar-white-original.png`): `sun {left:105, top:456, width:162, height:64}`, `house {left:105, top:521, width:162, height:68}`, `waves {left:105, top:594, width:162, height:30}`, `wordmark {left:337, top:488, width:1014, height:135}`. Parts stack inside a 162×167 box at tops 0 / 65 / 138 (as percentages of 167).

- [x] **Step 1: Failing checks:** on load, `[data-loader]` is visible within 200 ms; it is gone (`data-intro="done"`) within 3800 ms; with `page.route('**/hero-villa-*', r => r.abort())` it is still gone within 3800 ms; with `javaScriptEnabled:false` `[data-loader]` is not visible; with `reducedMotion:"reduce"` it is gone within 1200 ms; navigate to `/x`, `goBack()` → `[data-loader]` not visible.
- [x] **Step 2: Run** validation → FAIL (no loader).
- [x] **Step 3: Implement.** Keyframes per spec §6 timeline (waves 100 ms/650 ms clip L→R; house 420/700 rise in mask; sun 700/800 rise + rotate −8°→0; wordmark 900/900 clip L→R; rule `scaleX` linear 900→2600 ms). Exit: parts fade 250 ms, panel `translateY(-100%)` `--dur-loader-exit` `--ease-in-out-strong`; at exit start set `data-intro="exiting"` (hero entrance CSS keys on `exiting|done`), after exit set `done`, dispatch event, unmount. Scroll lock: `html.js:not([data-intro="done"]) body{overflow:hidden}`. Overlay `aria-hidden="true"`, `pointer-events:none` once exiting.
- [x] **Step 4: Hero entrance CSS** in `Hero.module.css` keyed on `:global(html[data-intro])`: photo `scale(1.08)→1` `--dur-settle`; h1 spans as lines (+300 ms, 0/110 ms); eyebrow/description/link fade (+520 ms, 0/60/110 ms); header opacity (+250 ms, 500 ms); scroll cue line draws once.
- [x] **Step 5: Run** validation + lint/typecheck/test → PASS. Record a 1440 px video of the load (Playwright `recordVideo`) into the scratchpad and inspect frames at 0.3 / 0.9 / 1.5 / 2.2 / 3.0 s.
- [x] **Step 6: Commit** `feat(loader): sunrise opening on every load`.

### Task 3: Section signature moments

**Files:**
- Modify: `app/page.tsx`, `app/page.module.css`, `components/SuitesShowcase.tsx`, `components/SuitesShowcase.module.css`, `components/Footer.tsx` (unchanged motion, only confirm), `components/FaqList.module.css`, `components/ResponsiveImage.tsx` (no change; reveals wrap the existing image containers)
- Test: `scripts/validate-site.mjs`

**Interfaces:** Consumes primitives from Task 1. Assignments (spec §7):

| Section | Lead | Support |
|---|---|---|
| A Casa | `.essenceImage` `image` | h2 lines; `.paragraphs` + link `fade` (delay 200 ms) |
| Suítes | `.track` `slide` (translateX 64px, 1000 ms) | h2 lines; `.cta`, `.controls` `fade` |
| Diferenciais | each `.feature` border via `rule` on a `::before` (delays 0/120/220/300 ms) | h2 lines; `.featureImage` `image` |
| Ambientes | 3 `.environmentImage` `image` (0/140/240 ms) | h2 lines; `.environmentCopy` `fade` with same delay + 120 ms |
| Hospitalidade | `.hospitalityImage` `image-x` | h2 lines; `.paragraphs` `fade` + top border `rule` |
| Experiências | `.lifestyleImage` `window` | h2 lines; description + action `fade` |
| Localização | `.locationImage` `image` | h2 lines; `.locationMeta` `rule` |
| Perguntas | h2 lines | — ; `::details-content` height transition 300 ms under `@supports (interpolate-size: allow-keywords)` |
| Convite final | `.finalImage` settle `scale(1.08)→1` (`data-reveal="settle"`) | h2 lines; text + action `fade` |

- [x] **Step 1: Failing checks:** every `main section` except `#topo` contains ≥ 1 `[data-reveal]`; after scrolling the full page at 390 and 1440 px, `document.querySelectorAll('[data-reveal]:not([data-visible])').length === 0`; deep link `/#informacoes` → after intro, `#informacoes h2` has `data-visible` and `scrollY` within 5 px of the section top minus header.
- [x] **Step 2: Run** → FAIL.
- [x] **Step 3: Implement** attributes + per-section CSS. A Casa image bleeds to the left viewport edge at ≥ 1024 px (`margin-left: calc((100vw - min(100vw - 2*var(--gutter), var(--container))) / -2)`).
- [x] **Step 4: Update** `validate-site.mjs` full-page screenshot routine to scroll top→bottom in viewport steps (wait 250 ms each) before capturing.
- [x] **Step 5: Run** validation + lint/typecheck/test → PASS; inspect 390/1440 screenshots.
- [x] **Step 6: Commit** `feat(sections): signature reveal per section`.

### Task 4: Header behaviour and micro-interactions

**Files:**
- Modify: `components/Header.tsx`, `components/Header.module.css`, `app/motion.css` (fill + underline utilities), elements receiving `data-fill`: hero `.link`, `.textLink`, `.lifestyleAction`, suites `.cta`, `Lightbox` default trigger, final CTA, footer `.action`, header `.reserve`
- Test: `scripts/validate-site.mjs`

**Interfaces:** Header sets `data-hidden="true"` when: scrolling down, `scrollY > heroHeight`, menu closed, no `:focus-within`. Clears on any upward scroll ≥ 8 px. CSS: `transform: translateY(-100%)`, 400 ms `--ease-out-strong`; none under reduced motion.

- [x] **Step 1: Failing checks (1440):** scroll to 3000 then +400 → header `data-hidden="true"`; scroll −200 → attribute absent; focus `header a` while hidden → attribute absent; at 390 with menu open, scrolling never sets it.
- [x] **Step 2: Run** → FAIL.
- [x] **Step 3: Implement** header logic (rAF-throttled scroll listener) and `[data-fill]` sweep (`::before` `clip-path: inset(100% 0 0 0)` → `inset(0)`, 320 ms in / 200 ms out, `--fill` color per element: sand on light, background on dark/photo) + nav underline (`scaleX` origin left in, origin right out, 300 ms) + `:active { transform: scale(.98) }` 120 ms. Remove the replaced `:hover { background }` rules.
- [x] **Step 4: Run** validation + lint/typecheck/test → PASS; existing boxed-action typography checks still pass.
- [x] **Step 5: Commit** `feat(interaction): header hide on scroll and refined hovers`.

### Task 5: Verification, performance, docs

**Files:** `docs/validation.md`, `AGENTS.md` (§11 note), this plan (checkboxes).

- [x] **Step 1:** Lighthouse mobile **before** (checkout `HEAD` from before Task 1 in a temp dir build, or measure first) and **after**; record perf, LCP, CLS. Accept: CLS = 0, LCP increase ≤ 300 ms; otherwise lower loader cap.
- [x] **Step 2:** Reduced-motion and no-JS runs: every section's text visible, no element with non-`none` transform from motion CSS.
- [x] **Step 3:** Measure motion JS size (`.next/static/chunks` diff, gzip) < 4 KB.
- [x] **Step 4:** Update `docs/validation.md` with real numbers; add §11 note in `AGENTS.md` about the loader and reveal system.
- [x] **Step 5:** Commit `docs(validation): premium experience results` and push.
