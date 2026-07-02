/* features/modals/modals.js — job-detail + signup modals, overlay + focus trap */
  /* ---------------- job modal ---------------- */
  var jobOverlay=$("#jobOverlay"), lastFocus=null;

  /* ---- shared modal-form helpers (used by the inquiry / signup / post-a-job modals) ---- */
  /* trimmed value of a text field, or "" when the field is missing or blank */
  function val(id){ var n=$(id); return n && n.value.trim() ? n.value.trim() : ""; }
  /* blank every listed field so a returning visitor never sees a previous person's input */
  function clearFields(ids){ ids.forEach(function(s){ if($(s)) $(s).value=""; }); }
  /* fire-and-forget a lead to the backend — only when SERVED (opened as a file → no API, no-op) */
  function postLead(body){ if(served()){ fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).catch(function(){}); } }
  /* one labelled detail section; renders "N/A" when `always` is set and the field is empty */
  function jdSec(labelKey,val,always){
    var has = val!=null && String(val).trim()!=="";
    if(!has && !always) return "";
    var body = has ? nl2br(val) : '<span style="color:var(--slate)">'+esc(t("jd_na"))+'</span>';
    return '<h4 class="m-sub">'+esc(t(labelKey))+'</h4><div class="m-body">'+body+'</div>';
  }
  var currentJob=null;   /* the job whose detail modal is open (for "Sign up to apply") */
  /* Fill the JD modal body from a job. Split out of openJob so a language toggle while the
     modal is open (repaintOpenModal) fully re-renders it — role, company, salary, tags and
     every section — instead of leaving it half-translated. */
  function fillJobModal(job){
    var c=COMPANIES[job.co];
    /* use the crisp curated mark (same as the job cards), not the low-res HRMOS favicon */
    var _av=$("#mAvatar"); var _logo=(typeof bestLogo==="function")?bestLogo(c):c.logo;
    if(_logo){ _av.innerHTML='<img src="'+ esc(_logo) +'" alt="">'; _av.style.background="#fff"; } else { _av.innerHTML=""; _av.textContent=c.mono; _av.style.background=c.color; }
    $("#mRole").textContent=softBreak(roleL(job));
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
  function openJob(idx){
    var job=JOBS[idx];
    currentJob=job;
    lastFocus=document.activeElement;
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
    /* clear every field so a returning visitor (or a second person on the same device)
       never sees the previous applicant's name / email / links / attached CV */
    clearFields(["#suName","#suEmail","#suLinkedin","#suGithub"]);
    if($("#suResume")) $("#suResume").value="";
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
    clearFields(["#coRole","#coLink","#coName","#coEmail"]);
    if($("#coSource")) $("#coSource").value="";
    if($("#coLoc")) $("#coLoc").value=""; if($("#coLocWarn")) $("#coLocWarn").style.display="none";
    if($("#coSubmit")) $("#coSubmit").disabled=false;
    openOverlay(coOverlay); $("#coClose").focus();
  }
  function submitCompanyInquiry(){
    if(isAbroad("#coLoc")){ var w=$("#coLocWarn"); if(w) w.style.display=""; if($("#coSubmit")) $("#coSubmit").disabled=true; return; }
    var role=val("#coRole"), source=val("#coSource"), link=val("#coLink"), loc=val("#coLoc");
    var parts=["Interested in "+(role||"roles")+" at "+currentCompany];   /* captured into the lead message for the recruiter */
    if(source) parts.push("heard via "+source);
    if(link) parts.push("link: "+link);
    if(loc && LOC_LABEL[loc]) parts.push("based: "+LOC_LABEL[loc]);
    var body={ kind:"job", name:val("#coName")||undefined, email:val("#coEmail")||undefined, message:parts.join(" · ") };
    postLead(body);
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
    clearFields(["#ctName","#ctEmail","#ctPhone","#ctCompany","#ctMessage"]);
    if($("#ctReason")) $("#ctReason").value = (preset==="job"||preset==="hire"||preset==="other") ? preset : "";
    ctToggleCompany();
    openOverlay(ctOverlay); $("#ctClose").focus();
  }
  function submitContact(){
    var reason=val("#ctReason"), msg=val("#ctMessage"), company=val("#ctCompany");
    var label=CT_LABEL[reason]||"General enquiry";
    var body={ kind:CT_KIND[reason]||"contact", name:val("#ctName")||undefined, email:val("#ctEmail")||undefined,
      phone:val("#ctPhone")||undefined, company:company||undefined, message:"["+label+"] "+msg };
    postLead(body);
    $("#ctForm").style.display="none"; var s=$("#ctSuccess"); if(s) s.style.display="block";
  }
  if($("#ctForm")) $("#ctForm").addEventListener("submit", function(e){ e.preventDefault(); submitContact(); });
  document.addEventListener("click", function(e){ var c=e.target.closest("[data-contact]"); if(c){ e.preventDefault(); openContact(c.getAttribute("data-contact")||undefined); } });

  /* ---------------- post-a-job (company) modal ----------------
     Companies that want to hire / partner with us submit here — a SEPARATE group from
     candidates. Captured as kind:"hire" leads with phone, company and website. */
  var pjOverlay=$("#pjOverlay");
  function openPostJob(){
    if(!pjOverlay) return;
    lastFocus=document.activeElement;
    $("#pjForm").style.display=""; $("#pjSuccess").style.display="none";
    clearFields(["#pjCompany","#pjName","#pjRole","#pjEmail","#pjPhone","#pjSite","#pjLooking","#pjNotes"]);
    openOverlay(pjOverlay); $("#pjClose").focus();
  }
  function submitPostJob(){
    var looking=val("#pjLooking"), role=val("#pjRole"), site=val("#pjSite"), notes=val("#pjNotes");
    var parts=["Hiring for: "+(looking||"(not specified)")];
    if(role) parts.push("Contact role: "+role);
    if(site) parts.push("Website: "+site);
    if(notes) parts.push("Notes: "+notes);
    var body={ kind:"hire", name:val("#pjName")||undefined, email:val("#pjEmail")||undefined,
      phone:val("#pjPhone")||undefined, company:val("#pjCompany")||undefined, message:parts.join("\n") };
    postLead(body);
    $("#pjForm").style.display="none"; var s=$("#pjSuccess"); if(s) s.style.display="block";
  }
  if($("#pjForm")) $("#pjForm").addEventListener("submit", function(e){ e.preventDefault(); submitPostJob(); });
  document.addEventListener("click", function(e){ var p=e.target.closest("[data-postjob]"); if(p){ e.preventDefault(); openPostJob(); } });

  /* ---------------- article reading modal ----------------
     Articles cards carry data-article="<index>"; clicking one opens an in-app reading view
     (no real blog yet). Split fill/open so a language toggle re-renders it (repaintOpenModal). */
  var artOverlay=$("#artOverlay");
  var currentArticle=null;
  function fillArticle(i){
    var a=ARTICLES[i]; if(!a) return;
    if($("#artCat")) $("#artCat").textContent = a.cat[lang];
    if($("#artTitle")) $("#artTitle").textContent = a.title[lang];
    var dek=$("#artDek"); if(dek){ var d=a.dek?a.dek[lang]:""; dek.textContent=d; dek.style.display=d?"":"none"; }
    var body=$("#artBody"); if(body){ body.innerHTML=((a.body&&a.body[lang])||[]).map(function(p){ return "<p>"+esc(p)+"</p>"; }).join(""); }
  }
  function openArticle(i){
    if(!artOverlay || !ARTICLES[i]) return;
    currentArticle=i; lastFocus=document.activeElement;
    fillArticle(i);
    openOverlay(artOverlay); $("#artClose").focus();
  }
  document.addEventListener("click", function(e){ var c=e.target.closest("[data-article]"); if(c){ e.preventDefault(); openArticle(+c.getAttribute("data-article")); } });

  /* the job detail modal's "Sign up to apply" → apply to just that role */
  var _mApply=$("#mApply");
  if(_mApply) _mApply.addEventListener("click", function(){ if(_mApply.disabled) return; openSignup("job", currentJob ? [currentJob] : []); });

  /* ---------------- overlay helpers ---------------- */
  function openOverlay(o){ o.classList.add("open"); document.body.style.overflow="hidden"; }
  function closeOverlay(o){
    o.classList.remove("open");
    /* only unlock body scroll once NO overlay is open — the signup can stack on the job modal */
    var anyOpen=[jobOverlay,suOverlay,coOverlay,ctOverlay,pjOverlay,artOverlay].some(function(ov){ return ov && ov.classList.contains("open"); });
    if(!anyOpen) document.body.style.overflow="";
    if(lastFocus) lastFocus.focus();
  }
  /* wire a modal's close-button + backdrop click to closeOverlay (guarded → no-op if absent) */
  function wireOverlay(overlay, closeBtnId){
    if(!overlay) return;
    var btn=$(closeBtnId); if(btn) btn.addEventListener("click", function(){ closeOverlay(overlay); });
    overlay.addEventListener("click", function(e){ if(e.target===overlay) closeOverlay(overlay); });
  }
  [[jobOverlay,"#jobModalClose"],[suOverlay,"#suClose"],[coOverlay,"#coClose"],
   [ctOverlay,"#ctClose"],[pjOverlay,"#pjClose"],[artOverlay,"#artClose"]].forEach(function(p){ wireOverlay(p[0], p[1]); });
  function focusables(container){
    var list=container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
    return Array.prototype.filter.call(list, function(n){ return n.offsetWidth>0 || n.offsetHeight>0 || n===document.activeElement; });
  }
  document.addEventListener("keydown", function(e){
    /* signup can stack on top of the job modal — handle the topmost one first */
    var openOv = (artOverlay && artOverlay.classList.contains("open")) ? artOverlay
      : (pjOverlay && pjOverlay.classList.contains("open")) ? pjOverlay
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
    var resume=$("#suResume");
    return {
      kind: "job",
      name: val("#suName")||undefined, email: val("#suEmail")||undefined,
      linkedin: val("#suLinkedin")||undefined, github: val("#suGithub")||undefined,
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
    if(pendingApplyJobIds.length){
      /* applying to specific roles → /api/applications; read the response so we can honour
         the backend's authoritative remaining count (served only — a file has no API) */
      if(served()){
        var body=collectSignup(); body.job_ids=pendingApplyJobIds;
        fetch("/api/applications", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) })
          .then(function(r){ return r.ok ? r.json() : null; })
          .then(function(d){ if(d && typeof syncAppliesFromServer==="function") syncAppliesFromServer(d.remaining); })
          .catch(function(){});
      }
    } else {
      postLead(collectSignup());   /* plain signup → a lead */
    }
    var succ=$("#suSuccess");
    if(succ) succ.textContent = n ? t("apply_success").replace("{n}",n) : t("su_success");
    $("#suForm").style.display="none"; if(succ) succ.style.display="block";
    /* record the applied roles against the lifetime cap (also re-renders the grid) */
    if(n && typeof markAppliedJobs==="function") markAppliedJobs(appliedJobs);
    /* if this apply came from a JD modal (still open behind the signup), flip its Apply
       button to "Applied" so it isn't a stale, re-openable CTA once the signup closes */
    repaintOpenModal();
  }
  $("#suForm").addEventListener("submit", function(e){ e.preventDefault(); submitSignup(); });



