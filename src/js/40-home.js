/* [build] 40-home.js  (home teaser, companies page, articles, reviews) - concatenated in load order by build.ps1; all parts share one IIFE scope */
  /* ---------------- hot teaser (title page) ---------------- */
  function renderTeaser(){
    var grid=$("#hotTeaser"); if(!grid) return;
    grid.innerHTML="";
    /* a diverse 3×3: roles spread across different companies (hot first within each) */
    var byCo={}; JOBS.forEach(function(j){ (byCo[j.co]=byCo[j.co]||[]).push(j); });
    Object.keys(byCo).forEach(function(k){ byCo[k].sort(function(a,b){ return (b.hot?1:0)-(a.hot?1:0); }); });
    var _cos=Object.keys(byCo), list=[], _round=0;
    while(list.length<9){
      var _added=false;
      for(var _ci=0; _ci<_cos.length && list.length<9; _ci++){ var _arr=byCo[_cos[_ci]]; if(_arr[_round]){ list.push(_arr[_round]); _added=true; } }
      if(!_added) break; _round++;
    }
    list.forEach(function(job){
      var idx=JOBS.indexOf(job), c=COMPANIES[job.co];
      var node=el("button","jt",
        (job.hot ? '<span class="badge-hot">🔥 '+ esc(t("hot")) +'</span>' : '')+
        avatarHTML(c,"sm")+
        '<div class="jt-role">'+ esc(roleL(job)) +'</div>'+
        '<div class="jt-co">'+ esc(c.name) +'</div>'+
        (blurbL(job) ? '<div class="jt-blurb">'+ esc(blurbL(job)) +'</div>' : '')+
        '<div class="jt-sal">'+ esc(salaryMax(job)) +'</div>');
      node.setAttribute("aria-label", roleL(job)+" at "+c.name);
      node.addEventListener("click", function(){ openJob(idx); });
      grid.appendChild(node);
    });
  }

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

  /* ---------------- articles page ---------------- */
  function renderArticles(){
    var grid=$("#artGrid"); if(!grid) return;
    grid.innerHTML="";
    ARTICLES.forEach(function(a){
      var node=el("a","art");
      node.href="#/articles";
      node.innerHTML='<span class="cat">'+ esc(a.cat[lang]) +'</span><h4>'+ esc(a.title[lang]) +'</h4><span class="read">'+ t("art_read") +'</span>';
      grid.appendChild(node);
    });
  }

  /* ---------------- reviews ---------------- */
  function renderReviews(){
    var grid=$("#revGrid"); if(!grid) return;
    grid.innerHTML="";
    REVIEWS.forEach(function(r){
      grid.appendChild(el("article","rev",
        '<p class="quote">“'+ esc(r.q[lang]||r.q.en) +'”</p>'+
        '<div class="who"><span class="avatar sm" style="background:'+r.color+'">'+ esc(r.init) +'</span>'+
        '<div><div class="nm">'+ esc(r.name) +'</div><div class="rl">'+ esc(r.role[lang]||r.role.en) +'</div></div></div>'));
    });
  }



