# Code Reviewer's Guide

A fast orientation for reviewing this repo: where to focus, what to skip, what's
already verified, and which choices are intentional. **Current state: all green** —
96 frontend + 61 backend tests pass, build is deterministic and the committed bundle
is in sync with source, CI + Pages deploy green.

## 60-second orientation

- **What it is:** a bilingual (EN/JA) jobs board. The public site is **one self-contained
  HTML file** (`longwave-dev.html`) assembled by `build.sh` from per-feature sources under
  `src/`. A separate Node backend (`backend/`) serves a JSON API and runs an
  ATS-scraping worker. The admin console is its own repo (LongWave-Dev-Admin), a
  static SPA that calls the API over CORS.
- **The golden rule:** **zero runtime dependencies.** Frontend is one shared-scope IIFE
  (no bundler/framework); backend is Node 22 built-ins only (`node:http`, `node:sqlite`).
  Tests use `node --test`. "Why no React/Express/webpack?" — that's the deliberate constraint.
- **Read first:** `src/core/logic.js` — pure, DOM-free domain logic (classify, filter, salary
  parse, routing, the application cap). It's unit-tested **and** imported verbatim by the
  backend, so UI and server agree by construction. It's the spine.
- **Safety net:** CI runs both test suites, a **byte-exact freshness gate** (committed bundle
  must equal a fresh `build.sh`), a bundled-JS syntax check, and a **guardrail suite** that
  blocks client-data / external-call / secret regressions in the shipped bundle.

## Where to spend review time (~3,200 hand-written LOC)

1. **`src/core/logic.js`** (199 LOC) — the pure, shared correctness spine. Fully tested.
2. **`backend/src/api.js` · `models.js` · `db.js` · `server.js`** — the security surface:
   constant-time auth + fail-closed default token, XFF-untrusted rate limiting, body caps,
   parameterized SQL, the request-crash guard, security headers.
3. **`src/features/modals/` (lead-forms.js et al.) · `backend/src/ats/generic.js` · `import.js`** —
   the lead/form flow (one file per modal + a single OVERLAYS registry in overlay-wiring.js)
   and ATS ingest (`generic.js` has the SSRF guard on admin-supplied URLs).
4. **`src/core/app.js` · `i18n.js` · `init.js`** — hash router, language apply/persist, the
   `/api/health` probe + progressive hydration (embedded snapshot → live `/api`).
5. **`src/features/{jobs,companies,articles,cv,home}/`** — DOM rendering. Untrusted strings go
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

**Not in the repo:** `backend/data/hrmos-data.js` (the real client roster) is gitignored and
lives backend-only; the public site ships only the curated demo and hydrates real data from
`/api`. On a fresh clone that file is absent — tests that need it *skip*, they don't fail.

## Already verified — don't redo (13 test files, CI-enforced)

- Pure logic: classify / filter / salary / age / route / id-normalize (`logic.test.js`, `data.test.js`)
- API auth 401/200, PII read-gating, hidden-job non-leak (`api-http.test.js`)
- SSRF: private-IP + IPv6 + scheme blocking (`api.test.js`)
- ATS token redaction to `hasToken`; token preserved on edit
- Rate limiter ignores spoofed `X-Forwarded-For` (`ratelimit-xff.test.js`)
- Body-size cap / malformed-JSON 400 / multibyte UTF-8 (`robustness`, `body-utf8`)
- Application lifetime cap enforced in a transaction (`applications.test.js`)
- CSV export formula-injection neutralized (`manatal.test.js`)
- EN/JA key parity + every `data-i18n` resolves (`i18n.test.js`, `guardrails`)
- **Guardrails:** the shipped bundle has no client data / no external calls / no secrets
  (verified to *fire* on a regression)

Run everything locally: `npm run check`. Enable the pre-commit hook: `npm run hooks`.

## Intentional decisions — *not* bugs

- **Zero deps / no framework / no bundler** — a hard product constraint.
- **The bundle is committed** — makes the repo double-clickable + is the Pages entry point;
  CI's freshness gate keeps it honest.
- **8 of 11 ATS adapters are one-line stubs** (the TODOs) that delegate to the generic
  schema.org scraper — intentional extension points. Only Greenhouse/Lever/HRMOS are wired.
- **`intro.js` / `outro.js` don't parse standalone** — they're the IIFE open/close fragments;
  only the assembled `<script>` is valid JS (CI checks that one).
- **Forms say "contact us at longwave.co.jp" on the live Pages site** — correct: Pages has no
  backend, so the form is honest instead of faking a "saved!" success. Against the backend it
  posts normally.
- **The `console.log`s are backend-only** (server banner / seed / worker) — none ship to the browser.

## Known open items & trade-offs (context, not defects)

- **Frontend↔backend job contract:** the detail modal renders ~11 rich JD fields that exist
  only in the offline snapshot, not the DB, so hydrating from `/api` shows a thinner page.
  Fix scoped; needs a product call on how rich a served JD should be.
- **Backend imports frontend logic** via `require('../../src/core/logic.js')` — should become a
  shared peer before the backend is deployed independently.
- **The modal/DOM interaction layer** (`src/features/modals/`, now split per concern) has no
  automated tests (zero-dep rule makes jsdom awkward — logic is pushed into `logic.js` instead).
- **Owner decisions (not code):** git history still contains the removed client roster (scrub
  is destructive, pending sign-off); the partner roster names real clients (consent); the
  privacy policy has APPI disclosure gaps (Manatal US transfer, retention, named controller).

## Run it

```sh
# from the repo root — no install step (zero deps)
npm run check              # build + frontend tests + backend tests
node --test                # frontend + guardrail tests only
cd backend && node --test  # backend (auth / SSRF / rate-limit / import)
bash build.sh              # regenerate longwave-dev.html from src/
open longwave-dev.html     # the site runs offline, straight from a file

# backend (serves /api + the built site; admin is a separate app), Node 22+:
cd backend && ADMIN_TOKEN=... node src/server.js
```

Start reading at `src/core/logic.js` → `backend/src/api.js` → `src/features/modals/`:
the correctness spine, the security surface, and the DOM/interaction layer — the three
places a real bug would hide.
