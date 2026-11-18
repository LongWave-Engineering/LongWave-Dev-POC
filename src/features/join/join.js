/* features/join/join.js — the Get matched page wizard (3 steps) + lead submit.
   Runs inside the shared IIFE, so it reuses $, t, apiReady, and the honest lead hooks
   postLead()/leadConfirm() from overlay-core.js. No new network surface: the final
   submit and the job-alerts box both POST a lead through postLead (captured server-side,
   honest "preview can't submit" message when no /api is present). */

  (function(){
    var form=$("#joinForm"); if(!form) return;
    var steps=[].slice.call(form.querySelectorAll(".join-step"));
    var prog=[].slice.call(form.querySelectorAll(".join-progress li"));
    var prev=$("#joinPrev"), next=$("#joinNext"), submit=$("#joinSubmit"), errEl=$("#joinError");
    var cur=0;

    function showStep(n){
      cur=Math.max(0, Math.min(steps.length-1, n));
      steps.forEach(function(s,i){ s.hidden = i!==cur; });
      prog.forEach(function(li,i){ li.classList.toggle("active", i<=cur); });
      if(prev) prev.hidden = cur===0;
      var last = cur===steps.length-1;
      if(next) next.hidden = last;
      if(submit) submit.hidden = !last;
      if(errEl){ errEl.hidden=true; errEl.textContent=""; }
    }
    function fail(msg){ if(errEl){ errEl.textContent=msg; errEl.hidden=false; } return false; }

    /* email is validated on step 0 (it sits above the steps and gates everything) */
    function validate(n){
      if(n===0){
        var em=$("#joinEmail");
        if(!em || !em.value || !/.+@.+\..+/.test(em.value)) return fail(t("join_err_email"));
        var li=$("#joinLinkedin"), rf=$("#joinResume");
        var f=rf && rf.files && rf.files[0];
        /* a present-but-unreadable file must NOT count as a satisfied profile: readJoinResume
           only encodes pdf/doc/docx, so an .rtf/.txt/oversized pick would otherwise submit a
           profile-less lead silently (the exact drop lead-forms.js guards against). */
        if(f){ var prob=joinResumeProblem(f); if(prob) return fail(prob); }
        var hasLi=li && li.value.trim();
        if(!hasLi && !f) return fail(t("join_err_profile"));
        return true;
      }
      if(n===1){
        if(!form.querySelector('input[name="japanese"]:checked')) return fail(t("join_err_jp"));
        if(!$("#joinLive") || !$("#joinLive").value) return fail(t("join_err_live"));
        if(!$("#joinResidence") || !$("#joinResidence").value) return fail(t("join_err_res"));
        return true;
      }
      return true;
    }

    if(next) next.addEventListener("click", function(){ if(validate(cur)) showStep(cur+1); });
    if(prev) prev.addEventListener("click", function(){ showStep(cur-1); });

    /* ---- résumé -> base64 (self-contained; no load-order coupling) ---- */
    var R_TYPES={ pdf:"application/pdf", doc:"application/msword", docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
    var R_MAX=5*1024*1024;   /* mirror lead-forms.js's 5 MB cap */
    function joinResumeProblem(f){
      if(!f) return "";
      var ext=((/\.([a-z0-9]+)$/i.exec(f.name||"")||[])[1]||"").toLowerCase();
      if(!R_TYPES[ext]) return t("su_resume_type");
      if(f.size>R_MAX) return t("su_resume_big");
      return "";
    }
    /* surface the problem the moment a file is chosen, not only on Continue */
    var _ri=$("#joinResume"); if(_ri) _ri.addEventListener("change", function(){
      var f=_ri.files && _ri.files[0], prob=joinResumeProblem(f);
      if(errEl){ if(prob){ errEl.textContent=prob; errEl.hidden=false; } else { errEl.hidden=true; errEl.textContent=""; } }
    });
    function readJoinResume(){
      var inp=$("#joinResume"), f=inp && inp.files && inp.files[0];
      var ext=f ? ((/\.([a-z0-9]+)$/i.exec(f.name||"")||[])[1]||"").toLowerCase() : "";
      if(!f || !R_TYPES[ext]) return Promise.resolve(null);
      return new Promise(function(resolve){
        var fr=new FileReader();
        fr.onload=function(){ var s=String(fr.result), i=s.indexOf(","); resolve(i<0?null:{ content_type:R_TYPES[ext], data_base64:s.slice(i+1) }); };
        fr.onerror=function(){ resolve(null); };
        fr.readAsDataURL(f);
      });
    }

    function v(id){ var n=$(id); return (n && n.value!=="") ? n.value : undefined; }
    function jpLabel(){ var c=form.querySelector('input[name="japanese"]:checked'); return c?({0:"None",3:"N3",4:"N2",5:"N1"}[c.value]||c.value):undefined; }
    function selText(id){ var n=$(id); return (n && n.selectedIndex>=0 && n.value!=="") ? (n.options[n.selectedIndex].textContent||"").trim() : undefined; }

    function collect(resumeFile){
      /* fold the structured answers into one human-readable recruiter line, same shape as
         the modal signup's lead (collectSignup): kind + email + linkedin + jp_level + message */
      var parts=[];
      var live=selText("#joinLive"); if(live) parts.push("Based: "+live);
      var res=selText("#joinResidence"); if(res) parts.push("Status: "+res);
      var desired=v("#joinDesired"); if(desired) parts.push("Target: ¥"+Number(desired).toLocaleString("en-US"));
      var role=selText("#joinRole"); if(role) parts.push("Role: "+role);
      var start=selText("#joinStart"); if(start) parts.push("Start: "+start);
      return {
        kind:"job",
        email:v("#joinEmail"),
        linkedin:v("#joinLinkedin"),
        jp_level:jpLabel(),
        message:parts.length?parts.join(" · "):undefined,
        resume_file:resumeFile||undefined,
        source_channel:"join"
      };
    }

    function finish(statusEl){
      if(!statusEl) return;
      var m=statusEl.querySelector(".msg")||statusEl;
      m.textContent = apiReady ? t("su_success") : t("lead_offline");
      statusEl.hidden=false; statusEl.setAttribute("tabindex","-1"); statusEl.focus();
    }

    form.addEventListener("submit", function(e){
      e.preventDefault();
      if(!validate(0) || !validate(1)) return;   /* guard against a direct submit */
      if(submit) submit.disabled=true;
      readJoinResume().then(function(rf){
        var succ=$("#joinSuccess");
        leadConfirm(postLead(collect(rf)), succ);   /* honest: downgrades if delivery fails */
        finish(succ);
        form.querySelectorAll(".join-step, .join-actions, .join-progress").forEach(function(n){ n.hidden=true; });
      });
    });

    /* ---- the job-alerts mini form (aside) ---- */
    var af=$("#joinAlertsForm");
    if(af) af.addEventListener("submit", function(e){
      e.preventDefault();
      var em=$("#joinAlertsEmail"); if(!em || !/.+@.+\..+/.test(em.value)) return;
      var st=$("#joinAlertsStatus");
      leadConfirm(postLead({ kind:"alerts", email:em.value, source_channel:"join_alerts" }), st);
      if(st){ var m=st.querySelector(".msg")||st; m.textContent = apiReady ? t("join_alerts_ok") : t("lead_offline"); st.hidden=false; }
      af.querySelector("label").hidden=true; af.querySelector("button").hidden=true;
    });

    showStep(0);
  })();
