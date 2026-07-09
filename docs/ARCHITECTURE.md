# LongWave Dev — Architecture

This document describes **(1) the architecture as it exists today** — a static,
single-file public site (this repo) plus a zero-dependency backend + admin console
(the private **LongWave-Dev-Admin** repo) — and **(2) a proposed target architecture**
for a production build. Diagrams are [Mermaid](https://mermaid.js.org/)
and render natively on GitHub.

> **Status legend** — 🟢 exists today · 🟠 proposed (not built yet).

---

## 1. Current architecture (POC) 🟢

The POC is a **single, self-contained `longwave-dev.html`** — all CSS, JS, web fonts
and a curated demo data set are inlined, so it runs by double-clicking the file (and
on GitHub Pages) with **no server required**. When the site is served by the backend
(see [§1b](#1b-backend-as-built-)), it progressively hydrates live jobs/articles
from `/api` instead.

```mermaid
flowchart LR
    subgraph authoring["Authoring (src/)"]
        core["src/core/ + shared/<br/>tokens · layout · router · i18n · <b>shared/logic.js</b> · data"]
        feat["src/features/*<br/>header · home · jobs · companies · cv · modals · …"]
        data["src/core/data.js<br/>curated demo set (offline fallback)"]
    end
    build["build.sh<br/>(concatenate by manifest)"]
    bundle["longwave-dev.html<br/>self-contained single file"]
    browser["User's browser<br/>(hash-routed SPA, EN/JA)"]

    core --> build
    feat --> build
    data --> build
    build --> bundle --> browser

    subgraph ci["CI/CD — GitHub Actions"]
        test["node --test<br/>(unit + data tests)"]
        pkg["package → artifact"]
        rel["tag → GitHub Release"]
    end
    core -. verified by .-> test
    bundle -. uploaded by .-> pkg
    bundle -. attached by .-> rel
```

### How the pieces fit

| Concern | Today |
| --- | --- |
| **UI** | Vanilla HTML/CSS/JS, no framework. One IIFE assembled from `src/` parts by `build.sh`. |
| **Routing** | Client-side hash router (`#/jobs`, `#/companies`, …) in `core/app.js`. |
| **i18n** | `core/i18n.js` — EN/JA dictionaries + `t()`; language toggled in the client. |
| **Domain logic** | `shared/logic.js` (`LW.*`, the `@longwave/logic` package) — pure functions: specialty classification, address→prefecture, salary parsing, filter predicate, age calc. **No DOM, no state.** |
| **Data** | The curated demo set in `core/data.js` is **embedded at build time** (offline / Pages). Served by the backend, the site hydrates live data from `/api` (progressive enhancement in `core/app.js`). |
| **Forms** | The CV/rirekisho builder is **client-only** (generated + printed in-browser — no data leaves the page). Sign-up / inquiry forms POST to `/api/leads` when a backend is present; the static Pages build honestly says there's no backend instead of faking success. |
| **Tests** | `test/` via Node's built-in `node:test` — unit tests for `LW.*`, EN/JA i18n parity, and guardrail invariants on the shipped bundle. Zero dependencies. |
| **CI/CD** | `.github/workflows/ci.yml` (test + bundle-freshness gate + artifact) and `release.yml` (tag → Release). |
| **Delivery** | Built HTML ships as a CI **artifact** (per push) and a **Release asset** (per tag); the repo's root `index.html` redirects to it, served on **GitHub Pages**. |

### Current data flow 🟢

```mermaid
flowchart LR
    demo["src/core/data.js<br/>(curated demo set)"] -->|build time| bundle["longwave-dev.html"]
    bundle -->|"open file / GitHub Pages"| user["User"]
    api["backend /api<br/>(LongWave-Dev-Admin)"] -.->|"hydrates live data when<br/>the backend serves the site"| user
    user -.->|"sign up (when /api present)"| api
```

**Key trait:** the shipped file is static and self-contained; live listings and lead
capture exist when the backend serves it. Refreshing the *embedded* demo set means
rebuild + redeploy; live data refreshes via the backend's ATS sync (§1b).

---

## 1b. Backend (as built) 🟢

A **runnable, zero-dependency** backend now lives in the **private LongWave-Dev-Admin
repo** (`backend/`), next to the admin SPA that drives it: Node built-ins only —
`node:http` (server), `node:sqlite` (`DatabaseSync`), global `fetch` (ATS/Manatal).
It serves a JSON API (and, opt-in via `$LW_SITE_FILE`, this repo's built public site),
and it **vendors a byte-identical copy of this repo's `shared/logic.js`** so the backend
classifies jobs identically to the frontend by construction.

```mermaid
flowchart TB
    subgraph clients["Clients"]
        site["Public site<br/>(longwave-dev.html)"]
        admin["Admin SPA<br/>(same repo · CORS · Bearer token)"]
    end
    subgraph be["LongWave-Dev-Admin · backend/ (node:http, zero deps)"]
        server["server.js<br/>static + route /api"]
        api["api.js<br/>JSON router · auth guard · CORS"]
        models["models.js<br/>data access + normalization"]
        logic["logic.js → src/shared/logic.cjs<br/>(vendored copy of shared/logic.js)"]
        importer["import.js<br/>CSV/JSON bulk import"]
        manatal["manatal.js<br/>CRM push + CSV export"]
        subgraph ats["ats/ (adapter registry + runSync)"]
            live["greenhouse · lever<br/>(live public APIs)"]
            scrape["generic (schema.org JSON-LD)<br/>+ delegators: herp/talentio/<br/>jobcan/persona/randstad/axol/wantedly"]
            hrmos["hrmos (demo / token)"]
        end
        db[("SQLite<br/>jobs · companies · articles ·<br/>ats_sources · leads · sync_runs")]
        worker["worker.js<br/>scheduled sync (weekly)"]
    end
    extats["External ATS boards"]

    site -->|"GET /api/jobs,featured,articles · POST /api/leads"| api
    admin -->|"CRUD · PUT /featured · POST /sources/:id/sync · import · leads→Manatal"| api
    server --> api --> models --> db
    api --> importer --> models
    api --> manatal
    api --> ats
    worker --> ats
    ats -->|fetch| extats
    ats --> models
    models --> logic
    importer --> logic
```

| Concern | As built 🟢 |
| --- | --- |
| **Server** | `server.js` — `node:http`; serves `/api` (+ the built public site at `/` when `$LW_SITE_FILE` points at one). The admin SPA lives at the same repo's root and calls the API over CORS. |
| **API** | `api.js` — public reads (`jobs/featured/articles`, `POST /leads`); everything else behind `Bearer ADMIN_TOKEN`. Malformed JSON → 400, empty leads → 400, hidden jobs never leak to anon. |
| **Data access** | `models.js` — upsert/list jobs, companies, articles, featured (gap-free ranks); normalizes spec/location through shared `LW`. SQLite via `db.js`. |
| **ATS** | `ats/` registry + `runSync`. Greenhouse/Lever pull live public JSON; others scrape schema.org `JobPosting` via `generic.js` (thin per-provider delegators share one `_delegate.js` factory). |
| **Import** | `import.js` — CSV/JSON portal exports, column-aliased (incl. Japanese), classified, deduped on `(source, source_ref)` namespaced per company. |
| **CRM** | `manatal.js` — push leads to Manatal (gated by `MANATAL_API_KEY`) or export CSV (formula-injection-safe). |
| **Scheduler** | `worker.js` — weekly per-source sync (`--once` for cron). |
| **Tests** | `backend/test/` via `node:test` — models, import, manatal branches, ATS detect/parse, and the HTTP layer (routing/auth/validation). |

### What's still 🟠 (productionizing)

SQLite → **Postgres**; single shared token → **real auth**; add **resume file storage**
and a migrations framework; move the best-effort per-IP rate limiter to the edge/CDN; wire
the **live HERP/HRMOS/Talentio APIs** (the agency portals currently come in via the
bulk-import path). The diagrams in §2 are the target this is growing toward.

> **Backend deep-dive:** the backend's own service architecture — the API contract
> (`docs/openapi.yaml`), Next.js integration patterns (ISR, BFF, revalidation), CORS
> allowlist, and the phased readiness plan — lives in the **LongWave-Dev-Admin repo**
> (`docs/BACKEND-ARCHITECTURE.md`), next to the code it describes.

---

## 2. Target architecture (production) 🟠

Goal: **live listings**, **real sign-up/lead capture**, and an **admin path to
curate** roles — without throwing away what works (the pure domain logic and the
clean component split are reused).

```mermaid
flowchart TB
    subgraph ext["External"]
        hrmos["HRMOS ATS API"]
    end

    subgraph backend["Backend 🟠"]
        sync["Sync Worker<br/>(scheduled cron)"]
        db[("Database<br/>Postgres:<br/>jobs · companies · leads · sync_runs")]
        api["Jobs API<br/>(REST/GraphQL, read-only,<br/>server-side filter/search/paginate)"]
        leads["Leads API<br/>(sign-ups + resume upload)"]
        admin["Admin / Curation<br/>(auth)"]
        notify["Recruiter notify<br/>(email / Slack)"]
        files[("Object storage<br/>resumes")]
    end

    subgraph frontend["Frontend 🟢→🟠"]
        cdn["Static site on CDN<br/>(same src/ build)"]
    end

    user(("User"))
    recruiter(("Recruiter"))

    hrmos -->|pull openings| sync
    sync -->|normalize via shared LW logic| db
    db --> api
    api -->|JSON| cdn
    cdn -->|browse / filter| user
    user -->|sign up + CV| leads
    leads --> db
    leads --> files
    leads --> notify --> recruiter
    admin --> db
```

### What changes vs. today

| Concern | Today 🟢 | Target 🟠 |
| --- | --- | --- |
| **Job data** | Embedded in the bundle at build time | Live from **Jobs API** (`GET /jobs?spec=&jp=&remote=&loc=&q=&page=`) backed by Postgres |
| **HRMOS refresh** | Manual sync + rebuild | **Sync Worker** on a schedule (e.g. hourly) writes to the DB; no rebuild needed |
| **Filtering/search** | All client-side over 593 embedded rows | Server-side (indexed) for scale; client keeps the instant-filter UX for the current page |
| **Sign-ups** | Client-only success state | **Leads API** persists the lead + resume to storage and notifies recruiters |
| **CV builder** | Client-only (stays!) | Unchanged — keep PII in the browser; only submit if the user opts in |
| **Hosting** | File / artifact | Static frontend on a **CDN**; backend on a small managed host or serverless |
| **Curation** | Edit data + rebuild | **Admin** UI to feature/hide/override roles (e.g. fix a misclassified spec) |

### Sequence — HRMOS → live listings 🟠

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Scheduler
    participant W as Sync Worker
    participant H as HRMOS API
    participant L as LW logic (shared)
    participant DB as Postgres
    participant API as Jobs API
    participant FE as Frontend (CDN)

    Cron->>W: trigger (hourly)
    W->>H: fetch open positions
    H-->>W: raw postings
    W->>L: classifySpec / locFromAddr / salaryMax / searchHay
    L-->>W: normalized job records
    W->>DB: upsert jobs + companies, record sync_run
    Note over FE,API: later, when a user visits
    FE->>API: GET /jobs?spec=Frontend&jp=business
    API->>DB: query (indexed)
    DB-->>API: rows
    API-->>FE: JSON
```

### Sequence — browse & sign-up 🟠

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend
    participant API as Jobs API
    participant LE as Leads API
    participant DB as Postgres
    participant R as Recruiter

    U->>FE: open site / pick filters
    FE->>API: GET /jobs?…
    API-->>FE: matching roles
    U->>FE: submit sign-up (+ optional resume)
    FE->>LE: POST /leads
    LE->>DB: store lead
    LE->>R: notify (email/Slack)
    LE-->>FE: 200 → success state
```

### The reuse that makes this clean

`shared/logic.js` (`LW.*`) is **already pure and dependency-free**, and is already
`require()`-d by the Node tests. The **same module powers the Sync Worker's
normalization** (classify specialty, parse prefecture, parse salary, build the search
index) — so the frontend and backend agree on classification by construction, and it
stays unit-tested in one place.

```mermaid
flowchart LR
    logic["shared/logic.js (LW.*)<br/>pure domain logic"]
    logic --> fe["Frontend<br/>(filter/sort/display)"]
    logic --> be["Backend Sync Worker 🟠<br/>(normalize on ingest)"]
    logic --> tests["Node tests<br/>(both sides covered)"]
```

---

## 3. Suggested tech choices 🟠

These are sensible defaults, not requirements — chosen for low ops + good DX.

| Layer | Suggestion | Why |
| --- | --- | --- |
| Frontend | Keep the static build, or migrate to **Astro / Next** if SSR/SEO is wanted | Current build is fast and zero-dep; a framework helps if pages grow or SEO/SSR matters |
| Jobs API | **Node + TypeScript** (Fastify/Hono) or serverless functions | Reuse `LW` logic directly (same language); small, read-mostly surface |
| DB | **Postgres** (+ built-in full-text search, or Meilisearch if needed) | Relational fit (jobs↔companies), good filtering/search |
| Sync Worker | Scheduled job (GitHub Actions cron, Cloud Run job, or a queue worker) | Decouples HRMOS refresh from deploys |
| Resume storage | Object storage (S3/R2) with signed uploads | Keep large/PII files out of the DB |
| Hosting | Frontend on a CDN (Cloudflare/Vercel/Netlify); API on a small managed host | Cheap, scalable, simple |
| Secrets | HRMOS token, DB URL, notify webhooks via the host's secret store | Never in the repo |

## 4. Migration path (POC → production) 🟠

1. **Extract the API contract** from today's data shape (`window.__HRMOS_DATA__`) — it
   already defines `jobs`, `companies`, `jobs_ja`, `blurb`. Make that the `GET /jobs`
   response shape so the frontend change is minimal.
2. **Stand up Postgres + the Sync Worker**, reusing `shared/logic.js` for normalization.
3. **Add the Jobs API**; switch the frontend from `window.__HRMOS_DATA__` to a `fetch()`
   (keep the embedded data as an offline fallback).
4. **Add the Leads API** + resume storage; wire the existing sign-up modal to it.
5. **Host** the frontend on a CDN; deploy the backend; point the Sync Worker at HRMOS.
6. **Admin/curation** last, once listings are live.

## 5. Repository layout

Frontend source today lives under `src/` (see the [README](../README.md) for the full
map). The split spans two repos:

```
LongWave-Dev-POC/     ← this repo (public): the site — src/, shared/ (@longwave/logic),
                        build.sh, longwave-dev.html, docs/
LongWave-Dev-Admin/   ← private repo: the admin SPA (root) + backend/ (API · ATS worker ·
                        import/export) + docs/ (openapi.yaml · BACKEND-ARCHITECTURE.md)
```

> **Update:** the shared `LW` domain logic was lifted out of the frontend tree into
> **[`shared/logic.js`](../shared/README.md)** (`@longwave/logic`), consumed here by the
> frontend bundle and the test suite. The backend described in
> **[§1b](#1b-backend-as-built-)** lives in **LongWave-Dev-Admin** (`backend/`) with a
> vendored, byte-identical copy (`backend/src/shared/logic.cjs`) for normalization (the
> "shared logic" arrow above). Publishing `@longwave/logic` as a real cross-repo package
> is the remaining step to fully formalize the split.
