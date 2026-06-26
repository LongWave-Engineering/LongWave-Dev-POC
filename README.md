# LongWave Dev — Bilingual Jobs in Japan (POC)

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
│   ├── 10-data.js           built-in demo fallback data
│   ├── 20-i18n.js           EN/JA strings, t(), language state, HRMOS data override
│   ├── 30-jobs.js           job cards, filters, renderJobs, filter selects
│   ├── 40-home.js           home teaser, companies, articles, reviews
│   ├── 50-modals.js         job-detail + sign-up modals, focus trap
│   ├── 60-app.js            applyLang, listeners, hash router, nav, reveal
│   ├── 70-cv.js             Japanese CV / rirekisho builder
│   ├── 80-init.js           bootstrap
│   └── 99-outro.js          IIFE close
└── data/
    └── hrmos-data.js        generated job data — window.__HRMOS_DATA__ (synced from HRMOS)
```

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

## Editing notes

- **Links** (post-a-job page, LinkedIn, company site) live at the top of
  `src/js/00-intro.js`.
- **Job data** in `src/data/hrmos-data.js` is generated from the HRMOS sync.
  If it's absent, the app falls back to the demo data in `src/js/10-data.js`.
- **Jobs page UX:** results are hidden until the user picks at least one filter
  (Carsensor-style), with a "browse all roles" escape hatch. See `renderJobs()`
  in `src/js/30-jobs.js`.
