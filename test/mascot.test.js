/* Mascot pose guardrails — the empty-state shrug and form-success cheer are hand-made
   raster edits of the original logo (see git history: "raster surgery"), shipped as
   data-URI CSS vars. Nothing else would catch a refactor that wipes a var back to the
   plain-logo fallback, ships a truncated/corrupt URI, or bloats the bundle with an
   unoptimized export. These lock the assets in. Node built-ins only. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const baseCss = fs.readFileSync(path.join(ROOT, "src/core/base.css"), "utf8");
const bundle = fs.readFileSync(path.join(ROOT, "longwave-dev.html"), "utf8");

/* Pull one CSS var's data-URI payload out of a stylesheet. */
function dataUri(css, varName) {
  const m = css.match(new RegExp(`--${varName}:url\\("data:image/(png|svg\\+xml);base64,([A-Za-z0-9+/=]+)"\\)`));
  return m ? { mime: m[1], b64: m[2], buf: Buffer.from(m[2], "base64") } : null;
}

/* PNG sanity: signature + IHDR dimensions + a terminal IEND chunk. The IEND check
   matters — mutation testing showed a tail-truncated PNG (broken image, header intact)
   sails through a header-only check. */
function pngInfo(buf) {
  const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const IEND = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
  if (buf.length < 24 || !buf.subarray(0, 8).equals(SIG)) return null;
  if (buf.subarray(12, 16).toString("latin1") !== "IHDR") return null;
  if (!buf.subarray(buf.length - 12).equals(IEND)) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(24 - 4) };
}

const POSES = ["tsd-pose-search", "tsd-pose-cheer"];

test("both mascot poses are dedicated PNG data URIs (not the plain-logo fallback)", () => {
  for (const name of POSES) {
    assert.doesNotMatch(baseCss, new RegExp(`--${name}:var\\(--tsd-logo\\)`),
      `--${name} fell back to the plain logo — the dedicated pose art was lost`);
    const u = dataUri(baseCss, name);
    assert.ok(u, `--${name} is missing from src/core/base.css or is not a base64 data URI`);
    assert.equal(u.mime, "png", `--${name} is not a PNG (found image/${u && u.mime})`);
  }
});

test("each pose decodes to a real 256×256 PNG (no truncated/corrupt URI)", () => {
  for (const name of POSES) {
    const u = dataUri(baseCss, name);
    assert.ok(u, `--${name} missing`);
    const info = pngInfo(u.buf);
    assert.ok(info, `--${name} does not decode to a valid PNG (bad signature/IHDR)`);
    assert.deepEqual({ w: info.width, h: info.height }, { w: 256, h: 256 },
      `--${name} is ${info.width}×${info.height}, expected 256×256 (same canvas as the logo)`);
  }
});

test("logo, shrug and cheer are three distinct images", () => {
  const logo = dataUri(baseCss, "tsd-logo");
  assert.ok(logo, "--tsd-logo missing from base.css");
  const search = dataUri(baseCss, "tsd-pose-search");
  const cheer = dataUri(baseCss, "tsd-pose-cheer");
  assert.notEqual(search.b64, cheer.b64, "shrug and cheer are the same image — one mood overwrote the other");
  assert.notEqual(search.b64, logo.b64, "the shrug is just the plain logo — the pose edit was lost");
  assert.notEqual(cheer.b64, logo.b64, "the cheer is just the plain logo — the pose edit was lost");
});

test("pose assets stay inside the size budget", () => {
  for (const name of POSES) {
    const u = dataUri(baseCss, name);
    assert.ok(u.buf.length <= 80 * 1024,
      `--${name} is ${(u.buf.length / 1024).toFixed(1)}KB decoded — over the 80KB budget; re-quantize before shipping (the originals are ~24KB)`);
    assert.ok(u.buf.length >= 10 * 1024,
      `--${name} is only ${(u.buf.length / 1024).toFixed(1)}KB decoded — the originals are ~24KB, this looks truncated or swapped for a placeholder`);
  }
});

test("the pose vars are actually wired to the mascot classes and used in the UI", () => {
  assert.match(baseCss, /\.tsd-mascot--search\{background-image:var\(--tsd-pose-search\)/,
    ".tsd-mascot--search no longer uses --tsd-pose-search");
  assert.match(baseCss, /\.tsd-mascot--cheer\{background-image:var\(--tsd-pose-cheer\)/,
    ".tsd-mascot--cheer no longer uses --tsd-pose-cheer");
  const jobsJs = fs.readFileSync(path.join(ROOT, "src/features/jobs/jobs.js"), "utf8");
  assert.match(jobsJs, /tsd-mascot--search/, "the jobs empty state no longer shows the shrug mascot");
  const modals = fs.readFileSync(path.join(ROOT, "src/features/modals/modals.html"), "utf8");
  assert.match(modals, /tsd-mascot--cheer/, "the form-success blocks no longer show the cheer mascot");
});

test("the shipped bundle carries the exact same pose art as src (stale-bundle guard)", () => {
  for (const name of [...POSES, "tsd-logo"]) {
    const u = dataUri(baseCss, name);
    // full-payload match, not a prefix — mutation testing showed a prefix check misses
    // any src edit (or truncation) past the compared window
    assert.ok(bundle.includes(u.b64),
      `longwave-dev.html does not carry src's exact --${name} payload — run ./build.sh`);
  }
});
