/* [build] 50-modals.js  (job detail modal, signup modal, overlay + focus trap) - concatenated in load order by build.ps1; all parts share one IIFE scope */
  /* ---------------- job modal ---------------- */
  var jobOverlay=$("#jobOverlay"), lastFocus=null;
  /* one labelled detail section; renders "N/A" when `always` is set and the field is empty */
  function jdSec(labelKey,val,always){
    var has = val!=null && String(val).trim()!=="";
    if(!has && !always) return "";
    var body = has ? nl2br(val) : '<span style="color:var(--slate)">'+esc(t("jd_na"))+'</span>';
    return '<h4 class="m-sub">'+esc(t(labelKey))+'</h4><div class="m-body">'+body+'</div>';
  }
  function openJob(idx){
    var job=JOBS[idx], c=COMPANIES[job.co];
    lastFocus=document.activeElement;
    var _av=$("#mAvatar"); if(c.logo){ _av.innerHTML='<img src="'+c.logo+'" alt="">'; _av.style.background="#fff"; } else { _av.innerHTML=""; _av.textContent=c.mono; _av.style.background=c.color; }
    $("#mRole").textContent=roleL(job);
    $("#mCo").textContent=c.name+" · "+c.sector[lang]+(job.loc?" · "+locL(job):"");
    $("#mSalary").innerHTML='<span>'+ esc(t("lbl_salary")) +'</span>'+ esc(salaryMax(job));
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
    openOverlay(jobOverlay); $("#jobModalClose").focus();
  }

  /* ---------------- signup modal ---------------- */
  var suOverlay=$("#suOverlay");
  function suToggleWant(){
    var job=$("#suWant").value!=="hire";
    $("#jobSeekerFields").style.display=job?"":"none";
    $("#hireFields").style.display=job?"none":"";
    var r=$("#suResume"); if(r) r.required=job;
  }
  $("#suWant").addEventListener("change", suToggleWant);
  function openSignup(preset){
    lastFocus=document.activeElement;
    $("#suSuccess").style.display="none"; $("#suForm").style.display="";
    if(preset==="hire") $("#suWant").value="hire"; else if(preset==="job") $("#suWant").value="job";
    suToggleWant();
    openOverlay(suOverlay); $("#suClose").focus();
  }

  /* ---------------- overlay helpers ---------------- */
  function openOverlay(o){ o.classList.add("open"); document.body.style.overflow="hidden"; }
  function closeOverlay(o){ o.classList.remove("open"); document.body.style.overflow=""; if(lastFocus) lastFocus.focus(); }
  $("#jobModalClose").addEventListener("click", function(){ closeOverlay(jobOverlay); });
  jobOverlay.addEventListener("click", function(e){ if(e.target===jobOverlay) closeOverlay(jobOverlay); });
  $("#suClose").addEventListener("click", function(){ closeOverlay(suOverlay); });
  suOverlay.addEventListener("click", function(e){ if(e.target===suOverlay) closeOverlay(suOverlay); });
  function focusables(container){
    var list=container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
    return Array.prototype.filter.call(list, function(n){ return n.offsetWidth>0 || n.offsetHeight>0 || n===document.activeElement; });
  }
  document.addEventListener("keydown", function(e){
    /* signup can stack on top of the job modal — handle the topmost one first */
    var openOv = suOverlay.classList.contains("open") ? suOverlay : (jobOverlay.classList.contains("open") ? jobOverlay : null);
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

  $("#suForm").addEventListener("submit", function(e){
    e.preventDefault(); $("#suForm").style.display="none"; $("#suSuccess").style.display="block";
  });



