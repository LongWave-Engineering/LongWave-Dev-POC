/* core/i18n.js — t(), field/lang helpers, HRMOS override, per-job enrichment.
   The EN/JA string dictionary (I18N) lives in core/i18n-data.js, concatenated just before
   this file so I18N is in scope here exactly as before. */
  /* ---------------- i18n ---------------- */
  /* Restore the visitor's last language choice (persisted by setLang) so JA-preferring
     users aren't reset to EN on every visit. Guarded for file:// / no-storage contexts. */
  var lang=(function(){ try{ var s=localStorage.getItem("lw_lang"); return (s==="en"||s==="ja")?s:"en"; }catch(e){ return "en"; } })();
  function t(k){ return (I18N[lang] && I18N[lang][k]!=null) ? I18N[lang][k] : (I18N.en[k]||k); }
  var $ = function(s,c){ return (c||document).querySelector(s); };
  function el(tag,cls,html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
  /* true when the page is SERVED over http(s) (a backend/API may exist) vs opened as a
     file:// (no API). Used to gate every fetch so the single-file build works offline. */
  function served(){ return /^https?:$/.test(location.protocol); }
  /* pure helpers live in core/logic.js (LW.*); alias the app-wide ones for brevity */
  var esc = LW.esc, salaryMax = LW.salaryMax;
  function nl2br(s){ return esc(s).replace(/\n/g,"<br>"); }

  /* NOTE: the lbl_jp_* and lbl_remote_* keys above are referenced dynamically by suffix
     (t("lbl_jp_"+level) / t("lbl_remote_"+r)) — they look unused to a naive grep but aren't. */
  function jpTag(level){ return '<span class="tag '+ LW.jpTagClass(level) +'">'+ esc(t("lbl_jp_"+level)) +'</span>'; }
  function remoteLabel(r){ return t("lbl_remote_"+r); }
  /* Language accessor for any job field. The base job fields are ENGLISH; the Japanese
     text lives per-job as `<field>_ja` (HRMOS data). Falls back to the legacy JOBS_JA map
     (keyed by English role) for the built-in demo data, then to the base field. So English
     mode always shows the base (English) and Japanese mode shows the JA override. */
  function jf(j, f){
    if(lang==="ja"){
      var jv = j[f+"_ja"];
      if(jv!=null && jv!=="") return jv;
      if(JOBS_JA[j.role] && JOBS_JA[j.role][f]!=null) return JOBS_JA[j.role][f];
    }
    return j[f];
  }
  function roleL(j){ return jf(j,"role"); }
  function bodyL(j){ return jf(j,"body"); }
  function pointsL(j){ return jf(j,"points"); }
  function locL(j){ return (lang==="ja" && j.loc==="Tokyo · Ginza") ? "東京・銀座" : j.loc; }
  /* insert a zero-width break after slashes so a long slash-separated title wraps AT the
     slashes (e.g. "…(Tokyo/Osaka/Kyoto/Nagoya/Fukuoka)") instead of breaking mid-word */
  function softBreak(s){ return String(s==null?"":s).replace(/([\/\uFF0F])/g, "$1\u200B"); }
  /* Map the HRMOS companies' Japanese names to the English keys in PARTNER_LOGOS, so
     every job card can show the crisp curated brand mark instead of the low-res HRMOS
     favicon (48–128px, several missing). Add a line here when a new client is synced. */
  var LOGO_ALIAS = {
    "株式会社マネーフォワード":"Money Forward",
    "株式会社エニトグループ":"Enito Group",
    "株式会社ギブリー":"Givery",
    "GO株式会社":"GO Inc.",
    "ＫＩＮＴＯテクノロジーズ株式会社":"KINTO Technologies",
    "株式会社アカツキAIテクノロジーズ":"Akatsuki",
    "ＭＥＴＡＴＥＡＭ株式会社":"METATEAM",
    "株式会社ツクルバ":"Tsukuruba",
    "株式会社ジーニー":"Geniee",
    "株式会社博報堂テクノロジーズ":"Hakuhodo Technologies",
    "株式会社asken":"asken",
    "株式会社XAION DATA":"Xaion Data",
    "movus technologies株式会社":"Movus Technologies",
    "株式会社ブリングアウト":"Bringout",
    "合同会社dotData Japan":"dotData Japan",
    "株式会社VRAIN Solution":"VRAIN Solution",
    "CBcloud株式会社":"CBcloud"
  };
  /* best mark for a company: prefer the crisp curated PARTNER_LOGOS entry (looked up by
     English name, mapping JP names through LOGO_ALIAS), then the embedded HRMOS logo,
     then null → caller draws a monogram. PARTNER_LOGOS is defined in a later script but
     avatarHTML is only ever called at render time, so the late reference is safe. */
  function bestLogo(c){
    if(!c) return null;
    if(typeof PARTNER_LOGOS !== "undefined" && PARTNER_LOGOS){
      var key = LOGO_ALIAS[c.name] || c.name;
      if(key && PARTNER_LOGOS[key]) return PARTNER_LOGOS[key];
    }
    return c.logo || null;
  }
  /* company avatar: crisp curated mark → embedded logo → coloured monogram */
  function avatarHTML(c, cls){
    var k=' class="avatar'+(cls?" "+cls:"")+'"';
    /* esc() the color/logo too — they can come from auto-generated HRMOS data, so
       an unescaped value could break out of the attribute (injection surface). */
    var logo = bestLogo(c);
    if(logo) return '<span'+k+' style="background:#fff"><img src="'+ esc(logo) +'" alt="" loading="lazy"></span>';
    return '<span'+k+' style="background:'+ esc((c&&c.color)||"#888") +'">'+ esc((c&&c.mono)||"?") +'</span>';
  }
  var BLURB = {
    "Data Engineer":{en:"Own the Snowflake / dbt pipelines behind a 10M-user DAP.", ja:"1,000万ユーザーのDAPを支えるSnowflake / dbt基盤を担当。"},
    "Senior Product Manager (Sr. PdM)":{en:"Discovery to delivery on a category-leading B2B SaaS.", ja:"カテゴリーをリードするB2B SaaSをディスカバリーからデリバリーまで。"},
    "SRE & Platform Specialist":{en:"Reliability, security and cost across a high-traffic platform.", ja:"高トラフィック基盤の信頼性・セキュリティ・コストを担当。"},
    "SRE & Platform Engineer":{en:"Grow into SRE on a 10M-MAU platform with Go and AWS.", ja:"10M MAUの基盤でSREへ成長。Go・AWS。"},
    "Analytics Engineer":{en:"Build the AI-ready data layer behind a live Text-to-SQL agent.", ja:"稼働中のText-to-SQL AIを支えるAI Readyなデータ基盤を構築。"},
    "SRE & Platform Manager (candidate)":{en:"Lead the SRE team through a multi-cloud, multi-AI shift.", ja:"マルチクラウド・マルチAIへの移行をSREチームでリード。"},
    "Software Engineer in Test (SET)":{en:"Drive Playwright E2E and CI/CD test strategy.", ja:"Playwright E2EとCI/CDのテスト戦略を推進。"},
    "QA Engineer":{en:"Own sprint quality, including non-deterministic AI features.", ja:"非決定的なAI機能を含むスプリント全体の品質を担当。"},
    "Customer Success Engineer (CSE)":{en:"Pre-sales to deep support for enterprise DAP customers.", ja:"エンタープライズDAP顧客をプリセールスから高度サポートまで支援。"}
  };
  /* ---- optional generated data from the HRMOS sync (jobs.js sets window.__HRMOS_DATA__) ----
     Falls back to the built-in lists above when no generated data is present. */
  if (window.__HRMOS_DATA__) {
    var _D = window.__HRMOS_DATA__;
    if (_D.COMPANIES) { for (var _k in _D.COMPANIES) COMPANIES[_k] = _D.COMPANIES[_k]; }
    if (_D.JOBS && _D.JOBS.length) { JOBS = _D.JOBS; }
    if (_D.JOBS_JA) { for (var _k2 in _D.JOBS_JA) JOBS_JA[_k2] = _D.JOBS_JA[_k2]; }
    if (_D.BLURB) { for (var _k3 in _D.BLURB) BLURB[_k3] = _D.BLURB[_k3]; }
  }
  function blurbL(j){ var b=BLURB[j.role]; return b ? (lang==="ja"?b.ja:b.en) : ""; }

  /* ---------------- enrich every loaded job (demo or HRMOS) ----------------
     classifySpec / locFromAddr now live in core/logic.js (LW.*) so they are unit
     tested. Here we apply them once and precompute, per job:
       _i   = original index into JOBS (so render loops avoid O(n) indexOf)
       _hay = lowercased free-text search index (so filtering never rebuilds it) */
  function enrichJobs(){
    for (var _ji=0; _ji<JOBS.length; _ji++){
      var _job = JOBS[_ji];
      _job._i = _ji;
      _job.spec = LW.classifySpec(_job);
      var _nl = LW.locFromAddr(_job.office || _job.loc);
      if(_nl) _job.loc = _nl;
      var _jaRole = JOBS_JA[_job.role] ? JOBS_JA[_job.role].role : "";
      _job._hay = LW.searchHay(_job, _jaRole, (COMPANIES[_job.co] || {}).name);
    }
  }
  enrichJobs();   /* run once on the embedded snapshot; re-run after live hydration */



