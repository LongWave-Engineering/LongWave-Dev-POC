/* features/modals/modals.js — job-detail + signup modals, overlay + focus trap */
  /* ---------------- job modal ---------------- */
  var jobOverlay=$("#jobOverlay"), lastFocus=null;
  /* one labelled detail section; renders "N/A" when `always` is set and the field is empty */
  function jdSec(labelKey,val,always){
    var has = val!=null && String(val).trim()!=="";
    if(!has && !always) return "";
    var body = has ? nl2br(val) : '<span style="color:var(--slate)">'+esc(t("jd_na"))+'</span>';
    return '<h4 class="m-sub">'+esc(t(labelKey))+'</h4><div class="m-body">'+body+'</div>';
  }
  var currentJob=null;   /* the job whose detail modal is open (for "Sign up to apply") */
  function openJob(idx){
    var job=JOBS[idx], c=COMPANIES[job.co];
    currentJob=job;
    lastFocus=document.activeElement;
    var _av=$("#mAvatar"); if(c.logo){ _av.innerHTML='<img src="'+ esc(c.logo) +'" alt="">'; _av.style.background="#fff"; } else { _av.innerHTML=""; _av.textContent=c.mono; _av.style.background=c.color; }
    $("#mRole").textContent=roleL(job);
    $("#mCo").textContent=c.name+" · "+c.sector[lang]+(job.loc?" · "+locL(job):"");
    $("#mSalary").innerHTML='<span>'+ esc(t("lbl_salary")) +'</span>'+ esc(salaryMax(job, t("salary_neg")));
    var tags=jpTag(job.jp)+'<span class="tag tag--meta">'+esc(remoteLabel(job.remote))+'</span>';
    if(job.flexHours) tags+='<span class="tag tag--meta">'+esc(t("jd_flex"))+'</span>';
    if(job.fixedOvertime) tags+='<span class="tag tag--meta">'+esc(t("jd_ot"))+'</span>';
    if(job.stock) tags+='<span class="tag tag--meta">'+esc(t("jd_stock"))+'</span>';
    if(job.abroad) tags+='<span class="tag tag--meta">'+esc(t("lbl_abroad"))+'</span>';
    if(job.visa) tags+='<span class="tag tag--meta">'+esc(t("lbl_visa"))+'</span>';
    (job.stack||[]).forEach(function(s){ tags+='<span class="tag tag--tech">'+esc(s)+'</span>'; });
    $("#mTags").innerHTML=tags;
    var scopeTxt = job.scope || bodyL(job) || "";
    var pts = pointsL(job);
    var reqText = job.required || (pts && pts.length ? "・"+pts.join("\n・") : "");
    var H="";
    H+=jdSec("jd_bg", job.bg, false);
    H+=jdSec("jd_scope", scopeTxt, true);
    H+=jdSec("jd_required", reqText, true);
    H+=jdSec("jd_nice", job.nice, false);
    H+=jdSec("jd_ideal", job.ideal, false);
    if(job.stack && job.stack.length){ H+='<h4 class="m-sub">'+esc(t("jd_stack"))+'</h4><div class="m-tags tags">'+job.stack.map(function(s){return '<span class="tag tag--tech">'+esc(s)+'</span>';}).join("")+'</div>'; }
    H+=jdSec("jd_team", job.team, false);
    H+=jdSec("jd_lang", job.lang, true);
    H+=jdSec("jd_office", locL(job), true);
    H+=jdSec("jd_workstyle", job.workStyle, false);
    H+=jdSec("jd_hours", job.hours, false);
    H+=jdSec("jd_comp", job.comp, false);
    H+=jdSec("jd_bonus", job.bonus, false);
    H+=jdSec("jd_benefits", job.benefits, false);
    H+=jdSec("jd_holiday", job.holiday, false);
    H+=jdSec("jd_probation", job.probation, false);
    H+=jdSec("jd_selection", job.selection, false);
    H+=jdSec("jd_notes", job.notes, false);
    $("#mDetail").innerHTML=H;
    var comp=$("#mCompany"); if(c.site){ comp.href=c.site; comp.style.display=""; } else { comp.style.display="none"; }
    paintModalSave(); paintModalApply();
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
  if($("#mSave")) $("#mSave").addEventListener("click", function(){ if(currentJob && typeof toggleSaved==="function"){ toggleSaved(currentJob); paintModalSave(); } });

  /* ---------------- signup modal (candidates only) ----------------
     Everyone who signs up here is a job-seeker / candidate (kind:"job"). Companies that
     want to hire use the separate "Post a job" form (openPostJob below), so candidates
     and companies stay two clean groups in the CRM. */
  var suOverlay=$("#suOverlay");
  /* Visa/residence gate: base requirement is being IN JAPAN now. Applicants currently
     abroad are filtered out — the warning shows and the submit button is disabled, and
     submit handlers refuse an "abroad" value as a backstop. */
  var LOC_LABEL={ eligible:"In Japan — work-eligible", need_visa:"In Japan — needs visa support", abroad:"Outside Japan" };
  function isAbroad(selId){ var s=$(selId); return !!(s && s.value==="abroad"); }
  function bindLocWarn(selId, warnId, submitId){
    var s=$(selId), w=$(warnId), b=submitId?$(submitId):null; if(!s||!w) return;
    s.addEventListener("change", function(){
      var abroad = s.value==="abroad";
      w.style.display = abroad ? "" : "none";
      if(b) b.disabled = abroad;   /* hard gate: can't submit from outside Japan */
    });
  }
  bindLocWarn("#suLoc","#suLocWarn","#suSubmit");
  bindLocWarn("#coLoc","#coLocWarn","#coSubmit");
  var pendingApplyJobs=[];     /* the roles (objects) the signup will apply to (empty = plain signup) */
  var pendingApplyJobIds=[];   /* their DB ids, for the backend (jobs may lack one offline) */
  /* `preset` is accepted (call sites still pass "job") but ignored — the signup is always a candidate.
     `jobs` is an array of job OBJECTS (so we can mark them against the cap even without a DB id). */
  function openSignup(preset, jobs){
    lastFocus=document.activeElement;
    var arr = Array.isArray(jobs) ? jobs.filter(Boolean) : [];
    /* hard cap safety-net: never carry more than the applications left, even if a control
       slips through — the picker/modal already gate this; this is defence-in-depth. */
    if(arr.length && typeof remainingApplies==="function") arr = arr.slice(0, remainingApplies());
    pendingApplyJobs = arr;
    pendingApplyJobIds = LW.normalizeJobIds(arr.map(function(j){ return j.id; }));
    $("#suSuccess").style.display="none"; $("#suForm").style.display="";
    if($("#suLoc")) $("#suLoc").value=""; if($("#suLocWarn")) $("#suLocWarn").style.display="none";
    if($("#suSubmit")) $("#suSubmit").disabled=false;
    if($("#suJp")) $("#suJp").value=""; if($("#suYears")) $("#suYears").value="";
    var titleEl=$("#suTitle");
    if(titleEl) titleEl.textContent = pendingApplyJobs.length ? t("apply_title").replace("{n}",pendingApplyJobs.length) : t("su_title");
    openOverlay(suOverlay); $("#suClose").focus();
  }
  /* ---------------- company modal (companies page) ----------------
     Clicking a company card shows what they do + an inquiry form capturing the role
     the candidate wants, where they came across it, and an optional link. */
  var coOverlay=$("#coOverlay");
  var currentCompany=null;
  function findPartner(name){ if(typeof PARTNERS==="undefined") return null; for(var i=0;i<PARTNERS.length;i++){ if(PARTNERS[i].name===name) return PARTNERS[i]; } return null; }
  function openCompany(name){
    var p=findPartner(name); if(!p || !coOverlay) return;
    currentCompany=name; lastFocus=document.activeElement;
    var logo=(typeof PARTNER_LOGOS!=="undefined") ? PARTNER_LOGOS[name] : null;
    var av=$("#coAvatar");
    if(logo){ av.innerHTML='<img src="'+ esc(logo) +'" alt="">'; av.style.background="#fff"; }
    else { av.innerHTML=""; av.textContent=p.mono||"?"; av.style.background=p.color||"#888"; }
    $("#coTitle").textContent=name;
    $("#coIndustry").textContent=(p.industry && p.industry[lang]) || "";
    var blurb=(p.blurb && p.blurb[lang]) || "";
    var b=$("#coBlurb"); b.textContent=blurb; b.style.display=blurb?"":"none";
    $("#coForm").style.display=""; $("#coSuccess").style.display="none";
    ["#coRole","#coLink","#coName","#coEmail"].forEach(function(s){ if($(s)) $(s).value=""; });
    if($("#coSource")) $("#coSource").value="";
    if($("#coLoc")) $("#coLoc").value=""; if($("#coLocWarn")) $("#coLocWarn").style.display="none";
    if($("#coSubmit")) $("#coSubmit").disabled=false;
    openOverlay(coOverlay); $("#coClose").focus();
  }
  function submitCompanyInquiry(){
    if(isAbroad("#coLoc")){ var w=$("#coLocWarn"); if(w) w.style.display=""; if($("#coSubmit")) $("#coSubmit").disabled=true; return; }
    var val=function(id){ var n=$(id); return n && n.value.trim() ? n.value.trim() : ""; };
    var role=val("#coRole"), source=val("#coSource"), link=val("#coLink"), loc=val("#coLoc");
    var parts=["Interested in "+(role||"roles")+" at "+currentCompany];   /* captured into the lead message for the recruiter */
    if(source) parts.push("heard via "+source);
    if(link) parts.push("link: "+link);
    if(loc && LOC_LABEL[loc]) parts.push("based: "+LOC_LABEL[loc]);
    var body={ kind:"job", name:val("#coName")||undefined, email:val("#coEmail")||undefined, message:parts.join(" · ") };
    if(/^https?:$/.test(location.protocol)){ fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).catch(function(){}); }
    var s=$("#coSuccess"); if(s){ s.textContent=t("co_success").replace("{co}",currentCompany); s.style.display="block"; }
    $("#coForm").style.display="none";
  }
  if($("#coForm")) $("#coForm").addEventListener("submit", function(e){ e.preventDefault(); submitCompanyInquiry(); });
  document.addEventListener("click", function(e){
    var card=e.target.closest("[data-company]");
    if(card){ e.preventDefault(); openCompany(card.getAttribute("data-company")); }
  });
  document.addEventListener("keydown", function(e){
    if(e.key!=="Enter" && e.key!==" ") return;
    var card=e.target.closest ? e.target.closest("[data-company]") : null;
    if(card && document.activeElement===card){ e.preventDefault(); openCompany(card.getAttribute("data-company")); }
  });

  /* ---------------- contact / enquiry modal ----------------
     Routes the lead by reason so it lands in the right CRM group: looking-for-a-job →
     kind:"job", post-a-job/hire → kind:"hire", anything else → kind:"contact". */
  var ctOverlay=$("#ctOverlay");
  var CT_KIND={ job:"job", hire:"hire", other:"contact" };
  var CT_LABEL={ job:"Looking for a job", hire:"Wants to post a job / hire", other:"General enquiry" };
  function ctToggleCompany(){ var f=$("#ctCompanyField"); if(f) f.style.display = ($("#ctReason") && $("#ctReason").value==="hire") ? "" : "none"; }
  if($("#ctReason")) $("#ctReason").addEventListener("change", ctToggleCompany);
  function openContact(preset){
    if(!ctOverlay) return;
    lastFocus=document.activeElement;
    $("#ctForm").style.display=""; $("#ctSuccess").style.display="none";
    ["#ctName","#ctEmail","#ctPhone","#ctCompany","#ctMessage"].forEach(function(s){ if($(s)) $(s).value=""; });
    if($("#ctReason")) $("#ctReason").value = (preset==="job"||preset==="hire"||preset==="other") ? preset : "";
    ctToggleCompany();
    openOverlay(ctOverlay); $("#ctClose").focus();
  }
  function submitContact(){
    var val=function(id){ var n=$(id); return n && n.value.trim() ? n.value.trim() : ""; };
    var reason=val("#ctReason"), msg=val("#ctMessage"), company=val("#ctCompany");
    var label=CT_LABEL[reason]||"General enquiry";
    var body={ kind:CT_KIND[reason]||"contact", name:val("#ctName")||undefined, email:val("#ctEmail")||undefined,
      phone:val("#ctPhone")||undefined, company:company||undefined, message:"["+label+"] "+msg };
    if(/^https?:$/.test(location.protocol)){ fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).catch(function(){}); }
    $("#ctForm").style.display="none"; var s=$("#ctSuccess"); if(s) s.style.display="block";
  }
  if($("#ctForm")) $("#ctForm").addEventListener("submit", function(e){ e.preventDefault(); submitContact(); });
  if($("#ctClose")) $("#ctClose").addEventListener("click", function(){ closeOverlay(ctOverlay); });
  if(ctOverlay) ctOverlay.addEventListener("click", function(e){ if(e.target===ctOverlay) closeOverlay(ctOverlay); });
  document.addEventListener("click", function(e){ var c=e.target.closest("[data-contact]"); if(c){ e.preventDefault(); openContact(c.getAttribute("data-contact")||undefined); } });

  /* ---------------- post-a-job (company) modal ----------------
     Companies that want to hire / partner with us submit here — a SEPARATE group from
     candidates. Captured as kind:"hire" leads with phone, company and website. */
  var pjOverlay=$("#pjOverlay");
  function openPostJob(){
    if(!pjOverlay) return;
    lastFocus=document.activeElement;
    $("#pjForm").style.display=""; $("#pjSuccess").style.display="none";
    ["#pjCompany","#pjName","#pjRole","#pjEmail","#pjPhone","#pjSite","#pjLooking","#pjNotes"].forEach(function(s){ if($(s)) $(s).value=""; });
    openOverlay(pjOverlay); $("#pjClose").focus();
  }
  function submitPostJob(){
    var val=function(id){ var n=$(id); return n && n.value.trim() ? n.value.trim() : ""; };
    var looking=val("#pjLooking"), role=val("#pjRole"), site=val("#pjSite"), notes=val("#pjNotes");
    var parts=["Hiring for: "+(looking||"(not specified)")];
    if(role) parts.push("Contact role: "+role);
    if(site) parts.push("Website: "+site);
    if(notes) parts.push("Notes: "+notes);
    var body={ kind:"hire", name:val("#pjName")||undefined, email:val("#pjEmail")||undefined,
      phone:val("#pjPhone")||undefined, company:val("#pjCompany")||undefined, message:parts.join("\n") };
    if(/^https?:$/.test(location.protocol)){ fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).catch(function(){}); }
    $("#pjForm").style.display="none"; var s=$("#pjSuccess"); if(s) s.style.display="block";
  }
  if($("#pjForm")) $("#pjForm").addEventListener("submit", function(e){ e.preventDefault(); submitPostJob(); });
  if($("#pjClose")) $("#pjClose").addEventListener("click", function(){ closeOverlay(pjOverlay); });
  if(pjOverlay) pjOverlay.addEventListener("click", function(e){ if(e.target===pjOverlay) closeOverlay(pjOverlay); });
  document.addEventListener("click", function(e){ var p=e.target.closest("[data-postjob]"); if(p){ e.preventDefault(); openPostJob(); } });
  /* the job detail modal's "Sign up to apply" → apply to just that role */
  var _mApply=$("#mApply");
  if(_mApply) _mApply.addEventListener("click", function(){ if(_mApply.disabled) return; openSignup("job", currentJob ? [currentJob] : []); });

  /* ---------------- overlay helpers ---------------- */
  function openOverlay(o){ o.classList.add("open"); document.body.style.overflow="hidden"; }
  function closeOverlay(o){
    o.classList.remove("open");
    /* only unlock body scroll once NO overlay is open — the signup can stack on the job modal */
    var anyOpen=[jobOverlay,suOverlay,coOverlay,ctOverlay,pjOverlay].some(function(ov){ return ov && ov.classList.contains("open"); });
    if(!anyOpen) document.body.style.overflow="";
    if(lastFocus) lastFocus.focus();
  }
  $("#jobModalClose").addEventListener("click", function(){ closeOverlay(jobOverlay); });
  jobOverlay.addEventListener("click", function(e){ if(e.target===jobOverlay) closeOverlay(jobOverlay); });
  $("#suClose").addEventListener("click", function(){ closeOverlay(suOverlay); });
  suOverlay.addEventListener("click", function(e){ if(e.target===suOverlay) closeOverlay(suOverlay); });
  if($("#coClose")) $("#coClose").addEventListener("click", function(){ closeOverlay(coOverlay); });
  if(coOverlay) coOverlay.addEventListener("click", function(e){ if(e.target===coOverlay) closeOverlay(coOverlay); });
  function focusables(container){
    var list=container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
    return Array.prototype.filter.call(list, function(n){ return n.offsetWidth>0 || n.offsetHeight>0 || n===document.activeElement; });
  }
  document.addEventListener("keydown", function(e){
    /* signup can stack on top of the job modal — handle the topmost one first */
    var openOv = (pjOverlay && pjOverlay.classList.contains("open")) ? pjOverlay
      : (ctOverlay && ctOverlay.classList.contains("open")) ? ctOverlay
      : (coOverlay && coOverlay.classList.contains("open")) ? coOverlay
      : (suOverlay.classList.contains("open") ? suOverlay : (jobOverlay.classList.contains("open") ? jobOverlay : null));
    if(!openOv) return;
    if(e.key==="Escape"){ closeOverlay(openOv); return; }
    if(e.key==="Tab"){
      var f=focusables(openOv); if(!f.length) return;
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener("click", function(e){
    var trig=e.target.closest("[data-signup]");
    if(trig){ e.preventDefault(); openSignup(trig.getAttribute("data-signup")); }
  });

  function collectSignup(){
    var val=function(id){ var n=$(id); return n && n.value.trim() ? n.value.trim() : undefined; };
    var resume=$("#suResume");
    return {
      kind: "job",
      name: val("#suName"), email: val("#suEmail"),
      linkedin: val("#suLinkedin"), github: val("#suGithub"),
      jp_level: ($("#suJp") && $("#suJp").value) ? $("#suJp").value : undefined,
      years_exp: ($("#suYears") && $("#suYears").value!=="") ? $("#suYears").value : undefined,
      message: ($("#suLoc") && LOC_LABEL[$("#suLoc").value]) ? ("Based: "+LOC_LABEL[$("#suLoc").value]) : undefined,
      resume_filename: (resume && resume.files && resume.files[0]) ? resume.files[0].name : undefined
    };
  }
  /* Submit: when the site is SERVED, POST to /api/applications (applying to one or
     many selected jobs) or /api/leads (plain signup). Opened as a standalone file →
     no backend → just confirm. Fire-and-forget; the user always sees a success state. */
  function submitSignup(){
    if(isAbroad("#suLoc")){ var w=$("#suLocWarn"); if(w) w.style.display=""; if($("#suSubmit")) $("#suSubmit").disabled=true; return; }
    var n=pendingApplyJobs.length;
    var appliedJobs=pendingApplyJobs.slice();   /* snapshot: markAppliedJobs/clearSelection reset the live array */
    if(/^https?:$/.test(location.protocol)){
      if(pendingApplyJobIds.length){
        var body=collectSignup(); body.job_ids=pendingApplyJobIds;
        /* read the response so we can honour the backend's authoritative remaining count */
        fetch("/api/applications", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) })
          .then(function(r){ return r.ok ? r.json() : null; })
          .then(function(d){ if(d && typeof syncAppliesFromServer==="function") syncAppliesFromServer(d.remaining); })
          .catch(function(){});
      } else {
        fetch("/api/leads", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(collectSignup()) }).catch(function(){});
      }
    }
    var succ=$("#suSuccess");
    if(succ) succ.textContent = n ? t("apply_success").replace("{n}",n) : t("su_success");
    $("#suForm").style.display="none"; if(succ) succ.style.display="block";
    /* record the applied roles against the lifetime cap (also re-renders the grid) */
    if(n && typeof markAppliedJobs==="function") markAppliedJobs(appliedJobs);
  }
  $("#suForm").addEventListener("submit", function(e){ e.preventDefault(); submitSignup(); });



