/* features/jobs/jobs.js — job cards, render, filter selects (pure filtering lives in core/logic.js) */
  /* ---------------- jobs (full grid) ---------------- */
  var jobGrid=$("#jobGrid"), resultCount=$("#resultCount");
  var showAllJobs=false;
  function cardHTML(job){
    var c=COMPANIES[job.co];
    var tags = jpTag(job.jp) + '<span class="tag tag--meta">'+ esc(remoteLabel(job.remote)) +'</span>';
    if(job.abroad) tags += '<span class="tag tag--meta">'+ esc(t("lbl_abroad")) +'</span>';
    if(job.visa) tags += '<span class="tag tag--meta">'+ esc(t("lbl_visa")) +'</span>';
    (job.stack||[]).slice(0,3).forEach(function(s){ tags += '<span class="tag tag--tech">'+ esc(s) +'</span>'; });
    return (job.hot ? '<span class="badge-hot">🔥 '+ esc(t("hot")) +'</span>' : '')+
      '<div class="jc-top">'+ avatarHTML(c) +
      '<div style="min-width:0"><div class="jc-role">'+ esc(roleL(job)) +'</div><div class="jc-co">'+ esc(c.name) +'</div></div></div>'+
      '<div class="jc-salary">'+ esc(salaryMax(job, t("salary_neg"))) +'</div>'+
      '<div class="tags">'+ tags +'</div>'+
      '<div class="jc-foot"><span class="jc-loc">'+ esc(locL(job)) +'</span><span class="jc-link">'+ esc(t("viewrole")) +'</span></div>';
  }
  function getFilters(){ return { q:($("#filterSearch").value||"").trim().toLowerCase(), jp:$("#filterJp").value, remote:$("#filterRemote").value, spec:$("#filterSpec").value, loc:($("#filterLoc")?$("#filterLoc").value:""), stack:($("#filterStack")?$("#filterStack").value:"") }; }
  function renderJobs(){
    var f=getFilters();
    /* Carsensor-style: don't dump every role. Wait until the user picks a
       filter (or explicitly asks to browse all) before showing results. */
    if(!LW.hasActiveFilter(f) && !showAllJobs){
      jobGrid.innerHTML="";
      var prompt=el("div","jobs-prompt",
        '<div class="jp-ic">🔍</div>'+
        '<h3>'+ esc(t("prompt_title")) +'</h3>'+
        '<p>'+ esc(t("prompt_sub").replace("{total}",JOBS.length)) +'</p>'+
        '<button class="btn btn--ghost" id="showAllJobs" type="button">'+ esc(t("prompt_all").replace("{total}",JOBS.length)) +'</button>');
      jobGrid.appendChild(prompt);
      var sa=$("#showAllJobs"); if(sa) sa.addEventListener("click", function(){ showAllJobs=true; renderJobs(); });
      resultCount.textContent = t("result_pick");
      return;
    }
    var shown=LW.filterJobs(JOBS, f);
    jobGrid.innerHTML="";
    if(shown.length===0){
      jobGrid.appendChild(el("div","",'<p style="color:var(--slate);grid-column:1/-1;padding:30px 0;font-size:1.1rem;">'+(lang==="ja"?"条件に合う求人が見つかりません。フィルターを調整してください。":"No roles match these filters yet. Try widening your search.")+'</p>'));
    } else {
      shown.forEach(function(job){
        var idx=job._i;
        var card=el("button","job-card",cardHTML(job));
        card.setAttribute("aria-label", roleL(job)+" at "+COMPANIES[job.co].name);
        card.addEventListener("click", function(){ openJob(idx); });
        jobGrid.appendChild(card);
      });
    }
    resultCount.textContent = t("result").replace("{n}",shown.length).replace("{total}",JOBS.length);
  }
  /* shared select builder: keeps the current value, shows "(count)" per option */
  function fillSelect(sel, allLabel, items){
    if(!sel) return; var cur=sel.value;
    sel.innerHTML='<option value="">'+ allLabel +'</option>';
    items.forEach(function(it){ var o=document.createElement("option"); o.value=it.v; o.textContent=it.t; sel.appendChild(o); });
    sel.value=cur||"";
  }
  function buildSpecSelect(){
    var n={}; JOBS.forEach(function(j){ if(j.spec) n[j.spec]=(n[j.spec]||0)+1; });
    fillSelect($("#filterSpec"), t("filter_spec_all"), SPECS.filter(function(s){return n[s];}).map(function(s){return {v:s,t:s+" ("+n[s]+")"};}));
  }
  function buildStackSelect(){
    var n={}; JOBS.forEach(function(j){ (j.stack||[]).forEach(function(s){ n[s]=(n[s]||0)+1; }); });
    fillSelect($("#filterStack"), t("filter_stack_all"), Object.keys(n).sort(function(a,b){return n[b]-n[a];}).map(function(s){return {v:s,t:s+" ("+n[s]+")"};}));
  }
  function buildLocSelect(){
    var n={}; JOBS.forEach(function(j){ var p=j.loc; if(p) n[p]=(n[p]||0)+1; });
    fillSelect($("#filterLoc"), t("filter_loc_all"), Object.keys(n).sort(function(a,b){return n[b]-n[a];}).map(function(p){return {v:p,t:p+" ("+n[p]+")"};}));
  }



