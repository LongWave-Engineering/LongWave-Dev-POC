/* core/logic.js — pure, framework-free domain logic (LW.*).
   No DOM, no app state, so the exact same code is used by the browser bundle
   (exposed as `LW` in the IIFE scope) AND require()'d by the Node unit tests in
   /test (via the module.exports footer). Put testable pure logic here. */
  var LW = (function(){
    "use strict";

    /* HTML-escape — the one helper that's both pure and used app-wide. */
    function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }

    /* Canonical, ordered specialty list (drives the filter dropdown order).
       Every value classifySpec() can return MUST appear here — guarded by a test. */
    var SPECS = ["Frontend","Backend","Full-Stack","Software Engineering","Mobile","AI / ML","Data Engineering","SRE / Infra","Security","QA / Test","UI/UX & Design","Hardware & Mfg","Product Management","Project / Program Mgmt","Engineering Management","Consulting","Sales & BD","Management","Corporate & Ops","Other"];

    /* Specialty classification rules, FIRST MATCH WINS — order matters (e.g. QA
       before generic Engineering, Hardware before generic Engineering). Matched as
       substrings against " <role-before-—> <stack> " lowercased. Tune keywords here. */
    var SPEC_RULES = [
      { spec:"QA / Test", kw:["qa engineer","qa manager","qa lead","qa)"," qa ","sdet","engineer in test","quality engineer","quality assurance","test engineer","test automation"] },
      { spec:"Engineering Management", kw:["engineering manager","engineering lead","vpoe","vp of engineering","vp of technology","vpot","head of engineering","director of engineering","senior engineering manager"] },
      { spec:"UI/UX & Design", kw:["ui/ux","ux design","ux)","designer","product design","communication design","web design","cg design","3d / cg","3d/cg","blender"] },
      { spec:"AI / ML", kw:["ai engineer","ml engineer","ai/ml","ml/ai","machine learning","data scientist","data science","data & ai","ml platform","ai platform","ml modeling","ai researcher","research engineer","llm","deep learning"," nlp ","agent harness","ai evaluation","ai success","ai application engineer","ai agent engineer","prompt"] },
      { spec:"Data Engineering", kw:["data engineer","analytics engineer","data analyst","data platform","data infrastructure","data enablement"," dbt"," etl"] },
      { spec:"SRE / Infra", kw:["sre","site reliability","infrastructure","platform engineer","platform microservices","cloud engineer","cloud security","cloud infrastructure","devops","dbre","network engineer","iam ","reliability engineer"] },
      { spec:"Security", kw:["security","ciso","vulnerab","csirt"] },
      { spec:"Mobile", kw:["android","ios ","ios)","mobile engineer","flutter","react native"] },
      { spec:"Frontend", kw:["frontend","front-end","front end"] },
      { spec:"Full-Stack", kw:["full-stack","full stack","fullstack"] },
      { spec:"Backend", kw:["backend","back-end","server-side","server side"] },
      { spec:"Hardware & Mfg", kw:["electrical","mechanical","hardware","robotics","image processing","circuit","plc","automation-line","inspection equipment","field engineer","x-ray","manufacturing","cg designer"] },
      { spec:"Product Management", kw:["product manager","product owner","product planner","head of product","chief product officer"," cpo","product lead","(pdm","pdm)"," pdm"," pmm","product management"] },
      { spec:"Project / Program Mgmt", kw:["project manager","project leader","program manager","scrum master","pmo","(pjm","pjm)","project promotion"] },
      { spec:"Consulting", kw:["consultant","consulting","solutions architect","solution consultant","forward deployed","(fde","fde)"," fde","deployment strategist","pre-sales","presales","pre sales"] },
      { spec:"Sales & BD", kw:[" sales","(sales","sales)","account executive","account manager","account sales","business development"," bd ","(bd","inside sales","enterprise sales","headhunter","marketer","marketing"] },
      { spec:"Software Engineering", kw:["engineer","developer","architect","programmer","swe"] },
      { spec:"Corporate & Ops", kw:["recruit"," hr ","hr ","human resources","legal","complian","accounting","accountant"," finance","fp&a"," ir ","investor","corporate","labor","general affairs","administration","secretary"," planning","planner","operations","procurement","purchasing","policy","public affairs"," pr ","public relations","talent","organizational","audit","screening","customer success","customer support","support desk","liaison"] },
      { spec:"Management", kw:["manager","director","head of"," officer","vp of","cfo","cao","cmo","cro","executive","lead candidate","chief","strategist"] }
    ];

    function classifySpec(job){
      /* classify on the role part BEFORE the "— Division" suffix, padded so
         leading-space keys also match at the start of the title */
      var primary = String((job && job.role) || "").split(/—|–/)[0];
      var hay = (" " + primary + " " + (((job && job.stack) || []).join(" ")) + " ").toLowerCase();
      for(var i=0; i<SPEC_RULES.length; i++){
        var kw = SPEC_RULES[i].kw;
        for(var j=0; j<kw.length; j++){ if(hay.indexOf(kw[j]) > -1) return SPEC_RULES[i].spec; }
      }
      return "Other";
    }

    /* Prefecture lookup for addresses that name a city but not the prefecture. */
    var CITY_PREF = [["札幌","北海道"],["仙台","宮城県"],["さいたま","埼玉県"],["千葉","千葉県"],["横浜","神奈川県"],["川崎","神奈川県"],["名古屋","愛知県"],["名駅","愛知県"],["京都","京都府"],["大阪","大阪府"],["神戸","兵庫県"],["広島","広島県"],["博多","福岡県"],["福岡","福岡県"],["金沢","石川県"],["宇都宮","栃木県"],["田町","東京都"],["Tamachi","東京都"]];

    /* Location label from a full address: prefecture, plus the ward (区) only when
       it sits DIRECTLY under that prefecture (Tokyo's special wards). Designated-city
       wards (under a 市) collapse to the prefecture. "" if no prefecture is found. */
    function locFromAddr(addr){
      var s = String(addr || "");
      var pm = s.match(/(東京都|北海道|京都府|大阪府|[一-鿿]{2,3}県)/);
      var pref = pm ? pm[1] : "";
      if(!pref){ for(var i=0;i<CITY_PREF.length;i++){ if(s.indexOf(CITY_PREF[i][0]) > -1){ pref = CITY_PREF[i][1]; break; } } }
      if(!pref) return "";
      var wm = s.match(new RegExp(pref + "([一-鿿]{1,3}区)"));
      return pref + (wm ? wm[1] : "");
    }

    /* Top of the salary band as a compact chip label: "¥8M – ¥13M" -> "¥13M DOE".
       Some HRMOS rows carry free-text (e.g. "conditions depend on experience")
       instead of a ¥ band; for those, show a neutral fallback (default "DOE")
       rather than dumping a whole sentence into the salary chip. Pass a localized
       label (e.g. "Negotiable"/"応相談") as the 2nd arg. */
    function salaryMax(job, negotiableLabel){
      var s = String(job && job.salary != null ? job.salary : "");
      var m = s.match(/¥[\d.]+M/g);
      if(m) return m[m.length-1] + " DOE";
      return negotiableLabel || "DOE";
    }

    /* CSS class for the Japanese-level tag. */
    function jpTagClass(level){
      return level === "none" ? "tag--jp-none" : (level === "business" ? "tag--jp-high" : "tag--jp-mid");
    }

    /* Lowercased free-text search index for a job. Built once per job at load
       (stored as job._hay) so filtering doesn't rebuild it on every keystroke. */
    function searchHay(job, jaRole, coName){
      return (job.role + " " + (jaRole || "") + " " + (coName || "") + " " + (((job.stack) || []).join(" ")) + " " + (job.spec || "")).toLowerCase();
    }

    /* True if any facet of the filter object is set. */
    function hasActiveFilter(f){ return !!(f && (f.q || f.jp || f.remote || f.spec || f.loc || f.stack)); }

    /* Does a single job pass the filter? Uses precomputed job._hay for the text
       query when present, else builds the haystack on the fly. */
    function matchesFilter(job, f){
      if(!f) return true;
      if(f.jp && job.jp !== f.jp) return false;
      if(f.remote && job.remote !== f.remote) return false;
      if(f.spec && job.spec !== f.spec) return false;
      if(f.loc && job.loc !== f.loc) return false;
      if(f.stack && (job.stack || []).indexOf(f.stack) === -1) return false;
      if(f.q){ var hay = job._hay || searchHay(job); if(hay.indexOf(f.q) === -1) return false; }
      return true;
    }

    /* Filter a list of jobs and sort hot roles first (stable). */
    function filterJobs(jobs, f){
      return jobs.filter(function(j){ return matchesFilter(j, f); })
                 .sort(function(a,b){ return (b.hot ? 1 : 0) - (a.hot ? 1 : 0); });
    }

    /* Age in whole years from an ISO date string. `now` is injectable for tests.
       Returns "" for empty/invalid/out-of-range input. */
    function calcAge(dob, now){
      if(!dob) return "";
      var d = new Date(dob);
      if(isNaN(d.getTime())) return "";
      var n = now ? new Date(now) : new Date();
      var a = n.getFullYear() - d.getFullYear();
      var mm = n.getMonth() - d.getMonth();
      if(mm < 0 || (mm === 0 && n.getDate() < d.getDate())) a--;
      return (a >= 0 && a < 140) ? a : "";
    }

    return {
      esc: esc,
      SPECS: SPECS,
      SPEC_RULES: SPEC_RULES,
      classifySpec: classifySpec,
      CITY_PREF: CITY_PREF,
      locFromAddr: locFromAddr,
      salaryMax: salaryMax,
      jpTagClass: jpTagClass,
      searchHay: searchHay,
      hasActiveFilter: hasActiveFilter,
      matchesFilter: matchesFilter,
      filterJobs: filterJobs,
      calcAge: calcAge
    };
  })();

  /* Node (unit tests) reads the module here; the browser bundle ignores this line. */
  if (typeof module !== "undefined" && module.exports) { module.exports = LW; }
