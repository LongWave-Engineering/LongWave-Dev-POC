# @longwave/logic — shared domain logic

The pure `LW.*` domain module (specialty classification, prefecture parsing, salary
parsing, filter predicate, search-hay building, application cap, age calc) shared by
**both apps** so they agree by construction:

| Consumer | How it loads this |
| --- | --- |
| Public-site bundle | `build.sh` concatenates `shared/logic.js` into the IIFE (`LW` in scope) |
| Backend API + worker | `backend/src/logic.js` bridges it via `createRequire` |
| Frontend unit tests | `require("../shared/logic.js")` |

**Rules for this file:** no DOM, no app state, no Node APIs, no dependencies — it must
run as a plain browser script *and* under `require()`. Exports live in the object at
the bottom; the `module.exports` footer is what Node consumers read.

It's a real (private) package so an out-of-repo consumer can `npm install` it from a
git reference later — nothing installs it today; everything path-imports.
