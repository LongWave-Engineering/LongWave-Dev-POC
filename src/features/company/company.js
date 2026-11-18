/* features/company/company.js — the per-company profile page (japan-dev layout, OUR data).
   renderCompanyDetail() reads the hash slug (#/company/<slug>), finds the roster company,
   derives its facts from REAL jobs, and paints a banner / logo / name / tabs / About /
   Roles / Work style / Tech layout. Re-rendered by applyLang (EN/JA) and by showRoute.

   CONTRACTED vs DIRECT is the key distinction (user ask 2026-11-18): a company we represent
   (its roles are not `direct`) gets the gold "represented by LongWave" treatment and roles
   that apply THROUGH us; a marquee/non-client company (roles `direct`) gets a neutral
   "direct listing — we don't represent this employer" treatment and roles apply on the
   company's own site (the one unavoidable off-site link — there is NO company-website link). */

  /* name -> url slug; exposed so companies.js can build the card href identically */
  function companySlug(name){ var s=String(name||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); return s || encodeURIComponent(String(name||"")); }
  if (typeof window !== "undefined") window.companySlug = companySlug;

  /* the hash segment is matched RAW against companySlug() output (which is already URL-safe —
     [a-z0-9-], or encodeURIComponent for a non-ASCII name), so we never decode here: no
     decodeURIComponent means no URIError crash on a malformed "#/company/%" (review finding). */
  function cdSlugFromHash(){
    var h=String(location.hash||"").replace(/^#\/?/,"");          /* "company/money-forward" */
    var parts=h.split("/"); return parts[0]==="company" ? (parts[1]||"") : "";
  }
  function cdFindCompany(slug){
    if(!slug) return null;
    /* rich roster entry first (carries industry + blurb). _roster=true marks a company we
       curate — the authoritative "we represent / partner" signal (marquee non-client cos are
       NOT in the roster). Return a shallow copy so the tag never mutates the shared roster. */
    if(typeof PARTNERS!=="undefined" && PARTNERS.length){
      for(var i=0;i<PARTNERS.length;i++){ var e=PARTNERS[i];
        if(companySlug(e.name)===slug) return { name:e.name, color:e.color, mono:e.mono, industry:e.industry, blurb:e.blurb, _roster:true }; }
    }
    /* fall back to the hydrated company map (covers marquee/direct companies that aren't in
       the curated roster): synthesize a minimal entry — industry from its sector, no blurb. */
    if(typeof COMPANIES!=="undefined"){
      for(var k in COMPANIES){ var c=COMPANIES[k];
        if(c && companySlug(c.name)===slug) return { name:c.name, color:c.color, mono:c.mono, industry:c.sector||c.industry, _roster:false }; }
    }
    return null;
  }
  function cdJobsFor(p){
    if(typeof JOBS==="undefined") return [];
    return JOBS.filter(function(j){ var c=COMPANIES[j.co]; return c && companySlug(c.name)===companySlug(p.name); });
  }

  /* ---- fact derivation from real roles (never fabricated) ---- */
  function cdSalaryRange(jobs){
    var nums=[];
    jobs.forEach(function(j){ var s=String(j.salary||""); var m, re=/([\d.]+)\s*M/gi; while((m=re.exec(s))) nums.push(parseFloat(m[1])); });
    if(!nums.length) return "";
    var lo=Math.min.apply(null,nums), hi=Math.max.apply(null,nums);
    var f=function(n){ return "¥"+(n%1?n.toFixed(1):n)+"M"; };
    return lo===hi ? f(lo) : f(lo)+" – "+f(hi);
  }
  var CD_JP_RANK={ none:0, conversational:1, daily:1, business:2, fluent:3, native:4 };
  function cdJpRange(jobs){
    var seen={}, has=false;
    jobs.forEach(function(j){ if(j.jp!=null){ seen[j.jp]=true; has=true; } });
    if(!has) return "";
    var keys=Object.keys(seen).sort(function(a,b){ return (CD_JP_RANK[a]||0)-(CD_JP_RANK[b]||0); });
    var lo=t("lbl_jp_"+keys[0]), hi=t("lbl_jp_"+keys[keys.length-1]);
    return keys.length===1 ? lo : lo+" → "+hi;
  }
  function cdWorkingLang(jobs){
    if(!jobs.length) return "";
    var needsNone=jobs.some(function(j){ return j.jp==="none"; });
    return needsNone ? t("cd_lang_en") : t("cd_lang_ja");
  }
  function cdVisa(jobs){
    if(jobs.some(function(j){ return j.visa; })) return t("cd_visa_yes");
    if(jobs.some(function(j){ return j.abroad; })) return t("cd_visa_overseas");
    return "";
  }
  function cdLocation(p, jobs){
    var c=null; for(var k in COMPANIES){ if(COMPANIES[k] && companySlug(COMPANIES[k].name)===companySlug(p.name)){ c=COMPANIES[k]; break; } }
    if(c && c.loc) return c.loc;
    var locs={}; jobs.forEach(function(j){ if(j.loc) locs[j.loc]=(locs[j.loc]||0)+1; });
    var best="", n=0; for(var L in locs){ if(locs[L]>n){ n=locs[L]; best=L; } }
    return best;
  }
  function cdTechTags(jobs){
    var seen={}, out=[];
    jobs.forEach(function(j){ (j.stack||[]).forEach(function(s){ var k=String(s).trim(); if(k && !seen[k.toLowerCase()]){ seen[k.toLowerCase()]=1; out.push(k); } }); });
    return out.slice(0,14);
  }
  function cdWorkStyleTags(jobs){
    var tags=[];
    if(jobs.some(function(j){ return j.remote==="full"||j.remote==="remote"; })) tags.push(t("cd_ws_remote"));
    if(jobs.some(function(j){ return j.remote==="partial"||j.remote==="hybrid"; })) tags.push(t("cd_ws_hybrid"));
    if(jobs.some(function(j){ return j.visa; })) tags.push(t("cd_ws_visa"));
    if(jobs.some(function(j){ return j.abroad; })) tags.push(t("cd_ws_overseas"));
    if(jobs.some(function(j){ return j.jp==="none"; })) tags.push(t("cd_ws_english"));
    return tags;
  }

  function cdFactRow(label, value){ return value ? '<div class="cd-fact"><dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd></div>' : ""; }
  function cdTag(txt, cls){ return '<span class="cd-chip'+(cls?" "+cls:"")+'">'+esc(txt)+'</span>'; }

  function renderCompanyDetail(){
    var root=$("#cdContent"); if(!root) return;
    /* applyLang() calls this on every language toggle; only paint when we're actually on the
       company route (checked off the hash, not the .active class, which isn't set yet when
       showRoute calls us pre-reveal — that timing gap used to blank the page). */
    var onRoute = String(location.hash||"").replace(/^#\/?/,"").split("/")[0]==="company";
    if(!onRoute) return;
    var slug=cdSlugFromHash();
    var p=cdFindCompany(slug);

    if(!p){
      root.innerHTML='<div class="wrap cd-missing"><p>'+esc(t("cd_not_found"))+'</p>'+
        '<a class="btn btn--ink" href="#/companies" data-go="companies">'+esc(t("cd_back"))+'</a></div>';
      return;
    }

    var jobs=cdJobsFor(p);
    /* CONTRACTED vs DIRECT, honestly: a company is REPRESENTED when it is in our curated roster
       (_roster) OR carries at least one non-direct (placeable) role. It is DIRECT (marquee /
       non-client) only when it is positively NOT ours — not in the roster AND every live role is
       a direct listing. We never assert "Represented by LongWave" without that positive evidence,
       so a stale/empty snapshot can't publish a false representation claim (review findings). */
    var hasRepRole = jobs.some(function(j){ return !j.direct; });
    var represented = !!p._roster || hasRepRole;
    var isDirect = !represented && jobs.length>0 && jobs.every(function(j){ return j.direct; });
    var industry=(p.industry && (p.industry[lang]||p.industry.en))||"";
    var blurb=(p.blurb && (p.blurb[lang]||p.blurb.en))||"";
    var logo=avatarHTML({ logo:(typeof PARTNER_LOGOS!=="undefined"?PARTNER_LOGOS[p.name]:null), color:p.color, mono:p.mono }, "cd-logo-img");

    /* facts */
    var loc=cdLocation(p,jobs), lang_=cdWorkingLang(jobs), jpr=cdJpRange(jobs), sal=cdSalaryRange(jobs), visa=cdVisa(jobs);
    var tech=cdTechTags(jobs), ws=cdWorkStyleTags(jobs);
    var rolesN=jobs.length;

    /* ---- header: banner + logo card + name + open-roles (NO website link) ---- */
    var badge = represented
      ? '<span class="cd-badge cd-badge--repr">'+esc(t("cd_contracted"))+'</span>'
      : (isDirect ? '<span class="cd-badge cd-badge--direct">'+esc(t("cd_direct"))+'</span>' : '');
    var openRoles = rolesN
      ? '<button type="button" class="btn '+(represented?"btn--banana":"btn--ink")+' cd-openbtn" data-cd-scroll="cd-roles">'+esc(t("cd_open_roles").replace("{n}",rolesN))+' ↓</button>'
      : '';

    var tabs=[['cd-about',t("cd_tab_about")],['cd-roles',t("cd_tab_jobs").replace("{n}",rolesN)]];
    if(ws.length) tabs.push(['cd-culture',t("cd_tab_culture")]);
    if(tech.length) tabs.push(['cd-tech',t("cd_tab_tags")]);
    var tabNav=tabs.map(function(x){ return '<button type="button" class="cd-tab" data-cd-scroll="'+x[0]+'">'+esc(x[1])+'</button>'; }).join("");

    /* ---- roles ---- */
    var rolesHTML = rolesN
      ? jobs.map(function(j){ return '<button type="button" class="cd-role" data-cd-open="'+j._i+'">'+cardHTML(j)+'</button>'; }).join("")
      : '<p class="cd-empty">'+esc(t("cd_no_roles"))+'</p>';

    /* ---- the represented/direct explainer + CTA ---- */
    /* represented -> gold panel + "Get introduced via LongWave". direct -> neutral "we don't
       represent them" note, NO apply-through-us CTA. unknown (positively neither) -> no panel,
       so we never claim a relationship we can't stand behind. */
    var relNote = represented
      ? '<div class="cd-rel cd-rel--repr"><b>'+esc(t("cd_contracted"))+'</b><p>'+esc(t("cd_contracted_note"))+'</p>'+
        '<a class="btn btn--banana" href="#/join" data-go="join">'+esc(t("cd_cta_contracted"))+' →</a></div>'
      : (isDirect ? '<div class="cd-rel cd-rel--direct"><b>'+esc(t("cd_direct"))+'</b><p>'+esc(t("cd_direct_note").replace("{co}",p.name))+'</p></div>' : '');

    root.innerHTML =
      '<div class="cd-hero'+(isDirect?" cd-hero--direct":"")+'">'+
        '<div class="cd-banner" aria-hidden="true"></div>'+
        '<div class="wrap cd-head">'+
          '<span class="cd-logo">'+logo+'</span>'+
          '<div class="cd-id">'+
            '<div class="cd-id-top">'+badge+'</div>'+
            '<h1 class="cd-name">'+esc(p.name)+'</h1>'+
            (industry?'<p class="cd-industry">'+esc(industry)+'</p>':'')+
          '</div>'+
          '<div class="cd-head-cta">'+openRoles+'</div>'+
        '</div>'+
      '</div>'+
      '<nav class="cd-tabs wrap" aria-label="'+esc(p.name)+'">'+
        '<a class="cd-tab cd-tab--back" href="#/companies" data-go="companies">← '+esc(t("cd_back"))+'</a>'+
        tabNav+
      '</nav>'+
      '<div class="wrap cd-layout">'+
        '<div class="cd-main">'+
          '<section id="cd-about" class="cd-section">'+
            '<h2>'+esc(t("cd_about_h").replace("{co}",p.name))+'</h2>'+
            '<div class="cd-facts">'+
              cdFactRow(t("cd_fact_loc"),loc)+cdFactRow(t("cd_fact_lang"),lang_)+
              cdFactRow(t("cd_fact_jp"),jpr)+cdFactRow(t("cd_fact_salary"),sal)+
              cdFactRow(t("cd_fact_visa"),visa)+cdFactRow(t("cd_fact_roles"),rolesN?String(rolesN):"")+
            '</div>'+
            (blurb?'<p class="cd-blurb">'+esc(blurb)+'</p>':'')+
          '</section>'+
          '<section id="cd-roles" class="cd-section">'+
            '<h2>'+esc(t("cd_jobs_h").replace("{co}",p.name))+'</h2>'+
            '<div class="cd-roles-list">'+rolesHTML+'</div>'+
          '</section>'+
          (ws.length?('<section id="cd-culture" class="cd-section"><h2>'+esc(t("cd_culture_h"))+'</h2>'+
            '<div class="cd-chips">'+ws.map(function(w){ return cdTag(w,"cd-chip--ws"); }).join("")+'</div>'+
            '<p class="cd-note">'+esc(t("cd_culture_note"))+'</p></section>'):'')+
          (tech.length?('<section id="cd-tech" class="cd-section"><h2>'+esc(t("cd_tags_h"))+'</h2>'+
            '<div class="cd-chips">'+tech.map(function(tg){ return cdTag(tg,"cd-chip--tech"); }).join("")+'</div></section>'):'')+
        '</div>'+
        '<aside class="cd-aside">'+relNote+
          '<div class="cd-claim"><h3>'+esc(t("cd_claim_h"))+'</h3><p>'+esc(t("cd_claim_p"))+'</p>'+
            '<a class="cd-claim-link" href="#/post" data-go="post">'+esc(t("cd_claim_link"))+' →</a></div>'+
        '</aside>'+
      '</div>';
  }
  if (typeof window !== "undefined") window.renderCompanyDetail = renderCompanyDetail;

  /* delegated interactions (bound once; survives re-renders of #cdContent) */
  (function(){
    var page=$("#page-company"); if(!page) return;
    page.addEventListener("click", function(e){
      var open=e.target.closest("[data-cd-open]");
      if(open && typeof openJob==="function"){ openJob(parseInt(open.getAttribute("data-cd-open"),10)); return; }
      var scroll=e.target.closest("[data-cd-scroll]");
      if(scroll){ var tgt=document.getElementById(scroll.getAttribute("data-cd-scroll")); if(tgt) tgt.scrollIntoView({behavior:"smooth",block:"start"}); }
    });
  })();
