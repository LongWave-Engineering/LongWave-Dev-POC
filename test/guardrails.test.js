/* Guardrail / invariant tests — lock in the security & privacy properties established in
   the pre-launch audit so they can't silently regress. These assert on the SHIPPED public
   bundle (longwave-dev.html) and the repo's ignore/tracking rules. Node built-ins only.
   If one of these fails, someone reintroduced a leak — read the message, don't just delete
   the test. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const bundle = fs.readFileSync(path.join(ROOT, "longwave-dev.html"), "utf8");

/* --- Privacy: the confidential HRMOS client roster must NEVER be in the public bundle --- */
test("public bundle carries no confidential HRMOS roster data", () => {
  assert.doesNotMatch(bundle, /window\.__HRMOS_DATA__\s*=/,
    "the HRMOS data payload is being inlined into the public bundle — it must stay backend-only (backend/data/)");
  assert.equal((bundle.match(/source_ats_id/g) || []).length, 0,
    "internal HRMOS record IDs (source_ats_id) leaked into the public bundle");
});

test("the private roster file is not present under src/ (it lives backend-only)", () => {
  assert.equal(fs.existsSync(path.join(ROOT, "src/core/hrmos-data.js")), false,
    "src/core/hrmos-data.js is back — the roster must stay in backend/data/ (gitignored) and load via /api");
});

/* --- Privacy: the single-file site must make ZERO external requests (self-contained) --- */
test("public bundle loads no external resources", () => {
  /* Only flag EXTERNAL LOAD contexts. <a href="https://…"> navigation links are allowed
     (they don't fetch anything), and a mere mention of a host in a comment isn't a request. */
  assert.doesNotMatch(bundle, /<script[^>]+\bsrc\s*=/i, "an external <script src> was reintroduced");
  assert.doesNotMatch(bundle, /<link[^>]+href\s*=\s*["']https?:/i, "an external stylesheet / <link href=\"http…\"> was reintroduced");
  assert.doesNotMatch(bundle, /<img[^>]+src\s*=\s*["']https?:/i, "an external <img src=\"http…\"> was added — inline it as a data: URI");
  assert.doesNotMatch(bundle, /@import\s+(url\()?\s*["']?https?:/i, "an external CSS @import was reintroduced");
  assert.doesNotMatch(bundle, /url\(\s*["']?https?:\/\//i, "a CSS url() points at an external origin — inline it as a data: URI");
  assert.doesNotMatch(bundle, /(?:href|src)\s*=\s*["']https?:\/\/fonts\.(?:googleapis|gstatic)/i,
    "a Google Fonts request was reintroduced — self-host fonts (src/core/fonts.css) instead");
});

/* --- Secrets: nothing sensitive baked into the shipped file --- */
test("public bundle contains no secrets or default admin token", () => {
  assert.doesNotMatch(bundle, /dev-admin-token/, "the default admin token leaked into the public bundle");
  assert.doesNotMatch(bundle, /sk-ant-[A-Za-z0-9]{12}/, "an Anthropic API key is present in the public bundle");
  assert.doesNotMatch(bundle, /\bADMIN_TOKEN\s*[:=]\s*["'][^"']+["']/, "an admin token value is present in the public bundle");
});

/* --- Ignore rules keep real client data + secrets out of the repo --- */
test(".gitignore keeps secrets, DBs and the private roster out of version control", () => {
  const all = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8") + "\n" +
    fs.readFileSync(path.join(ROOT, "backend/.gitignore"), "utf8");
  for (const pat of [".env", "backend/data/", "sources.local.json"]) {
    assert.ok(all.includes(pat), `.gitignore must keep "${pat}" out of the repo`);
  }
  assert.match(all, /\*\.db|\*\.sqlite/, ".gitignore must ignore database files");
});

test("no confidential or secret files are tracked by git", () => {
  let tracked;
  try { tracked = cp.execSync("git ls-files", { cwd: ROOT }).toString().split("\n"); }
  catch { return; } /* not a git checkout (e.g. a release tarball) — nothing to assert */
  for (const f of ["backend/data/hrmos-data.js", "backend/sources.local.json", ".env", "backend/.env"]) {
    assert.ok(!tracked.includes(f), `${f} must never be tracked by git`);
  }
});
