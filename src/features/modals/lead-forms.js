/* features/modals/lead-forms.js — the four lead-capture modals: candidate signup,
   company inquiry, contact / enquiry, and post-a-job. They share the form helpers +
   Japan-residence gate from overlay-core.js and all POST through postLead/leadDone. */

  /* ---------------- signup modal (candidates only) ----------------
     Everyone who signs up here is a job-seeker / candidate (kind:"job"). Companies that
     want to hire use the separate "Post a job" form (openPostJob below), so candidates
     and companies stay two clean groups in the CRM. */
  var suOverlay=$("#suOverlay");
  bindLocWarn("#suLoc","#suLocWarn","#suSubmit");
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
    clearFields(["#suName","#suEmail","#suEng","#suComments","#suLinkedin","#suGithub"]);
    if($("#suResume")) $("#suResume").value="";
    if($("#suLoc")) $("#suLoc").value=""; if($("#suLocWarn")) $("#suLocWarn").style.display="none";
    if($("#suSubmit")) $("#suSubmit").disabled=false;
    if($("#suJp")) $("#suJp").value=""; if($("#suYears")) $("#suYears").value="";
    var titleEl=$("#suTitle");
    if(titleEl) titleEl.textContent = pendingApplyJobs.length ? t("apply_title").replace("{n}",pendingApplyJobs.length) : t("su_title");
    openOverlay(suOverlay); $("#suClose").focus();
  }
  document.addEventListener("click", function(e){
    var trig=e.target.closest("[data-signup]");
    if(trig){ e.preventDefault(); openSignup(trig.getAttribute("data-signup")); }
  });
  function collectSignup(){
    var resume=$("#suResume");
    /* fold the free-text answers (engineer type, residence, comments) into the lead message,
       same as the company/contact forms — one human-readable line for the recruiter. */
    var eng=val("#suEng"), comments=val("#suComments");
    var loc=($("#suLoc") && LOC_LABEL[$("#suLoc").value]) ? LOC_LABEL[$("#suLoc").value] : "";
    var parts=[];
    if(eng) parts.push("Engineer type: "+eng);
    if(loc) parts.push("Based: "+loc);
    if(comments) parts.push("Comments: "+comments);
    return {
      kind: "job",
      name: val("#suName")||undefined, email: val("#suEmail")||undefined,
      linkedin: val("#suLinkedin")||undefined, github: val("#suGithub")||undefined,
      jp_level: ($("#suJp") && $("#suJp").value) ? $("#suJp").value : undefined,
      years_exp: ($("#suYears") && $("#suYears").value!=="") ? $("#suYears").value : undefined,
      message: parts.length ? parts.join(" · ") : undefined,
      resume_filename: (resume && resume.files && resume.files[0]) ? resume.files[0].name : undefined,
      source_channel: "signup"
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
      if(apiReady){
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
    /* honest confirmation: only claim it went through if a backend actually received it */
    if(succ){ succ.textContent = !apiReady ? t("lead_offline") : (n ? t("apply_success").replace("{n}",n) : t("su_success")); succ.style.display="block"; }
    $("#suForm").style.display="none";
    /* record the applied roles against the lifetime cap (also re-renders the grid) — only
       when a backend actually recorded them, so we don't show a fake "Applied" state */
    if(apiReady && n && typeof markAppliedJobs==="function") markAppliedJobs(appliedJobs);
    /* if this apply came from a JD modal (still open behind the signup), flip its Apply
       button to "Applied" so it isn't a stale, re-openable CTA once the signup closes */
    repaintOpenModal();
  }
  $("#suForm").addEventListener("submit", function(e){ e.preventDefault(); submitSignup(); });

  /* ---------------- company modal (companies page) ----------------
     Clicking a company card shows what they do + an inquiry form capturing the role
     the candidate wants, where they came across it, and an optional link. */
  var coOverlay=$("#coOverlay");
  bindLocWarn("#coLoc","#coLocWarn","#coSubmit");
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
    var body={ kind:"job", name:val("#coName")||undefined, email:val("#coEmail")||undefined, message:parts.join(" · "),
      source_channel:"company", heard_via: source||undefined };
    postLead(body);
    leadDone($("#coSuccess"), t("co_success").replace("{co}",currentCompany));
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
      phone:val("#ctPhone")||undefined, company:company||undefined, message:"["+label+"] "+msg, source_channel:"contact" };
    postLead(body);
    $("#ctForm").style.display="none"; leadDone($("#ctSuccess"));
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
      phone:val("#pjPhone")||undefined, company:val("#pjCompany")||undefined, message:parts.join("\n"), source_channel:"post_job" };
    postLead(body);
    $("#pjForm").style.display="none"; leadDone($("#pjSuccess"));
  }
  if($("#pjForm")) $("#pjForm").addEventListener("submit", function(e){ e.preventDefault(); submitPostJob(); });
  document.addEventListener("click", function(e){ var p=e.target.closest("[data-postjob]"); if(p){ e.preventDefault(); openPostJob(); } });
