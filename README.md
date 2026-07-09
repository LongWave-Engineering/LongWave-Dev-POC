# LongWave Dev — Bilingual Jobs in Japan (POC)

[![CI](https://github.com/naganami-learner/longwave-jobs-poc/actions/workflows/ci.yml/badge.svg)](https://github.com/naganami-learner/longwave-jobs-poc/actions/workflows/ci.yml)
[![Release](https://github.com/naganami-learner/longwave-jobs-poc/actions/workflows/release.yml/badge.svg)](https://github.com/naganami-learner/longwave-jobs-poc/actions/workflows/release.yml)

A bilingual (EN / 日本語) job board POC for **LongWave Dev**, connecting bilingual
and international engineers with Japan's leading product companies. Job data is
synced from HRMOS.

## Just want to look at it?

Open **[`longwave-dev.html`](longwave-dev.html)** — double-click it and it opens
in your browser. It's a single, self-contained file (all CSS, JS, fonts and job
data inlined), so it needs no server and no build step to view.

## Backend & admin (separate repo)

This repo is **just the public site** — the main jobs-board UI. The backend
(Jobs/Articles/Leads/Partners API, ATS sync worker, Manatal export, PDF JD import,
OpenAPI contract) and the admin console both live in the private companion repo
[**LongWave-Dev-Admin**](https://github.com/LongWave-Engineering/LongWave-Dev-Admin).
The site works entirely standalone from its embedded demo data; when it's served by
that backend it hydrates live data from `/api` (see `src/core/app.js`).

## Architecture

See **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** for how the system fits together
(this static frontend + the backend in the admin repo) with diagrams (ATS sync, the jobs
API, sign-up/leads), tech choices, and a migration path. The pure domain logic in
[`shared/logic.js`](shared/logic.js) is bundled into the site and unit-tested here, and
the backend keeps a vendored, byte-identical copy so both sides classify jobs the same way.

## Project layout

The site is **authored as small files grouped by feature** and concatenated into the
single `longwave-dev.html` by [`build.sh`](build.sh). Edit the source files under
`src/`, never the generated `longwave-dev.html`. Everything cross-cutting lives in
`src/core/`; each user-facing feature owns a folder under `src/features/` containing
its own `.html` / `.css` / `.js` — so a dev can open one folder and see the whole feature.

```
longwave-dev.html              ← the built, double-clickable site (GENERATED — don't edit)
build.sh                       ← concatenates src/ → longwave-dev.html (ordered manifest inside)
src/
├── core/                      ← shared foundation (loaded first / cross-cutting)
│   ├── base.css                  design tokens (:root: brand colours), reset, base type
│   ├── buttons.css               button system (sky primary, banana CTA, ghost…)
│   ├── layout.css                page show/hide + fade transition, hero, section heads, avatars
│   ├── motion.css                scroll-reveal + staggered entrance (one Apple-style easing curve)
│   ├── responsive.css            media queries, reduced-motion, print
│   ├── intro.js / outro.js       open / close the shared IIFE
│   ├── data.js                   built-in demo fallback data + SPECS
│   ├── i18n.js                   EN/JA strings, t(), helpers, HRMOS override, per-job enrichment
│   ├── app.js                    applyLang, hash router, nav, header-scroll, reveal
│   ├── init.js                   bootstrap
│   └── head.html                 <head>: meta, title, favicon, web fonts
└── features/                  ← one folder per feature (html + css + js together)
    ├── header/                   header.html, header.css   (nav + round logo badge)
    ├── home/                     home.html/.css/.js + home-cta.css   (hero, why-us, teaser, signup band)
    ├── jobs/                     jobs.html/.css/.js   (filters, grid, cards, pick-a-filter prompt)
    ├── companies/                companies.html/.css/.js   (full client roster + "ask about roles" inquiry)
    ├── partners/                 partners.css/.js + partners-logos.js (rotating partner-logo wall: home hero 3 rows, jobs placement strip; real logos inlined as data-URIs)
    ├── waves/                    waves.css   (CSS-only LongWave wave motif: footer crest, CTA-band wave, animated heading accent)
    ├── articles/                 articles.html/.css/.js
    ├── testimonials/             testimonials.css/.js   (shared quote grid: engineers + HR voices)
    ├── post/                     post.html   (hire page; renders testimonials + HR voices)
    ├── cv/                       cv.html/.css/.js   (Japanese 履歴書 / 職務経歴書 builder)
    ├── footer/                   footer.html, footer.css
    └── modals/                   modals.html/.css/.js   (job-detail + signup, focus trap)

shared/                        ← @longwave/logic — ★ pure domain logic (LW.*), bundled into
                                 the site by build.sh and vendored by the backend (admin repo)
test/                          ← Node built-in test runner (node:test) — zero dependencies
├── logic.test.js                 unit tests for every pure function in shared/logic.js
├── i18n.test.js                  EN/JA dictionary parity + helpers
└── guardrails.test.js            shipped-bundle invariants (no client data / external loads / secrets)
.github/workflows/              ci.yml (test + package) · release.yml (tag → GitHub Release)
package.json                   ← npm test / npm run build (zero runtime deps)
```

### Pure logic lives in `shared/logic.js`

Anything pure (no DOM, no app state) — specialty classification, address → prefecture,
salary parsing, the filter predicate, age calc — lives in
[`shared/logic.js`](shared/logic.js) as the `LW` namespace. It works **both** inside
the browser bundle *and* when `require()`'d by Node, so the unit tests exercise the exact
code that ships. Add testable logic here, not in the render files.

### Build

```bash
./build.sh        # regenerates longwave-dev.html from src/
```

`build.sh` holds three ordered manifests (CSS = cascade order, JS = load order inside one
shared IIFE that `core/intro.js` opens and `core/outro.js` closes, BODY = document order).
To add a file, drop it in the right feature folder and add it to the matching manifest.
After building, open `longwave-dev.html` in a browser.

## Tests

```bash
npm test          # runs the Node built-in test runner over test/
# or directly:
node --test
```

No dependencies and no install step — tests use Node's built-in `node:test` +
`node:assert` (Node 20+). They cover the pure logic in `shared/logic.js`, EN/JA i18n
parity, and the guardrail invariants on the shipped bundle. Shift-left: run
`npm test` before you commit.

## CI/CD pipeline

GitHub Actions, in two workflows:

**CI — [`.github/workflows/ci.yml`](.github/workflows/ci.yml)** (every push to `main` + every PR):
1. `test` — syntax-checks the bundled JS, runs the test suite (`node --test`), and
   **fails if `longwave-dev.html` is out of date with `src/`** (so a stale bundle
   can't be merged).
2. `package` — on `main`, rebuilds the site and uploads `longwave-dev.html` as a
   downloadable build artifact (90-day retention).

**CD — [`.github/workflows/release.yml`](.github/workflows/release.yml)** (on a version tag):
- Re-runs the tests, builds, and cuts a **GitHub Release** with `longwave-dev.html`
  and a full source zip attached, plus auto-generated notes.

```bash
# Ship a release (tests must pass) — produces a downloadable Release:
git tag v1.1.0 && git push origin v1.1.0
```

[`.github/dependabot.yml`](.github/dependabot.yml) keeps the pipeline's actions
patched. The site is live on **GitHub Pages**
(https://longwave-engineering.github.io/LongWave-Dev-POC/) and is also delivered as
the build artifact (per push) and the Release asset (per tag).

## Editing notes

- **Brand colors** are CSS variables at the top of `src/core/base.css`, sampled from
  the logo: `--sky` `#01A7E3` (the cloud — primary), `--navy` `#1D4670` (the wave —
  dark surfaces), and `--banana` `#FFD23F` (yellow accent). Change them there and they
  propagate everywhere. The real **LongWave logo** (a round badge) lives inline in
  `src/features/header/header.html` and `src/features/footer/footer.html`.
- **Animations** (page fade transition, modal pop, header scroll-shadow, logo
  hover) are CSS-driven and automatically disabled under `prefers-reduced-motion`
  (see end of `src/core/responsive.css`).
- **Links** (post-a-job page, LinkedIn, company site) live at the top of
  `src/core/intro.js`.
- **Job data**: the bundle ships the curated demo set in `src/core/data.js` (so the
  file works offline and on Pages). When the site is served by the backend (repo:
  LongWave-Dev-Admin), it hydrates live jobs/articles from `/api` instead.
- **Jobs page UX:** results are hidden until the user picks at least one filter
  (Carsensor-style), with a "browse all roles" escape hatch. See `renderJobs()`
  in `src/features/jobs/jobs.js`.
