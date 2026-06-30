/* features/jobs/jobs.js — job cards, render, filter selects (pure filtering lives in core/logic.js) */
  /* ---------------- jobs (full grid) ---------------- */
  var jobGrid=$("#jobGrid"), resultCount=$("#resultCount");
  var showAllJobs=false;

  /* ---- multi-select (apply to one or many) ---- keyed by the stable original
     index (_i) so it survives re-filtering and language toggles. ---- */
  var selected={};
  var MAX_APPLY=10;   /* cap how many roles can be applied to in one go */
  function isSelected(job){ return !!selected[job._i]; }
  function setSelected(job,on){ if(on) selected[job._i]=true; else delete selected[job._i]; updateSelBar(); }
  function flashSelMax(){ var c=$("#selCount"); if(!c) return; c.classList.remove("sb-flash"); void c.offsetWidth; c.classList.add("sb-flash"); }
  function selectionCount(){ var n=0; for(var k in selected) if(selected.hasOwnProperty(k)) n++; return n; }
  function selectedDbIds(){ return LW.normalizeJobIds(JOBS.filter(function(j){return selected[j._i];}).map(function(j){return j.id;})); }
  function clearSelection(){ selected={}; renderJobs(); }

  /* ---- save / bookmark roles ---- persisted in localStorage so a visitor (signed
     up or not) can come back to roles later. Keyed by the stable DB id when present,
     else company+role, so it survives re-filtering, language toggles and live hydration. */
  var SAVED_KEY="lw_saved_jobs";
  function jobKey(job){ return (job.id!=null) ? ("id:"+job.id) : ("co:"+job.co+"|"+job.role); }
  function loadSaved(){ try{ var v=JSON.parse(localStorage.getItem(SAVED_KEY)||"[]"); return Array.isArray(v)?v:[]; }catch(e){ return []; } }
  var savedKeys=loadSaved();
  var savedOnly=false;   /* when true the grid shows only saved roles */
  function persistSaved(){ try{ localStorage.setItem(SAVED_KEY, JSON.stringify(savedKeys)); }catch(e){} }
  function isSaved(job){ return savedKeys.indexOf(jobKey(job))>-1; }
  function toggleSaved(job){
    var k=jobKey(job), i=savedKeys.indexOf(k);
    if(i>-1) savedKeys.splice(i,1); else savedKeys.push(k);
    persistSaved();
    if(savedOnly) renderJobs(); else refreshSaveUI();
  }
  /* repaint every save control from the current set (cards + the JD-modal button) */
  function refreshSaveUI(){
    document.querySelectorAll(".jc-save").forEach(function(b){
      var on = savedKeys.indexOf(b.getAttribute("data-jobkey"))>-1;
      b.classList.toggle("is-saved", on);
      b.setAttribute("aria-pressed", on?"true":"false");
      b.setAttribute("title", on ? t("sv_saved") : t("sv_save"));
    });
    updateSavedToggle();
    if(typeof paintModalSave==="function") paintModalSave();
  }
  function updateSavedToggle(){
    var btn=$("#savedToggle"), lab=$("#savedToggleLabel"); if(!btn) return;
    btn.classList.toggle("active", savedOnly);
    btn.setAttribute("aria-pressed", savedOnly?"true":"false");
    if(lab) lab.textContent = savedOnly ? t("sv_view_all") : t("sv_view").replace("{n}", savedKeys.length);
  }
  function updateSelBar(){
    var bar=$("#selectBar"); if(!bar) return;
    var n=selectionCount();
    bar.hidden = n===0;
    if(n){ $("#selCount").textContent=t("sel_selected").replace("{n}",n)+(n>=MAX_APPLY?" · "+t("sel_max").replace("{n}",MAX_APPLY):""); $("#selApply").textContent=t("sel_apply")+" ("+n+")"; }
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
  /* card = wrapper (visual + selected ring) holding a corner with two separate controls
     (a save heart and a selection checkbox) plus a clickable open-button. Keeping the
     controls as siblings of the open-button avoids nested buttons, so a heart/checkbox
     click never also opens the modal (and vice-versa). */
  function buildCard(job,i){
    var idx=job._i;
    var card=el("div","job-card jc-reveal"+(isSelected(job)?" sel":""));
    card.style.animationDelay=(Math.min(i,12)*0.045)+"s";
    var corner=el("div","jc-corner");
    var save=el("button","jc-save"+(isSaved(job)?" is-saved":""));
    save.type="button";
    save.setAttribute("data-jobkey", jobKey(job));
    save.setAttribute("aria-pressed", isSaved(job)?"true":"false");
    save.setAttribute("aria-label", t("sv_aria"));
    save.setAttribute("title", isSaved(job)?t("sv_saved"):t("sv_save"));
    save.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 5.42 3.42 4 5.5 4c1.74 0 3.41 1.01 4.5 2.61C11.09 5.01 12.76 4 14.5 4 16.58 4 18 5.42 18 7.5c0 3.78-3.4 6.86-8.55 11.54L12 20.3z"/></svg>';
    save.addEventListener("click", function(e){ e.stopPropagation(); toggleSaved(job); });
    var sel=el("label","jc-select");
    var cb=document.createElement("input"); cb.type="checkbox"; cb.checked=isSelected(job);
    cb.setAttribute("aria-label", t("sel_pick")+": "+roleL(job));
    cb.addEventListener("change", function(){
      if(cb.checked && selectionCount()>=MAX_APPLY){ cb.checked=false; updateSelBar(); flashSelMax(); return; }
      setSelected(job, cb.checked); card.classList.toggle("sel", cb.checked);
    });
    sel.appendChild(cb);
    corner.appendChild(save); corner.appendChild(sel);
    var open=el("button","jc-open",cardHTML(job));
    open.setAttribute("aria-label", roleL(job)+" at "+COMPANIES[job.co].name);
    open.addEventListener("click", function(){ openJob(idx); });
    card.appendChild(corner); card.appendChild(open);
    jobGrid.appendChild(card);
  }
  function renderJobs(){
    var f=getFilters();
    /* Saved view: show only bookmarked roles (still honouring any active filters),
       skipping the pick-a-filter gate. */
    if(savedOnly){
      var savedList=LW.filterJobs(JOBS.filter(isSaved), f);
      jobGrid.innerHTML="";
      if(savedList.length===0){
        jobGrid.appendChild(el("div","jobs-empty",'<p style="color:var(--slate);padding:30px 0;font-size:1.1rem;">'+ esc(t("sv_none")) +'</p>'));
      } else {
        savedList.forEach(buildCard);
      }
      updateSelBar(); updateSavedToggle();
      resultCount.textContent = t("sv_heading") + " · " + t("result").replace("{n}",savedList.length).replace("{total}",JOBS.length);
      return;
    }
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
      updateSavedToggle();
      return;
    }
    var shown=LW.filterJobs(JOBS, f);
    jobGrid.innerHTML="";
    if(shown.length===0){
      jobGrid.appendChild(el("div","jobs-empty",'<p style="color:var(--slate);padding:30px 0;font-size:1.1rem;">'+(lang==="ja"?"条件に合う求人が見つかりません。フィルターを調整してください。":"No roles match these filters yet. Try widening your search.")+'</p>'));
    } else {
      shown.forEach(buildCard);
    }
    updateSelBar(); updateSavedToggle();
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
    var st=$("#savedToggle"); if(st) st.addEventListener("click", function(){ savedOnly=!savedOnly; if(savedOnly) showAllJobs=false; renderJobs(); });
  })();



