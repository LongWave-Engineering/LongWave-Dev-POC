/* features/companies/companies.js — companies page render.
   Roster-driven: every client in PARTNERS (the curated list) gets a card. Companies
   with live roles show the count + "View roles"; companies with 0 listed roles show
   an "Interested? Ask about roles" inquiry that opens the signup modal pre-set to that
   company. Order: live roles first, then placement clients, then the rest. */
  function renderCompanies(){
    var grid=$("#coGrid"); if(!grid) return;
    grid.innerHTML="";
    if(typeof PARTNERS==="undefined" || !PARTNERS.length) return;

    /* live job count per company display-name (works for the demo + hydrated data) */
    var countByName={};
    JOBS.forEach(function(j){ var c=COMPANIES[j.co]; var nm=(c&&c.name)||j.co; if(nm) countByName[nm]=(countByName[nm]||0)+1; });
    /* rich sector/blurb (only the few in COMPANY_LIST carry it) keyed by name */
    var rich={};
    (typeof COMPANY_LIST!=="undefined"?COMPANY_LIST:[]).forEach(function(co){ rich[co.name]=co; });

    /* sort: most live roles first, then placement clients, then roster order */
    PARTNERS.map(function(p,i){ return {p:p, i:i, n:countByName[p.name]||0}; })
      .sort(function(a,b){
        if(b.n!==a.n) return b.n-a.n;
        var pa=a.p.placement?1:0, pb=b.p.placement?1:0;
        if(pb!==pa) return pb-pa;
        return a.i-b.i;
      })
      .forEach(function(it){
        var p=it.p, n=it.n, r=rich[p.name];
        var sector = r ? esc(r.sector[lang]) : "";
        var badge  = p.placement ? '<span class="co-badge">'+ t("comp_placed") +'</span>' : '';
        var top, action;
        if(n>0){
          top    = '<div class="co-roles">'+ t("comp_roles").replace("{n}",n) +'</div>';
          action = '<button class="btn btn--primary" data-go="jobs" data-co-search="'+ esc(p.name) +'">'+ t("comp_view") +'</button>';
        } else {
          top    = '<div class="co-roles muted">'+ t("comp_interested").replace("{co}", esc(p.name)) +'</div>';
          action = '<button class="btn btn--primary" data-inquire="'+ esc(p.name) +'">'+ t("comp_ask") +'</button>';
        }
        var card=el("div","co-card");
        card.innerHTML=
          '<div class="co-head">'+ avatarHTML({logo:(typeof PARTNER_LOGOS!=="undefined"?PARTNER_LOGOS[p.name]:null), color:p.color, mono:p.mono}) +
            '<div><div class="co-name">'+ esc(p.name) +'</div>'+
            (sector?'<div class="co-sector">'+ sector +'</div>':'')+'</div>'+
          '</div>'+
          badge + top +
          '<div class="co-actions">'+ action +'</div>';
        grid.appendChild(card);
      });
  }
