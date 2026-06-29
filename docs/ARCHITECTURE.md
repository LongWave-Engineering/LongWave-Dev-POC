# LongWave Dev — Architecture

This document describes **(1) the architecture as it exists today** (a static,
single-file POC with no backend) and **(2) a proposed target architecture** for a
production build with a real frontend + backend. Diagrams are [Mermaid](https://mermaid.js.org/)
and render natively on GitHub.

> **Status legend** — 🟢 exists today · 🟠 proposed (not built yet).

---

## 1. Current architecture (POC) 🟢

The POC is a **single, self-contained `longwave-dev.html`** — all CSS, JS, web-font
links and the job data are inlined, so it runs by double-clicking the file. There is
**no server and no runtime data fetching**; the HRMOS job data is baked into the
bundle at build time.

```mermaid
flowchart LR
    subgraph authoring["Authoring (src/)"]
        core["src/core/<br/>tokens · layout · router · i18n · <b>logic.js</b> · data"]
        feat["src/features/*<br/>header · home · jobs · companies · cv · modals · …"]
        data["src/core/hrmos-data.js<br/>window.__HRMOS_DATA__ (generated)"]
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
| **Domain logic** | `core/logic.js` (`LW.*`) — pure functions: specialty classification, address→prefecture, salary parsing, filter predicate, age calc. **No DOM, no state.** |
| **Data** | `core/hrmos-data.js` sets `window.__HRMOS_DATA__`, generated from an HRMOS sync and **embedded at build time**. Falls back to demo data in `core/data.js`. |
| **Forms** | Sign-up + CV builder are **client-only** today (sign-up shows a success state; the CV/rirekisho is generated and printed in-browser — no data leaves the page). |
| **Tests** | `test/` via Node's built-in `node:test` — unit tests for `LW.*` + integrity checks on the real data. Zero dependencies. |
| **CI/CD** | `.github/workflows/ci.yml` (test + bundle-freshness gate + artifact) and `release.yml` (tag → Release). |
| **Delivery** | Private repo → the built HTML ships as a CI **artifact** (per push) and a **Release asset** (per tag). No hosting. |

### Current data flow 🟢

```mermaid
flowchart LR
    hrmos["HRMOS ATS"] -->|"manual / agent sync<br/>(offline)"| gen["hrmos-data.js<br/>(generated)"]
    gen -->|build time| bundle["longwave-dev.html"]
    bundle -->|open file| user["User"]
    user -->|sign up| nowhere["(client-side only —<br/>no submission yet)"]
```

**Key trait:** data is _static at build time_. Refreshing listings = re-running the
sync + rebuilding + redeploying. Good enough for a POC; the section below makes it live.

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

`core/logic.js` (`LW.*`) is **already pure and dependency-free**, and is already
`require()`-d by the Node tests. The **same module powers the Sync Worker's
normalization** (classify specialty, parse prefecture, parse salary, build the search
index) — so the frontend and backend agree on classification by construction, and it
stays unit-tested in one place.

```mermaid
flowchart LR
    logic["core/logic.js (LW.*)<br/>pure domain logic"]
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
2. **Stand up Postgres + the Sync Worker**, reusing `core/logic.js` for normalization.
3. **Add the Jobs API**; switch the frontend from `window.__HRMOS_DATA__` to a `fetch()`
   (keep the embedded data as an offline fallback).
4. **Add the Leads API** + resume storage; wire the existing sign-up modal to it.
5. **Host** the frontend on a CDN; deploy the backend; point the Sync Worker at HRMOS.
6. **Admin/curation** last, once listings are live.

## 5. Repository layout

Frontend source today lives under `src/` (see the [README](../README.md) for the full
map). If/when the backend is built, a clean split would be:

```
/                      ← frontend (current repo root: src/, build.sh, longwave-dev.html)
/backend/  🟠          ← api/ (Jobs + Leads API) · worker/ (HRMOS sync) · db/ (migrations)
/shared/   🟠          ← the LW domain logic, imported by both frontend build and backend
/docs/                 ← this file
```

> Today everything is the frontend POC. `backend/` and `shared/` are **proposed** — the
> quickest first step is to lift `core/logic.js` into `shared/` so the future Sync Worker
> and the frontend import the exact same classification/parsing code.
