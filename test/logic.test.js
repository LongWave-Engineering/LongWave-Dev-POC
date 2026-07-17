/* Unit tests for the pure domain logic in shared/logic.js.
   Run with:  npm test   (or:  node --test)
   No DOM, no build step — these exercise the exact code that ships in the bundle. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const LW = require("../shared/logic.js");

test("esc() escapes HTML-significant characters", () => {
  assert.equal(LW.esc('<a href="x">&'), "&lt;a href=&quot;x&quot;&gt;&amp;");
  assert.equal(LW.esc("it's a <'quote'>"), "it&#39;s a &lt;&#39;quote&#39;&gt;");   // single quote escaped too
  assert.equal(LW.esc("plain"), "plain");
  assert.equal(LW.esc(5), "5");
});

test("classifySpec() maps roles to the right specialty (order-sensitive rules)", () => {
  const cases = [
    ["Data Engineer", "Data Engineering"],
    ["Frontend Engineer", "Frontend"],
    ["Backend Engineer", "Backend"],
    ["Full-Stack Engineer", "Full-Stack"],
    ["QA Engineer", "QA / Test"],
    ["Software Engineer in Test (SET)", "QA / Test"],   // QA wins over generic Engineering
    ["SRE & Platform Engineer", "SRE / Infra"],
    ["Engineering Manager", "Engineering Management"],
    ["Senior Product Manager (Sr. PdM)", "Product Management"],
    ["iOS Engineer", "Mobile"],
    ["Security Engineer", "Security"],
    ["AI Engineer", "AI / ML"],
    ["UI/UX Designer", "UI/UX & Design"],
    ["Mechanical Engineer", "Hardware & Mfg"],          // Hardware wins over generic Engineering
    ["Marketing Manager", "Sales & BD"],                // Sales/BD wins over generic Management
    ["Recruiter", "Corporate & Ops"],
    ["Random Unmatched Title", "Other"],
  ];
  for (const [role, spec] of cases) {
    assert.equal(LW.classifySpec({ role }), spec, `role="${role}"`);
  }
});

test("classifySpec() considers the tech stack, not just the title", () => {
  // bare "Engineer" would be Software Engineering, but a dbt stack pushes it to Data Engineering
  assert.equal(LW.classifySpec({ role: "Engineer", stack: ["dbt"] }), "Data Engineering");
  assert.equal(LW.classifySpec({ role: "Engineer" }), "Software Engineering");
});

test("classifySpec() classifies on the part before the — division suffix", () => {
  assert.equal(LW.classifySpec({ role: "Frontend Engineer — Platform Division" }), "Frontend");
});

test("every classifySpec() result is a member of the canonical SPECS list", () => {
  const rolesProbe = ["Data Engineer","QA Engineer","iOS Engineer","Security Lead","Marketing","Recruiter","zzz"];
  for (const role of rolesProbe) assert.ok(LW.SPECS.includes(LW.classifySpec({ role })));
  // and every rule's declared spec is in SPECS (guards future edits from drift)
  for (const rule of LW.SPEC_RULES) assert.ok(LW.SPECS.includes(rule.spec), `rule spec "${rule.spec}" not in SPECS`);
});

test("locFromAddr() returns prefecture, with a ward only directly under it", () => {
  assert.equal(LW.locFromAddr("東京都港区芝浦3-1-21"), "東京都港区");
  assert.equal(LW.locFromAddr("東京都港区芝浦3-1-21 msb Tamachi 田町ステーションタワー"), "東京都港区");
  assert.equal(LW.locFromAddr("大阪府大阪市北区梅田"), "大阪府");     // designated-city ward collapses
  assert.equal(LW.locFromAddr("神奈川県横浜市西区"), "神奈川県");
  assert.equal(LW.locFromAddr("Tamachi, Tokyo"), "東京都");           // city-name fallback, no ward
  assert.equal(LW.locFromAddr("Remote / フルリモート"), "");          // no prefecture found
  assert.equal(LW.locFromAddr(""), "");
  assert.equal(LW.locFromAddr(null), "");
  // multi-office: a ward belonging to a SECOND prefecture must not bleed onto the first
  assert.equal(LW.locFromAddr("大阪府大阪市 / 東京都港区"), "大阪府");
  assert.equal(LW.locFromAddr("大阪府 東京都港区"), "大阪府");
});

test("salaryMax() takes the top of the band, with a clean fallback for free-text", () => {
  assert.equal(LW.salaryMax({ salary: "¥8M – ¥13M" }), "¥13M DOE");
  assert.equal(LW.salaryMax({ salary: "¥6.5M – ¥12M" }), "¥12M DOE");
  assert.equal(LW.salaryMax({ salary: "¥10M" }), "¥10M DOE");
  // free-text / missing salary -> neutral fallback (never a paragraph, never "undefined DOE")
  assert.equal(LW.salaryMax({ salary: "条件は経歴により柔軟に検討" }), "DOE");
  assert.equal(LW.salaryMax({ salary: "条件は経歴により柔軟に検討" }, "Negotiable"), "Negotiable");
  assert.equal(LW.salaryMax({}), "DOE");
  assert.equal(LW.salaryMax({ salary: null }, "応相談"), "応相談");
});

test("salaryMax() converts Japanese 万-yen bands (imported/scraped rows) to ¥M", () => {
  assert.equal(LW.salaryMax({ salary: "800万〜1300万円" }), "¥13M DOE");   // top of band
  assert.equal(LW.salaryMax({ salary: "年収600万円" }), "¥6M DOE");
  assert.equal(LW.salaryMax({ salary: "1,200万円" }), "¥12M DOE");          // thousands separator
  assert.equal(LW.salaryMax({ salary: "450万〜750万" }), "¥7.5M DOE");      // non-integer millions
  // a ¥M band still wins (the 万 branch only runs when no ¥M is present)
  assert.equal(LW.salaryMax({ salary: "¥8M – ¥13M（約1300万円）" }), "¥13M DOE");
});

test("normalizeJobIds() coerces, drops junk, de-dupes, preserves order", () => {
  assert.deepEqual(LW.normalizeJobIds([1, 2, 2, 3]), [1, 2, 3]);
  assert.deepEqual(LW.normalizeJobIds(["4", "5", 5]), [4, 5]);            // strings → ints, de-duped
  assert.deepEqual(LW.normalizeJobIds([0, -1, null, undefined, "x", NaN, 7]), [7]); // junk dropped
  assert.deepEqual(LW.normalizeJobIds("not-an-array"), []);
  assert.deepEqual(LW.normalizeJobIds([]), []);
});

test("normalizeJobIds() caps the batch so one request can't drive unbounded DB work", () => {
  const huge = Array.from({ length: 1000 }, (_, i) => i + 1);
  const out = LW.normalizeJobIds(huge);
  assert.ok(out.length <= 200, `expected <=200, got ${out.length}`);
  assert.deepEqual(out.slice(0, 3), [1, 2, 3]); // keeps the first ids, in order
});

test("routeFor() maps a hash to its route name (and every route round-trips)", () => {
  assert.equal(LW.routeFor("#/"), "home");
  assert.equal(LW.routeFor(""), "home");
  assert.equal(LW.routeFor(null), "home");
  assert.equal(LW.routeFor("#/jobs"), "jobs");
  assert.equal(LW.routeFor("#/companies"), "companies");
  assert.equal(LW.routeFor("#/articles"), "articles");
  assert.equal(LW.routeFor("#/cv"), "cv");
  assert.equal(LW.routeFor("#/post"), "post");
  assert.equal(LW.routeFor("#/privacy"), "privacy");
  assert.equal(LW.routeFor("#/unknown"), "home");           // unknown → home
  // every route in the canonical table resolves back to itself
  for (const name of Object.keys(LW.ROUTES)) assert.equal(LW.routeFor(LW.ROUTES[name]), name, `route ${name}`);
});

test("jpTagClass() maps Japanese level to a CSS class", () => {
  assert.equal(LW.jpTagClass("none"), "tag--jp-none");
  assert.equal(LW.jpTagClass("business"), "tag--jp-high");
  assert.equal(LW.jpTagClass("conversational"), "tag--jp-mid");
  assert.equal(LW.jpTagClass("anything-else"), "tag--jp-mid");
});

test("hasActiveFilter() is true only when some facet is set", () => {
  assert.equal(LW.hasActiveFilter({}), false);
  assert.equal(LW.hasActiveFilter({ q: "", jp: "", spec: "" }), false);
  assert.equal(LW.hasActiveFilter({ q: "go" }), true);
  assert.equal(LW.hasActiveFilter({ jp: "none" }), true);
  assert.equal(LW.hasActiveFilter({ remote: "full" }), true);
  assert.equal(LW.hasActiveFilter({ spec: "Backend" }), true);
  assert.equal(LW.hasActiveFilter({ loc: "東京都港区" }), true);
  assert.equal(LW.hasActiveFilter({ stack: "Go" }), true);
  assert.equal(LW.hasActiveFilter(null), false);
});

test("searchHay() builds a lowercased index across role/jaRole/company/stack/spec", () => {
  const hay = LW.searchHay({ role: "Backend Engineer", stack: ["Go", "AWS"], spec: "Backend" }, "バックエンド", "TechTouch");
  assert.ok(hay.includes("backend engineer"));
  assert.ok(hay.includes("バックエンド"));
  assert.ok(hay.includes("techtouch"));
  assert.ok(hay.includes("go aws"));
  assert.equal(hay, hay.toLowerCase());
});

test("matchesFilter() honours each facet", () => {
  const job = { jp: "business", remote: "partial", spec: "Backend", loc: "東京都港区", stack: ["Go"], _hay: "backend engineer go techtouch" };
  assert.equal(LW.matchesFilter(job, {}), true);
  assert.equal(LW.matchesFilter(job, { jp: "business" }), true);
  assert.equal(LW.matchesFilter(job, { jp: "none" }), false);
  assert.equal(LW.matchesFilter(job, { remote: "partial" }), true);
  assert.equal(LW.matchesFilter(job, { remote: "full" }), false);
  assert.equal(LW.matchesFilter(job, { spec: "Backend" }), true);
  assert.equal(LW.matchesFilter(job, { spec: "Frontend" }), false);
  assert.equal(LW.matchesFilter(job, { stack: "Go" }), true);
  assert.equal(LW.matchesFilter(job, { stack: "Rust" }), false);
  assert.equal(LW.matchesFilter(job, { loc: "東京都港区" }), true);
  assert.equal(LW.matchesFilter(job, { loc: "大阪府" }), false);
  assert.equal(LW.matchesFilter(job, { q: "go" }), true);
  assert.equal(LW.matchesFilter(job, { q: "python" }), false);
});

test("matchesFilter() builds a haystack on the fly when _hay is absent", () => {
  const job = { role: "Rust Engineer", stack: ["Rust"], spec: "Backend" };
  assert.equal(LW.matchesFilter(job, { q: "rust" }), true);
});

test("filterJobs() filters then sorts hot roles first, preserving the rest", () => {
  const jobs = [
    { role: "A", spec: "Backend", hot: false },
    { role: "B", spec: "Backend", hot: true },
    { role: "C", spec: "Frontend", hot: false },
    { role: "D", spec: "Backend", hot: false },
  ];
  const out = LW.filterJobs(jobs, { spec: "Backend" });
  assert.deepEqual(out.map((j) => j.role), ["B", "A", "D"]); // B (hot) first; A,D keep order
});

test("formatJdText() returns '' for empty / non-string input", () => {
  assert.equal(LW.formatJdText(null), "");
  assert.equal(LW.formatJdText(undefined), "");
  assert.equal(LW.formatJdText(42), "");
  assert.equal(LW.formatJdText({}), "");
  assert.equal(LW.formatJdText(""), "");
});

test("formatJdText() normalizes newlines, trailing spaces, blank runs and outer blanks", () => {
  assert.equal(LW.formatJdText("a\r\nb\rc"), "a\nb\nc");                 // CRLF / CR → LF
  assert.equal(LW.formatJdText("line one   \nline two\t"), "line one\nline two"); // per-line rstrip
  assert.equal(LW.formatJdText("a\n\n\n\nb"), "a\n\nb");                 // 3+ newlines → exactly 2
  assert.equal(LW.formatJdText("\n\n  \na\n\n"), "a");                   // outer blank lines trimmed
});

test("formatJdText() unifies bullet glyphs to '- ' (JP glued and EN spaced variants)", () => {
  assert.equal(LW.formatJdText("・フロントエンド開発"), "- フロントエンド開発"); // glued JP bullet
  assert.equal(LW.formatJdText("• item"), "- item");
  assert.equal(LW.formatJdText("● item\n○ item\n◦ item\n‣ item\n▪ item\n▫ item\n■ item"),
    "- item\n- item\n- item\n- item\n- item\n- item\n- item");
  assert.equal(LW.formatJdText("* item"), "- item");
  assert.equal(LW.formatJdText("– dash item\n— em item\n‐ hyphen item"), "- dash item\n- em item\n- hyphen item");
  assert.equal(LW.formatJdText("-glued"), "- glued");                    // bare "-" glued to content
  assert.equal(LW.formatJdText("  - indented item"), "- indented item"); // indent dropped
  assert.equal(LW.formatJdText("- already fine"), "- already fine");
});

test("formatJdText() keeps numbered markers, ※ notes, and prose dashes/asterisks as-is", () => {
  assert.equal(LW.formatJdText("1. 書類選考\n2) 面接\n①応募\n②内定"), "1. 書類選考\n2) 面接\n①応募\n②内定");
  assert.equal(LW.formatJdText("※経験者優遇"), "※経験者優遇");
  assert.equal(LW.formatJdText("1.5 years of experience"), "1.5 years of experience"); // decimal ≠ marker
  assert.equal(LW.formatJdText("*emphasis* is not a bullet"), "*emphasis* is not a bullet"); // glued * kept
  assert.equal(LW.formatJdText("—glued em dash stays"), "—glued em dash stays");
});

test("formatJdText() inserts a blank line before headings so sections breathe", () => {
  assert.equal(LW.formatJdText("intro\n【募集背景】\n増員です。"), "intro\n\n【募集背景】\n増員です。");
  assert.equal(LW.formatJdText("intro\n▼業務内容\n開発"), "intro\n\n▼業務内容\n開発");
  assert.equal(LW.formatJdText("intro\nOverview:\ntext"), "intro\n\nOverview:\ntext");
  assert.equal(LW.formatJdText("intro\n選考フロー：\n①書類選考"), "intro\n\n選考フロー：\n①書類選考");
  // already separated → unchanged; heading first line → no leading blank
  assert.equal(LW.formatJdText("intro\n\n【募集背景】"), "intro\n\n【募集背景】");
  assert.equal(LW.formatJdText("【募集背景】\ntext"), "【募集背景】\ntext");
  // NOT headings: long colon lines (>40 chars), bullets ending with a colon
  const long = "this line is way too long to be considered a heading even with a colon:";
  assert.equal(LW.formatJdText("intro\n" + long), "intro\n" + long);
  assert.equal(LW.formatJdText("intro\n- 応募資格:"), "intro\n- 応募資格:");
});

test("formatJdText() is idempotent on messy JP and EN samples", () => {
  const samples = [
    "【募集背景】  \r\n事業拡大につき増員。\n\n\n▼業務内容\n・フロントエンド開発\n・コードレビュー\n選考フロー：\n①書類選考\n②面接\n※応相談",
    "About us\nOverview:\nWe build things.\n* TypeScript\n– Teamwork\n-Ownership\n\n\n\nBenefits:\n1. Insurance\n2) Stock",
    "", "plain single line",
  ];
  for (const s of samples) {
    const once = LW.formatJdText(s);
    assert.equal(LW.formatJdText(once), once, `not idempotent for: ${JSON.stringify(s)}`);
  }
});

test("jdBlocks() returns [] for empty / non-string input", () => {
  assert.deepEqual(LW.jdBlocks(""), []);
  assert.deepEqual(LW.jdBlocks(null), []);
  assert.deepEqual(LW.jdBlocks(undefined), []);
  assert.deepEqual(LW.jdBlocks(42), []);
  assert.deepEqual(LW.jdBlocks("\n\n \n"), []);
});

test("jdBlocks() parses a JP job description into heading / list / paragraph blocks", () => {
  const jd = "【募集背景】\n事業拡大につき増員します。\n\n▼業務内容\n・フロントエンド開発\n・コードレビュー\n\n選考フロー：\n①書類選考\n②面接";
  assert.deepEqual(LW.jdBlocks(jd), [
    { t: "h", x: "募集背景" },                                    // 【】 wrapper stripped
    { t: "p", x: "事業拡大につき増員します。" },
    { t: "h", x: "業務内容" },                                    // ▼ marker stripped
    { t: "ul", items: ["フロントエンド開発", "コードレビュー"] },  // "- " prefix stripped
    { t: "h", x: "選考フロー" },                                  // trailing ： stripped
    { t: "ul", items: ["①書類選考", "②面接"] },                  // numbered keep their marker
  ]);
});

test("jdBlocks() parses an EN job description with mixed bullet glyphs", () => {
  const jd = "About the role:\nWe build hiring tools.\nFor engineers moving to Japan.\n\nRequirements:\n- 5+ years of experience\n* Solid TypeScript\n– Team player\n\nProcess:\n1. Screening\n2) Interview";
  assert.deepEqual(LW.jdBlocks(jd), [
    { t: "h", x: "About the role" },
    { t: "p", x: "We build hiring tools.\nFor engineers moving to Japan." }, // \n kept; renderer does <br>
    { t: "h", x: "Requirements" },
    { t: "ul", items: ["5+ years of experience", "Solid TypeScript", "Team player"] },
    { t: "h", x: "Process" },
    { t: "ul", items: ["1. Screening", "2) Interview"] },
  ]);
});

test("jdBlocks() splits paragraph / list runs inside one blank-line chunk", () => {
  assert.deepEqual(LW.jdBlocks("Team of five.\n・Weekly 1on1\n・Hack days\n※リモート可"), [
    { t: "p", x: "Team of five." },
    { t: "ul", items: ["Weekly 1on1", "Hack days"] },
    { t: "p", x: "※リモート可" },                                  // ※ note stays plain text
  ]);
  // heading appearing mid-chunk (formatJdText splits it out with a blank line)
  assert.deepEqual(LW.jdBlocks("intro line\n福利厚生:\n・社会保険完備"), [
    { t: "p", x: "intro line" },
    { t: "h", x: "福利厚生" },
    { t: "ul", items: ["社会保険完備"] },
  ]);
});

test("jdBlocks() handles the live-data shapes: ・-joined demo items and '- '-prefixed proxy items", () => {
  // demo/fallback data builds required-points as "・" + pts.join("\n・") (see modal-job.js)
  const pts = ["3年以上の開発経験", "英語での業務経験"];
  assert.deepEqual(LW.jdBlocks("・" + pts.join("\n・")), [{ t: "ul", items: pts }]);
  // proxy (after the per-item "- " prefixing) → same tidy list
  assert.deepEqual(LW.jdBlocks("- Health insurance\n- Stock options"), [
    { t: "ul", items: ["Health insurance", "Stock options"] },
  ]);
  // today's proxy shape (newline-joined, NO markers) stays one paragraph — not a broken list
  assert.deepEqual(LW.jdBlocks("Health insurance\nStock options"), [
    { t: "p", x: "Health insurance\nStock options" },
  ]);
});

test("calcAge() computes whole years with an injectable 'now'", () => {
  assert.equal(LW.calcAge("1990-06-01", "2026-06-27"), 36);
  assert.equal(LW.calcAge("1990-12-31", "2026-06-27"), 35); // birthday not yet reached
  assert.equal(LW.calcAge("2026-06-27", "2026-06-27"), 0);
  assert.equal(LW.calcAge("", "2026-06-27"), "");
  assert.equal(LW.calcAge("not-a-date", "2026-06-27"), "");
  assert.equal(LW.calcAge("2030-01-01", "2026-06-27"), ""); // future -> out of range (lower bound)
  assert.equal(LW.calcAge("1850-01-01", "2026-06-27"), ""); // 176y -> out of range (upper 140 cap)
});
