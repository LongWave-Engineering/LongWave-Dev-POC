/* features/home/home.js — home hot-roles teaser (3x3 across companies) */
  /* ---------------- hot teaser (title page) ---------------- */
  function renderTeaser(){
    var grid=$("#hotTeaser"); if(!grid) return;
    grid.innerHTML="";
    /* The admin's Hot 3×3 picks lead (in curated order — the proxy fronts them on
       the wire); the diverse per-company spread fills whatever curation doesn't.
       Selection logic is pure and lives in shared/logic.js (guardrail-tested). */
    var list=LW.teaserPick(JOBS, 9);
    list.forEach(function(job){
      var idx=job._i, c=COMPANIES[job.co];
      var node=el("button","jt",
        (job.hot ? '<span class="badge-hot">🔥 '+ esc(t("hot")) +'</span>' : '')+
        avatarHTML(c,"sm")+
        '<div class="jt-role">'+ softBreak(esc(roleL(job))) +'</div>'+
        '<div class="jt-co">'+ esc(c.name) +'</div>'+
        (blurbL(job) ? '<div class="jt-blurb">'+ esc(blurbL(job)) +'</div>' : '')+
        '<div class="jt-sal">'+ esc(salaryMax(job, t("salary_neg"), t("salary_doe"))) +'</div>');
      node.setAttribute("aria-label", t("aria_open_role").replace("{role}", roleL(job)).replace("{co}", c.name));
      node.addEventListener("click", function(){ openJob(idx); });
      grid.appendChild(node);
    });
  }

