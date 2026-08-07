/* features/modals/modal-job.js — the job-detail (JD) modal: fill, open, and the
   Save/Apply button state that must survive language toggles (repaintOpenModal). */
  var jobOverlay=$("#jobOverlay");
  var currentJob=null;   /* the job whose detail modal is open (for "Sign up to apply") */

  /* JD body HTML from LW.jdBlocks(text): real headings/lists/paragraphs instead of a
     nl2br() wall. Every piece of text is esc()'d here — jdBlocks returns plain strings. */
  /* markdown bold (**label**) → <strong>. Runs on ALREADY-ESCAPED text, and excludes
     '<' so it can never span the <br> nl2br injects — the only HTML it adds is <strong>.
     This is the RENDERER half of JD formatting; block structure (## headings, lists,
     [links]) is parsed upstream by LW.jdBlocks/formatJdText in shared/logic.js. */
  function mdBold(s){ return s.replace(/\*\*([^*<]+?)\*\*/g,"<strong>$1</strong>"); }
  function jdHtml(text){
    return LW.jdBlocks(text).map(function(b){
      if(b.t==="h") return '<h5 class="jd-h">'+mdBold(esc(b.x))+'</h5>';
      if(b.t==="ul") return '<ul class="jd-ul">'+b.items.map(function(it){ return '<li>'+mdBold(esc(it))+'</li>'; }).join("")+'</ul>';
      return '<p>'+mdBold(nl2br(b.x))+'</p>';   /* nl2br esc()'s, then \n → <br> within the group */
    }).join("");
  }
  /* True while this job's JD is being fetched (see hydrateJob): the sections must NOT
     claim "Not listed" for prose that is merely still in flight — that flash reads as
     "this job has no description" for the ~0.2s before it lands. */
  var jdPending = false;
  /* one labelled detail section; renders "N/A" when `always` is set and the field is empty */
  function jdSec(labelKey,val,always){
    var has = val!=null && String(val).trim()!=="";
    if(!has && !always) return "";
    var body = has ? jdHtml(val)
      : '<span style="color:var(--slate)">'+esc(t(jdPending ? "jd_loading" : "jd_na"))+'</span>';
    return '<h4 class="m-sub">'+esc(t(labelKey))+'</h4><div class="m-body">'+body+'</div>';
  }
  /* Fill the JD modal body from a job. Split out of openJob so a language toggle while the
     modal is open (repaintOpenModal) fully re-renders it — role, company, salary, tags and
     every section — instead of leaving it half-translated. */
  function fillJobModal(job){
    jdPending = !!job._jdLoading;
    var c=COMPANIES[job.co];
    /* use the crisp curated mark (same as the job cards), not the low-res HRMOS favicon */
    var _av=$("#mAvatar"); var _logo=(typeof bestLogo==="function")?bestLogo(c):c.logo;
    if(_logo){ _av.innerHTML='<img src="'+ esc(_logo) +'" alt="">'; _av.style.background="#fff"; } else { _av.innerHTML=""; _av.textContent=c.mono; _av.style.background=c.color; }
    $("#mRole").textContent=softBreak(roleL(job));
    /* the posting's own title, when the headline above is a canonical label */
    var _rd=$("#mRoleDetail"); if(_rd){ _rd.textContent=roleDetailL(job); _rd.hidden=!roleDetailL(job); }
    $("#mCo").textContent=c.name+" · "+c.sector[lang]+(job.loc?" · "+locL(job):"");
    $("#mSalary").innerHTML='<span>'+ esc(t("lbl_salary")) +'</span>'+ esc(salaryMax(job, t("salary_neg"), t("salary_doe")));
    var tags=jpTag(job.jp)+'<span class="tag tag--meta">'+esc(remoteLabel(job.remote))+'</span>';
    if(job.flexHours) tags+='<span class="tag tag--meta">'+esc(t("jd_flex"))+'</span>';
    if(job.fixedOvertime) tags+='<span class="tag tag--meta">'+esc(t("jd_ot"))+'</span>';
    if(job.stock) tags+='<span class="tag tag--meta">'+esc(t("jd_stock"))+'</span>';
    if(job.abroad) tags+='<span class="tag tag--meta">'+esc(t("lbl_abroad"))+'</span>';
    if(job.visa) tags+='<span class="tag tag--meta">'+esc(t("lbl_visa"))+'</span>';
    (job.stack||[]).forEach(function(s){ tags+='<span class="tag tag--tech">'+esc(s)+'</span>'; });
    $("#mTags").innerHTML=tags;
    /* every detail field is language-aware (jf): English base / Japanese `_ja` override */
    var scopeTxt = jf(job,"scope") || bodyL(job) || "";
    var pts = pointsL(job);
    var reqText = jf(job,"required") || (pts && pts.length ? "・"+pts.join("\n・") : "");
    var H="";
    H+=jdSec("jd_bg", jf(job,"bg"), false);
    H+=jdSec("jd_scope", scopeTxt, true);
    H+=jdSec("jd_required", reqText, true);
    H+=jdSec("jd_nice", jf(job,"nice"), false);
    H+=jdSec("jd_ideal", jf(job,"ideal"), false);
    if(job.stack && job.stack.length){ H+='<h4 class="m-sub">'+esc(t("jd_stack"))+'</h4><div class="m-tags tags">'+job.stack.map(function(s){return '<span class="tag tag--tech">'+esc(s)+'</span>';}).join("")+'</div>'; }
    H+=jdSec("jd_team", jf(job,"team"), false);
    H+=jdSec("jd_lang", jf(job,"lang"), true);
    H+=jdSec("jd_office", locL(job), true);
    H+=jdSec("jd_workstyle", jf(job,"workStyle"), false);
    H+=jdSec("jd_hours", jf(job,"hours"), false);
    H+=jdSec("jd_comp", jf(job,"comp"), false);
    H+=jdSec("jd_bonus", jf(job,"bonus"), false);
    H+=jdSec("jd_benefits", jf(job,"benefits"), false);
    H+=jdSec("jd_holiday", jf(job,"holiday"), false);
    H+=jdSec("jd_probation", jf(job,"probation"), false);
    H+=jdSec("jd_selection", jf(job,"selection"), false);
    H+=jdSec("jd_notes", jf(job,"notes"), false);
    $("#mDetail").innerHTML=H;
    /* only link out to http(s) — never assign a javascript:/data: URL to href, even from
       admin/live company data (defence-in-depth against a poisoned COMPANIES.site). */
    var comp=$("#mCompany"); var site=(c.site && /^https?:\/\//i.test(c.site)) ? c.site : ""; if(site){ comp.href=site; comp.style.display=""; } else { comp.style.display="none"; }
    paintModalSave(); paintModalApply();
  }
  /* The list payload ships CARD fields only — the JD prose (scope/body/required/
     nice/benefits) is 98% of its weight and only this modal renders it, so the
     server strips it and we fetch the one job on open. Everything degrades
     gracefully: a job that already carries prose (the embedded demo snapshot,
     file:// builds, anything pre-hydrated) renders instantly and never fetches;
     a failed fetch leaves the sections empty rather than blocking the modal. */
  function hasProse(j){ return !!(j.scope || j.body || j.required || j.nice || j.benefits); }
  function hydrateJob(job){
    if(job._jd || hasProse(job) || job._jdLoading || !served() || job.id==null) return;
    job._jdLoading = true;
    fetch("/api/jobs/"+encodeURIComponent(job.id))
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(full){
        if(full && typeof full==="object"){
          /* merge the prose in place so reopening is instant and a language
             switch (repaintOpenModal) finds it already there */
          for(var k in full){ if(!(k in job) || job[k]==null) job[k]=full[k]; }
          job._jd = true; /* even if the row's prose is empty — do not refetch on reopen */
          if(currentJob===job && jobOverlay && !jobOverlay.hidden) fillJobModal(job);
        }
      })
      .catch(function(){ /* offline or 404 — the modal still shows the header */ })
      .then(function(){ job._jdLoading = false; });
  }
  function openJob(idx){
    var job=JOBS[idx];
    currentJob=job;
    hydrateJob(job);
    fillJobModal(job);
    openOverlay(jobOverlay); $("#jobModalClose").focus();
  }
  /* the JD modal's Save button mirrors the per-card save heart (same store, see jobs.js) */
  function paintModalSave(){
    var b=$("#mSave"), lab=$("#mSaveLabel"); if(!b) return;
    var on = currentJob && typeof isSaved==="function" && isSaved(currentJob);
    b.classList.toggle("is-saved", !!on);
    b.setAttribute("aria-pressed", on?"true":"false");
    if(lab) lab.textContent = on ? t("sv_saved") : t("sv_save");
  }
  /* the JD modal's Apply button reflects the hard cap: disabled + "Applied" once you've
     applied to this role, disabled + "limit reached" once you've used all your applications. */
  function paintModalApply(){
    var b=$("#mApply"); if(!b) return;
    var applied = currentJob && typeof isApplied==="function" && isApplied(currentJob);
    var limit = typeof atApplyLimit==="function" && atApplyLimit();
    if(applied){ b.disabled=true; b.textContent=t("m_applied"); }
    else if(limit){ b.disabled=true; b.textContent=t("m_apply_limit").replace("{n}",MAX_APPLY); }
    else { b.disabled=false; b.textContent=t("m_apply"); }
  }
  /* re-render the open JD modal from currentJob. Called by applyLang() after a language
     toggle (the body + button labels must follow the new language) and after an apply
     (so the underlying modal's Apply button flips to "Applied" once the signup closes). */
  function repaintOpenModal(){
    if(currentJob && jobOverlay && jobOverlay.classList.contains("open")) fillJobModal(currentJob);
    if(currentArticle!=null && typeof fillArticle==="function" && artOverlay && artOverlay.classList.contains("open")) fillArticle(currentArticle);
  }
  /* View-only JD: block copy/cut/drag and the context menu inside the JD sections
     (selection is already off via CSS user-select). Deterrent only — determined users
     can always read the page source; this stops casual copy-paste. */
  if(jobOverlay) ["copy","cut","dragstart","contextmenu"].forEach(function(ev){
    jobOverlay.addEventListener(ev, function(e){
      if(e.target && e.target.closest && e.target.closest(".m-body")) e.preventDefault();
    });
  });

  if($("#mSave")) $("#mSave").addEventListener("click", function(){ if(currentJob && typeof toggleSaved==="function"){ toggleSaved(currentJob); paintModalSave(); } });

  /* the job detail modal's "Sign up to apply" → apply to just that role */
  var _mApply=$("#mApply");
  if(_mApply) _mApply.addEventListener("click", function(){ if(_mApply.disabled) return; openSignup("job", currentJob ? [currentJob] : []); });
