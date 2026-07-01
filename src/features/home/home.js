/* features/home/home.js — home hot-roles teaser (3x3 across companies) */
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
      var idx=job._i, c=COMPANIES[job.co];
      var node=el("button","jt",
        (job.hot ? '<span class="badge-hot">🔥 '+ esc(t("hot")) +'</span>' : '')+
        avatarHTML(c,"sm")+
        '<div class="jt-role">'+ softBreak(esc(roleL(job))) +'</div>'+
        '<div class="jt-co">'+ esc(c.name) +'</div>'+
        (blurbL(job) ? '<div class="jt-blurb">'+ esc(blurbL(job)) +'</div>' : '')+
        '<div class="jt-sal">'+ esc(salaryMax(job, t("salary_neg"), t("salary_doe"))) +'</div>');
      node.setAttribute("aria-label", roleL(job)+" at "+c.name);
      node.addEventListener("click", function(){ openJob(idx); });
      grid.appendChild(node);
    });
  }

