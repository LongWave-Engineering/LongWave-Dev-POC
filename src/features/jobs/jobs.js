/* features/jobs/jobs.js — job cards, render, filter selects (pure filtering lives in core/logic.js) */
  /* ---------------- jobs (full grid) ---------------- */
  var jobGrid=$("#jobGrid"), resultCount=$("#resultCount");
  var showAllJobs=false;

  /* ---- multi-select (apply to one or many) ---- keyed by the stable original
     index (_i) so it survives re-filtering and language toggles. ---- */
  var selected={};
  function isSelected(job){ return !!selected[job._i]; }
  function setSelected(job,on){ if(on) selected[job._i]=true; else delete selected[job._i]; updateSelBar(); }
  function selectionCount(){ var n=0; for(var k in selected) if(selected.hasOwnProperty(k)) n++; return n; }
  function selectedDbIds(){ return LW.normalizeJobIds(JOBS.filter(function(j){return selected[j._i];}).map(function(j){return j.id;})); }
  function clearSelection(){ selected={}; renderJobs(); }
  function updateSelBar(){
    var bar=$("#selectBar"); if(!bar) return;
    var n=selectionCount();
    bar.hidden = n===0;
    if(n){ $("#selCount").textContent=t("sel_selected").replace("{n}",n); $("#selApply").textContent=t("sel_apply")+" ("+n+")"; }
  }
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
      jobGrid.appendChild(el("div","jobs-empty",'<p style="color:var(--slate);padding:30px 0;font-size:1.1rem;">'+(lang==="ja"?"条件に合う求人が見つかりません。フィルターを調整してください。":"No roles match these filters yet. Try widening your search.")+'</p>'));
    } else {
      shown.forEach(function(job,i){
        var idx=job._i;
        /* card = wrapper (visual + selected ring) containing a selection checkbox
           and a clickable open-button. Two separate controls so a checkbox click
           selects without opening the modal, and vice-versa (no nested buttons). */
        var card=el("div","job-card jc-reveal"+(isSelected(job)?" sel":""));
        card.style.animationDelay=(Math.min(i,12)*0.045)+"s";
        var sel=el("label","jc-select");
        var cb=document.createElement("input"); cb.type="checkbox"; cb.checked=isSelected(job);
        cb.setAttribute("aria-label", t("sel_pick")+": "+roleL(job));
        cb.addEventListener("change", function(){ setSelected(job, cb.checked); card.classList.toggle("sel", cb.checked); });
        sel.appendChild(cb);
        var open=el("button","jc-open",cardHTML(job));
        open.setAttribute("aria-label", roleL(job)+" at "+COMPANIES[job.co].name);
        open.addEventListener("click", function(){ openJob(idx); });
        card.appendChild(sel); card.appendChild(open);
        jobGrid.appendChild(card);
      });
    }
    updateSelBar();
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

  /* selection-bar actions: Clear, and batch "Apply to selected" (opens signup in
     apply mode with the selected job ids). openSignup lives in modals.js (same IIFE). */
  (function(){
    var clr=$("#selClear"); if(clr) clr.addEventListener("click", clearSelection);
    var ap=$("#selApply"); if(ap) ap.addEventListener("click", function(){ openSignup("job", selectedDbIds()); });
  })();



