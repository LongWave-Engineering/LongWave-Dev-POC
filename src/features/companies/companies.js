/* features/companies/companies.js — companies page render */
  /* ---------------- companies page ---------------- */
  function renderCompanies(){
    var grid=$("#coGrid"); if(!grid) return;
    grid.innerHTML="";
    if (window.__HRMOS_DATA__ && window.__HRMOS_DATA__.JOBS && window.__HRMOS_DATA__.JOBS.length) {
      var _counts={}; JOBS.forEach(function(j){ _counts[j.co]=(_counts[j.co]||0)+1; });
      Object.keys(_counts).sort(function(a,b){ return _counts[b]-_counts[a]; }).forEach(function(co){
        var c=COMPANIES[co]; if(!c) return;
        var card=el("div","co-card");
        card.innerHTML=
          '<div class="co-head">'+ avatarHTML(c) +
          '<div><div class="co-name">'+ esc(c.name) +'</div><div class="co-sector">'+ esc((c.sector&&c.sector[lang])||"") +'</div></div></div>'+
          '<div class="co-roles">'+ t("comp_roles").replace("{n}",_counts[co]) +'</div>'+
          '<div class="co-actions"><button class="btn btn--primary" data-go="jobs">'+ t("comp_view") +'</button>'+
          (c.site?'<a class="btn btn--ghost" href="'+c.site+'" target="_blank" rel="noopener">'+ t("m_company") +'</a>':'')+'</div>';
        grid.appendChild(card);
      });
      return;
    }
    COMPANY_LIST.forEach(function(co){
      var live = co.roleCo ? JOBS.filter(function(j){return j.co===co.roleCo;}).length : 0;
      if(live>0){
        var feat=el("div","co-card feat");
        feat.innerHTML=
          '<span class="avatar" style="background:'+co.color+';width:64px;height:64px;font-size:1.4rem">'+ esc(co.mono) +'</span>'+
          '<div><div class="co-head"><div><div class="co-name">'+ esc(co.name) +'</div>'+
          '<div class="co-sector">'+ esc(co.sector[lang]) +' · '+ esc(co.loc) +'</div></div></div>'+
          '<p class="co-blurb" style="margin:12px 0">'+ esc(co.blurb[lang]) +'</p>'+
          '<div class="co-meta"><span>'+ t("comp_founded") +' <b>'+ esc(co.founded) +'</b></span><span>'+ t("comp_size") +' <b>'+ esc(co.size) +'</b></span><span class="co-roles">'+ t("comp_roles").replace("{n}",live) +'</span></div></div>'+
          '<div class="co-actions"><button class="btn btn--primary" data-go="jobs">'+ t("comp_view") +'</button>'+
          (co.site?'<a class="btn btn--ghost" href="'+co.site+'" target="_blank" rel="noopener">'+ t("m_company") +'</a>':'')+'</div>';
        grid.appendChild(feat);
      } else {
        var card=el("div","co-card");
        card.innerHTML=
          '<div class="co-head"><span class="avatar" style="background:'+co.color+'">'+ esc(co.mono) +'</span>'+
          '<div><div class="co-name">'+ esc(co.name) +'</div><div class="co-sector">'+ esc(co.sector[lang]) +' · '+ esc(co.loc) +'</div></div></div>'+
          '<div class="co-roles muted">'+ t("comp_partner") +'</div>'+
          '<div class="co-actions"><button class="btn btn--ghost" data-signup>'+ t("comp_get") +'</button></div>';
        grid.appendChild(card);
      }
    });
  }

