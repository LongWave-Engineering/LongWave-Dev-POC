/* features/companies/companies.js — companies page render.
   Roster-driven: every client in PARTNERS gets a card showing its logo, name, and a
   one-line industry tag. The whole card is a button — clicking it opens the company
   modal (short summary of what they do + an "interested?" inquiry form). Order: live
   roles first, then placement clients, then roster order. */

  /* Stable name-hash → weighted gradient-variant class. The grid deliberately leans sky +
     navy: 9 of the 12 VMAP slots are sky/navy (v0 sky-wash, v1 neu-bg, v4 sky→navy wave),
     only 3 are warm/green accents (v2 banana, v3 green, v5 peach), so the set reads as one
     cohesive wash, not a rainbow. A company keeps its colour across reloads and reordering. */
  function coGradientClass(name){
    var h=0, s=String(name||"");
    for(var i=0;i<s.length;i++){ h=(h*31 + s.charCodeAt(i)) >>> 0; }
    var VMAP=["v0","v1","v4","v0","v1","v2","v4","v0","v1","v3","v4","v5"];
    return "co-" + VMAP[h % VMAP.length];
  }

  function renderCompanies(){
    var grid=$("#coGrid"); if(!grid) return;
    grid.innerHTML="";
    if(typeof PARTNERS==="undefined" || !PARTNERS.length) return;

    var countByName={};   /* live job counts — used only to order the grid */
    JOBS.forEach(function(j){ var c=COMPANIES[j.co]; var nm=(c&&c.name)||j.co; if(nm) countByName[nm]=(countByName[nm]||0)+1; });
    var rich={};          /* sector fallback for the few companies in COMPANY_LIST */
    (typeof COMPANY_LIST!=="undefined"?COMPANY_LIST:[]).forEach(function(co){ rich[co.name]=co; });

    PARTNERS.map(function(p,i){ return {p:p, i:i, n:countByName[p.name]||0}; })
      .sort(function(a,b){
        if(b.n!==a.n) return b.n-a.n;
        var pa=a.p.placement?1:0, pb=b.p.placement?1:0;
        if(pb!==pa) return pb-pa;
        return a.i-b.i;
      })
      .forEach(function(it){
        var p=it.p, r=rich[p.name];
        var industry = (p.industry && p.industry[lang]) || (r && r.sector && r.sector[lang]) || "";

        /* public status keys off live open roles only (it.n>0 vs partner); p.placement is
           never read here, so the confidential placement relationship never leaks. */
        var live     = it.n > 0;
        var badgeCls = live ? "co-badge--live" : "co-badge--partner";
        var badgeTxt = live ? t("comp_badge_live") : t("comp_badge_partner");
        /* strip the baked-in trailing arrow so our own arrow can slide independently */
        var ctaTxt   = t("comp_view_co").replace(/\s*→\s*$/, "");

        var card=el("div","co-card co-card--click "+ coGradientClass(p.name));
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
        grid.appendChild(card);
      });
  }
