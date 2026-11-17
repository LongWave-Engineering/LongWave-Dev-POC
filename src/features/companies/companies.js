/* features/companies/companies.js — companies page render + live filter (flat editorial).
   Roster-driven: every client in PARTNERS gets a card (dynamic logo, name, one-line industry).
   The WHOLE card is a button — clicking it (or Enter / Space while focused) opens the company
   inquiry modal, wired in features/modals/lead-forms.js via [data-company].
   Order: live open roles first, then placement clients, then roster order.

   Filter bar (mockup: a search/filter row above the grid) wired to REAL company data:
     • search  — matches company name + industry text (so typing "SaaS", "Fintech", "AI" … narrows by sector too)
     • sector  — built from the companies' OWN industry labels: the lead term before a · / & /
                 separator, case-folded for grouping. Only sectors with >=2 companies become
                 options (the long tail stays reachable via search). No invented attributes.
   The mockup's language / visa / size selects are NOT ported: there is no company-level
   language/visa/size data in this build (jobs carry jp/visa, but only one partner has public
   roles). See the task handoffs for what fields would be needed to add them. */

  var CO_SORTED = null;   /* the ordered roster (live → placement → roster order), cached between paints */

  /* use the real i18n key, else a built-in English fallback — so JS-built strings read
     correctly before the new comp_* keys are merged into i18n-data.js (t() echoes the key). */
  function coT(k, fb){ var v=t(k); return v===k ? fb : v; }
  function coIndustry(p){ return (p.industry && (p.industry[lang]||p.industry.en)) || ""; }
  /* language-independent sector KEY (lead term of the ENGLISH label, case-folded) so a picked
     sector survives a language toggle; the option TEXT is localized separately below. */
  function coSectorKey(p){ var en=(p.industry&&p.industry.en)||""; return en.split(/\s*[·\/&]\s*/)[0].trim().toLowerCase(); }
  function coSectorLabel(p){ return coIndustry(p).split(/\s*[·\/&]\s*/)[0].trim(); }

  function renderCompanies(){
    var grid=$("#coGrid"); if(!grid) return;
    if(typeof PARTNERS==="undefined" || !PARTNERS.length){ CO_SORTED=[]; buildCoSectors(); paintCompanies(); return; }

    var countByName={};   /* live job counts — used only to order the grid + pick the public status */
    JOBS.forEach(function(j){ var c=COMPANIES[j.co]; var nm=(c&&c.name)||j.co; if(nm) countByName[nm]=(countByName[nm]||0)+1; });
    var rich={};          /* sector fallback for the few companies also in COMPANY_LIST */
    (typeof COMPANY_LIST!=="undefined"?COMPANY_LIST:[]).forEach(function(co){ rich[co.name]=co; });

    CO_SORTED = PARTNERS.map(function(p,i){ return {p:p, i:i, n:countByName[p.name]||0}; })
      .sort(function(a,b){
        if(b.n!==a.n) return b.n-a.n;
        var pa=a.p.placement?1:0, pb=b.p.placement?1:0;
        if(pb!==pa) return pb-pa;
        return a.i-b.i;
      })
      /* keep only what the card needs. live keys off open roles ONLY (it.n>0); p.placement is
         never carried through here, so the confidential placement relationship never leaks. */
      .map(function(it){ return {p:it.p, live:it.n>0, rich:rich[it.p.name]}; });

    buildCoSectors();
    paintCompanies();
  }

  /* (re)build the Sector <select> from the roster; preserve the current pick if still valid.
     Called on first render AND on every language toggle (option TEXT is re-localized, but the
     option VALUE is the stable English-derived key, so the selection carries across). */
  function buildCoSectors(){
    var sel=$("#coSector"); if(!sel) return;
    var prev=sel.value, map={};
    (CO_SORTED||[]).forEach(function(it){
      var k=coSectorKey(it.p); if(!k) return;
      if(!map[k]) map[k]={label:coSectorLabel(it.p), n:0};
      map[k].n++;
    });
    var keys=Object.keys(map).filter(function(k){ return map[k].n>=2; })
      .sort(function(a,b){ return map[b].n-map[a].n || map[a].label.localeCompare(map[b].label); });
    var html='<option value="">'+ esc(coT("comp_sector_all","All sectors")) +'</option>';
    keys.forEach(function(k){ html+='<option value="'+ esc(k) +'">'+ esc(map[k].label)+' ('+map[k].n+')</option>'; });
    sel.innerHTML=html;
    sel.value = (prev && map[prev] && map[prev].n>=2) ? prev : "";
  }

  function coMatches(it, q, sec){
    if(q && (it.p.name+" "+coIndustry(it.p)).toLowerCase().indexOf(q)===-1) return false;
    if(sec && coSectorKey(it.p)!==sec) return false;
    return true;
  }

  /* paint the grid from the current filter values; keep the live count + empty state in sync */
  function paintCompanies(){
    var grid=$("#coGrid"); if(!grid) return;
    var q=(($("#coSearch")&&$("#coSearch").value)||"").trim().toLowerCase();
    var sec=($("#coSector")&&$("#coSector").value)||"";
    var all=CO_SORTED||[];
    var shown=all.filter(function(it){ return coMatches(it,q,sec); });
    grid.innerHTML="";
    shown.forEach(function(it){ grid.appendChild(buildCoCard(it)); });
    var empty=$("#coEmpty"); if(empty) empty.hidden = (shown.length>0 || all.length===0);
    var cnt=$("#coCount");
    if(cnt) cnt.textContent = coT("comp_count","{n} of {total} companies").replace("{n}",shown.length).replace("{total}",all.length);
  }

  /* one roster card: flat panel, dynamic logo, live-only status badge. The WHOLE card is a
     button that opens the company inquiry modal — every id / attr / hook preserved exactly
     (data-company + role=button + tabindex + aria-label drive modals/lead-forms.js). */
  function buildCoCard(it){
    var p=it.p, r=it.rich;
    var industry = (p.industry && p.industry[lang]) || (r && r.sector && r.sector[lang]) || "";

    /* public status keys off live open roles only (it.live) — "Open roles" vs "Partner" — so
       the confidential placement relationship never reaches the page. */
    var badgeCls = it.live ? "co-badge--live" : "co-badge--partner";
    var badgeTxt = it.live ? t("comp_badge_live") : t("comp_badge_partner");
    /* strip the baked-in trailing arrow so our own arrow can slide independently */
    var ctaTxt   = t("comp_view_co").replace(/\s*→\s*$/, "");

    var card=el("div","co-card co-card--click");
    card.setAttribute("data-company", p.name);
    card.setAttribute("role","button");
    card.setAttribute("tabindex","0");
    card.setAttribute("aria-label", p.name + ", " + t("comp_view_co_a11y"));
    card.innerHTML=
      '<span class="co-badge '+ badgeCls +'"><span class="co-dot" aria-hidden="true"></span>'+ esc(badgeTxt) +'</span>'+
      '<div class="co-head">'+ avatarHTML({logo:(typeof PARTNER_LOGOS!=="undefined"?PARTNER_LOGOS[p.name]:null), color:p.color, mono:p.mono}) +
        '<div class="co-id"><div class="co-name">'+ esc(p.name) +'</div>'+
        (industry?'<div class="co-sector">'+ esc(industry) +'</div>':'')+'</div>'+
      '</div>'+
      '<div class="co-cta">'+ esc(ctaTxt) +'<span class="co-arrow" aria-hidden="true">→</span></div>';
    return card;
  }

  /* wire the filter controls once. This script runs at the end of <body>, so the markup
     (#coSearch / #coSector / #coClear) already exists; these elements are never re-created by
     renderCompanies (only #coGrid is), so the handlers survive language toggles + hydration. */
  (function(){
    var s=$("#coSearch"); if(s) s.addEventListener("input", paintCompanies);
    var sec=$("#coSector"); if(sec) sec.addEventListener("change", paintCompanies);
    var clr=$("#coClear"); if(clr) clr.addEventListener("click", function(){
      if(s) s.value=""; if(sec) sec.value=""; paintCompanies(); if(s) s.focus();
    });
  })();
