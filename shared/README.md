# @longwave/logic — shared domain logic

The pure `LW.*` domain module (specialty classification, prefecture parsing, salary
parsing, filter predicate, search-hay building, application cap, age calc) shared by
**both apps** so they agree by construction:

| Consumer | How it loads this |
| --- | --- |
| Public-site bundle | `build.sh` concatenates `shared/logic.js` into the IIFE (`LW` in scope) |
| Frontend unit tests | `require("../shared/logic.js")` |
| Backend API + worker (repo: **LongWave-Dev-Admin**) | a vendored, byte-identical copy at `backend/src/shared/logic.cjs` |

**Rules for this file:** no DOM, no app state, no Node APIs, no dependencies — it must
run as a plain browser script *and* under `require()`. Exports live in the object at
the bottom; the `module.exports` footer is what Node consumers read.

**This file is the source of truth.** When you change it, re-copy it over the admin
repo's `backend/src/shared/logic.cjs` (byte-identical) and run both repos' tests.
It's a real (private) package so the backend can `npm install` it from a git reference
later and drop the vendored copy — nothing installs it today.
