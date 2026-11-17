/* features/jobs/jobs.js — job cards, render, filter selects (pure filtering lives in shared/logic.js) */
  /* ---------------- jobs (full grid) ---------------- */
  var jobGrid=$("#jobGrid"), resultCount=$("#resultCount");
  var showAllJobs=false;
  /* the role whose full JD is rendered INLINE in the right pane (#selected-detail). Holds a
     JOBS object reference so it survives re-filtering AND language toggles (renderJobs
     re-renders the pane from it, so EN⇄JA switches headings and body together). */
  var selectedJob=null;
  /* progressive rendering: paint the grid in batches so a 700+ role result never stalls
     the main thread. jobShown = current filtered list; jobRendered = rows painted so far;
     a "Show more" button appends the next JOB_BATCH on demand. */
  var JOB_BATCH=60, jobShown=[], jobRendered=0;

  /* ---- multi-select (apply to one or many) ---- keyed by the stable original
     index (_i) so it survives re-filtering and language toggles. ---- */
  var selected={};
  var MAX_APPLY=LW.MAX_APPLICATIONS;   /* the hard, lifetime cap (shared with the backend) */
  function isSelected(job){ return !!selected[job._i]; }
  function setSelected(job,on){ if(on) selected[job._i]=true; else delete selected[job._i]; updateSelBar(); }
  function flashSelMax(){ var c=$("#selCount"); if(!c) return; c.classList.remove("sb-flash"); void c.offsetWidth; c.classList.add("sb-flash"); }
  function selectionCount(){ var n=0; for(var k in selected) if(selected.hasOwnProperty(k)) n++; return n; }
  function selectedJobs(){ return JOBS.filter(function(j){ return selected[j._i]; }); }
  function clearSelection(){ selected={}; renderJobs(); }

  /* ---- save / bookmark roles ---- persisted in localStorage so a visitor (signed
     up or not) can come back to roles later. Keyed by the stable DB id when present,
     else company+role, so it survives re-filtering, language toggles and live hydration. */
  var SAVED_KEY="lw_saved_jobs";
  /* stable per-row key for saved/applied state. Use the DB id when present; otherwise the
     unique per-job index _i (set in enrichJobs) — NOT co+role, which collides for the
     baked snapshot's duplicate postings (offline mode), making one save/apply hit every
     duplicate and letting several real applications share a single cap slot. */
  function jobKey(job){ return (job.id!=null) ? ("id:"+job.id) : ("i:"+job._i); }
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

  /* ---- applied roles: the hard 10-per-person cap ---- persisted so it holds across
     visits (not just one session), keyed by the same jobKey() as saved roles. The backend
     enforces the true per-email limit; this mirrors it so the picker stops you at 10 and
     shows what's left. "10 applications, one and done" — you can't reset it by re-selecting. */
  var APPLIED_KEY="lw_applied_jobs";
  function loadApplied(){ try{ var v=JSON.parse(localStorage.getItem(APPLIED_KEY)||"[]"); return Array.isArray(v)?v:[]; }catch(e){ return []; } }
  var appliedKeys=loadApplied();
  function persistApplied(){ try{ localStorage.setItem(APPLIED_KEY, JSON.stringify(appliedKeys)); }catch(e){} }
  function isApplied(job){ return appliedKeys.indexOf(jobKey(job))>-1; }
  function remainingApplies(){ return Math.max(0, MAX_APPLY - appliedKeys.length); }
  function atApplyLimit(){ return remainingApplies()<=0; }
  /* record applied jobs (objects), dedupe + persist. Never grows past the cap in practice
     because selection is gated on remainingApplies(). */
  function markApplied(jobs){
    (jobs||[]).forEach(function(j){ var k=jobKey(j); if(appliedKeys.indexOf(k)===-1) appliedKeys.push(k); });
    persistApplied();
  }
  /* called from the signup submit (modals/lead-forms.js) with the roles just applied to (objects) →
     mark them against the cap, then reset the picker (clearSelection re-renders the grid so
     applied badges + remaining caps refresh everywhere). Works with or without a DB id. */
  function markAppliedJobs(jobs){
    markApplied(jobs);
    clearSelection();
  }
  /* trust the server's authoritative remaining count: if it says fewer remain than we've
     tracked locally (e.g. applied from another browser), pad so the UI reflects the real cap. */
  function syncAppliesFromServer(remaining){
    if(typeof remaining!=="number" || isNaN(remaining)) return;
    var used=MAX_APPLY-Math.max(0,Math.min(MAX_APPLY,remaining));
    var changed=false;
    while(appliedKeys.length<used){ appliedKeys.push("srv:"+appliedKeys.length); changed=true; }
    if(changed){ persistApplied(); renderJobs(); }
  }
  /* a highlighted bar above the grid once the cap is reached */
  function updateApplyNotice(){
    var box=$("#applyNotice"); if(!box) return;
    if(atApplyLimit()){
      box.hidden=false;
      box.innerHTML='<span class="an-ic" aria-hidden="true">✓</span><span>'+ esc(t("apply_limit_hit").replace("{n}",MAX_APPLY)) +'</span>';
    } else { box.hidden=true; box.innerHTML=""; }
  }
  function updateSelBar(){
    var bar=$("#selectBar"); if(!bar) return;
    var n=selectionCount();
    bar.hidden = n===0;
    if(n){
      var rem=remainingApplies();
      /* show what's left of the lifetime allowance, and flag when this batch fills it */
      $("#selCount").textContent=t("sel_selected").replace("{n}",n)+" · "+t("sel_left").replace("{r}",rem).replace("{n}",MAX_APPLY);
      $("#selApply").textContent=t("sel_apply")+" ("+n+")";
    }
  }
  /* One full-width row per role (not a boxed card): logo · title+company+tags · salary/view.
     The title is never clamped, so the whole role name is always visible. */
  function cardHTML(job){
    var c=COMPANIES[job.co];
    var tags = (job.direct ? '<span class="tag tag--direct">'+ esc(t("jd_direct_badge")) +'</span>' : '') + jpTag(job.jp) + '<span class="tag tag--meta">'+ esc(remoteLabel(job.remote)) +'</span>';
    if(job.abroad) tags += '<span class="tag tag--meta">'+ esc(t("lbl_abroad")) +'</span>';
    if(job.visa) tags += '<span class="tag tag--meta">'+ esc(t("lbl_visa")) +'</span>';
    (job.stack||[]).slice(0,3).forEach(function(s){ tags += '<span class="tag tag--tech">'+ esc(s) +'</span>'; });
    return (job.hot ? '<span class="badge-hot">🔥 '+ esc(t("hot")) +'</span>' : '')+
      '<span class="jc-logo">'+ avatarHTML(c) +'</span>'+
      '<span class="jc-main">'+
        '<span class="jc-role">'+ softBreak(esc(roleL(job))) +'</span>'+
        (roleDetailL(job) ? '<span class="jc-role-detail">'+ esc(roleDetailL(job)) +'</span>' : '')+
        '<span class="jc-co">'+ esc(c.name) +' <span class="jc-dot">·</span> <span class="jc-loc">'+ esc(locL(job)) +'</span></span>'+
        '<span class="tags">'+ tags +'</span>'+
      '</span>'+
      '<span class="jc-end">'+
        '<span class="jc-salary">'+ esc(salaryMax(job, t("salary_neg"), t("salary_doe"))) +'</span>'+
        '<span class="jc-link">'+ esc(t("viewrole")) +'</span>'+
      '</span>';
  }
  function getFilters(){ return { q:($("#filterSearch").value||"").trim().toLowerCase(), jp:mselVals("filterJp"), remote:mselVals("filterRemote"), spec:mselVals("filterSpec"), loc:mselVals("filterLoc"), stack:mselVals("filterStack") }; }
  /* card = wrapper (visual + selected ring) holding a corner with two separate controls
     (a save heart and a selection checkbox) plus a clickable open-button. Keeping the
     controls as siblings of the open-button avoids nested buttons, so a heart/checkbox
     click never also opens the modal (and vice-versa). */
  function buildCard(job,i,animate){
    var idx=job._i;
    var applied=isApplied(job);
    var viewing=(selectedJob===job);
    var card=el("div","job-card"+(animate?" jc-reveal":"")+(isSelected(job)?" sel":"")+(applied?" applied":"")+(viewing?" current":""));
    /* stable key so highlightSelectedRow() can find this row after a re-render */
    card.setAttribute("data-rowkey", jobKey(job));
    if(viewing){ card.setAttribute("aria-current","true"); }
    if(animate) card.style.animationDelay=(Math.min(i,12)*0.045)+"s";
    var corner=el("div","jc-corner");
    var save=el("button","jc-save"+(isSaved(job)?" is-saved":""));
    save.type="button";
    save.setAttribute("data-jobkey", jobKey(job));
    save.setAttribute("aria-pressed", isSaved(job)?"true":"false");
    save.setAttribute("aria-label", t("sv_aria"));
    save.setAttribute("title", isSaved(job)?t("sv_saved"):t("sv_save"));
    save.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 5.42 3.42 4 5.5 4c1.74 0 3.41 1.01 4.5 2.61C11.09 5.01 12.76 4 14.5 4 16.58 4 18 5.42 18 7.5c0 3.78-3.4 6.86-8.55 11.54L12 20.3z"/></svg>';
    save.addEventListener("click", function(e){ e.stopPropagation(); toggleSaved(job); });
    corner.appendChild(save);
    if(applied){
      /* already applied → a static "Applied" badge, no checkbox (can't re-apply / re-count) */
      corner.appendChild(el("span","jc-applied", '✓ '+esc(t("applied_badge"))));
    } else if(job.direct){
      /* direct (non-client) role: you apply on the company's own site, not through us, so
         there is no select-for-apply checkbox and it never counts toward the 10-app cap */
    } else {
      var sel=el("label","jc-select");
      var cb=document.createElement("input"); cb.type="checkbox"; cb.checked=isSelected(job);
      cb.setAttribute("aria-label", t("sel_pick")+": "+roleL(job));
      /* at the lifetime limit, unpicked roles can't be selected at all */
      if(atApplyLimit() && !isSelected(job)){ cb.disabled=true; sel.title=t("apply_limit_hit").replace("{n}",MAX_APPLY); }
      cb.addEventListener("change", function(){
        /* can't select more than what's left of the 10-application allowance */
        if(cb.checked && selectionCount()>=remainingApplies()){ cb.checked=false; updateSelBar(); flashSelMax(); return; }
        setSelected(job, cb.checked); card.classList.toggle("sel", cb.checked);
      });
      sel.appendChild(cb);
      corner.appendChild(sel);
    }
    var open=el("button","jc-open",cardHTML(job));
    open._job=job;   /* arrow-key nav reads the job straight off the focused row */
    open.setAttribute("aria-label", t("aria_open_role").replace("{role}", roleL(job)).replace("{co}", COMPANIES[job.co].name));
    /* NO modal on the jobs page: selecting a row renders its full JD inline in #selected-detail */
    open.addEventListener("click", function(){ selectJob(job, {user:true}); });
    /* content first (fills the row), then the save/select cluster at the right edge — matches
       the CSS design intent and keeps the HOT badge (top-left, over the logo) clear of it */
    card.appendChild(open); card.appendChild(corner);
    jobGrid.appendChild(card);
  }
  /* paint the next batch of jobShown into the grid; re-add the "Show more" button while
     rows remain. Only the first batch of a fresh view animates (animate=true); appended
     batches just appear (no blur-in replay). */
  function appendJobBatch(animate){
    var oldMore=$("#jobsMore"); if(oldMore) oldMore.remove();
    var to=Math.min(jobRendered+JOB_BATCH, jobShown.length);
    for(var i=jobRendered;i<to;i++) buildCard(jobShown[i], i, animate);
    jobRendered=to;
    if(jobRendered<jobShown.length){
      var rem=jobShown.length-jobRendered;
      var b=el("button","btn btn--ghost jobs-more", esc(t("jobs_more").replace("{n}", Math.min(JOB_BATCH,rem))));
      b.id="jobsMore"; b.type="button";
      b.addEventListener("click", function(){ appendJobBatch(false); });
      jobGrid.appendChild(b);
    }
  }
  function renderJobs(animate){
    var f=getFilters();
    var doAnimate=animate===true;   /* only play the card entrance on a fresh view (Saved / toggle), not on every filter keystroke */
    updateApplyNotice();   /* keep the "you've used all 10" banner in sync on every render */
    /* LinkedIn-style board: NO "pick a filter first" gate — results show immediately, dense.
       Saved view shows only bookmarked roles (still honouring any active filters). */
    var shown = savedOnly ? LW.filterJobs(JOBS.filter(isSaved), f) : LW.filterJobs(JOBS, f);
    jobGrid.innerHTML="";
    jobShown=shown; jobRendered=0;
    if(shown.length===0){
      jobGrid.appendChild(el("div","jobs-empty",'<span class="tsd-mascot tsd-mascot--search" role="img" aria-label="Tokyo Samurai Dev"></span><p style="color:var(--slate);padding:4px 0 0;font-size:1.1rem;">'+ esc(t(savedOnly ? "sv_none" : "jobs_empty")) +'</p>'));
    } else {
      appendJobBatch(doAnimate);
    }
    updateSelBar(); updateSavedToggle();
    resultCount.textContent = savedOnly
      ? (t("sv_heading") + " · " + t("result").replace("{n}",shown.length).replace("{total}",JOBS.length))
      : t("result").replace("{n}",shown.length).replace("{total}",JOBS.length);
    /* keep the inline detail pane in sync with the list + the active language */
    syncSelection(shown);
  }
  /* ---------------- inline JD detail (right pane, #selected-detail) ----------------
     The jobs page shows the selected role's full description inline (no modal). syncSelection
     holds the current pick when it's still in the filtered set, else falls to the first row,
     then renders its JD via the SHARED builders in modal-job.js so the modal and this pane
     read and translate identically. */
  function isMobileJobs(){ return window.matchMedia && window.matchMedia("(max-width:760px)").matches; }
  function syncSelection(shown){
    var sp=$("#splitJobs");
    if(!shown || !shown.length){ selectedJob=null; renderDetailEmpty(); if(sp) sp.classList.remove("detail-open"); return; }
    if(!(selectedJob && shown.indexOf(selectedJob)>-1)) selectedJob=shown[0];
    highlightSelectedRow();
    renderSelectedDetail(selectedJob);
    if(typeof hydrateJob==="function") hydrateJob(selectedJob);   /* pull the prose (served mode); no-op offline */
  }
  /* select a role: highlight its row, render its JD inline, and (on a user tap on mobile)
     swap the single column from the list to the detail (mockup .detail-open pattern). */
  function selectJob(job, opts){
    opts=opts||{};
    selectedJob=job;
    highlightSelectedRow();
    renderSelectedDetail(job);
    if(typeof hydrateJob==="function") hydrateJob(job);
    if(opts.user && isMobileJobs()){
      var sp=$("#splitJobs"); if(sp) sp.classList.add("detail-open");
      var dc=document.querySelector("#page-jobs .detail-column"); if(dc) dc.scrollTop=0;
    }
  }
  /* mark the viewed row (aria-current + .current) on whichever rows are currently painted */
  function highlightSelectedRow(){
    var key = selectedJob ? jobKey(selectedJob) : null;
    document.querySelectorAll("#jobGrid .job-card").forEach(function(card){
      var on = !!key && card.getAttribute("data-rowkey")===key;
      card.classList.toggle("current", on);
      if(on) card.setAttribute("aria-current","true"); else card.removeAttribute("aria-current");
    });
  }
  /* repaint the inline pane only if THIS job is the one on screen (hydrateJob settle hook) */
  function repaintSelectedDetailIf(job){ if(selectedJob && selectedJob===job) renderSelectedDetail(job); }
  function renderDetailEmpty(){
    var pane=$("#selected-detail"); if(!pane) return;
    pane.innerHTML='<div class="jdx-empty">'+ esc(t("jd_pick")) +'</div>';
  }
  /* build the whole right pane: identity + salary + tags + Save/Apply + the full JD body.
     Everything is routed through t()/jf()/the shared helpers, so a language toggle re-renders
     it fully (headings AND body) when applyLang() calls renderJobs(). */
  function renderSelectedDetail(job){
    var pane=$("#selected-detail"); if(!pane) return;
    if(!job){ renderDetailEmpty(); return; }
    var c=COMPANIES[job.co]; if(!c){ pane.innerHTML=""; return; }
    /* mirror the modal (modal-job.js): tell jdSec whether prose is still in flight, so the
       always-on sections show "Loading…" during the /api/jobs/:id fetch instead of flashing "Not listed". */
    jdPending = !!job._jdLoading;
    var sec=(c.sector && c.sector[lang]) || "";
    var coLine = esc(c.name)
      + (sec ? ' <span class="jdx-dot">·</span> '+esc(sec) : "")
      + (job.loc ? ' <span class="jdx-dot">·</span> '+esc(locL(job)) : "");
    /* only ever link out to http(s) — never a javascript:/data: URL from admin/live data */
    var site=(c.site && /^https?:\/\//i.test(c.site)) ? c.site : "";
    var applied = (typeof isApplied==="function") && isApplied(job);
    var limit   = (typeof atApplyLimit==="function") && atApplyLimit();
    var applyLabel = applied ? t("m_applied") : (limit ? t("m_apply_limit").replace("{n}",MAX_APPLY) : t("m_apply"));
    var saved = (typeof isSaved==="function") && isSaved(job);
    var rd = roleDetailL(job);
    var saveBtn = '<button type="button" class="btn btn--ghost jdx-save'+(saved?" is-saved":"")+'" data-jdx="save" aria-pressed="'+(saved?"true":"false")+'"><span class="jdx-save-ic" aria-hidden="true">♥</span> <span class="jdx-save-label">'+ esc(saved?t("sv_saved"):t("sv_save")) +'</span></button>';
    /* DIRECT (non-client) roles: we do NOT represent the employer, so the primary action links
       OUT to their own careers page (no sign-up-to-apply-through-us), a Direct badge flags it,
       and a disclaimer states the relationship. Placeable roles keep the sign-up apply flow. */
    var directBadge="", actionsHTML="", noteHTML="";
    if(job.direct){
      var applyUrl=(job.apply && /^https?:\/\//i.test(job.apply)) ? job.apply : site;
      directBadge='<span class="jdx-direct">'+ esc(t("jd_direct_badge")) +'</span>';
      actionsHTML=(applyUrl ? '<a class="btn btn--primary jdx-apply-site" href="'+ esc(applyUrl) +'" target="_blank" rel="noopener">'+ esc(t("jd_apply_site")) +' ↗</a>' : '') + saveBtn;
      noteHTML='<p class="jdx-direct-note">'+ esc(t("jd_direct_note").replace("{co}", c.name)) +'</p>';
    } else {
      actionsHTML='<button type="button" class="btn btn--primary jdx-apply" data-jdx="apply"'+((applied||limit)?" disabled":"")+'>'+ esc(applyLabel) +'</button>' + saveBtn + (site ? '<a class="btn btn--ghost jdx-company" href="'+ esc(site) +'" target="_blank" rel="noopener">'+ esc(t("m_company")) +'</a>' : "");
    }
    pane.innerHTML =
      '<article class="jdx'+(job.direct?" jdx--direct":"")+'">'+
        '<div class="jdx-top">'+
          '<button type="button" class="jdx-back" data-jdx="back">← '+ esc(t("jd_back")) +'</button>'+
          '<div class="jdx-head">'+
            '<span class="jdx-logo">'+ avatarHTML(c) +'</span>'+
            '<div class="jdx-id">'+
              '<h2 class="jdx-role">'+ softBreak(esc(roleL(job))) +'</h2>'+
              (rd ? '<p class="jdx-role-detail">'+ esc(rd) +'</p>' : '')+
              '<p class="jdx-co">'+ coLine + (directBadge?' '+directBadge:"") +'</p>'+
            '</div>'+
          '</div>'+
          '<div class="jdx-salary"><span>'+ esc(t("lbl_salary")) +'</span>'+ esc(salaryMax(job, t("salary_neg"), t("salary_doe"))) +'</div>'+
          '<div class="jdx-tags tags">'+ jobHeadTagsHTML(job) +'</div>'+
          '<div class="jdx-actions">'+ actionsHTML +'</div>'+
          noteHTML+
        '</div>'+
        '<div class="jdx-body">'+ jobDetailSectionsHTML(job) +'</div>'+
      '</article>';
  }
  /* ---------------- multi-select facet widget ----------------
     Each facet is a summary button + an ARIA listbox popover (role=listbox,
     aria-multiselectable). Options are role=option with aria-selected, operated by
     mouse OR keyboard: roving arrow-key focus inside the open list, Space/Enter to
     toggle, Escape to close and return focus to the trigger. Several picks in one facet
     are OR'd (see LW.matchesFilter); facets AND together. State lives in MSEL[id].sel
     (an object used as a set); getFilters() reads it; it survives applyLang() rebuilds. */
  var MSEL = {};
  function mselVals(id){ var m=MSEL[id]; return m ? Object.keys(m.sel) : []; }
  function mselSummary(m){
    var ks=Object.keys(m.sel);
    if(!ks.length) return m.allLabel;
    var label=function(v){ var it=m.items.filter(function(i){return i.v===v;})[0]; return it?it.label:v; };
    return ks.length===1 ? label(ks[0]) : label(ks[0])+" +"+(ks.length-1);
  }
  function mselSync(m){
    if(m.labelEl) m.labelEl.textContent=mselSummary(m);
    if(m.btn) m.btn.classList.toggle("has-sel", Object.keys(m.sel).length>0);
  }
  function mselSetOpt(m, opt, on){
    if(on) m.sel[opt._v]=1; else delete m.sel[opt._v];
    opt.setAttribute("aria-selected", on?"true":"false");
    opt.classList.toggle("is-sel", on);
  }
  function mselToggleOpt(m, opt){
    mselSetOpt(m, opt, opt.getAttribute("aria-selected")!=="true");
    mselSync(m); renderJobs();
  }
  /* roving focus: move DOM focus between options so a keyboard/SR user can walk the list */
  function mselFocusOpt(m, i){
    if(!m.opts.length) return;
    i=Math.max(0, Math.min(m.opts.length-1, i));
    m.active=i; m.opts[i].focus();
  }
  function mselOpen(m){
    if(!m.pop.hidden) return;
    closeAllMsel();
    m.pop.hidden=false; m.btn.setAttribute("aria-expanded","true");
    /* open focused on the first selected option, else the first option */
    var start=0; for(var i=0;i<m.opts.length;i++){ if(m.opts[i].getAttribute("aria-selected")==="true"){ start=i; break; } }
    mselFocusOpt(m, start);
  }
  function mselClose(m, focusBtn){
    if(m.pop.hidden){ if(focusBtn && m.btn) m.btn.focus(); return; }
    m.pop.hidden=true; m.btn.setAttribute("aria-expanded","false"); m.active=-1;
    if(focusBtn && m.btn) m.btn.focus();
  }
  function mselKeydown(m, e){
    switch(e.key){
      case "Escape": e.preventDefault(); mselClose(m, true); break;
      case "ArrowDown": e.preventDefault(); mselFocusOpt(m, (m.active<0?0:m.active+1)); break;
      case "ArrowUp": e.preventDefault(); mselFocusOpt(m, (m.active<0?0:m.active-1)); break;
      case "Home": e.preventDefault(); mselFocusOpt(m, 0); break;
      case "End": e.preventDefault(); mselFocusOpt(m, m.opts.length-1); break;
      case " ": case "Spacebar": case "Enter":
        e.preventDefault(); if(m.active>=0) mselToggleOpt(m, m.opts[m.active]); break;
      case "Tab": mselClose(m, false); break;  /* let Tab move on, but close the list */
    }
  }
  function closeAllMsel(){ Object.keys(MSEL).forEach(function(id){ var m=MSEL[id]; if(m && m.pop && !m.pop.hidden){ m.pop.hidden=true; m.active=-1; if(m.btn) m.btn.setAttribute("aria-expanded","false"); } }); }
  function resetMultiSelects(){ Object.keys(MSEL).forEach(function(id){ var m=MSEL[id]; m.sel={}; m.opts.forEach(function(o){ o.setAttribute("aria-selected","false"); o.classList.remove("is-sel"); }); mselSync(m); }); }
  function makeMultiSelect(id, allLabel, items){
    var host=$("#"+id); if(!host) return;
    /* preserve any still-valid selections across a rebuild (language switch / hydration) */
    var prev=MSEL[id]?MSEL[id].sel:{}, valid={}; items.forEach(function(it){ valid[it.v]=1; });
    var sel={}; Object.keys(prev).forEach(function(k){ if(valid[k]) sel[k]=1; });
    var m={ host:host, allLabel:allLabel, items:items, sel:sel, opts:[], active:-1 }; MSEL[id]=m;
    host.innerHTML="";
    var popId=id+"-pop";
    var btn=el("button","msel-btn"); btn.type="button";
    btn.setAttribute("aria-haspopup","listbox"); btn.setAttribute("aria-expanded","false");
    btn.setAttribute("aria-controls",popId); btn.setAttribute("aria-labelledby","lbl-"+id);
    btn.innerHTML='<span class="msel-label"></span><svg class="msel-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    m.btn=btn; m.labelEl=btn.querySelector(".msel-label");
    var pop=el("div","msel-pop"); pop.id=popId; pop.setAttribute("role","listbox"); pop.setAttribute("aria-multiselectable","true"); pop.setAttribute("aria-labelledby","lbl-"+id); pop.hidden=true;
    m.pop=pop;
    items.forEach(function(it, idx){
      var opt=el("div","msel-opt"+(sel[it.v]?" is-sel":""));
      opt.id=popId+"-opt-"+idx; opt.setAttribute("role","option"); opt.tabIndex=-1;
      opt.setAttribute("aria-selected", sel[it.v]?"true":"false");
      opt._v=it.v;
      opt.innerHTML='<span class="msel-check" aria-hidden="true"></span><span class="msel-opt-label"></span>';
      opt.querySelector(".msel-opt-label").textContent=it.label;
      opt.addEventListener("click", function(e){ e.stopPropagation(); m.active=idx; mselToggleOpt(m, opt); opt.focus(); });
      pop.appendChild(opt); m.opts.push(opt);
    });
    pop.addEventListener("keydown", function(e){ mselKeydown(m, e); });
    btn.addEventListener("click", function(e){ e.stopPropagation(); if(pop.hidden) mselOpen(m); else mselClose(m, false); });
    btn.addEventListener("keydown", function(e){
      if(pop.hidden){ if(e.key==="ArrowDown"||e.key==="Enter"||e.key===" "||e.key==="Spacebar"){ e.preventDefault(); mselOpen(m); } }
      else if(e.key==="Escape"){ e.preventDefault(); mselClose(m, true); }
    });
    host.appendChild(btn); host.appendChild(pop);
    mselSync(m);
  }
  /* one document-level handler closes any open popover on an outside click */
  if(!window.__mselOutside){ window.__mselOutside=1; document.addEventListener("click", function(e){ if(!(e.target.closest && e.target.closest(".msel"))) closeAllMsel(); }); }

  function buildSpecSelect(){
    var n={}; JOBS.forEach(function(j){ if(j.spec) n[j.spec]=(n[j.spec]||0)+1; });
    makeMultiSelect("filterSpec", t("filter_spec_all"), SPECS.filter(function(s){return n[s];}).map(function(s){return {v:s,label:s+" ("+n[s]+")"};}));
  }
  function buildStackSelect(){
    /* tech-stack facet = REAL technologies only; drop the discipline/role labels that ride
       in on job.stack (DevOps, Engineering Manager, GitHub, …) so it is not buzzword soup. */
    var n={}; JOBS.forEach(function(j){ (j.stack||[]).forEach(function(s){ if(LW.NON_TECH.indexOf(s)===-1) n[s]=(n[s]||0)+1; }); });
    makeMultiSelect("filterStack", t("filter_stack_all"), Object.keys(n).sort(function(a,b){return n[b]-n[a];}).map(function(s){return {v:s,label:s+" ("+n[s]+")"};}));
  }
  function buildLocSelect(){
    var n={}; JOBS.forEach(function(j){ var p=j.loc; if(p) n[p]=(n[p]||0)+1; });
    makeMultiSelect("filterLoc", t("filter_loc_all"), Object.keys(n).sort(function(a,b){return n[b]-n[a];}).map(function(p){return {v:p,label:p+" ("+n[p]+")"};}));
  }
  function buildJpSelect(){
    makeMultiSelect("filterJp", t("filter_jp_all"), [
      {v:"none",label:t("filter_jp_none")},{v:"conversational",label:t("filter_jp_conv")},{v:"business",label:t("filter_jp_biz")}
    ]);
  }
  function buildRemoteSelect(){
    makeMultiSelect("filterRemote", t("filter_rem_all"), [
      {v:"full",label:t("filter_rem_full")},{v:"partial",label:t("filter_rem_part")},{v:"no",label:t("filter_rem_no")}
    ]);
  }

  /* selection-bar actions: Clear, and batch "Apply to selected" (opens signup in
     apply mode with the selected job ids). openSignup lives in modals/lead-forms.js
     (same IIFE). */
  (function(){
    var clr=$("#selClear"); if(clr) clr.addEventListener("click", clearSelection);
    var ap=$("#selApply"); if(ap) ap.addEventListener("click", function(){ openSignup("job", selectedJobs()); });
    var st=$("#savedToggle"); if(st) st.addEventListener("click", function(){ savedOnly=!savedOnly; if(savedOnly) showAllJobs=false; renderJobs(true); });
  })();

  /* keyboard: ↑/↓ walk the role list and live-render each role inline (LinkedIn feel).
     Enter/Space on a focused row fires its native click → selectJob, so no key handling here. */
  if(jobGrid){
    jobGrid.addEventListener("keydown", function(e){
      if(e.key!=="ArrowDown" && e.key!=="ArrowUp") return;
      var opens=[].slice.call(jobGrid.querySelectorAll(".jc-open"));
      if(!opens.length) return;
      var cur=(document.activeElement && document.activeElement.closest) ? document.activeElement.closest(".jc-open") : null;
      var i=opens.indexOf(cur);
      e.preventDefault();
      var ni = i<0 ? 0 : (e.key==="ArrowDown" ? Math.min(opens.length-1, i+1) : Math.max(0, i-1));
      var target=opens[ni]; if(!target) return;
      target.focus();
      if(target._job) selectJob(target._job, {});   /* desktop keyboard: render inline, no mobile swap */
    });
  }

  /* inline detail actions — Save / Apply / Back — wired to the SAME store + cap logic as the
     modal (toggleSaved, openSignup, atApplyLimit). Delegated so it survives every re-render. */
  (function(){
    var pane=$("#selected-detail"); if(!pane) return;
    pane.addEventListener("click", function(e){
      var b=e.target.closest("[data-jdx]"); if(!b) return;
      var act=b.getAttribute("data-jdx");
      if(act==="save"){ if(selectedJob){ var j=selectedJob; toggleSaved(j); if(!savedOnly) renderSelectedDetail(j); } }
      else if(act==="apply"){ if(b.disabled) return; if(selectedJob) openSignup("job", [selectedJob]); }
      else if(act==="back"){ var sp=$("#splitJobs"); if(sp) sp.classList.remove("detail-open"); }
    });
  })();



