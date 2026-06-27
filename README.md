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

## Project layout

The site is **authored as small per-feature source files** and concatenated into
that single `longwave-dev.html` by [`build.sh`](build.sh). Edit the source files,
not the bundled HTML.

```
longwave-dev.html        ← the built, double-clickable site (generated — do not edit by hand)
build.sh                 ← concatenates everything in src/ back into longwave-dev.html
src/
├── html/                ← page structure, one file per section
│   ├── 00-head.html         <head>: meta, title, favicon, web fonts
│   ├── 10-header.html       sticky header + nav + language toggle
│   ├── 20-page-home.html    landing page (hero, "why us", hot roles teaser)
│   ├── 30-page-jobs.html    jobs page (filter sidebar + results grid)
│   ├── 40-page-companies.html
│   ├── 50-page-articles.html
│   ├── 60-page-post.html    "post a job" page + reviews
│   ├── 70-page-cv.html      Japanese rirekisho / 職務経歴書 builder
│   ├── 80-footer.html
│   └── 90-modals.html       job-detail modal + sign-up modal
├── css/                 ← styles, one file per feature (loaded in filename order)
│   ├── 01-base.css          design tokens (:root), reset, base type
│   ├── 02-buttons.css
│   ├── 03-header.css
│   ├── 04-pages-hero.css    page switching, hero, section headers
│   ├── 05-home.css
│   ├── 06-jobs.css          filters, tags, jobs grid
│   ├── 07-companies.css
│   ├── 08-reviews-articles.css
│   ├── 09-cta-footer.css
│   ├── 10-modals.css
│   ├── 11-reveal.css        scroll-reveal animations
│   └── 12-responsive.css    media queries (load last)
├── js/                  ← app logic, one IIFE split into parts (loaded in filename order)
│   ├── 00-intro.js          IIFE open, "use strict", editable LINKS
│   ├── 05-logic.js          ★ pure, framework-free domain logic (LW.*) — unit-tested
│   ├── 10-data.js           built-in demo fallback data
│   ├── 20-i18n.js           EN/JA strings, t(), language state, HRMOS override, job enrichment
│   ├── 30-jobs.js           job cards, render, filter selects (filtering lives in 05-logic)
│   ├── 40-home.js           home teaser, companies, articles, reviews
│   ├── 50-modals.js         job-detail + sign-up modals, focus trap
│   ├── 60-app.js            applyLang, listeners, hash router, nav, reveal
│   ├── 70-cv.js             Japanese CV / rirekisho builder
│   ├── 80-init.js           bootstrap
│   └── 99-outro.js          IIFE close
└── data/
    └── hrmos-data.js        generated job data — window.__HRMOS_DATA__ (synced from HRMOS)

test/                    ← Node built-in test runner (node:test) — no dependencies
├── logic.test.js            unit tests for every pure function in 05-logic.js
└── data.test.js             integrity checks on the real HRMOS data (enums, ids, classification)
.github/workflows/ci.yml ← CI: runs tests + fails if longwave-dev.html is stale vs src/
package.json             ← npm test / npm run build scripts (zero runtime deps)
```

### Pure logic lives in `05-logic.js`

Anything that's pure (no DOM, no app state) — specialty classification, address →
prefecture, salary parsing, the filter predicate, age calc — lives in
[`src/js/05-logic.js`](src/js/05-logic.js) as the `LW` namespace. It's written to
work **both** inside the browser bundle *and* when `require()`'d by Node, so the
unit tests exercise the exact code that ships. Add testable logic here, not in the
render files.

### Why one shared IIFE split across files

All `src/js/*.js` parts share a single `(function(){ "use strict"; … })()`
scope: `00-intro.js` opens it and `99-outro.js` closes it. The numbered files
are **build inputs** — concatenate them with `build.sh` (do not load them as
standalone `<script>` tags individually).

## Build

```bash
./build.sh        # regenerates longwave-dev.html from src/
```

The build is a pure concatenation in filename order — that's why the CSS and JS
files are numbered. After running it, open `longwave-dev.html` in a browser.

## Tests

```bash
npm test          # runs the Node built-in test runner over test/
# or directly:
node --test
```

No dependencies and no install step — tests use Node's built-in `node:test` +
`node:assert` (Node 20+). They cover the pure logic in `05-logic.js` and validate
the real HRMOS data. Shift-left: run `npm test` before you commit.

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
patched. The repo stays **private**: no public URL — the site is delivered as the
build artifact (per push) and the Release asset (per tag).

## Editing notes

- **Brand colors** are CSS variables at the top of `src/css/01-base.css`:
  `--sky*` (sky blue — primary buttons, links, focus) and `--banana*`
  (banana yellow — logo, nav underline, hero/CTA glows). Change them there and
  they propagate everywhere. The SVG wave **logo** lives inline in
  `src/html/10-header.html` and `src/html/80-footer.html`.
- **Animations** (page transitions, modal pop, header scroll-shadow, logo
  hover) are CSS-driven and automatically disabled under
  `prefers-reduced-motion` (see end of `src/css/12-responsive.css`).
- **Links** (post-a-job page, LinkedIn, company site) live at the top of
  `src/js/00-intro.js`.
- **Job data** in `src/data/hrmos-data.js` is generated from the HRMOS sync.
  If it's absent, the app falls back to the demo data in `src/js/10-data.js`.
- **Jobs page UX:** results are hidden until the user picks at least one filter
  (Carsensor-style), with a "browse all roles" escape hatch. See `renderJobs()`
  in `src/js/30-jobs.js`.
