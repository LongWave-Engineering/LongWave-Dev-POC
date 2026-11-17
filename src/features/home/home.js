/* features/home/home.js — redesign v3: opportunities cards + hero quick-filter.
   Reuses the shared helpers (LW.teaserPick, avatarHTML, roleL, salaryMax, openJob). */
  function renderTeaser(){
    var grid=$("#hotTeaser"); if(grid){
      grid.innerHTML="";
      var list=LW.teaserPick(JOBS, 6);
      list.forEach(function(job){
        var idx=job._i, c=COMPANIES[job.co];
        var v=(job.jp||"").toString().toLowerCase();
        var none=(!v || v==="none");
        var jpTxt=none ? t("jp_none")
          : (/^n[1-5]$/.test(v) ? v.toUpperCase()
          : (job.jp.charAt(0).toUpperCase()+job.jp.slice(1)));
        var node=el("button","h-job",
          '<div class="h-job-top">'+ avatarHTML(c,"sm") +
            '<div class="h-co"><b>'+ esc(c.name) +'</b>'+ (job.loc?'<small>'+ esc(job.loc) +'</small>':'') +'</div></div>'+
          '<div class="h-role">'+ softBreak(esc(roleL(job))) +'</div>'+
          '<span class="h-jp'+(none?" none":"")+'">'+ esc(jpTxt) +'</span>'+
          '<div class="h-sal">'+ esc(salaryMax(job, t("salary_neg"), t("salary_doe"))) +'</div>'+
          '<div class="h-src">'+ esc(t("supported_lw")) +'</div>');
        node.setAttribute("aria-label", t("aria_open_role").replace("{role}", roleL(job)).replace("{co}", c.name));
        node.addEventListener("click", function(){ openJob(idx); });
        grid.appendChild(node);
      });
    }
    /* hero quick-filter → jobs page (the full multi-select filter lives there). */
    var hs=$("#homeSearch");
    if(hs && !hs._wired){
      hs._wired=1;
      hs.addEventListener("submit", function(e){ e.preventDefault(); location.hash="#/jobs"; });
    }
  }
