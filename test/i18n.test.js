/* Unit test for the EN/JA i18n dictionary in src/core/i18n-data.js.
   Run with:  npm test   (or:  node --test)
   t() falls back to English when a JA key is missing, so drift ships SILENTLY to
   Japanese users. This guards that both languages define exactly the same keys. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { I18N } = require("../src/core/i18n-data.js");

test("I18N exposes both languages", () => {
  assert.ok(I18N && I18N.en && I18N.ja, "expected I18N.en and I18N.ja");
});

test("EN and JA define exactly the same keys (no silent fallback drift)", () => {
  const en = Object.keys(I18N.en);
  const ja = Object.keys(I18N.ja);
  const missingInJa = en.filter((k) => !(k in I18N.ja));
  const missingInEn = ja.filter((k) => !(k in I18N.en));
  assert.deepEqual(missingInJa, [], "keys in EN but missing in JA: " + missingInJa.join(", "));
  assert.deepEqual(missingInEn, [], "keys in JA but missing in EN: " + missingInEn.join(", "));
  assert.equal(en.length, ja.length);
});

test("no i18n value is empty (a blank string would render nothing)", () => {
  for (const lang of ["en", "ja"]) {
    for (const [k, v] of Object.entries(I18N[lang])) {
      assert.equal(typeof v, "string", `${lang}.${k} should be a string`);
      // filter_search_ph is intentionally blank (a placeholder), so allow it
      if (k !== "filter_search_ph") assert.ok(v.trim().length > 0, `${lang}.${k} is empty`);
    }
  }
});
