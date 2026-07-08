# Code Reviewer's Guide

A fast orientation for reviewing this repo: where to focus, what to skip, what's
already verified, and which choices are intentional. **Current state: all green** —
the frontend + guardrail suites pass, the build is deterministic and the committed
bundle is in sync with source, CI + Pages deploy green. (The backend and its test
suite moved to the private LongWave-Dev-Admin repo, alongside the admin console.)

## 60-second orientation

- **What it is:** a bilingual (EN/JA) jobs board. The public site is **one self-contained
  HTML file** (`longwave-dev.html`) assembled by `build.sh` from per-feature sources under
  `src/`. This repo is **only** that public site. The backend (JSON API + ATS-scraping
  worker) and the admin console live together in the private companion repo
  (LongWave-Dev-Admin); the site hydrates from that API when served by it.
- **The golden rule:** **zero runtime dependencies.** The frontend is one shared-scope IIFE
  (no bundler/framework). Tests use `node --test`. "Why no React/webpack?" — that's the
  deliberate constraint.
- **Read first:** `src/core/logic.js` — pure, DOM-free domain logic (classify, filter, salary
  parse, routing, the application cap). It's unit-tested here, and the backend vendors a
  byte-identical copy so UI and server agree by construction. It's the spine.
- **Safety net:** CI runs the test suite, a **byte-exact freshness gate** (committed bundle
  must equal a fresh `build.sh`), a bundled-JS syntax check, and a **guardrail suite** that
  blocks client-data / external-call / secret regressions in the shipped bundle.

## Where to spend review time

1. **`src/core/logic.js`** (199 LOC) — the pure, shared correctness spine. Fully tested.
2. **`src/features/modals/`** (lead-forms.js et al.) — the lead/form flow: one file per
   modal + a single OVERLAYS registry in overlay-wiring.js, focus trap, the Japan-residence
   gate.
3. **`src/core/app.js` · `i18n.js` · `init.js`** — hash router, language apply/persist, the
   `/api/health` probe + progressive hydration (embedded snapshot → live `/api`).
4. **`src/features/{jobs,companies,articles,cv,home}/`** — DOM rendering. Untrusted strings go
   through `esc()` before `innerHTML`; worth spot-checking that invariant in any new sink.

> All `src/**/*.js` concatenate into **one shared-scope IIFE** (`core/intro.js` opens it,
> `core/outro.js` closes it). Functions call each other by bare name; load order is the `JS`
> array in `build.sh`. This coupling is the main "later" refactor.

## Skip these — generated, don't line-review

| File | Why skip |
|---|---|
| `longwave-dev.html` (~4,900 ln) | Built from `src/`; CI proves it equals source. |
| `src/features/partners/partners-logos.js` (~1,380 ln) | Generated roster + inlined logo data URIs. |
| `src/core/i18n-data.js` (~200 ln) | EN/JA dictionary (parity-tested). |
| `src/core/fonts.css` | Self-hosted webfonts inlined as woff2 data URIs. |
| `src/core/data.js` | Curated demo jobs/companies (offline/Pages fallback set). |

**Not in the repo:** the real client roster (HRMOS data) lives only in the private
LongWave-Dev-Admin repo (`backend/data/`, gitignored even there). The public site ships
only the curated demo set and hydrates real data from `/api`.

## Already verified — don't redo (CI-enforced)

- Pure logic: classify / filter / salary / age / route / id-normalize (`logic.test.js`)
- EN/JA key parity + every `data-i18n` resolves (`i18n.test.js`, `guardrails`)
- **Guardrails:** the shipped bundle has no client data / no external calls / no secrets
  (verified to *fire* on a regression)
- The backend's security properties (auth, SSRF guard, rate limiting, body caps, CSV
  formula-injection, the application cap) are covered by its own suite in
  LongWave-Dev-Admin — review them there.

Run everything locally: `npm run check`. Enable the pre-commit hook: `npm run hooks`.

## Intentional decisions — *not* bugs

- **Zero deps / no framework / no bundler** — a hard product constraint.
- **The bundle is committed** — makes the repo double-clickable + is the Pages entry point;
  CI's freshness gate keeps it honest.
- **`intro.js` / `outro.js` don't parse standalone** — they're the IIFE open/close fragments;
  only the assembled `<script>` is valid JS (CI checks that one).
- **Forms say "contact us at longwave.co.jp" on the live Pages site** — correct: Pages has no
  backend, so the form is honest instead of faking a "saved!" success. Against the backend
  (repo: LongWave-Dev-Admin) it posts normally.

## Known open items & trade-offs (context, not defects)

- **Frontend↔backend job contract:** the detail modal renders ~11 rich JD fields that exist
  only in the offline snapshot, not the DB, so hydrating from `/api` shows a thinner page.
  Fix scoped; needs a product call on how rich a served JD should be.
- **The backend vendors `core/logic.js`** (a byte-identical copy at
  `backend/src/shared/logic.cjs` in LongWave-Dev-Admin). When you change `src/core/logic.js`
  here, re-copy it there — lifting it into a shared package is the eventual fix.
- **The modal/DOM interaction layer** (`src/features/modals/`, now split per concern) has no
  automated tests (zero-dep rule makes jsdom awkward — logic is pushed into `logic.js` instead).
- **Owner decisions (not code):** git history still contains the removed client roster AND the
  moved backend (scrub is destructive, pending sign-off); the partner roster names real
  clients (consent); the privacy policy has APPI disclosure gaps (Manatal US transfer,
  retention, named controller).

## Run it

```sh
# from the repo root — no install step (zero deps)
npm run check              # build + frontend/guardrail tests
node --test                # the tests alone
bash build.sh              # regenerate longwave-dev.html from src/
open longwave-dev.html     # the site runs offline, straight from a file
```

The backend and admin console run from the LongWave-Dev-Admin repo (`npm run api` +
`npm start` there).

Start reading at `src/core/logic.js` → `src/features/modals/` → `src/core/app.js`:
the correctness spine, the DOM/interaction layer, and the router/hydration glue — the
places a real bug would hide in this repo.
