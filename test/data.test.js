/* Data-integrity tests: load the real generated HRMOS data and validate it
   against the shipping classification/parsing logic. Catches data regressions
   (bad enums, unknown company ids, unclassifiable roles) before they reach the UI. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const LW = require("../src/core/logic.js");

// The private HRMOS roster now lives backend-only (backend/data/hrmos-data.js — gitignored,
// not published). The file does `window.__HRMOS_DATA__ = {...}`; give it a window to write
// to. When the roster is absent (CI, fresh clones), these data-integrity checks skip rather
// than fail — they validate the private data when it's present locally.
globalThis.window = {};
let DATA = null;
try { require("../backend/data/hrmos-data.js"); DATA = globalThis.window.__HRMOS_DATA__ || null; } catch { /* roster not present */ }
const HAVE = !!(DATA && Array.isArray(DATA.JOBS) && DATA.JOBS.length);
const opts = HAVE ? {} : { skip: "private HRMOS roster not present (backend/data/hrmos-data.js is gitignored)" };

const JP = new Set(["none", "conversational", "business"]);
const REMOTE = new Set(["full", "partial", "no"]);

test("HRMOS data is present and well-formed", opts, () => {
  assert.ok(DATA, "window.__HRMOS_DATA__ should be set");
  assert.ok(Array.isArray(DATA.JOBS) && DATA.JOBS.length > 0, "JOBS should be a non-empty array");
  assert.ok(DATA.COMPANIES && typeof DATA.COMPANIES === "object", "COMPANIES should be an object");
});

test("every job has required fields with valid enum values", opts, () => {
  for (const job of DATA.JOBS) {
    assert.equal(typeof job.role, "string"); assert.ok(job.role.length, "role non-empty");
    assert.equal(typeof job.co, "string");
    assert.ok("salary" in job, `salary present for ${job.role}`);
    assert.ok(JP.has(job.jp), `jp="${job.jp}" invalid for ${job.role}`);
    assert.ok(REMOTE.has(job.remote), `remote="${job.remote}" invalid for ${job.role}`);
  }
});

test("every job.co references a known company", opts, () => {
  for (const job of DATA.JOBS) {
    assert.ok(DATA.COMPANIES[job.co], `unknown company id "${job.co}" for ${job.role}`);
  }
});

test("classifySpec() yields a canonical spec for every real job", opts, () => {
  for (const job of DATA.JOBS) {
    const spec = LW.classifySpec(job);
    assert.ok(LW.SPECS.includes(spec), `non-canonical spec "${spec}" for ${job.role}`);
  }
});

test("locFromAddr() returns a real prefecture (or empty) for every real address", opts, () => {
  const PREF = /(東京都|北海道|京都府|大阪府|[一-鿿]{2,3}県)/;
  for (const job of DATA.JOBS) {
    const loc = LW.locFromAddr(job.office || job.loc);
    assert.ok(loc === "" || PREF.test(loc), `${job.role}: unexpected loc -> "${loc}"`);
  }
});

test("salaryMax() yields a parsed ¥ band or the clean fallback — never a paragraph", opts, () => {
  for (const job of DATA.JOBS) {
    const s = LW.salaryMax(job);
    assert.doesNotMatch(s, /^(undefined|null|NaN)/, `${job.role}: unparseable salary surfaced -> "${s}"`);
    assert.match(s, /^(¥[\d.]+M DOE|DOE)$/, `${job.role}: salary chip is neither a ¥ band nor the fallback -> "${s}"`);
  }
});
